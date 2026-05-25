# 07 — Paste into `.tsx` destination

Validates TSX-snippet generation. TSX uses `_react.ts:buildReactImport` with **primary `[.ts, .tsx]` → TS snippet**, **fallback `[.js]` → JS snippet** (asymmetric vs JSX), plus the same hardcoded switch for non-script sources.

**Sources:**
- `src/snippets/languages/tsx.ts` — calls `buildReactImport`
- `src/snippets/_react.ts` — shared algorithm with primary + fallback
- `src/snippets/languages/typescript.ts` — primary
- `src/snippets/languages/javascript.ts` — fallback
- `src/constants/extensions.ts` — `.tsx` IS in `CROSS_IMPORT_DESTINATIONS`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: `src/widget.tsx`
- Default: `placement = Bottom`, `preserveScriptFileExtension = false`
- `typescriptImportStyle` = `import { name } from '_relativePath_';` (style 0)
- `javascriptImportStyle` = `import name from '_relativePath_';` (style 0)

## Primary script sources → TS snippet

| Source | Expected (style 0, non-Angular) |
|--------|----------------------------------|
| `src/foo.ts` | `import { $1 } from './foo';` (TS shape) |
| `src/components/Button.tsx` | `import { $1 } from './components/Button';` (TS shape — `Button` is non-Angular, so `$1` placeholder, not auto-derived) |

- [ ] `.ts` source → TS snippet
- [ ] `.tsx` source → TS snippet

## Fallback script source → JS snippet (asymmetric vs JSX)

This is the key TSX rule: a `.js` source dropped into a `.tsx` destination produces a **JS-shaped** import, not a TS-shaped one.

- [ ] `src/sibling.js` → `import $1 from './sibling';` (JS style 0 — NOT TS style 0)

## `.jsx` source → REJECTED

`.jsx` is in neither primary nor fallback for TSX. Falls through `_react.ts` switch default → empty → `'not-supported'` toast (parameterized).

- [ ] `src/badge.jsx` → `Auto Import: Cannot import .jsx into .tsx files.`

## Angular naming applies for `.ts`/`.tsx` sources

Style 0 with Angular conventions:

### preserveScriptFileExtension = FALSE
- [ ] `src/components/app-root.component.ts` → `import { AppRootComponent } from './components/app-root.component';`
- [ ] `src/components/auth.module.ts` → `import { AuthModule } from './components/auth.module';`
- [ ] `src/components/highlight.directive.ts` → `import { HighlightDirective } from './components/highlight.directive';`
- [ ] `src/components/trim.pipe.ts` → `import { TrimPipe } from './components/trim.pipe';`
- [ ] `src/components/user.service.ts` → `import { UserService } from './components/user.service';`

### preserveScriptFileExtension = TRUE  ⚡ FIXED (Bug #2)
- [ ] `src/components/app-root.component.ts` → `import { AppRootComponent } from './components/app-root.component.ts';` (NOT `AppRootComponentTs`)
- [ ] (Repeat for module/directive/pipe/service — verify no `Ts` suffix)

### .tsx source with Angular convention

The workspace ships `src/components/test.component.tsx` (Angular-style class in a TSX file). Copy it → paste into `src/widget.tsx`:

- [ ] `src/components/test.component.tsx` → `import { TestComponent } from './components/test.component';` (preserve OFF) — Angular auto-naming applies because the basename matches `.component.*` regardless of source extension.
- [ ] Toggle preserve ON, repeat: `import { TestComponent } from './components/test.component.tsx';`

## Non-script sources → hardcoded switch

Same as JSX (since `_react.ts` is shared):

### Image sources → default-import
- [ ] `assets/logo.png` → `import name$1 from './assets/logo.png';`
- [ ] `assets/icon.gif` → `import name$1 from './assets/icon.gif';`
- [ ] `assets/photo.jpeg` → `import name$1 from './assets/photo.jpeg';`
- [ ] `assets/photo.jpg` → `import name$1 from './assets/photo.jpg';`
- [ ] `assets/icon.svg` → `import name$1 from './assets/icon.svg';`
- [ ] `assets/banner.avif` → `import name$1 from './assets/banner.avif';`
- [ ] `assets/thumb.webp` → `import name$1 from './assets/thumb.webp';`

