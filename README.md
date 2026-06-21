# Auto Import Relative Path

[![version][version svg]][package]
[![installs][installs svg]][package]
[![downloads][downloads svg]][package]
[![ratings][ratings svg]][package]
[![license][license svg]][package]
[![vscode][vscode svg]][package]

[version svg]: https://vsmarketplacebadges.dev/version-short/electreefrying.auto-import.png
[installs svg]: https://vsmarketplacebadges.dev/installs/electreefrying.auto-import.png
[downloads svg]: https://vsmarketplacebadges.dev/downloads/electreefrying.auto-import.png
[ratings svg]: https://vsmarketplacebadges.dev/rating-short/ElecTreeFrying.auto-import.png
[license svg]: https://img.shields.io/github/license/ElecTreeFrying/auto-import-relative-path
[vscode svg]: https://img.shields.io/badge/vscode-%3E%3D1.97.0-blue
[package]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

> **Never type an import path again.**

**Angular** · **React** · **Vue** · **Svelte** · **Astro** · **LaTeX** · JS · TS · CSS · SCSS · HTML · Markdown

Drag a file or press a key — the right import lands in your editor. Path, syntax, and placement handled automatically.

![Auto Import Relative Path demo](https://raw.githubusercontent.com/ElecTreeFrying/auto-import-relative-path/main/assets/demo.gif)

---

## Quick Start

1. **Install** the extension ([see below](#installation)).
2. **Click** a file in the Explorer and press <kbd>Option</kbd>+<kbd>D</kbd> (<kbd>Alt</kbd>+<kbd>D</kbd> on Windows/Linux) to auto-import — or use the two-step <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> then <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>I</kbd> workflow.
3. **Or drag** a file from the Explorer directly into an open editor — the import appears at the drop position.
4. The import lands in your editor. Your cursor is on the identifier — name it and <kbd>Tab</kbd> out.

> **Two-step workflow:** <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> to copy a file's path, then <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>I</kbd> in any editor to paste the import. The clipboard holds the path until you copy something else — paste into as many files as you like.

> **Pick a style on the fly:** Run *Auto Import: Paste as Import (Pick Style)* from the Command Palette, or click **Paste with Style** on the copy toast. Choose an import shape for one paste without changing your default.

[**See the full specification**][SPEC]

[SPEC]: SPEC.md

---

## Highlights

- **Eight commands, three keystrokes** — Copy, Paste, and Auto on the keyboard; *Pick Style*, *Set Default Style*, *Set Import Placement*, *Toggle Preserve Script File Extension*, and *Reset All Import Styles* from the Command Palette
- **Drag-and-drop from Explorer** — drag any supported file into an editor to insert the import at the drop position, no keyboard required
- **Built for every major framework** — Angular, React, Vue, Svelte, Astro — plus vanilla JS/TS, CSS/SCSS, HTML, Markdown, and **LaTeX** (drag an image in → a `figure` float; drop a `.tex` → `\input`; a `.bib` → `\addbibresource`)
- **38 source extensions** — scripts, stylesheets, images, fonts, video, audio, text tracks, data, documents, components, LaTeX graphics
- **45 configurable import styles** — ES modules, CommonJS, dynamic `import()`, `@use`, `@forward`, `@import`, HTML tags, Markdown syntax, LaTeX `figure` / `\includegraphics` / `\input` / `\addbibresource`
- **Framework-aware placement** — imports land inside Astro `---` frontmatter and Vue / Svelte `<script>` blocks automatically
- **Smart identifiers** — exported class detection for TypeScript, Angular PascalCase auto-fill, CSS Modules `styles` binding
- **~8 KB gzipped, zero dependencies, no telemetry**

---

## Commands & Keybindings

| Command | macOS | Windows / Linux | What it does |
|---|---|---|---|
| **Copy File Path** | <kbd>Cmd+Shift+A</kbd> | <kbd>Ctrl+Shift+A</kbd> | Copies the file path to clipboard. Shows a toast with **Paste Now** and **Paste with Style** buttons. |
| **Paste as Import** | <kbd>Cmd+I</kbd> | <kbd>Ctrl+I</kbd> | Reads the clipboard path and inserts the import into the active editor. |
| **Insert Import from Selected File** | <kbd>Option+D</kbd> | <kbd>Alt+D</kbd> | Copy + Paste in one step from the Explorer sidebar. |
| **Paste as Import (Pick Style)** | Command Palette | Command Palette | Shows a picker of all applicable styles for the current pair, then inserts. Does not change your default. |
| **Set Default Import Style** | Command Palette | Command Palette | Shows a picker and persists the chosen style to your global settings. The current default is marked with a checkmark. |
| **Set Import Placement** | Command Palette | Command Palette | Shows a picker of Top / Bottom / Cursor and persists where imports are inserted. The current choice is marked with a checkmark. |
| **Toggle Preserve Script File Extension** | Command Palette | Command Palette | Flips whether the source `.js` / `.ts` extension is kept on generated import paths, and shows the new state in a toast. |
| **Reset All Import Styles to Defaults** | Command Palette | Command Palette | Clears every customized import-style override back to its default; shows a toast with an **Undo** action, or an info toast if nothing was customized. |

All eight are searchable in the Command Palette (<kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> → `Auto Import`). The three keyboard shortcuts are rebindable from VS Code's keyboard shortcuts editor.

See [SPEC — §Commands & Keybindings][SPEC-commands] for command IDs, context clauses, and workflow details.

[SPEC-commands]: SPEC.md#commands--keybindings

### Drag-and-Drop

Drag a file from the Explorer into any supported editor. The import snippet is generated with the same styles and settings as the paste commands, and inserted at the drop position. No keybinding needed.

![Drag-and-drop demo](https://raw.githubusercontent.com/ElecTreeFrying/auto-import-relative-path/main/assets/demo-drag.gif)

- Uses the same gating, snippet styles, and configuration as paste commands.
- Follows the same Top / Bottom / Cursor placement setting as paste commands — the drop position is used as the Cursor input.
- Unsupported pairs show the same "Cannot import" warning as paste commands; the provider suppresses the drop, so nothing is inserted (no stray path text).
- See [SPEC — §Drag-and-Drop Import][SPEC-drop] for full behavior and differences from paste.

[SPEC-drop]: SPEC.md#drag-and-drop-import

---

## Supported Languages

The extension is **destination-driven** — the file open in your editor decides which sources it accepts.

| Destination | Accepted sources | What gets generated |
|---|---|---|
| `.js` | `.js` | JavaScript import style (7 configurable) |
| `.ts` | `.ts` | TypeScript import style (7 configurable) |
| `.jsx` | All except `.ts`, `.tsx` | JS style for scripts; per-category dispatch for others |
| `.tsx` | All asset & script extensions | TS style for `.ts`/`.tsx`; JS style for `.js`/`.jsx`; per-category for others |
| `.mdx` | All asset & script extensions | Same as `.tsx` |
| `.css` | `.css`, images | `@import` style (configurable) or inline `url()` for images |
| `.scss` | `.scss`, `.css`, images | `@use` / `@forward` / `@import` (configurable) or inline `url()` for images |
| `.html` | `.js`, `.css`, images, video, audio, `.vtt` | `<script>`, `<link>`, `<img>`, `<video>`, `<audio>`, `<track>` |
| `.md` | `.md`, images | `[text](path)` or Markdown image syntax |
| `.vue` | `.vue`, scripts, images, media, data | TS style for scripts; per-category default import (`import name`/`import url`) for assets |
| `.svelte` | `.svelte`, scripts, images, media, data | TS style for scripts; per-category default import (`import name`/`import url`) for assets |
| `.astro` | `.astro`, `.vue`, `.svelte`, scripts, images, media, data, `.md`, `.mdx` | TS style for scripts; per-category default import (`import name`/`import url`) for assets and components |
| `.tex` | `.tex`, `.bib`, graphics (`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`) | `\input`/`\include` · `\addbibresource`/`\bibliography` · `figure`/`\includegraphics` |

See [SPEC — §Supported File Extensions][SPEC-extensions] for the full 38-extension breakdown by category.

[SPEC-extensions]: SPEC.md#supported-file-extensions

<details>
<summary><strong>Extension groups</strong></summary>

| Group | Extensions |
|---|---|
| Scripts | `.ts`, `.tsx`, `.mdx`, `.js`, `.jsx` |
| Images | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` |
| Fonts | `.woff`, `.woff2`, `.ttf`, `.eot` |
| Video | `.mp4`, `.webm`, `.mov` |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` |
| Text track | `.vtt` |
| Data | `.json`, `.yaml`, `.yml` |
| Document | `.pdf` |
| Stylesheets | `.css`, `.scss` |
| Markup | `.html`, `.md` |
| Components | `.vue`, `.svelte`, `.astro` |
| LaTeX | `.tex` (document) · `.bib` (bibliography) · `.eps` (graphics) |

</details>

**Rejection rules:**

- **Same file** — a file cannot import itself (case-insensitive path comparison).
- **Unsupported pair** — source extension not in the destination's accepted list.
- **`.js` and `.ts` are strict same-extension** — no cross-language imports. Use `.jsx` or `.tsx` destinations for asset imports.

See SPEC: [Rejection Rules][SPEC-reject] · [Cross-Import Compatibility][SPEC-compat]

[SPEC-reject]: SPEC.md#rejection-rules
[SPEC-compat]: SPEC.md#cross-import-compatibility

---

## Import Styles

Every import-style setting maps to a list of shapes. The default shape is index 0. Change it in VS Code Settings (<kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>,</kbd> → search `auto-import`) or run **Set Default Import Style** from the Command Palette.

In the snippets below, `name` is an editable placeholder — your cursor lands there so you can type the identifier and <kbd>Tab</kbd> out. See [SPEC — §Import Statement Styles][SPEC-styles] for every shape with full context.

[SPEC-styles]: SPEC.md#import-statement-styles

See also [SPEC — §Snippet Placeholders][SPEC-placeholders] for tab-stop details.

[SPEC-placeholders]: SPEC.md#snippet-placeholders

### Script — JavaScript & TypeScript

**JavaScript — 7 styles**

Setting: `auto-import.importStatement.script.javascriptImportStyle`

Used for `.js` destinations. Also used for `.js`/`.jsx` sources imported into `.jsx`, `.tsx`, and `.mdx` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `import name from './path';` | Default import **(default)** |
| 1 | `import { name } from './path';` | Named import |
| 2 | `import name, { other } from './path';` | Default + named |
| 3 | `import * as name from './path';` | Namespace |
| 4 | `import './path';` | Side-effect (no binding) |
| 5 | `const name = require('./path');` | CommonJS require |
| 6 | `const name = await import('./path');` | Dynamic import |

**TypeScript — 7 styles**

Setting: `auto-import.importStatement.script.typescriptImportStyle`

Used for `.ts` destinations. Also used for `.ts`/`.tsx` sources imported into `.tsx` and `.mdx` destinations, and for all script sources imported into `.vue`, `.svelte`, and `.astro` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `import { name } from './path';` | Named import **(default)** |
| 1 | `import name from './path';` | Default import |
| 2 | `import * as name from './path';` | Namespace |
| 3 | `import './path';` | Side-effect (no binding) |
| 4 | `import type { name } from './path';` | Type-only import (TS 3.8+) |
| 5 | `import { name, type Type } from './path';` | Mixed value + type (TS 4.5+) |
| 6 | `const name = await import('./path');` | Dynamic import |

> **Exported class detection** (index 0, `.ts` destinations only): when the source file contains `export class Name` or `export abstract class Name`, the class name pre-fills the `name` placeholder automatically.

> **Angular legacy auto-fill** (index 0): when the source path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the placeholder is pre-filled with a PascalCase identifier — `app-root.component.ts` becomes `import { AppRootComponent } from './app-root.component';`. Class detection takes priority when both apply.

See SPEC: [JavaScript][SPEC-js] · [TypeScript][SPEC-ts]

[SPEC-js]: SPEC.md#javascript
[SPEC-ts]: SPEC.md#typescript

### Stylesheet — CSS & SCSS

**CSS — 2 styles**

Setting: `auto-import.importStatement.styleSheet.cssImportStyle`

Used for `.css` sources imported into `.css` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `@import './path';` | Quoted path **(default)** |
| 1 | `@import url('./path');` | `url()` function |

**CSS / SCSS image — inline `url()`**

Image sources imported into `.css` or `.scss` destinations are inserted **inline at the cursor** as a CSS value fragment, not a standalone statement:

```css
url('./path')
```

No trailing newline — this is meant to be placed inside a `background-image`, `content`, or similar property.

**SCSS — 5 styles**

Setting: `auto-import.importStatement.styleSheet.scssImportStyle`

Used for `.scss` and `.css` sources imported into `.scss` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `@use './path';` | Sass module system **(default)** |
| 1 | `@use './path' as *;` | Module with wildcard — no namespace prefix |
| 2 | `@use './path' as name;` | Module with named alias |
| 3 | `@forward './path';` | Re-export (barrel pattern) |
| 4 | `@import './path';` | Legacy `@import` (Sass-deprecated) |

> **Partial normalization:** a leading `_` on the last path segment is stripped — `_variables.scss` becomes `@use './variables';`, matching Sass convention.

> **`.css` preservation:** the `.css` extension is always kept on SCSS import paths, even when `preserveStylesheetFileExtension` is off. Sass requires it to recognize a foreign-language import.

See SPEC: [CSS][SPEC-css] · [CSS image][SPEC-css-img] · [SCSS][SPEC-scss]

[SPEC-css]: SPEC.md#css-stylesheet
[SPEC-css-img]: SPEC.md#css-image--hardcoded
[SPEC-scss]: SPEC.md#scss-stylesheet

### HTML

**`<script>` — 5 styles**

Setting: `auto-import.importStatement.markup.htmlScriptImportStyle`

Used for `.js` sources imported into `.html` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `<script src="./path"></script>` | Modern minimal **(default)** |
| 1 | `<script src="./path" defer></script>` | Deferred execution |
| 2 | `<script type="module" src="./path"></script>` | ES module |
| 3 | `<script src="./path" async></script>` | Async execution |
| 4 | `<script type="text/javascript" src="./path"></script>` | Legacy |

**`<img>` — 3 styles**

Setting: `auto-import.importStatement.markup.htmlImageImportStyle`

Used for image sources imported into `.html` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `<img src="./path" alt="sample">` | Standard **(default)** |
| 1 | `<img src="./path" alt="" loading="lazy">` | Lazy loading |
| 2 | `<img src="./path" alt="" width="" height="">` | Explicit dimensions (CLS prevention) |

**`<video>` — 4 styles**

Setting: `auto-import.importStatement.markup.htmlVideoImportStyle`

Used for `.mp4`, `.webm`, `.mov` sources imported into `.html` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `<video src="./path" controls></video>` | Accessible default **(default)** |
| 1 | `<video src="./path" autoplay muted loop playsinline></video>` | Silent autoplay (hero sections) |
| 2 | `<video src="./path" controls poster=""></video>` | Custom poster thumbnail |
| 3 | `<video src="./path" controls preload="metadata"></video>` | Metadata preload (Core Web Vitals) |

**`<audio>` — 2 styles**

Setting: `auto-import.importStatement.markup.htmlAudioImportStyle`

Used for `.mp3`, `.ogg`, `.wav`, `.m4a` sources imported into `.html` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `<audio src="./path" controls></audio>` | Accessible default **(default)** |
| 1 | `<audio src="./path" controls preload="metadata"></audio>` | Metadata preload |

**`<link>` — stylesheet (hardcoded)**

```html
<link href="./path" rel="stylesheet">
```

**`<track>` — text track (hardcoded)**

```html
<track src="./path" kind="subtitles" srclang="en" label="English"></track>
```

`srclang` and `label` are editable placeholders.

See SPEC: [Script][SPEC-html-script] · [Image][SPEC-html-img] · [Video][SPEC-html-video] · [Audio][SPEC-html-audio] · [Stylesheet][SPEC-html-css] · [Text track][SPEC-html-track]

[SPEC-html-script]: SPEC.md#html-script
[SPEC-html-img]: SPEC.md#html-image
[SPEC-html-video]: SPEC.md#html-video
[SPEC-html-audio]: SPEC.md#html-audio
[SPEC-html-css]: SPEC.md#html-stylesheet--hardcoded
[SPEC-html-track]: SPEC.md#html-text-track--hardcoded

### Markdown

**Link (hardcoded)**

```md
[text](./path)
```

Used for `.md` sources imported into `.md` destinations.

**Image — 3 styles**

Setting: `auto-import.importStatement.markup.markdownImageImportStyle`

Used for image sources imported into `.md` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `![alt-text](./path)` | Bare inline **(default)** |
| 1 | `![alt-text](./path "Hover text")` | Inline with hover-text title |
| 2 | `<img src="./path" alt="" width="" height="">` | HTML embed (sizing control) |

See SPEC: [Link][SPEC-md-link] · [Image][SPEC-md-img]

[SPEC-md-link]: SPEC.md#markdown-link--hardcoded
[SPEC-md-img]: SPEC.md#markdown-image

### JSX / TSX / MDX — non-script sources

When a non-script source is imported into `.jsx`, `.tsx`, or `.mdx`, the shape is determined by the source category — not a configurable setting. All names are editable placeholders.

| Source category | Extensions | Snippet |
|---|---|---|
| CSS Modules | `.module.css`, `.module.scss` | `import styles from './path';` |
| Image, data, markup, component, document | `.gif`, `.jpg`, `.png`, `.svg`, `.json`, `.html`, `.md`, `.pdf`, `.vue`, `.astro`, ... | `import name from './path';` |
| Media, text track | `.mp4`, `.webm`, `.mp3`, `.ogg`, `.vtt`, ... | `import url from './path';` |
| Font, stylesheet | `.woff`, `.woff2`, `.ttf`, `.eot`, `.css`, `.scss` | `import './path';` |

**Script routing** — `.jsx` routes `.js`/`.jsx` sources through the JavaScript style. `.tsx` and `.mdx` route `.ts`/`.tsx` through the TypeScript style and `.js`/`.jsx` through the JavaScript style.

See [SPEC — §JSX / TSX / MDX][SPEC-react] for the full source-category dispatch.

[SPEC-react]: SPEC.md#jsx--tsx--mdx-non-script-sources

### Vue / Svelte / Astro

Script sources (`.ts`, `.tsx`, `.js`, `.jsx`) use the **TypeScript import style**. Non-script sources use a category-based default import — images, data (`.json`/`.yaml`/`.yml`), and components (`.vue`/`.svelte` and `.md`/`.mdx`, which reach only `.astro` destinations) get a default name import (`import name from '...'`), while media and text tracks (`.vtt`) get a url import (`import url from '...'`). All non-script sources keep the full source extension on the path.

Import placement is constrained to framework-specific regions — see [Placement](#placement).

See [SPEC — §Vue / Svelte / Astro][SPEC-framework] for import routing details.

[SPEC-framework]: SPEC.md#vue--svelte--astro

### LaTeX

LaTeX (`.tex`) is the only destination with its **own** picker namespace for non-script sources. The source extension picks the relationship: graphics → `figure`/`\includegraphics`, `.tex` → `\input`/`\include`, `.bib` → `\addbibresource`/`\bibliography`.

**Graphics — 3 styles**

Setting: `auto-import.importStatement.latex.graphicsImportStyle`

Used for `.pdf`, `.png`, `.jpg`, `.jpeg`, `.eps` sources imported into `.tex` destinations. (Web-only formats `.svg`/`.gif`/`.webp`/`.avif` are rejected — `pdflatex` can't render them.)

| # | Snippet | Description |
|---|---|---|
| **0** | `\begin{figure}[htbp]` … `\includegraphics[width=0.5\textwidth]{./path}` … `\caption{}` `\label{fig:}` … `\end{figure}` | Figure float **(default)** — multi-line |
| 1 | `\includegraphics[width=0.5\textwidth]{./path}` | Sized graphic, no float |
| 2 | `\includegraphics{./path}` | Bare graphic |

The default is a full `figure` float (the only multi-line snippet) with `\caption` before `\label` so `\ref` numbers correctly; `caption` and `label` are editable placeholders.

**`\input` / `\include` — 2 styles**

Setting: `auto-import.importStatement.latex.inputImportStyle`

Used for `.tex` sources imported into `.tex` destinations. The `.tex` extension is always dropped.

| # | Snippet | Description |
|---|---|---|
| **0** | `\input{./path}` | Inline include **(default)** |
| 1 | `\include{./path}` | Chapter-level (page break) |

**Bibliography — 2 styles**

Setting: `auto-import.importStatement.latex.bibliographyImportStyle`

Used for `.bib` sources imported into `.tex` destinations.

| # | Snippet | Description |
|---|---|---|
| **0** | `\addbibresource{./path.bib}` | Modern biblatex — keeps `.bib` **(default)** |
| 1 | `\bibliography{./path}` | Legacy BibTeX — drops `.bib` |

> **Keep the extension by default.** `auto-import.importStatement.latex.preserveGraphicsFileExtension` defaults to *on* (keep `fig.png`) — the inverse of the script/stylesheet toggles, because keeping the dragged file's exact extension is unambiguous and always compiles.

See [SPEC — §LaTeX][SPEC-latex] for full details.

[SPEC-latex]: SPEC.md#latex

---

## Placement

Setting: `auto-import.preferences.importStatementPlacement` — default `"Bottom"`

| Mode | Behavior |
|---|---|
| **Top** | Insert before the first line (line 0). |
| **Bottom** | Insert after the last recognized import line. Falls back to line 0 if none found. |
| **Cursor** | Insert at the current cursor position. |

### Bottom mode — import detection

Bottom mode scans each line for these markers (comment lines starting with `//`, `/*`, or `*` are skipped):

```
import       require(       @import '     @import "     @import url(
@use '       @use "         @forward '    @forward "
```

The import is placed on the line after the last match.

See [SPEC — §Bottom Mode][SPEC-bottom] for the full marker list and scan logic.

[SPEC-bottom]: SPEC.md#bottom-mode--import-line-detection

### Placement overrides

These take effect regardless of the user's setting:

| Condition | Forced placement | Reason |
|---|---|---|
| HTML, Markdown, or LaTeX destination | Cursor (line and column) | No canonical import block for embedded tags; for LaTeX, line 0 is the preamble. |
| Image into `.css` / `.scss` | Inline at cursor (line and column), no trailing newline | `url()` is a CSS value fragment, not a statement. |

See [SPEC — §Placement Overrides][SPEC-overrides] for the complete override logic.

[SPEC-overrides]: SPEC.md#placement-overrides

### Astro frontmatter

For `.astro` destinations, imports are constrained to within the `---` frontmatter fences.

| Mode | Behavior |
|---|---|
| Top | After the opening `---`. |
| Bottom | After the last import marker inside the frontmatter. Falls back to after opening `---`. |
| Cursor | At the cursor if inside the fences. Otherwise falls back to Bottom. |

If no `---` frontmatter exists, a new block is created at line 0.

See [SPEC — §Astro Frontmatter][SPEC-astro] for edge cases and cursor rules.

[SPEC-astro]: SPEC.md#astro-frontmatter-constraint

### Vue / Svelte script block

For `.vue` and `.svelte` destinations, imports are constrained to within a `<script>` block. Vue prefers `<script setup>` over bare `<script>` when both exist.

| Mode | Behavior |
|---|---|
| Top | After the opening `<script...>` tag. |
| Bottom | After the last import marker inside the script block. Falls back to after opening tag. |
| Cursor | At the cursor if inside the block. Otherwise falls back to Bottom. |

If no script block exists, a new `<script>` / `</script>` pair is created at line 0.

See [SPEC — §Vue / Svelte Script Block][SPEC-sfc] for the full constraint logic.

[SPEC-sfc]: SPEC.md#vue--svelte-script-block-constraint

### Insertion column

| Destination type | Column |
|---|---|
| Script (`.js`, `.ts`, `.jsx`, `.tsx`, `.mdx`, `.vue`, `.svelte`, `.astro`) | Column 0 |
| Stylesheet (`.css`, `.scss`) | Column 0 |
| HTML, Markdown, LaTeX | Cursor's current column |

See [SPEC — §Insertion Column][SPEC-column] for column rules by destination type.

[SPEC-column]: SPEC.md#insertion-column

---

## Configuration

All settings live under the `auto-import` namespace. Open VS Code Settings (<kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>,</kbd>) and search `auto-import`.

### Preferences

| Setting | Type | Default |
|---|---|---|
| `auto-import.preferences.importStatementPlacement` | string | `Bottom` |

Values: `Top`, `Bottom`, `Cursor`. See [Placement](#placement).

### Script

| Setting | Type | Default |
|---|---|---|
| `auto-import.importStatement.script.preserveScriptFileExtension` | boolean | `false` |
| `auto-import.importStatement.script.javascriptImportStyle` | string | `import name from '_relativePath_';` |
| `auto-import.importStatement.script.typescriptImportStyle` | string | `import { name } from '_relativePath_';` |

`preserveScriptFileExtension` keeps the `.js` / `.ts` / `.jsx` / `.tsx` extension on the import path. Most module systems resolve without it.

### Stylesheet

| Setting | Type | Default |
|---|---|---|
| `auto-import.importStatement.styleSheet.preserveStylesheetFileExtension` | boolean | `false` |
| `auto-import.importStatement.styleSheet.cssImportStyle` | string | `@import '_relativePath_';` |
| `auto-import.importStatement.styleSheet.cssImageImportStyle` | string | `url('_relativePath_')` |
| `auto-import.importStatement.styleSheet.scssImportStyle` | string | `@use '_relativePath_';` |
| `auto-import.importStatement.styleSheet.scssImageImportStyle` | string | `url('_relativePath_')` |

`preserveStylesheetFileExtension` keeps `.css` / `.scss` on the import path. Exception: `.css` is always preserved in `.scss` imports — Sass requires it for foreign-language imports.

`cssImageImportStyle` and `scssImageImportStyle` have a single shape and are not configurable at runtime.

### Markup

| Setting | Type | Default |
|---|---|---|
| `auto-import.importStatement.markup.htmlScriptImportStyle` | string | `<script src="_relativePath_"></script>` |
| `auto-import.importStatement.markup.htmlImageImportStyle` | string | `<img src="_relativePath_" alt="sample">` |
| `auto-import.importStatement.markup.htmlVideoImportStyle` | string | `<video src="_relativePath_" controls></video>` |
| `auto-import.importStatement.markup.htmlAudioImportStyle` | string | `<audio src="_relativePath_" controls></audio>` |
| `auto-import.importStatement.markup.htmlStyleSheetImportStyle` | string | `<link href="_relativePath_" rel="stylesheet">` |
| `auto-import.importStatement.markup.markdownImportStyle` | string | `[text](_relativePath_)` |
| `auto-import.importStatement.markup.markdownImageImportStyle` | string | `![alt-text](_relativePath_)` |

`htmlStyleSheetImportStyle` and `markdownImportStyle` have a single shape and are not configurable at runtime.

### LaTeX

| Setting | Type | Default |
|---|---|---|
| `auto-import.importStatement.latex.preserveGraphicsFileExtension` | boolean | `true` |
| `auto-import.importStatement.latex.graphicsImportStyle` | string | `figure` float (multi-line) |
| `auto-import.importStatement.latex.inputImportStyle` | string | `\input{_relativePath_}` |
| `auto-import.importStatement.latex.bibliographyImportStyle` | string | `\addbibresource{_relativePath_}` |

`preserveGraphicsFileExtension` keeps the source extension on `\includegraphics` paths and **defaults to on** — inverted from the two script/stylesheet preserve booleans (both `false`).

See [SPEC — §Configuration Reference][SPEC-config] for every setting with all enum values.

[SPEC-config]: SPEC.md#configuration-reference

---

## Path Computation

- **Relative path** — computed from the destination file's directory to the source file. Always uses forward slashes, including on Windows.
- **`./` prefix** — added when source and destination are in the same directory, or when the computed path doesn't already start with `.`. Ensures ES module compatibility.
- **Extension stripping** — script and stylesheet extensions are stripped by default. Override with `preserveScriptFileExtension` and `preserveStylesheetFileExtension`. All other source types (images, fonts, media, data, documents, components) always keep the full extension. **LaTeX** is the inverse: graphics *keep* their extension by default (toggle `preserveGraphicsFileExtension`, which defaults to *on*), `\input`/`\include` always drop `.tex`, and `\addbibresource` keeps `.bib` while `\bibliography` drops it.
- **SCSS partial normalization** — a leading `_` on the last path segment is stripped. `_variables.scss` becomes `variables` in the import path.
- **SCSS `.css` preservation** — `.css` is always kept on SCSS import paths regardless of the `preserveStylesheetFileExtension` setting.
- **Angular PascalCase** — TypeScript index 0 only: source paths containing `.component`, `.directive`, `.pipe`, `.service`, or `.module` get a pre-filled PascalCase identifier. `app-root.component.ts` produces `{ AppRootComponent }`.
- **Exported class detection** — TypeScript index 0, `.ts` destinations only: `export class Name` or `export abstract class Name` in the source pre-fills the binding. Takes priority over Angular PascalCase.

See [SPEC — §Path Computation][SPEC-path] for the complete path logic including edge cases.

[SPEC-path]: SPEC.md#path-computation

---

## Tips & Tricks

- **Paste into many files.** The clipboard keeps the path until you copy something else. Copy once with <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>, then <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>I</kbd> in every destination.
- **Snippet placeholders.** After insertion, your cursor lands on the identifier — type the name and <kbd>Tab</kbd> to the next stop. No need to click or arrow around.
- **CSS Modules are detected automatically.** Files named `*.module.css` or `*.module.scss` imported into JSX/TSX/MDX produce `import styles from '...'` instead of a side-effect `import '...'`.
- **Same-directory imports always get `./`.** You'll never see a bare `Button` — it's always `./Button`, which ES modules and bundlers require.
- **Drag from Explorer for zero-keystroke imports.** Drag a file from the sidebar directly into your editor — the import lands at the drop position with the same style as paste. Great for quickly pulling in components or assets without touching the keyboard.
- **Mixing CSS into SCSS just works.** The `.css` extension is preserved even when `preserveStylesheetFileExtension` is off, because Sass needs it.
- **HTML, Markdown, and LaTeX ignore your placement setting.** Insertion is always at the cursor for these languages (for LaTeX, in the document body — never the preamble). Leave `importStatementPlacement` set to `Bottom` for scripts — it won't affect your markup.
- **Rebind anything.** `extension.copyFilePath`, `extension.pasteImport`, and `extension.copyPaste` are rebindable from VS Code's keyboard shortcuts editor. The five Command Palette–only commands can be given keybindings from the same editor.

---

## Installation

**Requires VS Code 1.97.0 or later.**

- **Marketplace:** Extensions view (<kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>) → search **Auto Import Relative Path** by *ElecTreeFrying* → **Install**.
- **CLI:** `code --install-extension ElecTreeFrying.auto-import`
- **Direct:** [VS Code Marketplace listing][package]

---

## Compatibility

- **VS Code** 1.97.0 or later.
- **Compatible hosts:** Cursor, VSCodium, Code Server, and other forks that implement the VS Code API at the same engine version.
- **Platforms:** macOS, Windows, Linux. Paths are normalized to forward slashes on all platforms.
- **Bundle:** ~8 KB gzipped (~31 KB minified). Zero runtime dependencies.
- **Telemetry:** None. Everything runs locally.

---

## Troubleshooting

If a keybinding does nothing, an import looks wrong, or you see an unexpected warning — see [SUPPORT.md][SUPPORT] for symptom → cause → fix.

See [SPEC — §Notification Reference][SPEC-notifications] for a complete list of all warning and info messages.

[SUPPORT]: SUPPORT.md
[SPEC-notifications]: SPEC.md#notification-reference

---

## Changelog

See [CHANGELOG.md][CHANGELOG] for full release notes.

[CHANGELOG]: CHANGELOG.md

---

## Contributing

Contributions, bug reports, and feature requests are welcome. See [SUPPORT.md][SUPPORT-CONTRIB] for build/test commands and the architecture overview.

[SUPPORT-CONTRIB]: SUPPORT.md#contributing

---

## Support

**This extension is free and always will be.** If it's become part of your workflow, here are a few ways to give back:

- Star the repo on [GitHub][repo]
- Leave a review on the [VS Code Marketplace][reviews]
- Send a donation to any address below

[repo]: https://github.com/ElecTreeFrying/auto-import-relative-path
[reviews]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import&ssr=false#review-details

| Network | Address |
|---|---|
| **Bitcoin** | `bc1q4j2uewfphjmca83905qv37vcl4jh8va5yupl7w` |
| **Solana** | `EHtTGyRoDAK44KBGrEoypAWyPpResHUqwufKnuLs7Tyy` |
| **Sui** | `0xcaf8ff4a65d7e35d961abd0203180013b7fe974d4fa0313e880c39c45ada2b09` |
| **ERC-20** (Ethereum / Base / Monad / Polygon / HyperEVM) | `0xd25f84Ed2F76dF2F0C8f1207402eF9e15b5d7855` |

---

## Related

- **[All extensions by ElecTreeFrying][all]** on the VS Code Marketplace.

[all]: https://marketplace.visualstudio.com/publishers/ElecTreeFrying

---

## License

[MIT][MIT]

[MIT]: https://marketplace.visualstudio.com/items/ElecTreeFrying.auto-import/license
