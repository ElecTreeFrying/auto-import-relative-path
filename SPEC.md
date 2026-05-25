# Auto Import Relative Path — Functionality Specification

A VS Code extension that generates relative-path import statements for JS, TS, JSX, TSX, MDX, CSS, SCSS, HTML, Markdown, Vue, Svelte, and Astro files. The user copies a source file's path, opens a destination file, and pastes — the extension computes the relative path and inserts the correctly-shaped import statement for that language pair. Five commands, three keybindings, sixteen configuration settings.

---

## Commands & Keybindings

| Command | Title | macOS | Win / Linux | Context |
|---|---|---|---|---|
| `extension.copyFilePath` | Auto Import: Copy File Path | `Cmd+Shift+A` | `Ctrl+Shift+A` | `editorTextFocus \|\| filesExplorerFocus` |
| `extension.pasteImport` | Auto Import: Paste as Import | `Cmd+I` | `Ctrl+I` | `editorTextFocus` |
| `extension.copyPaste` | Auto Import: Insert Import from Selected File | `Alt+D` | `Alt+D` | `filesExplorerFocus` |
| `extension.pasteImportWithStyle` | Auto Import: Paste as Import (Pick Style) | — | — | Command Palette + copy-success toast button |
| `extension.setDefaultImportStyle` | Auto Import: Set Default Import Style | — | — | Command Palette only |

**Copy** puts the source file's absolute path on the clipboard and shows a "Copied path" toast with two action buttons: **Paste with Style** (runs Paste as Import (Pick Style)) and **Paste Now** (runs Paste as Import). The clipboard write is an explicit re-write after VS Code's built-in `copyFilePath` to guarantee the next paste sees the correct value.

**Paste** reads the clipboard as the source path, takes the active editor's file as the destination, computes the relative path, gates on the source-destination extension pair, and inserts the resulting import snippet.

**Insert Import from Selected File** runs Copy then Paste sequentially — a single keybind from the explorer sidebar.

**Paste as Import (Pick Style)** performs the same validation as Paste, but shows a QuickPick listing all applicable import styles for the source-destination pair. If only one style applies, the import is inserted directly without showing the picker.

**Set Default Import Style** shows a QuickPick listing all applicable styles. The current default is marked with a checkmark icon and appears first. Selecting a style persists the choice to VS Code global settings instead of inserting an import. Destinations that have only one hardcoded shape show a "No configurable style" warning instead.

---

## Supported File Extensions

35 extensions across 15 categories.

| Category | Extensions | Count |
|---|---|---|
| Script | `.ts`, `.tsx`, `.mdx`, `.js`, `.jsx` | 5 |
| Stylesheet | `.css`, `.scss` | 2 |
| HTML | `.html` | 1 |
| Markdown | `.md` | 1 |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | 7 |
| Font | `.woff`, `.woff2`, `.ttf`, `.eot` | 4 |
| Video | `.mp4`, `.webm`, `.mov` | 3 |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` | 4 |
| Text track | `.vtt` | 1 |
| Data | `.json` | 1 |
| YAML | `.yaml`, `.yml` | 2 |
| Document | `.pdf` | 1 |
| Vue | `.vue` | 1 |
| Svelte | `.svelte` | 1 |
| Astro | `.astro` | 1 |

---

## Cross-Import Compatibility

Which source extensions each destination accepts. A source-destination pair not listed here is rejected with a "Cannot import" warning.

### Same-extension destinations

`.js` and `.ts` destinations accept only their own extension. The source extension must equal the destination extension; cross-imports are rejected.

| Destination | Accepted source |
|---|---|
| `.js` | `.js` |
| `.ts` | `.ts` |

### Script-oriented destinations (JSX, TSX, MDX)

These accept script sources through their configurable import style, plus a broad set of non-script sources through hardcoded per-category dispatch.

| Source category | Extensions | `.jsx` | `.tsx` | `.mdx` |
|---|---|---|---|---|
| Script (JS) | `.js`, `.jsx` | Yes | Yes (JS fallback) | Yes (JS fallback) |
| Script (TS) | `.ts`, `.tsx` | — | Yes | Yes |
| CSS Modules | `.module.css`, `.module.scss` | Yes | Yes | Yes |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | Yes | Yes | Yes |
| Font | `.woff`, `.woff2`, `.ttf`, `.eot` | Yes | Yes | Yes |
| Video | `.mp4`, `.webm`, `.mov` | Yes | Yes | Yes |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` | Yes | Yes | Yes |
| Text track | `.vtt` | Yes | Yes | Yes |
| Data | `.json` | Yes | Yes | Yes |
| YAML | `.yaml`, `.yml` | Yes | Yes | Yes |
| Document | `.pdf` | Yes | Yes | Yes |
| Markup | `.html`, `.md`, `.mdx` | Yes | Yes | Yes |
| Stylesheet | `.css`, `.scss` | Yes | Yes | Yes |
| Component | `.vue`, `.svelte`, `.astro` | Yes | Yes | Yes |

