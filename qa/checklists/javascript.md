# JavaScript (`.js` destination) — QA Checklist

JavaScript-specific manual QA: gating, import styles, placement, style pickers, and drag-and-drop. `.js` has **no** smart-identifier behavior, so the import name is always a bare `$1` (see §5).

> **Prerequisite:** Run the [General checklist](general.md) first. It covers shared infrastructure (copy command, clipboard validation, same-file rejection, notifications, path computation, edge cases) that this checklist assumes has already passed.

**Sources under test:**

- `src/snippets/languages/javascript.ts` — snippet builder, 7 style indexes, config-drift `default:` arm (style 0)
- `src/snippets/_styles.ts` — `JAVASCRIPT_IMPORT_OPTIONS` (7 entries)
- `src/snippets/variants.ts` — QuickPick variant aggregator (basename label vs full-path insertion; all 7 styles configurable)
- `src/gating.ts` — `isPairSupported` (same-extension bypass; `.js` not in `CROSS_IMPORT_DESTINATIONS`)
- `src/commands/paste-import.ts` — Paste as Import command (insertion path)
- `src/commands/copy-paste.ts` — Insert Import from Selected File (sequential copy + paste)
- `src/commands/paste-import-with-style.ts` — Paste as Import (Pick Style) command
- `src/commands/set-default-import-style.ts` — Set Default Import Style command
- `src/drop/provider.ts` — `AutoImportOnDropProvider` (drag-and-drop import; registered for `scheme:'file'` only)
- `src/editor/insert-snippet.ts` — insertion orchestrator (Top / Bottom / Cursor)
- `src/editor/placement.ts` — placement helpers (Bottom scan, comment-block adjustment)
- `src/config/settings.ts` — `getAutoImportSetting` / `setAutoImportSetting`

---

## Prerequisites

- Extension Development Host launched (F5)
- QA workspace open as a folder — open `qa/workspace/` in the EDH via **File > Open Folder**
- Default settings restored: `importStatementPlacement = "Bottom"`, `preserveScriptFileExtension = false`, `javascriptImportStyle = "import name from '_relativePath_';"`

### How to change extension settings

1. Open VS Code Settings: <kbd>Cmd</kbd>+<kbd>,</kbd> (macOS) or <kbd>Ctrl</kbd>+<kbd>,</kbd> (Windows/Linux).
2. In the left sidebar, scroll down and expand **Extensions**.
3. Click **Auto Import Relative Path** — the extension's settings appear in the main panel.

The three settings used in this checklist:

| Setting label in UI | Type | Default |
|---|---|---|
| JavaScript / JSX import style | dropdown | `import name from '_relativePath_';` |
| Preserve script file extension in imports | checkbox | unchecked (`false`) |
| Import statement placement | dropdown | `Bottom` |

**Workspace layout** — see [`workspace/README.md`](../workspace/README.md) for the full fixture map. Key directories:

| Directory | What's inside |
|-----------|---------------|
| `javascript/src/` | Primary `.js` sources and destinations (`foo.js`, `bar.js`) |
| `javascript/destinations/` | Pre-filled `.js` files for placement tests (undo after each test) |
| `javascript/rejected/` | 20 non-`.js` files for gating rejection tests |

---

## 1 — Cross-import gating matrix

`.js` is **not** in `CROSS_IMPORT_DESTINATIONS` — the source extension must equal `.js`. Every other extension is rejected (`src/gating.ts`: `!CROSS_IMPORT_DESTINATIONS.includes(dest) && sourceExt !== destExt` → not supported).

For each row: copy the source file from the listed workspace path, paste into `javascript/src/bar.js`. Rejected-file content is irrelevant — gating is purely extension-based, so those fixtures can be empty stubs.

