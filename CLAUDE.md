# CLAUDE.md

Instructions for AI agents that work on this project. Read `README.md` first for the folder layout and the build. This file has the rules and the traps.

## Hard rules

1. **Never edit `index.html`.** It is generated. Edit files in `src/`, then run `python3 build.py`.
2. **Stay inside your section.** Each chat usually owns one section folder (`src/sections/<name>/`). Do not change other section folders, `src/global/`, `src/page.html` or `build.py` unless the user asks. If a fix really needs a shared file, say so and say what you would change before you change it.
3. **Design rules:**
   - Fonts: Geist and Geist Mono only (`var(--font)`, `var(--mono)`).
   - Colours: brand green `#075C32` (`var(--cta)`), mint `#6BEE9F` (`var(--mint)`). Use the tokens in `global.css`.
   - Buttons and CTAs: 8px radius. No pill buttons.
   - No em dashes and no emojis, in copy, comments and commit text.
   - Mobile and desktop are equally important. Verify both.
   - Eyebrows have no leading or trailing line. Do not add one back.
   - Keep gaps tight: a seam replaces section padding (see the rhythm rules at the end of `seams.css`), it does not add to it.
4. **Brandfetch:** logos are already in `media/brands/`. The API key is not stored anywhere in the project. Never write it to a file. To fetch more, pass the key through an environment variable for that one command only (`https://api.brandfetch.io/v2/brands/<domain>`, `Authorization: Bearer $KEY`) and save the square `icon` as `media/brands/<slug>/icon-dark.<ext>`.
5. **Media:** `media/` holds only the files the page uses. If you add a file, use it. If you stop using a file, delete it.

## How the build works

`build.py` does four things:

1. CSS: `global.css` first, then each section's `.css` in `SECTIONS` order, all in one `<style>` tag.
2. HTML: replaces each `{{name}}` in `page.html` with `sections/<name>/<name>.html`.
3. JS: one `<script>` per section in `JS_ORDER` order, then `global.js` last.
4. Writes `index.html`. It stops if any `{{slot}}` is left unfilled.

Silent failures to know about:

- A section in `SECTIONS` but **not in `JS_ORDER`**: its `.js` is skipped, with no warning.
- A section in `SECTIONS` but with **no `{{name}}` slot in `page.html`**: its HTML is skipped, with no warning. Its CSS still goes in.
- All CSS shares one stylesheet. A loose selector in one section can restyle another. Scope every rule to your section prefix.

## Type scale and section rhythm (global.css tokens)

Every section title, eyebrow, lead line and section padding comes from these. Do not set font sizes or section padding by hand in a section file.

