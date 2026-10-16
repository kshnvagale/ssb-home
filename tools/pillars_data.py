#!/usr/bin/env python3
"""Pillars ("How you learn") data. Generates src/sections/pillars/pillars.html.

    python3 tools/pillars_data.py && python3 build.py

Each pillar is one stacked panel: a photo behind a white card. The card holds the claim,
the numbers and a sideways rail (reels or project tiles). Logos float around the card.
Its detail sheet (85% of the screen) is the <template> rendered from `detail`.

Floaters: (kind, value, label, desktop x%, desktop y%, mobile x%, mobile band, depth)
  kind  'ic'   = brand icon tile, value = path under media/brands/
        'chip' = text chip, value = short text
  band  't' = top band on mobile, 'b' = bottom band, None = desktop only
  depth 0.2 to 1.0: how fast it drifts against the scroll (bigger = closer)
Copy rules: no em dashes, no emojis, sentence case.
Reels are placeholders: the poster is a real photo; every reel plays the same dummy clip (REEL_SRC).
"""
import html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'sections', 'pillars', 'pillars.html')
REEL_SRC = 'https://ssb-school-concept.vercel.app/media/campus-film.mp4'

def B(slug, ext='jpg'):
    return f'media/brands/{slug}/icon-dark.{ext}'

