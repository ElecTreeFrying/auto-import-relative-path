# Changelog

## [0.7.0] - 2026-05-11

### Added
- **Specific, actionable error toasts.** Two generic warnings (`"Same file path"`, `"Not supported"`) are now **five distinct messages** that tell you what to do next instead of leaving you to guess:
  - *"A file cannot import itself."* — source equals destination.
  - *"This file type can't be imported into the current file."* — source/destination pair rejected by gating.
  - *"Open a file to paste an import."* — paste invoked without an active editor.
  - *"No file selected to copy."* — copy invoked without a focused file.
  - *"Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first."* — paste invoked before any path was copied.
- **Pick the import shape on the fly with two new commands.** The command surface grows from 3 to 5; the new entries focus on style choice without round-tripping through Settings:
  - **`Auto Import: Paste as Import (Pick Style)`** (`extension.pasteImportWithStyle`) — opens a QuickPick of every applicable import shape for the current source → destination pair and inserts the one you choose. Reachable from the Command Palette and from the new **"Paste with Style"** button on the *Copied path — &lt;basename&gt;* toast (so the picker is one click away from copy). Single-shape destinations (HTML, Markdown text, CSS image, SCSS image, JSX/TSX non-script source) skip the picker and insert directly — no UI noise where there is only one valid shape.
  - **`Auto Import: Set Default Import Style`** (`extension.setDefaultImportStyle`) — same picker, but persists your choice to **User (Global) settings** instead of inserting a snippet. The currently-selected default is hoisted to the top of the list and tagged with a `$(check) Current default` icon, so you always know which shape is active before you change it.
- **Three new toast actions.** Existing toasts gain actionable buttons so common follow-ups are one click away:
  - **"Paste with Style"** on the *Copied path — &lt;basename&gt;* toast → invokes `Auto Import: Paste as Import (Pick Style)`.
  - **"Paste Now"** on the same toast → invokes `Auto Import: Paste as Import` for users who would rather click than reach for the keybinding.
  - **"View Supported Files"** on the *can't be imported* toast → opens the README's supported source/destination pairs section on GitHub.
- **Two new style-flow toasts.** The `NotificationType` union grows from 7 to 9 to cover the Set Default Import Style flow:
  - *"Auto Import: No configurable style for `<sourceExt>` → `<destinationExt>` files."* — raised when the destination has only a single hardcoded shape (HTML, Markdown text, CSS image, SCSS image, JSX/TSX non-script source) and there is nothing for the user to pick.
  - *"Auto Import: Default style saved — `<style>`."* — info toast confirming the new default landed in User settings.
- **Picker labels render as basename.** QuickPick rows now show a tight basename identifier (`widget`, `utils`) instead of the full relative path — easier to scan when picking among 5+ shapes. The inserted snippet is unchanged and still uses the full relative path (e.g., `import { Widget } from '../../components/widget'`).
- **`setAutoImportSetting(namespace, key, value, target?)` writer** in `src/config/settings.ts` — symmetric counterpart to the existing `getAutoImportSetting` reader, used by `Auto Import: Set Default Import Style` to persist the chosen shape. Defaults to `vscode.ConfigurationTarget.Global` (User scope) since every extension setting is global by design.
- **Style metadata on `ImportSnippetVariant`.** Variants derived from a `*_IMPORT_OPTIONS` table now carry a `setting: { namespace, key, value }` reference (byte-exact against `package.json:enum`) so the Set-Default picker can persist the user's choice without re-deriving the destination → settings-table mapping at write time.
- **Five-command registration test** in `src/test/extension.test.ts` — iterates `vscode.commands.getCommands(true)` and asserts all five commands are registered, guarding against accidental registration drift after refactors.
- **Pre-built manual-QA fixture workspace** at `src/test/manual-qa-workspace/` — ~158 source/destination fixture files covering every supported pair, gating-rejection cases, Angular suffix conventions, and edge cases (whitespace/Unicode/deep paths). Opened in the Extension Development Host during manual-QA walks; intentionally excluded from the Mocha runner so it remains a static paste-source/destination fixture rather than an automated suite.
- **`typescript-eslint`** unified package (replaces the separate `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`).
- **`npm-run-all`** to power the parallel `watch:*` scripts.

### Changed
- **Self-describing command palette titles.** Each command now says what it does at a glance:
  - `Auto Import: Paste` → **`Auto Import: Paste as Import`**
  - `Auto Import: Copy` → **`Auto Import: Copy File Path`**
  - `Auto Import: Auto` → **`Auto Import: Insert Import from Selected File`**
