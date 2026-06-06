# qa/workspace/scss/

Fixtures for the SCSS destination checklist ([`checklists/scss.md`](../../checklists/scss.md)).

`.scss` is a **stylesheet** destination and a **source-type-dispatched** destination: a
stylesheet source (`.scss` or `.css`) yields a `@use` / `@forward` / `@import` statement, while
an image source yields an inline `url('…')`. It has **no** smart-identifier behavior
(`smartId: none`) — unlike [`typescript/`](../typescript/), there is no `src/classes/` or
`src/angular/` subtree, and only the two `as`-alias styles carry a tab stop. The unicode/space
filename edge cases are owned by [`general.md`](../../checklists/general.md) and are **not**
duplicated here. Every fixture below is referenced by `scss.md`, so the directory is
checklist↔workspace 1:1 with no orphans.

Unlike [`css/`](../css/) (a `root + vendor/ + placement/ + rejects/` tree), this workspace
follows `scss.md`'s own prerequisites table — a `src/`-based layout — because the checklist
drives the workspace 1:1. The nested partial directories (`abstracts/`, `_partials/`) exercise
SCSS's partial-`_` normalization.

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
└── rejected/                     One source per rejected category (17 empty stubs)
    ├── widget.ts   sibling.js    badge.jsx   panel.tsx   page.mdx
    ├── App.vue     App.svelte    App.astro   index.html  notes.md
    ├── clip.mp4    track.mp3     subs.vtt    data.json   config.yaml
    └── font.woff2  doc.pdf
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `src/main.scss` | §1–4, §7, §9, §10 | Primary paste/drop/command target (content not pinned by the checklist) |
| `src/theme.scss` | §1.1, §2.1, §3, §4, §6, §9.1/9.3/9.4/9.5, §10.3 | Stylesheet source → `@use './theme';` (extension stripped) |
| `src/reset.css` | §1.2, §4.C | `.css` source → `@use './reset.css';` (extension always kept) |
| `src/abstracts/_variables.scss` | §4.A, §4.B, §7.2, §9.7, §9.8 | Partial — leading `_` stripped, `abstracts/` segment kept |
| `src/_partials/_colors.scss` | §10.1 | Last-segment-only `_` strip — `_partials/` dir keeps its `_` |
| `src/images/logo.png` | §1.3, §2.2, §4-image, §6.4, §7.3, §9.6 | Image source → inline `url('./images/logo.png')` (empty) |
| `src/images/icon.svg` | §1.4 | Image accept row (`.svg`) → `url('./images/icon.svg')` (empty) |
| `src/images/_icon.png` | §10.2 | Image leading `_` NOT normalized → `url('./images/_icon.png')` (empty) |
| `destinations/empty.scss` | §6.1.1 | Empty file — Bottom inserts at line 1 |
| `destinations/with-imports.scss` | §6.1.2, §6.2.1, §6.3.4, §9.3, §9.4 | `@use`+`@forward` — Bottom / Top / Cursor anchors |
| `destinations/commented-imports.scss` | §6.1.3 | Commented `// @use` skipped; real `@use` anchors |
| `destinations/comments-only.scss` | §6.1.4 | Only comments → no marker, line 1 |
| `destinations/multiline-comment.scss` | §6.3.1, §9.5.2 | `/* */` block — Cursor adjusts above |
| `destinations/single-comment.scss` | §6.3.2, §9.5.1 | Lone `//` — Cursor inserts at the line |
| `destinations/comment-group.scss` | §6.3.3 | `//` run — Cursor walks above the whole group |
| `destinations/commented-only.scss` | §10.3 | Commented `@use` does not anchor Bottom |
| `rejected/*` (17 files) | §1.5–§1.21, §9.2 | Every rejected category — warning toast, inserts nothing (`App.vue` also drives DnD §9.2) |

## File count

| Location | Files | Purpose |
|----------|-------|---------|
| `src/` (root) | 3 | `main.scss` target + `theme.scss` / `reset.css` sources |
| `src/abstracts/` | 1 | Partial — leading-`_` normalization |
| `src/_partials/` | 1 | Partial under a `_`-prefixed directory |
| `src/images/` | 3 | Image sources (inline `url()`) |
| `destinations/` | 8 | Placement-test targets |
| `rejected/` | 17 | Non-importable sources for gating |
| **Total** | **33** |