### Stylesheet destinations

| Source category | Extensions | `.css` | `.scss` |
|---|---|---|---|
| Same stylesheet | `.css` / `.scss` | `.css` only | `.scss`, `.css` |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | Yes | Yes |

### Markup destinations

| Source category | Extensions | `.html` | `.md` |
|---|---|---|---|
| Script | `.js` | Yes | — |
| Stylesheet | `.css` | Yes | — |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | Yes | Yes |
| Video | `.mp4`, `.webm`, `.mov` | Yes | — |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` | Yes | — |
| Text track | `.vtt` | Yes | — |
| Markdown | `.md` | — | Yes |

`.html` to `.html` is always rejected — no relative-import syntax exists for HTML embedding itself.

### Framework component destinations

| Source category | Extensions | `.vue` | `.svelte` | `.astro` |
|---|---|---|---|---|
| Self | `.vue` / `.svelte` / `.astro` | `.vue` | `.svelte` | `.astro`, `.vue`, `.svelte` |
| Script | `.ts`, `.js`, `.jsx`, `.tsx` | Yes | Yes | Yes |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | Yes | Yes | Yes |
| Video | `.mp4`, `.webm`, `.mov` | Yes | Yes | Yes |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` | Yes | Yes | Yes |
| Text track | `.vtt` | Yes | Yes | Yes |
| Data | `.json` | Yes | Yes | Yes |
| YAML | `.yaml`, `.yml` | Yes | Yes | Yes |
| Markdown | `.md`, `.mdx` | — | — | Yes |

### Rejection rules

1. **Same file**: source path equals destination path (case-insensitive) — "A file cannot import itself."
2. **Unsupported pair**: source extension not in the destination's accepted list — "Cannot import {ext} into {ext} files."
3. **Empty snippet**: if the snippet builder produces an empty or newline-only string, the pair is treated as unsupported.

---

## Import Statement Styles

### JavaScript

7 configurable styles. Setting: **`auto-import.importStatement.script.javascriptImportStyle`**. Default: index 0.

Used for `.js` destinations, and for `.js`/`.jsx` sources imported into `.jsx` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `import name from './path';` | ES module: default import **(default)** |
| 1 | `import { name } from './path';` | ES module: named import |
| 2 | `import name, { other } from './path';` | ES module: default + named |
| 3 | `import * as name from './path';` | ES module: namespace import |
| 4 | `import './path';` | ES module: side-effect (no binding) |
| 5 | `const name = require('./path');` | CommonJS require |
| 6 | `const name = await import('./path');` | Dynamic import |

### TypeScript

7 configurable styles. Setting: **`auto-import.importStatement.script.typescriptImportStyle`**. Default: index 0.

