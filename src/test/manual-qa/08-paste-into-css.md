# 08 — Paste into `.css` destination

Validates CSS-snippet generation. CSS supports two `@import` shapes plus the `url('…')` image shape via `determineImportType`.

**Sources:**
- `src/snippets/languages/css.ts` — snippet builder + `buildCssImageImportSnippet`
- `src/path/import-type.ts` — `determineImportType` routes images vs stylesheets
- `src/commands/paste-import.ts` — gating clause 5 (CSS_SUPPORTED_EXTENSIONS)
- `src/constants/extensions.ts` — `CSS_SUPPORTED_EXTENSIONS = ['.css', ...IMAGE_FILE_EXTENSIONS]`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: `styles/global.css`
- Default: `placement = Bottom`, `preserveStylesheetFileExtension = false`
- `cssImportStyle` = `@import '_relativePath_';` (style 0)

## Cross-import gating matrix

`.css` is in `CROSS_IMPORT_DESTINATIONS`; allowed sources = `CSS_SUPPORTED_EXTENSIONS = .css + 7 images`.

| Source | Expected |
|--------|----------|
| `styles/reset.css` | ✅ `@import` shape |
| `assets/logo.png` | ✅ `url(...)` shape |
| `assets/icon.gif` | ✅ `url(...)` |
| `assets/photo.jpeg` | ✅ `url(...)` |
| `assets/photo.jpg` | ✅ `url(...)` |
| `assets/icon.svg` | ✅ `url(...)` |
| `assets/banner.avif` | ✅ `url(...)` |
| `assets/thumb.webp` | ✅ `url(...)` |
| `styles/main.scss` | ❌ `Auto Import: Cannot import .scss into .css files.` (`.scss` not in CSS_SUPPORTED) |
| `src/foo.ts` | ❌ `Auto Import: Cannot import .ts into .css files.` |
| `src/sibling.js` | ❌ `Auto Import: Cannot import .js into .css files.` |
| `pages/index.html` | ❌ `Auto Import: Cannot import .html into .css files.` |
| `docs/README.md` | ❌ `Auto Import: Cannot import .md into .css files.` |
| `data/config.json` | ❌ `Auto Import: Cannot import .json into .css files.` |
| `assets/font.woff2` | ❌ `Auto Import: Cannot import .woff2 into .css files.` |
| `unsupported/texture.bmp` | ❌ `Auto Import: Cannot import .bmp into .css files.` |

- [ ] All 16 cases match — both extensions appear verbatim in the parameterized toast.

## Style options — both CSS shapes

For each, set `auto-import.importStatement.styleSheet.cssImportStyle`, copy `styles/reset.css`, paste into `styles/global.css`.

### Style 0 — `@import '_relativePath_';`
- [ ] Output: `@import './reset';` (extension stripped per `preserveStylesheetFileExtension = false`)

### Style 1 — `@import url('_relativePath_');`
- [ ] Output: `@import url('./reset');`

## Image shape (single hardcoded snippet)

The `cssImageImportStyle` setting exists in `package.json` for UI parity but is unused at runtime (`buildCssImageImportSnippet` always emits `url(...)`). Verify:

- [ ] Copy `assets/logo.png` → paste into `styles/global.css`. **Expect:** `url('./assets/logo.png')` (always — ignoring the setting value).
- [ ] Try changing `cssImageImportStyle` (only one enum value `url('_relativePath_')` exists). Re-paste an image. **Expect:** identical output. Setting has no functional effect.

## `preserveStylesheetFileExtension` interaction

For `.css` source:
- [ ] **Off:** `@import './reset';` (no `.css`)
- [ ] **On:** `@import './reset.css';` (extension preserved)

For image sources, the extension is **always** preserved on the path:
- [ ] `assets/logo.png` → `url('./assets/logo.png')` regardless of setting

## Path computation

- [ ] **Same directory.** `styles/reset.css` → `styles/global.css`. Path is `'./reset'`.
- [ ] **Sibling directory.** `assets/logo.png` → `styles/global.css`. Path is `'../assets/logo.png'`.
- [ ] **Same directory image.** Create `cp assets/logo.png styles/local.png`. Copy `styles/local.png` → paste into `styles/global.css`. Path is `'./local.png'`. (Cleanup: `rm styles/local.png`.)

## Forced-cursor placement override

CSS destination + non-`.css` source forces cursor placement (see `editor/insert-snippet.ts:shouldRepositionCursor`).

- [ ] Set `placement = Top`. Copy `assets/logo.png` → place cursor at line 5 of `styles/global.css` → paste.
  **Expect:** `url(...)` snippet inserted at line 5 (cursor), NOT line 0 (Top).

- [ ] Set `placement = Top`. Copy `styles/reset.css` → paste into `styles/global.css`.
  **Expect:** `@import` snippet at line 0 (Top — same kind, no override).

## Insertion column

`.css` is in `STYLESHEET_FILE_EXTENSIONS` → forced column 0.

- [ ] Place cursor at column 10 of an indented line. Set `placement = Cursor`. Paste.
  **Expect:** snippet starts at **column 0**, not column 10.

## Edge cases

- [ ] **Self-import.** Open `styles/global.css`, copy itself, paste → `Auto Import: A file cannot import itself.`
- [ ] **Empty CSS file.** Create `touch styles/empty.css`. Paste into it. Snippet at line 0. Cleanup.

## Sign-off

- [ ] Cross-import matrix (14 cases)
- [ ] Both CSS styles
- [ ] Image shape (always `url`)
- [ ] preserveStylesheetFileExtension on/off (both source kinds)
- [ ] Path computation (3 cases)
- [ ] Forced-cursor override (2 cases)
- [ ] Insertion column (column 0)
- [ ] Edge cases

Tester / date: ___________________
