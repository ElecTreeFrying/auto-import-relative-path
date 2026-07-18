# qa/workspace/css/CLAUDE.md

Fixtures for `checklists/css.md` — the `.css` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `css.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `css.md`.

## Layout

```
css/
├── app.css                       Primary paste/drop target (background-image: slot = inline-url() spot)
├── theme.css                     Stylesheet source  → @import './theme.css';
├── logo.png                      Image source       → url('./logo.png')   (empty placeholder)
├── vendor/
│   └── normalize.css             Nested stylesheet source (basename-collapse demo)
├── placement/
│   ├── with-imports.css          @import + @import url() lines (Bottom anchor)
│   ├── with-comment-block.css    /* */ block (Cursor pushes import above it)
│   ├── widget.css                Stylesheet source for placement tests
│   └── with-use.css              @use line (shared stylesheet marker, §10.2)
└── rejects/                      One source per rejected category (.tex/.bib/.eps carry a one-line header, the rest empty)
    ├── styles.scss               stylesheet one-way reject (.scss → .css)
    ├── util.ts
    ├── widget.vue
    ├── page.html
    ├── notes.md
    ├── data.json
    ├── config.yaml
    ├── clip.mp4
    ├── chime.mp3
    ├── captions.vtt
    ├── body.woff2
    ├── manual.pdf
    ├── sample.tex               latex source reject
    ├── refs.bib                  bibliography reject
    └── diagram.eps               eps graphics reject
```

## Subdirectories

| Location | Purpose |
|----------|---------|
| (root) | The paste/drop target (`app.css`) plus the two top-level sources: `theme.css` (stylesheet → `@import`) and `logo.png` (image → inline `url()`). `.css` has no smart-identifier detection, so — unlike `typescript/` — there are no `classes/` or `angular/` subtrees. |
| `vendor/` | A nested stylesheet source (`normalize.css`) for the Pick-Style basename-collapse case (§7.2): the QuickPick label shows the basename while the inserted text uses the full relative path. |
| `placement/` | Pre-filled `.css` targets plus a source (`widget.css`) for placement tests. Each target has specific content (existing imports, a comment block, a `@use` line) the checklist depends on. **Undo after each paste** so the file returns to its expected state. |
| `rejects/` | One source per rejected extension for allow-list gating tests. Content is irrelevant — only the extension matters. Most are empty stubs; the `.tex`/`.bib`/`.eps` rejects carry a one-line self-documenting header naming the §1.2 case. `styles.scss` is mandatory: the one-way `.scss → .css` reject (SCSS imports CSS, but CSS rejects SCSS). |

## Fixture content expectations

- **Stylesheet sources (`theme.css`, `vendor/normalize.css`, `placement/widget.css`)** — content is cosmetic (any valid CSS); they are imported, never edited by a test. `.css` snippets have no tab stop and always keep the extension (`@import './theme.css';`, never `./theme`).
- **`app.css`** — the inline-`url()` target. The empty `background-image: ;` slot inside `.hero` is the exact cursor spot for §2.2 / §6.5 / §9.3 — preserve the single space before `;`.
- **`placement/*.css` targets** — content matters. `with-imports.css` (one quoted `@import`, one `@import url()`), `with-comment-block.css` (multi-line `/* */`), and `with-use.css` (a `@use` line) drive the Top/Bottom/Cursor and shared-marker cases. Do not change them without updating the checklist.
- **`logo.png`** — image source; an empty placeholder. `.css` keys on the `.png` extension, not the bytes; the generated `url('./logo.png')` is identical regardless of content.
- **`rejects/*`** — content is irrelevant; only the extension matters for gating. Most are empty stubs; `sample.tex`/`refs.bib`/`diagram.eps` carry a one-line self-documenting header.
