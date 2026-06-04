# JSX (`.jsx` destination) — QA Checklist

JSX-specific manual QA: accept-all gating, the two-arm style model (7 script styles **or** a fixed asset shape), placement, style pickers, and drag-and-drop. `.jsx` is the first **React-family** destination: it dispatches on the **source extension** (`src/snippets/_react.ts`), so a `.js`/`.jsx` source gets a configurable JS import while a non-script asset gets a fixed shape — and a `.ts`/`.tsx` source inserts **nothing** (empty snippet). `.jsx` has **no** smart-identifier behavior, so script imports are always a bare `$1` (see §5).

> **Prerequisite:** Run the [General checklist](general.md) first. It covers shared infrastructure (copy command, clipboard validation, same-file rejection, notifications, path computation, edge cases) that this checklist assumes has already passed.

**Sources under test:**

- `src/snippets/languages/jsx.ts` — `buildSnippet`: delegates to `buildReactImport` with `primaryExtensions: ['.js', '.jsx']`, `primarySnippet: buildJavaScriptImportSnippet`, **no fallback**
- `src/snippets/_react.ts` — `buildReactImport`: script-primary path (honors `preserveScriptFileExtension`), then delegates non-script sources to the shared exported `buildAssetImportStatement(sourceFileExt, importPath)` (same file) — the `.module.css`/`.module.scss` check (FIRST), the non-script asset `switch` (4 groups, full extension via `fullPath`), `default: null`; `buildReactImport` wraps a `null` result as an empty `SnippetString` (the empty snippet for `.ts`/`.tsx`)
- `src/snippets/_styles.ts` — `JAVASCRIPT_IMPORT_OPTIONS` (7 entries) — descriptions + tags + tab-stop layout per style
- `src/snippets/variants.ts` — `buildJsxVariants` / `buildReactNonScriptVariant`: `.js`/`.jsx` → 7 styled variants backed by `('script', 'javascript')`; non-script → a single hardcoded variant (no `setting`); `.ts`/`.tsx` → `[]`
- `src/gating.ts` — `isPairSupported`: `.jsx ∈ CROSS_IMPORT_DESTINATIONS` → accepts every source (the empty `.ts`/`.tsx` case is caught downstream by the empty-snippet guard, not here)
- `src/commands/paste-import.ts` — Paste as Import (insertion path)
- `src/commands/copy-paste.ts` — Insert Import from Selected File (sequential copy + paste)
- `src/commands/paste-import-with-style.ts` — Paste as Import (Pick Style) command
- `src/commands/set-default-import-style.ts` — Set Default Import Style command
- `src/drop/provider.ts` — `AutoImportOnDropProvider`: empty snippet (`''`/`'\n'`) → `not-supported` toast + `return null` → VS Code's default text-drop inserts the raw path
- `src/editor/insert-snippet.ts` — insertion orchestrator (Top / Bottom / Cursor; column 0 for script destinations)
- `src/editor/placement.ts` — placement helpers (Bottom scan, `adjustForCommentBlock`; `isMarkdownDestination('.jsx')` is **false**, so a leading `*` is a comment)
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

> **`.jsx` has no dedicated `jsxImportStyle` setting** — it reuses **JavaScript / JSX import style** (`javascriptImportStyle`). The same setting governs `.js` destinations and `.js`/`.jsx` sources imported into `.tsx`/`.mdx`. See §8.

**Workspace layout** — see [`workspace/README.md`](../workspace/README.md) for the full fixture map. Key directories:

| Directory | What's inside |
|-----------|---------------|
| `jsx/src/` | Primary `.jsx`/`.js` sources and the `.jsx` destination (`App.jsx`, `Panel.jsx`, `helper.js`, `components/Card.jsx`), plus `.ts`/`.tsx` sources for the empty-snippet case (`model.ts`, `Widget.tsx`) |
| `jsx/assets/` | One fixture per non-script source category (`logo.png`, `styles.module.css`, `global.css`, `data.json`, `clip.mp4`, `subs.vtt`, `font.woff2`, `manual.pdf`, `Hero.vue`, `notes.md`, `page.html`, …) |
| `jsx/destinations/` | Pre-filled `.jsx` files for placement tests (undo after each test) |

