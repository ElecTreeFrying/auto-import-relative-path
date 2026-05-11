# Auto Import Relative Path

[![Current version of Auto Import Relative Path][version svg]][package] [![Current installs of Auto Import Relative Path][installs svg]][package] [![Current downloads of Auto Import Relative Path][downloads svg]][package] [![Current ratings of Auto Import Relative Path][ratings svg]][package]

[version svg]: https://vsmarketplacebadges.dev/version-short/electreefrying.auto-import.png
[installs svg]: https://vsmarketplacebadges.dev/installs/electreefrying.auto-import.png
[downloads svg]: https://vsmarketplacebadges.dev/downloads/electreefrying.auto-import.png
[ratings svg]: https://vsmarketplacebadges.dev/rating-short/ElecTreeFrying.auto-import.png
[package]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

> **Stop typing `../../components/Button` from memory.** Pick the file in the Explorer, press a key, and a fully-formed import lands in your editor — correct path, correct syntax, every time.

![auto-import-demo][playback]

[playback]: https://res.cloudinary.com/october7/image/upload/v1679982147/github/auto-import-relative-path/playback.gif "Auto Import Relative Path — 30-second tour"

---

## Table of Contents

- [Auto Import Relative Path](#auto-import-relative-path)
  - [Table of Contents](#table-of-contents)
  - [Why this extension?](#why-this-extension)
  - [Highlights](#highlights)
  - [Quick Start](#quick-start)
  - [Commands \& Keybindings](#commands--keybindings)
  - [Supported source → destination pairs](#supported-source--destination-pairs)
  - [Examples](#examples)
    - [TypeScript with Angular auto-fill](#typescript-with-angular-auto-fill)
    - [JSX importing an image](#jsx-importing-an-image)
    - [SCSS importing a partial via `@use`](#scss-importing-a-partial-via-use)
    - [SCSS importing a `.css` file](#scss-importing-a-css-file)
    - [HTML embedding a script](#html-embedding-a-script)
    - [Markdown referencing an image](#markdown-referencing-an-image)
    - [CommonJS require](#commonjs-require)
  - [Configuration](#configuration)
    - [Placement](#placement)
    - [Scripts — JS, JSX, TS, TSX](#scripts--js-jsx-ts-tsx)
    - [Stylesheets — CSS, SCSS](#stylesheets--css-scss)
    - [Markup — HTML, Markdown](#markup--html-markdown)
  - [Tips \& Tricks](#tips--tricks)
  - [Installation](#installation)
  - [Compatibility](#compatibility)
  - [Troubleshooting](#troubleshooting)
  - [Changelog](#changelog)
  - [Contributing](#contributing)
  - [Support the project](#support-the-project)
  - [Related](#related)
  - [License](#license)

---

## Why this extension?

You know the file you want. You know it's somewhere two folders up and one over. You spend ten seconds counting `..`s — and another ten getting the import-statement shape right for whatever language you're in.

**Auto Import Relative Path** removes that ritual. One keystroke does the whole thing:

- **Computes the relative path** between the file you picked and the file you're editing — handles `./`-prefix edge cases, sibling directories, and absolute-vs-relative mismatches.
- **Picks the right import shape** for your destination — ES module `import`, CommonJS `require`, dynamic `import()`, SCSS `@use`, HTML `<script>` / `<link>` / `<img>`, Markdown `![](…)`, and more.
- **Drops it in the right place** — top of your imports, bottom of your imports, or at the cursor (HTML and Markdown automatically use the cursor).

It's a 100% local extension. **No telemetry, no network calls, no AI.** ~11 KB gzipped. Activates on demand.

---

## Highlights

- **Five commands, three keystrokes** — Copy / Paste / Auto on the keyboard, plus *Paste (Pick Style)* and *Set Default Import Style* from the Command Palette.
- **Eight destination languages** — JavaScript, TypeScript, JSX, TSX, CSS, SCSS, HTML, Markdown.
- **22 configurable import styles** — ES modules, CommonJS, dynamic, `@use`, `@import`, side-effect-only, and more.
- **Angular-aware naming** — `app-root.component.ts` automatically becomes `import { AppRootComponent } from '...'`.
- **SCSS partial-aware** — `_variables.scss` becomes `variables` in the import path, matching Sass conventions.
- **Smart placement** — Top, Bottom (after the last import line), or Cursor — with sensible auto-overrides for HTML / Markdown / non-stylesheet → stylesheet destinations.
- **Cross-language assets** — Image, font, JSON, YAML, HTML, and Markdown sources can be imported into JSX / TSX as default or side-effect imports.
- **~11 KB gzipped, zero runtime dependencies** — Activates on first command, vanishes the rest of the time.

---

## Quick Start

1. **Install** the extension (see [Installation](#installation)).
2. **Open** your project and any source file in the editor.
3. **Right-click** a file in the Explorer panel and pick **Auto Import: Insert Import from Selected File** — or press <kbd>Alt</kbd>+<kbd>D</kbd> / <kbd>Option</kbd>+<kbd>D</kbd>.

That's it. The import lands in your editor and your cursor is positioned at the identifier so you can name it.

> **Two-step workflow:** Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a source file to copy its path, then <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>I</kbd> in any editor to paste the import. The clipboard holds the path until you copy something else, so you can paste the same import into many files in a row.

> **Pick a style on the fly:** Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> and run *Auto Import: Paste as Import (Pick Style)* — or click *Paste with Style* on the "Copied …" toast — to choose an import shape for one paste without changing your default.

→ [**See the full demo gallery**][DEMO]

[DEMO]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md

---

## Commands & Keybindings

The first three commands are bound to keystrokes; the last two live in the Command Palette (one is also reachable from a button on the "Copied …" toast).

| Command (palette title)                              | Windows / Linux             | macOS                       | What it does                                                                                                                                       |
|------------------------------------------------------|-----------------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| **Auto Import: Copy File Path**                      | <kbd>Ctrl+Shift+A</kbd>     | <kbd>Cmd+Shift+A</kbd>      | Copies the selected Explorer file's path to the clipboard. Shows a "Copied &lt;basename&gt;" toast with two action buttons: *Paste Now* and *Paste with Style*. |
| **Auto Import: Paste as Import**                     | <kbd>Ctrl+I</kbd>           | <kbd>Cmd+I</kbd>            | Reads the clipboard path and inserts the language-appropriate import into the active editor.                                                       |
| **Auto Import: Insert Import from Selected File**    | <kbd>Alt+D</kbd>            | <kbd>Option+D</kbd>         | Copy + Paste in one step from the Explorer. Active editor must be open in the background.                                                          |
| **Auto Import: Paste as Import (Pick Style)**        | — (Command Palette / toast) | — (Command Palette / toast) | Like Paste, but opens a QuickPick of every import style accepted for the current source/destination pair. Inserts once; does **not** change your default. |
| **Auto Import: Set Default Import Style**            | — (Command Palette)         | — (Command Palette)         | Opens a QuickPick of styles for the current source/destination pair and writes the chosen one to your global User settings as the new default. The current default is marked with a check and pinned to the top. |

All five commands are available from the command palette (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, search `Auto Import`). The three keyboard commands are rebindable from VS Code's keyboard shortcuts editor.

[Demo — two-step Copy + Paste][demo-twostep] · [Demo — one-step Auto][demo-onestep] · [Demo — copy once, paste many][demo-many]

[demo-twostep]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#two-step-copy--paste
[demo-onestep]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#one-step-auto
[demo-many]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#copy-once-paste-across-tabs

---

## Supported source → destination pairs

The extension is **destination-driven**: the file open in your editor decides which sources are accepted.

| Active editor (destination) | Accepted source extensions                                                                                          | What gets generated                                                                                                          |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| **`.js`**                   | `.js`                                                                                                               | One of 9 JavaScript import shapes (configurable).                                                                            |
| **`.ts`**                   | `.ts`                                                                                                               | One of 5 TypeScript import shapes (configurable). The `import { name }` shape triggers Angular PascalCase auto-fill.         |
| **`.jsx`**                  | `.jsx`, `.js`, plus images, fonts, JSON, YAML, HTML, Markdown, CSS, SCSS                                            | JS shape for scripts; `import name from '<path>'` for assets; side-effect `import '<path>'` for fonts and stylesheets.        |
| **`.tsx`**                  | `.tsx`, `.ts`, `.js`, plus images, fonts, JSON, YAML, HTML, Markdown, CSS, SCSS                                     | TS shape for scripts (JS shape for `.js` sources); same asset / stylesheet behaviour as JSX.                                  |
| **`.css`**                  | `.css`, images                                                                                                      | `@import '...'` (configurable) or `url('<path>')` for images.                                                                 |
| **`.scss`**                 | `.scss`, `.css`, images                                                                                             | One of 4 SCSS shapes including `@use` (configurable; partial leading `_` stripped). `url('<path>')` for images.               |
| **`.html`**                 | `.js`, `.css`, images                                                                                               | `<script src="...">`, `<link href="..." rel="stylesheet">`, or `<img src="...">` — inserted at the cursor.                   |
| **`.md`**                   | `.md`, images                                                                                                       | `[text](<path>)` link or one of 2 image shapes (inline / reference) — inserted at the cursor.                                |

> **Image extensions:** `.gif`, `.jpeg`, `.jpg`, `.png`, `.webp` &nbsp;·&nbsp; **Font extensions:** `.woff`, `.woff2`, `.ttf`, `.eot` &nbsp;·&nbsp; **Data extensions:** `.json`, `.yaml`, `.yml`.

> **Plain `.js` / `.ts` are strict same-extension** — no cross-language imports. If you need to import a `.json` or stylesheet asset, the destination must be `.jsx` or `.tsx`.

---

## Examples

Each example shows what the source and destination files are, what setting is in play, and what the generated snippet looks like.

### TypeScript with Angular auto-fill

```ts
// Source:      src/app/app-root.component.ts
// Destination: src/app/app.module.ts
// Setting:     auto-import.importStatement.script.typescriptImportStyle
//              = "import { name } from '_relativePath_';"

import { AppRootComponent } from './app-root.component';
//        └─ derived from the source basename, automatically
```

The auto-fill triggers on `.component`, `.directive`, `.pipe`, `.service`, and `.module` files. Pick a different TypeScript shape if you don't want it.

### JSX importing an image

```jsx
// Source:      assets/logo.png
// Destination: src/components/Header.jsx

import logo from '../assets/logo.png';
//     └─ snippet placeholder; rename and tab out
```

### SCSS importing a partial via `@use`

```scss
// Source:      styles/_variables.scss
// Destination: styles/main.scss
// Setting:     auto-import.importStatement.styleSheet.scssImportStyle
//              = "@use '_relativePath_';"

@use './variables';
//    └─ leading `_` stripped, matching Sass partial convention
```

### SCSS importing a `.css` file

```scss
// Source:      vendor/normalize.css
// Destination: styles/main.scss

@use './vendor/normalize.css';
//                       └─ extension preserved (Sass requires it for plain-CSS imports)
```

### HTML embedding a script

```html
<!-- Source:      js/app.js -->
<!-- Destination: index.html -->

<script type="text/javascript" src="./js/app.js"></script>
```

### Markdown referencing an image

```md
<!-- Source:      docs/diagram.png -->
<!-- Destination: README.md -->

![alt-text](./docs/diagram.png "Hover text")
```

### CommonJS require

```js
// Source:      lib/util.js
// Destination: server.js
// Setting:     auto-import.importStatement.script.javascriptImportStyle
//              = "const name = require('_relativePath_');"

const util = require('./lib/util');
```

---

## Configuration

All settings live under the `auto-import` namespace. Open VS Code Settings (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>,</kbd>) and search `auto-import` to see them all in the GUI editor.

In every template below:

- `_relativePath_` is replaced with the computed path at insertion time.
- `name` becomes a snippet placeholder — your cursor lands there so you can type the identifier immediately and tab out.

### Placement

**`auto-import.preferences.importStatementPlacement`** — *string, default `Bottom`*

Where the import lands in the destination file.

| Value     | Behaviour                                                                                                            |
|-----------|----------------------------------------------------------------------------------------------------------------------|
| `Top`     | Inserted before the first line.                                                                                      |
| `Bottom`  | Inserted after the last recognised import line (`import …`, `require(…)`, `@import …`, `@use …`, `@import url(…)`). Falls back to line 0 if no import is found. |
| `Cursor`  | Inserted at the current cursor position.                                                                             |

> **Auto-override.** For `.html` and `.md` destinations, and when importing a non-stylesheet into a stylesheet, placement is **forced to `Cursor`** regardless of this setting. Those contexts don't have an "import block" to attach to.

### Scripts — JS, JSX, TS, TSX

| Setting                                                            | Type    | Default                                       | Notes                                                                                                                                                  |
|--------------------------------------------------------------------|---------|-----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `auto-import.importStatement.script.preserveScriptFileExtension`   | boolean | `false`                                       | Keep the source `.js` / `.ts` / `.jsx` / `.tsx` extension in the import path. Most module systems omit it.                                              |
| `auto-import.importStatement.script.javascriptImportStyle`         | string  | `import name from '_relativePath_';`          | One of 9 shapes — see below. Used for `.js` destinations and for `.js` sources dropped into `.jsx` / `.tsx`.                                            |
| `auto-import.importStatement.script.typescriptImportStyle`         | string  | `import { name } from '_relativePath_';`      | One of 5 shapes — see below. The `import { name }` shape is the trigger for Angular PascalCase auto-fill.                                              |

**JavaScript shapes (9):**

```
import name from '_relativePath_';                 ← ES module default
import { name } from '_relativePath_';             ← ES module named
import { default as name } from '_relativePath_';  ← ES module aliased default
import * as name from '_relativePath_';            ← ES module namespace
import '_relativePath_';                           ← ES module side-effect (no binding)
var name = require('_relativePath_');              ← CommonJS, var
const name = require('_relativePath_');            ← CommonJS, const
var name = import('_relativePath_');               ← Dynamic, var
const name = import('_relativePath_');             ← Dynamic, const
```

**TypeScript shapes (5):**

```
import name from '_relativePath_';                 ← ES module default
import { name } from '_relativePath_';             ← ES module named  ★ Angular-aware
import { default as name } from '_relativePath_';  ← ES module aliased default
import * as name from '_relativePath_';            ← ES module namespace
import '_relativePath_';                           ← ES module side-effect (no binding)
```

> **Angular auto-fill.** When the `import { name }` style is selected and the source filename contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, `name` is replaced with a PascalCase identifier derived from the basename. Example: `app-root.component.ts` → `AppRootComponent`.

### Stylesheets — CSS, SCSS

| Setting                                                                  | Type    | Default                       | Notes                                                                                                                                                                                                   |
|--------------------------------------------------------------------------|---------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `auto-import.importStatement.styleSheet.preserveStylesheetFileExtension` | boolean | `false`                       | Keep the source `.css` / `.scss` extension in the import path. **Exception:** `.css` is always preserved inside `.scss` imports — Sass requires the extension to recognise a foreign-language import.   |
| `auto-import.importStatement.styleSheet.cssImportStyle`                  | string  | `@import '_relativePath_';`   | One of 2 CSS shapes — see below.                                                                                                                                                                        |
| `auto-import.importStatement.styleSheet.cssImageImportStyle`             | string  | `url('_relativePath_')`       | Single shape — used for background-image / content references inside CSS.                                                                                                                               |
| `auto-import.importStatement.styleSheet.scssImportStyle`                 | string  | `@import '_relativePath_';`   | One of 4 SCSS shapes — see below. Includes the modern `@use` module system and the `@use … as *` wildcard alias.                                                                                        |
| `auto-import.importStatement.styleSheet.scssImageImportStyle`            | string  | `url('_relativePath_')`       | Single shape — image references inside SCSS. Reuses the CSS image template (the `url('…')` syntax is identical between the two languages).                                                              |

**CSS shapes (2):**

```
@import '_relativePath_';
@import url('_relativePath_');
```

**SCSS shapes (4):**

```
@import '_relativePath_';                ← Legacy @import, quoted path
@import url('_relativePath_');           ← Legacy @import, url() function
@use '_relativePath_';                   ← Modern Sass module system
@use '_relativePath_' as *;              ← Modern Sass module system, no namespace prefix
```

> **SCSS partials.** A leading `_` is stripped from the *last* path segment automatically (`_variables.scss` → `variables`), matching Sass's partial-resolution convention. Applies to both `@import` and `@use`.

### Markup — HTML, Markdown

| Setting                                                          | Type   | Default                                                          | Notes                                                                                          |
|------------------------------------------------------------------|--------|------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `auto-import.importStatement.markup.htmlScriptImportStyle`       | string | `<script type="text/javascript" src="_relativePath_"></script>`  | Single shape — JavaScript source into HTML destination.                                        |
| `auto-import.importStatement.markup.htmlImageImportStyle`        | string | `<img src="_relativePath_" alt="sample">`                        | Single shape — image source into HTML destination.                                             |
| `auto-import.importStatement.markup.htmlStyleSheetImportStyle`   | string | `<link href="_relativePath_" rel="stylesheet">`                  | Single shape — CSS source into HTML destination.                                               |
| `auto-import.importStatement.markup.markdownImportStyle`         | string | `![text](_relativePath_)`                                        | Single shape — Markdown source into Markdown destination.                                      |
| `auto-import.importStatement.markup.markdownImageImportStyle`    | string | `![alt-text](_relativePath_ "Hover text")`                       | One of 2 shapes — inline `![alt](path)` or reference-style `![alt][ref] / [ref]: path`.        |

**Markdown image shapes (2):**

```
![alt-text](_relativePath_ "Hover text")
![alt-text][image] / [image]: _relativePath_ "Hover text"
```

---

## Tips & Tricks

- **Paste once into many files.** The clipboard keeps the path until you copy something else. Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> once on the source, then <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>I</kbd> in every destination editor.
- **Skip the named-binding ritual.** With the default `import name from '...'` style, your cursor lands on `name` as a snippet placeholder — type the identifier and tab out, all in one motion.
- **Same-directory clarity.** A leading `./` is always added for same-directory imports (`./Button`, never `Button`). Required for ES modules and matches what bundlers expect.
- **Mixing CSS into SCSS just works.** The `.css` extension is preserved on the import path even when `preserveStylesheetFileExtension` is off — Sass needs it to recognise a plain-CSS import.
- **HTML / Markdown ignore your placement preference.** Insertion is always at the cursor for these languages, so you can leave `importStatementPlacement` set to `Bottom` for your scripts and HTML / Markdown still inserts inline.
- **Rebind the keys.** `extension.copyFilePath`, `extension.pasteImport`, and `extension.copyPaste` are rebindable from VS Code's keyboard shortcuts editor — useful if `Cmd+I` clashes with another extension you use. The two palette-only commands (`extension.pasteImportWithStyle` and `extension.setDefaultImportStyle`) have no default keybinding; assign one from the same editor if you reach for them often.

---

## Installation

**Requires VS Code v1.118.0 or later.**

- **Marketplace UI:** Open the Extensions view (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>), search **Auto Import Relative Path** by *ElecTreeFrying*, and click **Install**.
- **Command line:** `code --install-extension ElecTreeFrying.auto-import`
- **Direct link:** [VS Code Marketplace listing](https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import)

---

## Compatibility

- **VS Code:** v1.118.0 or later.
- **VS Code-compatible hosts:** Cursor, VSCodium, Code Server, and other forks that implement the public VS Code API at the same engine version are supported. The extension uses no proprietary APIs.
- **Operating systems:** macOS, Windows, Linux. Paths are normalised to forward slashes regardless of platform.
- **Bundle:** ~11 KB gzipped (~41 KB on disk). No runtime dependencies.
- **Telemetry / network:** None. Everything happens locally.

---

## Troubleshooting

If a keybinding does nothing, an unsupported pair throws a "Not supported" toast, or a generated import looks wrong, see [SUPPORT.md][SUPPORT] — the most common symptoms are diagnosed there as **symptom → cause → fix**.

[SUPPORT]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/SUPPORT.md

---

## Changelog

See [CHANGELOG.md][CHANGELOG] for full release notes.

[CHANGELOG]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/CHANGELOG.md

**Latest highlight — 0.7.0:** ~11 KB esbuild bundle (down from ~14 KB), full source-tree refactor into seven single-responsibility directories with comprehensive TSDoc on every module, function, type, and constant. Built for AI-assisted maintenance — every invariant is documented inline and surfaces in IntelliSense.

---

## Contributing

Contributions, bug reports, and feature requests are welcome. See [SUPPORT.md][SUPPORT-CONTRIB] for build / test commands, the layered source-tree architecture, and the three-site sync rule for adding a new file-type pair.

[SUPPORT-CONTRIB]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/SUPPORT.md#contributing

---

## Support the project

If this extension saves you time, consider:

- ⭐ **Starring** the repo on [GitHub](https://github.com/ElecTreeFrying/auto-import-relative-path)
- 💬 **Leaving a review** on the [VS Code Marketplace][reviews]
- **Donating** to one of the addresses below

[reviews]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import&ssr=false#review-details

| Network                                                  | Address                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| **Bitcoin**                                              | `bc1q4j2uewfphjmca83905qv37vcl4jh8va5yupl7w`                         |
| **Solana**                                               | `EHtTGyRoDAK44KBGrEoypAWyPpResHUqwufKnuLs7Tyy`                       |
| **Sui**                                                  | `0xcaf8ff4a65d7e35d961abd0203180013b7fe974d4fa0313e880c39c45ada2b09` |
| **ERC-20: Ethereum / Base / Monad / Polygon / HyperEVM** | `0xd25f84Ed2F76dF2F0C8f1207402eF9e15b5d7855`                         |

---

## Related

- **[Drag Import Relative Path][drag]** — sibling extension by the same author. Drag a file from the Explorer onto an editor to insert the same import.
- **[All extensions by ElecTreeFrying][all]** on the VS Code Marketplace.

[drag]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.drag-import-relative-path
[all]: https://marketplace.visualstudio.com/publishers/ElecTreeFrying

---

## License

[MIT License][MIT]

[MIT]: https://marketplace.visualstudio.com/items/ElecTreeFrying.auto-import/license
