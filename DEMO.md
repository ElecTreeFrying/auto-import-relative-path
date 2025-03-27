# Auto Import Relative Path (DEMO)

[![Version][version svg]][package] [![Installs][installs svg]][package] [![Downloads][downloads svg]][package] [![Ratings][ratings svg]][package]

**Auto Import Relative Path** is a [Visual Studio Code][VS Code] extension that simplifies how you import files in your projects. No more memorizing or typing out long relative paths — let this extension do the heavy lifting for you. Whether you’re building a small side project or a complex application with hundreds of files, Auto Import Relative Path will help you streamline your workflow and keep your code clean.

[VS Code]: https://code.visualstudio.com/

[VS Code]: https://code.visualstudio.com/
[extension]: https://marketplace.visualstudio.com/VSCode
[version svg]: https://vsmarketplacebadges.dev/version-short/electreefrying.auto-import.png
[installs svg]: https://vsmarketplacebadges.dev/installs/electreefrying.auto-import.png
[downloads svg]: https://vsmarketplacebadges.dev/downloads/electreefrying.auto-import.png
[ratings svg]: https://vsmarketplacebadges.dev/rating-short/ElecTreeFrying.auto-import.png
[package]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

---

## Table of Contents

- [Auto Import Relative Path (DEMO)](#auto-import-relative-path-demo)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Supported File Extensions](#supported-file-extensions)
  - [Commands](#commands)
  - [Import Statement Position](#import-statement-position)
    - [Append to Cursor](#append-to-cursor)
    - [Append to the Bottom of the Import List](#append-to-the-bottom-of-the-import-list)
    - [Append to the Top of the Import List](#append-to-the-top-of-the-import-list)
  - [Keybindings](#keybindings)
    - [Auto Import from Explorer](#auto-import-from-explorer)
    - [Single Keybinding Import](#single-keybinding-import)
    - [Auto Import Across Active Tabs](#auto-import-across-active-tabs)
  - [HTML Support](#html-support)
    - [Import Script and Stylesheet](#import-script-and-stylesheet)
  - [Markdown Support](#markdown-support)
    - [Import Image to Markdown](#import-image-to-markdown)
    - [Import Markdown](#import-markdown)
  - [Changelog](#changelog)
  - [Contributing](#contributing)
  - [Support](#support)
  - [Support the Project](#support-the-project)
  - [Related](#related)

---

## Features

- **Instant Relative Path Imports**: Quickly copy and paste a file’s path in your editor, or auto-import it in a single command.  
- **Flexible Placement**: Place new import statements at the top, the bottom, or even at your cursor’s current position.  
- **Highly Customizable**: Configure the style of import statements for JavaScript, TypeScript, React, CSS, SCSS, HTML, and Markdown.  
- **Time-Saving**: Ideal for large projects with complex directory structures.  
- **Keyboard Friendly**: Offers intuitive default shortcuts so you can keep your hands on the keyboard and stay in the flow.

---

## Supported File Extensions

| File Type       | File Extension               |
| --------------- | ---------------------------- |
| **Programming** | `.js`, `.jsx`, `.ts`, `.tsx` |
| **Markup**      | `.html`, `.md`               |
| **Stylesheet**  | `.css`, `.scss`              |

---

## Commands


| Command               | Windows/Linux        | macOS               | Description                                                                                                           | Demo                  |
|-----------------------|----------------------|---------------------|-----------------------------------------------------------------------------------------------------------------------|-----------------------|
| **Auto Import: Copy** | <kbd>Ctrl+Shift+A</kbd> | <kbd>Cmd+Shift+A</kbd> | **Copy** the relative path of the selected file in Explorer.                                                          | [See it in action](#auto-import-from-explorer) |
| **Auto Import: Paste**| <kbd>Ctrl+I</kbd>       | <kbd>Cmd+I</kbd>       | **Paste** the import statement into your active text editor.                                                          | [See it in action](#auto-import-from-explorer) |
| **Auto Import: Auto** | <kbd>Alt+D</kbd>        | <kbd>Option+D</kbd>    | **Auto** copy and paste the import statement from Explorer to your active text editor in one step (copy + paste).     | [Single keybinding import](#single-keybinding-import) |

---

## Import Statement Position

You can configure where the import statement goes in your code. Choose any of the following placement options:

---

### Append to Cursor

**Windows/Linux:**
1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in Explorer.
2. Switch to your active text editor and press <kbd>Ctrl</kbd>+<kbd>I</kbd> to paste.
3. Or use <kbd>Alt</kbd>+<kbd>D</kbd> to do both in one step (copy + paste).

**macOS:**
1. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in Explorer.
2. Switch to your active text editor and press <kbd>Cmd</kbd>+<kbd>I</kbd> to paste.
3. Or use <kbd>Option</kbd>+<kbd>D</kbd> to do both in one step (copy + paste).

![Cursor Demo][cursor]

[cursor]: https://res.cloudinary.com/october7/image/upload/v1679982363/github/auto-import-relative-path/cursor.gif "import to cursor using ctrl+i command"

---

### Append to the Bottom of the Import List

**Windows/Linux:**
1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in Explorer.
2. Press <kbd>Ctrl</kbd>+<kbd>I</kbd> in your code editor to paste at the bottom.
3. Or use <kbd>Alt</kbd>+<kbd>D</kbd> to copy and paste in one step.

**macOS:**
1. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in Explorer.
2. Press <kbd>Cmd</kbd>+<kbd>I</kbd> in your code editor to paste at the bottom.
3. Or use <kbd>Option</kbd>+<kbd>D</kbd> to copy and paste in one step.

![Bottom Demo][bottom]

[bottom]: https://res.cloudinary.com/october7/image/upload/v1679982363/github/auto-import-relative-path/bottom.gif "import to bottom using ctrl+i command"

---

### Append to the Top of the Import List

**Windows/Linux:**
1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in Explorer.
2. Press <kbd>Ctrl</kbd>+<kbd>I</kbd> in your code editor to paste at the top.
3. Or use <kbd>Alt</kbd>+<kbd>D</kbd> to copy and paste in one step.

**macOS:**
1. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in Explorer.
2. Press <kbd>Cmd</kbd>+<kbd>I</kbd> in your code editor to paste at the top.
3. Or use <kbd>Option</kbd>+<kbd>D</kbd> to copy and paste in one step.

![Top Demo][top]

[top]: https://res.cloudinary.com/october7/image/upload/v1679982367/github/auto-import-relative-path/top.gif "import to top using ctrl+i command"

---

## Keybindings

### Auto Import from Explorer

**Windows/Linux**  
1. In the Explorer, press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file.  
2. In the editor, press <kbd>Ctrl</kbd>+<kbd>I</kbd> to paste the import statement.

**macOS**  
1. In the Explorer, press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file.  
2. In the editor, press <kbd>Cmd</kbd>+<kbd>I</kbd> to paste the import statement.

![Auto import from explorer demo][keybinding-copy-and-paste]

[keybinding-copy-and-paste]: https://res.cloudinary.com/october7/image/upload/v1679982581/github/auto-import-relative-path/keybinding-copy-and-paste.gif "Auto import from explorer demo"

---

### Single Keybinding Import

**Windows/Linux**  
1. Press <kbd>Alt</kbd>+<kbd>D</kbd> on a file in the Explorer.  
2. The import statement is automatically inserted into your active editor.

**macOS**  
1. Press <kbd>Option</kbd>+<kbd>D</kbd> on a file in the Explorer.  
2. The import statement is automatically inserted into your active editor.

![Single keybinding import demo][keybinding-single]

[keybinding-single]: https://res.cloudinary.com/october7/image/upload/v1679982581/github/auto-import-relative-path/keybinding-single.gif "Single keybinding import demo"

---

### Auto Import Across Active Tabs

**Windows/Linux**  
1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in the Explorer.  
2. Switch to any open tab and press <kbd>Ctrl</kbd>+<kbd>I</kbd>.  
3. The relative path import will be pasted where your cursor is.

**macOS**  
1. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a file in the Explorer.  
2. Switch to any open tab and press <kbd>Cmd</kbd>+<kbd>I</kbd>.  
3. The relative path import will be pasted where your cursor is.

![Auto import from text editor demo][keybinding-feature]

[keybinding-feature]: https://res.cloudinary.com/october7/image/upload/v1679982581/github/auto-import-relative-path/keybinding-feature.gif "Auto import from text editor demo"

---

## HTML Support

### Import Script and Stylesheet

**Windows/Linux**  
1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a `.js` or `.css` file in the Explorer.  
2. Press <kbd>Ctrl</kbd>+<kbd>I</kbd> in your HTML file, or use <kbd>Alt</kbd>+<kbd>D</kbd> for a single-step import.  
3. The extension automatically creates the appropriate `<script>` or `<link>` tag.

**macOS**  
1. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a `.js` or `.css` file in the Explorer.  
2. Press <kbd>Cmd</kbd>+<kbd>I</kbd> in your HTML file, or use <kbd>Option</kbd>+<kbd>D</kbd> for a single-step import.  
3. The extension automatically creates the appropriate `<script>` or `<link>` tag.

![Import script and stylesheet][html]

[html]: https://res.cloudinary.com/october7/image/upload/v1679982719/github/auto-import-relative-path/html.gif "Import script and stylesheet"

---

## Markdown Support

### Import Image to Markdown

**Windows/Linux**  
1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on an image file (`.png`, `.jpg`, etc.) in the Explorer.  
2. Press <kbd>Ctrl</kbd>+<kbd>I</kbd> or use <kbd>Alt</kbd>+<kbd>D</kbd> in your Markdown file.  
3. The extension inserts the Markdown image syntax automatically.

**macOS**  
1. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on an image file (`.png`, `.jpg`, etc.) in the Explorer.  
2. Press <kbd>Cmd</kbd>+<kbd>I</kbd> or use <kbd>Option</kbd>+<kbd>D</kbd> in your Markdown file.  
3. The extension inserts the Markdown image syntax automatically.

![Markdown image import demo][markdown-image]

[markdown-image]: https://res.cloudinary.com/october7/image/upload/v1679982718/github/auto-import-relative-path/markdown-image.gif "Markdown image import demo"

---

### Import Markdown

**Windows/Linux**  
1. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a `.md` file in the Explorer.  
2. In another Markdown file, press <kbd>Ctrl</kbd>+<kbd>I</kbd> or use <kbd>Alt</kbd>+<kbd>D</kbd>.  
3. The extension automatically inserts the relative link to your Markdown resource.

**macOS**  
1. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> on a `.md` file in the Explorer.  
2. In another Markdown file, press <kbd>Cmd</kbd>+<kbd>I</kbd> or use <kbd>Option</kbd>+<kbd>D</kbd>.  
3. The extension automatically inserts the relative link to your Markdown resource.

![Markdown import demo][markdown]

[markdown]: https://res.cloudinary.com/october7/image/upload/v1679982718/github/auto-import-relative-path/markdown.gif "Markdown import demo"

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

## Support

If you're running into issues or need help using **Auto Import Relative Path**, please check the resources below:

- 🛠 **Troubleshooting**: Review the [SUPPORT.md](https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/SUPPORT.md) for known issues and helpful tips.
- ❓ **Ask a Question**: If your question isn’t answered in the documentation or support page, feel free to [open an issue](https://github.com/ElecTreeFrying/auto-import-relative-path/issues).
- 💬 **Discussions**: You can also participate in GitHub Discussions (if enabled) or reach out via comments on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import#review-details).
- 💡 **Feature Requests**: Use GitHub Issues to suggest improvements or new features.

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

Thank you for using **Auto Import Relative Path**! If you have any suggestions or feedback, don’t hesitate to reach out via [GitHub Issues]. Happy coding!
