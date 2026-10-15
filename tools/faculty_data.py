#!/usr/bin/env python3
"""Faculty and mentors data. Regenerates the list and captions in src/sections/faculty/faculty.html.

    python3 tools/faculty_data.py && python3 build.py

Sources for every company: see the research note referenced in CLAUDE.md (faculty section).
Mark kinds (the square tiles in each row):
  icon  = a square app icon that fills the tile
  sym   = a coloured symbol, 60% of the tile
  symw  = a symbol forced to white on the brand colour
  wm    = a wordmark, 80% wide
  wmw   = a wordmark forced to white on the brand colour
Caption items (right side, under the portrait): (src, alt, height_px) or ('lockup', src, text, height_px).
"""
import html, os, re
B='media/brands/'; L='media/faculty/logos/'
def m(kind,bg,src): return (kind,bg,src)
P=[
 dict(n='Siddharth Menon',note='Teaches operations as the hidden half of every brand: if the shelf is empty, the ad was wasted.',img='siddharth-menon',cat='strategy',topic='Operation Management',bg='#222021',fg='#FFFFFF',
  marks=[m('icon','#E1251B',B+'colgate/icon-dark.jpg'),m('wm','#F40009',B+'cocacola/logo-white.svg'),m('wm','#0B6FB8',B+'epigamia/logo-light.png')],
  caps=[(L+'colgate.svg','Colgate',17),(B+'cocacola/logo.svg','Coca-Cola',21),(L+'epigamia.png','Epigamia',18)],
  role='Ex-CMO, Epigamia · Ex-Colgate, Coca-Cola'),
 dict(n='Akash Sinha',note='Runs growth as a weekly experiment log. You leave with a channel you tested, not a framework you memorised.',img='akash-sinha',cat='growth',topic='Growth Marketing',bg='#00AD5B',fg='#FFFFFF',
  marks=[m('sym','#240253',B+'cashfree/symbol-light.svg'),m('wm','#FFFFFF',L+'amazon.svg')],
  caps=[(L+'cashfree.svg','Cashfree',17),(L+'amazon.svg','Amazon',20)],
  role='CEO and Co-founder, Cashfree · Ex-Amazon'),
 dict(n='Dhron Kanish',note='Starts every product class with a client brief and ends it with a one-page recommendation you defend.',img='dhron-kanish',cat='product',topic='Product Management',bg='#24477F',fg='#FFFFFF',
  marks=[m('icon','#051C2C',B+'mckinsey/icon-dark.jpg'),m('wm','#2E2E38',L+'ey.svg')],
  caps=[(L+'mckinsey.svg','McKinsey & Company',14),(L+'ey.svg','EY',28)],
  role='Associate Partner, McKinsey · Ex-EY'),
 dict(n='Jacob Singh',note='Believes a good analyst asks the boring question first. Class is SQL, dashboards and a decision by Friday.',img='jacob-singh',cat='product',topic='Business Analytics',bg='#F8CB46',fg='#1C1C1C',
  marks=[m('icon','#F8CB45',B+'blinkit/icon-dark.jpg'),m('icon','#007354',B+'sequoia/icon-dark.png')],
  caps=[(L+'blinkit.svg','Blinkit',20),(L+'sequoia.svg','Sequoia Capital',15)],
  role='Ex-CTO, Blinkit · Ex-Sequoia Capital'),
 dict(n='Kanishk Mehta',note='Teaches ops through failure post-mortems from real launches, then has you redesign the process.',img='kanishk-mehta',cat='strategy',topic='Operation Management',bg='#072654',fg='#3395FF',
  marks=[m('symw','#2B6CD9',B+'razorpay/mark.svg')],
  caps=[(L+'razorpay.svg','Razorpay',20)],
  role='Sr. Product Director, Razorpay'),
 dict(n='Gaurav Dadhich',note='Hands you a budget and a target on day one. The rest of the course is about where the money went.',img='gaurav-dadhich',cat='growth',topic='Growth Marketing',bg='#2874F0',fg='#F9D00D',
  marks=[m('icon','#FFE51F',B+'flipkart/icon-dark.jpg'),m('symw','#2B6CD9',B+'razorpay/mark.svg'),m('wm','#FFFFFF',L+'amazon.svg')],
  caps=[(L+'flipkart.svg','Flipkart',28),(L+'razorpay.svg','Razorpay',17),(L+'amazon.svg','Amazon',18)],
  role='Founder, Maximem AI · Ex-Flipkart, Razorpay'),
 dict(n='Sandeep Das',note='Uses global product cases to show how the same playbook breaks in Indian markets, and how to fix it.',img='sandeep-das',cat='product',topic='Product Management',bg='#0000A0',fg='#FFFFFF',
  marks=[m('symw','#0000A0',B+'mars/symbol-dark.svg'),m('symw','#FD5108',B+'pwc/logo-light.svg'),m('sym','#A100FF',B+'accenture/symbol-white.svg')],
  caps=[(L+'mars.svg','Mars',17),(L+'pwc.svg','PwC',24),(L+'accenture.svg','Accenture',19)],
  role='Ex-Global Lead, Mars · Ex-PwC, Accenture'),
 dict(n='Vatsal Sanghvi',note='Treats data as a story with a villain. You find it, size it and pitch the fix to a founder.',img='vatsal-sanghvi',cat='product',topic='Business Analytics',bg='#2874F0',fg='#F9D00D',
  marks=[m('icon','#FFE51F',B+'flipkart/icon-dark.jpg')],
  caps=[(L+'flipkart.svg','Flipkart',30)],
  role='Founder, 1811 Labs · Ex-Flipkart'),
 dict(n='Saurabh Jain',note='Brand is a promise you can keep at scale. Every session ends with a positioning line you have to defend.',img='saurabh-jain',cat='growth',topic='Brand Strategy',bg='#000000',fg='#FFFFFF',
  marks=[m('icon','#111111',B+'stablemoney/mark.svg'),m('sym','#FC8019',B+'swiggy/symbol-white.svg')],
  caps=[(L+'stable-money.svg','Stable Money',19),(L+'swiggy.svg','Swiggy',22)],
  role='Co-founder, Stable Money · Ex-Swiggy, Navi'),
 dict(n='Puneet',note='Teaches finance from the CFO chair: read the P&L, find the leak, make the call with incomplete data.',img='puneet',cat='finance',topic='Corporate Finance',bg='#00522E',fg='#FFFFFF',
  marks=[m('icon','#147B58',B+'bcg/icon-dark.jpg'),m('wm','#000000',B+'deloitte/logo-light.svg')],
  caps=[(L+'bcg.svg','BCG',20),(L+'deloitte.svg','Deloitte',17)],
  role='Partner, BCG · Ex-Deloitte'),
 dict(n='Sidhant Goyal',note='Sales is a craft you rehearse. Expect live role-plays, recorded calls and a pipeline you build yourself.',img='sidhant-goyal',cat='growth',topic='Sales Leadership',bg='#F75961',fg='#FFFFFF',
  marks=[m('icon','#007354',B+'sequoia/icon-dark.png'),m('icon','#051C2C',B+'mckinsey/icon-dark.jpg'),m('icon','#F75961',B+'toddle/icon-dark.jpg')],
  caps=[(L+'sequoia.svg','Sequoia Capital',14),(L+'mckinsey.svg','McKinsey & Company',13),(L+'toddle.svg','Toddle',19)],
  role='Principal, Crane VC · Ex-Sequoia, McKinsey'),
 dict(n='Malthi SS',note='Breaks strategy into decisions a team can act on Monday morning, not slides that sit in a drive.',img='malthi-ss',cat='strategy',topic='Strategy and Consulting',bg='#003087',fg='#FFFFFF',
  marks=[m('symw','#002994',B+'paypal/symbol-dark.svg'),m('wm','#0FAAFF',B+'sap/logo-white.svg'),m('wm','#236CFF',B+'intuit/logo-white.svg')],
  caps=[(L+'paypal.svg','PayPal',19),(B+'sap/logo.svg','SAP',20),(B+'intuit/logo.svg','Intuit',15)],
  role='Ex-Product Director, PayPal · Ex-SAP, Intuit'),
 dict(n='Saurabh Sengupta',note='Brings the field into class: city launches, restaurant partners and the numbers that decide both.',img='saurabh-sengupta',cat='growth',topic='Brand Strategy',bg='#E23744',fg='#FFFFFF',
  marks=[m('icon','#D94148',B+'zomato/icon-dark.png')],
  caps=[(L+'zomato.svg','Zomato',18)],
  role='Ex-SVP Sales, Zomato · Ex-Aon Hewitt'),
 dict(n='Amit Puniyani',note='Makes valuation intuitive first and precise second. You model a real company before the term ends.',img='amit-puniyani',cat='finance',topic='Corporate Finance',bg='#000088',fg='#FFFFFF',
  marks=[m('symw','#0018A8',B+'deutschebank/logo-dark.svg')],
  caps=[(L+'deutschebank.svg','Deutsche Bank',20)],
  role='Ex-VP, Deutsche Bank'),
 dict(n='Narahari Hansoge',note='Teaches selling as listening. Frameworks from the boardroom, practised on real customer calls.',img='narahari-hansoge',cat='growth',topic='Sales Leadership',bg='#B12322',fg='#FFFFFF',
  marks=[m('symw','#B01116',B+'iimb/logo-dark.svg'),m('symw','#FD5108',B+'pwc/logo-light.svg')],
  caps=[(L+'iimb.webp','IIM Bangalore',24),(L+'pwc.svg','PwC',22)],
  role='Adjunct Faculty, IIM-B · Ex-Merrill Lynch, PwC'),
 dict(n='Rajan Anandan',note='Talks about picking markets early, building teams that outlast you and what investors really look for.',img='m-rajan-anandan',cat='mentor',topic='MD, Peak XV',bg='#8039FF',fg='#FFFFFF',
  marks=[m('icon','#000033',B+'peakxv/icon-dark.jpg'),m('symw','#4285F4',B+'google/symbol-dark.svg'),m('sym','#FFFFFF',B+'microsoft/symbol.svg')],
  caps=[(L+'peakxv.svg','Peak XV',17),(L+'google.svg','Google',22),('lockup',B+'microsoft/symbol.svg','Microsoft',18)],
  role='MD, Peak XV · Ex-Google, Microsoft'),
 dict(n='Deepinder Goyal',note='Speaks on building through near-death moments and why the customer is the only roadmap that matters.',img='m-deepinder-goyal',cat='mentor',topic='Founder, Zomato',bg='#E23744',fg='#FFFFFF',
  marks=[m('icon','#D94148',B+'zomato/icon-dark.png'),m('wmw','#CC0000',L+'bain.svg')],
  caps=[(L+'zomato.svg','Zomato',18),(L+'bain.svg','Bain & Company',13)],
  role='Founder, Zomato · Ex-Bain & Company'),
 dict(n='Binny Bansal',note='Shares how Flipkart scaled operations from a single warehouse and what he would do differently now.',img='m-binny-bansal',cat='mentor',topic='Co-founder, Flipkart',bg='#2874F0',fg='#F9D00D',
  marks=[m('icon','#FFE51F',B+'flipkart/icon-dark.jpg'),m('wm','#FFFFFF',L+'amazon.svg')],
  caps=[(L+'flipkart.svg','Flipkart',30),(L+'amazon.svg','Amazon',18)],
  role='Co-founder, Flipkart · Founder, Opptra'),
 dict(n='Vijay Shekhar Sharma',note='On betting the company on a new behaviour, and the patience it takes before India catches up.',img='m-vijay-shekhar-sharma',cat='mentor',topic='Founder and CEO, Paytm',bg='#233266',fg='#54C1F0',
  marks=[m('wm','#00BAF2',B+'paytm/logo-light.svg')],
  caps=[(L+'paytm.svg','Paytm',18)],
  role='Founder, MD and CEO, Paytm'),
 dict(n='Kunal Shah',note='On first-principles thinking, consumer psychology and finding the delta nobody else is looking at.',img='m-kunal-shah',cat='mentor',topic='Head of WhatsApp',bg='#111111',fg='#FFFFFF',
  marks=[m('sym','#25D366',B+'whatsapp/symbol-white.svg'),m('icon','#0F0F0F',B+'cred/icon-dark.jpg'),m('wm','#FFFFFF',L+'freecharge.png')],
  caps=[('lockup',B+'whatsapp/symbol.svg','WhatsApp',20),(L+'cred.svg','CRED',24,'ink'),(L+'freecharge.png','Freecharge',17)],
  role='Head of WhatsApp · Founder, CRED, Freecharge'),
]
e=lambda s: html.escape(s, quote=True)
def companies(p): return ', '.join(c[1] if c[0]!='lockup' else c[2] for c in p['caps'])
rows=[];figs=[];caps=[]
for i,p in enumerate(P):
    if p['cat']=='mentor' and P[i-1]['cat']!='mentor':
        rows.append('<li class="fx-group" data-group="mentor" aria-hidden="true"><span>Mentors</span></li>')
    marks=''.join(f'<span class="fx-bm fx-bm--{k}" style="--b:{bg}"><img src="{s}" alt="" loading="lazy" decoding="async"></span>' for k,bg,s in p['marks'])
    rows.append(f'<li class="fx-li" data-cat="{p["cat"]}"><button class="fx-row" type="button" data-i="{i}" style="--fx-bg:{p["bg"]};--fx-fg:{p["fg"]}" aria-label="{e(p["n"])}, {e(companies(p))}, {e(p["topic"])}">'
                f'<span class="fx-nm"><span class="fx-name">{e(p["n"])}</span><span class="fx-ind" aria-hidden="true"></span></span>'
                f'<span class="fx-meta"><span class="fx-stack fx-stack--{len(p["marks"])}" aria-hidden="true">{marks}</span><span class="fx-topic">{e(p["topic"])}</span></span></button></li>')
    k='Mentor' if p['cat']=='mentor' else 'Teaches'
    lazy='' if i<3 else ' loading="lazy"'
    figs.append(f'<figure class="fx-fig" data-i="{i}"><img src="media/faculty/{p["img"]}.webp" alt="{e(p["n"])}" width="640" height="800" decoding="async"{lazy}><figcaption class="fx-scrim"><span class="fx-k">{k}</span><span class="fx-big">{e(p["topic"])}</span></figcaption></figure>')
    items=[]
    for c in p['caps']:
        if c[0]=='lockup':
            items.append(f'<span class="fx-lk" style="--h:{c[3]}px"><img src="{c[1]}" alt="" loading="lazy"><span>{e(c[2])}</span></span>')
        else:
            ink=' fx-logo--ink' if len(c)>3 else ''
            items.append(f'<img class="fx-logo{ink}" src="{c[0]}" alt="{e(c[1])}" style="--lh:{c[2]}px" loading="lazy">')
    caps.append(f'<div class="fx-cap" data-i="{i}"><div class="fx-logos fx-logos--{len(items)}">{"".join(items)}</div><p class="fx-role">{e(p["role"])}</p><p class="fx-note">{e(p.get("note",""))}</p></div>')
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
f=os.path.join(root,'src/sections/faculty/faculty.html'); s=open(f,encoding='utf-8').read()
s=re.sub(r'(<ol class="fx-list" role="list">\n\s*).*?(\n\s*</ol>)',lambda mm:mm.group(1)+''.join(rows)+mm.group(2),s,flags=re.S)
s=re.sub(r'(<div class="fx-photo">).*?(</div>\n\s*<div class="fx-caps">)',lambda mm:mm.group(1)+''.join(figs)+mm.group(2),s,flags=re.S)
s=re.sub(r'(<div class="fx-caps">).*?(</div>\n\s*</div>\n\s*</aside>)',lambda mm:mm.group(1)+''.join(caps)+mm.group(2),s,flags=re.S)
# counts on the chips
from collections import Counter
cnt=Counter(p['cat'] for p in P)
s=re.sub(r'(data-f="all" aria-pressed="[a-z]+">All<sup>)\d+',lambda mm:mm.group(1)+str(len(P)),s)
for c,v in cnt.items(): s=re.sub(r'(data-f="%s" aria-pressed="[a-z]+">[^<]+<sup>)\d+'%c,lambda mm,v=v:mm.group(1)+str(v),s)
open(f,'w',encoding='utf-8').write(s); print('faculty.html: %d people'%len(P))
