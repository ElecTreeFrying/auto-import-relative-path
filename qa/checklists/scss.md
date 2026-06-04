# SCSS (`.scss` destination) — QA Checklist

SCSS-specific manual QA: allow-list gating, the five `@use` / `@forward` / `@import` styles plus the fixed image `url()` arm, partial-filename normalization, the stylesheet preserve toggle, placement (stylesheet column-0 + inline `url()`), style pickers, and drag-and-drop.

> **Prerequisite:** Run the [General checklist](general.md) first. It covers shared infrastructure (copy command, clipboard validation, same-file rejection, notifications, edge cases) that this checklist assumes has already passed.

**Sources under test:**

- `src/snippets/languages/scss.ts` — snippet builder; source-type switch (`image` vs stylesheet), the 5-case `@use`/`@forward`/`@import` style switch + config-drift `default:` arm, `prepareScssImportPath` (partial normalization + extension handling), `determineScssExtension` (`.css` always preserved)
- `src/snippets/languages/css.ts` — `buildCssImageImportSnippet` (fixed `url('<path>')`, reused for `.scss` image sources)
- `src/snippets/_styles.ts` — `SCSS_IMPORT_OPTIONS` (5 entries)
- `src/snippets/variants.ts` — `buildScssVariants` (image → 1 hardcoded variant; stylesheet → 5 styled variants; basename label vs full-path insertion; partial normalization applied to the label too)
- `src/gating.ts` — `isPairSupported` (`.scss` allow-list: `.scss` + `.css` + image; one-way `.css → .scss`)
- `src/constants/extensions.ts` — `SCSS_SUPPORTED_EXTENSIONS`, `STYLESHEET_FILE_EXTENSIONS`
- `src/path/import-type.ts` — `determineImportType` (`.scss` → `null`, `.css` → `stylesheet`, image → `image`)
- `src/commands/paste-import.ts`, `copy-paste.ts`, `paste-import-with-style.ts`, `set-default-import-style.ts` — the commands
- `src/drop/provider.ts` — `AutoImportOnDropProvider` (drag-and-drop import; registered for `scheme:'file'` only)
- `src/editor/insert-snippet.ts`, `placement.ts` — placement (stylesheet column-0; inline `url()` exception)
- `src/config/settings.ts` — `getAutoImportSetting` / `setAutoImportSetting`

---

## Prerequisites

- Extension Development Host launched (F5)
- QA workspace open as a folder — open `qa/workspace/` in the EDH via **File > Open Folder**
- Default settings restored: `importStatementPlacement = "Bottom"`, `preserveStylesheetFileExtension = false`, `scssImportStyle = "@use '_relativePath_';"`

### How to change extension settings

1. Open VS Code Settings: <kbd>Cmd</kbd>+<kbd>,</kbd> (macOS) or <kbd>Ctrl</kbd>+<kbd>,</kbd> (Windows/Linux).
2. In the left sidebar, scroll down and expand **Extensions**.
3. Click **Auto Import Relative Path** — the extension's settings appear in the main panel.

The settings used in this checklist:

| Setting label in UI | Type | Default |
|---|---|---|
| SCSS @import / @use style | dropdown | `@use '_relativePath_';` |
| Preserve stylesheet file extension in imports | checkbox | unchecked (`false`) |
| Import statement placement | dropdown | `Bottom` |

**Workspace layout** — see [`workspace/README.md`](../workspace/README.md) for the full fixture map. Key directories:

| Directory | What's inside |
|-----------|---------------|
| `scss/src/` | Primary `.scss` sources + destinations (`theme.scss`, `main.scss`) and a `.css` source (`reset.css`) |
| `scss/src/abstracts/` | `_variables.scss` partial — leading-`_` normalization |
| `scss/src/_partials/` | `_colors.scss` under a `_`-prefixed directory — last-segment-only strip |
| `scss/src/images/` | `logo.png`, `icon.svg`, `_icon.png` image sources — inline `url()` |
| `scss/destinations/` | Pre-filled `.scss` files for placement tests (undo after each) |
| `scss/rejected/` | Non-supported sources for gating-rejection rows |

---

## 1 — Cross-import gating matrix

