# 09 — Paste into `.scss` destination

Validates SCSS-snippet generation. SCSS supports four shapes (`@import`, `@import url()`, `@use`, `@use … as *;`), strips leading `_` from partial filenames, and **always** preserves `.css` on `.css` sources regardless of `preserveStylesheetFileExtension`.

**Sources:**
- `src/snippets/scss.ts` — snippet builder, `normalizePartialFilename`, `determineScssExtension`
- `src/snippets/css.ts` — image branch reuses `buildCssImageImportSnippet`
- `src/path/import-type.ts` — `.scss → null` so destination handler picks the SCSS-specific default branch
- `src/commands/paste-import.ts` — gating clause 6 (SCSS_SUPPORTED_EXTENSIONS)
- `src/constants/extensions.ts` — `SCSS_SUPPORTED_EXTENSIONS = .scss + .css + 5 images`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: `styles/main.scss`
- Default: `placement = Bottom`, `preserveStylesheetFileExtension = false`
- `scssImportStyle` = `@import '_relativePath_';` (style 0)

## Cross-import gating matrix

| Source | Expected |
|--------|----------|
| `styles/_partial.scss` | ✅ `@import` (with `_` stripped) |
| `styles/_variables.scss` | ✅ `@import` (with `_` stripped) |
| `styles/secondary.scss` | ✅ `@import` (no underscore) |
| `styles/global.css` | ✅ `@import` with `.css` always preserved |
| `styles/reset.css` | ✅ same |
| `assets/logo.png` | ✅ `url('./...')` (reuses CSS image snippet) |
| `assets/icon.gif` | ✅ `url(...)` |
| `assets/photo.jpeg` | ✅ `url(...)` |
| `assets/photo.jpg` | ✅ `url(...)` |
| `assets/thumb.webp` | ✅ `url(...)` |
| `src/foo.ts` | ❌ `Auto Import: Cannot import .ts into .scss files.` |
| `src/sibling.js` | ❌ `Auto Import: Cannot import .js into .scss files.` |
| `pages/index.html` | ❌ `Auto Import: Cannot import .html into .scss files.` |
| `docs/README.md` | ❌ `Auto Import: Cannot import .md into .scss files.` |
| `data/config.json` | ❌ `Auto Import: Cannot import .json into .scss files.` |
| `assets/font.woff2` | ❌ `Auto Import: Cannot import .woff2 into .scss files.` |
| `assets/icon.svg` | ❌ `Auto Import: Cannot import .svg into .scss files.` |

- [ ] All 17 cases match — both extensions appear verbatim in the parameterized toast.

## Style options — all 4 SCSS shapes

For each, set `auto-import.importStatement.styleSheet.scssImportStyle`, copy `styles/_partial.scss`, paste into `styles/main.scss`.

### Style 0 — `@import '_relativePath_';`
- [ ] Output: `@import './partial';` (leading `_` stripped from partial filename)

### Style 1 — `@import url('_relativePath_');`
- [ ] Output: `@import url('./partial');`

### Style 2 — `@use '_relativePath_';`
- [ ] Output: `@use './partial';`

### Style 3 — `@use '_relativePath_' as *;`  ⚡ FIXED (Bug #1)
- [ ] Output: `@use './partial' as *;` with cursor selecting `*` (placeholder default)
- [ ] **Trailing `;` is present**
- [ ] **`*` is the default placeholder value** (Tab confirms `*`)
- [ ] Type `prefix` then Tab → result: `@use './partial' as prefix;`

## Partial filename stripping (last segment only)

`normalizePartialFilename` strips a leading `_` ONLY from the last path segment.

- [ ] **Filename underscore.** `styles/_partial.scss` → path is `'./partial'` (stripped)
- [ ] **Variables.** `styles/_variables.scss` → `'./variables'`
- [ ] **No underscore.** `styles/secondary.scss` → `'./secondary'` (unchanged)
- [ ] **Nested partial.** `styles/_partials/_nested.scss` → `'./_partials/nested'`
  - Directory `_partials/` has its `_` PRESERVED (only filename `_nested` is stripped)
- [ ] **Nested non-partial filename.** Create `echo "" > styles/_partials/foo.scss`. Then `_partials/foo.scss` → `'./_partials/foo'`. Cleanup.

