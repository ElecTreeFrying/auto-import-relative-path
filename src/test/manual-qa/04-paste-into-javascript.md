# 04 — Paste into `.js` destination

Validates JS-snippet generation and `.js`-as-destination gating.

**Sources:**
- `src/snippets/javascript.ts` — snippet builder
- `src/commands/paste-import.ts` — gating
- `src/constants/extensions.ts` — `CROSS_IMPORT_DESTINATIONS` does NOT include `.js`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: open `src/other.js` for pasting tests below
- Default settings: `placement = Bottom`, `preserveScriptFileExtension = false`

## Cross-import gating matrix

`.js` is **not** in `CROSS_IMPORT_DESTINATIONS` → source extension MUST equal `.js`.

For each row, copy the source then paste into `src/other.js`:

| Source | Expected outcome |
|--------|------------------|
| `src/sibling.js` | ✅ JS-shape import inserted |
| `src/foo.ts` | ❌ "Auto Import Relative Path: Not supported." |
| `src/widget.tsx` | ❌ Not supported |
| `src/badge.jsx` | ❌ Not supported |
| `styles/global.css` | ❌ Not supported |
| `styles/main.scss` | ❌ Not supported |
| `pages/index.html` | ❌ Not supported |
| `docs/README.md` | ❌ Not supported |
| `assets/logo.png` | ❌ Not supported |
| `data/config.json` | ❌ Not supported |
| `data/config.yaml` | ❌ Not supported |
| `assets/font.woff2` | ❌ Not supported |
| `assets/icon.svg` | ❌ Not supported (unsupported extension) |

- [ ] All 13 cases match the expected outcome.

## Style options — all 9 JS shapes

For each, set `auto-import.importStatement.script.javascriptImportStyle` to the value, then copy `src/sibling.js` and paste into `src/other.js`. Verify the inserted snippet matches.

### Style 0 — `import name from '_relativePath_';`
- [ ] Output: `import $1 from './sibling';`
- [ ] Tab moves cursor to `$1` placeholder for the variable name

### Style 1 — `import { name } from '_relativePath_';`
- [ ] Output: `import { $1 } from './sibling';`

### Style 2 — `import { default as name } from '_relativePath_';`  ⚡ FIXED
- [ ] Output: `import { default as $1 } from './sibling';`
- [ ] Word `default` is literal (not a placeholder)
- [ ] Single tabstop after `as `

### Style 3 — `import * as name from '_relativePath_';`
- [ ] Output: `import * as $1 from './sibling';`

### Style 4 — `import '_relativePath_';`
- [ ] Output: `import './sibling';`
- [ ] No placeholder (side-effect-only import)

### Style 5 — `var name = require('_relativePath_');`
- [ ] Output: `var $1 = require('./sibling');`

### Style 6 — `const name = require('_relativePath_');`
- [ ] Output: `const $1 = require('./sibling');`

### Style 7 — `var name = import('_relativePath_');`
- [ ] Output: `var $1 = import('./sibling');`

### Style 8 — `const name = import('_relativePath_');`
- [ ] Output: `const $1 = import('./sibling');`

## Path computation

- [ ] **Same directory.** Copy `src/sibling.js` → paste into `src/other.js` (both in `src/`). Path is `'./sibling'` (with `./` prefix).

- [ ] **Subdirectory source.** Move `other.js` to a sibling location; copy `src/sibling.js` → paste into `src/components/other.js` (or similar). Path uses `../` for parent traversal.

## `preserveScriptFileExtension` interaction

- [ ] **Off (default):** path is `'./sibling'` (no extension)
- [ ] **On:** path is `'./sibling.js'` (extension preserved)

## Edge cases

- [ ] **Empty file destination.** Open `empty-file.ts` (rename it copy to `empty.js` if needed; or just verify Bottom placement falls through to line 0 in an empty `.js` file). **Expect:** snippet at line 0.

- [ ] **Comments-only file.** With placement = Bottom, paste into `comments-only.ts` (rename or use a `.js` equivalent). **Expect:** lands at line 0 (no `import` markers found). Document the well-known false-positive: a comment containing `// I want to import bar` causes Bottom to land AFTER that line — confirm this matches expected behavior.

## Sign-off

- [ ] Cross-import matrix (13 cases)
- [ ] All 9 style options
- [ ] Path computation (`./` and `../`)
- [ ] preserveScriptFileExtension on/off
- [ ] Edge cases

Tester / date: ___________________