`.scss` is in `CROSS_IMPORT_DESTINATIONS`, so it accepts a curated source set: `SCSS_SUPPORTED_EXTENSIONS` = `.scss` + `.css` + the seven image types (defined in `src/constants/extensions.ts:45-49`; gated in `src/gating.ts:32-34`). Every other source is rejected with `Auto Import: Cannot import .X into .scss files.`

For each row: copy the source file from the listed workspace path, paste into `scss/src/main.scss`.

| # | Source (workspace path) | Expected |
|---|------------------------|----------|
| 1.1 | `scss/src/theme.scss` | Pass — `@use './theme';` inserted (same extension) |
| 1.2 | `scss/src/reset.css` | Pass — `@use './reset.css';` inserted (one-way: SCSS imports CSS) |
| 1.3 | `scss/src/images/logo.png` | Pass — `url('./images/logo.png')` inserted inline |
| 1.4 | `scss/src/images/icon.svg` | Pass — `url('./images/icon.svg')` inserted inline |
| 1.5 | `scss/rejected/widget.ts` | `Auto Import: Cannot import .ts into .scss files.` |
| 1.6 | `scss/rejected/sibling.js` | `Auto Import: Cannot import .js into .scss files.` |
| 1.7 | `scss/rejected/badge.jsx` | `Auto Import: Cannot import .jsx into .scss files.` |
| 1.8 | `scss/rejected/panel.tsx` | `Auto Import: Cannot import .tsx into .scss files.` |
| 1.9 | `scss/rejected/page.mdx` | `Auto Import: Cannot import .mdx into .scss files.` |
| 1.10 | `scss/rejected/App.vue` | `Auto Import: Cannot import .vue into .scss files.` |
| 1.11 | `scss/rejected/App.svelte` | `Auto Import: Cannot import .svelte into .scss files.` |
| 1.12 | `scss/rejected/App.astro` | `Auto Import: Cannot import .astro into .scss files.` |
| 1.13 | `scss/rejected/index.html` | `Auto Import: Cannot import .html into .scss files.` |
| 1.14 | `scss/rejected/notes.md` | `Auto Import: Cannot import .md into .scss files.` |
| 1.15 | `scss/rejected/clip.mp4` | `Auto Import: Cannot import .mp4 into .scss files.` |
| 1.16 | `scss/rejected/track.mp3` | `Auto Import: Cannot import .mp3 into .scss files.` |
| 1.17 | `scss/rejected/subs.vtt` | `Auto Import: Cannot import .vtt into .scss files.` |
| 1.18 | `scss/rejected/data.json` | `Auto Import: Cannot import .json into .scss files.` |
| 1.19 | `scss/rejected/config.yaml` | `Auto Import: Cannot import .yaml into .scss files.` |
| 1.20 | `scss/rejected/font.woff2` | `Auto Import: Cannot import .woff2 into .scss files.` |
| 1.21 | `scss/rejected/doc.pdf` | `Auto Import: Cannot import .pdf into .scss files.` |

- [ ] 1.1 through 1.4 pass (import generated; image rows insert an inline `url()`)
- [ ] 1.5 through 1.21 all show the exact warning toast with both extensions in the message
- [ ] Each rejected toast has a **View Supported Files** button that opens the GitHub README section

> **One-way `.css ↔ .scss`.** SCSS *accepts* a `.css` source (row 1.2 → `@use './reset.css';`), because `SCSS_SUPPORTED_EXTENSIONS` includes `.css`. The reverse — a `.scss` source into a `.css` destination — is **rejected**. That asymmetry belongs to the `.css` destination (`css.md` §1) and is not re-tested here.

---

## 2 — Paste as Import — happy path (`Cmd+I` / `Ctrl+I`)

`.scss` is source-type-dispatched: a **stylesheet** source becomes a `@use` statement; an **image** source becomes an inline `url()`. Both arms are exercised here. Default style (index 0).

### 2.1 — Stylesheet source (`.scss` → `@use`)

- [ ] Copy `scss/src/theme.scss` (`Cmd+Shift+A`), open `scss/src/main.scss`, press `Cmd+I`
- [ ] Inserted: `@use './theme';`
- [ ] No tab stop — the cursor does not land in a placeholder (it lands after the `;`)
- [ ] Import is at column 0, trailing newline appended

