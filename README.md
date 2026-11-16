# Charlene Lee — Portfolio (minimal rebuild)

A plain HTML/CSS/JS version of [charlenelee.ca](https://charlenelee.ca), moved off Framer.
It has the same content as before in a quieter layout, loosely based on rachelchen.tech
(left index, serif headlines, project captions) and brianyang.ca (lowercase nav, lots of white space).

No build step, no framework, no dependencies.

## Run it locally

**Option A, VS Code (recommended)**
1. Open this folder in VS Code (`File → Open Folder…`).
2. Install the recommended **Live Server** extension when VS Code prompts you. It's listed in `.vscode/extensions.json`.
3. Right-click `index.html` → **Open with Live Server**. The page reloads every time you save.

**Option B, terminal**

```bash
cd charlene-portfolio
python3 -m http.server 5500
```

Then open http://localhost:5500.

## Files

```
index.html          Works: hero, 6-project grid, statement, footer
archive.html        Archive: sticky left index + Visual Design / Film / Traditional Art
about.html          About: intro + portraits, experience, awards, photos
assets/css/style.css  All styles. Design tokens are at the top in :root
assets/js/main.js     Fade-in on scroll, archive index highlight, studio carousel
assets/img/           Images (see the warning below)
.vscode/              Live Server + Figma extension recommendations
```

## The header logo morph

The "Charlene Lee" lettering and the c·l·l mark are vectors exported from your Figma file
(Experimentation page: nodes 31:1104 and 31:1073). The header in every page holds one SVG with each
letter as its own `<path>`:

- `class="fade"` letters (h, a, r, e, n, e, e, e) fade and shrink away
- `class="keep"` letters (C, l, L) slide left by `data-to` units
- two `class="dot"` circles appear between them

`assets/js/main.js` (top section) drives it from the scroll position. On the home page the logo starts
over `.name-slot` in the hero and docks into the header. On other pages it's c·l·l from the start.
To tune it, change `MARK_H` (docked height, in px) or the `range(p, 0.3, 0.9)` window that controls when the letters morph.

The big doodle behind the hero is `assets/img/doodle.svg` (Figma node 29:722). It stays put while the cards scroll over it.

## Design tokens (also handy for Figma variables)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#fafaf8` | page background |
| `--surface` | `#f2f1ee` | image placeholders, rationale box |
| `--ink` | `#232323` | headings, primary text |
| `--ink-2` | `#555552` | body text |
| `--muted` | `#9a9995` | captions, labels |
| `--line` | `#e7e6e2` | hairlines |
| `--accent` | `#d0613a` | active index dot, link hover |
| `--font-grotesk` | Alte Haas Grotesk → Inter Tight | home tagline |
| `--font-serif` | Instrument Serif | archive/about headlines |
| `--font-sans` | Inter 400/500 | everything else |
| `--max` | 1120px | content width |

To restyle the whole site, change these values. Every page uses the same stylesheet.

## ⚠️ Before you publish: TODO list

0. **Home page.** The covers for **CxC AI Hackathon** and **Game Design** are placeholders.
   Add `assets/img/cxc.png` and `assets/img/game-design.png`, then swap each `<div class="thumb is-empty">` for an `<img>`
   like the melo card. Also fill in Game Design's category and year, and each card's `href`.
   RBC is deliberately not clickable ("coming soon"). Change its `<div class="work-card is-soon">` to an `<a>` when it's ready.
   **Font:** the tagline uses *Alte Haas Grotesk* from your Figma. It's free but not on Google Fonts.
   Download it and put `AlteHaasGroteskRegular.ttf` in `assets/fonts/`. Until then the tagline uses Inter Tight.

1. **Swap in the full-resolution images.** The live site couldn't be reached from where this was built,
   so every image in `assets/img/` was cropped from the screenshots in your Figma file.
   They're low resolution and will look soft on retina screens. Export the originals and overwrite them
   **with the same filenames**. No HTML changes are needed.
2. **Missing images.** These are grey boxes for now. Add the files and replace each
   `<div class="placeholder">` with an `<img>`:
   - `convocation-tv.png` (WUSA, Convocation TV screen animation)
   - `cxc-posts.png` (UW Data Science, CxC 2026 Instagram posts)
   - `branding-mockups.png` (Client Branding, pouch + notebook mockups)
3. **Resume.** Put your PDF at `assets/resume.pdf`.
4. **Email + LinkedIn.** Search for `you@example.com` and `your-handle` (they appear once per page in the footer).
5. **Case study links.** On `index.html` the melo / Polar / sweet dreams cards link to `#`.
   Point them at the case study pages once you've rebuilt them. You can copy `archive.html` as a starting layout.
6. **Film links.** In `archive.html` each `<a class="video" href="#">` needs its YouTube/Vimeo URL.
7. **Studio Pieces.** Only *Anchored* was visible in the screenshots. Copy the `.slide` block for each other piece
   and the ‹ › arrows will work automatically.
8. **Photo strip** (about page). Only 6 photos were visible. Add more `<img>` tags to `.film-strip`.
9. **Check the copy.** Text was transcribed from screenshots. Two typos from the original were kept as they were:
   "with with care" (about intro) and "colour pallet" (Logo Design). The Experience/Awards lists were split
   across two screenshots, so check that no row is missing.

## Next step: Figma MCP

With the Figma MCP server connected in Claude Code, you can:
- **Code → Figma:** ask Claude to push `index.html` / `about.html` into your *Portfolio-27* file as editable frames.
- **Figma → code:** design a change in Figma, then share the frame link and ask Claude to update the HTML/CSS to match.
- Turn the token table above into Figma variables so both sides stay in sync.

## Hosting later

Any static host works: drag the folder onto Netlify, or push it to GitHub and enable GitHub Pages or Vercel.
Then point `charlenelee.ca` at it in your domain's DNS settings.
