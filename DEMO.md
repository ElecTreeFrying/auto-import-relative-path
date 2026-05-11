# Auto Import Relative Path — Demo Gallery

[![Version][version svg]][package] [![Installs][installs svg]][package] [![Downloads][downloads svg]][package] [![Ratings][ratings svg]][package]

[version svg]: https://vsmarketplacebadges.dev/version-short/electreefrying.auto-import.png
[installs svg]: https://vsmarketplacebadges.dev/installs/electreefrying.auto-import.png
[downloads svg]: https://vsmarketplacebadges.dev/downloads/electreefrying.auto-import.png
[ratings svg]: https://vsmarketplacebadges.dev/rating-short/ElecTreeFrying.auto-import.png
[package]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

A visual tour of every workflow, every placement mode, and every supported source / destination pair. For commands, configuration, and troubleshooting see the [README][README].

[README]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/README.md

---

## Table of Contents

- [At a Glance](#at-a-glance)
- [Workflows](#workflows)
  - [One-step Auto](#one-step-auto)
  - [Two-step Copy + Paste](#two-step-copy--paste)
  - [Copy once, paste across tabs](#copy-once-paste-across-tabs)
- [Style Pickers](#style-pickers)
  - [Pick a style on the fly](#pick-a-style-on-the-fly)
  - [Change your default without opening Settings](#change-your-default-without-opening-settings)
- [Placement Modes](#placement-modes)
  - [Cursor](#cursor)
  - [Bottom (default)](#bottom-default)
  - [Top](#top)
- [Per-language Output](#per-language-output)
  - [JavaScript](#javascript)
  - [TypeScript (Angular-aware)](#typescript-angular-aware)
  - [JSX](#jsx)
  - [TSX](#tsx)
  - [CSS](#css)
  - [SCSS](#scss)
  - [HTML](#html)
  - [Markdown](#markdown)
- [Configuration Showcase](#configuration-showcase)

---

## At a Glance

| Command (palette title)                              | Windows / Linux             | macOS                       | What it does                                                                                              |
|------------------------------------------------------|-----------------------------|-----------------------------|-----------------------------------------------------------------------------------------------------------|
| **Auto Import: Copy File Path**                      | <kbd>Ctrl+Shift+A</kbd>     | <kbd>Cmd+Shift+A</kbd>      | Copy the relative path of the selected Explorer file to the clipboard. Toast shows *Paste Now* and *Paste with Style* buttons. |
| **Auto Import: Paste as Import**                     | <kbd>Ctrl+I</kbd>           | <kbd>Cmd+I</kbd>            | Read the clipboard path and insert the import statement into the active editor.                           |
| **Auto Import: Insert Import from Selected File**    | <kbd>Alt+D</kbd>            | <kbd>Option+D</kbd>         | Copy + Paste in one step — select a file in Explorer and import it without switching focus.               |
| **Auto Import: Paste as Import (Pick Style)**        | — (Command Palette / toast) | — (Command Palette / toast) | Open a QuickPick of every import shape accepted for the current pair. Inserts once; default unchanged.    |
| **Auto Import: Set Default Import Style**            | — (Command Palette)         | — (Command Palette)         | Open a QuickPick of styles for the current pair and persist the choice to your global User settings.      |

> All five commands appear in the command palette (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, search `Auto Import`); the three with default keybindings are rebindable from VS Code's keyboard shortcuts editor.

---

## Workflows

### One-step Auto

Focus an editor (the destination), pick a source file in the Explorer, then press <kbd>Alt</kbd>/<kbd>Option</kbd>+<kbd>D</kbd>. Copy and Paste run sequentially in a single command — your active editor never loses focus.

![Single-keystroke import demo][keybinding-single]

[keybinding-single]: https://res.cloudinary.com/october7/image/upload/v1679982581/github/auto-import-relative-path/keybinding-single.gif "Auto import in one keystroke"

**When to use:** the most common case. You know the destination is open and you want one file imported into it.

---

### Two-step Copy + Paste

Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in the Explorer to copy its path. Switch tabs as much as you like, then press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>I</kbd> in the destination editor to paste the import.

![Copy + Paste workflow demo][keybinding-copy-and-paste]

[keybinding-copy-and-paste]: https://res.cloudinary.com/october7/image/upload/v1679982581/github/auto-import-relative-path/keybinding-copy-and-paste.gif "Copy then paste workflow"

**When to use:** when the destination isn't open yet, or you want to navigate / preview before committing.

---

### Copy once, paste across tabs

Because the path lives in your clipboard until you copy something else, you can paste the same import into many destination files in a row. Useful for fanning out a single new module across consumers.

![Paste-across-tabs workflow demo][keybinding-feature]

[keybinding-feature]: https://res.cloudinary.com/october7/image/upload/v1679982581/github/auto-import-relative-path/keybinding-feature.gif "Copy once, paste across multiple tabs"

**When to use:** when you've just added a new utility / component / type and need to import it into N consumers. One copy, N pastes.

---

## Style Pickers

The keystroke commands always emit your *default* import shape for each language. Two palette commands — `extension.pasteImportWithStyle` and `extension.setDefaultImportStyle` — let you pick a different shape, either for one paste or as the new default, without leaving the editor.

### Pick a style on the fly

Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> → *Auto Import: Paste as Import (Pick Style)*, or click *Paste with Style* on the "Copied …" toast that appears after Copy. A QuickPick opens with every import shape accepted for the current source/destination pair (e.g. `.ts` → `.ts` shows the five TypeScript shapes; `.png` → `.tsx` shows the single default-import shape and inserts immediately). The chosen style is inserted once; your `*ImportStyle` settings are not touched.

**When to use:** when you usually want the default but this one paste needs a different shape — a side-effect import, a `@use … as *`, or a CommonJS `require` in an otherwise-ESM file.

### Change your default without opening Settings

Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> → *Auto Import: Set Default Import Style*. The QuickPick lists every style for the source/destination pair you have in front of you, with your current default marked `$(check) Current default` and pinned to the top. Pick a new one and it's persisted to your global VS Code User settings.

**When to use:** when you've decided you want a different default but don't want to navigate Settings UI to find the right key.

> **Some destinations don't have a configurable default** — HTML, Markdown links, and CSS/SCSS image references all use a single hardcoded shape. *Set Default Import Style* shows a "no configurable style" notice in those cases.

---

## Placement Modes

Where the import lands is controlled by `auto-import.preferences.importStatementPlacement` (default: `Bottom`).

> **Auto-override.** For `.html` and `.md` destinations, and when importing a non-stylesheet into a stylesheet, placement is **forced to `Cursor`** regardless of this setting — those contexts don't have an "import block" to attach to.

### Cursor

Set `importStatementPlacement` to `Cursor`. The import inserts at the current cursor position.

![Cursor placement demo][cursor]

[cursor]: https://res.cloudinary.com/october7/image/upload/v1679982363/github/auto-import-relative-path/cursor.gif "Import inserted at cursor position"

```ts
import { useState } from 'react';
import { Header } from './Header';
                                              ← cursor on the blank line here

export function App() {
  return <div />;
}

// after paste:
import { useState } from 'react';
import { Header } from './Header';
import { Button } from './Button';            ← inserted at the cursor's row (column auto-snapped to 0 for scripts)

export function App() {
  return <div />;
}
```

For HTML and Markdown destinations, the column is **not** snapped — the snippet inserts inline at the exact cursor column. That makes the auto-override (`shouldRepositionCursor`) feel natural for those languages: you type around the inserted `<script>` / `![](…)` mid-line.

---

### Bottom (default)

Set `importStatementPlacement` to `Bottom`. The import is appended after the **last recognised** import line.

![Bottom placement demo][bottom]

[bottom]: https://res.cloudinary.com/october7/image/upload/v1679982363/github/auto-import-relative-path/bottom.gif "Import inserted at bottom of imports"

```ts
import { useState } from 'react';
import { Button } from './Button';
import { Header } from './Header';   ← inserted here, after the last import

export function App() { ... }
```

The detector recognises `import …`, `var/const x = require(…)`, `@import '…'`, `@import url(…)`, and `@use '…'`. If no recognisable import is found, it falls back to line 0.

---

### Top

Set `importStatementPlacement` to `Top`. The import is prepended before the first line of the file.

![Top placement demo][top]

[top]: https://res.cloudinary.com/october7/image/upload/v1679982367/github/auto-import-relative-path/top.gif "Import inserted at top of imports"

```ts
import { Header } from './Header';   ← inserted at line 0, pushing everything down
import { useState } from 'react';
import { Button } from './Button';

export function App() { ... }
```

---

## Per-language Output

For each destination language, here's what gets generated. Each example shows the source, destination, the relevant setting, and the resulting snippet that lands in your editor.

### JavaScript

**Default style** — `import name from '_relativePath_';`

```js
// Source:      lib/util.js
// Destination: src/app.js

import util from './lib/util';
//     └─ snippet placeholder; rename and tab out
```

**CommonJS** — `const name = require('_relativePath_');`

```js
const util = require('./lib/util');
```

**Side-effect** — `import '_relativePath_';`

```js
import './polyfills';   // runs the file for its side effects, no binding
```

> **Note:** `.js` destinations only accept `.js` sources. For cross-language imports (e.g., a `.json` or stylesheet), use a `.jsx` destination.

---

### TypeScript (Angular-aware)

**Default style** — `import { name } from '_relativePath_';`

```ts
// Source:      src/app/app-root.component.ts
// Destination: src/app/app.module.ts

import { AppRootComponent } from './app-root.component';
//        └─ derived from the basename, automatically
```

The auto-fill triggers on filenames containing `.component`, `.directive`, `.pipe`, `.service`, or `.module`. Other TypeScript files keep the `name` snippet placeholder:

```ts
// Source:      src/utils/format-date.ts
// Destination: src/main.ts

import { name } from './utils/format-date';
//        └─ regular snippet placeholder; type the identifier
```

> Switch to `import name from '_relativePath_';` (the default-import shape) if you don't want the Angular auto-fill.

---

### JSX

JSX accepts the widest source set: scripts, images, fonts, JSON, YAML, HTML, Markdown, CSS, SCSS.

**Script source** — uses your `javascriptImportStyle` setting:

```jsx
// Source:      src/components/Button.jsx
// Destination: src/pages/Home.jsx

import Button from './components/Button';
```

**Image source** — fixed default-import shape:

```jsx
// Source:      assets/logo.png
// Destination: src/components/Header.jsx

import logo from '../assets/logo.png';
```

**Font / stylesheet source** — fixed side-effect shape:

```jsx
// Source:      assets/fonts/Inter.woff2
import '../assets/fonts/Inter.woff2';

// Source:      styles/global.css
import '../styles/global.css';
```

**JSON / YAML / HTML / Markdown source** — fixed default-import shape:

```jsx
import config from '../config.json';
import data from '../data.yaml';
import doc from '../docs/intro.md';
```

---

### TSX

TSX behaves like JSX but uses your `typescriptImportStyle` setting for `.ts` / `.tsx` sources, with a special case: `.js` sources dropped into a `.tsx` file emit a **JavaScript** shape (not TypeScript), since the source is plain JS.

```tsx
// Source:      src/components/Button.tsx
// Destination: src/pages/Home.tsx
// Setting:     typescriptImportStyle = "import { name } from '_relativePath_';"

import { Button } from './components/Button';

// Source:      src/legacy/util.js   ← .js inside a .tsx project
// Destination: src/pages/Home.tsx
// Setting:     javascriptImportStyle = "import name from '_relativePath_';"

import util from './legacy/util';   ← JS shape, not TS
```

Asset / stylesheet handling is identical to JSX.

---

### CSS

**Default style** — `@import '_relativePath_';`

```css
/* Source:      vendor/normalize.css */
/* Destination: styles/main.css */

@import './vendor/normalize';
```

**`url()` style** — `@import url('_relativePath_');`

```css
@import url('./vendor/normalize');
```

**Image source** — fixed `url('…')` shape:

```css
/* Source:      assets/bg.png */
/* Destination: styles/main.css */

.hero {
  background-image: url('../assets/bg.png');   ← inserted at cursor
}
```

---

### SCSS

**Modern `@use`** — `@use '_relativePath_';`

```scss
// Source:      styles/_variables.scss
// Destination: styles/main.scss

@use './variables';
//    └─ leading `_` stripped, matching Sass partial convention
```

**Modern `@use … as *`** — wildcard alias (no namespace prefix required):

```scss
@use './variables' as *;
```

**Legacy `@import`** — `@import '_relativePath_';`

```scss
@import './variables';
```

**Plain `.css` source** — extension always preserved (Sass requires it for foreign-language imports):

```scss
// Source:      vendor/normalize.css
// Destination: styles/main.scss

@use './vendor/normalize.css';
//                       └─ .css preserved regardless of preserveStylesheetFileExtension
```

**Image source** — fixed `url('…')` shape (same as CSS):

```scss
.hero {
  background-image: url('../assets/bg.png');
}
```

---

### HTML

HTML always inserts at the cursor, with three fixed shapes selected automatically by source extension.

![HTML import demo][html]

[html]: https://res.cloudinary.com/october7/image/upload/v1679982719/github/auto-import-relative-path/html.gif "HTML script and stylesheet import"

**Script source:**

```html
<!-- Source:      js/app.js -->
<!-- Destination: index.html -->

<script type="text/javascript" src="./js/app.js"></script>
```

**Stylesheet source:**

```html
<!-- Source:      styles/main.css -->
<!-- Destination: index.html -->

<link href="./styles/main.css" rel="stylesheet">
```

**Image source:**

```html
<!-- Source:      assets/logo.png -->
<!-- Destination: index.html -->

<img src="./assets/logo.png" alt="sample">
```

> **Note:** `.html` → `.html` is rejected — HTML has no relative-import syntax for embedding itself. The `.html` source can be imported into JSX / TSX as a default import.

---

### Markdown

Markdown always inserts at the cursor.

#### Markdown link to another `.md`

![Markdown link import demo][markdown]

[markdown]: https://res.cloudinary.com/october7/image/upload/v1679982718/github/auto-import-relative-path/markdown.gif "Markdown link import"

```md
<!-- Source:      docs/installation.md -->
<!-- Destination: README.md -->

[text](./docs/installation.md)
```

#### Markdown image — inline syntax

![Markdown image import demo][markdown-image]

[markdown-image]: https://res.cloudinary.com/october7/image/upload/v1679982718/github/auto-import-relative-path/markdown-image.gif "Markdown image import"

```md
<!-- Source:      docs/diagram.png -->
<!-- Destination: README.md -->

![alt-text](./docs/diagram.png "Hover text")
```

#### Markdown image — reference-style syntax

When `markdownImageImportStyle` is set to the reference-style shape, the image is inserted in two parts (inline reference plus link definition) at the cursor:

```md
![alt-text][image] / [image]: ./docs/diagram.png "Hover text"
```

> **Tip:** Reference-style is useful when the same image is referenced multiple times — define the path once and reuse the `[image]` reference.

---

## Configuration Showcase

Same source, same destination — different settings, different output.

| Setting and value                                                                            | Output                                                |
|----------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `javascriptImportStyle = "import name from '_relativePath_';"`                                | `import util from './lib/util';`                      |
| `javascriptImportStyle = "import { name } from '_relativePath_';"`                            | `import { util } from './lib/util';`                  |
| `javascriptImportStyle = "import { default as name } from '_relativePath_';"`                 | `import { default as util } from './lib/util';`       |
| `javascriptImportStyle = "import * as name from '_relativePath_';"`                           | `import * as util from './lib/util';`                 |
| `javascriptImportStyle = "import '_relativePath_';"`                                          | `import './lib/util';`                                |
| `javascriptImportStyle = "var name = require('_relativePath_');"`                             | `var util = require('./lib/util');`                   |
| `javascriptImportStyle = "const name = require('_relativePath_');"`                           | `const util = require('./lib/util');`                 |
| `javascriptImportStyle = "var name = import('_relativePath_');"`                              | `var util = import('./lib/util');`                    |
| `javascriptImportStyle = "const name = import('_relativePath_');"`                            | `const util = import('./lib/util');`                  |
| `preserveScriptFileExtension = true`                                                         | `import util from './lib/util.js';`                   |
| `scssImportStyle = "@import '_relativePath_';"`                                              | `@import './variables';`                              |
| `scssImportStyle = "@use '_relativePath_';"`                                                 | `@use './variables';`                                 |
| `scssImportStyle = "@use '_relativePath_' as *;"`                                            | `@use './variables' as *;`                            |
| `cssImportStyle = "@import url('_relativePath_');"`                                          | `@import url('./variables');`                         |
| `markdownImageImportStyle = "![alt-text][image] / [image]: _relativePath_ \"Hover text\""`   | `![alt-text][image] / [image]: ./diagram.png "..."`   |

> Source path is `lib/util.js` (or equivalent); destination is one folder above.

---

For commands, full configuration reference, and troubleshooting see the [README][README].
