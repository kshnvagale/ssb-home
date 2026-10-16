#!/usr/bin/env python3
"""Deploy this page to ssb-school-concept.vercel.app/v4 without touching the rest of that project (v3 etc.).

How it works
  1. Reads the Vercel CLI login from ~/Library/Application Support/com.vercel.cli/auth.json at run time
     (nothing is written to disk). The CLI itself fails on Node 26, so this talks to the REST API directly.
  2. Takes the source file list of the project's CURRENT production deployment and reuses every file by its
     content hash, so the Next.js app (v3 and everything else) is rebuilt byte for byte from what is live.
  3. Adds this page as static files under public/v4/ (asset paths rewritten from media/ to /v4/media/, because
     Next.js strips trailing slashes, so relative paths would resolve to the v3 /media folder) and adds one
     rewrite to next.config.ts: /v4 -> /v4/index.html.
  4. Creates a PREVIEW deployment and waits for it. Pass --prod to deploy to production instead.

    python3 build.py && python3 tools/deploy_v4.py            # preview
    python3 build.py && python3 tools/deploy_v4.py --prod     # production

Rollback: production can be pointed back at the previous deployment from the Vercel dashboard (Instant Rollback),
or with tools/deploy_v4.py --rollback <deployment-id>.
"""
import hashlib, json, os, sys, time, urllib.request, urllib.error

TEAM = 'team_UNnBAIxermZQs5l6UEr1Yy6l'
PROJECT = 'prj_8kzqcjRiRPwES6oPpWz875wjubgH'
NAME = 'ssb-school-concept'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NEXT_CONFIG = '''import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the curriculum's scroll and animation effects expect a single mount
  reactStrictMode: false,
  // v4 home page concept: a static page in public/v4 (deployed from the ssb-home folder by tools/deploy_v4.py)
  async rewrites() {
    return [{ source: "/v4", destination: "/v4/index.html" }];
  },
};

export default nextConfig;
'''


def token():
    """The CLI login. If it has expired, refresh it the way the CLI does (refresh token + the CLI's public client id,
    found in the npx-cached vercel package) and save it back."""
    import glob, re, urllib.parse
    p = os.path.expanduser('~/Library/Application Support/com.vercel.cli/auth.json')
    d = json.load(open(p))
    if d.get('expiresAt', 0) > time.time() + 60:
        return d['token']
    ids = {}
    for f in glob.glob(os.path.expanduser('~/.npm/_npx/*/node_modules/vercel/dist/**/*.js'), recursive=True):
        for m in re.findall(r'cl_[A-Za-z0-9]{20,}', open(f, errors='ignore').read()):
            ids[m] = ids.get(m, 0) + 1
    if not ids or not d.get('refreshToken'):
        sys.exit('Vercel login has expired and cannot be refreshed here: run `vercel login` (Node 20/22/24), then re-run.')
    cid = max(ids, key=ids.get)
    body = urllib.parse.urlencode({'grant_type': 'refresh_token', 'refresh_token': d['refreshToken'], 'client_id': cid}).encode()
    try:
        r = json.load(urllib.request.urlopen(urllib.request.Request('https://api.vercel.com/login/oauth/token', data=body,
                                                                      headers={'Content-Type': 'application/x-www-form-urlencoded'})))
    except urllib.error.HTTPError as e:
        sys.exit(f'Vercel login refresh failed ({e.code}): run `vercel login`, then re-run.')
    d['token'] = r['access_token']
    if r.get('refresh_token'):
        d['refreshToken'] = r['refresh_token']
    d['expiresAt'] = int(time.time()) + int(r.get('expires_in', 3600))
    json.dump(d, open(p, 'w'), indent=2)
    print('refreshed the Vercel login')
    return d['token']


TOK = token()


def api(method, path, body=None, raw=None, headers=None):
    url = 'https://api.vercel.com' + path + ('&' if '?' in path else '?') + 'teamId=' + TEAM
    h = {'Authorization': 'Bearer ' + TOK}
    data = None
    if body is not None:
        data = json.dumps(body).encode(); h['Content-Type'] = 'application/json'
    if raw is not None:
        data = raw
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        r = urllib.request.urlopen(req, timeout=300).read()
        return json.loads(r) if r else {}
    except urllib.error.HTTPError as e:
        sys.exit(f'{method} {path} failed: {e.code} {e.read().decode()[:600]}')


def live_files():
    proj = api('GET', f'/v9/projects/{PROJECT}')
    dep = proj['targets']['production']['id']
    tree = api('GET', f'/v6/deployments/{dep}/files')
    out = []

    def walk(nodes, pre=''):
        for n in nodes:
            p = f'{pre}/{n["name"]}' if pre else n['name']
            if n['type'] == 'directory':
                walk(n.get('children', []), p)
            elif p.startswith('src/'):
                out.append((p[4:], n['uid'], n.get('mode')))
    walk(tree)
    return dep, out


def upload(data):
    sha = hashlib.sha1(data).hexdigest()
    api('POST', '/v2/files', raw=data, headers={'Content-Type': 'application/octet-stream', 'x-vercel-digest': sha, 'Content-Length': str(len(data))})
    return sha


def main():
    if '--rollback' in sys.argv:
        dep = sys.argv[sys.argv.index('--rollback') + 1]
        api('POST', f'/v9/projects/{PROJECT}/promote/{dep}', body={})
        print('production now points at', dep); return
    prod = '--prod' in sys.argv
    live_dep, files = live_files()
    print(f'live deployment {live_dep}: {len(files)} source files reused by hash')
    entries = [{'file': f, 'sha': sha, **({'mode': m} if m else {})} for f, sha, m in files
               if f != 'next.config.ts' and not f.startswith('public/v4/')]

    def add(path, data):
        entries.append({'file': path, 'sha': upload(data), 'size': len(data)})

    add('next.config.ts', NEXT_CONFIG.encode())
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    n = html.count('"media/')
    html = html.replace('"media/', '"/v4/media/')
    add('public/v4/index.html', html.encode('utf-8'))
    count = 0
    for d, _, fs in os.walk(os.path.join(ROOT, 'media')):
        for f in fs:
            if f.startswith('.'):
                continue
            full = os.path.join(d, f)
            rel = os.path.relpath(full, ROOT).replace(os.sep, '/')
            add('public/v4/' + rel, open(full, 'rb').read())
            count += 1
    print(f'uploaded v4: index.html ({n} asset paths rewritten) + {count} media files')
    body = {'name': NAME, 'project': PROJECT, 'files': entries, 'projectSettings': {'framework': 'nextjs'}}
    if prod:
        body['target'] = 'production'
    dep = api('POST', '/v13/deployments?skipAutoDetectionConfirmation=1', body=body)
    print('deployment', dep['id'], dep['url'], '(production)' if prod else '(preview)')
    while True:
        time.sleep(8)
        st = api('GET', f'/v13/deployments/{dep["id"]}')
        print('  state:', st['readyState'])
        if st['readyState'] in ('READY', 'ERROR', 'CANCELED'):
            break
    json.dump({'id': dep['id'], 'url': dep['url'], 'previous_production': live_dep, 'state': st['readyState']},
              open(os.path.join(ROOT, '.vercel-last-deploy.json'), 'w'), indent=1)
    if st['readyState'] != 'READY':
        sys.exit('build failed: see the deployment in the Vercel dashboard')
    print('ready: https://' + dep['url'] + '/v4  (previous production:', live_dep + ')')


if __name__ == '__main__':
    main()
