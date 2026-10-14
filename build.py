#!/usr/bin/env python3
"""Assemble the SSB home page from src/ into index.html (one self-contained file).

    python3 build.py           # build once
    python3 build.py --watch   # rebuild whenever a file in src/ changes

Each section lives in src/sections/<name>/ as <name>.html, <name>.css and (optional) <name>.js.
Page order and section list come from SECTIONS below and the {{name}} slots in src/page.html.
"""
import os, re, sys, time

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
# page order (top to bottom). Add a new section here, in src/page.html, and as a folder in src/sections/.
# 'seams' has no slot: its markup (the transitions) sits between the slots in src/page.html.
SECTIONS = ['nav', 'hero', 'film', 'outcomes', 'programme', 'punch', 'built', 'faculty', 'campus', 'admissions', 'faq', 'footer', 'seams']
# script order: self-contained section scripts first, then page-level behaviour, global intro last
JS_ORDER = ['built', 'faculty', 'footer', 'hero', 'film', 'nav', 'programme', 'outcomes', 'punch', 'campus', 'admissions', 'faq', 'seams']

def read(path):
    return open(path, encoding='utf-8').read() if os.path.exists(path) else ''

def sec(name, ext):
    return read(os.path.join(SRC, 'sections', name, f'{name}.{ext}')).strip()

def build():
    page = read(os.path.join(SRC, 'page.html'))
    css = [read(os.path.join(SRC, 'global', 'global.css')).strip()]
    css += [f'/* ===== {n} ===== */\n' + sec(n, 'css') for n in SECTIONS if sec(n, 'css')]
    page = page.replace('{{CSS}}', '\n\n'.join(css))
    for n in SECTIONS:
        page = page.replace('{{%s}}' % n, sec(n, 'html'))
    scripts = []
    for n in JS_ORDER:
        js = sec(n, 'js')
        if js:
            scripts.append(f'<script>\n/* ===== {n} ===== */\n{js}\n</script>')
    scripts.append('<script>\n/* ===== global ===== */\n' + read(os.path.join(SRC, 'global', 'global.js')).strip() + '\n</script>')
    page = page.replace('<script>\n{{JS}}\n</script>', '\n'.join(scripts))
    left = re.findall(r'\{\{\w+\}\}', page)
    if left:
        sys.exit('Unfilled slots in page.html: %s' % left)
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page)
    print('built index.html (%d KB)' % (len(page) // 1024))

def snapshot():
    out = {}
    for d, _, files in os.walk(SRC):
        for f in files:
            p = os.path.join(d, f); out[p] = os.path.getmtime(p)
    return out

if __name__ == '__main__':
    build()
    if '--watch' in sys.argv:
        last = snapshot()
        print('watching src/ ... (Ctrl+C to stop)')
        while True:
            time.sleep(0.6)
            now = snapshot()
            if now != last:
                last = now
                try: build()
                except SystemExit as e: print(e)