PILLARS = [
  dict(
    key='ai', name='AI fluency', bg='media/pillars/term4-lab-robotics.webp', fx='50% 40%',
    claim='Ship an AI product every term. No coding background needed.',
    nums=[('150 hrs', 'hands-on AI'), ('25+', 'AI tools'), ('5', 'AI products shipped')],
    rail_k='Term by term',
    rail=[
      ('reel', 'media/pillars/term1-lab.webp', '50% 50%', 'Vibe-coding hackathon', 'Term 1'),
      ('reel', 'media/pillars/term2-lab-voice.webp', '42% 50%', 'AI voice agent', 'Term 2'),
      ('reel', 'media/pillars/term3-students.webp', '50% 50%', 'Automate a business process', 'Term 3'),
      ('reel', 'media/pillars/term4-lab-robotics.webp', '45% 50%', '48-hour AI hackathon', 'Term 4'),
      ('reel', 'media/pillars/term5-students.webp', '50% 50%', 'Capstone with real users', 'Term 5'),
    ],
    floaters=[
      ('ic', B('openai'), 'OpenAI', 9, 16, 6, 't', .8),
      ('ic', B('anthropic'), 'Claude', 22, 30, 30, 't', .45),
      ('ic', B('gemini', 'png'), 'Gemini', 12, 52, 56, 't', .7),
      ('ic', B('lovable'), 'Lovable', 25, 70, 80, 't', .35),
      ('ic', B('elevenlabs'), 'ElevenLabs', 8, 84, 8, 'b', .9),
      ('ic', B('n8n'), 'n8n', 76, 14, 33, 'b', .6),
      ('ic', B('zapier'), 'Zapier', 90, 30, 58, 'b', .4),
      ('ic', B('cursor'), 'Cursor', 78, 50, 82, 'b', .85),
      ('ic', B('crewai'), 'CrewAI', 91, 70, None, None, .5),
      ('ic', B('perplexity'), 'Perplexity', 74, 86, None, None, .75),
      ('ic', B('heygen'), 'HeyGen', 31, 10, None, None, .3),
      ('ic', B('notion'), 'Notion', 71, 32, None, None, .3),
      ('chip', '3 hackathons', '', 18, 90, None, None, .55),
    ],
    detail=dict(
      lead='AI runs through every term, from using it to work faster to building agents that do the work. No coding background is needed.',
      stats=[('150 hrs', 'of hands-on AI'), ('25+', 'AI tools'), ('5', 'AI products shipped'), ('3', 'hackathons')],
      groups=[('Term by term', [
        ('media/pillars/term1-lab.webp', 'Term 1', 'Work smarter with AI', 'Use AI to research, write, analyse and present faster, then build your first app just by describing it.', 'Vibe Coding Hackathon, e.g. a Splitwise-style expense splitter', 'ChatGPT, Claude, Gemini, Perplexity, NotebookLM, Lovable'),
        ('media/pillars/term2-lab-voice.webp', 'Term 2', 'Create with AI', 'Build AI that can speak, see, listen and generate images and video, from a support voice bot to product demos.', 'AI Agent Hackathon, e.g. a language-learning voice assistant', 'ElevenLabs, Vapi, Midjourney, HeyGen'),
        ('media/pillars/term3-students.webp', 'Term 3', 'Automate with AI', 'Connect everyday tools so that repetitive work in sales, marketing and operations runs on its own.', 'An automation that runs a real business process, e.g. a case-interview practice tool', 'Zapier, n8n, Make, Airtable, Notion'),
        ('media/pillars/term4-lab-robotics.webp', 'Term 4', 'Build AI agents', 'Build agents that research, decide and complete tasks on their own, like a digital teammate.', '48-Hour AI Hackathon, e.g. a negotiation-training AI coach', 'Relevance AI, CrewAI, Hugging Face, Ollama'),
        ('media/pillars/term5-students.webp', 'Term 5', 'Scale AI products', 'Learn where AI creates real value in a business, how to price it and build its ROI case, and take it to market.', 'A capstone launched to real users with a go-to-market plan', 'Julius AI, Microsoft Copilot, Cursor'),
      ])],
    ),
  ),
  dict(
    key='build', name='Build businesses', bg='media/pillars/lab-build-1890.webp', fx='55% 45%',
    claim='Build two real businesses with real money, then pitch one to VCs.',
    nums=[('₹25K', 'D2C seed money'), ('₹5L+', '6-week revenue target'), ('₹25L', 'funding pathway')],
    rail_k='From the cohort',
    rail=[
      ('reel', 'media/pillars/d2c.webp', '62% 50%', 'D2C Startup Challenge', '6 weeks'),
      ('reel', 'media/pillars/hustle.webp', '70% 50%', 'The Hustle Program', '6 months'),
      ('reel', 'media/built/hummus.webp', '50% 50%', 'Hummusapiens: ₹50L offer', 'Cohort 1'),
      ('reel', 'media/built/gredo.webp', '50% 50%', 'Gredo: ₹1Cr+ ARR', 'Cohort 1'),
      ('reel', 'media/built/dreamkit.webp', '50% 50%', 'Dream Kit: 12,000+ students', 'Cohort 1'),
    ],
    floaters=[
      ('ic', B('peakxv'), 'Peak XV', 10, 20, 8, 't', .8),
      ('ic', B('lightrock'), 'Lightrock', 22, 42, 30, 't', .45),
      ('chip', '₹50L offered by Anupam Mittal', '', 15, 64, 52, 't', .65),
      ('ic', B('zomato', 'png'), 'Zomato', 24, 84, 8, 'b', .9),
      ('ic', B('swiggy'), 'Swiggy', 77, 16, 30, 'b', .55),
      ('chip', '₹1Cr+ ARR', 'Gredo', 84, 38, 56, 'b', .4),
      ('chip', 'Demo Day', 'Pitch to VCs', 80, 62, None, None, .75),
      ('ic', B('thewholetruth'), 'The Whole Truth', 89, 82, None, None, .5),
    ],
    detail=dict(
      lead='Two businesses, both with real money and real customers. The second one is pitched to investors on Demo Day.',
      stats=[('₹25K', 'D2C seed money'), ('₹5L+', 'D2C revenue target'), ('₹50K', 'Hustle seed money'), ('₹25L', 'funding pathway')],
      groups=[('The two builds', [
        ('media/pillars/d2c.webp', '6 weeks', 'D2C Startup Challenge', 'Take a brand from zero to its first customers: sourcing, branding, packaging, pricing and selling. Teams get ₹25,000 in startup funding and target ₹5L+ in revenue.', 'Working capital grows as teams hit revenue milestones', ''),
        ('media/pillars/hustle.webp', '6 months', 'The Hustle Program', 'Build a business from MVP to revenue to a founder-ready pitch, with ₹50,000 to start and a pathway to funding of up to ₹25L.', 'Backed by Lightrock, Peak XV and Sidhant Goyal', ''),
      ]), ('What Cohort 1 built', [
        ('media/built/hummus.webp', 'Healthy snacking', 'Hummusapiens', 'Pitched to Shark Tank India judge Anupam Mittal on campus.', '₹50L offered by Anupam Mittal', ''),
        ('media/built/gredo.webp', 'Food-tech', 'Gredo', 'A protein-food brand live on Zomato and Swiggy, with vending machines across Bangalore.', '₹1Cr+ ARR', ''),
        ('media/built/dreamkit.webp', 'STEAM toys', 'Dream Kit', 'A homegrown STEAM toy brand that teaches science through play.', '12,000+ students across schools', ''),
      ])],
      link=('#built', 'See every company Cohort 1 built'),
    ),
  ),
  dict(
    key='projects', name='Live projects', bg='media/pillars/term3-students.webp', fx='50% 50%',
    claim='Work real briefs from real companies, then defend your plan to their founders.',
    nums=[('6', 'company briefs'), ('₹200Cr', 'business, APAC plan'), ('1', 'stock-market sim')],
    rail_k='The briefs',
    rail=[
      ('tile', 'media/pillars/mokobara.webp', '50% 60%', 'Mokobara', 'International expansion'),
      ('tile', 'media/pillars/ajio.webp', '50% 50%', 'AJIO', 'Product teardown'),
      ('tile', 'media/pillars/practo.webp', '40% 50%', 'Practo', 'Healthcare growth'),
      ('tile', 'media/pillars/meolaa.webp', '50% 50%', 'Meolaa', 'Launch strategy'),
      ('tile', 'media/pillars/quenzy.webp', '50% 50%', 'Quenzy', 'Product-market fit'),
      ('tile', 'media/pillars/stockgro.webp', '50% 50%', 'StockGro', 'Stockathon'),
    ],
    floaters=[
      ('ic', B('ajio'), 'AJIO', 10, 18, 8, 't', .8),
      ('chip', 'Mokobara', 'APAC plan', 18, 40, 30, 't', .5),
      ('ic', B('practo'), 'Practo', 9, 62, 64, 't', .7),
      ('ic', B('meolaa'), 'Meolaa', 24, 82, 8, 'b', .9),
      ('ic', B('stockgro'), 'StockGro', 78, 18, 30, 'b', .55),
      ('chip', 'Quenzy', 'Go-to-market', 84, 40, 56, 'b', .4),
      ('chip', 'Pitch to founders', '', 82, 64, None, None, .75),
      ('chip', 'Live market sim', 'StockGro', 84, 84, None, None, .5),
    ],
    detail=dict(
      lead='Each brief comes from a real company. Teams work it with founders and operators, then present and defend their recommendation.',
      stats=[('6', 'company briefs'), ('₹200Cr', 'Mokobara, APAC plan'), ('1', 'live market simulation')],
      groups=[('The briefs', [
        ('media/pillars/mokobara.webp', 'Mokobara', 'International expansion', 'Design the APAC strategy for a ₹200Cr business and pitch it to the founders.', '', ''),
        ('media/pillars/ajio.webp', 'AJIO', 'Product teardown', 'Map conversion friction from discovery and search to the product page and checkout.', '', ''),
        ('media/pillars/practo.webp', 'Practo', 'Healthcare growth', 'Grow healthcare GMV across primary, secondary and tertiary care.', '', ''),
        ('media/pillars/meolaa.webp', 'Meolaa', 'Launch strategy', 'Build onboarding flows, brand campaigns and an app-launch roadmap.', '', ''),
        ('media/pillars/quenzy.webp', 'Quenzy', 'Product-market fit', 'Build a PMF and go-to-market strategy across culture, distribution and positioning.', '', ''),
        ('media/pillars/stockgro.webp', 'StockGro', 'Stockathon', 'Trade in a live mock-market simulation under real market conditions.', '', ''),
      ])],
    ),
  ),
  dict(
    key='immersions', name='Immersions', bg='media/pillars/domestic-immersions.webp', fx='50% 45%',
    claim='Learn where the work happens: factory floors, quick-commerce ops and a creative agency.',
    nums=[('3', 'industry immersions'), ('6 mo', 'creator track at Jio Creative Labs')],
    rail_k='On the ground',
    rail=[
      ('reel', 'media/pillars/domestic-immersions.webp', '45% 50%', 'Quick-commerce backend', 'Immersion'),
      ('reel', 'media/pillars/creator-preneur-track.webp', '30% 50%', 'Jio Creative Labs', 'Creator track'),
      ('reel', 'media/pillars/tanisha-singhal.webp', '50% 30%', 'Tanisha Singhal', 'Tech events'),
      ('reel', 'media/pillars/pallavi-op.webp', '50% 30%', 'Pallavi O P', 'PCOS and weight loss'),
      ('reel', 'media/pillars/shubham-singh.webp', '50% 30%', 'Shubham Singh', 'Bollywood x business'),
    ],
    floaters=[
      ('ic', B('jio', 'png'), 'Jio', 10, 20, 8, 't', .8),
      ('ic', B('reliance'), 'Reliance', 22, 44, 30, 't', .45),
      ('chip', 'Manufacturing floor', '', 14, 66, 52, 't', .65),
      ('chip', 'Quick-commerce ops', '', 18, 86, 8, 'b', .9),
      ('chip', 'Fashion brand HQ', '', 82, 16, 50, 'b', .55),
      ('chip', 'Jio Dhan Dhana Dhan', 'Campaign', 84, 40, None, None, .4),
      ('ic', B('jio', 'png'), 'Jio', 90, 64, None, None, .75),
    ],
    detail=dict(
      lead='Three domestic immersions put you inside working businesses. The creator-preneur track puts you inside Reliance’s creative agency for six months.',
      stats=[('3', 'domestic immersions'), ('6 mo', 'at Jio Creative Labs')],
      groups=[('The immersions', [
        ('media/pillars/domestic-immersions.webp', 'Immersion', '3 domestic immersions', 'Across industries: manufacturing floors, quick-commerce backend ops and a fashion brand headquarters.', '', ''),
        ('media/pillars/creator-preneur-track.webp', 'Creator track', 'Creator-preneur track', '6 months inside Reliance’s Jio Creative Labs, on campaigns like Jio Dhan Dhana Dhan.', '', ''),
      ]), ('Creators from the track', [
        ('media/pillars/tanisha-singhal.webp', 'Creator', 'Tanisha Singhal', 'Tech events and resources.', '', ''),
        ('media/pillars/pallavi-op.webp', 'Creator', 'Pallavi O P', 'PCOS and weight loss.', '', ''),
        ('media/pillars/shubham-singh.webp', 'Creator', 'Shubham Singh', 'Bollywood x business.', '', ''),
      ])],
    ),
  ),
  dict(
    key='mentors', name='Mentor sessions', bg='media/pillars/lab-mentor-1400.webp', fx='60% 40%',
    claim='The people who built India’s best-known companies come to campus to teach how.',
    nums=[('4', 'super mentor sessions'), ('1', 'Commencement Day address')],
    rail_k='The sessions',
    rail=[
      ('reel', 'media/pillars/rajan-anandan.webp', '78% 50%', 'Rajan Anandan', 'Ex-MD SEA, Google'),
      ('reel', 'media/pillars/jacob-singh.webp', '18% 50%', 'Jacob Singh', 'Ex-CTO, Blinkit'),
      ('reel', 'media/pillars/rahul-chari.webp', '42% 50%', 'Rahul Chari', 'Co-founder, PhonePe'),
      ('reel', 'media/pillars/yash-kumar.webp', '30% 50%', 'Yash Kumar', 'OpenAI'),
    ],
    floaters=[
      ('ic', B('google'), 'Google', 10, 20, 8, 't', .8),
      ('ic', B('blinkit'), 'Blinkit', 23, 44, 30, 't', .45),
      ('chip', 'Rejected by Google, built PhonePe', '', 16, 66, 40, 't', .65),
      ('ic', B('phonepe'), 'PhonePe', 24, 86, 8, 'b', .9),
      ('ic', B('openai'), 'OpenAI', 77, 16, 30, 'b', .55),
      ('chip', 'Creator of OpenAI’s first agent', '', 84, 40, 40, 'b', .4),
      ('ic', B('peakxv'), 'Peak XV', 90, 64, None, None, .75),
      ('chip', 'Commencement Day', 'Yash Kumar', 82, 86, None, None, .5),
    ],
    detail=dict(
      lead='Super mentor sessions bring founders and operators to campus to share how they built what they built.',
      stats=[('4', 'super mentor sessions'), ('1', 'Commencement Day address')],
      groups=[('The sessions', [
        ('media/pillars/rajan-anandan.webp', 'Ex-MD SEA, Google', 'Rajan Anandan', 'On striving for excellence, learning from failure and staying hungry.', '', ''),
        ('media/pillars/jacob-singh.webp', 'Ex-CTO, Blinkit', 'Jacob Singh', 'On tech leadership and product thinking at India’s largest quick-commerce company.', '', ''),
        ('media/pillars/rahul-chari.webp', 'Co-founder, PhonePe', 'Rahul Chari', 'Rejected by Google, he went on to build India’s largest UPI app.', '', ''),
        ('media/pillars/yash-kumar.webp', 'Lead Engineer, OpenAI', 'Yash Kumar', 'The creator of OpenAI’s first agent addressed students on Commencement Day.', '', ''),
      ])],
    ),
  ),
]

