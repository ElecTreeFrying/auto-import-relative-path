# Changelog

## [0.7.0] - 2026-05-09

### Changed
- **Toolchain modernization:** Bumped `engines.vscode` to `^1.118.0`, refreshed scaffold configs (`eslint.config.mjs`, `.vscode/tasks.json`, `.vscode/extensions.json`, `.vscodeignore`, `esbuild.js`) to match the latest `yo code` conventions, and updated `devDependencies`.
- **Bundler migration:** Replaced webpack with esbuild (`esbuild.js` replaces `webpack.config.js`). Production bundle is now ~14 KB (`dist/extension.js`).
- **Build pipeline:** Adopted the modern scaffold's `compile`/`watch`/`package` scripts — `compile` now runs `check-types && lint && esbuild` in series; `watch` runs parallel `watch:tsc` + `watch:esbuild` via `npm-run-all`.
- **`@types/node` pinning:** Switched from wildcard `22.x` to explicit `^22.19.18` to match the rest of the deps' caret-+-full-version style.
- **`tsconfig.json`:** Added defensive `compilerOptions.types: ["node", "mocha"]` to make `@types/node` and `@types/mocha` ambient inclusion explicit (prevents intermittent VS Code TS Server phantom `TS2591` errors after a `node_modules` rebuild). Added explicit `"include": ["src/**/*"]` to scope the program and stop tsc from picking up gitignored backup directories.
- **`src/` reorganized into seven layered directories.** Replaces the old `commands/`, `commands/utils/`, `constants/`, `import-handlers/{scripts,styles,markup,utils,utils/snippets}/`, `model/`, and `utils/` tree with `commands/`, `editor/` (VS Code-API touching), `path/` (pure, Node-testable), `config/`, `snippets/` (per-language modules + dispatch), `types/`, and `constants/`. Three parallel "utils" directories are gone; only one barrel file (`commands/index.ts`) remains.
- **Snippet dispatch collapsed from two levels to one.** The old `import-handlers/<lang>-import.ts` → `import-handlers/utils/snippets/<bundle>-snippets.ts` chain is replaced by a single per-language module under `snippets/` (`javascript.ts`, `typescript.ts`, `jsx.ts`, `tsx.ts`, `css.ts`, `scss.ts`, `html.ts`, `markdown.ts`) called directly from `snippets/dispatch.ts`. The merged `importSnippetFunctions` map is gone.
- **JSX/TSX deduplicated.** The previously near-identical handlers now share `snippets/_shared.ts:renderReactImport`, parameterised over primary/optional-fallback script-snippet builders.
- **`NotifyType` is now a string-literal union (`'same-file-path' | 'not-supported'`).** Replaces the previous numeric `enum`. Aligns with modern TypeScript idioms (literal unions over enums) and keeps the type fully erasable for tooling that runs TS without compilation.
- **File naming convention:** strict noun-only kebab-case throughout `src/`. Drops the previous mix of `.command.ts`, `.util.ts`, `-fn.ts`, `-import.ts`, `-import-snippets.ts`, `-constants.ts`, `.types.ts`, `.enums.ts`, `.interface.ts` suffixes — the parent directory now provides the kind signal.
- **`commands/paste-import.ts` cross-import gating** unchanged in behavior, but the eight-clause conjunction is now documented inline and cross-references the gating tables in `constants/extensions.ts`.
- **Mocha test UI** switched to BDD (`.vscode-test.mjs:mocha.ui = 'bdd'`); the surviving placeholder test was rewritten as a real activation smoke test that asserts the three command IDs are registered.

### Added
- **`typescript-eslint`** unified package (replaces the separate `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`).
- **`npm-run-all`** to power the parallel `watch:*` scripts.
- **Comprehensive TSDoc coverage** on every module, function, exported constant, interface property, and string-literal-union member across `src/`. Style is tight, dense, and IntelliSense-friendly: per-property and per-literal `/** */` comments surface in hover tooltips; module headers describe cross-file invariants and sync sites; function docs include `@param`/`@returns` with brief descriptions.
- **`commands/index.ts`** is now the single barrel re-export consumed by `extension.ts`; all other directories use direct imports so dependency direction is visible at the call site.
- **`snippets/_styles.ts:resolveStyleIndex`** helper replaces the eleven exact copies of `table.find(o => o.description === configValue)?.value` previously inlined into each snippet builder.
- **`constants/extensions.ts:IMAGE_FILE_EXTENSIONS`** is now publicly exported (was file-private). JSX/TSX-related code in `snippets/_shared.ts` no longer duplicates the literal extension list.
- **Activation smoke test** at `src/test/extension.test.ts` asserting the three contributed commands are registered.

### Removed
- `webpack`, `webpack-cli`, `ts-loader` — no longer needed after the esbuild migration.
- `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` — superseded by the unified `typescript-eslint` package.
- `mocha` (direct devDep) — now pulled transitively via `@vscode/test-cli`.
- `vscode-test` — legacy duplicate of `@vscode/test-cli`.
- **Dead code:** `getScssImageImportSnippet` (exported but never called — SCSS image branch already routed to the identical `getCssImageImportSnippet`), `insertRelativePathSnippet` (exported, never called), and the untracked `utils/remove-file-extension.util.ts` (unused, redundant with the inline copy now consolidated in `path/extension.ts`).
- **Five no-op `getAutoImportSetting` lookups** in `getCssImageImportSnippet`, `getHtmlScriptImportSnippet`, `getHtmlImageImportSnippet`, `getHtmlStylesheetImportSnippet`, and `getMarkdownImportSnippet` — each retrieved a value and discarded it before returning a hardcoded snippet shape.
- **Three "merged-namespace" barrel files** (`utils/index.ts`, `commands/utils/index.ts`, `import-handlers/utils/index.ts`) that re-exported each other and obscured where each utility actually lived.

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
