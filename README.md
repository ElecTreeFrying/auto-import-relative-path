# Auto Import Relative Path

[![Current version of Auto Import Relative Path][version svg]][package] [![Current installs of Auto Import Relative Path][installs svg]][package] [![Current downloads of Auto Import Relative Path][downloads svg]][package] [![Current ratings of Auto Import Relative Path][ratings svg]][package]

[version svg]: https://vsmarketplacebadges.dev/version-short/electreefrying.auto-import.png
[installs svg]: https://vsmarketplacebadges.dev/installs/electreefrying.auto-import.png
[downloads svg]: https://vsmarketplacebadges.dev/downloads/electreefrying.auto-import.png
[ratings svg]: https://vsmarketplacebadges.dev/rating-short/ElecTreeFrying.auto-import.png
[package]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

## Table of Contents

- [Auto Import Relative Path](#auto-import-relative-path)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Supported File Extensions](#supported-file-extensions)
  - [Quick Start](#quick-start)
  - [Usage](#usage)
    - [Examples by Active Editor](#examples-by-active-editor)
  - [Commands](#commands)
  - [Configuration Settings](#configuration-settings)
    - [General Settings](#general-settings)
    - [Import Statements](#import-statements)
      - [Scripts (JS, JSX, TS, TSX)](#scripts-js-jsx-ts-tsx)
      - [Stylesheets (CSS, SCSS)](#stylesheets-css-scss)
      - [Markup (HTML, Markdown)](#markup-html-markdown)
  - [Installation](#installation)
  - [Changelog](#changelog)
  - [Contributing](#contributing)
  - [Support the Project](#support-the-project)
  - [Related](#related)
  - [License](#license)

---

## Introduction

**Auto Import Relative Path** is a [Visual Studio Code][VS Code] extension that simplifies how you import files in your projects. No more memorizing or typing out long relative paths — let this extension do the heavy lifting for you. Whether you’re building a small side project or a complex application with hundreds of files, Auto Import Relative Path will help you streamline your workflow and keep your code clean.

[VS Code]: https://code.visualstudio.com/

---

## Features

- **Instant Relative Path Imports**: Quickly copy and paste a file’s path in your editor, or auto-import it in a single command.  
- **Flexible Placement**: Place new import statements at the top, the bottom, or even at your cursor’s current position.  
- **Highly Customizable**: Configure the style of import statements for JavaScript, TypeScript, React, CSS, SCSS, HTML, and Markdown.  
- **Time-Saving**: Ideal for large projects with complex directory structures.  
- **Keyboard Friendly**: Offers intuitive default shortcuts so you can keep your hands on the keyboard and stay in the flow.

---

## Supported File Extensions

|                | Extensions                            |
|----------------|----------------------------------------|
| **JavaScript** | `.js`, `.jsx`, `.ts`, `.tsx`           |
| **Markup**     | `.html`, `.md`                         |
| **Styles**     | `.css`, `.scss`                        |

---

## Quick Start

1. **Install the extension** (see [Installation](#installation)).
2. **Open your project** in VS Code.
3. **Right-click** any file in the Explorer panel.
4. Use one of the extension’s commands:  
   - **Copy Path** (and then paste it manually), or  
   - **Auto Import** (single-step copy & paste).  
5. Watch your import statement appear in your code automatically!

---

## Usage

1. **From Explorer**:  
   - Select a file in the Explorer panel.  
   - Press `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (macOS) to copy the path.  
   - Go to your editor and press `Ctrl+I` (Windows/Linux) or `Cmd+I` (macOS) to paste the import statement.  
   → [*See it in action*][usagedemo1]

2. **One-Step Import**:  
   - Select a file in the Explorer panel.  
   - Press `Alt+D` (Windows/Linux) or `Option+D` (macOS), or any custom keybinding you configure.  
   → [*See it in action*][usagedemo2]

[usagedemo1]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#auto-import-from-explorer  
[usagedemo2]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#single-keybinding-import  

> **More usage demos**:  
> - [Click here for more examples][Click here for more usage examples.]

![auto-import-demo][playback]

[playback]: https://res.cloudinary.com/october7/image/upload/v1679982147/github/auto-import-relative-path/playback.gif "auto import relative path demo"

---

### Examples by Active Editor

| Active Editor  | Example Imports                                                                                                                                                               | More Examples               |
|:--------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------:|
| **.html**      | `.js`, `.css`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.webp`                                                                                                                      | [Learn more][usagedemo3]    |
| **.md**        | Self, `.gif`, `.jpeg`, `.jpg`, `.png`, `.webp`                                                                                                                               | [Learn more][usagedemo4]    |
| **.js**, **.ts**   | Self                                                                                                                                                                          | -                           |
| **.jsx**       | Self, `.js`, `.json`, `.css`, `.sass`, `.scss`, `.png`, `.jpg`, `.gif`, `.svg`, `.webp`, `.woff`, `.woff2`, `.ttf`, `.eot`, `.md`, `.yml`, `.yaml`, `.html`                 | -                           |
| **.tsx**       | Self, `.ts`, `.js`, `.json`, `.css`, `.sass`, `.scss`, `.png`, `.jpg`, `.gif`, `.svg`, `.webp`, `.woff`, `.woff2`, `.ttf`, `.eot`, `.md`, `.yml`, `.yaml`, `.html`          | -                           |
| **.css**       | Self, `.gif`, `.jpeg`, `.jpg`, `.png`, `.webp`                                                                                                                                | -                           |
| **.scss**      | Self, `.css`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.webp`                                                                                                                        | -                           |

[usagedemo3]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#html-support  
[usagedemo4]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#markdown-support  
[Click here for more usage examples.]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md

---

## Commands

| Command               | Windows/Linux        | macOS               | Description                                                                                                           | Demo                  |
|-----------------------|----------------------|---------------------|-----------------------------------------------------------------------------------------------------------------------|-----------------------|
| **Auto Import: Copy** | <kbd>Ctrl+Shift+A</kbd> | <kbd>Cmd+Shift+A</kbd> | **Copy** the relative path of the selected file in Explorer.                                                          | [Demo][commandsdemo1] |
| **Auto Import: Paste**| <kbd>Ctrl+I</kbd>       | <kbd>Cmd+I</kbd>       | **Paste** the import statement into your active text editor.                                                          | [Demo][commandsdemo1] |
| **Auto Import: Auto** | <kbd>Alt+D</kbd>        | <kbd>Option+D</kbd>    | **Auto** copy and paste the import statement from Explorer to your active text editor in one step (copy + paste).     | [Demo][commandsdemo2] |

[commandsdemo1]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#auto-import-from-explorer  
[commandsdemo2]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#single-keybinding-import  


---

## Configuration Settings

Below is a summary of configuration settings you can tweak to match your code style and preferences. All settings can be found under the extension’s settings in VS Code (usually via `Ctrl+,` or `Cmd+,`).

### General Settings
- **`preferences.importStatementPlacement`**  
  Decide where new imports are placed:
  - `top` (at the top of all imports)
  - `bottom` (at the bottom of all imports)
  - `Cursor` (where the cursor currently is)

### Import Statements

#### Scripts (JS, JSX, TS, TSX)

- **`importStatements.script.preserveFileExtension`** *(Boolean)*  
  *Default: `false`*  
  Toggle to `true` if you want to keep file extensions in JS/TS imports.

- **`importStatements.script.javascriptImportStyle`** *(String)*  
  Various styles for importing JavaScript files.  
  *Default: `import $1 from '_relativePath_';`*

  Options include:
  - `import $1 from '_relativePath_';`
  - `import { $1 } from '_relativePath_';`
  - `import { $1 as $2 } from '_relativePath_';`
  - `import * as $1 from '_relativePath_';`
  - `import '_relativePath_';`
  - `var $1 = require('_relativePath_');`
  - `const $1 = require('_relativePath_');`
  - `var $1 = import('_relativePath_');`
  - `const $1 = import('_relativePath_');`

- **`importStatements.script.typescriptImportStyle`** *(String)*  
  Similar to JavaScript import styles, with a default of  
  *`import { $1 } from '_relativePath_';`*

#### Stylesheets (CSS, SCSS)

- **`importStatements.styleSheet.preserveFileExtension`** *(Boolean)*  
  *Default: `false`*  
  Choose whether to keep `.css` or `.scss` in your imports.

- **`importStatements.styleSheet.cssImportStyle`** *(String)*  
  *Default: `@import '_relativePath_';`*

  Other options:
  - `@import url('_relativePath_');`

- **`importStatements.styleSheet.cssImageImportStyle`** *(String)*  
  *Default: `url('_relativePath_')`*

- **`importStatements.styleSheet.scssImportStyle`** *(String)*  
  *Default: `@import '_relativePath_';`*

  Other options:
  - `@import url('_relativePath_');`
  - `@use '_relativePath_';`
  - `@use '_relativePath_' as *;`

- **`importStatements.styleSheet.scssImageImportStyle`** *(String)*  
  *Default: `url('_relativePath_')';`*

#### Markup (HTML, Markdown)

- **HTML**  
  - **`importStatements.markup.htmlScriptImportStyle`**  
    *Default: `<script type="text/javascript" src="_relativePath_"></script>`*
  - **`importStatements.markup.htmlImageImportStyle`**  
    *Default: `<img src="_relativePath_" alt="sample">`*
  - **`importStatements.markup.htmlStyleSheetImportStyle`**  
    *Default: `<link href="_relativePath_" rel="stylesheet">`*

- **Markdown**  
  - **`importStatements.markup.markdownImportStyle`**  
    *Default: `![text](_relativePath_)`*
  - **`importStatements.markup.markdownImageImportStyle`**  
    *Default: `![alt-text](_relativePath_ "Hover text")`*

---

## Installation

1. **Install VS Code** v1.98.0 or higher.  
2. **Launch VS Code**.  
3. Press `Ctrl+Shift+P` (Windows, Linux) or `Cmd+Shift+P` (macOS).  
4. Type and select `Extensions: Install Extensions`.  
5. Search for **Auto Import Relative Path** by _ElecTreeFrying_.  
6. Click **Install** and reload VS Code.

---

## Changelog

Check out the [CHANGELOG] for detailed release notes and version history.

[CHANGELOG]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/CHANGELOG.md

---

## Contributing

Found a bug or have a feature request? Feel free to open an issue in [GitHub Issues]. You can also leave a star on GitHub or a review on the [Visual Studio Marketplace]. Your feedback is greatly appreciated and helps make this extension better!

[GitHub Issues]: https://github.com/ElecTreeFrying/auto-import-relative-path/issues  
[Visual Studio Marketplace]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import&ssr=false#review-details  

---

## Support the Project

If this extension has helped you or saved you time, and you’d like to show your support, you can send a donation to any of the addresses below:

- **Bitcoin**: `bc1q4j2uewfphjmca83905qv37vcl4jh8va5yupl7w`  
- **Solana**: `EHtTGyRoDAK44KBGrEoypAWyPpResHUqwufKnuLs7Tyy`  
- **Sui**: `0xcaf8ff4a65d7e35d961abd0203180013b7fe974d4fa0313e880c39c45ada2b09`  
- **ERC20**: `0xd25f84Ed2F76dF2F0C8f1207402eF9e15b5d7855`  

Thank you for your support—every bit helps us continue improving **Auto Import Relative Path**!

---

## Related

Check out more of my [extensions on the VS Code Marketplace].

[extensions on the VS Code Marketplace]: https://marketplace.visualstudio.com/publishers/ElecTreeFrying

---

## License

This project is licensed under the [MIT License][MIT]. See the link for more details.

[MIT]: https://marketplace.visualstudio.com/items/ElecTreeFrying.auto-import/license

---

**Happy importing and enjoy a cleaner, more efficient workflow!**