## `preserveStylesheetFileExtension` — asymmetric for `.css` sources

The setting governs `.scss` source behavior; `.css` is **always** preserved (Sass requires it for foreign-language imports).

### preserveStylesheetFileExtension = FALSE

- [ ] `.scss` source `_partial.scss` → `'./partial'` (no extension)
- [ ] `.css` source `global.css` → `'./global.css'` (.css PRESERVED — asymmetry)
- [ ] Image source `logo.png` → `'./assets/logo.png'` (always preserved)

### preserveStylesheetFileExtension = TRUE

- [ ] `.scss` source `_partial.scss` → `'./partial.scss'`
- [ ] `.css` source `global.css` → `'./global.css'` (still preserved — same as off)
- [ ] Image source `logo.png` → `'./assets/logo.png'` (unchanged)

## Image shape via `buildCssImageImportSnippet`

SCSS images reuse the CSS image snippet (`url('…')`) — there's no SCSS-specific image variant.

- [ ] `assets/logo.png` → `url('./assets/logo.png')` (when destination is `styles/main.scss`)
- [ ] `assets/icon.gif` → `url('./assets/icon.gif')`
- [ ] `scssImageImportStyle` setting in package.json exists for UI parity only — changing it has no runtime effect

## Forced-cursor placement override

SCSS destination + non-stylesheet source forces cursor placement (see `editor/insert-snippet.ts:shouldRepositionCursor` — `sourceFileExt !== '.scss' && destinationFileExt === '.scss'` → cursor; image source ≠ `.scss` ✓).

Wait — re-check: the rule is `sourceFileExt !== '.scss' && destinationFileExt === '.scss'`. So `.css` source also triggers cursor in `.scss` destination.

- [ ] **Image source forces cursor.** Set `placement = Top`. Copy `assets/logo.png` → place cursor at line 5 of `styles/main.scss` → paste.
  **Expect:** `url(...)` at line 5 (cursor), NOT line 0.
- [ ] **`.css` source forces cursor.** Set `placement = Top`. Copy `styles/global.css` → cursor at line 5 → paste.
  **Expect:** `@import` at line 5 (cursor override applies because `.css` ≠ `.scss`).
- [ ] **`.scss` source respects setting.** Set `placement = Top`. Copy `styles/_partial.scss` → paste into `styles/main.scss`.
  **Expect:** `@import './partial';` at line 0 (no override — same kind).

## Insertion column

`.scss` is in `STYLESHEET_FILE_EXTENSIONS` → forced column 0.

- [ ] Place cursor at column 10 of an indented line. Paste.
  **Expect:** snippet at column 0.

## Path computation

- [ ] **Same directory.** `styles/_partial.scss` → `styles/main.scss`. Path: `'./partial'`.
- [ ] **Cross directory.** `assets/logo.png` → `styles/main.scss`. Path: `'../assets/logo.png'`.
- [ ] **Deeply nested.** `styles/_partials/_nested.scss` → `styles/main.scss`. Path: `'./_partials/nested'`.
- [ ] **Reverse traversal.** Create `styles/_partials/inner.scss`. Copy `styles/main.scss` → paste into it. Path: `'../main'`.

## Edge cases

- [ ] **Self-import.** Copy `styles/main.scss`, paste into itself → `Auto Import: A file cannot import itself.`
- [ ] **Empty SCSS file.** Snippet at line 0.
- [ ] **`@use` with custom prefix retained on Tab.** Set style 3, copy `_partial.scss`, paste, type `vars`, Tab → result: `@use './partial' as vars;`

## Cleanup

```bash
rm -f styles/_partials/inner.scss
```

## Sign-off

- [ ] Cross-import matrix (17 cases)
- [ ] All 4 SCSS styles (Bug #1 verified at style 3)
- [ ] Partial filename stripping (5 cases)
- [ ] preserveStylesheetFileExtension off + asymmetric `.css` (3 cases)
- [ ] preserveStylesheetFileExtension on + asymmetric `.css` (3 cases)
- [ ] Image shape (3 cases)
- [ ] Forced-cursor override (3 cases)
- [ ] Insertion column (column 0)
- [ ] Path computation (4 cases)
- [ ] Edge cases

Tester / date: ___________________