Used for `.ts` destinations, for `.ts`/`.tsx` sources imported into `.tsx`/`.mdx` destinations, and for all script sources imported into `.vue`/`.svelte`/`.astro` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `import { name } from './path';` | ES module: named import **(default)** |
| 1 | `import name from './path';` | ES module: default import |
| 2 | `import * as name from './path';` | ES module: namespace import |
| 3 | `import './path';` | ES module: side-effect (no binding) |
| 4 | `import type { name } from './path';` | Type-only import (TS 3.8+) |
| 5 | `import { name, type Type } from './path';` | Mixed value + type (TS 4.5+) |
| 6 | `const name = await import('./path');` | Dynamic import |

**Angular legacy auto-fill** (index 0 only): when the source path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the placeholder is pre-filled with a PascalCase identifier derived from the filename — for example, `app-root.component.ts` produces `import { AppRootComponent } from './path';`. Other indexes use a generic placeholder.

**Exported class detection** (`.ts` destinations only): when the source file contains an `export class Name` or `export abstract class Name` declaration, the class name is pre-filled into the placeholder at index 0. This takes priority over Angular legacy auto-fill when both would apply. Other destinations that use the TypeScript import style (`.tsx`, `.mdx`, `.vue`, `.svelte`, `.astro`) do not perform class detection — index 0 falls through to Angular legacy auto-fill or an anonymous tab stop.

### CSS stylesheet

2 configurable styles. Setting: **`auto-import.importStatement.styleSheet.cssImportStyle`**. Default: index 0.

Used for `.css` source imported into `.css` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `@import './path';` | Quoted path **(default)** |
| 1 | `@import url('./path');` | url() function |

### CSS image — hardcoded

1 shape, not configurable.

Used for image sources imported into `.css` destinations.

```
url('./path')
```

Inserted inline at the exact cursor position (line and column). No trailing newline — this is a CSS value fragment, not a standalone statement.

### SCSS stylesheet

5 configurable styles. Setting: **`auto-import.importStatement.styleSheet.scssImportStyle`**. Default: index 0.

Used for `.scss` and `.css` sources imported into `.scss` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `@use './path';` | Modern @use — Sass module system **(default)** |
| 1 | `@use './path' as *;` | @use with wildcard alias |
| 2 | `@use './path' as name;` | @use with named alias |
| 3 | `@forward './path';` | Module re-export (barrel pattern) |
| 4 | `@import './path';` | Legacy @import (Sass-deprecated) |

**SCSS partial normalization**: a leading `_` on the last path segment is stripped — `_variables.scss` becomes `variables` in the import path.

**SCSS `.css` preservation**: the `.css` extension is always kept on the import path regardless of the `preserveStylesheetFileExtension` setting. Sass requires it to recognize a foreign-language import.

### SCSS image — hardcoded

1 shape, not configurable. Reuses the CSS image builder.

```
url('./path')
```

Same inline insertion behavior as CSS image.

### HTML script

5 configurable styles. Setting: **`auto-import.importStatement.markup.htmlScriptImportStyle`**. Default: index 0.

Used for `.js` source imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<script src="./path"></script>` | Modern minimal **(default)** |
| 1 | `<script src="./path" defer></script>` | Deferred execution |
| 2 | `<script type="module" src="./path"></script>` | ES module |
| 3 | `<script src="./path" async></script>` | Async execution |
| 4 | `<script type="text/javascript" src="./path"></script>` | Legacy |

### HTML image

3 configurable styles. Setting: **`auto-import.importStatement.markup.htmlImageImportStyle`**. Default: index 0.

Used for image sources imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<img src="./path" alt="sample">` | Standard **(default)** |
| 1 | `<img src="./path" alt="" loading="lazy">` | Lazy loading |
| 2 | `<img src="./path" alt="" width="" height="">` | Explicit dimensions (CLS prevention) |

### HTML video

4 configurable styles. Setting: **`auto-import.importStatement.markup.htmlVideoImportStyle`**. Default: index 0.