| # | Source (workspace path) | Expected |
|---|------------------------|----------|
| 1.1 | `javascript/src/foo.js` | Pass — JS import inserted (`import $1 from './foo';`) |
| 1.2 | `javascript/rejected/helper.ts` | `Auto Import: Cannot import .ts into .js files.` |
| 1.3 | `javascript/rejected/widget.tsx` | `Auto Import: Cannot import .tsx into .js files.` |
| 1.4 | `javascript/rejected/badge.jsx` | `Auto Import: Cannot import .jsx into .js files.` |
| 1.5 | `javascript/rejected/page.mdx` | `Auto Import: Cannot import .mdx into .js files.` |
| 1.6 | `javascript/rejected/global.css` | `Auto Import: Cannot import .css into .js files.` |
| 1.7 | `javascript/rejected/main.scss` | `Auto Import: Cannot import .scss into .js files.` |
| 1.8 | `javascript/rejected/index.html` | `Auto Import: Cannot import .html into .js files.` |
| 1.9 | `javascript/rejected/notes.md` | `Auto Import: Cannot import .md into .js files.` |
| 1.10 | `javascript/rejected/logo.png` | `Auto Import: Cannot import .png into .js files.` |
| 1.11 | `javascript/rejected/icon.svg` | `Auto Import: Cannot import .svg into .js files.` |
| 1.12 | `javascript/rejected/config.json` | `Auto Import: Cannot import .json into .js files.` |
| 1.13 | `javascript/rejected/config.yaml` | `Auto Import: Cannot import .yaml into .js files.` |
| 1.14 | `javascript/rejected/font.woff2` | `Auto Import: Cannot import .woff2 into .js files.` |
| 1.15 | `javascript/rejected/video.mp4` | `Auto Import: Cannot import .mp4 into .js files.` |
| 1.16 | `javascript/rejected/audio.mp3` | `Auto Import: Cannot import .mp3 into .js files.` |
| 1.17 | `javascript/rejected/subs.vtt` | `Auto Import: Cannot import .vtt into .js files.` |
| 1.18 | `javascript/rejected/doc.pdf` | `Auto Import: Cannot import .pdf into .js files.` |
| 1.19 | `javascript/rejected/App.vue` | `Auto Import: Cannot import .vue into .js files.` |
| 1.20 | `javascript/rejected/App.svelte` | `Auto Import: Cannot import .svelte into .js files.` |
| 1.21 | `javascript/rejected/App.astro` | `Auto Import: Cannot import .astro into .js files.` |

- [ ] 1.1 passes (import generated)
- [ ] 1.2 through 1.21 all show the exact warning toast with both extensions in the message
- [ ] Each rejected toast has a **View Supported Files** button that opens the GitHub README section

> Categories sampled (the reject set is the mechanical complement `SOURCE_UNIVERSE − {.js}`): script (`.ts` `.tsx` `.jsx` `.mdx`), stylesheet (`.css` `.scss`), html, markdown, image (`.png` `.svg`), data (`.json` `.yaml`), font (`.woff2`), video (`.mp4`), audio (`.mp3`), text-track (`.vtt`), document (`.pdf`), framework (`.vue` `.svelte` `.astro`).

---

## 2 — Paste as Import — happy path (`Cmd+I` / `Ctrl+I`)

Use `javascript/src/foo.js` as source, `javascript/src/bar.js` as destination. Default style (index 0).

`javascript/src/foo.js` is a plain JS file — no special content needed, since `.js` has no smart-identifier detection (the tab stop is always a bare `$1`).

- [ ] Copy `javascript/src/foo.js` (`Cmd+Shift+A`), open `javascript/src/bar.js`, press `Cmd+I`
- [ ] Import inserted: `import $1 from './foo';` (the default-import shape — **NOT** the named `import { $1 }` that `.ts` uses)
- [ ] Cursor lands on the `$1` tab stop (after `import`, before `from`)
- [ ] Import is at column 0
- [ ] Trailing newline appended after the import line

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Click `javascript/src/foo.js` in the Explorer with `javascript/src/bar.js` open in the editor
- [ ] Press `Alt+D`
- [ ] Import is inserted into `javascript/src/bar.js` — same result as Copy + Paste: `import $1 from './foo';`

