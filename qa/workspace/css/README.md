# qa/workspace/css/

Fixtures for the CSS destination checklist ([`checklists/css.md`](../../checklists/css.md)).

`.css` is the first **stylesheet** destination and the first **source-type-dispatched**
destination: a stylesheet source (`.css`) yields an `@import` statement, while an image
source yields an inline `url('…')`. It has **no** smart-identifier behavior
(`smartId: none`) — unlike [`typescript/`](../typescript/), there is no `src/classes/` or
`src/angular/` subtree, and no snippet has a tab stop. The unicode/space filename edge
cases are owned by [`general.md`](../../checklists/general.md) and are **not** duplicated
here. Every fixture below is referenced by `css.md`, so the directory is checklist↔workspace
1:1 with no orphans.

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
└── rejects/                      One source per rejected category (12 empty stubs)
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
    └── manual.pdf
```

## Fixture-to-checklist mapping

| Fixture | Section(s) | Purpose |
|---------|-----------|---------|
| `app.css` | §1–4, §6.5, §7, §8, §9.1–9.3 | Primary paste/drop target; the `background-image:` slot is the inline-`url()` spot |
| `theme.css` | §1.1, §2.1, §3.1, §4.1–4.2, §4.5, §7.1, §8.1, §9.1, §10.2 | Stylesheet source → `@import './theme.css';` |
| `logo.png` | §1.1, §2.2, §4.3, §6.5, §7.3, §8.3, §9.3, §10.1 | Image source → inline `url('./logo.png')` (empty placeholder) |
| `vendor/normalize.css` | §7.2 | Nested stylesheet source — basename collapse (label `normalize.css`, insert `./vendor/normalize.css`) |
| `placement/with-imports.css` | §6.1, §6.2 | Existing imports — Top inserts at line 0; Bottom anchors after the last import (`@import url()` form) |
| `placement/with-comment-block.css` | §6.3, §6.4, §9.4, §10.1 | `/* */` block — Cursor pushes `@import` above it; inline `url()` bypasses (§10.1) |
| `placement/widget.css` | §6.1–6.4, §9.4 | Stylesheet source for the placement tests |
| `placement/with-use.css` | §10.2 | `@use` line — shared stylesheet anchor (Bottom anchors after it) |
| `rejects/styles.scss` | §1.2, §1.3, §9.2 | Mandatory one-way `.scss → .css` reject (paste + drop) |
| `rejects/*` (12 files) | §1.2 | Every rejected category — warning toast, inserts nothing |

## File count

| Location | Files | Purpose |
|----------|-------|---------|
| (root) | 3 | `app.css` target + `theme.css` / `logo.png` sources |
| `vendor/` | 1 | Nested stylesheet source |
| `placement/` | 4 | Placement-test targets + source |
| `rejects/` | 12 | Non-importable sources for gating |
| **Total** | **20** |
