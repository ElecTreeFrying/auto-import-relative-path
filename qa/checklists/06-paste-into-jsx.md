# 06 — Paste into `.jsx` destination

Validates JSX-snippet generation. JSX uses `_react.ts:buildReactImport` with **primary `[.js, .jsx]` → JS snippet**, **no fallback**, and a hardcoded switch for non-script sources.

**Sources:**
- `src/snippets/languages/jsx.ts` — calls `buildReactImport`
- `src/snippets/_react.ts` — the shared algorithm
- `src/snippets/languages/javascript.ts` — primary script-snippet builder
- `src/constants/extensions.ts` — `.jsx` IS in `CROSS_IMPORT_DESTINATIONS` (cross-import allowed)

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: `src/badge.jsx`
- Default: `placement = Bottom`, `preserveScriptFileExtension = false`
- `javascriptImportStyle` = `import name from '_relativePath_';` (style 0)

## Cross-import gating matrix

JSX is in `CROSS_IMPORT_DESTINATIONS` → many sources allowed; the per-extension `_react.ts` switch decides shape.

For each source, copy → paste into `src/badge.jsx`. Verify the snippet shape AND that gating doesn't reject.

### Primary script sources → JS snippet

| Source | Expected snippet (style 0 default) |
|--------|-------------------------------------|
| `src/sibling.js` | `import $1 from './sibling';` |
| `src/badge.jsx` | (same-file → `Auto Import: A file cannot import itself.`) — covered by the self-import edge case at the bottom |
| `src/components/Layout.jsx` | `import $1 from './components/Layout';` |

- [ ] `.js` source → JS snippet (style 0)
- [ ] `.jsx` source → JS snippet (style 0)

### TypeScript sources → REJECTED

JSX has no TS handling. `.ts`/`.tsx` sources fall through to `_react.ts` switch's `default:` branch → empty snippet → `paste-import.ts` clauses 7/8 → `'not-supported'` toast (parameterized with the actual extensions).

- [ ] `src/foo.ts` source → `Auto Import: Cannot import .ts into .jsx files.`
- [ ] `src/widget.tsx` source → `Auto Import: Cannot import .tsx into .jsx files.`

### Non-script sources → hardcoded switch

#### Image sources → default-import shape

- [ ] `assets/logo.png` → `import name$1 from './assets/logo.png';`
- [ ] `assets/icon.gif` → `import name$1 from './assets/icon.gif';`
- [ ] `assets/photo.jpeg` → `import name$1 from './assets/photo.jpeg';`
- [ ] `assets/photo.jpg` → `import name$1 from './assets/photo.jpg';`
- [ ] `assets/icon.svg` → `import name$1 from './assets/icon.svg';`
- [ ] `assets/banner.avif` → `import name$1 from './assets/banner.avif';`
- [ ] `assets/thumb.webp` → `import name$1 from './assets/thumb.webp';`

#### Data / markup / YAML sources → default-import shape

- [ ] `data/config.json` → `import name$1 from './data/config.json';`
- [ ] `pages/index.html` → `import name$1 from './pages/index.html';`
- [ ] `data/config.yaml` → `import name$1 from './data/config.yaml';`
- [ ] `data/locale.yml` → `import name$1 from './data/locale.yml';`
- [ ] `docs/README.md` → `import name$1 from './docs/README.md';`

#### Font sources → side-effect import

- [ ] `assets/font.woff2` → `import './assets/font.woff2';`
- [ ] `assets/regular.ttf` → `import './assets/regular.ttf';`

(If you have `.woff` or `.eot` fixtures, add: `touch assets/legacy.woff assets/legacy.eot` and verify each emits a side-effect `import '...';`.)

#### Stylesheet sources → side-effect import

- [ ] `styles/global.css` → `import './styles/global.css';`
- [ ] `styles/main.scss` → `import './styles/main.scss';`

#### Media sources → url-import shape

- [ ] `assets/media/clip.mp4` → `import url$1 from './assets/media/clip.mp4';`
- [ ] `assets/media/song.mp3` → `import url$1 from './assets/media/song.mp3';`
- [ ] `assets/media/captions.vtt` → `import url$1 from './assets/media/captions.vtt';`

### Unsupported sources → REJECTED

- [ ] `unsupported/texture.bmp` → `Auto Import: Cannot import .bmp into .jsx files.` (`.bmp` not in any list, falls through `_react.ts` `default:` → empty snippet → clause 8)

## Style propagation from `javascriptImportStyle`

JSX's `.js`/`.jsx` source delegates to `buildJavaScriptImportSnippet`. Verify all 7 JS styles propagate:

For each, set `javascriptImportStyle`, then copy `src/components/Layout.jsx` → paste into `src/badge.jsx`:

- [ ] Style 0 → `import $1 from './components/Layout';`
- [ ] Style 1 → `import { $1 } from './components/Layout';`
- [ ] Style 2 → `import $1, { $2 } from './components/Layout';`
- [ ] Style 3 → `import * as $1 from './components/Layout';`
- [ ] Style 4 → `import './components/Layout';`
- [ ] Style 5 → `const $1 = require('./components/Layout');`
- [ ] Style 6 → `const $1 = await import('./components/Layout');`

## `preserveScriptFileExtension` propagation

For `.js`/`.jsx` sources only (the script paths use the setting; non-script sources always preserve their extension):

- [ ] **Off (default):** path is `'./sibling'` (no `.js`)
- [ ] **On:** path is `'./sibling.js'`

For non-script sources (image/data/font/markup), the extension is **always** preserved on the path regardless of this setting. Verify:

- [ ] `assets/logo.png` always emits `'./assets/logo.png'` (extension preserved)
- [ ] Setting toggle does NOT affect image/font/markup paths

## Edge cases

- [ ] **Empty file destination.** Create a temporary empty JSX: `touch src/empty.jsx` at the workspace root, open it, paste a JSX import → snippet at line 0. **Cleanup:** `rm src/empty.jsx`.
- [ ] **Self-import.** Open `src/badge.jsx`, copy itself, paste → `Auto Import: A file cannot import itself.`

## Cleanup

No persistent fixtures to remove — the only construct-on-fly file (`src/empty.jsx`) is cleaned up inline above. Existing JSX fixtures (`src/badge.jsx`, `src/components/Layout.jsx`, etc.) stay in place for future runs.

## Sign-off

- [ ] Primary script sources (2)
- [ ] TypeScript rejection (2)
- [ ] Image sources (7)
- [ ] Data/markup/YAML (5)
- [ ] Media sources (3)
- [ ] Font sources (2+)
- [ ] Stylesheet sources (2)
- [ ] Unsupported source (1)
- [ ] All 7 JS styles propagate
- [ ] preserveScriptFileExtension on/off (script vs non-script)

Tester / date: ___________________
