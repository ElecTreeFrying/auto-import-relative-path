
# Auto-import (vscode extension)

Auto import [extension] for [VS Code]. Auto import without typing long and tedious import statements and file paths.

### Supported file types:
*  JS , JSX , TS , TSX , CSS , SCSS , SASS , LESS.

As of now drag and drop import feature is still not available in vscode.

> https://github.com/microsoft/vscode/issues/61667
> <br> Drag and drop to import files in JS! [#61667][0]
>
> https://github.com/microsoft/vscode/issues/5240
> <br> Allow to add file reference with drag and drop. [#5240][1]

## Usage

* Copy file path from tree view `Shift+Alt+C`.
* On your text editor `Ctrl+I` / `Ctrl+Shift+P` > `Auto Import`

![sample1](https://bit.ly/39R06mu)

## Extension Settings

* `quoteStyle`: Select a quote style for import path.
* `addSemicolon`: Add semicolon at the end of import statement.
* `disableNotifs`: Disable all notifications on file drop to active pane.
* `closeAllNotif`: Close all active notifications on Escape keydown.

Import statements > Javascript

* `importStatements.javascript.jsSupport`: Select **.js** import style of choice.
* `importStatements.javascript.jsxSupport`: Select **.jsx** import style of choice.
* `importStatements.javascript.withExtnameJS`: (enable/disable) Add file type or extension name at the end of path. _{ex. "../path.js"}_

Import statements > Typescript

* `importStatements.typescript.tsSupport`: Select **.ts** import style of choice.
* `importStatements.typescript.tsxSupport`: Select **.tsx** import style of choice.
* `importStatements.typescript.withExtnameTS`: (enable/disable)	Add file type or extension name at the end of path. _{ex. "../path.ts"}_
* `importStatements.typescript.addExportName`: (enable/disable)	Include component name in import statement. (Angular)<br/>*same behaviour applies in .tsx files.*

Import statements > Stylesheet

* `importStatements.stylesheet.cssSupport`: Select **.css** import style of choice.
* `importStatements.stylesheet.scssSupport`: Select **.scss** import style of choice.
* `importStatements.stylesheet.lessSupport`: Select **.less** import style of choice.
* `importStatements.stylesheet.withExtnameCSS`: (enable/disable) Add file type or extension name at the end of path. _{ex. "../path.css"}_


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
