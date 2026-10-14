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
4. **Brandfetch:** logos are already in `media/brands/`. The API key is not stored anywhere in the project. Never write it to a file.
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

## Section conventions

Follow these in every section:

- First line of each file is a one-line comment that names the section and what it does.
- One root element with a stable `id` (used by nav anchors) and `data-nav="dark"` or `"light"` to match its background.
- Every class starts with the section prefix. Prefixes in use:

  | Section | Prefix(es) |
  |---------|------------|
  | nav | `gn-`, `ln-`, `tb-`, `sheet-`, `sh-`, `brand-` |
  | hero | `hero`, `tile`, `stat`, `track`, `alumni`, `warp`, `logos-` |
  | film | `film-`, `flyer`, `fc-`, `stage-` |
  | outcomes | `alumni-sec`, `al-`, `am-` |
  | programme | `pg-`, `tm-` |
  | built | `bs-` |
  | faculty | `fx-` |
  | punch | `pn-` |
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
| `nav.html` / `nav.js` | all sections | Anchor links and the scrollspy list (`ids` and `tabOf` in `nav.js`) cover `#film`, `#outcomes`, `#programme`, `#built`, `#faculty`, `#campus`, `#admissions`, `#faq`. `tabOf` -1 means no mobile tab (the section lives in More). Changing a section `id` breaks these. |
| `admissions.js` | page | The scholarship sheet is moved to `<body>` at load so it stacks above every section. Deep links: `#scholarship-<slug>`. |
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
| Nav menu sheet | 45 |
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
