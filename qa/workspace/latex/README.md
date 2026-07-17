# qa/workspace/latex/

Fixtures for the LaTeX destination checklist ([`checklists/latex.md`](../../checklists/latex.md)).

`.tex` is a destination with its **own** picker
namespace (`latex.*`) for non-script sources. A source's extension picks the branch — graphics
(`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`) → a `figure` float, `.tex` → `\input`/`\include`, `.bib` →
`\addbibresource`/`\bibliography`. The accepted graphics set is **engine-renderable only**: web
images `.svg`/`.gif`/`.webp`/`.avif` are gate-rejected (`pdflatex` can't render them) — the four
`rejected/` web-image stubs prove this. It has **no** smart-identifier behavior (`smartId: none`) —
unlike [`typescript/`](../typescript/), there is no `src/classes/` or `src/angular/` subtree. Its
placement is **`forced-cursor`** (the `importStatementPlacement` setting is ignored; the import lands
at the cursor line in the **body**, never the preamble, and the **column follows the cursor**), and
the default `figure` shape is the **only multi-line snippet in the whole extension**. Every fixture
below is referenced by `latex.md`, so the directory is checklist↔workspace 1:1 with no orphans.

Like [`html/`](../html/), this workspace follows `latex.md`'s own prerequisites table — a **root
`main.tex` + `src/` + `destinations/` + `rejected/`** tree. The `main.tex` target sits at the root
so its §2 happy-path strings read `./src/...`; the `destinations/*.tex` targets sit one level
deeper, so their §6/§9 placement strings read `../src/...` — the `./` vs `../` split is what proves
the nesting.

## Layout

```
latex/
├── main.tex                      Primary target — §2 paste, §3 Alt+D, §4 styles, §7 picker, §8 set-default, §9a drop, §10 figure
├── src/                          Import sources — one per source-extension branch
│   ├── figures/plot.png          graphics (.png)  → figure float / \includegraphics  (empty placeholder)
│   ├── figures/plot.pdf          graphics (.pdf)  → figure float  (empty placeholder — proves .pdf is accepted here)
│   ├── figures/diagram.eps       graphics (.eps)  → figure float  (empty placeholder)
│   ├── chapters/intro.tex        file include (.tex) → \input{./src/chapters/intro}  (.tex dropped)
│   └── refs.bib                  bibliography (.bib) → \addbibresource{./src/refs.bib}  (keeps .bib)
├── destinations/                 Pre-filled placement targets (undo after each paste; paths resolve as ../src/…)
│   ├── blank.tex                 Empty body line — placement setting-ignored test (§6, §9c-i)
│   ├── indented.tex              Line 4 = exactly six spaces — column-follows-cursor test at col 6 (§6, §9c-ii)
│   └── with-comments.tex         LaTeX % comment is not recognized by isCommentLine (§10, §9c-iii)
└── rejected/                     One source per rejected category
    ├── icon.svg   anim.gif       web images (reject — not pdflatex-renderable; the LaTeX-distinctive gate)
    ├── photo.webp banner.avif    web images (reject)
    ├── widget.ts  App.vue        script / framework (reject)
    ├── theme.css  page.html      stylesheet / markup (reject)
    ├── notes.md   data.json      markdown / data (reject)
    └── font.woff2 clip.mp4 captions.vtt   font / media / text-track (reject)
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `main.tex` | §1–§4, §7, §8, §9a, §10 | Primary paste/drop/picker/set-default target (root → `./src/…` paths) |
| `src/figures/plot.png` | §1, §2, §3, §4, §7, §8, §9, §10 | Graphics source (`.png`) → `figure` float (3 styles); the figure, preserve-toggle, drop, and multi-line edge source; empty placeholder |
| `src/figures/plot.pdf` | §1 | Graphics source (`.pdf`) → proves `.pdf` is **accepted** here (rejected by every other allow-list dest); empty placeholder |
| `src/figures/diagram.eps` | §1 | Graphics source (`.eps`) — the classic LaTeX vector format; empty placeholder |
| `src/chapters/intro.tex` | §1, §2, §4, §6, §7, §8, §9 | File-include source (`.tex`) → `\input`/`\include`; also the **single-line** placement + drop source |
| `src/refs.bib` | §1, §2, §4, §7, §8 | Bibliography source (`.bib`) → `\addbibresource` (keeps `.bib`) / `\bibliography` (drops `.bib`) |
| `destinations/blank.tex` | §6, §9c-i | Empty body line — `forced-cursor` setting-ignored (Top/Bottom/Cursor all → cursor line) |
| `destinations/indented.tex` | §6, §9c-ii | Line 4 = six spaces — column follows the cursor/drop (col 6, NOT 0) |
| `destinations/with-comments.tex` | §10, §9c-iii | LaTeX `%` comment lands at it (not recognized by `isCommentLine`) |
| `rejected/icon.svg` | §1, §9b | `.svg` reject (web image); also drives the unsupported-pair drop (drop suppressed, no insert) |
| `rejected/anim.gif` | §1 | `.gif` reject (web image) |
| `rejected/photo.webp` | §1 | `.webp` reject (web image); empty placeholder |
| `rejected/banner.avif` | §1 | `.avif` reject (web image); empty placeholder |
| `rejected/widget.ts` | §1 | `.ts` reject (`.tsx`/`.js`/`.jsx`/`.mdx` reject identically) |
| `rejected/App.vue` | §1 | `.vue` reject (`.svelte`/`.astro` reject identically) |
| `rejected/theme.css` | §1 | `.css` reject (`.scss` rejects identically) |
| `rejected/page.html` | §1 | `.html` reject |
| `rejected/notes.md` | §1 | `.md` reject |
| `rejected/data.json` | §1 | `.json` reject (`.yaml`/`.yml` reject identically) |
| `rejected/font.woff2` | §1 | `.woff2` reject (`.woff`/`.ttf`/`.eot` reject identically); empty placeholder |
| `rejected/clip.mp4` | §1 | `.mp4` reject (all video/audio reject identically); empty placeholder |
| `rejected/captions.vtt` | §1 | `.vtt` reject (text-track) |