# qa/workspace/markdown/

Fixtures for the Markdown destination checklist ([`checklists/markdown.md`](../../checklists/markdown.md)).

`.md` is a **markup** destination with a
**source-type dispatch**. A source's extension picks the branch: markdown (`.md`) → a
**fixed** `[${1:text}](path)` link (hardcoded, reads no setting), image → `![alt-text](path)`
with configurable `markdownImageImportStyle` styles. It has **no** smart-identifier
behavior (`smartId: none`) — unlike [`typescript/`](../typescript/), there is no `src/classes/`
or `src/angular/` subtree. Its placement is **`forced-cursor`** (the `importStatementPlacement`
setting is ignored; the link lands at the cursor line and the **column follows the cursor**),
with the **markdown-star quirk** — a leading `*` is content (bullets / `*italic*`), so a cursor
on it lands **at** the line, while `//` and `/*` still push above. The path **always keeps the
full source extension** (no preserve toggle). `.md` accepts its **own** extension — there is
**no `.md`→`.md` rejection** (the counter-case to `.html`). Every fixture below is referenced by
`markdown.md`, so the directory is checklist↔workspace 1:1 with no orphans.

Like [`html/`](../html/) (and unlike [`css/`](../css/)'s `root + vendor/ + placement/ + rejects/`),
this workspace follows a **root `notes.md` + `src/` + `destinations/` + `rejected/`** tree —
because the checklist drives the workspace 1:1. The `notes.md` target sits at the root so its §2
happy-path strings read `./src/...`; the `destinations/*.md` targets sit one level deeper, so
their §6/§9 placement strings read `../src/...` — the `./` vs `../` split is what proves the
nesting. `destinations/with-comments.tsx` is **byte-identical** to `with-comments.md` (only the
extension differs); it is the §10 contrast that proves the `isMarkdown` comment-line flag.

## Layout

```
markdown/
├── notes.md                      Primary target — §2 paste, §3 Alt+D, §4 styles, §7 picker, §8 set-default, §9a drop
├── src/                          Import sources — one per source-type branch
│   ├── docs/intro.md             markdown (.md)   → fixed [${1:text}](./src/docs/intro.md) link
│   └── images/logo.png           image (.png)     → ![${1:alt-text}](…)   (empty placeholder)
├── destinations/                 Pre-filled placement targets (undo after each paste; paths resolve as ../src/…)
│   ├── blank.md                  Empty line 2 — placement setting-ignored test (§6, §9c-i)
│   ├── indented.md               Line 2 = exactly six spaces — column-follows-cursor test at col 6 (§6, §9c-ii)
│   ├── with-comments.md          markdown `*` bullet vs `//` / `/*` runs (§6, §9c-iii, §10)
│   └── with-comments.tsx         §10 contrast — byte-identical to with-comments.md, `.tsx` ext
└── rejected/                     One source per rejected category (no `.md` — own ext accepted)
    ├── widget.ts   App.vue    theme.css   page.html   captions.vtt
    ├── data.json   intro.mp4  theme.mp3   font.woff2  doc.pdf
    └── sample.tex  refs.bib   diagram.eps
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `notes.md` | §2–§4, §7, §8, §9a | Primary paste/drop/picker/set-default target (root → `./src/…` paths) |
| `src/docs/intro.md` | §1, §2, §4, §7, §8 | Markdown source (`.md`) → fixed `[text](…)` link; single-variant picker; `.md → .md` fixed-style set-default |
| `src/images/logo.png` | §1, §2, §3, §4, §6, §7, §8, §9, §10 | Image source → `![alt-text](…)` styles; also the placement + edge + drop source; empty placeholder |
| `destinations/blank.md` | §6, §9c-i | Empty line 2 — `forced-cursor` setting-ignored (Top/Bottom/Cursor all → cursor line) |
| `destinations/indented.md` | §6, §9c-ii | Line 2 = six spaces — column follows the cursor/drop (col 6, NOT 0) |
| `destinations/with-comments.md` | §6, §9c-iii, §10 | markdown `*` bullet lands at it (content, not a comment); `//` / `/*` runs push above |
| `destinations/with-comments.tsx` | §10 | Byte-identical `.tsx` contrast — a leading `*` **is** a comment continuation (import pushed above) |
| `rejected/widget.ts` | §1, §9b | `.ts` reject; also drives the unsupported-pair drop (drop suppressed, no insert) |
| `rejected/App.vue` | §1 | `.vue` reject (`.svelte`/`.astro` reject identically) |
| `rejected/theme.css` | §1 | `.css` reject (`.scss` rejects identically — `.md` accepts **no** stylesheet) |
| `rejected/page.html` | §1 | `.html` reject |
| `rejected/captions.vtt` | §1 | `.vtt` reject (text-track rejected, unlike `.html`) |
| `rejected/data.json` | §1 | `.json` reject (`.yaml`/`.yml` reject identically) |
| `rejected/intro.mp4` | §1 | `.mp4` reject (video; `.webm`/`.mov` reject identically); empty placeholder |
| `rejected/theme.mp3` | §1 | `.mp3` reject (audio; `.ogg`/`.wav`/`.m4a` reject identically); empty placeholder |
| `rejected/font.woff2` | §1 | `.woff2` reject (`.woff`/`.ttf`/`.eot` reject identically); empty placeholder |
| `rejected/doc.pdf` | §1 | `.pdf` reject (document); empty placeholder |
| `rejected/sample.tex` | §1 | `.tex` reject (latex source) |
| `rejected/refs.bib` | §1 | `.bib` reject (bibliography source) |
| `rejected/diagram.eps` | §1 | `.eps` reject (LaTeX vector graphics) |