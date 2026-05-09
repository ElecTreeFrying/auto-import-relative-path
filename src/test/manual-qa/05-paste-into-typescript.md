# 05 — Paste into `.ts` destination (+ Angular naming suite)

Validates TS-snippet generation, `.ts`-as-destination gating, and the Angular PascalCase auto-naming at style index 1.

**Sources:**
- `src/snippets/typescript.ts` — snippet builder + `generateImportName`
- `src/commands/paste-import.ts` — gating
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
| `src/widget.tsx` | ❌ Not supported |
| `src/sibling.js` | ❌ Not supported |
| `src/badge.jsx` | ❌ Not supported |
| `styles/global.css` | ❌ Not supported |
| `styles/main.scss` | ❌ Not supported |
| `pages/index.html` | ❌ Not supported |
| `docs/README.md` | ❌ Not supported |
| `assets/logo.png` | ❌ Not supported |
| `data/config.json` | ❌ Not supported |
| `data/config.yaml` | ❌ Not supported |
| `assets/font.woff2` | ❌ Not supported |
| `assets/icon.svg` | ❌ Not supported |

- [ ] All 13 cases match.

## Style options — all 5 TS shapes

For each, set `auto-import.importStatement.script.typescriptImportStyle` to the value, then copy `src/foo.ts` and paste into `src/bar.ts`.

### Style 0 — `import name from '_relativePath_';`
- [ ] Output: `import $1 from './foo';`

### Style 1 — `import { name } from '_relativePath_';`  ★ Angular-aware
- [ ] Output (non-Angular `foo.ts`): `import { $1 } from './foo';` — placeholder, not auto-derived
- [ ] **The Angular suite below uses this style.**

### Style 2 — `import { default as name } from '_relativePath_';`  ⚡ FIXED
- [ ] Output: `import { default as $1 } from './foo';`
- [ ] `default` literal, single tabstop

### Style 3 — `import * as name from '_relativePath_';`
- [ ] Output: `import * as $1 from './foo';`

### Style 4 — `import '_relativePath_';`
- [ ] Output: `import './foo';`

## Angular naming suite (style 1, 5 conventions × 2 preserve states)

**Style:** `import { name } from '_relativePath_';`

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

### Non-Angular fallback (style 1, no auto-naming)

- [ ] `src/foo.ts` → `import { $1 } from './foo';` — `$1` placeholder, NOT `Foo`
- [ ] `src/helpers.ts` → `import { $1 } from './helpers';` — placeholder, NOT `Helpers`

### Other Angular cases (in src/, no subdirectory)

Create one quick test file:
```bash
echo 'export class TestComponent {}' > src/test.component.ts
```

- [ ] `src/test.component.ts` → `import { TestComponent } from './test.component';` (no preserve) — basename in same directory

(Cleanup: `rm src/test.component.ts` after.)

## Path computation

- [ ] **Same directory.** Copy `src/foo.ts` → paste into `src/bar.ts`. Path is `'./foo'`.
- [ ] **Sibling.** Copy `src/components/app-root.component.ts` → paste into `src/bar.ts`. Path is `'./components/app-root.component'`.
- [ ] **Parent traversal.** Copy `src/foo.ts` → paste into `src/components/app-root.component.ts`. Path is `'../foo'`.

## `preserveScriptFileExtension` independent interaction

- [ ] **Off:** non-Angular path is `'./foo'`
- [ ] **On:** non-Angular path is `'./foo.ts'`

## Edge cases

- [ ] **Empty `.ts` file.** Paste into `empty-file.ts`. Snippet inserted at line 0.

- [ ] **Self-import (case-insensitive).** Open `src/foo.ts`, copy `src/foo.ts`, paste. **Expect:** "Same file path." toast.

- [ ] **Comments-only file** (use `comments-only.ts`). Bottom placement → snippet lands AFTER the comment containing `import ` (heuristic limitation, not a bug).

## Sign-off

- [ ] Cross-import matrix (13 cases)
- [ ] All 5 style options
- [ ] Angular suite preserveScriptFileExtension=FALSE (5 cases)
- [ ] Angular suite preserveScriptFileExtension=TRUE (5 cases) — Bug #2 verified
- [ ] Non-Angular fallback (2 cases)
- [ ] Path computation (3 cases)
- [ ] Edge cases (3 cases)

Tester / date: ___________________
