# SSB home page

A redesign concept for the Scaler School of Business home page. The hero is light, and the sections below it switch between dark and light.

The source is split into sections. A small Python script joins them into one self-contained `index.html`.

## Folder layout

```
ssb-home/
  build.py                  joins src/ into index.html
  index.html                GENERATED. Do not edit by hand.
  tools/
    faculty_data.py         faculty and mentors data; regenerates the faculty list and captions
    pillars_data.py         "How you learn" pillars data; regenerates src/sections/pillars/pillars.html
    faculty-research.md     sources for every faculty company and role (Oct 2026)
  src/
    page.html               page template with {{CSS}}, {{JS}} and one {{name}} slot per section
    global/
      global.css            tokens, reset, shared helpers (.cta, .sec-head, .tag, intro wipe)
      global.js             page-ready intro and the video loop helper
    sections/
      <name>/
        <name>.html         markup for this section
        <name>.css          styles for this section
        <name>.js           optional behaviour for this section
  media/                    local images and logos (only the files the page uses)
    brands/                 company logos (Brandfetch, plus Simple Icons glyphs for a few); icon-dark.* = square app icons
    pillars/                photos and reel posters for the pillars section
    breakers/  team/  press/  posters and logos for the breakers, founding team and press (breaker videos stream from the v3 lab)
    admissions/  built/  campus/  faculty/  footer/  pg/
  .preview/h.html           preview harness: renders the page at a true width (?w=390&h=844) in an iframe
```

Sections in page order:

| # | Folder | What it is | Theme |
|---|--------|------------|-------|
| 1 | `nav` | Global nav, flying logo, section bar (desktop) whose menu button opens the site menu panel, sticky section header + section list sheet (phone), menu sheet (phone) | |
| 2 | `hero` | Programme name as H1, CTAs, facts row, logo marquee, stat tiles, film card | light |
| 3 | `film` | The hero film card lifts into a full-screen frame on scroll | dark |
| 4 | `outcomes` | Alumni before and after cards in two marquee rows | dark |
| 5 | `breakers` (`why`) | Full-width video breaker: Nikhil Kamath quote, 60% / 62% AI stats | dark |
| | seam | Gradient horizon, dark to light | |
| 6 | `programme` | Five-term carousel (white active card, image-led side cards, step rail) and the term sheet | light |
| | seam | Pixel fill, light to dark | |
| 7 | `punch` | "Learn business [photo] by building it." The halves close in on a changing photo | dark |
| 8 | `pillars` | "How you learn": pinned headline, five stacked photo panels (card + sideways rail, floating logos), pillar index docked at the bottom of the screen, 85% detail sheet, reel viewer | dark |
| 9 | `built` | Full-bleed company showcase with tabs and hotspots | dark |
| 10 | `breakers` (`voices`) | Full-width video breaker, two slides: Anupam Mittal, Ankur Warikoo; controls at the bottom | dark |
| | seam | Pixel fill, dark to light | |
| 11 | `faculty` | Name list with stacked brand tiles that fan out, sticky portrait, topic filter | light |
| 12 | `campus` | Campus life: the cohort arrives full-bleed and pulls back into a photo mosaic; a thin auto-scrolling strip of student clubs under it | light |
| 13 | `team` | Founding team: portrait grid (rail on phones) with past companies | light |
| | seam | Pixel fill, light to dark | |
| 14 | `press` | Four real articles about SSB (rail on phones) | dark |
| 15 | `admissions` | Sticky intro (title, eligibility, CTAs) beside process and fee cards; scholarships block (sheet each, `#scholarship-*`) with Impact Foundation backers | dark |
| | seam | Gradient horizon, dark to light | |
| 16 | `faq` | Accordion, one open at a time, each answer linkable (`#faq-*`) | light |
| 17 | `footer` | Copy of the live footer, plus draft footnotes | |
| 18 | `lead` | Lead modal (apply, brochure, callback, exit intent): photo carousel with proof + form; 85% sheet on phones | |

`breakers` fills two slots with `{{breakers:why}}` and `{{breakers:voices}}` (files `breakers-why.html`, `breakers-voices.html`). Any section can do this: `{{name:part}}` reads `src/sections/<name>/<name>-<part>.html`.

Faculty and campus are both light on purpose: the full-bleed cohort photo is the divider.

`seams` is a section folder with CSS and JS only. Its markup is the `<div class="seam ...">` lines between the slots in `src/page.html`.

## Build

You only need Python 3. There are no packages to install.

