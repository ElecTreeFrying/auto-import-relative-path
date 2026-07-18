# qa/workspace/scss/CLAUDE.md

Fixtures for `checklists/scss.md` — the `.scss` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `scss.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `scss.md`.

## Layout

```
scss/
├── src/                          Primary sources + the paste/drop target
│   ├── main.scss                 Paste/drop/command target (tester types their own value position)
│   ├── theme.scss                Stylesheet source  → @use './theme';
│   ├── reset.css                 .css source        → @use './reset.css';  (one-way .css → .scss)
│   ├── abstracts/
│   │   └── _variables.scss       Partial — leading _ stripped → @use './abstracts/variables';
│   ├── _partials/
│   │   └── _colors.scss          Partial under a _-dir, last segment only → @use './_partials/colors';
│   └── images/
│       ├── logo.png              Image source → url('./images/logo.png')   (empty placeholder)
│       ├── icon.svg              Image source → url('./images/icon.svg')   (empty placeholder)
│       └── _icon.png             Image source → url('./images/_icon.png')  (leading _ NOT stripped; empty)
├── destinations/                 Pre-filled .scss placement targets (undo after each paste)
│   ├── empty.scss                Empty file (Bottom → line 1)
│   ├── with-imports.scss         @use + @forward (Bottom anchor / Top / Cursor content line)
│   ├── commented-imports.scss    Commented marker skipped; real @use anchors
│   ├── comments-only.scss        Only comments → no anchor, line 1
│   ├── multiline-comment.scss    /* */ block (Cursor adjusts above)
│   ├── single-comment.scss       Lone // line (Cursor inserts at it)
│   ├── comment-group.scss        // run (Cursor walks above the whole group)
│   └── commented-only.scss       Commented @use does not anchor Bottom
└── rejected/                     One source per rejected category (.tex/.bib/.eps carry a one-line header, the rest empty)
    ├── widget.ts   sibling.js    badge.jsx   panel.tsx   page.mdx
    ├── App.vue     App.svelte    App.astro   index.html  notes.md
    ├── clip.mp4    track.mp3     subs.vtt    data.json   config.yaml
    └── font.woff2  doc.pdf      sample.tex  refs.bib    diagram.eps
```

## Subdirectories

| Location | Purpose |
|----------|---------|
| `src/` | The paste/drop/command target (`main.scss`) plus the top-level sources: `theme.scss` (stylesheet → `@use`) and `reset.css` (`.css` → `@use`, the one-way `.css → .scss` accept). `.scss` has no smart-identifier detection, so — unlike `typescript/` — there are no `classes/` or `angular/` subtrees. |
| `src/abstracts/` | The `_variables.scss` partial — drives leading-`_` normalization (`_variables` → `variables`), with the `abstracts/` directory segment left intact. |
| `src/_partials/` | The `_colors.scss` partial under a `_`-prefixed **directory** — drives the last-segment-only strip: `_colors` → `colors`, but `_partials/` keeps its `_`. |
| `src/images/` | Image sources (`logo.png`, `icon.svg`, `_icon.png`) for the inline-`url()` arm. Empty placeholders — `.scss` keys on the extension, not bytes. `_icon.png` proves the `_`-strip does NOT apply to images. |
| `destinations/` | Pre-filled `.scss` targets for placement tests. Each has specific content (existing `@use`/`@forward`, comment blocks, comment runs) the checklist depends on. **Undo after each paste** so the file returns to its expected state. |
| `rejected/` | One source per rejected extension for allow-list gating tests. Content is irrelevant — only the extension matters. Most are empty 0-byte placeholders; the LaTeX-family rejects (`sample.tex`/`refs.bib`/`diagram.eps`) carry a one-line self-documenting header. |

## Fixture content expectations

- **Stylesheet sources (`theme.scss`, `reset.css`, `abstracts/_variables.scss`, `_partials/_colors.scss`)** — content is cosmetic (any valid SCSS/CSS); they are imported, never edited by a test. The snippet depends only on the path. `theme.scss` → `@use './theme';` (extension stripped); `reset.css` → `@use './reset.css';` (`.css` extension always kept, both toggles ignored).
- **`main.scss`** — the primary paste/drop/command target. The checklist does **not** pin its content (the tester types their own value position for the inline-`url()` cases, e.g. §2.2), so it holds a single self-documenting comment line. Pasting into it then undoing is the normal test cycle; keep it minimal so it never interferes with the Bottom/Top placement assertions.
- **`src/images/*`** — image sources; empty placeholders. `.scss` keys on the extension (`.png` / `.svg`), not the bytes; the generated `url('./images/…')` is identical regardless of content. `_icon.png` keeps its leading `_` (the image branch never normalizes).
- **`destinations/*.scss` targets** — content matters. `with-imports.scss` (`@use` + `@forward`), `commented-imports.scss` (a `// @use` above a real `@use`), `comments-only.scss` (only comments), `multiline-comment.scss` (`/* */` block), `single-comment.scss` (lone `//`), `comment-group.scss` (a `//` run), and `commented-only.scss` (a `// @use` that must NOT anchor Bottom) each drive specific placement cases. `empty.scss` is intentionally empty. Do not change them without updating the checklist.
- **`rejected/*`** — content is irrelevant; only the extension matters for gating. Most are empty placeholders; `sample.tex`/`refs.bib`/`diagram.eps` carry a one-line self-documenting header (the bytes are still irrelevant to gating).