Used for video sources (`.mp4`, `.webm`, `.mov`) imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<video src="./path" controls></video>` | Accessible default **(default)** |
| 1 | `<video src="./path" autoplay muted loop playsinline></video>` | Silent autoplay (hero sections) |
| 2 | `<video src="./path" controls poster=""></video>` | Custom poster thumbnail |
| 3 | `<video src="./path" controls preload="metadata"></video>` | Metadata preload (Core Web Vitals) |

### HTML audio

2 configurable styles. Setting: **`auto-import.importStatement.markup.htmlAudioImportStyle`**. Default: index 0.

Used for audio sources (`.mp3`, `.ogg`, `.wav`, `.m4a`) imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<audio src="./path" controls></audio>` | Accessible default **(default)** |
| 1 | `<audio src="./path" controls preload="metadata"></audio>` | Metadata preload |

### HTML stylesheet — hardcoded

1 shape, not configurable.

Used for `.css` source imported into `.html` destinations.

```
<link href="./path" rel="stylesheet">
```

### HTML text track — hardcoded

1 shape, not configurable.

Used for `.vtt` source imported into `.html` destinations.

```
<track src="./path" kind="subtitles" srclang="en" label="English">
```

The `srclang` and `label` values are snippet placeholders that the user fills in after insertion.

### Markdown link — hardcoded

1 shape, not configurable.

Used for `.md` source imported into `.md` destinations.

```
[text](./path)
```

### Markdown image

3 configurable styles. Setting: **`auto-import.importStatement.markup.markdownImageImportStyle`**. Default: index 0.

Used for image sources imported into `.md` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `![alt-text](./path)` | Bare inline image **(default)** |
| 1 | `![alt-text](./path "Hover text")` | Inline with title |
| 2 | `<img src="./path" alt="" width="" height="">` | HTML embed (CLS prevention) |

### JSX / TSX / MDX non-script sources

When a non-script source is imported into a `.jsx`, `.tsx`, or `.mdx` destination, the import shape is determined by the source's category rather than a configurable setting. All placeholders (`styles`, `name`, `url`) are editable — the cursor lands on them after insertion.

