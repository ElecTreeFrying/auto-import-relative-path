# 07 — Paste into `.tsx` destination

Validates TSX-snippet generation. TSX uses `_shared.ts:buildReactImport` with **primary `[.ts, .tsx]` → TS snippet**, **fallback `[.js]` → JS snippet** (asymmetric vs JSX), plus the same hardcoded switch for non-script sources.

**Sources:**
- `src/snippets/tsx.ts` — calls `buildReactImport`
- `src/snippets/_shared.ts` — shared algorithm with primary + fallback
- `src/snippets/typescript.ts` — primary
- `src/snippets/javascript.ts` — fallback
- `src/constants/extensions.ts` — `.tsx` IS in `CROSS_IMPORT_DESTINATIONS`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: `src/widget.tsx`
- Default: `placement = Bottom`, `preserveScriptFileExtension = false`
- `typescriptImportStyle` = `import { name } from '_relativePath_';` (style 1)
- `javascriptImportStyle` = `import name from '_relativePath_';` (style 0)

## Primary script sources → TS snippet

| Source | Expected (style 1, non-Angular) |
|--------|----------------------------------|
| `src/foo.ts` | `import { $1 } from './foo';` (TS shape) |
| Create `echo "" > src/widget2.tsx` then `src/widget2.tsx` → | `import { $1 } from './widget2';` |

- [ ] `.ts` source → TS snippet
- [ ] `.tsx` source → TS snippet

## Fallback script source → JS snippet (asymmetric vs JSX)

This is the key TSX rule: a `.js` source dropped into a `.tsx` destination produces a **JS-shaped** import, not a TS-shaped one.

- [ ] `src/sibling.js` → `import $1 from './sibling';` (JS style 0 — NOT TS style 1)

## `.jsx` source → REJECTED

`.jsx` is in neither primary nor fallback for TSX. Falls through `_shared.ts` switch default → empty → "Not supported".

- [ ] `src/badge.jsx` → "Not supported."

## Angular naming applies for `.ts`/`.tsx` sources

Style 1 with Angular conventions:

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
Create `echo 'export class TestComponent {}' > src/test.component.tsx` and verify:

- [ ] `src/test.component.tsx` → `import { TestComponent } from './test.component';` (no preserve) or `import { TestComponent } from './test.component.tsx';` (preserve on)

(Cleanup: `rm src/test.component.tsx`)

## Non-script sources → hardcoded switch

Same as JSX (since `_shared.ts` is shared):

### Image sources → default-import
- [ ] `assets/logo.png` → `import name$1 from './assets/logo.png';`
- [ ] `assets/icon.gif` → `import name$1 from './assets/icon.gif';`
- [ ] `assets/photo.jpeg` → `import name$1 from './assets/photo.jpeg';`
- [ ] `assets/photo.jpg` → `import name$1 from './assets/photo.jpg';`
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

### Unsupported → REJECTED
- [ ] `assets/icon.svg` → "Not supported."

## Style propagation

`.ts`/`.tsx` sources delegate to `buildTypeScriptImportSnippet` → all 5 TS styles must propagate:

- [ ] TS Style 0 → `import $1 from './foo';`
- [ ] TS Style 1 → `import { $1 } from './foo';` (non-Angular)
- [ ] TS Style 2 → `import { default as $1 } from './foo';` ⚡ FIXED
- [ ] TS Style 3 → `import * as $1 from './foo';`
- [ ] TS Style 4 → `import './foo';`

`.js` source delegates to `buildJavaScriptImportSnippet` → all 9 JS styles must propagate:

- [ ] JS Style 0 → `import $1 from './sibling';`
- [ ] JS Style 1 → `import { $1 } from './sibling';`
- [ ] JS Style 2 → `import { default as $1 } from './sibling';` ⚡ FIXED
- [ ] JS Style 3 → `import * as $1 from './sibling';`
- [ ] JS Style 4 → `import './sibling';`
- [ ] JS Style 5 → `var $1 = require('./sibling');`
- [ ] JS Style 6 → `const $1 = require('./sibling');`
- [ ] JS Style 7 → `var $1 = import('./sibling');`
- [ ] JS Style 8 → `const $1 = import('./sibling');`

## `preserveScriptFileExtension` propagation

For script sources only:
- [ ] `.ts` source: `'./foo'` off, `'./foo.ts'` on
- [ ] `.tsx` source: `'./widget2'` off, `'./widget2.tsx'` on
- [ ] `.js` source (fallback): `'./sibling'` off, `'./sibling.js'` on

For non-script sources, extension always preserved regardless of setting:
- [ ] `assets/logo.png` → always `'./assets/logo.png'`

## Edge cases

- [ ] **Self-import.** Open `src/widget.tsx`, copy itself, paste → "Same file path."
- [ ] **Empty `.tsx` file.** Snippet at line 0.

## Cleanup

```bash
rm -f src/widget2.tsx src/test.component.tsx
```

## Sign-off

- [ ] Primary script sources (2)
- [ ] Fallback `.js` → JS snippet (1)
- [ ] `.jsx` source rejected (1)
- [ ] Angular suite (5 conventions × 2 preserve states + 1 .tsx case)
- [ ] Non-script sources (15 cases)
- [ ] All 5 TS + all 9 JS styles propagate
- [ ] preserveScriptFileExtension across script and non-script
- [ ] Edge cases

Tester / date: ___________________