---

## 4 — All 7 JavaScript import styles

For each style: open the extension settings (see [How to change extension settings](#how-to-change-extension-settings)) and select the listed value from the **JavaScript / JSX import style** dropdown. Then copy `javascript/src/foo.js` and paste into `javascript/src/bar.js`. Undo (`Cmd+Z`) after each test.

### Style 0 — `import name from '_relativePath_';` (default)

- [ ] Output: `import $1 from './foo';`
- [ ] Cursor lands on `$1` (default-import binding)
- [ ] Tab out completes the snippet

### Style 1 — `import { name } from '_relativePath_';`

- [ ] Output: `import { $1 } from './foo';`
- [ ] Cursor lands on `$1` inside the curly braces

### Style 2 — `import name, { other } from '_relativePath_';`

- [ ] Output: `import $1, { $2 } from './foo';`
- [ ] Cursor lands on `$1` (default binding)
- [ ] Tab advances to `$2` (named binding inside the braces)
- [ ] Two distinct tab stops

### Style 3 — `import * as name from '_relativePath_';`

- [ ] Output: `import * as $1 from './foo';`
- [ ] Cursor lands on `$1` after `as`

### Style 4 — `import '_relativePath_';`

- [ ] Output: `import './foo';`
- [ ] No tab stop (side-effect import), cursor lands after the semicolon

### Style 5 — `const name = require('_relativePath_');`

- [ ] Output: `const $1 = require('./foo');`
- [ ] Cursor lands on `$1` (the CommonJS binding)

### Style 6 — `const name = await import('_relativePath_');`

- [ ] Output: `const $1 = await import('./foo');`
- [ ] Cursor lands on `$1` (the dynamic-import binding)

### Style-name drift — config drift safety net

A hand-typed / drifted `javascriptImportStyle` value (matching no enum description) must still insert the **style-0 shape**, never nothing (`resolveStyleIndex` → `undefined` → builder `default:` arm).

- [ ] In `settings.json`, set `auto-import.importStatement.script.javascriptImportStyle` to a value not in the dropdown, e.g. `import xyz from '_relativePath_';`
- [ ] Copy `javascript/src/foo.js`, paste into `javascript/src/bar.js` → `import $1 from './foo';` (style-0 default-import shape — **NOT** empty)
- [ ] The tab stop is a bare `$1` — `.js` has no smart-identifier detection, so (unlike `.ts`) the `default:` arm never pre-fills a name
- [ ] Restore: set **JavaScript / JSX import style** back to `import name from '_relativePath_';`

---

## 5 — Smart identifier behavior

§5 (Smart identifier) — N/A for `.js`: no exported-class detection, no Angular PascalCase. Style 0 emits a bare `$1` like every other style. (The section numbering skips from §4 to §6 by design — `.js` has `smartId: none`.)

---

## 6 — Placement modes

`.js` uses the **generic** placement mode (column 0; full Top / Bottom / Cursor honoring) — the same mechanism as `.ts`/`.tsx`/`.mdx`.

### 6.1 — Bottom placement (default: `importStatementPlacement = "Bottom"`)

#### 6.1.1 — Empty file

- [ ] Copy `javascript/src/foo.js`, paste into `javascript/destinations/empty.js`
- [ ] Import inserted at line 1

#### 6.1.2 — File with existing imports

- [ ] Open `javascript/destinations/with-imports.js`:
  ```js
  import { foo } from '../src/foo';
  import { bar } from '../src/bar';

  export const x = 1;
  ```
- [ ] Copy `javascript/src/foo.js`, paste → import inserted on line 3 (after `import { bar }`, before the blank line)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.3 — File with `require()` import

- [ ] Open `javascript/destinations/with-require.js`:
  ```js
  const fs = require('fs');
  ```
- [ ] Copy `javascript/src/foo.js`, paste → import inserted on line 2 (after the `require(` line — `require(` is one of the `IMPORT_INDICATORS` markers)

#### 6.1.4 — File with comments containing `import` keyword

- [ ] Open `javascript/destinations/commented-imports.js`:
  ```js
  // import { bar } from '../src/bar';
  import { foo } from '../src/foo';
  ```
- [ ] The commented line is skipped — import inserted on line 3 (after the real import, NOT after the comment)

#### 6.1.5 — File with only comments

- [ ] Open `javascript/destinations/comments-only.js`:
  ```js
  // This file has no imports
  /* Just comments */
  ```
- [ ] No import marker found → import inserted at line 1

#### 6.1.6 — Column is always 0

- [ ] Regardless of cursor position, import is inserted at column 0 (leftmost)

### 6.2 — Top placement (`importStatementPlacement = "Top"`)

- [ ] In the extension settings (see [How to change extension settings](#how-to-change-extension-settings)), set **Import statement placement** to `Top`

#### 6.2.1 — File with existing imports

- [ ] Open `javascript/destinations/with-imports.js`:
  ```js
  import { foo } from '../src/foo';
  import { bar } from '../src/bar';

  export const x = 1;
  ```
- [ ] Copy `javascript/src/foo.js`, paste → import inserted at line 1 (before `import { foo }`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.2 — Empty file

- [ ] Copy `javascript/src/foo.js`, paste into `javascript/destinations/empty.js` → import at line 1

#### 6.2.3 — Column is always 0

- [ ] Import inserted at column 0 regardless of cursor

### 6.3 — Cursor placement (`importStatementPlacement = "Cursor"`)

- [ ] In the extension settings, set **Import statement placement** to `Cursor`

#### 6.3.1 — Cursor on a blank line

- [ ] Open `javascript/destinations/with-imports.js`:
  ```js
  import { foo } from '../src/foo';
  import { bar } from '../src/bar';

  export const x = 1;
  ```
- [ ] Place cursor on line 3 (the blank line), copy `javascript/src/foo.js`, paste → import inserted at line 3
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.2 — Cursor at end of file

- [ ] Open `javascript/destinations/with-imports.js`, place cursor on the last line
- [ ] Copy `javascript/src/foo.js`, paste → import at cursor line
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.3 — Cursor inside a multi-line comment block

- [ ] Open `javascript/destinations/multiline-comment.js`:
  ```js
  import { foo } from '../src/foo';

  /*
   * Some documentation
   * about this module
   */
  export const x = 1;
  ```
- [ ] Place cursor on line 5 (inside the `/* */` block), paste
- [ ] Import is adjusted ABOVE the comment block (line 3), NOT at line 5

#### 6.3.4 — Cursor on a `//` comment line within a comment group

- [ ] Open `javascript/destinations/comment-group.js`:
  ```js
  // Line one of comment
  // Line two of comment
  // Line three of comment
  ```
- [ ] Place cursor on line 2, paste → import adjusted to line 1 (above the comment block)

#### 6.3.5 — Cursor on a non-comment line

- [ ] Open `javascript/destinations/with-imports.js`, place cursor on line 4 (`export const x = 1;`)
- [ ] Copy `javascript/src/foo.js`, paste → import inserted at line 4
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.6 — Column is always 0

- [ ] Even with cursor at column 20, import inserts at column 0

#### 6.3.7 — Cursor on a single isolated `//` comment (not a group)

- [ ] Open `javascript/destinations/single-comment.js`:
  ```js
  import { foo } from '../src/foo';

  // standalone note

  export const x = 1;
  ```
- [ ] Place cursor on line 3 (`// standalone note`), paste
- [ ] Import inserted at line 3 (AT the comment, pushing it to line 4 — unlike a comment group where the import moves above the block)
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 7 — Paste as Import (Pick Style) command

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast. Universal QuickPick mechanics (escape, filter, clipboard validation, no setting change, single-variant fast path) are covered by [general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics).

### 7.1 — QuickPick shows all 7 JS styles

- [ ] Copy `javascript/src/foo.js`, run Paste as Import (Pick Style) in `javascript/src/bar.js`
- [ ] QuickPick appears with placeholder text: `Select an import style`
- [ ] 7 items listed, one per JavaScript import style
- [ ] Each item has a **label** (the snippet preview using `path.basename` of the source — e.g. `import name from 'foo';`) and a **description** (the style's tag) — verbatim per style:

| Style | DESCRIPTION (tag — shown in the QuickPick, verbatim) |
|---|---|
| 0 | `ES module: default import` |
| 1 | `ES module: named import (destructured)` |
| 2 | `ES module: default + named import (mixed)` |
| 3 | `ES module: namespace import (every export bound under one name)` |
| 4 | `ES module: side-effect import (no binding)` |
| 5 | `CommonJS: const require()` |
| 6 | `Dynamic import: lazy-load / code-splitting` |

- [ ] Each item's description matches the tag column exactly
- [ ] The style-0 label is `import name from 'foo';` — **not** pre-filled with any identifier (`.js` has no smart-identifier detection)

### 7.2 — Selecting a style inserts the import (label = basename, inserted = full path)

- [ ] Copy `javascript/src/foo.js`, run the command in `javascript/src/bar.js`
- [ ] Select `import * as name from '_relativePath_';` from the picker (its label previews the basename: `import * as name from 'foo';`)
- [ ] Verify the INSERTED text uses the full relative path: `import * as $1 from './foo';`

---

## 8 — Set Default Import Style command

Run via Command Palette: `Auto Import: Set Default Import Style`. Universal QuickPick mechanics (checkmark on current default, escape, filter, clipboard validation, no insert) are covered by [general.md §10](general.md#10--set-default-import-style--universal-mechanics).

All 7 JavaScript styles are configurable (each maps to the `javascriptImportStyle` setting), so `.js` has **no** `no-configurable-style` / fixed-shape case.

### 8.1 — Selecting a JS style persists to global settings

- [ ] Copy `javascript/src/foo.js`, run Set Default Import Style in `javascript/src/bar.js`
- [ ] Select `import * as name from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import * as name from '_relativePath_';`
- [ ] Check VS Code Settings → `javascriptImportStyle` is now `import * as name from '_relativePath_';`

### 8.2 — Reset default back to style 0

- [ ] Select `import name from '_relativePath_';` to restore the original default

---

## 9 — Drag-and-drop

Drag a file from the Explorer sidebar into an open `.js` editor. A drop reuses the same `buildImportSnippet` + placement pipeline as paste, so the inserted string is byte-identical to the §2 happy path. Universal DnD behaviors (same-file rejection, notification non-clearing) are covered by [general.md §8](general.md#8--drag-and-drop-universal-behaviors).

### 9.1 — Happy path (`.js` → `.js`)

- [ ] Drag `javascript/src/foo.js` from Explorer into `javascript/src/bar.js` editor
- [ ] Import snippet is inserted using the default JavaScript style — `import $1 from './foo';` (byte-identical to the §2 paste result)
- [ ] Placement follows the `importStatementPlacement` setting (same as paste)

### 9.2 — Unsupported pair (`.ts` → `.js`)

- [ ] Drag `javascript/rejected/helper.ts` from Explorer into `javascript/src/bar.js`
- [ ] Warning toast: `Auto Import: Cannot import .ts into .js files.`
- [ ] No Auto Import import inserted — the provider returns a suppressing empty edit that out-ranks VS Code's default drop, so nothing lands (no stray path text — the same no-op as paste)

### 9.3 — Placement with Bottom mode

- [ ] In the extension settings (see [How to change extension settings](#how-to-change-extension-settings)), set **Import statement placement** to `Bottom` (the default)
- [ ] Open `javascript/destinations/with-imports.js` (has existing imports)
- [ ] Drag `javascript/src/foo.js` → import lands after the last existing import line

### 9.4 — Placement with Top mode

- [ ] In the extension settings, set **Import statement placement** to `Top`
- [ ] Drag `javascript/src/foo.js` into `javascript/destinations/with-imports.js` → import lands at line 1

### 9.5 — Placement with Cursor mode

- [ ] In the extension settings, set **Import statement placement** to `Cursor`
- [ ] Drag `javascript/src/foo.js` → drop position determines the insertion line

#### 9.5.1 — Drop onto a single `//` comment line

- [ ] Ensure **Import statement placement** is still set to `Cursor`
- [ ] Open `javascript/destinations/single-comment.js`
- [ ] Drag `javascript/src/foo.js` and drop onto line 3 (`// standalone note`)
- [ ] Import inserted at line 3 (at the comment, pushing it down — same as paste Cursor behavior §6.3.7)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 9.5.2 — Drop into a multi-line comment block

- [ ] Ensure **Import statement placement** is still set to `Cursor`
- [ ] Open `javascript/destinations/multiline-comment.js`
- [ ] Drag `javascript/src/foo.js` and drop onto line 5 (inside the `/* */` block)
- [ ] Import is adjusted ABOVE the comment block (line 3) — same as paste Cursor behavior (§6.3.3)
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.6 — Column is always 0

- [ ] Even if the drop position is mid-line, import inserts at column 0

### 9.7 — `preserveScriptFileExtension` respected on drop

- [ ] In the extension settings, check the **Preserve script file extension in imports** checkbox
- [ ] Drag `javascript/src/foo.js` into `javascript/src/bar.js` → path is `'./foo.js'`
- [ ] In the extension settings, uncheck the **Preserve script file extension in imports** checkbox to restore the default

> **Universal drop precondition** (untitled / unsaved buffer is a no-op): cross-cutting across all 13 destinations and verified once in [typescript.md §9.10](typescript.md#910--universal-drop-precondition-cross-cutting--verified-once-here) — **not** re-tested here.

---

## 10 — Edge cases

### 10.1 — Empty `.js` file

- [ ] Copy `javascript/src/foo.js`, paste into `javascript/destinations/empty.js` → import at line 1

### 10.2 — File with only whitespace

- [ ] Copy `javascript/src/foo.js`, paste into `javascript/destinations/whitespace-only.js` → import at line 1 (no import markers found)

### 10.3 — Large file (500+ lines)

- [ ] Copy `javascript/src/foo.js`, paste into `javascript/destinations/large-file.js` (520 lines, imports at top)
- [ ] Bottom mode still finds the last import correctly (inserts on line 4, after the three imports)

### 10.4 — Import inside a string literal (Bottom mode)

- [ ] Open `javascript/destinations/string-with-import.js`:
  ```js
  const msg = "you should import this";
  ```
- [ ] Bottom mode: the substring `import ` inside the string literal is **NOT** detected as an import marker — `isImportLine` requires a line-leading keyword, so the string is skipped; with no real import found, Bottom falls back to the top of the file (the import lands above the `const msg` line)

### 10.5 — File with mixed import styles (Bottom mode)

- [ ] Open `javascript/destinations/mixed-imports.js`:
  ```js
  import { foo } from '../src/foo';
  const fs = require('fs');

  export const x = 1;
  ```
- [ ] Bottom mode: import inserted on line 3 (after the `require(` line, which is the last import marker)

---

## 11 — Sign-off

- [ ] Cross-import gating (21 cases)
- [ ] Paste as Import — happy path (1 case)
- [ ] Insert Import from Selected File (1 case)
- [ ] All 7 import styles (7 cases)
- [ ] Style-name drift safety net (1 case)
- [ ] Smart identifier — N/A for `.js` (§5 omitted; no cases)
- [ ] Placement — Bottom (6 cases)
- [ ] Placement — Top (3 cases)
- [ ] Placement — Cursor (7 cases)
- [ ] Paste as Import (Pick Style) (2 cases)
- [ ] Set Default Import Style (2 cases)
- [ ] Drag-and-drop (9 cases)
- [ ] Edge cases (5 cases)

**Total: ~65 test cases**