PLAY = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor"/></svg>'
ARROW = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHEV_L = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7.5 2.5 4 6l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHEV_R = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def e(s):
    return html.escape(s, quote=True)

def floater(f, k=0):
    kind, val, label, x, y, mx, band, d = f
    style = f'--x:{x}%;--y:{y}%'
    cls = 'pl-f'
    if band:
        style += f';--mx:{mx}%;--row:{k % 2}'
        cls += ' pl-ft' if band == 't' else ' pl-fb'
    else:
        cls += ' pl-dk'
    if kind == 'ic':
        return f'<span class="{cls} pl-ic" style="{style}" data-d="{d}"><img src="{val}" alt="{e(label)}" width="64" height="64" decoding="async"></span>'
    sub = f'<small>{e(label)}</small>' if label else ''
    return f'<span class="{cls} pl-chip" style="{style}" data-d="{d}">{sub}{e(val)}</span>'


# Panel backgrounds: abstract, not photos, so the card stays the focus: a deep green base, two soft glows that drift,
# a light behind the card, grain on top. The lines are the orbit rings the logos travel on (see orbit()).
# Colours per pillar: (glow a, glow b). The photo in `bg` is still used as the header of the detail sheet.
AURA = {
    'ai':         ('#0E8A63', '#1C9CA8'),
    'build':      ('#0B7A3E', '#C9A04A'),
    'projects':   ('#0A6E58', '#3FA9C4'),
    'immersions': ('#0C6B3F', '#D98E52'),
    'mentors':    ('#0D6A47', '#7F72E0'),
}
def aura(key):
    a, b = AURA[key]
    return f'<div class="pl-bg pl-aura" style="--ga:{a};--gb:{b}" aria-hidden="true"><span class="pl-g pl-g1"></span><span class="pl-g pl-g2"></span><span class="pl-spot"></span></div>'

