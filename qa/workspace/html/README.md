# qa/workspace/html/

Fixtures for the HTML destination checklist ([`checklists/html.md`](../../checklists/html.md)).

`.html` is a **markup** destination whose styles axis is a **source-type
dispatch**. A source's extension picks the branch — script (`.js`) → `<script>`,
image → `<img>`, video → `<video>`, audio → `<audio>`, stylesheet (`.css`) → fixed `<link>`,
text-track (`.vtt`) → fixed `<track>`. It has **no** smart-identifier behavior
(`smartId: none`) — unlike [`typescript/`](../typescript/), there is no `src/classes/` or
`src/angular/` subtree, and the only happy-path shape with tab stops is the `<track>`. Its
placement is **`forced-cursor`** (the `importStatementPlacement` setting is ignored; the tag
lands at the cursor line and the **column follows the cursor**), and the path **always keeps
the full source extension** (no preserve-toggle). Every fixture below is referenced by
`html.md`, so the directory is checklist↔workspace 1:1 with no orphans.

Unlike [`css/`](../css/) (`root + vendor/ + placement/ + rejects/`) or [`scss/`](../scss/)
(`src/ + destinations/ + rejected/`), this workspace follows `html.md`'s own prerequisites
table — a **root `index.html` + `src/` + `destinations/` + `rejected/`** tree — because the
checklist drives the workspace 1:1. The `index.html` target sits at the root so its §2
happy-path strings read `./src/...`; the `destinations/*.html` targets sit one level deeper,
so their §6/§9 placement strings read `../src/...` — the `./` vs `../` split is what proves
the nesting.

## Layout

```
html/
├── index.html                   Primary target — §2 paste, §3 Alt+D, §4 styles, §7 picker, §8 set-default, §9a drop
├── src/                         Import sources — one per source-type branch
│   ├── scripts/app.js           script (.js)       → <script src="./src/scripts/app.js"></script>
│   ├── styles/theme.css         stylesheet (.css)  → fixed <link href="…" rel="stylesheet">
│   ├── images/logo.png          image (.png)       → <img src="…" alt="sample">   (empty placeholder)
│   ├── media/intro.mp4          video (.mp4)       → <video src="…" controls></video>  (empty placeholder)
│   ├── media/theme.mp3          audio (.mp3)       → <audio src="…" controls></audio>  (empty placeholder)
│   └── media/captions.vtt       text-track (.vtt)  → fixed <track … srclang="${1:en}" label="${2:English}">
├── destinations/                Pre-filled placement targets (undo after each paste; paths resolve as ../src/…)
│   ├── blank.html               Empty body line — placement setting-ignored test (§6, §9c-i)
│   ├── indented.html            Line 2 = exactly six spaces — column-follows-cursor test at col 6 (§6, §9c-ii)
│   └── with-comments.html       HTML <!-- --> vs embedded-JS // run — comment-marker mismatch (§10, §9c-iii/iv)
└── rejected/                    One source per rejected category
    ├── widget.ts   App.vue      theme.scss   notes.md
    ├── data.json   page.html    font.woff2   doc.pdf
    └── sample.tex  refs.bib     diagram.eps
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `index.html` | §1–§4, §7, §8, §9a | Primary paste/drop/picker/set-default target (root → `./src/…` paths) |
| `src/scripts/app.js` | §1, §2, §3, §4, §6, §7, §8, §9, §10 | Script source (`.js`) → `<script>`; also the placement + edge + drop source |
| `src/styles/theme.css` | §1, §2, §4, §7, §8 | Stylesheet source (`.css`) → fixed `<link>`; single-variant picker; `no-configurable-style` set-default |
| `src/images/logo.png` | §1, §2, §4, §7, §8 | Image source → `<img>` styles; empty placeholder |
| `src/media/intro.mp4` | §1, §2, §4, §7, §8 | Video source → `<video>` styles; empty placeholder |
| `src/media/theme.mp3` | §1, §2, §4, §7, §8 | Audio source → `<audio>` styles; empty placeholder |
| `src/media/captions.vtt` | §1, §2, §4, §7, §8 | Text-track source (`.vtt`) → fixed `<track>` with `${1:en}`/`${2:English}`; single-variant; `.vtt → .html` fixed set-default |
| `destinations/blank.html` | §6, §9c-i | Empty body line — `forced-cursor` setting-ignored (Top/Bottom/Cursor all → cursor line) |
| `destinations/indented.html` | §6, §9c-ii | Line 2 = six spaces — column follows the cursor/drop (col 6, NOT 0) |
| `destinations/with-comments.html` | §10, §9c-iii, §9c-iv | `<!-- -->` lands at it (not a comment); embedded-`//` run pushes above |
| `rejected/widget.ts` | §1, §9b | `.ts` reject; also drives the unsupported-pair drop (drop suppressed, no insert) |
| `rejected/App.vue` | §1 | `.vue` reject (`.svelte`/`.astro` reject identically) |
| `rejected/theme.scss` | §1 | `.scss` reject (only `.css` accepted among stylesheets) |
| `rejected/notes.md` | §1 | `.md` reject |
| `rejected/data.json` | §1 | `.json` reject (`.yaml`/`.yml` reject identically) |
| `rejected/font.woff2` | §1 | `.woff2` reject (`.woff`/`.ttf`/`.eot` reject identically); empty placeholder |
| `rejected/doc.pdf` | §1 | `.pdf` reject; empty placeholder |
| `rejected/page.html` | §1, §9b′ | `.html → .html` reject; also drives the `.html → .html` drop |
| `rejected/sample.tex` | §1 | `.tex` reject (latex source) |
| `rejected/refs.bib` | §1 | `.bib` reject (bibliography source) |
| `rejected/diagram.eps` | §1 | `.eps` reject (LaTeX vector graphics) |