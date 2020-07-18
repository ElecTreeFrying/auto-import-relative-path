
# Auto Import Relative Path (DEMO)

Auto import relative path [extension] for [VS Code]. Auto import relative path without typing long and tedious import statements and file paths.

[VS Code]: https://code.visualstudio.com/
[extension]: https://marketplace.visualstudio.com/VSCode

*An alternative solution of drag and drop import that is not currently available in VS Code.*

> Drag and drop to import files in JS! [#61667][0] </br> 
> Allow to add file reference with drag and drop. [#5240][1]

[0]: https://github.com/microsoft/vscode/issues/61667
[1]: https://github.com/microsoft/vscode/issues/5240

## Commands

| Command              | Key Binding    | Description                                                                          |
| -------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `Auto Import: Copy`  | `Ctrl+Shift+A` | Copy relative path of selected file in explorer.                                     |
| `Auto Import: Paste` | `Ctrl+I`       | Paste import in selected/active tab.                                                 |
| `Auto Import: Auto`  | `Alt+D`        | Auto copy and paste import statement of a file from explorer to selected/active tab. |

## Contents

* [Position](#Position)
* [Keybindings](#Keybindings)
* [HTML Support](#HTML-Support)
* [Markdown Support](#Markdown-Support)

## Demo

* (Position) → [Import to cursor](#Import-to-cursor--ctrli)
* (Position) → [Import to bottom](#Import-to-bottom--ctrli)
* (Position) → [Import to top](#Import-to-top--ctrli)
* (Keybindings) → [Auto import from Explorer → `Ctrl+Shift+A` / `Ctrl+I`](#auto-import-from-explorer--ctrlshifta--ctrli)
* (Keybindings) → [Single keybinding import → `Alt+D`](#single-keybinding-import--altd)
* (Keybindings) → [Auto import across active tabs](#Auto-Import-from-text-editor)
* (HTML Support) → [Import script and stylesheet](#Import-script-and-stylesheet)
* (Markdown Support) → [Import image to markdown](#Import-image-to-markdown)
* (Markdown Support) → [Import markdown](#Import-markdown)

## Position

### Import to cursor → `Ctrl+I`

![extension-settings-preview](images/cursor.gif "import to cursor using ctrl+i command")

### Import to bottom → `Ctrl+I`

![extension-settings-preview](images/bottom.gif "import to bottom using ctrl+i command")

### Import to top → `Ctrl+I`

![extension-settings-preview](images/top.gif "import to top using ctrl+i command")

## Keybindings

### Auto import from Explorer → `Ctrl+Shift+A` / `Ctrl+I`

![auto-import-from-explorer](images/keybinding-copy-and-paste.gif "Auto import from explorer demo")

### Single keybinding import → `Alt+D`

![single-keybinding-import](images/keybinding-single.gif "Single keybinding import demo")

### Auto import across active tabs → `Ctrl+Shift+A` / `Ctrl+I`

![auto-import-from-text-editor](images/keybinding-feature.gif "Auto import from text editor demo")

## HTML Support

## Import script and stylesheet

![import-script-stylesheet-demo](images/html.gif "Import script and stylesheet")

## Markdown Support

### Import image to markdown

![markdown-image-import](images/markdown-image.gif "Markdown image import demo")

### Import markdown

![markdown-import](images/markdown.gif "Markdown import demo")

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