```bash
cd /Users/kshnvagale/Documents/Ai/Scaler/ssb-home
python3 build.py            # build once
python3 build.py --watch    # rebuild every time you save a file in src/
```

Then open `index.html` in a browser. It works from `file://`, so you do not need a server. Refresh after each build.

To check an exact width when you cannot resize the window, serve the folder and open the harness:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# then open http://127.0.0.1:8765/.preview/h.html?w=390&h=844   (or w=1440&h=900)
```

The build stops with an error if `page.html` has a `{{slot}}` that no section fills.

## Edit a section

1. Open `src/sections/<name>/`.
2. Edit `<name>.html`, `<name>.css` or `<name>.js`.
3. Run `python3 build.py`, or leave `--watch` running.
4. Check the page at a desktop width (about 1440px) and a phone width (about 390px). Both are equally important.

Do not edit `index.html`. The next build overwrites it.

**Faculty is data-driven.** Do not hand-edit the list rows or captions in `faculty.html`. Edit the table in `tools/faculty_data.py`, then run:

```bash
python3 tools/faculty_data.py && python3 build.py
```

**Pillars are data-driven too.** Edit `PILLARS` in `tools/pillars_data.py` (copy, numbers, rail items, floating logos, detail sheet), then run:

```bash
python3 tools/pillars_data.py && python3 build.py
```

## Add or change a transition (seam)

Put one line between two slots in `src/page.html`:

```html
<div class="seam seam-px" data-from="#FBFAF7" data-to="#050E09" aria-hidden="true"></div>   <!-- pixel fill -->
<div class="seam seam-grad" data-from="#050E09" data-to="#FBFAF7" aria-hidden="true"></div> <!-- gradient, dark to light -->
<div class="seam seam-grad up" data-from="#FBFAF7" data-to="#050E09" aria-hidden="true"></div> <!-- gradient, light to dark -->
```

`data-from` is the background of the section above and `data-to` is the background of the section below. They must match exactly, or a hard line shows.

## Add a section

Example: a new section called `stories` that goes after `faculty`.

1. **Make the folder and files.**
   ```
   src/sections/stories/stories.html
   src/sections/stories/stories.css
   src/sections/stories/stories.js     (only if it needs behaviour)
   ```
   Start each file with a one-line comment that says what the section is, like the other sections do.

2. **Write the markup.** Use one root element with an `id` and a `data-nav` value:
   ```html
   <!-- Stories: student stories carousel -->
   <section class="st-sec" id="stories" data-nav="dark" aria-labelledby="st-title">
     ...
   </section>
   ```
   `data-nav="dark"` or `"light"` tells the nav which colour to use while this section is under it. Use `dark` for a dark background and `light` for a light background.

3. **Add it to `build.py`.**
   - Add `'stories'` to `SECTIONS` in page order.
   - If it has a `.js` file, also add `'stories'` to `JS_ORDER`. **If you forget this, the build skips the script without a warning.**

4. **Add the slot to `src/page.html`** in the right place inside `<main>`:
   ```html
   {{faculty}}
   {{stories}}
   {{campus}}
   ```
   **If you forget this, the build skips the HTML without a warning** (the CSS still gets in).

5. **Add it to the nav, if visitors should be able to jump to it.** In `src/sections/nav/nav.html`, add a link to `#stories` in the section bar (`.ln-hooks`), the menu sheet and, if it fits, the mobile tab bar. Keep the `data-k` and `data-t` numbers in order.

6. Build and check both widths.

To remove a section, undo the same steps: remove it from `SECTIONS`, `JS_ORDER`, `page.html` and the nav links, then delete the folder.

## Media

- Put local files in `media/<section>/` and use a relative path, for example `media/built/creator.webp`.
- Keep `media/` to the files the page uses. Delete files you stop using.
- Company logos come from Brandfetch and are already in `media/brands/<company>/`. The Brandfetch API key is not in any file in this project. Do not add it.
- Some images and the campus film still load from `https://ssb-school-concept.vercel.app/...` (alumni photos, campus photos, some logos). These need a network connection.

## Design rules

- Fonts: **Geist** for text and **Geist Mono** for labels and numbers. Both load from Google Fonts in `page.html`.
- Colours: brand green `#075C32` (`--cta`) and mint `#6BEE9F` (`--mint`). Use the tokens in `global.css`, not new hex values.
- Buttons have an **8px** corner radius. Do not use pill buttons.
- No em dashes and no emojis in copy or code comments.
- Mobile and desktop are equally important. Check both before you call a change done.
- Respect `prefers-reduced-motion`. Every animated section has a reduced-motion rule.