- **Settings panel rewritten end-to-end.** Every setting under *Auto Import Relative Path* now has a precise top-level description **plus per-choice `enumDescriptions`** — pick the right import shape without leaving the Settings UI. Notables: the TypeScript named-import shape documents the Angular auto-fill behavior (`.component`, `.directive`, `.pipe`, `.service`, `.module` files get a PascalCase identifier auto-derived from the basename), and SCSS `@use` options are labelled *"modern (recommended)"* vs *"legacy"* so newcomers know which one to pick.
- **TypeScript "aliased default" shape simplified.** `import { $1 as $2 } from '…'` → **`import { default as $1 } from '…'`**. One tab stop instead of two, and the snippet now reflects the actual ES-module semantics for aliasing the default export.
- **Markdown link default is now a link.** `markdownImportStyle` defaults to **`[text](_relativePath_)`** (was `![text](…)` — image syntax). Image embeds remain available via the dedicated `markdownImageImportStyle` setting where they belong.
- **Copy toast wording.** `Copied <basename>` → **`Copied path — <basename>`** so it's clear the *path* was copied, not the file.
- **Marketplace description and keywords overhauled.** New one-line value prop calls out the supported targets explicitly (JS, TS, JSX, TSX, CSS, SCSS, HTML, Markdown), Angular-aware naming, SCSS partial support, and 20+ configurable styles. Keywords expanded to cover JSX/TSX, SCSS/Sass, ESM, CommonJS, React, Angular, snippet, and productivity.
- **Documentation overhauled.** `README.md`, `DEMO.md`, and `SUPPORT.md` rewritten end-to-end — README has a quick-start path, DEMO is a structured *Demo Gallery* organized by workflow → placement mode → per-language output, and SUPPORT walks the full triage path.
- **Toolchain modernization.** Bumped `engines.vscode` to `^1.118.0`, refreshed scaffold configs (`eslint.config.mjs`, `.vscode/tasks.json`, `.vscode/extensions.json`, `.vscodeignore`, `esbuild.js`) to match the latest `yo code` conventions, and updated `devDependencies`.
- **Bundler migration.** Replaced webpack with esbuild (`esbuild.js` replaces `webpack.config.js`). Production bundle is now **~11 KB** — down from ~14 KB earlier in this release cycle, a roughly 20% reduction in shipped JS that translates to a slightly faster cold activation.
- **Built for AI-assisted maintenance.** The source tree is layered into seven single-responsibility directories with comprehensive TSDoc on every module, function, type, interface property, constant, and union member — every intent and invariant is documented inline and surfaces in IntelliSense. Future updates, issue triage, and contributor onboarding are first-class AI workflows: an LLM (or a human) can read any file in isolation and understand its role, its consumers, and the invariants it must preserve.
- **`AUTO_IMPORT_CONFIG` internal restructure.** The internal config map went from `{ namespace: { settingKey: propertyName } }` to `{ namespace: { namespace, settings: { settingKey: propertyName } } }` so the namespace string can live alongside the alias map without colliding. Both `script` and `stylesheet` namespaces now expose the same alias `'preserve'` — the namespace disambiguates which `preserve*FileExtension` setting it resolves to. **No `package.json` setting names changed** — public configuration paths (`auto-import.importStatement.script.*`, `auto-import.importStatement.styleSheet.*`) remain identical, so existing user settings carry over without migration.
- **Build pipeline.** Adopted the modern scaffold's `compile`/`watch`/`package` scripts — `compile` now runs `check-types && lint && esbuild` in series; `watch` runs parallel `watch:tsc` + `watch:esbuild` via `npm-run-all`.
- **`@types/node` pinning.** Switched from wildcard `22.x` to explicit `^22.19.18` to match the rest of the deps' caret-+-full-version style.
- **`tsconfig.json`.** Added defensive `compilerOptions.types: ["node", "mocha"]` to make `@types/node` and `@types/mocha` ambient inclusion explicit (prevents intermittent VS Code TS Server phantom `TS2591` errors after a `node_modules` rebuild).

### Fixed
- **Angular auto-naming with `preserveScriptFileExtension: true`.** `app-root.component.ts` with the preservation flag on previously produced `{ AppRootComponentTs }` because the `.ts` was folded into the PascalCase conversion. The script extension is now stripped before naming, so the identifier is always `{ AppRootComponent }` regardless of the preservation setting.

### Removed
- `vsc-extension-quickstart.md` — `yo code` scaffold artifact, not relevant to users of the published extension.
- `webpack`, `webpack-cli`, `ts-loader` — no longer needed after the esbuild migration.
- `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` — superseded by the unified `typescript-eslint` package.
- `mocha` (direct devDep) — now pulled transitively via `@vscode/test-cli`.
- `vscode-test` — legacy duplicate of `@vscode/test-cli`.

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
