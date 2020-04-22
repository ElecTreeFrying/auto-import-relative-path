
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

### Supported file types: → html ∙ md ∙ js ∙ tsx ∙ ts ∙ tsx ∙ css ∙ scss ∙ sass ∙ less

* [Configure import styles](#import-statements--javascript)
* [Copy and paste like import](#heres-my-solution-)
* [Import to cursor](#Import-to-cursor)
* [Import to bottom](#Import-to-bottom)
* [Import to top](#Import-to-top)

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

* Copy relative path of an active text editor or a file by entering `Auto Import: Paste relative` command.
* Enter command `Auto Import: Paste relative` to paste relative import.

[Click here for more usage.][more-usage]

[more-usage]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md#Keybindings

![auto-import-demo](images/playback.gif "Auto import demo")

## Commands

| Command                             | Key Binding    | Description
| ----------------------------------- | -------------- | --
| `Auto Import: Copy path`            | `Ctrl+Shift+A` | Copy relative path.
| `Auto Import: Paste relative`       | `Ctrl+I`       | Paste relative import in active text editor.
| `Auto Import: Import relative path` | `Alt+D`        | Auto copy and paste relative import inactive text editor.

## Configuration Settings

### General settings

* `quoteStyle`: Select quote style for relative import path. *(double/single quote)*
* `importType`: Paste import on selected line, at the top or bottom of the import list.
* `addSemicolon`: Toggle include semicolon at the end of import statement.
* `disableNotifs`: Disable all notifications.

### Import statements > Javascript

* `importStatements.javascript.jsSupport`: Select **.js** import style.
* `importStatements.javascript.jsxSupport`: Select **.jsx** import style.
* `importStatements.javascript.withExtnameJS`: Include file type at the end of relative import path.

### Import statements > Typescript

* `importStatements.typescript.tsSupport`: Select **.ts** import style.
* `importStatements.typescript.tsxSupport`: Select **.tsx** import style.
* `importStatements.typescript.withExtnameTS`: Include file type at the end of relative import path.
* `importStatements.typescript.addExportName`: Toggle component name in import statement. **(Angular feature)**

### Import statements > Stylesheet

* `importStatements.stylesheet.cssSupport`: Select **.css** import style.
* `importStatements.stylesheet.scssSupport`: Select **.scss** import style.
* `importStatements.stylesheet.lessSupport`: Select **.less** import style.
* `importStatements.stylesheet.withExtnameCSS`: Include file type at the end of relative import path.

### Import statements > HTML

* `importStatements.html.htmlScriptSupport`: Select script import style for HTML.
* `importStatements.html.htmlStylesheetSupport`: Select stylesheet import style for HTML.

### Import statements > Markdown

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

  1. Install Visual Studio Code v1.40.0 or higher
  2. Launch Code
  3. From the command palette `Ctrl+Shift+P` (Windows, Linux) or `Cmd+Shift+P` (OSX)
  4. Select Install Extensions.
  5. Choose **Auto Import** by _ElecTreeFrying_
  6. Reload Visual Studio Code

## Changelog

See [CHANGELOG] for more information.

[CHANGELOG]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/CHANGELOG.md

## Contributing

* File bugs, or any feature requests in [GitHub Issues].
* Leave a review on [Visual Studio Marketplace].

[Github Issues]: https://github.com/ElecTreeFrying/auto-import-relative-path/issues
[Visual Studio Marketplace]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import&ssr=false#review-details

## Related

[More extensions of mine.]

[More extensions of mine.]: https://marketplace.visualstudio.com/publishers/ElecTreeFrying

## License

[MIT]

[MIT]: https://marketplace.visualstudio.com/items/ElecTreeFrying.auto-import/license