# TypeScript (`.ts` destination) — QA Checklist

TypeScript-specific manual QA: gating, import styles, smart identifiers, placement, path computation, style pickers, and drag-and-drop.

> **Prerequisite:** Run the [General checklist](general.md) first. It covers shared infrastructure (copy command, clipboard validation, same-file rejection, notifications, edge cases) that this checklist assumes has already passed.

**Sources under test:**

- `src/snippets/languages/typescript.ts` — snippet builder, Angular PascalCase, 7 style indexes
- `src/snippets/_class-name.ts` — exported class detection (regex + comment stripping)
- `src/snippets/_styles.ts` — `TYPESCRIPT_IMPORT_OPTIONS` (7 entries)
- `src/snippets/variants.ts` — QuickPick variant aggregator (reads exported class name for `.ts`)
- `src/gating.ts` — `isPairSupported` (same-extension bypass; `.ts` not in `CROSS_IMPORT_DESTINATIONS`)
- `src/commands/paste-import.ts` — Paste as Import command (insertion path)
- `src/commands/copy-paste.ts` — Insert Import from Selected File (sequential copy + paste)
- `src/commands/paste-import-with-style.ts` — Paste as Import (Pick Style) command
- `src/commands/set-default-import-style.ts` — Set Default Import Style command
- `src/drop/provider.ts` — `AutoImportOnDropProvider` (drag-and-drop import)
- `src/editor/insert-snippet.ts` — insertion orchestrator (Top / Bottom / Cursor)
- `src/editor/placement.ts` — placement helpers (Bottom scan, comment-block adjustment)
- `src/config/settings.ts` — `getAutoImportSetting` / `setAutoImportSetting`

---

## Prerequisites

- Extension Development Host launched (F5)
- QA workspace open as a folder — open `qa.new/workspace/` in the EDH via **File > Open Folder**
- Default settings restored: `importStatementPlacement = "Bottom"`, `preserveScriptFileExtension = false`, `typescriptImportStyle = "import { name } from '_relativePath_';"`

### How to change extension settings

1. Open VS Code Settings: <kbd>Cmd</kbd>+<kbd>,</kbd> (macOS) or <kbd>Ctrl</kbd>+<kbd>,</kbd> (Windows/Linux).
2. In the left sidebar, scroll down and expand **Extensions**.
3. Click **Auto Import Relative Path** — the extension's settings appear in the main panel.

The three settings used in this checklist:

| Setting label in UI | Type | Default |
|---|---|---|
| Typescript Import Style | dropdown | `import { name } from '_relativePath_';` |
| Preserve Script File Extension | checkbox | unchecked (`false`) |
| Import Statement Placement | dropdown | `Bottom` |

**Workspace layout** — see [`workspace/README.md`](../workspace/README.md) for the full fixture map. Key directories:

| Directory | What's inside |
|-----------|---------------|
| `typescript/src/` | Primary `.ts` sources and destinations (`foo.ts`, `bar.ts`, `helpers.ts`) |
| `typescript/src/angular/` | Angular-convention `.ts` files WITHOUT `export class` |
| `typescript/src/classes/` | `.ts` files WITH `export class` declarations |
| `typescript/src/components/`, `typescript/src/utils/` | Nested directories for path-computation tests |
| `typescript/destinations/` | Pre-filled `.ts` files for placement tests (undo after each test) |
| `typescript/rejected/` | 20 non-`.ts` files for gating rejection tests |
| `typescript/edge-cases/` | Unicode filenames, spaces in paths |
| `typescript/Makefile` | No-extension file for copy/Alt+D rejection |

---

## 1 — Cross-import gating matrix

`.ts` is **not** in `CROSS_IMPORT_DESTINATIONS` — source extension must equal `.ts`. Every other extension is rejected.

For each row: copy the source file from the listed workspace path, paste into `typescript/src/bar.ts`.

