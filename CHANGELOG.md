# Changelog

## [1.0.0] - 2026-05-25

### Breaking Changes
- **Minimum VS Code version raised to `^1.118.0`.** Older VS Code installations will no longer load the extension.
- **TypeScript import styles reshuffled.** The "aliased default" shape (`import { $1 as $2 } from '…'`) has been removed. Three new shapes added: type-only import, mixed value + type import (TS 4.5+), and dynamic `await import()`. Net change: 5 → 7 entries — **style indices have shifted**; users with a non-default `typescriptImportStyle` should re-select their preferred shape in Settings.
- **JavaScript import styles reshuffled.** Four legacy shapes removed: `import { default as name }`, `var = require()`, `var = import()`, `const = import()`. Two new shapes added: mixed default + named import, and `const = await import()`. Net change: 9 → 7 entries — **style indices have shifted**; users with a non-default `javascriptImportStyle` should re-select.
- **SCSS default flipped from `@import` to `@use`.** The `@import url(…)` shape has been dropped entirely. Two new shapes added: `@use '…' as *` and `@forward '…'`. Users who relied on `@import` as the default should update their `scssImportStyle` setting.
- **HTML script default flipped to modern minimal.** `<script type="text/javascript" src="…"></script>` → `<script src="…"></script>`. Three new shapes added: `defer`, `type="module"`, and `async`. Users who need the legacy `type` attribute should select it explicitly.
- **Markdown image default reordered.** Two new shapes added (bare inline, HTML `<img>` embed) and the default position rotated. Users with a non-default `markdownImageImportStyle` should verify their selection.
- **Markdown link default changed from image syntax to link syntax.** `markdownImportStyle` now defaults to `[text](path)` instead of `![text](path)`. Image embeds belong under the dedicated `markdownImageImportStyle` setting.

### Added
- **Four new destination languages.** Vue (`.vue`), Svelte (`.svelte`), Astro (`.astro`), and MDX (`.mdx`) are now supported as import destinations — bringing the total to 12 destination file types.
- **Media and document source types.** Video (`.mp4`, `.webm`, `.mov`), audio (`.mp3`, `.ogg`, `.wav`, `.m4a`), text-track (`.vtt`), and additional asset types (`.svg`, `.avif`, `.pdf`) can now be imported into JSX, TSX, MDX, and HTML destinations — bringing the total to 35 supported file extensions across 15 categories.
- **Two new commands.**
  - **Auto Import: Paste as Import (Pick Style)** — opens a QuickPick listing every applicable import shape for the current source/destination pair. Reachable from the Command Palette and from the "Paste with Style" button on the copy-success toast. Single-shape destinations insert directly without showing the picker.
  - **Auto Import: Set Default Import Style** — same picker, but persists the chosen shape to User (Global) settings instead of inserting a snippet. The current default is marked with a checkmark icon and appears first in the list.
- **Smart placement for component files.** Astro imports land inside `---` frontmatter fences. Vue and Svelte imports land inside `<script>` blocks (prefers `<script setup>` in Vue). CSS/SCSS `url()` values insert inline at the exact cursor position. All modes respect the Top/Bottom/Cursor placement setting. Indentation automatically matches the surrounding block.
- **Actionable error and confirmation toasts.** Two generic warnings ("Same file path", "Not supported") replaced by five specific messages: *"A file cannot import itself"*, *"This file type can't be imported into the current file"*, *"Open a file to paste an import"*, *"No file selected to copy"*, and *"Clipboard does not contain a file path"*. Three toast action buttons added: "Paste with Style", "Paste Now", and "View Supported Files". Two new confirmation toasts for the Set Default flow: *"No configurable style"* warning and *"Default style saved"* confirmation. Plus a *"No file extension"* warning when copying extensionless files.
- **Class-name detection for TypeScript.** The named-import shape (`import { Name } from '…'`) now auto-fills the identifier from the source file's `export class Name` declaration when available. Falls back to Angular-convention PascalCase derivation (`.component`, `.directive`, `.pipe`, `.service`, `.module` suffixes), then to a `$1` tab-stop placeholder.
- **New import styles per language.** TypeScript: `import type { }`, mixed value + type, dynamic `await import()`. JavaScript: mixed default + named, `await import()`. SCSS: `@use '…' as *`, `@forward '…'`. HTML script: `defer`, `type="module"`, `async`. HTML image: lazy-loading with `loading="lazy"`, CLS-safe dimensions with `width`/`height` attributes.
- **Comprehensive test coverage.** 15+ automated test suites covering path math, import-type classification, extension gating tables, style-table integrity, class-name detection, and per-language snippet builders for every supported destination (JavaScript, TypeScript, CSS, SCSS, HTML, Markdown, JSX, TSX, framework components). Five-command registration guard test. Integration demo workspace with fixture files for every supported pair.
- **Toolchain modernization.** Webpack replaced by esbuild (~11 KB production bundle). Unified `typescript-eslint` package replaces the separate parser and plugin. `npm-run-all` powers parallel `watch:tsc` + `watch:esbuild` scripts. Build pipeline: `compile` runs `check-types && lint && esbuild`; `watch` runs both watchers concurrently.

