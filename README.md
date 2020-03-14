
# Auto Import (vscode extension)

Auto import [extension] for [VS Code]. Auto import without typing long and tedious import statements and file paths.

## Supported file types

* JS , JSX , TS , TSX , CSS , SCSS , SASS , LESS.

## Usage

As of now drag and drop import feature is still not available in vscode.

> https://github.com/microsoft/vscode/issues/61667
> <br> Drag and drop to import files in JS! [#61667][0]
>
> https://github.com/microsoft/vscode/issues/5240
> <br> Allow to add file reference with drag and drop. [#5240][1]

<br> Here's my solution !

* Copy file path from tree view `Shift+Alt+C`.
* On your text editor `Ctrl+I` / `Ctrl+Shift+P` > `Auto Import`

![sample1](https://bit.ly/39R06mu)

## Extension Settings

* `quoteStyle`: (double/single quote) Select quote style for path.
* `importType`: Paste import on selected line at the top or bottom of the import list.
* `addSemicolon`: Toggle semicolon at the end of import statement.
* `disableNotifs`: Disable all notifications on file drop to active pane.
* `closeAllNotif`: Close all active notifications on Escape keydown.

Import statements > Javascript

* `importStatements.javascript.jsSupport`: Select **.js** import style.
* `importStatements.javascript.jsxSupport`: Select **.jsx** import style.
* `importStatements.javascript.withExtnameJS`: Toggle file type or extension name at the end of path. _{ex. "../path.js"}_

Import statements > Typescript

* `importStatements.typescript.tsSupport`: Select **.ts** import style.
* `importStatements.typescript.tsxSupport`: Select **.tsx** import style.
* `importStatements.typescript.withExtnameTS`: Toggle file type/extension name at the end of path. _{ex. "../path.ts"}_
* `importStatements.typescript.addExportName`: Toggle component name in import statement. (Angular/.tsx)

Import statements > Stylesheet

* `importStatements.stylesheet.cssSupport`: Select **.css** import style.
* `importStatements.stylesheet.scssSupport`: Select **.scss** import style.
* `importStatements.stylesheet.lessSupport`: Select **.less** import style.
* `importStatements.stylesheet.withExtnameCSS`: Toggle file type or extension name at the end of path. _{ex. "../path.css"}_

## Installation

  1. Install Visual Studio Code v1.30.0 or higher
  1. Launch Code
  1. From the command palette `Ctrl+Shift+P` (Windows, Linux) or `Cmd+Shift+P` (OSX)
  1. Select `Install Extensions`
  1. Choose the extension
  1. Reload Visual Studio Code

## License

MIT

[VS Code]: https://code.visualstudio.com/
[extension]: https://marketplace.visualstudio.com/VSCode
[0]: https://github.com/microsoft/vscode/issues/61667
[1]: https://github.com/microsoft/vscode/issues/5240