### 2.2 — Image source (`.png` → inline `url()`)

- [ ] Open `scss/src/main.scss` and place the cursor inside a value position (e.g. type `body { background: ` and leave the cursor right after the space)
- [ ] Copy `scss/src/images/logo.png` (`Cmd+Shift+A`), press `Cmd+I`
- [ ] Inserted at the **exact cursor line and column**: `url('./images/logo.png')`
- [ ] **No** trailing newline (it is an inline CSS value, not a statement); the `importStatementPlacement` setting is ignored
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Click `scss/src/theme.scss` in the Explorer with `scss/src/main.scss` open in the editor
- [ ] Press `Alt+D`
- [ ] `@use './theme';` is inserted into `scss/src/main.scss` — same result as Copy + Paste (§2.1)

---

## 4 — All 5 SCSS styles (+ image arm + path quirks + style-name drift)

For each style: open the extension settings (see [How to change extension settings](#how-to-change-extension-settings)) and select the listed value from the **SCSS @import / @use style** dropdown. Then copy `scss/src/theme.scss` and paste into `scss/src/main.scss`. Undo (`Cmd+Z`) after each test.

`scss/src/theme.scss` content (the snippet depends only on the path, not the body):

```scss
$primary: #3366ff;
body { color: $primary; }
```

### Style 0 — `@use '_relativePath_';` (default)

- [ ] Output: `@use './theme';`
- [ ] No tab stop — cursor does not land in a placeholder

### Style 1 — `@use '_relativePath_' as *;`

- [ ] Output: `@use './theme' as ${1:*};`
- [ ] Cursor lands on the `*` placeholder (pre-filled with `*`, editable — type over to set a namespace)

### Style 2 — `@use '_relativePath_' as name;`

- [ ] Output: `@use './theme' as $1;`
- [ ] Cursor lands on the empty `$1` tab stop, right after `as `

### Style 3 — `@forward '_relativePath_';`

- [ ] Output: `@forward './theme';`
- [ ] No tab stop

### Style 4 — `@import '_relativePath_';`

- [ ] Output: `@import './theme';`
- [ ] No tab stop (legacy Sass-deprecated `@import`)

### 4-image — Image source fixed shape (not configurable)

- [ ] With **any** `scssImportStyle` value selected, copy `scss/src/images/logo.png` and paste into `scss/src/main.scss` at a value position → `url('./images/logo.png')`
- [ ] The shape does **not** change with the dropdown — image sources have no configurable style (`scssImageImportStyle` exists in `package.json` for UI parity but is never read at runtime; the SCSS image builder reuses CSS's fixed `url('<path>')`)
- [ ] No tab stop; undo (`Cmd+Z`)

### 4.A — Partial-filename normalization (leading `_` of the last segment stripped)

`scss/src/abstracts/_variables.scss` content:

```scss
$spacing: 8px;
```

- [ ] With the default style, copy `scss/src/abstracts/_variables.scss`, paste into `scss/src/main.scss`
- [ ] Output: `@use './abstracts/variables';` — the leading `_` of `_variables` is stripped (Sass resolves partials by their bare name); the `abstracts/` directory segment is untouched

### 4.B — `preserveStylesheetFileExtension` toggle (stylesheet source)

This is the **stylesheet** preserve key (`auto-import.importStatement.styleSheet.preserveStylesheetFileExtension`), distinct from the script-namespace `preserveScriptFileExtension`. It is **not** suppressed for `.scss`.

- [ ] With **Preserve stylesheet file extension in imports** unchecked (default), copy `scss/src/abstracts/_variables.scss`, paste into `scss/src/main.scss` → `@use './abstracts/variables';`
- [ ] In the extension settings, **check** the **Preserve stylesheet file extension in imports** checkbox
- [ ] Copy `scss/src/abstracts/_variables.scss`, paste → `@use './abstracts/variables.scss';` (extension kept; the leading `_` is still stripped)
- [ ] Restore: **uncheck** **Preserve stylesheet file extension in imports**

### 4.C — `.css` source always keeps `.css` (neither toggle affects it)

`scss/src/reset.css` content:

```css
*, *::before, *::after { box-sizing: border-box; }
```

- [ ] With **Preserve stylesheet file extension in imports** unchecked, copy `scss/src/reset.css`, paste into `scss/src/main.scss` → `@use './reset.css';`
- [ ] **Check** **Preserve stylesheet file extension in imports**, repeat → STILL `@use './reset.css';` (unchanged by the toggle)
- [ ] Restore: **uncheck** **Preserve stylesheet file extension in imports**

> Rationale (`package.json`): ".css extensions are always preserved inside .scss imports — Sass requires the extension to recognise a foreign-language import, and this setting has no effect there." This short-circuit (`scss.ts:48-50`) runs *before* the preserve setting is read, so it is independent of §4.B.

### 4-drift — Style-name drift (config-drift safety net)

A hand-typed / drifted `scssImportStyle` value (matching no enum description) must still insert the **style-0 shape**, never nothing (`resolveStyleIndex` → `undefined` → builder `default:` arm).

- [ ] In `settings.json`, set `auto-import.importStatement.styleSheet.scssImportStyle` to a value not in the dropdown, e.g. `@mixin '_relativePath_';`
- [ ] Copy `scss/src/theme.scss`, paste into `scss/src/main.scss` → `@use './theme';` (style-0 shape — NOT empty)
- [ ] The style-0 shape carries **no** pre-filled name — `.scss` has no smart-identifier behavior (§5), so the result is always the bare `@use './theme';`
- [ ] Restore: set **SCSS @import / @use style** back to `@use '_relativePath_';`

---

## 5 — Smart identifier behavior

§5 (Smart identifier) — **N/A for `.scss`**: no exported-class detection, no Angular PascalCase. `.scss` has `smartId: none`; every style emits its literal shape with no name pre-fill. (The gap between §4 and §6 is intentional — it preserves the canonical section numbering shared across all per-language checklists.)

---

## 6 — Placement modes

`.scss` has two placement modes. A **stylesheet** source (`.scss` or `.css`) uses `stylesheet` mode (column 0, honors the setting, Bottom anchors on `@use`/`@forward`/`@import`). An **image** source uses `inline-url` mode (exact cursor position, no newline, setting ignored).

### 6.1 — Bottom placement (default: `importStatementPlacement = "Bottom"`)

#### 6.1.1 — Empty file

- [ ] Copy `scss/src/theme.scss`, paste into `scss/destinations/empty.scss` (empty file)
- [ ] `@use './theme';` inserted at line 0

#### 6.1.2 — File with existing `@use` / `@forward`

- [ ] Open `scss/destinations/with-imports.scss`:
  ```scss
  @use './theme';
  @forward './mixins';

  body { color: red; }
  ```
- [ ] Copy `scss/src/theme.scss`, paste → import inserted on line 2 (after `@forward './mixins';`, the last `IMPORT_INDICATORS` marker, before the blank line)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.3 — Commented-out marker is skipped

- [ ] Open `scss/destinations/commented-imports.scss`:
  ```scss
  // @use './old-theme';
  @use './theme';
  ```
- [ ] Copy `scss/src/theme.scss`, paste → the commented `// @use` line is skipped; import inserted on line 2 (after the real `@use './theme';`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.1.4 — File with only comments

- [ ] Open `scss/destinations/comments-only.scss`:
  ```scss
  // Theme entry point
  /* nothing imported yet */
  ```
- [ ] No import marker found → import inserted at line 0

#### 6.1.5 — Column is always 0

- [ ] Regardless of cursor position, the `@use` import is inserted at column 0 (stylesheet destinations force column 0)

### 6.2 — Top placement (`importStatementPlacement = "Top"`)

- [ ] In the extension settings, set **Import statement placement** to `Top`

#### 6.2.1 — File with existing imports

- [ ] Open `scss/destinations/with-imports.scss` (content above)
- [ ] Copy `scss/src/theme.scss`, paste → import inserted at line 0 (before `@use './theme';`)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.2.2 — Column is always 0

- [ ] Import inserted at column 0 regardless of cursor

### 6.3 — Cursor placement (`importStatementPlacement = "Cursor"`)

- [ ] In the extension settings, set **Import statement placement** to `Cursor`

#### 6.3.1 — Cursor inside a multi-line comment block

- [ ] Open `scss/destinations/multiline-comment.scss`:
  ```scss
  @use './theme';

  /*
   * Layout section
   * spacing + grid
   */
  body { margin: 0; }
  ```
- [ ] Place the cursor on line 4 (inside the `/* */` block), paste `scss/src/theme.scss`
- [ ] Import is adjusted ABOVE the comment block (line 2), NOT at line 4
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.2 — Cursor on a lone `//` comment line

- [ ] Open `scss/destinations/single-comment.scss`:
  ```scss
  @use './theme';

  // standalone note

  body { margin: 0; }
  ```
- [ ] Place the cursor on line 2 (`// standalone note`), paste
- [ ] Import inserted at line 2 (AT the comment, pushing it down — a lone `//` is not a comment *block*; contrast §6.3.3, where a `//` *group* pushes the import above the run)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.3 — Cursor on a `//` comment line within a comment group

- [ ] Open `scss/destinations/comment-group.scss`:
  ```scss
  // Line one of comment
  // Line two of comment
  // Line three of comment
  ```
- [ ] Place the cursor on line 2 (the middle `//` line), paste `scss/src/theme.scss`
- [ ] Import is adjusted to line 0 — ABOVE the entire `//` run (the cursor walks up over the consecutive comments), NOT at the cursor line; a run of `//` lines is treated as one comment block, unlike the lone `//` in §6.3.2
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.4 — Cursor on a content line

- [ ] Open `scss/destinations/with-imports.scss`, place the cursor on line 3 (`body { color: red; }`), paste → import inserted at line 3
- [ ] Undo (`Cmd+Z`) to restore the file

#### 6.3.5 — Column is always 0

- [ ] Even with the cursor at column 20, the `@use` import inserts at column 0
- [ ] Restore: set **Import statement placement** back to `Bottom`

### 6.4 — Image source: inline `url()` (placement ignored)

- [ ] Set **Import statement placement** to `Top`
- [ ] Open `scss/src/main.scss`, place the cursor mid-line inside a value position, copy `scss/src/images/logo.png`, paste
- [ ] `url('./images/logo.png')` inserted at the **exact cursor line and column** (NOT line 0) — the placement setting has no effect on inline `url()`
- [ ] No trailing newline; undo (`Cmd+Z`)
- [ ] Restore: set **Import statement placement** back to `Bottom`

> A `.css` source is a **stylesheet** source (`STYLESHEET_FILE_EXTENSIONS` includes `.css`), so it is **NOT** inline — `@use './reset.css';` is placed as a normal statement at column 0 and honors the placement setting, exactly like a `.scss` source. Only genuinely non-stylesheet (image) sources go inline.

---

## 7 — Paste as Import (Pick Style) command

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast. Universal QuickPick mechanics (escape, filter, clipboard validation, no setting change) are covered by [general.md §9](general.md#9--paste-as-import-pick-style--universal-mechanics).

### 7.1 — QuickPick shows all 5 SCSS styles

- [ ] Copy a `.scss` source, run Paste as Import (Pick Style) in a `.scss` destination
- [ ] QuickPick appears with placeholder text: `Select an import style`
- [ ] 5 items listed, one per SCSS import style
- [ ] Each item has a label (the snippet preview using `path.basename` of the source) and a description (the style's tag)

### 7.2 — Label = basename, inserted = full path (assert both)

Copy `scss/src/abstracts/_variables.scss`, run the command in `scss/src/main.scss`. The label uses the **basename** of the *normalized* path (`variables` — `_` stripped, nesting collapsed), while the inserted text uses the **full** relative path:

| Style | Item LABEL (basename preview) | INSERTED text (full path) | Item DESCRIPTION (tag) |
|---|---|---|---|
| 0 | `@use 'variables';` | `@use './abstracts/variables';` | `Modern @use — Sass module system (recommended)` |
| 1 | `@use 'variables' as *;` | `@use './abstracts/variables' as ${1:*};` | `Modern @use with wildcard alias — no namespace prefix required` |
| 2 | `@use 'variables' as name;` | `@use './abstracts/variables' as $1;` | `Modern @use with named alias` |
| 3 | `@forward 'variables';` | `@forward './abstracts/variables';` | `Sass module re-export — barrel pattern` |
| 4 | `@import 'variables';` | `@import './abstracts/variables';` | `Legacy @import — Sass-deprecated` |

- [ ] All 5 labels match the basename-preview column (note `as *` and `as name` in the labels — tab stops render as `*` / `name` in the preview)
- [ ] Selecting any style inserts the full-path column (e.g. selecting style 1 inserts `@use './abstracts/variables' as ${1:*};`)
- [ ] Each item's description matches the tag column

### 7.3 — Image source: single variant, direct insert

- [ ] Copy `scss/src/images/logo.png`, run Paste as Import (Pick Style) in `scss/src/main.scss`
- [ ] The image source yields a single variant — `url('./images/logo.png')` is inserted directly with no picker shown (single-variant silent insert — see general.md §9)

---

## 8 — Set Default Import Style command

Run via Command Palette: `Auto Import: Set Default Import Style`. Universal QuickPick mechanics (checkmark, escape, filter, clipboard validation, no insert) are covered by [general.md §10](general.md#10--set-default-import-style--universal-mechanics).

### 8.1 — Selecting a style persists + saved toast (uses the enum value, not the tag)

- [ ] Copy a `.scss` source, run Set Default Import Style in a `.scss` destination
- [ ] Select `@use '_relativePath_' as *;` from the picker
- [ ] Info toast: `Auto Import: Default style saved — @use '_relativePath_' as *;`
- [ ] Check VS Code Settings → `scssImportStyle` is now `@use '_relativePath_' as *;`

> The saved toast shows the **enum value string** (`@use '_relativePath_' as *;`), whereas the Pick Style picker (§7) shows the **tag** (`Modern @use with wildcard alias …`). Same style, two different surfaced strings — do not conflate.

### 8.2 — Image source: no configurable style

- [ ] Copy `scss/src/images/logo.png`, run Set Default Import Style in `scss/src/main.scss`
- [ ] Warning toast: `Auto Import: .png → .scss imports use a fixed style.` (the image variant carries no setting)

### 8.3 — Reset default back to style 0

- [ ] Select `@use '_relativePath_';` to restore the original default

---

## 9 — Drag-and-drop

Drag a file from the Explorer sidebar into an open `.scss` editor. A drop reuses the same snippet + placement pipeline as paste, so the inserted string is byte-identical to §2. Universal DnD behaviors (same-file rejection, notification non-clearing) are covered by [general.md §8](general.md#8--drag-and-drop-universal-behaviors).

### 9.1 — Happy path (`.scss` → `.scss`)

- [ ] Drag `scss/src/theme.scss` from Explorer into `scss/src/main.scss`
- [ ] `@use './theme';` inserted using the default style (byte-identical to §2.1)
- [ ] Placement follows the `importStatementPlacement` setting (same as paste)

### 9.2 — Unsupported pair (`.vue` → `.scss`)

- [ ] Drag `scss/rejected/App.vue` from Explorer into `scss/src/main.scss`
- [ ] Warning toast: `Auto Import: Cannot import .vue into .scss files.`
- [ ] No Auto Import import inserted (the drop edit resolves to `null` → VS Code falls back to its default text-drop, so the raw path text may land — distinct from paste, which inserts nothing at all)

### 9.3 — Placement with Bottom mode

- [ ] Ensure **Import statement placement** is `Bottom` (the default)
- [ ] Drag `scss/src/theme.scss` into `scss/destinations/with-imports.scss` → import lands after the last `@forward`/`@use` line
- [ ] Undo (`Cmd+Z`) to restore the file

### 9.4 — Placement with Top mode

- [ ] Set **Import statement placement** to `Top`
- [ ] Drag `scss/src/theme.scss` into `scss/destinations/with-imports.scss` → import lands at line 0
- [ ] Undo (`Cmd+Z`); restore **Import statement placement** to `Bottom`

### 9.5 — Placement with Cursor mode (comment sub-cases)

- [ ] Set **Import statement placement** to `Cursor`

#### 9.5.1 — Drop onto a lone `//` comment line

- [ ] Open `scss/destinations/single-comment.scss`, drag `scss/src/theme.scss` and drop onto line 2 (`// standalone note`)
- [ ] Import inserted at line 2 (at the comment, pushing it down — same as paste §6.3.2)
- [ ] Undo (`Cmd+Z`) to restore the file

#### 9.5.2 — Drop into a multi-line comment block

- [ ] Open `scss/destinations/multiline-comment.scss`, drag `scss/src/theme.scss` and drop onto line 4 (inside the `/* */` block)
- [ ] Import is adjusted ABOVE the comment block (line 2) — same as paste §6.3.1
- [ ] Undo (`Cmd+Z`); restore **Import statement placement** to `Bottom`

### 9.6 — Image drop: inline `url()` at the drop column

- [ ] Open `scss/src/main.scss`, drag `scss/src/images/logo.png` and drop at a mid-line value position
- [ ] `url('./images/logo.png')` lands at the exact drop line and column, with no trailing newline (the stylesheet inline-`url()` drop slot)
- [ ] Undo (`Cmd+Z`)

### 9.7 — Partial normalization applies on drop

- [ ] Drag `scss/src/abstracts/_variables.scss` into `scss/src/main.scss` → `@use './abstracts/variables';` (leading `_` stripped, same as paste §4.A)

### 9.8 — `preserveStylesheetFileExtension` respected on drop

- [ ] In the extension settings, **check** **Preserve stylesheet file extension in imports**
- [ ] Drag `scss/src/abstracts/_variables.scss` into `scss/src/main.scss` → `@use './abstracts/variables.scss';`
- [ ] Restore: **uncheck** **Preserve stylesheet file extension in imports**

### 9.9 — Universal drop precondition (cross-cutting — verified once for all 12 destinations)

- [ ] The "drop into an untitled/unsaved buffer is a no-op" precondition is tested once for all 12 destinations in [typescript.md §9.10](typescript.md#910--universal-drop-precondition-cross-cutting--verified-once-here) — not re-tested here

---

## 10 — Edge cases

### 10.1 — Last-segment-only `_` strip (directory `_` preserved)

`scss/src/_partials/_colors.scss` content:

```scss
$danger: #cc0000;
```

- [ ] Copy `scss/src/_partials/_colors.scss`, paste into `scss/src/main.scss`
- [ ] Output: `@use './_partials/colors';` — only the **last** segment's leading `_` is stripped (`_colors` → `colors`); the `_partials/` directory keeps its `_`

### 10.2 — Image leading `_` is NOT normalized

- [ ] Copy `scss/src/images/_icon.png`, paste into `scss/src/main.scss` at a value position
- [ ] Output: `url('./images/_icon.png')` — the image branch keeps the full filename (and extension); the partial-normalization `_`-strip applies only to the `@use` stylesheet path, never to `url()`
- [ ] Undo (`Cmd+Z`)

### 10.3 — Commented-out `@use` does not anchor Bottom placement

- [ ] Open `scss/destinations/commented-only.scss`:
  ```scss
  // @use './deprecated';
  .btn { color: blue; }
  ```
- [ ] With Bottom placement, copy `scss/src/theme.scss`, paste → import inserted at line 0 (the commented `// @use` line is skipped, and `.btn { … }` is not a marker, so no anchor is found)
- [ ] Undo (`Cmd+Z`) to restore the file

---

## 11 — Sign-off

- [ ] Cross-import gating (21 cases: 4 accept + 17 reject)
- [ ] Paste as Import — happy path: stylesheet + image (2 cases)
- [ ] Insert Import from Selected File (1 case)
- [ ] All 5 SCSS styles (5 cases)
- [ ] Image fixed-shape arm (1 case)
- [ ] Partial-filename normalization (1 case)
- [ ] `preserveStylesheetFileExtension` toggle — off / on (1 case)
- [ ] `.css` source always keeps `.css` (1 case)
- [ ] Style-name drift safety net (1 case)
- [ ] Smart identifier — N/A for `.scss` (§5 omitted)
- [ ] Placement — Bottom (5 cases)
- [ ] Placement — Top (2 cases)
- [ ] Placement — Cursor (4 cases)
- [ ] Placement — image inline `url()` + `.css`-not-inline note (1 case)
- [ ] Paste as Import (Pick Style) (3 cases)
- [ ] Set Default Import Style (3 cases)
- [ ] Drag-and-drop (10 cases, incl. the once-for-all untitled-buffer pointer)
- [ ] Edge cases (3 cases)

**Total: ~65 test cases** (excluding the general.md baseline this checklist assumes has passed).