| Token | Desktop | Phone (<=760) | Used for |
|---|---|---|---|
| `--t-h2` / `-lh` / `-ls` | clamp(32px,3.4vw,50px) / 1.04 / -.038em | 32px | every section title, breaker headlines |
| `--t-h3` | clamp(24px,2.3vw,34px) | 24px | sub-blocks (scholarships, clubs intro) |
| `--t-lead` | 17px | 15.5px | the line under a title |
| `.sec-eyebrow` | 500 12px mono, .14em, gap `--t-eb-gap` (16 / 14) | same | every eyebrow, no lines |
| `--sec-y` | clamp(200px,22.5vw,320px) | 144px | top and bottom section padding (2.5x the first pass on desktop, 2x on phones, at Kishan's request) |
| `--sec-y-tight` | clamp(100px,11.25vw,160px) | 80px | next to a seam (seams.css), or two sections that share a background |
| `--head-gap` | clamp(28px,3.4vw,44px) | same | section header to its content |

Sticky columns: never put `overflow:hidden` on a section that has a sticky child (it makes the section the scroll box and the sticky column drops down). Use `overflow:clip`.

Overlays: the root hides with `visibility` after a delay equal to its exit animation (`transition:visibility 0s linear .5s`, reset to `0s` when open), so every modal, sheet and panel animates out the way it came in. Keep enter and exit on `--ease-out`, .4s to .6s.

## How you learn panels: background and logos

No photos behind the cards. Each panel has an abstract background (`aura()` in `tools/pillars_data.py`, colours in `AURA`): a deep green base, two slow glows, a light behind the card, grain. The only lines are the orbit rings.
Desktop (1181px and up): the pillar's logos (icon floaters, deduped) sit evenly on one ring and travel along it (`pillars.js`, one turn per 150s, only panels on screen move). They fade out while behind the card column. Below 1181px they are one centred row at the top of the panel (8 max on tablets, 6 on phones). Text chips in `floaters` are kept in the data but no longer shown. The photos in `bg` are still the headers of the detail sheets.

## How you learn and Admissions: backdrop and rings

No coloured glows. Both sections use a lit backdrop: near-black (#050806 to #0B130F), one soft near-white light from above (rgba(222,255,236,.11 to .13)), darker edges, grain. The rings are drawn in SVG by JS (`drawRings` in pillars.js, the IIFE at the end of admissions.js) on one tilted plane (height = 30% of width): near half brighter and thicker (gradient .08 to .36), far half fading (.08 to .02); inner ring dotted, outer ring ticked, a glint travels the front of the middle ring (pillars only). Pillar logos ride the middle ring, float 62px (scaled) above it on a stem with a contact dot, and get smaller, darker and slightly blurred toward the back. Admissions cards are solid surfaces (gradient #111B16 to #0B120E, edge highlight, deep shadow); the scholarship block is a dark surface lit green from its top-left corner.

## How you learn: the deck

One pinned scene (`.pl-scene`) holds the background, the logos and all five cards. On load `pillars.js` moves each card out of its panel into `.pl-deck`; the panels stay as empty scroll spacers (they keep the `#learn-*` ids, the stack height and the pillar index jumps).
Scroll runs p from 0 to 4. Each card rests for the first half of its step, then the front card slides up and tilts back (top tips away, rotateX) and leaves, solid until the last fifth; the next card steps forward from the deck. Waiting cards sit behind, 5% smaller per step and 14px lower (10px on phones), bottom-anchored so only their bottom edges show, with their content faded. Only the front card takes clicks and focus (others are `inert`). The background layer and the logo ring crossfade to the active card. Reduced motion: no transforms, the active card simply swaps.

## Pinned headline in How you learn

The headline (`.pl-bar`) is sticky to the section, the panels to `.pl-stack`. On desktop the stack has a negative bottom margin of one panel and the section gets it back as padding, so the section's content box ends where the last panel starts to move and the headline leaves with it. Do not remove one half without the other.

## Section conventions

Follow these in every section:

- First line of each file is a one-line comment that names the section and what it does.
- One root element with a stable `id` (used by nav anchors) and `data-nav="dark"` or `"light"` to match its background.
- Every class starts with the section prefix. Prefixes in use:

  | Section | Prefix(es) |
  |---------|------------|
  | nav | `gn-`, `ln-`, `mh-`, `mx-`, `sheet-`, `sh-`, `brand-` |
  | hero | `hero`, `tile`, `stat`, `track`, `alumni`, `warp`, `logos-` |
  | film | `film-`, `flyer`, `fc-`, `stage-` |
  | outcomes | `alumni-sec`, `al-`, `am-` |
  | programme | `pg-`, `tm-` |
  | built | `bs-` |
  | faculty | `fx-` |
  | punch | `pn-` |
  | pillars | `pl-`, `pd-` (detail sheet content) |
  | lead | `ld-` |
  | breakers | `bk-` |
  | team | `lt-` |
  | press | `pr-` |
  | campus | `cl-` |
  | admissions | `ad-` |
  | faq | `fq-` |
  | seams | `seam`, `seam-grad`, `seam-px` |
  | footer | `ft-` |

  Pick a new, unused prefix for a new section. Note: hero uses `.alumni-top .al-logos`, which shares the `al-` prefix with outcomes. Do not add an `.al-logos` rule in outcomes.

- JS is wrapped in an IIFE and returns early if its root is missing: `(function(){ var sec=document.querySelector('.x-sec'); if(!sec) return; ... })();`
- Shared helpers in `global.css` you can use: `.sec-head`, `.sec-eyebrow`, `.sec-title`, `.sec-side`, `.cta`, `.cta .orb`, `.cta-glass`, `.cta-dark`, `.tag`, `.dot`, `.fade` (with `--d` delay in seconds).
- Tokens: `--ink`, `--deep`, `--forest`, `--pine`, `--brand`, `--brand-hi`, `--cta`, `--cta-hi`, `--mint`, `--paper`, `--ink-t`, `--dim-t`, `--faint-t`, `--hair-t`, `--dim`, `--faint`, `--hair`, `--ease-out`, `--ease-io`, `--ease-spring`, `--pad`, `--lh`, `--gn-h`.
- Breakpoints already in use: 640, 700, 760, 900, 1000, 1020, 1180px, plus `(hover:none)`. Prefer 640, 760 and 1180 so sections change at the same widths.
- Add a `@media (prefers-reduced-motion:reduce)` rule for any animation.

## Links between sections

These sections depend on each other. If you change one side, check the other.

| From | To | Link |
|------|----|------|
| `film.js` | hero | Reads `.tile.film` (the hero film card) to start the lift-into-frame animation. Keep that class on the hero card. |
| `film.js` | global | Sets `window.__stageWarp`. `film.js` itself calls it during scroll. |
| `nav.js` | film | Reads `.film-scroll` to time the nav change. |
| `nav.js` | all sections | Reads every `[data-nav]` element to pick the nav colour. A section without `data-nav` keeps the previous colour. |
| `nav.js` | global | Sets `window.__nav` (logo and bar state). |
| `nav.html` / `nav.js` | all sections | Anchor links, the section list rows (`.mx-row`, in nav.html) and the scrollspy list (`ids` in `nav.js`) cover `#film`, `#outcomes`, `#programme`, `#learn`, `#built`, `#faculty`, `#campus`, `#team`, `#press`, `#admissions`, `#faq`, in that order (the desktop bar shows 9 of them and matches hooks by href; `#team` and `#press` live in the phone list and the menu). Changing a section `id` breaks these. |
| `admissions.js` | page | The scholarship sheet is moved to `<body>` at load so it stacks above every section. Deep links: `#scholarship-<slug>`. |
| `pillars.js` | page | The detail sheet (`#pl-dlg`) and reel viewer (`#pl-rv`) are moved to `<body>`. Deep links: `#pillar-<key>` (ai, build, projects, immersions, mentors). The back gesture closes the sheet. |
| `breakers.js` | page | Videos load and play only while their breaker is on screen (IntersectionObserver). The voices breaker crossfades every 9s. `main>.bk-sec` is exempt from the seam rhythm padding. |
| `pillars.js` | `nav.js` | Sets `data-sub` on `#learn` to the active pillar and fires `ssb:sub`; the phone header shows it. Any section can do the same to name the item it is showing. |
| `lead.js` | all | Intercepts clicks on `[data-lead]` and on links to `/school-of-business/admission/`, `#brochure`, `#advisor`, and opens the lead modal (apply, brochure, callback). Exit intent: desktop only, once a session, after 20s. Nothing is sent; submit shows a success state. |
| `nav.js` | desktop | The section bar's menu button (`.ln-menu`) and, from 761px to 1020px, the top-nav menu button open the site menu (`#nm`): the bar grows into a panel (left/top/width/height animate from the bar's rect), big page links on the left, the image on the right swaps on hover, "On this page" anchors at the bottom. Page links carry `data-no-lead` so `lead.js` does not turn "Admissions & fees" into the modal. Phones keep the bottom sheet. |
| `nav.js` | phone | The bottom tab bar is gone. `.mh` is the sticky section header (section name, n / 9, item from `data-sub`, progress line); `.mh-where` opens the section list (`#mx-list`). Anchor jumps offset by 44px on phones. |
| `faq.js` | page | Deep links `#faq-<slug>` open that answer and scroll to it. Answers link to `#admissions`. |
| `seams.css` | all | Rhythm rules: `main>section:has(+ .seam)` and `.seam+section` cut the padding next to a seam. `main>*+*{margin-top:-1px}` overlaps every block by 1px to hide sub-pixel hairlines. Do not remove it. |
| `hero.js` | first fold | The film card video loads but stays on its poster until the first scroll of 8px or more (sets `window.__heroPlay`). Keep the first fold to at most two moving things. |
| `film.js` | first fold | The full-screen film video does not autoplay at load; it starts when the frame lifts out of the hero. |
| `page.html` | seams | Each seam's `data-from` / `data-to` must equal the background of the section above and below (`#050E09` dark, `#FBFAF7` light). If you change a section background, change its seams too. |
| `punch` | `built` | Punch cycles through `media/built/*.webp`, the same photos as Built at SSB. |
| `global.js` | all | Adds `.is-ready` to `<html>` after fonts load (or after 900ms). `.fade` and intro animations wait for it. Set `window.__holdIntro=true` before it runs to hold the intro; call `window.__ssbReady()` to release it. |
| `global.js` | hero, film | `video[data-loop-to][data-rate]` loops a video between 0.15s and the given time at the given speed. |

The `.cta` base rule in `global.css` still says `border-radius:999px`. A later rule in the same file overrides it to 8px with `!important`. Do not remove the override.

## Facts that need sign-off

- Admissions figures (intakes, deadlines, ₹15.5L / ₹16L course fee, ₹1,000 application fee) are from the Sep 2026 deck. The live admissions page (Oct 2026) shows a different 2027-batch structure (Early bird to 1 Nov 2026, ₹1,500 application fee, ₹23,00,000 course fee). Confirm with the admissions team before changing either; all figures sit in `admissions.html` (fee table) and `faq.html` (fees answer) and the hero accent tile.
- Outcome and internship numbers need placement-team sign-off (footnotes after the footer).
- Pillar figures come from the v3 lab (ssb-school-concept.vercel.app/v3): 150 hrs AI, 25+ tools, 5 AI products, 3 hackathons, ₹25K / ₹5L+ / ₹50K / ₹25L business funding, 6 briefs, 3 immersions, 6 months at Jio Creative Labs, 4 super mentor sessions. Confirm before launch.
- Breaker stats (60% of MBA students, Forbes 2026; 62% AI wage premium, PwC 2026) come from v3 and are not yet traced to the source reports.
- Press: the Inshorts piece says the founding cohort's average CTC is ₹18 LPA; outcomes elsewhere use ₹19L (Cohort 1). The Tribune piece is a syndicated press release (VMPL / ANI advertorial).
- Student clubs: Marketing and Consulting are real (v3); the other eight are placeholders, and the "10" on the strip label counts them.
- Faculty and mentor one-liners (`note` in `tools/faculty_data.py`) are dummy copy written for layout, not quotes or researched facts.
- Founding team: Amar Srivastava's chip reads "Scaler" (his current company); every other chip is a past company.
- Founding team names and roles come from v3; Vidit Jain's title matches the July 2026 press release.
- Reels are placeholders: real posters, but every reel plays the same campus film (`REEL_SRC` in `tools/pillars_data.py`).

## Faculty data

- The list rows, portraits and captions in `faculty.html` are generated by `tools/faculty_data.py`. Edit the table there, then run `python3 tools/faculty_data.py && python3 build.py`.
- Every company and role is sourced in `tools/faculty-research.md`. Add a company only with a credible source (company site, press release, major news outlet). Data-aggregator profiles (SignalHire, RocketReach) are not enough.
- Tile kinds: `icon` (square app icon), `sym` (coloured symbol), `symw` (symbol forced white), `wm` (wordmark), `wmw` (wordmark forced white). Tiles keep their colours in every state and never overlap. The selected row shows a short green bar under the name.
- No guiding text in this section (no "browse by topic", no "hover a name").
- Selection follows hover, and also follows scrolling: on each scroll frame `faculty.js` reads the row under the last pointer position (browsers hold back hover events during scroll), or the row at 55% of the viewport when the pointer is not over the list.

## Stacking order (z-index)

| Layer | z-index |
|-------|---------|
| Section content | 0 to 6 (most sections use 6 so they cover the film) |
| Grain overlay | 3 |
| Nav layers | 22, 30, 31 |
| Intro wipe | 40 |
| Nav menu sheet, phone section list | 45 |
| Desktop site menu panel (`#nm`) | 46 |
| Pillar detail sheet | 50 |
| Reel viewer | 55 |
| Lead modal | 60 |
| Programme term detail sheet | 100 |

Stay inside 0 to 6 for section content unless the section really needs to sit above the nav.

## Verify before you report done

1. `python3 build.py` runs with no error.
2. Open a preview:
   ```js
   await openTab('about:blank');
   await page.goto('file:///Users/kshnvagale/Documents/Ai/Scaler/ssb-home/index.html');
   ```
3. Check desktop and mobile (390x844). If `page.setViewportSize` is not available, serve the folder (`python3 -m http.server 8765 --bind 127.0.0.1`) and load `index.html` inside a 390x844 `<iframe>` on a scratch page; the mobile media queries apply to the iframe width. Scroll to your section and look at it. Some sections animate on scroll, so scroll step by step, not in one jump.
4. Check the browser console for errors.
5. Check that the sections above and below yours still look right, because CSS is shared.
6. Show a screenshot of the result to the user.

Remote media from `https://ssb-school-concept.vercel.app/` needs a network connection. Lazy images (`loading="lazy"`) can look broken in a screenshot until you scroll to them.

## Deploying (ssb-school-concept.vercel.app/v4)

`python3 build.py && python3 tools/deploy_v4.py` makes a preview; add `--prod` for production. The script talks to the Vercel REST API with the CLI login (the CLI fails on Node 26). It rebuilds the existing Next.js project from the exact source files of the current production deployment (reused by hash), adds this page under `public/v4/` with asset paths rewritten to `/v4/media/` (Next strips trailing slashes, so relative paths would hit v3's `/media`), and adds one rewrite to `next.config.ts` (`/v4` -> `/v4/index.html`). v3 and `/` (which redirects to `/v3`) are untouched. Before promoting, compare `/v3` on the preview with live. Rollback: `python3 tools/deploy_v4.py --rollback <previous deployment id>` (the id is printed and saved in `.vercel-last-deploy.json`, which is git-ignored). If the login has expired, run `vercel login` (needs Node 20/22/24) and re-run.
First production deploy: 15 Oct 2026, dpl_4YRqmXCY4mrCZmVCKPJbHpAxJyiT (previous: dpl_EMGijhAgcJ5p5F8g5FT8Ect7FW4z).