# Desktop (1181px and up): the logos sit evenly on one orbit ring around the card and travel along it slowly
# (pillars.js). Two fainter rings echo it. Text chips are not shown in the background any more.
def orbit(p):
    seen, ics = set(), []
    for f in p['floaters']:
        if f[0] == 'ic' and f[1] not in seen:
            seen.add(f[1]); ics.append(f)
    logos = ''.join(f'<span class="pl-ob"><img src="{f[1]}" alt="{e(f[2])}" width="68" height="68" decoding="async" loading="lazy"></span>' for f in ics)  # noqa
    return f'<div class="pl-orbit">{logos}</div>'

def rail_item(p, i, it):
    kind, src, pos, title, sub = it
    img = f'<img src="{src}" alt="" loading="lazy" decoding="async" style="object-position:{pos}">'
    if kind == 'reel':
        return (f'<button class="pl-it pl-reel" type="button" data-reel="{p["key"]}" data-i="{i}" data-t="{e(title)}" data-s="{e(sub)}" data-src="{REEL_SRC}" aria-label="Play reel: {e(title)}">'
                f'{img}<span class="pl-play">{PLAY}</span><span class="pl-cap"><small>{e(sub)}</small>{e(title)}</span></button>')
    return (f'<button class="pl-it pl-tile" type="button" data-pl-open="{p["key"]}" data-at="{i}" aria-label="{e(title)}: {e(sub)}">'
            f'{img}<span class="pl-cap"><small>{e(sub)}</small>{e(title)}</span></button>')