| # | Source (workspace path) | Expected |
|---|------------------------|----------|
| 1.1 | `typescript/src/foo.ts` | Pass — TS import inserted |
| 1.2 | `typescript/rejected/widget.tsx` | `Auto Import: Cannot import .tsx into .ts files.` |
| 1.3 | `typescript/rejected/sibling.js` | `Auto Import: Cannot import .js into .ts files.` |
| 1.4 | `typescript/rejected/badge.jsx` | `Auto Import: Cannot import .jsx into .ts files.` |
| 1.5 | `typescript/rejected/global.css` | `Auto Import: Cannot import .css into .ts files.` |
| 1.6 | `typescript/rejected/main.scss` | `Auto Import: Cannot import .scss into .ts files.` |
| 1.7 | `typescript/rejected/index.html` | `Auto Import: Cannot import .html into .ts files.` |
| 1.8 | `typescript/rejected/notes.md` | `Auto Import: Cannot import .md into .ts files.` |
| 1.9 | `typescript/rejected/logo.png` | `Auto Import: Cannot import .png into .ts files.` |
| 1.10 | `typescript/rejected/config.json` | `Auto Import: Cannot import .json into .ts files.` |
| 1.11 | `typescript/rejected/config.yaml` | `Auto Import: Cannot import .yaml into .ts files.` |
| 1.12 | `typescript/rejected/font.woff2` | `Auto Import: Cannot import .woff2 into .ts files.` |
| 1.13 | `typescript/rejected/icon.svg` | `Auto Import: Cannot import .svg into .ts files.` |
| 1.14 | `typescript/rejected/video.mp4` | `Auto Import: Cannot import .mp4 into .ts files.` |
| 1.15 | `typescript/rejected/audio.mp3` | `Auto Import: Cannot import .mp3 into .ts files.` |
| 1.16 | `typescript/rejected/subs.vtt` | `Auto Import: Cannot import .vtt into .ts files.` |
| 1.17 | `typescript/rejected/doc.pdf` | `Auto Import: Cannot import .pdf into .ts files.` |
| 1.18 | `typescript/rejected/page.mdx` | `Auto Import: Cannot import .mdx into .ts files.` |
| 1.19 | `typescript/rejected/App.vue` | `Auto Import: Cannot import .vue into .ts files.` |
| 1.20 | `typescript/rejected/App.svelte` | `Auto Import: Cannot import .svelte into .ts files.` |
| 1.21 | `typescript/rejected/App.astro` | `Auto Import: Cannot import .astro into .ts files.` |

- [ ] 1.1 passes (import generated)
- [ ] 1.2 through 1.21 all show the exact warning toast with both extensions in the message
- [ ] Each rejected toast has a **View Supported Files** button that opens the GitHub README section

---

## 2 — Paste as Import — happy path (`Cmd+I` / `Ctrl+I`)

Use `typescript/src/foo.ts` as source, `typescript/src/bar.ts` as destination. Default style (index 0).

- [ ] Copy `typescript/src/foo.ts` (`Cmd+Shift+A`), open `typescript/src/bar.ts`, press `Cmd+I`
- [ ] Import inserted: `import { $1 } from './foo';` (or with detected class name — see section 5)
- [ ] Cursor lands on the `$1` tab stop inside the curly braces
- [ ] Import is at column 0
- [ ] Trailing newline appended after the import line

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Click `typescript/src/foo.ts` in the Explorer with `typescript/src/bar.ts` open in the editor
- [ ] Press `Alt+D`
- [ ] Import is inserted into `typescript/src/bar.ts` — same result as Copy + Paste

---

## 4 — All 7 TypeScript import styles

