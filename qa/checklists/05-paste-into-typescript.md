# 05 — Paste into `.ts` destination (+ Angular naming suite)

Validates TS-snippet generation, `.ts`-as-destination gating, and the Angular PascalCase auto-naming at style index 0.

**Sources:**
- `src/snippets/languages/typescript.ts` — snippet builder + `generateAngularLegacyImportName`
- `src/gating.ts` — isPairSupported (same-extension bypass)
- `src/constants/extensions.ts` — `.ts` NOT in `CROSS_IMPORT_DESTINATIONS`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: open `src/bar.ts` for paste tests
- Default: `placement = Bottom`, `preserveScriptFileExtension = false`

## Cross-import gating matrix

`.ts` is **not** in `CROSS_IMPORT_DESTINATIONS` → source must equal `.ts`.

| Source | Expected |
|--------|----------|
| `src/foo.ts` | ✅ TS import |
| `src/widget.tsx` | ❌ `Auto Import: Cannot import .tsx into .ts files.` |
| `src/sibling.js` | ❌ `Auto Import: Cannot import .js into .ts files.` |
| `src/badge.jsx` | ❌ `Auto Import: Cannot import .jsx into .ts files.` |
| `styles/global.css` | ❌ `Auto Import: Cannot import .css into .ts files.` |
| `styles/main.scss` | ❌ `Auto Import: Cannot import .scss into .ts files.` |
| `pages/index.html` | ❌ `Auto Import: Cannot import .html into .ts files.` |
| `docs/README.md` | ❌ `Auto Import: Cannot import .md into .ts files.` |
| `assets/logo.png` | ❌ `Auto Import: Cannot import .png into .ts files.` |
| `data/config.json` | ❌ `Auto Import: Cannot import .json into .ts files.` |
| `data/config.yaml` | ❌ `Auto Import: Cannot import .yaml into .ts files.` |
| `assets/font.woff2` | ❌ `Auto Import: Cannot import .woff2 into .ts files.` |
| `assets/icon.svg` | ❌ `Auto Import: Cannot import .svg into .ts files.` (`.ts` not in CROSS_IMPORT_DESTINATIONS, source ≠ dest) |

- [ ] All 13 cases match — both extensions appear verbatim in the parameterized toast.

## Style options — all 7 TS shapes

For each, set `auto-import.importStatement.script.typescriptImportStyle` to the value, then copy `src/foo.ts` and paste into `src/bar.ts`.

### Style 0 — `import { name } from '_relativePath_';`  ★ Angular-aware
- [ ] Output (non-Angular `foo.ts`): `import { $1 } from './foo';` — placeholder, not auto-derived
- [ ] **The Angular suite below uses this style.**

### Style 1 — `import name from '_relativePath_';`
- [ ] Output: `import $1 from './foo';`

### Style 2 — `import * as name from '_relativePath_';`
- [ ] Output: `import * as $1 from './foo';`

### Style 3 — `import '_relativePath_';`
- [ ] Output: `import './foo';`

### Style 4 — `import type { name } from '_relativePath_';`
- [ ] Output: `import type { $1 } from './foo';`

### Style 5 — `import { name, type Type } from '_relativePath_';`
- [ ] Output: `import { $1, type $2 } from './foo';`
- [ ] Two tabstops: `$1` for the value import, `$2` for the type import

### Style 6 — `const name = await import('_relativePath_');`
- [ ] Output: `const $1 = await import('./foo');`

## Angular naming suite (style 0, 5 conventions × 2 preserve states)

**Style:** `import { name } from '_relativePath_';` (style 0 — the Angular-aware named import)

### preserveScriptFileExtension = FALSE

For each, copy → paste into `src/bar.ts`:

- [ ] `src/components/app-root.component.ts` → `import { AppRootComponent } from './components/app-root.component';`
- [ ] `src/components/auth.module.ts` → `import { AuthModule } from './components/auth.module';`
- [ ] `src/components/highlight.directive.ts` → `import { HighlightDirective } from './components/highlight.directive';`
- [ ] `src/components/trim.pipe.ts` → `import { TrimPipe } from './components/trim.pipe';`
- [ ] `src/components/user.service.ts` → `import { UserService } from './components/user.service';`

### preserveScriptFileExtension = TRUE  ⚡ FIXED (Bug #2)

- [ ] `src/components/app-root.component.ts` → `import { AppRootComponent } from './components/app-root.component.ts';`
  - **NOT** `AppRootComponentTs`
- [ ] `src/components/auth.module.ts` → `import { AuthModule } from './components/auth.module.ts';` — NOT `AuthModuleTs`
- [ ] `src/components/highlight.directive.ts` → `import { HighlightDirective } from './components/highlight.directive.ts';` — NOT `HighlightDirectiveTs`
- [ ] `src/components/trim.pipe.ts` → `import { TrimPipe } from './components/trim.pipe.ts';` — NOT `TrimPipeTs`
- [ ] `src/components/user.service.ts` → `import { UserService } from './components/user.service.ts';` — NOT `UserServiceTs`

### Non-Angular fallback (style 0, no auto-naming)

- [ ] `src/foo.ts` → `import { $1 } from './foo';` — `$1` placeholder, NOT `Foo`
- [ ] `src/helpers.ts` → `import { $1 } from './helpers';` — placeholder, NOT `Helpers`

### Same-directory Angular naming (no path traversal)

Auto-naming is keyed off the basename, so it must work the same with `'./X'` as with `'./components/X'`. Verify by pasting two Angular components in the same directory:

- [ ] `src/components/auth.module.ts` → paste into `src/components/app-root.component.ts`. **Expect:** `import { AuthModule } from './auth.module';` — `'./auth.module'` (same dir, no `components/` segment), but identifier is still `AuthModule`.
- [ ] `src/components/user.service.ts` → paste into `src/components/app-root.component.ts`. **Expect:** `import { UserService } from './user.service';`

## Path computation

- [ ] **Same directory.** Copy `src/foo.ts` → paste into `src/bar.ts`. Path is `'./foo'`.
- [ ] **Sibling.** Copy `src/components/app-root.component.ts` → paste into `src/bar.ts`. Path is `'./components/app-root.component'`.
- [ ] **Parent traversal.** Copy `src/foo.ts` → paste into `src/components/app-root.component.ts`. Path is `'../foo'`.

## `preserveScriptFileExtension` independent interaction

- [ ] **Off:** non-Angular path is `'./foo'`
- [ ] **On:** non-Angular path is `'./foo.ts'`

## Edge cases

- [ ] **Empty `.ts` file.** Paste into `empty-file.ts`. Snippet inserted at line 0.

- [ ] **Self-import (case-insensitive).** Open `src/foo.ts`, copy `src/foo.ts`, paste. **Expect:** warning toast `Auto Import: A file cannot import itself.`.

- [ ] **Comments-only file** (use `comments-only.ts`). Bottom placement → snippet lands AFTER the comment containing `import ` (heuristic limitation, not a bug).

## Sign-off

- [ ] Cross-import matrix (13 cases)
- [ ] All 7 style options
- [ ] Angular suite preserveScriptFileExtension=FALSE (5 cases)
- [ ] Angular suite preserveScriptFileExtension=TRUE (5 cases) — Bug #2 verified
- [ ] Non-Angular fallback (2 cases)
- [ ] Path computation (3 cases)
- [ ] Edge cases (3 cases)

Tester / date: ___________________
