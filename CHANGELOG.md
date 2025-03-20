# Changelog

## [0.5.5] - 2025-03-28

### Changed
- **Repository Revamp:** Completely overhauled the entire repository to follow the latest best practices.
- **Code & Logic:** Updated all file logic, folder structures, directory names, and file names using advanced AI-driven optimizations to ensure the most efficient and maintainable code.
- **Comments & Documentation:** Refined all comments and comment blocks for improved clarity and consistency.
- **Package Configuration:** Enhanced **package.json** by updating configuration titles, descriptions, keywords, and categories for better discoverability and adherence to VS Code extension standards.
- **Documentation Overhaul:** Revamped **README.md**, **DEMO.md**, and **CHANGELOG.md** to align with the latest VS Code extension format and best practices.

## [0.5.4] - 2023-03-28

### Changed
- Updated **README.md** and **DEMO.md**.

## [0.5.3] - 2023-03-28

### Added
- "Snippet" added to the categories list.

### Changed
- Minor code improvements.

## [0.5.2] - 2023-03-28

### Added
- Enhanced support for Angular files.

## [0.5.1] - 2023-03-28

### Removed
- Notification preference.

## [0.5.0] - 2023-03-28

### Added
- Import statements are now inserted as snippets directly into active text editors.
- More supported file extensions for **.jsx** and **.tsx**.

### Changed
- Updated to the latest VS Code engine.
- Removed all third-party dependencies.

### Fixed
- Fixed [#6](https://github.com/ElecTreeFrying/auto-import-relative-path/issues/6) and [#7](https://github.com/ElecTreeFrying/auto-import-relative-path/issues/7).
- Updated **README.md** and **DEMO.md**.

## [0.4.8] - 2022-08-19

### Changed
- Updated **README.md**.

## [0.4.3] - [0.4.7] - 2022-08-18

### Changed
- Updated **README.md**.

## [0.4.2] - 2021-06-21

### Fixed
- Resolved issues where the extension was not working properly in other VS Code versions.

### Todo
- Fix issue on new engine compatibility.

## [0.4.0] - [0.4.1] - 2021-06-19

### Changed
- Updated **package.json**.
- Modified **README.md**.

## [0.3.12] - 2020-07-25

### Added
- Bitcoin mining and donation section in **README.md**.

## [0.3.10] - [0.3.11] - 2020-07-24

### Changed
- Updated **README.md** and **DEMO.md**.

## [0.3.7] - [0.3.9] - 2020-07-18

### Changed
- Renamed commands.
- Updated **README.md** and **DEMO.md**.

#### Command Renaming
| Old Command Name                  | New Command Name      |
| `Auto Import: Paste`              | `Auto Import: Paste`  |
| `Auto Import: Auto relative path` | `Auto Import: Auto`   |

## [0.3.6] - 2020-04-23

### Fixed
- Demo links.

## [0.3.2] - [0.3.5] - 2020-04-23

### Fixed
- Updated expired publisher token.

## [0.3.1] - 2020-04-23

### Added
- More examples in the demo.

### Changed
- Updated **README.md** and **DEMO.md**.

## [0.3.0] - 2020-04-04

### Added
- New command: `Auto Import: Import relative path` for auto copy & paste of the relative import.

### Changed
- Updated **README.md**.
- Refined extension keywords.
- Removed unused activation events.
- Updated setting configurations.

### Fixed
- Corrected typos in **README.md** and variable names.

## [0.2.6] - 2020-03-23

### Fixed
- Typo in the demo.

## [0.2.5] - 2020-03-23

### Changed
- Updated feature links in the demo.

## [0.2.3] - [0.2.4] - 2020-03-23

### Fixed
- Corrected typos in **README.md**.

## [0.2.2] - 2020-03-23

### Added
- HTML import support for scripts and stylesheets.
- Added GIF files for HTML support.

## [0.2.1] - 2020-03-22

### Fixed
- Resolved demo link issues.

## [0.2.0] - 2020-03-22

### Added
- Support for Markdown image import and relative Markdown import.
- New demo for Markdown support.
- Added GIF files for Markdown support.

### Changed
- Updated **.gitignore**.

## [0.1.14] - 2020-03-21

### Changed
- Updated **README.md**.

## [0.1.13] - 2020-03-20

### Changed
- Updated **README.md**.

## [0.1.12] - 2020-03-20

### Changed
- Updated **README.md**.

## [0.1.11] - [0.1.10] - 2020-03-19

### Fixed
- Corrected internal linking issues in **README.md**.

## [0.1.9] - 2020-03-19

### Fixed
- Updated settings preview.

## [0.1.8] - 2020-03-19

### Changed
- Updated settings preview GIF file.

## [0.1.7] - 2020-03-19

### Added
- Features and demo section in **README.md**.

### Changed
- Removed newline (`\n`) in the "import to cursor" functionality.

## [0.1.6] - 2020-03-16

### Changed
- Modified extension description in **package.json**.
- Removed unused command `closeAllNotif`.
- Updated **README.md**.
- Changed display name and repository name.
- Added author information in **package.json**.

#### Todo
- Rename extension.

## [0.1.5] - 2020-03-16

### Changed
- Renamed extension display name from *Auto Import* to *Auto Import Relative Path*.

#### Todo
- Rename package from *Auto Import* to *Auto Import Relative Path*.
  - See:
    1. [How to rename my theme extension](https://github.com/Microsoft/vscode/issues/25988)
    2. [Possible to change package name?](https://github.com/Binaryify/OneDark-Pro/issues/54)

## [0.1.4] - 2020-03-16

### Changed
- Preparations for renaming the extension.

## [0.1.3] - 2020-03-16

### Fixed
- Corrected "copy relative on-focus" behavior in the text editor.

## [0.1.2] - 2020-03-15

### Changed
- Updated configuration name.

## [0.1.1] - 2020-03-15

### Fixed
- Corrected table formatting in **README.md**.
- Fixed issue with settings GIF not showing.

### Changed
- Changed icon from square to circle.

## [0.1.0] - 2020-03-15

### Added
- `Auto Import: Copy path` command.
- Notification for the `Auto Import: Copy path` command.

### Changed
- Removed unnecessary notification pop-ups.
- Renamed `Auto Import` command to `Auto Import: Paste relative`.
- Updated demo GIF in **Usage**.
- Added settings preview GIF.
- Added badges to **README.md**.

## [0.0.6] - 2020-03-15

### Fixed
- Resolved `TypeError: camelcase_1.default is not a function`.

## [0.0.5] - 2020-03-15

### Added
- Pasting import directly on the selected line at the top or bottom of the import list.

## [0.0.4] - 2020-03-14

### Fixed
- Corrected version inconsistencies.

## [0.0.3] - 2020-03-14

### Changed
- Updated **README.md**.
- Revised export name description.

## [0.0.2] - 2020-03-13

### Added
- "Homepage" field added in **package.json**.

## [0.0.1] - 2020-03-13

- Published extension on the marketplace.