For each style: open the extension settings (see [How to change extension settings](#how-to-change-extension-settings)) and select the listed value from the **Typescript Import Style** dropdown. Then copy `typescript/src/foo.ts` and paste into `typescript/src/bar.ts`. Undo (`Cmd+Z`) after each test.

`typescript/src/foo.ts` is a plain file with NO `export class` and NO Angular suffix (tests the bare tab-stop behavior).

### Style 0 — `import { name } from '_relativePath_';` (default)

- [ ] Output: `import { $1 } from './foo';`
- [ ] Cursor lands on `$1` inside the curly braces (empty tab stop)
- [ ] Tab out completes the snippet

### Style 1 — `import name from '_relativePath_';`

- [ ] Output: `import $1 from './foo';`
- [ ] Cursor lands on `$1`

### Style 2 — `import * as name from '_relativePath_';`

- [ ] Output: `import * as $1 from './foo';`
- [ ] Cursor lands on `$1` after `as`

### Style 3 — `import '_relativePath_';`

- [ ] Output: `import './foo';`
- [ ] No tab stop (side-effect import), cursor lands after the semicolon

### Style 4 — `import type { name } from '_relativePath_';`

- [ ] Output: `import type { $1 } from './foo';`
- [ ] Cursor lands on `$1` inside the curly braces

### Style 5 — `import { name, type Type } from '_relativePath_';`

- [ ] Output: `import { $1, type $2 } from './foo';`
- [ ] Cursor lands on `$1` (value binding)
- [ ] Tab advances to `$2` (type binding)
- [ ] Two distinct tab stops

### Style 6 — `const name = await import('_relativePath_');`

- [ ] Output: `const $1 = await import('./foo');`
- [ ] Cursor lands on `$1`

---

## 5 — Exported class detection (style 0 only, `.ts` destination only)

Style must be set to index 0 (`import { name } from '_relativePath_';`).

### 5.1 — `export class`

- [ ] Copy `typescript/src/classes/event-bus.ts` (contains `export class EventBus { }`)
- [ ] Paste into `typescript/src/bar.ts` → `import { ${1:EventBus} } from './classes/event-bus';`
- [ ] Tab stop is pre-filled with `EventBus` (editable — type over to rename)

### 5.2 — `export abstract class`

- [ ] Copy `typescript/src/classes/base-service.ts` (contains `export abstract class BaseService { }`)
- [ ] Paste into `typescript/src/bar.ts` → `import { ${1:BaseService} } from './classes/base-service';`
- [ ] Pre-filled with `BaseService`

### 5.3 — Commented-out export class (false positive prevention)

- [ ] Copy `typescript/src/classes/commented-class.ts` (contains `// export class FakeClass { }`)
- [ ] Paste into `typescript/src/bar.ts` → `import { $1 } from './classes/commented-class';`
- [ ] Tab stop is empty (NOT pre-filled with `FakeClass`)

### 5.4 — Block-commented export class

- [ ] Copy `typescript/src/classes/block-commented-class.ts` (contains `/* export class FakeClass { } */`)
- [ ] Paste into `typescript/src/bar.ts` → `import { $1 } from './classes/block-commented-class';`
- [ ] Tab stop is empty

### 5.5 — Multiple exported classes

- [ ] Copy `typescript/src/classes/multi-class.ts` (contains `export class First` and `export class Second`)
- [ ] Paste into `typescript/src/bar.ts` → pre-filled with `First` (only the first match is used)

### 5.6 — Export class takes priority over Angular naming

- [ ] Copy `typescript/src/classes/app-root.component.ts` (contains `export class AppRoot { }`)
- [ ] Paste into `typescript/src/bar.ts` → `import { ${1:AppRoot} } from './classes/app-root.component';`
- [ ] Pre-filled with `AppRoot` (class detection), NOT `AppRootComponent` (Angular PascalCase)

### 5.7 — No export class in Angular file falls through to Angular naming

- [ ] Copy `typescript/src/angular/user.service.ts` (does NOT contain any `export class`)
- [ ] Paste into `typescript/src/bar.ts` → `import { UserService } from './angular/user.service';`
- [ ] Pre-filled with `UserService` (Angular PascalCase)

### 5.8 — `export default class` (NOT detected)

- [ ] Copy `typescript/src/classes/default-class.ts` (contains `export default class Widget { }`)
- [ ] Paste into `typescript/src/bar.ts` → `import { $1 } from './classes/default-class';`
- [ ] Tab stop is empty (NOT pre-filled with `Widget` — style 0 is a named import, not a default import)

### 5.9 — Detection only applies to `.ts` destinations

- [ ] Copy `typescript/src/classes/event-bus.ts` (contains `export class EventBus { }`)
- [ ] Paste into a `.tsx` file → `import { $1 } from './event-bus';` (NOT pre-filled — class detection is `.ts`-only)

---

## 6 — Angular legacy PascalCase auto-fill (style 0 only)

Style must be set to index 0. Source files must NOT contain `export class` (otherwise class detection takes priority per section 5).

### 6.1 — `.component` suffix

- [ ] Copy `typescript/src/angular/app-root.component.ts` → paste into `typescript/src/bar.ts`
- [ ] Output: `import { AppRootComponent } from './angular/app-root.component';`

### 6.2 — `.directive` suffix

- [ ] Copy `typescript/src/angular/highlight.directive.ts` → paste into `typescript/src/bar.ts`
- [ ] Output: `import { HighlightDirective } from './angular/highlight.directive';`

### 6.3 — `.pipe` suffix

- [ ] Copy `typescript/src/angular/trim.pipe.ts` → paste into `typescript/src/bar.ts`
- [ ] Output: `import { TrimPipe } from './angular/trim.pipe';`

### 6.4 — `.service` suffix

- [ ] Copy `typescript/src/angular/user.service.ts` → paste into `typescript/src/bar.ts`
- [ ] Output: `import { UserService } from './angular/user.service';`

### 6.5 — `.module` suffix

- [ ] Copy `typescript/src/angular/auth.module.ts` → paste into `typescript/src/bar.ts`
- [ ] Output: `import { AuthModule } from './angular/auth.module';`

### 6.6 — Non-Angular file (no suffix match)

- [ ] Copy `typescript/src/foo.ts` (no Angular suffix) → paste into `typescript/src/bar.ts`
- [ ] Output: `import { $1 } from './foo';` (bare tab stop, NOT `Foo`)

### 6.7 — Non-Angular file `helpers.ts`

- [ ] Copy `typescript/src/helpers.ts` → paste into `typescript/src/bar.ts`
- [ ] Output: `import { $1 } from './helpers';` (bare tab stop, NOT `Helpers`)

### 6.8 — Angular naming with `preserveScriptFileExtension = false`

- [ ] In the extension settings (see [How to change extension settings](#how-to-change-extension-settings)), confirm the **Preserve Script File Extension** checkbox is unchecked
- [ ] Copy `typescript/src/angular/app-root.component.ts` → paste into `typescript/src/bar.ts`
- [ ] Path is `'./angular/app-root.component'` (extension stripped)
- [ ] Identifier is `AppRootComponent` (NOT `AppRootComponentTs`)

### 6.9 — Angular naming with `preserveScriptFileExtension = true`

- [ ] In the extension settings, check the **Preserve Script File Extension** checkbox
- [ ] Copy `typescript/src/angular/app-root.component.ts` → paste into `typescript/src/bar.ts`
- [ ] Path is `'./angular/app-root.component.ts'` (extension preserved)
- [ ] Identifier is STILL `AppRootComponent` (NOT `AppRootComponentTs`)

### 6.10 — Same-directory Angular naming

- [ ] Copy `typescript/src/angular/auth.module.ts` → paste into `typescript/src/angular/dest.ts` (same directory)
- [ ] Path starts with `'./auth.module'` (same-dir `./` prefix)
- [ ] Identifier is `AuthModule`

---

## 7 — Placement modes

### 7.1 — Bottom placement (default: `importStatementPlacement = "Bottom"`)

#### 7.1.1 — Empty file

- [ ] Copy `typescript/src/foo.ts`, paste into `typescript/destinations/empty.ts`
- [ ] Import inserted at line 0

#### 7.1.2 — File with existing imports

- [ ] Open `typescript/destinations/with-imports.ts`:
  ```ts
  import { foo } from '../src/foo';
  import { bar } from '../src/bar';

  export const x = 1;
  ```
- [ ] Copy `typescript/src/foo.ts`, paste → import inserted on line 2 (after `import { bar }`, before the blank line)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 7.1.3 — File with `require()` import

- [ ] Open `typescript/destinations/with-require.ts`:
  ```ts
  export const fs = require('fs');
  ```
- [ ] Copy `typescript/src/foo.ts`, paste → import inserted on line 1 (after the `require(` line)

#### 7.1.4 — File with comments containing `import` keyword

- [ ] Open `typescript/destinations/commented-imports.ts`:
  ```ts
  // import { bar } from '../src/bar';
  import { foo } from '../src/foo';
  ```
- [ ] The commented line is skipped — import inserted on line 1 (after the real import, NOT after the comment)

#### 7.1.5 — File with only comments

- [ ] Open `typescript/destinations/comments-only.ts`:
  ```ts
  // This file has no imports
  /* Just comments */
  ```
- [ ] No import marker found → import inserted at line 0

#### 7.1.6 — Column is always 0

- [ ] Regardless of cursor position, import is inserted at column 0 (leftmost)

### 7.2 — Top placement (`importStatementPlacement = "Top"`)

- [ ] In the extension settings (see [How to change extension settings](#how-to-change-extension-settings)), set **Import Statement Placement** to `Top`

#### 7.2.1 — File with existing imports

- [ ] Open `typescript/destinations/with-imports.ts`:
  ```ts
  import { foo } from '../src/foo';
  import { bar } from '../src/bar';

  export const x = 1;
  ```
- [ ] Copy `typescript/src/foo.ts`, paste → import inserted at line 0 (before `import { foo }`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 7.2.2 — Empty file

- [ ] Copy `typescript/src/foo.ts`, paste into `typescript/destinations/empty.ts` → import at line 0

#### 7.2.3 — Column is always 0

- [ ] Import inserted at column 0 regardless of cursor

### 7.3 — Cursor placement (`importStatementPlacement = "Cursor"`)

- [ ] In the extension settings, set **Import Statement Placement** to `Cursor`

#### 7.3.1 — Cursor on a blank line

- [ ] Open `typescript/destinations/with-imports.ts`:
  ```ts
  import { foo } from '../src/foo';
  import { bar } from '../src/bar';

  export const x = 1;
  ```
- [ ] Place cursor on line 2 (the blank line), copy `typescript/src/foo.ts`, paste → import inserted at line 2
- [ ] Undo (`Cmd+Z`) to restore the file

#### 7.3.2 — Cursor at end of file

- [ ] Open `typescript/destinations/with-imports.ts`, place cursor on the last line
- [ ] Copy `typescript/src/foo.ts`, paste → import at cursor line
- [ ] Undo (`Cmd+Z`) to restore the file

#### 7.3.3 — Cursor inside a multi-line comment block

- [ ] Open `typescript/destinations/multiline-comment.ts`:
  ```ts
  import { foo } from '../src/foo';

  /*
   * Some documentation
   * about this module
   */
  export const x = 1;
  ```
- [ ] Place cursor on line 4 (inside the `/* */` block), paste
- [ ] Import is adjusted ABOVE the comment block (line 2), NOT at line 4

#### 7.3.4 — Cursor on a `//` comment line within a comment group

- [ ] Open `typescript/destinations/comment-group.ts`:
  ```ts
  // Line one of comment
  // Line two of comment
  // Line three of comment
  ```
- [ ] Place cursor on line 1, paste → import adjusted to line 0 (above the comment block)

#### 7.3.5 — Cursor on a non-comment line

- [ ] Open `typescript/destinations/with-imports.ts`, place cursor on line 3 (`export const x = 1;`)
- [ ] Copy `typescript/src/foo.ts`, paste → import inserted at line 3
- [ ] Undo (`Cmd+Z`) to restore the file

#### 7.3.6 — Column is always 0

- [ ] Even with cursor at column 20, import inserts at column 0

#### 7.3.7 — Cursor on a single isolated `//` comment (not a group)

- [ ] Open `typescript/destinations/single-comment.ts`:
  ```ts
  import { foo } from '../src/foo';

  // standalone note

  export const x = 1;
  ```
- [ ] Place cursor on line 2 (`// standalone note`), paste
- [ ] Import inserted at line 2 (AT the comment, pushing it to line 3 — unlike a comment group where the import moves above the block)
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 8 — Paste as Import (Pick Style) command

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast. Universal QuickPick mechanics (escape, filter, clipboard validation, no setting change) are covered by [general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics).

### 8.1 — QuickPick shows all 7 TS styles

- [ ] Copy a `.ts` source, run Paste as Import (Pick Style) in a `.ts` destination
- [ ] QuickPick appears with placeholder text: `Select an import style`
- [ ] 7 items listed, one per TypeScript import style
- [ ] Each item has a label (the snippet preview using basename) and a description/tag

### 8.2 — Selecting a style inserts the import

- [ ] Select `import type { name } from '_relativePath_';` from the picker
- [ ] Verify: `import type { $1 } from './foo';` is inserted

### 8.3 — Exported class detection in picker

- [ ] Source file contains `export class EventBus { }`
- [ ] Open picker → the style 0 label shows `import { EventBus } from 'event-bus';`
- [ ] Other styles show `import name from 'event-bus';` (using `name` placeholder)

---

## 9 — Set Default Import Style command

Run via Command Palette: `Auto Import: Set Default Import Style`. Universal QuickPick mechanics (checkmark, escape, filter, clipboard validation, no insert) are covered by [general.md §10](general.md#10--set-default-import-style--universal-mechanics).

### 9.1 — Selecting a TS style persists to global settings

- [ ] Copy a `.ts` source, run Set Default Import Style in a `.ts` destination
- [ ] Select `import type { name } from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import type { name } from '_relativePath_';`
- [ ] Check VS Code Settings → `typescriptImportStyle` is now `import type { name } from '_relativePath_';`

### 9.2 — Reset default back to style 0

- [ ] Select `import { name } from '_relativePath_';` to restore the original default

---

## 10 — Drag-and-drop

Drag a file from the Explorer sidebar into an open `.ts` editor. Universal DnD behaviors (same-file rejection, notification non-clearing) are covered by [general.md §8](general.md#8--drag-and-drop-universal-behaviors).

### 10.1 — Happy path (`.ts` → `.ts`)

- [ ] Drag `typescript/src/foo.ts` from Explorer into `typescript/src/bar.ts` editor
- [ ] Import snippet is inserted using the default TypeScript style
- [ ] Placement follows the `importStatementPlacement` setting (same as paste)

### 10.2 — Unsupported pair (`.js` → `.ts`)

- [ ] Drag `typescript/rejected/sibling.js` from Explorer into `typescript/src/bar.ts`
- [ ] Warning toast: `Auto Import: Cannot import .js into .ts files.`
- [ ] No import inserted (drop edit returns null)

### 10.3 — Placement with Bottom mode

- [ ] In the extension settings (see [How to change extension settings](#how-to-change-extension-settings)), set **Import Statement Placement** to `Bottom` (the default)
- [ ] Open `typescript/destinations/with-imports.ts` (has existing imports)
- [ ] Drag `typescript/src/foo.ts` → import lands after the last existing import line

### 10.4 — Placement with Top mode

- [ ] In the extension settings, set **Import Statement Placement** to `Top`
- [ ] Drag `typescript/src/foo.ts` into `typescript/destinations/with-imports.ts` → import lands at line 0

### 10.5 — Placement with Cursor mode

- [ ] In the extension settings, set **Import Statement Placement** to `Cursor`
- [ ] Drag `typescript/src/foo.ts` → drop position determines the insertion line

#### 10.5.1 — Drop onto a single `//` comment line

- [ ] Ensure **Import Statement Placement** is still set to `Cursor`
- [ ] Open `typescript/destinations/single-comment.ts`
- [ ] Drag `typescript/src/foo.ts` and drop onto line 2 (`// standalone note`)
- [ ] Import inserted at line 2 (at the comment, pushing it down — same as paste Cursor behavior)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 10.5.2 — Drop into a multi-line comment block

- [ ] Ensure **Import Statement Placement** is still set to `Cursor`
- [ ] Open `typescript/destinations/multiline-comment.ts`
- [ ] Drag `typescript/src/foo.ts` and drop onto line 4 (inside the `/* */` block)
- [ ] Import is adjusted ABOVE the comment block (line 2) — same as paste Cursor behavior (§7.3.3)
- [ ] Undo (`Cmd+Z`) to restore the file

### 10.6 — Column is always 0

- [ ] Even if the drop position is mid-line, import inserts at column 0

### 10.7 — Exported class detection applies

- [ ] Drag `typescript/src/classes/event-bus.ts` (contains `export class EventBus`) into `typescript/src/bar.ts`
- [ ] Import is `import { ${1:EventBus} } from './classes/event-bus';`

### 10.8 — Angular naming applies

- [ ] Drag `typescript/src/angular/user.service.ts` (no `export class`) into `typescript/src/bar.ts`
- [ ] Import is `import { UserService } from './angular/user.service';`

### 10.9 — `preserveScriptFileExtension` respected

- [ ] In the extension settings, check the **Preserve Script File Extension** checkbox
- [ ] Drag `typescript/src/foo.ts` into `typescript/src/bar.ts` → path is `'./foo.ts'`
- [ ] In the extension settings, uncheck the **Preserve Script File Extension** checkbox to restore the default

---

## 11 — Edge cases

### 11.1 — Empty `.ts` file

- [ ] Copy `typescript/src/foo.ts`, paste into `typescript/destinations/empty.ts` → import at line 0

### 11.2 — File with only whitespace

- [ ] Copy `typescript/src/foo.ts`, paste into `typescript/destinations/whitespace-only.ts` → import at line 0 (no import markers found)

### 11.3 — Large file (500+ lines)

- [ ] Copy `typescript/src/foo.ts`, paste into `typescript/destinations/large-file.ts` (520 lines, imports at top)
- [ ] Bottom mode still finds the last import correctly (inserts on line 4, after the three imports)

### 11.4 — Import inside a string literal (Bottom mode)

- [ ] Open `typescript/destinations/string-with-import.ts`:
  ```ts
  export const msg = "you should import this";
  ```
- [ ] Bottom mode: the string `import ` inside a string literal IS detected as an import marker (known heuristic limitation — not a bug)

### 11.5 — File with mixed import styles (Bottom mode)

- [ ] Open `typescript/destinations/mixed-imports.ts`:
  ```ts
  import { foo } from '../src/foo';
  export const fs = require('fs');

  export const x = 1;
  ```
- [ ] Bottom mode: import inserted on line 2 (after the `require(` line, which is the last import marker)

---

## Sign-off

- [ ] Cross-import gating (21 cases)
- [ ] Paste as Import — happy path (1 case)
- [ ] Insert Import from Selected File (1 case)
- [ ] All 7 import styles (7 cases)
- [ ] Exported class detection (9 cases)
- [ ] Angular legacy PascalCase (10 cases)
- [ ] Placement — Bottom (6 cases)
- [ ] Placement — Top (3 cases)
- [ ] Placement — Cursor (7 cases)
- [ ] Paste as Import (Pick Style) (3 cases)
- [ ] Set Default Import Style (2 cases)
- [ ] Drag-and-drop (11 cases)
- [ ] Edge cases (5 cases)

**Total: ~86 test cases**