> **Asset-fixture content is irrelevant** — the import shape is keyed on the file **extension**, not the bytes, so `jsx/assets/*` fixtures can be empty stubs. Source-file content for script fixtures is also irrelevant: `.jsx` has no smart-identifier detection (always bare `$1`) and `.ts`/`.tsx` sources insert nothing.

---

## 1 — Cross-import gating matrix (accept-all)

`.jsx ∈ CROSS_IMPORT_DESTINATIONS`, so `isPairSupported` returns `true` for **every** source extension (`src/gating.ts`: the first clause short-circuits because the destination is a cross-import destination, and no per-destination clause matches `.jsx`). There are therefore **no source-extension rejection rows** — the only rejection that applies to `.jsx` is the universal **same-file** rejection, which is owned by [general.md](general.md) (cross-reference, never re-tested here).

Instead, this matrix lists one **accepted** row per source category, showing the default inserted shape. It doubles as a coverage map into §2 (happy path) and §4 (all styles / asset shapes). For each row: copy the listed source (`Cmd+Shift+A`), paste into `jsx/src/Panel.jsx` (`Cmd+I`).

| # | Source (workspace path) | Category | Expected (default style) |
|---|------------------------|----------|--------------------------|
| 1.1 | `jsx/src/App.jsx` | script `.jsx` | `import $1 from './App';` |
| 1.2 | `jsx/src/helper.js` | script `.js` | `import $1 from './helper';` |
| 1.3 | `jsx/src/model.ts` | script `.ts` | *(nothing inserted — empty snippet + `not-supported` toast; see §4 / §10)* |
| 1.4 | `jsx/src/Widget.tsx` | script `.tsx` | *(nothing inserted — empty snippet + `not-supported` toast; see §4 / §10)* |
| 1.5 | `jsx/assets/Hero.vue` | framework | `import ${1:name} from '../assets/Hero.vue';` |
| 1.6 | `jsx/assets/page.html` | html | `import ${1:name} from '../assets/page.html';` |
| 1.7 | `jsx/assets/notes.md` | markdown | `import ${1:name} from '../assets/notes.md';` |
| 1.8 | `jsx/assets/logo.png` | image | `import ${1:name} from '../assets/logo.png';` |
| 1.9 | `jsx/assets/data.json` | data | `import ${1:name} from '../assets/data.json';` |
| 1.10 | `jsx/assets/config.yaml` | data | `import ${1:name} from '../assets/config.yaml';` |
| 1.11 | `jsx/assets/manual.pdf` | document | `import ${1:name} from '../assets/manual.pdf';` |
| 1.12 | `jsx/assets/styles.module.css` | CSS module | `import ${1:styles} from '../assets/styles.module.css';` |
| 1.13 | `jsx/assets/global.css` | stylesheet | `import '../assets/global.css';` (side-effect, no tab stop) |
| 1.14 | `jsx/assets/font.woff2` | font | `import '../assets/font.woff2';` (side-effect, no tab stop) |
| 1.15 | `jsx/assets/clip.mp4` | video | `import ${1:url} from '../assets/clip.mp4';` |
| 1.16 | `jsx/assets/theme.mp3` | audio | `import ${1:url} from '../assets/theme.mp3';` |
| 1.17 | `jsx/assets/subs.vtt` | text-track | `import ${1:url} from '../assets/subs.vtt';` |

- [ ] 1.1–1.2 (script `.js`/`.jsx`) insert the JS default-import shape `import $1 from '<path>';`
- [ ] 1.3–1.4 (script `.ts`/`.tsx`) insert **nothing** and show `Auto Import: Cannot import .ts into .jsx files.` / `Auto Import: Cannot import .tsx into .jsx files.` — these are **gating-accepted** (they pass `isPairSupported`) but produce an empty snippet, so the toast fires via the **empty-snippet guard**, not via gating (detailed in §4 / §10)
- [ ] 1.5–1.11 (image / doc / component categories) insert `import ${1:name} from '<full-path>';` with the **full source extension** kept
- [ ] 1.12 (`.module.css`) inserts the `${1:styles}` shape — the CSS-module check beats the side-effect shape (proof in §4)
- [ ] 1.13–1.14 (plain stylesheet / font) insert the side-effect `import '<full-path>';` with no tab stop
- [ ] 1.15–1.17 (av / text-track) insert `import ${1:url} from '<full-path>';`