def panel(p, n, total):
    nums = ''.join(f'<li><b>{e(v)}</b><span>{e(l)}</span></li>' for v, l in p['nums'])
    rail = ''.join(rail_item(p, i, it) for i, it in enumerate(p['rail']))
    cnt = {'t': 0, 'b': 0}
    fls = []
    for f in [f for f in p['floaters'] if f[0] == 'ic']:
        band = f[6]
        fls.append(floater(f, cnt.get(band, 0)))
        if band:
            cnt[band] += 1
    fl = ''.join(fls)
    return f'''
    <article class="pl-panel" id="learn-{p['key']}" data-key="{p['key']}" data-sub="{e(p['name'])}" aria-labelledby="pl-t-{p['key']}">
      <div class="pl-stage">
        <div class="pl-fl" aria-hidden="false">{fl}</div>
        <div class="pl-card">
          <div class="pl-in">
            <p class="pl-k"><b>0{n}</b> / 0{total}</p>
            <h3 class="pl-t" id="pl-t-{p['key']}">{e(p['name'])}</h3>
            <p class="pl-d">{e(p['claim'])}</p>
            <ul class="pl-n">{nums}</ul>
            <div class="pl-rh"><span>{e(p['rail_k'])}</span><span class="pl-ar"><button type="button" class="pl-pv" aria-label="Previous">{CHEV_L}</button><button type="button" class="pl-nx" aria-label="Next">{CHEV_R}</button></span></div>
          </div>
          <div class="pl-rail">{rail}</div>
          <div class="pl-in"><button class="pl-go" type="button" data-pl-open="{p['key']}">Explore {e(p['name'] if p['key'] == 'ai' else p['name'].lower())}{ARROW}</button></div>
        </div>
      </div>
    </article>'''

