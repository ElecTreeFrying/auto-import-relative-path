# Auto Import Relative Path — Functionality Specification

A VS Code extension that generates relative-path import statements for JS, TS, JSX, TSX, MDX, CSS, SCSS, HTML, Markdown, Vue, Svelte, and Astro files. Two input gestures: **copy-paste** (copy a source file's path, open a destination, paste) and **drag-and-drop** (drag a file from the Explorer into an open editor). Both compute the relative path and insert the correctly-shaped import statement for that language pair. Five commands, three keybindings, one drop provider, sixteen configuration settings.

---

## Commands & Keybindings

| Command | Title | macOS | Win / Linux | Context |
|---|---|---|---|---|
| `extension.copyFilePath` | Auto Import: Copy File Path | `Cmd+Shift+A` | `Ctrl+Shift+A` | `editorTextFocus \|\| filesExplorerFocus` |
| `extension.pasteImport` | Auto Import: Paste as Import | `Cmd+I` | `Ctrl+I` | `editorTextFocus` |
| `extension.copyPaste` | Auto Import: Insert Import from Selected File | `Alt+D` | `Alt+D` | `filesExplorerFocus` |
| `extension.pasteImportWithStyle` | Auto Import: Paste as Import (Pick Style) | — | — | Command Palette + copy-success toast button |
| `extension.setDefaultImportStyle` | Auto Import: Set Default Import Style | — | — | Command Palette only |

**Copy** puts the source file's absolute path on the clipboard and shows a "Copied path" toast with two action buttons: **Paste with Style** (runs Paste as Import (Pick Style)) and **Paste Now** (runs Paste as Import). The clipboard write is an explicit re-write after VS Code's built-in `copyFilePath` to guarantee the next paste sees the correct value. If the active item has no copyable absolute file path, Copy shows a "No file selected to copy." warning and stops. If the copied path has no file extension (e.g. `Makefile`, `Dockerfile`), Copy shows a "{basename} has no file extension." warning instead.

**Paste** reads the clipboard as the source path, takes the active editor's file as the destination, computes the relative path, gates on the source-destination extension pair, and inserts the resulting import snippet.

**Insert Import from Selected File** runs Copy then Paste sequentially — a single keybind from the explorer sidebar.

**Paste as Import (Pick Style)** performs the same validation as Paste, but shows a QuickPick listing all applicable import styles for the source-destination pair. If only one style applies, the import is inserted directly without showing the picker.

**Set Default Import Style** shows a QuickPick listing all applicable styles. The current default is marked with a checkmark icon and appears first. If the persisted value matches none of the offered styles (for example, a custom value hand-typed into `settings.json`), no item is marked and the styles appear in their natural order with no current-default indicator. Selecting a style persists the choice to VS Code global settings instead of inserting an import. Destinations that have only one hardcoded shape show a "No configurable style" warning instead.

---

## Drag-and-Drop Import

Dragging a file from VS Code's Explorer tree into a supported editor generates the same import snippet as the paste commands. The drop provider activates for all 12 supported destination languages and uses the same snippet styles, gating rules, and configuration settings — no separate configuration is needed.

### Supported destination languages

The provider registers against: JavaScript, JavaScriptReact, TypeScript, TypeScriptReact, CSS, SCSS, HTML, Markdown, Vue, Svelte, Astro, and MDX. Each language is registered with `scheme: 'file'`, so the provider activates only for on-disk, file-backed documents; untitled, in-memory, and non-`file`-scheme (e.g. remote or virtual) documents are excluded even when their language is one of the 12 above.

Beyond the per-language `scheme: 'file'` filter, the provider is registered with `dropMimeTypes: [ 'text/uri-list' ]`, so VS Code only invokes it for drag payloads carrying a `text/uri-list` MIME type (the standard Explorer drag payload) — a second registration-time gate alongside the language/scheme selector. Because of this gate, the `text/plain` fallback below is reached only when a drag does carry `text/uri-list` but its first-line value is empty/whitespace.

### Behavior

1. The source file's path is resolved from the drag payload: the `text/uri-list` value is tried first (its first line is parsed via `Uri.parse(...).fsPath`); only if that is absent/empty is the `text/plain` value used, and then **only when it is an absolute path** (`path.isAbsolute`). A relative `text/plain` value is not accepted (the provider yields no drop edit). When several files are dragged from the Explorer at once, VS Code delivers them as a newline-separated `text/uri-list`, but only the first URI is parsed; the remaining dragged files are ignored, so one drop produces at most one import.
   - **Unresolvable payload**: if step 1 yields no usable path (the drag has neither a `text/uri-list` entry nor an absolute `text/plain` value), the provider returns `null` silently — no toast and no drop edit are offered. This is the only drop rejection path with no notification; the same-file, unsupported-pair, and empty-snippet checks below each show a toast.
2. The destination is the file receiving the drop.
3. **Same-file check**: if source equals destination (case-insensitive), a "same file" toast appears and nothing is inserted.
4. **Pair gating**: if the source-destination extension pair is unsupported, a "Cannot import" toast appears and nothing is inserted (the provider returns `null`).
5. **Snippet generation**: the import snippet is produced by the same per-language dispatch used by the paste commands. All configurable styles and settings apply.
6. **Empty-snippet guard**: if the generated snippet is empty or newline-only (`snippet.value === '' || snippet.value === '\n'`) — an unsupported source/destination combination that cleared pair gating but produced a no-op, e.g. a `.ts` source into a `.jsx` destination — a "Cannot import" toast appears (the same `not-supported` message and `{ sourceExt, destinationExt }` payload as Pair gating, from a distinct call site) and nothing is inserted (the provider returns `null`). See Rejection rules #3.
7. **Insertion**: the snippet's final position is determined by `computeImportPlacement()` — the same Top / Bottom / Cursor logic used by the paste commands, parameterized with the drop position as the cursor input. For inline snippets (e.g., images into CSS/SCSS), the `DocumentDropEdit` places the snippet directly at the drop coordinates. For non-inline snippets, a `WorkspaceEdit` via `additionalEdit` places the import at the computed position (not the drop position). Every drop edit (both the inline path and the non-inline `additionalEdit` path) is tagged with the title `Auto Import` and the kind `DocumentDropOrPasteEditKind.TextUpdateImports.append('autoImport')`, so VS Code surfaces it as the "Auto Import" option in the drop-edit picker.

### Differences from paste commands

| Aspect | Paste commands | Drag-and-drop |
|---|---|---|
| Source path origin | System clipboard | DataTransfer from Explorer drag |
| Insertion position | Configurable (Top / Bottom / Cursor) | Computed by `computeImportPlacement()` (Top / Bottom / Cursor) — drop position used as Cursor input |
| Astro / Vue / Svelte constraint | Frontmatter / script block | Same constraint (frontmatter / script block via `computeImportPlacement`) |
| Clipboard validation | Checks for empty/non-absolute/no-extension | Not applicable (Explorer provides a valid file URI) |
| Source file existence check | `vscode.workspace.fs.stat` before generating | Not performed (Explorer only offers existing files) |
| Unsupported pair fallback | Warning toast, no insertion | Warning toast, no insertion (provider returns `null`) |

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

Exactly ten destinations may import a source of a *different* extension (the cross-import set): `.html`, `.md`, `.css`, `.scss`, `.tsx`, `.mdx`, `.jsx`, `.vue`, `.svelte`, `.astro`. Every other destination accepts only its own extension (the same-extension default; see `.js`/`.ts` below). The per-destination tables that follow detail the accepted sources for each destination.

### Same-extension destinations

`.js` and `.ts` destinations accept only their own extension. The source extension must equal the destination extension; cross-imports are rejected.

| Destination | Accepted source |
|---|---|
| `.js` | `.js` |
| `.ts` | `.ts` |

### Script-oriented destinations (JSX, TSX, MDX)

These accept script sources through their configurable import style, plus a broad set of non-script sources through hardcoded per-category dispatch.

Mechanically, `.jsx`/`.tsx`/`.mdx` carry NO per-destination source allow-list in `gating.ts` — unlike the stylesheet, markup, and same-extension destinations below (each backed by a `*_SUPPORTED_EXTENSIONS` clause), these three are accepted purely by membership in `CROSS_IMPORT_DESTINATIONS` and therefore accept ANY source extension that clears the cross-import gate. The table below enumerates today's full 35-extension set, so it is exhaustive in practice; but a newly added file extension is auto-accepted into these three destinations with no gating change. It still needs a source branch in the shared `_react.ts:buildAssetImportStatement` switch — the single canonical asset switch, reached for JSX/TSX/MDX from the default paste flow via `buildReactImport` and the style-picker flow via `variants.ts:buildReactNonScriptVariant` (and, for non-script sources into `.vue`/`.svelte`/`.astro` destinations, from `languages/framework-component.ts`) — to emit a non-empty snippet; without one the extension falls through to that switch's `default:` (`null`), which the paste flow wraps as an empty `SnippetString` and the picker flow drops as a missing variant.

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

Pair gating is implemented by `isPairSupported(info)` in `src/gating.ts`, a single boolean that reads only the source/destination extension fields (no path data) and evaluates nine reject clauses in order: the universal cross-import gate, the explicit `.html → .html` reject, then seven per-destination allow-list guards. The first matching clause rejects; a pair is accepted only by surviving all nine — there is no positive early-return. (The same-file and empty-snippet rules below are separate checks in the calling commands/drop provider, not part of this boolean.)

1. **Same file**: source path equals destination path (case-insensitive) — "A file cannot import itself."
2. **Unsupported pair**: source extension not in the destination's accepted list — "Cannot import {ext} into {ext} files."
3. **Empty snippet**: if the import generator produces an empty or newline-only string, the pair is treated as unsupported. This happens two ways: (a) a per-language builder has no branch for the source (e.g. a `.ts` source into a `.jsx` destination, which passes pair gating but has no script branch), or (b) the destination-extension dispatcher (`snippets/dispatch.ts`) has no `case` for the destination — reached by same-extension pairs that clear the same-file/same-extension gate but have no import syntax, such as `.json` → `.json` or `.png` → `.png` (there is no `.json`/`.png` builder at all). In both cases the empty snippet signals the calling command/drop provider to treat the pair as unsupported.

---

## Import Statement Styles

**Configuration drift**: every styled builder resolves the persisted style by exact-matching the setting value against its enum description strings (`resolveStyleIndex`, byte-identical string equality). The stored value is the full option string (e.g. `import name from '_relativePath_';`), not an index. If the value matches none — a typo, a stray space, a value left over after an option string changed across an extension update, or one hand-edited into `settings.json` — resolution yields no index and the renderer silently falls back to that language's index-0 shape (e.g. JavaScript → `import name from './path';`) rather than erroring or inserting nothing. This is the snippet-insertion behavior on both the paste and drag-drop paths; no error, toast, or log is shown. It is distinct from the Set Default Style picker, which separately surfaces an unmatched value by showing no current-default checkmark (see Set Default Import Style). Hardcoded single-shape destinations are unaffected — they never consult the setting. Each style setting's enum strings are kept byte-identical at three sites — the `package.json` `enum`, the matching `ImportStyle[]` `description` strings in `snippets/_styles.ts` (matched by string equality), and each language's per-style `…ByStyle` switch (keyed by numeric index) — with every such switch ending in a `default:` arm emitting the index-0 shape, so drift at any site degrades to the default style rather than an error.

In the style picker, each entry's label is the snippet shape with the source basename substituted (placeholders rendered as identifier text); its right-aligned description is a short tag. The "Description" column in the per-language tables below paraphrases that tag for every row — it is not a verbatim copy. The default (index 0) HTML image, video, and audio styles have no tag in code, so the picker shows their snippet shape as the description there.

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

**Angular legacy auto-fill** (index 0 only): when the source path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the placeholder is pre-filled with a PascalCase identifier derived from the filename — for example, `app-root.component.ts` produces `import { AppRootComponent } from './path';`. The derived name is validated against `/^[A-Za-z_$][\w$]*$/`; if it is not a legal JS identifier (e.g. a basename containing a space, or one whose first segment starts with a digit), the pre-fill is dropped and an anonymous `$1` tab stop is used instead. Other indexes use a generic placeholder.

**Exported class detection** (`.ts` destinations only): when the source file contains an `export class Name` or `export abstract class Name` declaration, the class name is pre-filled into the placeholder at index 0. This takes priority over Angular legacy auto-fill when both would apply. Other destinations that use the TypeScript import style (`.tsx`, `.mdx`, `.vue`, `.svelte`, `.astro`) do not perform class detection — index 0 falls through to Angular legacy auto-fill or an anonymous tab stop. Detection is line-anchored: only a class declared at column 0 (the very start of a line) is matched. An `export class` that is indented — including one nested inside a `namespace`/`module` block — is not detected, and index 0 then falls through to Angular legacy auto-fill (or, failing that, an anonymous tab stop). A default-exported class (`export default class Foo`) is likewise not detected: only the bare `export class`/`export abstract class` forms match, so a `default` between `export` and `class` is skipped and index 0 falls through to Angular legacy auto-fill (or, failing that, an anonymous tab stop). When a file declares multiple top-level exported classes, only the first (top-most by line order) is used for the pre-fill. Commented-out declarations are ignored — both `//` line comments and `/* */` block comments (including multi-line blocks) are stripped before scanning, so a commented-out `export class` does not pre-fill the placeholder. Class detection degrades silently: if the source file cannot be read (and unlike the pre-generation existence check, no warning is shown), index 0 simply uses its normal fallback — Angular legacy auto-fill or an anonymous tab stop.

**Config-drift fallback**: if the persisted `typescriptImportStyle` value matches none of the seven enum strings (unset, mistyped, or trailing-space drift, so `resolveStyleIndex` returns `undefined`), the builder still emits a usable `import { name } from './path';` — the index-0 shape, with exported-class pre-fill honored when a class was detected (`.ts` destinations). Unlike the explicitly-selected index 0, this drift path does NOT apply Angular legacy auto-fill, so a `.component`/`.directive`/`.pipe`/`.service`/`.module` source that would PascalCase-fill under a chosen index 0 instead gets a plain `$1` tab stop when index 0 is reached only via drift.

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
| **0** | `<img src="./path" alt="sample">` | **(default)** — no tag in code; picker shows the snippet shape |
| 1 | `<img src="./path" alt="" loading="lazy">` | Lazy loading |
| 2 | `<img src="./path" alt="" width="" height="">` | Explicit dimensions (CLS prevention) |

### HTML video

4 configurable styles. Setting: **`auto-import.importStatement.markup.htmlVideoImportStyle`**. Default: index 0.

Used for video sources (`.mp4`, `.webm`, `.mov`) imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<video src="./path" controls></video>` | **(default)** — no tag in code; picker shows the snippet shape |
| 1 | `<video src="./path" autoplay muted loop playsinline></video>` | Silent autoplay (hero sections) |
| 2 | `<video src="./path" controls poster=""></video>` | Custom poster thumbnail |
| 3 | `<video src="./path" controls preload="metadata"></video>` | Metadata preload (Core Web Vitals) |

### HTML audio

2 configurable styles. Setting: **`auto-import.importStatement.markup.htmlAudioImportStyle`**. Default: index 0.

Used for audio sources (`.mp3`, `.ogg`, `.wav`, `.m4a`) imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<audio src="./path" controls></audio>` | **(default)** — no tag in code; picker shows the snippet shape |
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
<track src="./path" kind="subtitles" srclang="en" label="English"></track>
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

Every shape in this table keeps the full real source extension on the path verbatim — neither preserve setting applies to these non-script imports.

**Script routing**: `.jsx` destinations route `.js` and `.jsx` sources through the JavaScript import style. `.tsx` and `.mdx` destinations route `.ts` and `.tsx` sources through the TypeScript import style, and `.js` and `.jsx` sources through the JavaScript import style as a fallback.

### Vue / Svelte / Astro

Script sources (`.ts`, `.tsx`, `.js`, `.jsx`) use the TypeScript import style. Non-script sources are dispatched by source category through the **same `buildAssetImportStatement` switch used by JSX/TSX/MDX** (`_react.ts`) — `import name from` for images, data, YAML, and components (and, for Astro destinations, Markdown sources); `import url from` for media and text tracks — with the full source extension preserved on the path. (The accepted category set is narrower here than for JSX/TSX/MDX: framework destinations don't accept fonts, stylesheets, or CSS Modules.)

---

## Placement

### Configurable modes

Setting: **`auto-import.preferences.importStatementPlacement`**. Default: `"Bottom"`.

| Mode | Behavior |
|---|---|
| **Top** | Insert before the first line of the file (line 0). |
| **Bottom** | Insert after the last recognized import line. Falls back to line 0 if no import is found. |
| **Cursor** | Insert at the current cursor line. If the cursor sits inside a comment block (lines starting with `//`, `/*`, or `*` after whitespace), the import is placed on the first line *above* that block, so it lands above commented-out code/prose rather than inside the comment. For Markdown destinations (`.md`, `.mdx`) a leading `*` is treated as content (bullet / emphasis), not a comment. |

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
| HTML or Markdown destination (`.html`, `.md` — **not** `.mdx`) | Cursor (line and column) | No canonical "top of file" for embedded tags. |
| Non-stylesheet source into stylesheet destination (e.g., image into `.css`/`.scss`) | Inline at exact cursor position (line and column), no trailing newline | `url()` is a CSS value fragment, not a standalone statement. |

`.mdx` is intentionally excluded from this forced-cursor override (`shouldRepositionCursor` checks only `.html`/`.md`); it follows the user's Top/Bottom/Cursor setting, though it is still treated as Markdown for `*`-comment handling (see Cursor mode above).

### Astro frontmatter constraint

For `.astro` destinations, import placement is constrained to within the `---` frontmatter fences.

| Mode | Behavior |
|---|---|
| Top | Insert after the opening `---` line. |
| Bottom | Scan the frontmatter region for import markers, insert after the last match. Falls back to after the opening `---`. |
| Cursor | Insert at the cursor line if the cursor is strictly between the `---` lines (not on the fence lines themselves). Otherwise falls back to Bottom. |

In Cursor mode, when the cursor is inside the block, the same comment-block walk-up applies before insertion. The inserted import is indented to match the surrounding block — Top uses the block's detected indentation (the indent of its first content line); Bottom reuses the last existing import's own indentation (falling back to the block's); Cursor uses the cursor line's own indentation (falling back to the block's). When Cursor falls back to Bottom (cursor outside the fences), it inherits Bottom's indentation. Imports inserted outside a frontmatter/script block (the general Top/Bottom/Cursor flow) are not re-indented. This rule applies to both the paste and drag-drop flows.

If no frontmatter exists, a new `---` block is created at line 0 and the import is placed inside it.

### Vue / Svelte script block constraint

For `.vue` and `.svelte` destinations, import placement is constrained to within a `<script>` block, chosen by a three-tier preference: (1) `<script setup>`; otherwise (2) a `<script>` whose opening tag does NOT contain `context=` (so a Svelte `<script context="module">` block is skipped in favor of the instance script); otherwise (3) the first `<script>` of any kind.

| Mode | Behavior |
|---|---|
| Top | Insert after the opening `<script...>` tag. |
| Bottom | Scan the script block for import markers, insert after the last match. Falls back to after the opening tag. |
| Cursor | Insert at the cursor line if the cursor is strictly between the `<script>` and `</script>` lines (not on the tag lines themselves). Otherwise falls back to Bottom. |

In Cursor mode, when the cursor is inside the block, the same comment-block walk-up applies before insertion. The inserted import is indented to match the surrounding block — Top uses the block's detected indentation (the indent of its first content line); Bottom reuses the last existing import's own indentation (falling back to the block's); Cursor uses the cursor line's own indentation (falling back to the block's). When Cursor falls back to Bottom (cursor outside the tags), it inherits Bottom's indentation. Imports inserted outside a frontmatter/script block (the general Top/Bottom/Cursor flow) are not re-indented. This rule applies to both the paste and drag-drop flows.

If no script block exists, a new `<script>`/`</script>` pair is created at line 0 and the import is placed inside it.

### Insertion column

| Destination type | Column |
|---|---|
| Script (`.ts`, `.tsx`, `.mdx`, `.js`, `.jsx`, `.vue`, `.svelte`, `.astro`) | Column 0 |
| Stylesheet (`.css`, `.scss`) | Column 0 |
| HTML, Markdown | Cursor's current column |

**Newline**: every non-inline import has a trailing newline appended before insertion, so each import occupies its own line. The inline `url()` path (the overrides row above) is the only exception. For the no-frontmatter and no-script-block fallbacks, this appended newline is also what lands the synthesized closing fence/tag on its own line — the created blocks are `---\n<import>\n---\n` and `<script>\n<import>\n</script>\n`.

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
   - Copy validates the read-back path: if it is empty or not absolute, a "No file selected to copy." warning appears and the workflow stops; if it has no file extension, a "{basename} has no file extension." warning appears and the workflow stops.
3. An info toast appears: "Copied path — {basename}" with two buttons:
   - **Paste with Style** — runs Paste as Import (Pick Style)
   - **Paste Now** — runs Paste as Import
4. The user opens the destination file and runs **Paste as Import** (`Cmd+I` / `Ctrl+I`).
5. The extension reads the clipboard, computes the relative path, validates the source-destination pair, and inserts the import snippet. A successful paste inserts the snippet silently — no confirmation toast appears (the silent Cmd+I/Ctrl+I UX); only the failure conditions in the Notification reference produce a toast. The same silent-insert applies to the Pick Style insert paths.

### Workflow: One-Shot (Copy-Paste)

The user clicks a file in the explorer and runs **Insert Import from Selected File** (`Alt+D`). The extension runs Copy then Paste sequentially. Aborts if copy fails.

### Workflow: Pick Style

Same validation as Paste. Shows a QuickPick with all applicable styles for the current source-destination pair. The picker placeholder reads "Select an import style". The picker enables `matchOnDescription`, so typing also filters against each row's description column — the style's short tag when it declares one (true for 35 of the 38 styled entries), otherwise the full style-description string. If only one style applies, the import is inserted directly without showing the picker. Pressing Escape dismisses the picker silently.

Each picker row's primary label is the rendered import shape itself, but (a) the path is shortened to the source file's basename — a source at `../../components/widget.tsx` shows as `widget`, keeping rows width-stable regardless of nesting depth — and (b) snippet placeholder syntax is converted to plain identifiers for display (`${1:styles}` → `styles`, `${1:name}`/`$1` → `name`, `${1:url}` → `url`, `@use '...' as ${1:*}` → `as *`). The full relative path is restored in the text actually inserted. The row's secondary text is the style's tag (or its full description when no tag is defined; empty for single-shape hardcoded destinations) — this is what "filter by description" matches against.

The picker is a one-shot override: it neither reads nor writes any persisted `*ImportStyle` setting. Unlike Set Default Import Style, the styles appear in their natural order with no current-default checkmark, and the chosen style applies to this insertion only — it does not change the saved default.

### Workflow: Set Default Style

Same validation as Pick Style. Shows a QuickPick with placeholder "Set default import style". The picker enables `matchOnDescription`, so typing also filters against each row's description column — the style's short tag when it declares one (true for 35 of the 38 styled entries), otherwise the full style-description string. The current default is marked with a checkmark icon and appears first. If the persisted value does not match any offered style (for example, a custom value hand-typed into `settings.json`), no item is marked and the styles appear in their natural order with no current-default indicator. Selecting a style persists the choice to VS Code global settings and shows a confirmation toast. Pressing Escape dismisses the picker silently — no setting is written and no confirmation toast appears. Destinations with only one hardcoded shape show a "No configurable style" warning instead.

### Clipboard validation

Before generating an import, the extension validates the clipboard contents against four checks, in this order:

- **Empty or not an absolute path**: clipboard text is blank after trimming, or is not an absolute file path (e.g., a relative path or arbitrary text). Triggers the "Clipboard does not contain a file path" warning.
- **No file extension**: the path has no extension (e.g., `Makefile`, `Dockerfile`, a directory path). Triggers the "{basename} has no file extension" warning.
- **Same file as destination**: the clipboard path equals the active editor's path (case-insensitive). Triggers the "A file cannot import itself." warning (the same rejection documented under Cross-Import Compatibility → Rejection rules #1). This check runs *before* the existence check below, so a path that is both nonexistent and equal to the destination reports this same-file warning, not "Source file no longer exists: {basename}".

After these checks pass, the extension checks that the source file still exists on disk. If it has been deleted or moved, the "Source file no longer exists: {basename}" warning appears.

**Copy-side variant**: the Copy File Path command runs the same empty/non-absolute and no-extension checks on the path it reads back, but with a *different* message for the empty/non-absolute case — it shows "No file selected to copy." (the `no-file-to-copy` message) instead of the `empty-clipboard` message the paste commands use. The no-extension message ("{basename} has no file extension.") is shared by both Copy and the paste commands.

### Notification reference

All messages are prefixed with "Auto Import:".

| Condition | Level | Message | Action buttons |
|---|---|---|---|
| Copy succeeded | Info | Copied path — {basename} | **Paste with Style**, **Paste Now** |
| Default style saved | Info | Default style saved — {settingValue} | — |
| Same file | Warning | A file cannot import itself. | — |
| Unsupported pair | Warning | Cannot import {sourceExt} into {destinationExt} files. | **View Supported Files** |
| No active editor | Warning | Open a file to paste an import. | — |
| No file to copy | Warning | No file selected to copy. | — |
| No file extension | Warning | {basename} has no file extension. | — |
| Empty clipboard | Warning | Clipboard does not contain a file path. | — |
| Source not found | Warning | Source file no longer exists: {basename}. | — |
| No configurable style | Warning | {sourceExt} → {destinationExt} imports use a fixed style. | — |

Clicking **View Supported Files** on the Unsupported pair toast opens the project README's supported-languages section (`https://github.com/ElecTreeFrying/auto-import-relative-path#supported-languages`) in the default browser; dismissing the toast does nothing.

`{settingValue}` is the persisted setting string written to `settings.json` — the byte-exact `package.json` enum value (the `_relativePath_` import shape), e.g. `import name from '_relativePath_';`, with the literal `_relativePath_` token shown unexpanded. It is **not** the human-readable phrase shown in the "Description" column of the style tables above (that phrase is the QuickPick row's description). A custom value hand-typed into `settings.json` would likewise be echoed verbatim.

The two near-duplicate empty/non-absolute messages differ by originating command: **No file to copy** is emitted only by the Copy File Path command, while **Empty clipboard** is emitted by the three paste commands (Paste as Import, Paste as Import (Pick Style), Set Default Import Style). The **No file extension** row is shared by both Copy and the paste commands.

---

## Path Computation

**Relative path**: computed via Node's `path.relative` from the destination file's directory to the source file. Always uses Unix-style forward slashes, including on Windows.

**`./` prefix**: added when `path.relative`'s result (after Unix-slash normalization via `toUnixPath`) does not already start with `.`. The decision is a single `relativePath.startsWith('.')` test in `computeRelative` (`src/path/relative.ts`) — there is no source-vs-destination directory comparison and no case-folding anywhere in this file. Same-directory imports receive the prefix implicitly, because `path.relative` returns a bare filename (e.g. `foo` / `utils/helper`) for them, which does not begin with `.`. Paths that already begin with `../` are left untouched (prefixing would emit a redundant `./../`). (The only case-insensitive path comparisons in the extension are the same-*file* rejection checks in the paste/drop commands, which compare full file paths upstream — unrelated to this prefix rule.)

**Extension stripping**: the import path keeps or drops the source extension depending on which builder renders it.

- **Script sources** (`.ts`, `.tsx`, `.js`, `.jsx`): the extension is stripped by default and kept when `preserveScriptFileExtension` is on. This applies for script destinations (`.js`/`.ts`/`.jsx`/`.tsx`/`.mdx`) and for script sources into `.vue`/`.svelte`/`.astro`. (`.mdx` is never a *script source* — no builder strips an `.mdx` path; see the exception below.)
- **`.scss` source → `.scss` destination**: the `.scss` extension is stripped by default and kept when `preserveStylesheetFileExtension` is on. (A `.css` source into `.scss` always keeps `.css` — Sass needs it.)
- **`.css` source → `.css` destination**: the `.css` extension is ALWAYS kept; the CSS builder does not consult `preserveStylesheetFileExtension`.
- **HTML, Markdown, and all other source types** (images, fonts, media, data, documents, YAML, components) always preserve the full extension.

**Exception — JSX/TSX/MDX non-script sources**: when a non-script source (including `.css`, `.scss`, `.md`, `.mdx`, `.html`, images, media) is imported into a `.jsx`/`.tsx`/`.mdx` destination, the full real source extension is ALWAYS kept on the path regardless of either preserve setting — the non-script branch in `_react.ts` never reads the setting.

**SCSS partial normalization**: a leading `_` on the last path segment is stripped to match Sass's partial-resolution convention. `_variables.scss` becomes `variables` in the import path.

**SCSS `.css` preservation**: the `.css` extension is always kept on SCSS import paths regardless of the `preserveStylesheetFileExtension` setting. Sass requires it to distinguish foreign-language imports.

**Angular legacy PascalCase** (TypeScript style index 0 only): when the source path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the named import placeholder is pre-filled with a PascalCase identifier derived from the filename. Example: `app-root.component.ts` produces `{ AppRootComponent }`. The derived identifier is validated against `/^[A-Za-z_$][\w$]*$/`; if the basename yields an illegal identifier (e.g. one containing a space or starting with a digit), the pre-fill is skipped and an anonymous `$1` tab stop is emitted instead.

**Exported class detection** (TypeScript style index 0, `.ts` destinations only): when the source file contains an `export class Name` or `export abstract class Name` declaration, the class name is pre-filled into the named import placeholder. This takes priority over Angular legacy PascalCase when both would apply. Does not apply when importing into `.tsx`, `.mdx`, `.vue`, `.svelte`, or `.astro` destinations. Detection is line-anchored: only a class declared at column 0 (the very start of a line) is matched. An `export class` that is indented — including one nested inside a `namespace`/`module` block — is not detected, and index 0 then falls through to Angular legacy auto-fill (or, failing that, an anonymous tab stop). A default-exported class (`export default class Foo`) is likewise not detected: only the bare `export class`/`export abstract class` forms match, so a `default` between `export` and `class` is skipped and index 0 falls through to Angular legacy auto-fill (or, failing that, an anonymous tab stop). When a file declares multiple top-level exported classes, only the first (top-most by line order) is used for the pre-fill. Commented-out declarations are ignored — both `//` line comments and `/* */` block comments (including multi-line blocks) are stripped before scanning, so a commented-out `export class` does not pre-fill the placeholder. Class detection degrades silently: if the source file cannot be read (and unlike the pre-generation existence check, no warning is shown), index 0 simply uses its normal fallback — Angular legacy auto-fill or an anonymous tab stop.

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

All other editable positions are anonymous tab stops — the cursor lands there with no default text, and the user types from scratch. JS/TS imports place the cursor on the binding name. TS index 0 pre-fills the binding with a detected class name or Angular PascalCase identifier when available; otherwise it is an empty tab stop. HTML image indexes 1–2 and Markdown image index 2 (the HTML `<img>` embed) place tab stops on `alt`, `width`, `height`. HTML video index 2 places an anonymous tab stop on `poster`. SCSS `@use as` index 2 places an anonymous tab stop on the alias.

HTML image index 0 uses the literal word `sample` as alt text — this is static output, not an editable position.

---

## Activation

The extension activates on any of the 12 supported destination languages (`onLanguage:javascript`, `onLanguage:typescriptreact`, etc.) so the drop provider is registered before the user's first drag. Invoking any of the five contributed commands also triggers activation — each carries an implicit `onCommand` activation event — so the extension activates from a cold start even before one of the 12 languages is opened, e.g. running Copy File Path or Set Default Import Style.
