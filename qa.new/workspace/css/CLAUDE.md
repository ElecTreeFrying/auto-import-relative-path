# qa.new/workspace/css/CLAUDE.md

Fixtures for `checklists/css.md` — the `.css` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `css.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `css.md`.

## Subdirectories

| Location | Purpose |
|----------|---------|
| (root) | The paste/drop target (`app.css`) plus the two top-level sources: `theme.css` (stylesheet → `@import`) and `logo.png` (image → inline `url()`). `.css` has no smart-identifier detection, so — unlike `typescript/` — there are no `classes/` or `angular/` subtrees. |
| `vendor/` | A nested stylesheet source (`normalize.css`) for the Pick-Style basename-collapse case (§7.2): the QuickPick label shows the basename while the inserted text uses the full relative path. |
| `placement/` | Pre-filled `.css` targets plus a source (`widget.css`) for placement tests. Each target has specific content (existing imports, a comment block, a `@use` line) the checklist depends on. **Undo after each paste** so the file returns to its expected state. |
| `rejects/` | One source per rejected extension (12 files) for allow-list gating tests. Content is irrelevant — only the extension matters. All are empty placeholders. `styles.scss` is mandatory: the one-way `.scss → .css` reject (SCSS imports CSS, but CSS rejects SCSS). |

## Fixture content expectations

- **Stylesheet sources (`theme.css`, `vendor/normalize.css`, `placement/widget.css`)** — content is cosmetic (any valid CSS); they are imported, never edited by a test. `.css` snippets have no tab stop and always keep the extension (`@import './theme.css';`, never `./theme`).
- **`app.css`** — the inline-`url()` target. The empty `background-image: ;` slot inside `.hero` is the exact cursor spot for §2.2 / §6.5 / §9.3 — preserve the single space before `;`.
- **`placement/*.css` targets** — content matters. `with-imports.css` (one quoted `@import`, one `@import url()`), `with-comment-block.css` (multi-line `/* */`), and `with-use.css` (a `@use` line) drive the Top/Bottom/Cursor and shared-marker cases. Do not change them without updating the checklist.
- **`logo.png`** — image source; an empty placeholder. `.css` keys on the `.png` extension, not the bytes; the generated `url('./logo.png')` is identical regardless of content.
- **`rejects/*`** — content is irrelevant; only the extension matters for gating. All are empty placeholders.