> Every `SOURCE_UNIVERSE` category is represented (script, framework, html, markdown, image, data, document, CSS-module, stylesheet, font, video, audio, text-track). The four fixed asset shapes — `${1:styles}` / `${1:name}` / `${1:url}` / side-effect — are enumerated in full in §4 (arm 2).

---

## 2 — Paste as Import — happy path (`Cmd+I` / `Ctrl+I`)

One case per source branch in the two-arm model: a script source and an asset source. (The third branch — a `.ts`/`.tsx` source — inserts nothing; it lives in §4's empty-snippet case.)

### 2.1 — Script source (`.jsx`)

- [ ] Copy `jsx/src/App.jsx` (`Cmd+Shift+A`), open `jsx/src/Panel.jsx`, press `Cmd+I`
- [ ] Import inserted: `import $1 from './App';` (the default-import shape — **NOT** the named `import { $1 }` that `.ts` uses)
- [ ] Cursor lands on the `$1` tab stop (after `import`, before `from`)
- [ ] Import is at column 0; trailing newline appended after the import line

### 2.2 — Asset source (image)

- [ ] Copy `jsx/assets/logo.png`, paste into `jsx/src/Panel.jsx`
- [ ] Import inserted: `import ${1:name} from '../assets/logo.png';` (default-import with a `name` placeholder; **full `.png` extension kept**)
- [ ] Cursor lands on the `${1:name}` placeholder (text `name` pre-selected)

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Click `jsx/src/App.jsx` in the Explorer with `jsx/src/Panel.jsx` open in the editor
- [ ] Press `Alt+D`
- [ ] Import is inserted into `jsx/src/Panel.jsx` — same result as Copy + Paste: `import $1 from './App';`

---

## 4 — Style model (two arms)

`.jsx` resolves the import shape from the **source extension**, so item 4 has two arms: a script source picks from the 7 JavaScript styles; a non-script asset gets one fixed shape. A `.ts`/`.tsx` source inserts nothing.

### 4A — Script source: all 7 JavaScript import styles

For each style: open the extension settings (see [How to change extension settings](#how-to-change-extension-settings)) and select the listed value from the **JavaScript / JSX import style** dropdown. Then copy `jsx/src/App.jsx` and paste into `jsx/src/Panel.jsx`. Undo (`Cmd+Z`) after each test.

> These 7 shapes are the **same** `JAVASCRIPT_IMPORT_OPTIONS` table the `.js` destination uses — `.jsx` reuses the `javascriptImportStyle` setting.

#### Style 0 — `import name from '_relativePath_';` (default)

- [ ] Output: `import $1 from './App';`
- [ ] Cursor lands on `$1` (default-import binding)

#### Style 1 — `import { name } from '_relativePath_';`

- [ ] Output: `import { $1 } from './App';`
- [ ] Cursor lands on `$1` inside the curly braces

#### Style 2 — `import name, { other } from '_relativePath_';`

- [ ] Output: `import $1, { $2 } from './App';`
- [ ] Cursor lands on `$1` (default binding); Tab advances to `$2` (named binding); two distinct tab stops

#### Style 3 — `import * as name from '_relativePath_';`

- [ ] Output: `import * as $1 from './App';`
- [ ] Cursor lands on `$1` after `as`

#### Style 4 — `import '_relativePath_';`

- [ ] Output: `import './App';`
- [ ] No tab stop (side-effect import), cursor lands after the semicolon

#### Style 5 — `const name = require('_relativePath_');`

- [ ] Output: `const $1 = require('./App');`
- [ ] Cursor lands on `$1` (the CommonJS binding)

#### Style 6 — `const name = await import('_relativePath_');`

- [ ] Output: `const $1 = await import('./App');`
- [ ] Cursor lands on `$1` (the dynamic-import binding)

### 4B — Non-script source: the 4 fixed asset shapes

Each asset source maps to exactly **one** fixed shape (no style dropdown applies). Restore **JavaScript / JSX import style** to its default first; these shapes are independent of it. Copy the listed source, paste into `jsx/src/Panel.jsx`, undo after each.

| Shape | Source fixture | Output | Tab stop |
|-------|----------------|--------|----------|
| CSS module (checked **first**) | `jsx/assets/styles.module.css` | `import ${1:styles} from '../assets/styles.module.css';` | `${1:styles}` |
| image / doc / component | `jsx/assets/logo.png` | `import ${1:name} from '../assets/logo.png';` | `${1:name}` |
| av / text-track | `jsx/assets/clip.mp4` | `import ${1:url} from '../assets/clip.mp4';` | `${1:url}` |
| font / stylesheet (side-effect) | `jsx/assets/font.woff2` | `import '../assets/font.woff2';` | none |

- [ ] `.module.css` → `import ${1:styles} from '../assets/styles.module.css';` (placeholder `styles`)
- [ ] image/doc/component → `import ${1:name} from '<full-path>';` (placeholder `name`)
- [ ] av/text-track → `import ${1:url} from '<full-path>';` (placeholder `url`)
- [ ] font/stylesheet → `import '<full-path>';` (no placeholder — side-effect)

#### 4B.1 — `.module.css` beats the plain side-effect shape

The `.module.css` / `.module.scss` check runs **before** the extension switch, so a CSS-module source is NOT treated as a plain stylesheet.

- [ ] Copy `jsx/assets/styles.module.css`, paste → `import ${1:styles} from '../assets/styles.module.css';` (the `${1:styles}` shape)
- [ ] Copy `jsx/assets/global.css` (a plain `.css`), paste → `import '../assets/global.css';` (side-effect, no tab stop)
- [ ] The two `.css` sources produce **different** shapes — the `.module.*` suffix is what routes to the `${1:styles}` shape

#### 4B.2 — Non-script assets keep the full extension even with preserve OFF

`preserveScriptFileExtension` is a **script-namespace** setting; `_react.ts` builds asset paths from `fullPath`, which always carries the source extension.

- [ ] Confirm **Preserve script file extension in imports** is unchecked (`false`, the default)
- [ ] Copy `jsx/assets/logo.png`, paste → `import ${1:name} from '../assets/logo.png';` (the `.png` extension is **still present** — the toggle does not strip asset extensions)

### 4C — Empty-snippet case (`.ts` / `.tsx` source → `.jsx`)

A `.ts`/`.tsx` source is gating-accepted but misses `_react.ts`'s primary `['.js', '.jsx']` set (no fallback), so it falls through the asset switch to `default: ''` — an empty snippet.

- [ ] Copy `jsx/src/model.ts`, open `jsx/src/Panel.jsx`, press `Cmd+I`
- [ ] **Nothing is inserted** (empty snippet)
- [ ] Warning toast: `Auto Import: Cannot import .ts into .jsx files.` (fired by the empty-snippet guard, not by gating)
- [ ] The toast has a **View Supported Files** button
- [ ] Repeat with `jsx/src/Widget.tsx` → `Auto Import: Cannot import .tsx into .jsx files.`, nothing inserted

### 4D — Style-name drift (config-drift safety net)

A hand-typed / drifted `javascriptImportStyle` value (matching no enum description) must still insert the **style-0 shape**, never nothing (`resolveStyleIndex` → `undefined` → builder `default:` arm).

- [ ] In `settings.json`, set `auto-import.importStatement.script.javascriptImportStyle` to a value not in the dropdown, e.g. `import xyz from '_relativePath_';`
- [ ] Copy `jsx/src/App.jsx`, paste into `jsx/src/Panel.jsx` → `import $1 from './App';` (style-0 default-import shape — **NOT** empty)
- [ ] The tab stop is a bare `$1` — `.jsx` has no smart-identifier detection, so (unlike `.ts`) the `default:` arm never pre-fills a name
- [ ] Restore: set **JavaScript / JSX import style** back to `import name from '_relativePath_';`

---

## 5 — Smart identifier behavior

§5 (Smart identifier) — **N/A for `.jsx`**: no exported-class detection, no Angular PascalCase. `.js`/`.jsx` sources route through the JS builder (no smart-ID, always bare `$1`); `.ts`/`.tsx` sources insert nothing. (The section numbering skips from §4 to §6 by design — `.jsx` has `smartId: none`.) No exported-class or Angular case appears anywhere in this checklist.

---

## 6 — Placement modes

`.jsx` uses the **generic** placement mode (column 0; full Top / Bottom / Cursor honoring) — the same mechanism as `.ts`/`.js`/`.tsx`/`.mdx`. `.jsx` is **not** Markdown (`isMarkdownDestination('.jsx')` is `false`), so a leading `*` line is treated as a comment continuation (§6.3.8) — the explicit counter-case to `.md`/`.mdx`.

### 6.1 — Bottom placement (default: `importStatementPlacement = "Bottom"`)

#### 6.1.1 — Empty file

- [ ] Copy `jsx/src/App.jsx`, paste into `jsx/destinations/empty.jsx` → import inserted at line 0

#### 6.1.2 — File with existing imports

- [ ] Open `jsx/destinations/with-imports.jsx`:
  ```jsx
  import { Header } from '../src/Header';
  import { Footer } from '../src/Footer';

  export const Page = () => null;
  ```
- [ ] Copy `jsx/src/App.jsx`, paste → import inserted on line 2 (after `import { Footer }`, before the blank line)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.3 — File with `require()` import

- [ ] Open `jsx/destinations/with-require.jsx`:
  ```jsx
  const fs = require('fs');
  ```
- [ ] Copy `jsx/src/App.jsx`, paste → import inserted on line 1 (after the `require(` line — `require(` is one of the `IMPORT_INDICATORS` markers)

#### 6.1.4 — File with comments containing the `import` keyword

- [ ] Open `jsx/destinations/commented-imports.jsx`:
  ```jsx
  // import { Footer } from '../src/Footer';
  import { Header } from '../src/Header';
  ```
- [ ] The commented line is skipped — import inserted on line 2 (after the real import, NOT after the comment)

#### 6.1.5 — File with only comments

- [ ] Open `jsx/destinations/comments-only.jsx`:
  ```jsx
  // This file has no imports
  /* Just comments */
  ```
- [ ] No import marker found → import inserted at line 0

#### 6.1.6 — Column is always 0

- [ ] Regardless of cursor position, import is inserted at column 0 (leftmost)

### 6.2 — Top placement (`importStatementPlacement = "Top"`)

- [ ] In the extension settings (see [How to change extension settings](#how-to-change-extension-settings)), set **Import statement placement** to `Top`

#### 6.2.1 — File with existing imports

- [ ] Open `jsx/destinations/with-imports.jsx` (same content as §6.1.2)
- [ ] Copy `jsx/src/App.jsx`, paste → import inserted at line 0 (before `import { Header }`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.2 — Empty file

- [ ] Copy `jsx/src/App.jsx`, paste into `jsx/destinations/empty.jsx` → import at line 0

#### 6.2.3 — Column is always 0

- [ ] Import inserted at column 0 regardless of cursor

### 6.3 — Cursor placement (`importStatementPlacement = "Cursor"`)

- [ ] In the extension settings, set **Import statement placement** to `Cursor`

#### 6.3.1 — Cursor on a blank line

- [ ] Open `jsx/destinations/with-imports.jsx`, place cursor on line 2 (the blank line)
- [ ] Copy `jsx/src/App.jsx`, paste → import inserted at line 2
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.2 — Cursor at end of file

- [ ] Open `jsx/destinations/with-imports.jsx`, place cursor on the last line, paste → import at cursor line
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.3 — Cursor inside a multi-line comment block

- [ ] Open `jsx/destinations/multiline-comment.jsx`:
  ```jsx
  import { Header } from '../src/Header';

  /*
   * Some documentation
   * about this module
   */
  export const Page = () => null;
  ```
- [ ] Place cursor on line 4 (inside the `/* */` block), paste
- [ ] Import is adjusted ABOVE the comment block (line 2), NOT at line 4

#### 6.3.4 — Cursor on a `//` comment line within a comment group

- [ ] Open `jsx/destinations/comment-group.jsx`:
  ```jsx
  // Line one of comment
  // Line two of comment
  // Line three of comment
  ```
- [ ] Place cursor on line 1, paste → import adjusted to line 0 (above the comment block)

#### 6.3.5 — Cursor on a non-comment line

- [ ] Open `jsx/destinations/with-imports.jsx`, place cursor on line 3 (`export const Page = () => null;`)
- [ ] Copy `jsx/src/App.jsx`, paste → import inserted at line 3
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.6 — Column is always 0

- [ ] Even with cursor at column 20, import inserts at column 0

#### 6.3.7 — Cursor on a single isolated `//` comment (not a group)

- [ ] Open `jsx/destinations/single-comment.jsx`:
  ```jsx
  import { Header } from '../src/Header';

  // standalone note

  export const Page = () => null;
  ```
- [ ] Place cursor on line 2 (`// standalone note`), paste
- [ ] Import inserted at line 2 (AT the comment, pushing it to line 3 — unlike a comment group where the import moves above the block)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.8 — Cursor on a leading-`*` line (NOT Markdown — counter-case to `.md`/`.mdx`)

- [ ] Open `jsx/destinations/leading-star.jsx`:
  ```jsx
  import { Header } from '../src/Header';

  /**
   * A JSDoc-style comment block.
   * The second body line begins with `*`.
   */
  export const Page = () => null;
  ```
- [ ] Place cursor on line 4 (the ` * The second body line…` line), paste
- [ ] Import is adjusted ABOVE the comment block (line 2) — in `.jsx`, a leading `*` is a **comment continuation** (`isMarkdownDestination('.jsx')` is `false`)
- [ ] **Contrast:** in `.md`/`.mdx`, the same leading-`*` line is treated as **content** (bullet / emphasis), so the import would land **at** that line — see §10.4
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 7 — Paste as Import (Pick Style) command

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast. Universal QuickPick mechanics (escape, filter, clipboard validation, no setting change, single-variant fast path) are covered by [general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics).

### 7.1 — Script source: QuickPick shows all 7 JS styles

- [ ] Copy `jsx/src/App.jsx`, run Paste as Import (Pick Style) in `jsx/src/Panel.jsx`
- [ ] QuickPick appears with placeholder text: `Select an import style`
- [ ] 7 items listed, one per JavaScript import style
- [ ] Each item has a **label** (the snippet preview using `path.basename` of the source — e.g. `import name from 'App';`) and a **description** (the style's tag — e.g. `ES module: default import`)
- [ ] The style-0 label is `import name from 'App';` — **not** pre-filled with any identifier (`.jsx` has no smart-identifier detection)

### 7.2 — Script source: label = basename, inserted = full path

- [ ] Copy `jsx/src/components/Card.jsx` (a nested source), run the command in `jsx/src/Panel.jsx`
- [ ] Select `import * as name from '_relativePath_';` from the picker — its label previews the **basename**: `import * as name from 'Card';`
- [ ] Verify the INSERTED text uses the **full relative path**: `import * as $1 from './components/Card';`

### 7.3 — Asset source: single fixed variant (direct insert)

A non-script asset has exactly **one** variant (the fixed shape), so the single-variant fast path applies — the picker is not shown and the import is inserted directly ([general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics)).

- [ ] Copy `jsx/assets/logo.png`, run Paste as Import (Pick Style) in `jsx/src/Panel.jsx`
- [ ] No style list appears (one variant only) → `import ${1:name} from '../assets/logo.png';` is inserted directly
- [ ] (Were the picker shown, the single item's label would be the basename preview `import name from 'logo.png';` with an empty description — hardcoded variants carry no tag)

### 7.4 — `.ts` / `.tsx` source: zero variants

- [ ] Copy `jsx/src/model.ts`, run Paste as Import (Pick Style) in `jsx/src/Panel.jsx`
- [ ] No styles are produced (`buildJsxVariants` returns `[]`) → nothing inserted, and the `not-supported` toast fires: `Auto Import: Cannot import .ts into .jsx files.` (same empty-snippet outcome as §4C)

---

## 8 — Set Default Import Style command

Run via Command Palette: `Auto Import: Set Default Import Style`. Universal QuickPick mechanics (checkmark on current default, escape, filter, clipboard validation, no insert) are covered by [general.md §10](general.md#10--set-default-import-style--universal-mechanics).

### 8.1 — Script source: selecting a JS style persists to global settings

- [ ] Copy `jsx/src/App.jsx`, run Set Default Import Style in `jsx/src/Panel.jsx`
- [ ] Select `import * as name from '_relativePath_';` from the picker
- [ ] Info toast: `Auto Import: Default style saved — import * as name from '_relativePath_';`
- [ ] Check VS Code Settings → **JavaScript / JSX import style** (`javascriptImportStyle`) is now `import * as name from '_relativePath_';`

### 8.2 — Shared-setting cross-effect (note)

`.jsx` has no `jsxImportStyle`. §8.1 persisted `auto-import.importStatement.script.javascriptImportStyle` — the **same** key that governs `.js` destinations and `.js`/`.jsx` sources imported into `.tsx`/`.mdx`. Setting the default from a `.jsx` paste therefore changes the JS import style everywhere that key is read.

- [ ] In VS Code Settings, confirm the value written in §8.1 lives under **JavaScript / JSX import style** (`auto-import.importStatement.script.javascriptImportStyle`) — there is **no** separate `jsxImportStyle` key
- [ ] Reset: run Set Default Import Style on `jsx/src/App.jsx`, select `import name from '_relativePath_';` to restore the original default

### 8.3 — Asset source: no configurable style

A non-script asset's single variant carries no backing setting, so there is nothing to persist.

- [ ] Copy `jsx/assets/logo.png`, run Set Default Import Style in `jsx/src/Panel.jsx`
- [ ] Warning toast: `Auto Import: .png → .jsx imports use a fixed style.` (the `no-configurable-style` reject) — no picker, no setting written

---

## 9 — Drag-and-drop

Drag a file from the Explorer sidebar into an open `.jsx` editor. A drop reuses the same `buildImportSnippet` + `computeImportPlacement` pipeline as paste, so the inserted string is byte-identical to the §2 happy path. Universal DnD behaviors (same-file rejection, notification non-clearing) are covered by [general.md §8](general.md#8--drag-and-drop-universal-behaviors).

### 9.1 — Happy path, script source (`.jsx` → `.jsx`)

- [ ] Drag `jsx/src/App.jsx` from Explorer into `jsx/src/Panel.jsx` editor
- [ ] Import inserted using the default JavaScript style — `import $1 from './App';` (byte-identical to the §2.1 paste result)
- [ ] Placement follows the `importStatementPlacement` setting (same as paste)

### 9.2 — Happy path, asset source

- [ ] Drag `jsx/assets/logo.png` into `jsx/src/Panel.jsx` → `import ${1:name} from '../assets/logo.png';` (the fixed asset shape, byte-identical to §2.2)

### 9.3 — Unsupported pair (`.ts` / `.tsx` → `.jsx`): raw-text fallback

This is `.jsx`'s **only** null-resolving drop — every other source is accepted, but a `.ts`/`.tsx` source builds an empty snippet, so the provider returns `null`.

- [ ] Drag `jsx/src/model.ts` from Explorer into `jsx/src/Panel.jsx`
- [ ] Warning toast: `Auto Import: Cannot import .ts into .jsx files.` (has a **View Supported Files** button)
- [ ] **No Auto Import import inserted** — the drop edit resolves to `null`, so VS Code falls back to its default text-drop and the **raw path text** lands in the editor (distinct from paste §4C, which inserts **nothing at all**)
- [ ] Undo (`Cmd+Z`) to remove the raw text

### 9.4 — Placement with Bottom mode

- [ ] In the extension settings, set **Import statement placement** to `Bottom` (the default)
- [ ] Open `jsx/destinations/with-imports.jsx` (has existing imports)
- [ ] Drag `jsx/src/App.jsx` → import lands after the last existing import line

### 9.5 — Placement with Top mode

- [ ] Set **Import statement placement** to `Top`
- [ ] Drag `jsx/src/App.jsx` into `jsx/destinations/with-imports.jsx` → import lands at line 0

### 9.6 — Placement with Cursor mode (comment-block adjustment)

- [ ] Set **Import statement placement** to `Cursor`

#### 9.6.1 — Drop onto a single `//` comment line

- [ ] Open `jsx/destinations/single-comment.jsx`, drag `jsx/src/App.jsx` and drop onto line 2 (`// standalone note`)
- [ ] Import inserted at line 2 (at the comment, pushing it down — same as paste Cursor §6.3.7)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 9.6.2 — Drop into a multi-line comment block

- [ ] Open `jsx/destinations/multiline-comment.jsx`, drag `jsx/src/App.jsx` and drop onto line 4 (inside the `/* */` block)
- [ ] Import is adjusted ABOVE the comment block (line 2) — same as paste Cursor §6.3.3
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.7 — Column is always 0

- [ ] Even if the drop position is mid-line, import inserts at column 0

### 9.8 — `preserveScriptFileExtension` respected on drop (script source)

- [ ] In the extension settings, check the **Preserve script file extension in imports** checkbox
- [ ] Drag `jsx/src/App.jsx` into `jsx/src/Panel.jsx` → path is `'./App.jsx'`
- [ ] Drag `jsx/assets/logo.png` → path is still `'../assets/logo.png'` (asset extensions are kept regardless — the toggle is script-namespace)
- [ ] Uncheck **Preserve script file extension in imports** to restore the default

> **Universal drop precondition** (untitled / unsaved buffer is a no-op): cross-cutting across all 12 destinations and verified once in [typescript.md §9.10](typescript.md#910--universal-drop-precondition-cross-cutting--verified-once-here) — **not** re-tested here.

---

## 10 — Edge cases

### 10.1 — Empty-snippet recap (`.ts` / `.tsx` source)

- [ ] Copy `jsx/src/model.ts`, paste into `jsx/src/Panel.jsx` → nothing inserted + `Auto Import: Cannot import .ts into .jsx files.` (the empty-snippet guard; see §4C). A `.tsx` source behaves the same with `.tsx` in the message.

### 10.2 — Import inside a string literal (Bottom mode)

- [ ] Open `jsx/destinations/string-with-import.jsx`:
  ```jsx
  const msg = "you should import this";
  ```
- [ ] Bottom mode: the substring `import ` inside the string literal IS detected as an import marker (known heuristic limitation — not a bug); the import lands after that line

### 10.3 — File with `require()` marker (Bottom mode)

- [ ] Open `jsx/destinations/mixed-imports.jsx`:
  ```jsx
  import { Header } from '../src/Header';
  const fs = require('fs');

  export const Page = () => null;
  ```
- [ ] Bottom mode: import inserted on line 2 (after the `require(` line, which is the last import marker)

### 10.4 — Leading-`*` Cursor contrast (`.jsx` is not Markdown)

- [ ] With **Import statement placement** = `Cursor`, repeat §6.3.8 on `jsx/destinations/leading-star.jsx`: a cursor on the ` * …` line pushes the import **above** the block (the `*` is a comment continuation)
- [ ] This is the explicit counter-case to `.md`/`.mdx`, where a leading-`*` line is content and the import lands **at** the line — the same `tsx.ts`/React-family family of builders, but `.jsx` ≠ `.md`/`.mdx` for comment handling

---

## 11 — Sign-off

- [ ] Cross-import gating — accept-all matrix, one row per source category (17 rows; 0 source-extension rejections, same-file owned by general.md)
- [ ] Paste as Import — happy path (2 cases: script + asset)
- [ ] Insert Import from Selected File (1 case)
- [ ] Style model — arm A: all 7 JavaScript styles (7 cases)
- [ ] Style model — arm B: 4 fixed asset shapes + `.module.css`-beats-side-effect proof + asset-keeps-extension note (6 cases)
- [ ] Style model — empty-snippet case (`.ts`/`.tsx` → nothing + toast) (1 case)
- [ ] Style-name drift safety net (1 case)
- [ ] Smart identifier — N/A for `.jsx` (§5 omitted; no cases)
- [ ] Placement — Bottom (6 cases)
- [ ] Placement — Top (3 cases)
- [ ] Placement — Cursor, incl. leading-`*`-is-comment (8 cases)
- [ ] Paste as Import (Pick Style) — script list / asset direct-insert / `.ts`-`.tsx` zero variants (4 cases)
- [ ] Set Default Import Style — script persist + shared-setting + asset `no-configurable-style` (3 cases)
- [ ] Drag-and-drop — happy script / happy asset / `.ts`-raw-text / placement / preserve (10 cases)
- [ ] Edge cases — empty-snippet recap, string-literal + `require(` false-positives, leading-`*` contrast (4 cases)

**Total: ~70 test cases**