def detail(p, n, total, nxt):
    d = p['detail']
    stats = ''.join(f'<li><b>{e(v)}</b><span>{e(l)}</span></li>' for v, l in d['stats'])
    groups = ''
    for gname, rows in d['groups']:
        items = ''
        for img, k, t, body, out, tools in rows:
            extra = ''
            if out:
                extra += f'<p class="pd-out">{e(out)}</p>'
            if tools:
                extra += f'<p class="pd-tools"><span>Tools</span>{e(tools)}</p>'
            items += (f'<li class="pd-row"><img src="{img}" alt="" loading="lazy" decoding="async">'
                      f'<div><p class="pd-rk">{e(k)}</p><h4>{e(t)}</h4><p class="pd-rb">{e(body)}</p>{extra}</div></li>')
        groups += f'<section class="pd-g"><h3 class="pd-gh">{e(gname)}</h3><ul>{items}</ul></section>'
    link = ''
    if d.get('link'):
        href, label = d['link']
        link = f'<a class="pd-link" href="{href}" data-pd-jump>{e(label)}{ARROW}</a>'
    return f'''
    <template id="pl-tpl-{p['key']}" data-n="0{n} / 0{total}" data-name="{e(p['name'])}" data-bg="{p['bg']}" data-fx="{p['fx']}" data-next="{nxt['key']}" data-next-name="{e(nxt['name'])}">
      <p class="pd-lead">{e(d['lead'])}</p>
      <ul class="pd-stats">{stats}</ul>
      {groups}
      {link}
    </template>'''