### Changed
- **Command palette titles renamed for clarity.** `Auto Import: Paste` → *Paste as Import*. `Auto Import: Copy` → *Copy File Path*. `Auto Import: Auto` → *Insert Import from Selected File*.
- **Copy toast wording.** `Copied <basename>` → `Copied path — <basename>` to clarify that the *path* was copied, not the file contents.
- **TypeScript aliased-default simplified.** `import { $1 as $2 } from '…'` → `import { default as $1 } from '…'` — one tab stop instead of two, and the snippet now reflects correct ES-module semantics.
- **Settings panel rewritten.** Every setting has a precise top-level description plus per-choice `enumDescriptions`. TypeScript documents the Angular auto-fill behavior; SCSS labels `@use` as "modern (recommended)" and `@import` as "legacy".
- **Marketplace metadata overhauled.** Description, keywords, and categories updated for the full 12-destination, 35-extension, 5-command scope.
- **Source layout restructured.** Seven single-responsibility directories (`commands/`, `editor/`, `snippets/`, `path/`, `config/`, `constants/`, `types/`) with strict layered dependency direction.
- **Documentation rewritten.** README.md restructured for quick-start onboarding with framework badges and inline demo; SUPPORT.md rewritten for the expanded command and language surface.

### Fixed
- **Angular auto-naming with `preserveScriptFileExtension: true`.** `app-root.component.ts` no longer produces `{ AppRootComponentTs }` — the script extension is stripped before PascalCase derivation.
- **CSS Modules in JSX/TSX/MDX.** `.module.css` and `.module.scss` sources now emit `import styles from '…'` (default import) instead of a named import.
- **Markdown-to-Markdown links.** `.md → .md` imports now use link syntax `[text](path)` instead of image syntax.
- **SCSS `@use … as` shape.** Now correctly emits `@use '…' as ${1:*};`.
- **JS/TS default-as shape.** Now correctly emits `import { default as $1 } from '…'`.
- **JSX/TSX non-script placeholders.** Asset imports use descriptive `${1:name}` instead of bare `$1`.
- **Markdown image hover-text.** The title string now includes a tab-stop placeholder.
- **Bottom placement indicator scan.** Comment lines are skipped when scanning for the last import statement.
- **Inline `url()` insertion.** Inserts at the exact cursor position (line and column) with no trailing newline.
- **Placement default fallback.** Now aligns with the `package.json` default value instead of silently falling to a different position.

### Removed
- `vsc-extension-quickstart.md` — scaffold artifact, not relevant to published extension users.
- `webpack`, `webpack-cli`, `ts-loader` — replaced by esbuild.
- `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` — replaced by unified `typescript-eslint`.
- `mocha` (direct devDep) — now pulled transitively via `@vscode/test-cli`.
- `vscode-test` — legacy duplicate of `@vscode/test-cli`.
- Six legacy import shapes removed from style pickers: 4 JavaScript shapes (`{ default as name }`, `var = require()`, `var = import()`, `const = import()`), 1 TypeScript shape (`{ $1 as $2 }`), and 1 SCSS shape (`@import url(…)`).
- `DEMO.md` — demo content consolidated into the README.

## [0.6.1] - 2025-03-28

### Fixed
- **Relative Path Bug:** Prepend './' to relative paths for same-directory imports. This critical bug fix ensures that module imports are correctly resolved when files reside in the same directory.

## [0.6.0] - 2025-03-28

### Changed
- **Repository Revamp:** Completely overhauled the entire repository to follow the latest best practices.
- **Code & Logic:** Updated all file logic, folder structures, directory names, and file names using advanced AI-driven optimizations to ensure the most efficient and maintainable code.
- **Comments & Documentation:** Refined all comments and comment blocks for improved clarity and consistency.
- **Package Configuration:** Enhanced **package.json** by updating configuration titles, descriptions, keywords, and categories for better discoverability and adherence to VS Code extension standards.
- **Documentation Overhaul:** Revamped **README.md**, **DEMO.md**, and **CHANGELOG.md** to align with the latest VS Code extension format and best practices.

### Added
- `SUPPORT.md` to guide users on getting help, reporting issues, running tests, and contributing to the extension.

### To-Do
- Improve unit tests for better coverage and maintainability.

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