### Data / markup / YAML → default-import
- [ ] `data/config.json` → `import name$1 from './data/config.json';`
- [ ] `pages/index.html` → `import name$1 from './pages/index.html';`
- [ ] `data/config.yaml` → `import name$1 from './data/config.yaml';`
- [ ] `data/locale.yml` → `import name$1 from './data/locale.yml';`
- [ ] `docs/README.md` → `import name$1 from './docs/README.md';`

### Font → side-effect
- [ ] `assets/font.woff2` → `import './assets/font.woff2';`
- [ ] `assets/regular.ttf` → `import './assets/regular.ttf';`

### Stylesheet → side-effect
- [ ] `styles/global.css` → `import './styles/global.css';`
- [ ] `styles/main.scss` → `import './styles/main.scss';`

### Media sources → url-import
- [ ] `assets/media/clip.mp4` → `import url$1 from './assets/media/clip.mp4';`
- [ ] `assets/media/song.mp3` → `import url$1 from './assets/media/song.mp3';`
- [ ] `assets/media/captions.vtt` → `import url$1 from './assets/media/captions.vtt';`

### Unsupported → REJECTED
- [ ] `unsupported/texture.bmp` → `Auto Import: Cannot import .bmp into .tsx files.`

## Style propagation

`.ts`/`.tsx` sources delegate to `buildTypeScriptImportSnippet` → all 7 TS styles must propagate:

- [ ] TS Style 0 → `import { $1 } from './foo';` (non-Angular, `$1` placeholder)
- [ ] TS Style 1 → `import $1 from './foo';`
- [ ] TS Style 2 → `import * as $1 from './foo';`
- [ ] TS Style 3 → `import './foo';`
- [ ] TS Style 4 → `import type { $1 } from './foo';`
- [ ] TS Style 5 → `import { $1, type $2 } from './foo';`
- [ ] TS Style 6 → `const $1 = await import('./foo');`

`.js` source delegates to `buildJavaScriptImportSnippet` → all 7 JS styles must propagate:

- [ ] JS Style 0 → `import $1 from './sibling';`
- [ ] JS Style 1 → `import { $1 } from './sibling';`
- [ ] JS Style 2 → `import $1, { $2 } from './sibling';`
- [ ] JS Style 3 → `import * as $1 from './sibling';`
- [ ] JS Style 4 → `import './sibling';`
- [ ] JS Style 5 → `const $1 = require('./sibling');`
- [ ] JS Style 6 → `const $1 = await import('./sibling');`

## `preserveScriptFileExtension` propagation

For script sources only:
- [ ] `.ts` source (`src/foo.ts` → `src/widget.tsx`): `'./foo'` off, `'./foo.ts'` on
- [ ] `.tsx` source (`src/components/Button.tsx` → `src/widget.tsx`): `'./components/Button'` off, `'./components/Button.tsx'` on
- [ ] `.js` source (`src/sibling.js` → `src/widget.tsx`, fallback): `'./sibling'` off, `'./sibling.js'` on

For non-script sources, extension always preserved regardless of setting:
- [ ] `assets/logo.png` → `src/widget.tsx`: always `'./assets/logo.png'`

## Edge cases

- [ ] **Self-import.** Open `src/widget.tsx`, copy itself, paste → `Auto Import: A file cannot import itself.`
- [ ] **Empty `.tsx` file.** Construct on the fly: `touch src/empty.tsx` at the workspace root, open it, paste → snippet at line 0. Cleanup: `rm src/empty.tsx`.

## Cleanup

No persistent fixtures to remove — `src/components/Button.tsx` and `src/components/test.component.tsx` are baseline workspace fixtures.

## Sign-off

- [ ] Primary script sources (2)
- [ ] Fallback `.js` → JS snippet (1)
- [ ] `.jsx` source rejected (1)
- [ ] Angular suite (5 conventions × 2 preserve states + 1 .tsx case)
- [ ] Non-script sources (15 cases)
- [ ] All 7 TS + all 7 JS styles propagate
- [ ] preserveScriptFileExtension across script and non-script
- [ ] Edge cases

Tester / date: ___________________