def main():
    total = len(PILLARS)
    panels = ''.join(panel(p, i + 1, total) for i, p in enumerate(PILLARS))
    tpls = ''.join(detail(p, i + 1, total, PILLARS[(i + 1) % total]) for i, p in enumerate(PILLARS))
    idx = ''.join(f'<a href="#learn-{p["key"]}" data-i="{i}"><b>0{i + 1}</b>{e(p["name"])}</a>' for i, p in enumerate(PILLARS))
    # one lit backdrop and one set of rings (drawn by pillars.js) for the whole scene; a logo layer per pillar on top
    scene = '<div class="pl-backdrop" aria-hidden="true"></div><svg class="pl-rings" aria-hidden="true" focusable="false"></svg>' + ''.join(f'<div class="pl-layer{" on" if i == 0 else ""}" data-i="{i}">{orbit(q)}</div>' for i, q in enumerate(PILLARS))
    out = f'''<!-- How you learn: one pinned scene (background + logos follow the active card) with five cards stacking over it; a card per pillar with a sideways rail; logos float around it; 85% detail sheet; reel viewer. GENERATED by tools/pillars_data.py -->
<section class="pl-sec" id="learn" data-nav="dark" aria-labelledby="pl-title">
  <div class="pl-bar">
    <div class="pl-head">
      <p class="sec-eyebrow">How you learn</p>
      <h2 class="pl-title" id="pl-title">Five ways SSB teaches business. <span>All of them by doing it.</span></h2>
    </div>
  </div>
  <div class="pl-stack">
    <div class="pl-scene">{scene}<span class="pl-grain" aria-hidden="true"></span></div>{panels}
  </div>
  <div class="pl-dock"><nav class="pl-idx" aria-label="Pillars">{idx}</nav></div>
  {tpls}
  <div class="pl-dlg" id="pl-dlg" role="dialog" aria-modal="true" aria-labelledby="pl-dlg-t" aria-hidden="true">
    <div class="pl-dlg-scrim" data-pl-close></div>
    <div class="pl-dlg-box">
      <div class="pl-dlg-media"><img alt="" decoding="async"></div>
      <div class="pl-dlg-body">
        <div class="pl-dlg-head"><span class="pl-dlg-grab" aria-hidden="true"></span><p class="pl-k pl-dlg-n"></p><h2 class="pl-dlg-t" id="pl-dlg-t"></h2><button class="pl-dlg-x" type="button" aria-label="Close" data-pl-close><i></i></button></div>
        <div class="pl-dlg-c"></div>
        <div class="pl-dlg-foot"><button class="pl-dlg-next" type="button"></button><a class="pl-dlg-apply" href="https://www.scaler.com/school-of-business/admission/" data-lead="apply">Apply now</a></div>
      </div>
    </div>
  </div>
  <div class="pl-rv" id="pl-rv" role="dialog" aria-modal="true" aria-label="Reel" aria-hidden="true">
    <div class="pl-rv-scrim" data-rv-close></div>
    <div class="pl-rv-frame">
      <div class="pl-rv-bars"></div>
      <video playsinline loop preload="none"></video>
      <button class="pl-rv-zone pl-rv-prev" type="button" aria-label="Previous reel"></button>
      <button class="pl-rv-zone pl-rv-next" type="button" aria-label="Next reel"></button>
      <div class="pl-rv-cap"><small></small><b></b></div>
      <button class="pl-rv-snd" type="button" aria-pressed="true">Sound on</button>
      <button class="pl-rv-x" type="button" aria-label="Close reel" data-rv-close><i></i></button>
    </div>
  </div>
</section>
'''
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8').write(out)
    print('wrote', OUT)

if __name__ == '__main__':
    main()
