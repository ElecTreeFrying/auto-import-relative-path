
# Auto Import Relative Path (vscode extension)

[![Current version of Auto Import Relative Path][version svg]][package] [![Current installs of Auto Import Relative Path][installs svg]][package] [![Current downloads of Auto Import Relative Path][downloads svg]][package] [![Current ratings of Auto Import Relative Path][ratings svg]][package]

[version svg]: https://vsmarketplacebadge.apphb.com/version-short/electreefrying.auto-import.svg
[installs svg]: https://vsmarketplacebadge.apphb.com/installs/electreefrying.auto-import.svg
[downloads svg]: https://vsmarketplacebadge.apphb.com/downloads/electreefrying.auto-import.svg
[ratings svg]: https://vsmarketplacebadge.apphb.com/rating-short/ElecTreeFrying.auto-import.svg
[package]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

Auto import relative path [extension] for [VS Code]. Auto import relative path without typing long and tedious import statements and file paths.

[VS Code]: https://code.visualstudio.com/
[extension]: https://marketplace.visualstudio.com/VSCode

[Click here for more examples.][demo]

[demo]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md

## Features

### Supported file types: → js ∙ tsx ∙ ts ∙ tsx ∙ css ∙ scss ∙ sass ∙ less ∙ html ∙  md

* [Configure import styles](#Import-statements)
* [Copy and paste like import](#heres-my-solution-)
* [Import to cursor](#Import-to-cursor)
* [Import to bottom](#Import-to-bottom)
* [Import to top](#Import-to-top)
* [⭐️ NEW UPDATE !! ⭐️ → HTML support 🔥🔥][html support]
  1. [Auto import script files to HTML.][html script stylesheet import demo]
  1. [Auto import stylesheet files to HTML.][html script stylesheet import demo]
* [⭐️ NEW UPDATE !! ⭐️ → Markdown support 🔥🔥][markdown support]
  1. [Auto import image to markdown.][markdown image import]
  1. [Auto import relative between markdown files.][markdown import]

[html support]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#html-support
[html script stylesheet import demo]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#import-script-and-stylesheet

[markdown support]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#markdown-support
[markdown image import]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#import-image-to-markdown
[markdown import]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#import-markdown

## Usage

As of now drag and drop import feature is still not available in vscode.

> https://github.com/microsoft/vscode/issues/61667
> <br> Drag and drop to import files in JS! [#61667][0]
>
> https://github.com/microsoft/vscode/issues/5240
> <br> Allow to add file reference with drag and drop. [#5240][1]

[0]: https://github.com/microsoft/vscode/issues/61667
[1]: https://github.com/microsoft/vscode/issues/5240

### Here's my solution !

* Copy relative path by entering command `Auto Import: Paste relative` or press `Ctrl+Shift+A`.
    1. In selected text editor.
    1. In a file in explorer.
* And import in selected text editor see demo.
* In selected text editor enter command `Auto Import: Paste relative` or press `Ctrl+I`.

![auto-import-demo](images/playback.gif "Auto import demo")

## Commands

| Key Binding    | Command                     | Description           |
| -------------- | --------------------------- | --------------------- |
| `Ctrl+Shift+A` | Auto Import: Copy path      | Copy relative path    |
| `Ctrl+I`       | Auto Import: Paste relative | Paste relative import |

## Configuration Settings

### General settings

* `quoteStyle`: (double/single quote) Select quote style for path.
* `importType`: Paste import on selected line at the top or bottom of the import list.
* `addSemicolon`: Toggle semicolon at the end of import statement.
* `disableNotifs`: Disable all notifications on file drop to active pane.

### Import statements

#### Javascript

* `importStatements.javascript.jsSupport`: Select **.js** import style.
* `importStatements.javascript.jsxSupport`: Select **.jsx** import style.
* `importStatements.javascript.withExtnameJS`: Toggle file type or extension name at the end of path. _{ex. "../path.js"}_

#### Typescript

* `importStatements.typescript.tsSupport`: Select **.ts** import style.
* `importStatements.typescript.tsxSupport`: Select **.tsx** import style.
* `importStatements.typescript.withExtnameTS`: Toggle file type/extension name at the end of path. _{ex. "../path.ts"}_
* `importStatements.typescript.addExportName`: Toggle component name in import statement. (Angular/.tsx)

#### Stylesheet

* `importStatements.stylesheet.cssSupport`: Select **.css** import style.
* `importStatements.stylesheet.scssSupport`: Select **.scss** import style.
* `importStatements.stylesheet.lessSupport`: Select **.less** import style.
* `importStatements.stylesheet.withExtnameCSS`: Toggle file type or extension name at the end of path. _{ex. "../path.css"}_

#### HTML

* `importStatements.html.htmlScriptSupport`: Select script import style for HTML.
* `importStatements.html.htmlStylesheetSupport`: Select stylesheet import style for HTML.

#### Markdown

* `importStatements.markdown.markdownSupport`: Select **.md** import style.
* `importStatements.markdown.markdownImageSupport`: Select import style for image import in markdown.

### Settings Preview

![extension-settings-preview](images/settings.gif "Extension settings")

## Demo

### Import to cursor

![extension-settings-preview](images/cursor.gif "Extension settings")

### Import to bottom

![extension-settings-preview](images/bottom.gif "Extension settings")

### Import to top

![extension-settings-preview](images/top.gif "Extension settings")

## Installation

  1. Install Visual Studio Code v1.30.0 or higher
  1. Launch Code
  1. From the command palette `Ctrl+Shift+P` (Windows, Linux) or `Cmd+Shift+P` (OSX)
  1. Select Install Extensions.
  1. Choose **Auto Import** by _ElecTreeFrying_
  1. Reload Visual Studio Code

## Changelog

See [CHANGELOG] for more information.

[CHANGELOG]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/CHANGELOG.md

## Contributing

* File bugs, feature requests in [GitHub Issues].
* Leave a review on [Visual Studio Marketplace].

[Github Issues]: https://github.com/ElecTreeFrying/auto-import-relative-path/issues
[Visual Studio Marketplace]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import&ssr=false#review-details

## Related

[More extensions of mine.]

[More extensions of mine.]: https://marketplace.visualstudio.com/publishers/ElecTreeFrying

## License

[MIT]

[MIT]: https://marketplace.visualstudio.com/items/ElecTreeFrying.auto-import/license