| Source category | Extensions | Snippet |
|---|---|---|
| CSS Modules | `.module.css`, `.module.scss` | `import styles from './path';` |
| Image, data, markup, component, document | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp`, `.json`, `.html`, `.yml`, `.yaml`, `.md`, `.mdx`, `.pdf`, `.vue`, `.svelte`, `.astro` | `import name from './path';` |
| Media, text track | `.mp4`, `.webm`, `.mov`, `.mp3`, `.ogg`, `.wav`, `.m4a`, `.vtt` | `import url from './path';` |
| Font, stylesheet | `.woff`, `.woff2`, `.ttf`, `.eot`, `.css`, `.scss` | `import './path';` |

**Script routing**: `.jsx` destinations route `.js` and `.jsx` sources through the JavaScript import style. `.tsx` and `.mdx` destinations route `.ts` and `.tsx` sources through the TypeScript import style, and `.js` sources through the JavaScript import style as a fallback.

### Vue / Svelte / Astro

Script sources (`.ts`, `.tsx`, `.js`, `.jsx`) use the TypeScript import style. Non-script sources also use the TypeScript import builder with the full source extension preserved on the path.

---

## Placement

### Configurable modes

Setting: **`auto-import.preferences.importStatementPlacement`**. Default: `"Bottom"`.

| Mode | Behavior |
|---|---|
| **Top** | Insert before the first line of the file (line 0). |
| **Bottom** | Insert after the last recognized import line. Falls back to line 0 if no import is found. |
| **Cursor** | Insert at the current cursor position. |

### Bottom mode — import line detection

Bottom mode scans the document line by line for lines containing any of these 9 markers:

```
import 
require(
@import '
@import "
@import url(
@use '
@use "
@forward '
@forward "
```

Lines starting with `//`, `/*`, or `*` (comment lines) are skipped during the scan. The import is inserted on the line after the last match. If no marker matches, falls back to line 0.

### Placement overrides

These overrides take effect regardless of the user's placement setting.

| Condition | Forced placement | Reason |
|---|---|---|
| HTML or Markdown destination | Cursor (line and column) | No canonical "top of file" for embedded tags. |
| Non-stylesheet source into stylesheet destination (e.g., image into `.css`/`.scss`) | Inline at exact cursor position (line and column), no trailing newline | `url()` is a CSS value fragment, not a standalone statement. |

### Astro frontmatter constraint

For `.astro` destinations, import placement is constrained to within the `---` frontmatter fences.

| Mode | Behavior |
|---|---|
| Top | Insert after the opening `---` line. |
| Bottom | Scan the frontmatter region for import markers, insert after the last match. Falls back to after the opening `---`. |
| Cursor | Insert at the cursor line if the cursor is strictly between the `---` lines (not on the fence lines themselves). Otherwise falls back to Bottom. |

If no frontmatter exists, a new `---` block is created at line 0 and the import is placed inside it.

### Vue / Svelte script block constraint

For `.vue` and `.svelte` destinations, import placement is constrained to within a `<script>` block. For Vue, `<script setup>` is preferred over bare `<script>` when both exist.

| Mode | Behavior |
|---|---|
| Top | Insert after the opening `<script...>` tag. |
| Bottom | Scan the script block for import markers, insert after the last match. Falls back to after the opening tag. |
| Cursor | Insert at the cursor line if the cursor is strictly between the `<script>` and `</script>` lines (not on the tag lines themselves). Otherwise falls back to Bottom. |

If no script block exists, a new `<script>`/`</script>` pair is created at line 0 and the import is placed inside it.

### Insertion column

| Destination type | Column |
|---|---|
| Script (`.ts`, `.tsx`, `.mdx`, `.js`, `.jsx`, `.vue`, `.svelte`, `.astro`) | Column 0 |
| Stylesheet (`.css`, `.scss`) | Column 0 |
| HTML, Markdown | Cursor's current column |

---

## Configuration Reference

### Preferences

| Setting | Type | Default | Values |
|---|---|---|---|
| `auto-import.preferences.importStatementPlacement` | string | `"Bottom"` | `"Top"`, `"Bottom"`, `"Cursor"` |

### Script

| Setting | Type | Default | Values |
|---|---|---|---|
| `auto-import.importStatement.script.preserveScriptFileExtension` | boolean | `false` | `true` / `false` |
| `auto-import.importStatement.script.javascriptImportStyle` | string | `"import name from '_relativePath_';"` | 7 enum values (see JavaScript styles) |
| `auto-import.importStatement.script.typescriptImportStyle` | string | `"import { name } from '_relativePath_';"` | 7 enum values (see TypeScript styles) |

### Stylesheet

| Setting | Type | Default | Values |
|---|---|---|---|
| `auto-import.importStatement.styleSheet.preserveStylesheetFileExtension` | boolean | `false` | `true` / `false` |
| `auto-import.importStatement.styleSheet.cssImportStyle` | string | `"@import '_relativePath_';"` | 2 enum values (see CSS styles) |
| `auto-import.importStatement.styleSheet.cssImageImportStyle` | string | `"url('_relativePath_')"` | 1 value (hardcoded) |
| `auto-import.importStatement.styleSheet.scssImportStyle` | string | `"@use '_relativePath_';"` | 5 enum values (see SCSS styles) |
| `auto-import.importStatement.styleSheet.scssImageImportStyle` | string | `"url('_relativePath_')"` | 1 value (hardcoded) |

### Markup

| Setting | Type | Default | Values |
|---|---|---|---|
| `auto-import.importStatement.markup.htmlScriptImportStyle` | string | `"<script src=\"_relativePath_\"></script>"` | 5 enum values (see HTML script styles) |
| `auto-import.importStatement.markup.htmlImageImportStyle` | string | `"<img src=\"_relativePath_\" alt=\"sample\">"` | 3 enum values (see HTML image styles) |
| `auto-import.importStatement.markup.htmlVideoImportStyle` | string | `"<video src=\"_relativePath_\" controls></video>"` | 4 enum values (see HTML video styles) |
| `auto-import.importStatement.markup.htmlAudioImportStyle` | string | `"<audio src=\"_relativePath_\" controls></audio>"` | 2 enum values (see HTML audio styles) |
| `auto-import.importStatement.markup.htmlStyleSheetImportStyle` | string | `"<link href=\"_relativePath_\" rel=\"stylesheet\">"` | 1 value (hardcoded) |
| `auto-import.importStatement.markup.markdownImportStyle` | string | `"[text](_relativePath_)"` | 1 value (hardcoded) |
| `auto-import.importStatement.markup.markdownImageImportStyle` | string | `"![alt-text](_relativePath_)"` | 3 enum values (see Markdown image styles) |

**Note**: four settings have only a single enum value (`cssImageImportStyle`, `scssImageImportStyle`, `htmlStyleSheetImportStyle`, `markdownImportStyle`). These appear in the VS Code Settings UI for completeness but are not configurable at runtime — the extension always produces the one hardcoded shape.

---

## UX & Notifications

All commands clear existing notifications before executing. Any toast from a previous command is dismissed when a new command starts.

### Workflow: Copy → Paste

1. The user selects a source file and runs **Copy File Path** (`Cmd+Shift+A` / `Ctrl+Shift+A`).
2. The extension delegates to VS Code's built-in `copyFilePath`, reads the clipboard back, and re-writes the same string to guarantee consistency.
3. An info toast appears: "Copied path — {basename}" with two buttons:
   - **Paste with Style** — runs Paste as Import (Pick Style)
   - **Paste Now** — runs Paste as Import
4. The user opens the destination file and runs **Paste as Import** (`Cmd+I` / `Ctrl+I`).
5. The extension reads the clipboard, computes the relative path, validates the source-destination pair, and inserts the import snippet.

### Workflow: One-Shot (Copy-Paste)

The user clicks a file in the explorer and runs **Insert Import from Selected File** (`Alt+D`). The extension runs Copy then Paste sequentially. Aborts if copy fails.

### Workflow: Pick Style

Same validation as Paste. Shows a QuickPick with all applicable styles for the current source-destination pair. The picker placeholder reads "Select an import style". The picker supports filtering by description text — typing part of a style description narrows the list. If only one style applies, the import is inserted directly without showing the picker. Pressing Escape dismisses the picker silently.

### Workflow: Set Default Style

Same validation as Pick Style. Shows a QuickPick with placeholder "Set default import style". The picker supports filtering by description text — typing part of a style description narrows the list. The current default is marked with a checkmark icon and appears first. Selecting a style persists the choice to VS Code global settings and shows a confirmation toast. Destinations with only one hardcoded shape show a "No configurable style" warning instead.

### Clipboard validation

Before generating an import, the extension validates the clipboard contents against three checks:

- **Empty or not an absolute path**: clipboard text is blank after trimming, or is not an absolute file path (e.g., a relative path or arbitrary text). Triggers the "Clipboard does not contain a file path" warning.
- **No file extension**: the path has no extension (e.g., `Makefile`, `Dockerfile`, a directory path). Triggers the "{basename} has no file extension" warning.

After validation passes, the extension checks that the source file still exists on disk. If it has been deleted or moved, the "Source file no longer exists: {basename}" warning appears.

### Notification reference

All messages are prefixed with "Auto Import:".

| Condition | Level | Message | Action buttons |
|---|---|---|---|
| Copy succeeded | Info | Copied path — {basename} | **Paste with Style**, **Paste Now** |
| Default style saved | Info | Default style saved — {description} | — |
| Same file | Warning | A file cannot import itself. | — |
| Unsupported pair | Warning | Cannot import {sourceExt} into {destinationExt} files. | **View Supported Files** |
| No active editor | Warning | Open a file to paste an import. | — |
| No file to copy | Warning | No file selected to copy. | — |
| No file extension | Warning | {basename} has no file extension. | — |
| Empty clipboard | Warning | Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first. | — |
| Source not found | Warning | Source file no longer exists: {basename}. | — |
| No configurable style | Warning | {sourceExt} → {destinationExt} imports use a fixed style. | — |

---

## Path Computation

**Relative path**: computed via Node's `path.relative` from the destination file's directory to the source file. Always uses Unix-style forward slashes, including on Windows.

**`./` prefix**: added when the source and destination are in the same directory (case-insensitive directory comparison for macOS/Windows compatibility), or when `path.relative` produces a result that does not already start with `.`.

**Extension stripping**: script (`.ts`, `.tsx`, `.mdx`, `.js`, `.jsx`) and stylesheet (`.css`, `.scss`) extensions are stripped from the import path by default. The `preserveScriptFileExtension` and `preserveStylesheetFileExtension` settings override this. HTML, Markdown, and all other source types (images, fonts, media, data, documents, YAML, components) always preserve the full extension.

**SCSS partial normalization**: a leading `_` on the last path segment is stripped to match Sass's partial-resolution convention. `_variables.scss` becomes `variables` in the import path.

**SCSS `.css` preservation**: the `.css` extension is always kept on SCSS import paths regardless of the `preserveStylesheetFileExtension` setting. Sass requires it to distinguish foreign-language imports.

**Angular legacy PascalCase** (TypeScript style index 0 only): when the source path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the named import placeholder is pre-filled with a PascalCase identifier derived from the filename. Example: `app-root.component.ts` produces `{ AppRootComponent }`.

**Exported class detection** (TypeScript style index 0, `.ts` destinations only): when the source file contains an `export class Name` or `export abstract class Name` declaration, the class name is pre-filled into the named import placeholder. This takes priority over Angular legacy PascalCase when both would apply. Does not apply when importing into `.tsx`, `.mdx`, `.vue`, `.svelte`, or `.astro` destinations.

---

## Snippet Placeholders

After an import is inserted, the cursor lands on the first editable position. Press Tab to advance to the next.

### Pre-filled placeholders

These show default text that the user can overwrite by typing.

| Placeholder | Meaning | Appears in |
|---|---|---|
| `styles` | CSS Module binding | JSX/TSX/MDX CSS Module import (`import styles from`) |
| `name` | Generic import binding | JSX/TSX/MDX non-script import (`import name from`) |
| `url` | Media file binding | JSX/TSX/MDX media/text-track import (`import url from`) |
| `text` | Link display text | Markdown link (`[text](path)`) |
| `alt-text` | Image alt text | Markdown image (`![alt-text](path)`) |
| `Hover text` | Image title | Markdown image with title (`"Hover text"`) |
| `en` | Language code | HTML text track (`srclang="en"`) |
| `English` | Language label | HTML text track (`label="English"`) |
| `*` | Wildcard alias (overwrite to namespace) | SCSS `@use as *` (index 1) |

### Tab stops

All other editable positions are anonymous tab stops — the cursor lands there with no default text, and the user types from scratch. JS/TS imports place the cursor on the binding name. TS index 0 pre-fills the binding with a detected class name or Angular PascalCase identifier when available; otherwise it is an empty tab stop. HTML image indexes 1–2 place tab stops on `alt`, `width`, `height`. SCSS `@use as` index 2 places an anonymous tab stop on the alias.

HTML image index 0 uses the literal word `sample` as alt text — this is static output, not an editable position.

---

## Companion Extension

The extension pack includes **Drag Import Relative Path** (`ElecTreeFrying.drag-import-relative-path`), which provides drag-and-drop import generation using the same import logic.
