# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

Do NOT append a `Co-Authored-By: Claude ...` trailer (or any other Claude/AI attribution) to commit messages. Write commits as if authored solely by the user.

## Project

VS Code extension that generates relative-path import statements for JS/TS/JSX/TSX/CSS/SCSS/HTML/Markdown. Three commands (`extension.copyFilePath`, `extension.pasteImport`, `extension.copyPaste`) are registered in `src/extension.ts`.

## Commands

```bash
npm run compile          # type-check + lint + esbuild bundle (dev) → dist/extension.js
npm run watch            # parallel esbuild watch + tsc --noEmit watch
npm run package          # production bundle (used by vscode:prepublish)
npm run check-types      # tsc --noEmit (no bundling)
npm run compile-tests    # tsc → out/ (separate from esbuild; required before npm test)
npm run watch-tests      # tsc watch for the test build
npm run lint             # eslint src
npm test                 # @vscode/test-cli; pretest runs compile-tests + compile + lint
```

Run a single test by filtering Mocha via `npm test -- --grep "<name>"` (the filter is forwarded to `@vscode/test-cli`). Tests must be compiled first — `out/test/**/*.test.js` is what `.vscode-test.mjs` picks up.

Press **F5** inside VS Code to launch an Extension Development Host with the extension loaded (`.vscode/launch.json`); the default build task (`npm: watch`) runs first.

Publishing flow lives in `process/workflow.md` (gitignored): `vsce publish patch|minor|major` after `npm run vscode:prepublish`.

## Architecture

The source tree is layered by responsibility, with strict directional dependencies:

```
src/
├── extension.ts                # activate/deactivate; registers the 3 commands
├── commands/                   # public command surface (one file per command)
├── editor/                     # VS Code-API touching helpers (clipboard, snippets, notifications)
├── snippets/                   # per-language snippet builders + dispatch
├── path/                       # pure path math (no `vscode` import; Node-testable)
├── config/                     # workspace-config access (getAutoImportSetting)
├── constants/                  # cross-import gating tables
└── types/                      # cross-cutting type unions and enums
```

Allowed dependency direction: `commands → editor, snippets, constants, types`; `snippets → config, path, editor, types, constants`; `editor → config, path, constants, types`; `path → types`. Lower layers never import from higher layers. Internal-only sibling modules in `snippets/` are prefixed with `_` (`_styles.ts`, `_shared.ts`).

### End-to-end flow

The clipboard is the data channel between "copy" and "paste". The flow is:

1. **Copy** (`src/commands/copy-file-path.ts`) — delegates to VS Code's built-in `copyFilePath`, which writes the absolute path of the selected/active file to the system clipboard.
2. **Paste** (`src/commands/paste-import.ts`) — reads the clipboard as the *source* path, takes the active editor's file as the *destination*, gates on supported extension pairs, generates a `vscode.SnippetString` via `generateImportSnippet`, and inserts it.
3. **Auto** (`src/commands/copy-paste.ts`) — sequential `await` of the two above.

`getFilePathInfo()` in `src/editor/file-path-info.ts` is the single source of truth for `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }`. It is called from multiple sites; each call re-reads the clipboard, so don't introduce branches that mutate the clipboard between reads.

`computeRelative(source, destination)` in `src/path/relative.ts` is pure: it returns a Unix-style path with the extension stripped, prefixing `./` for same-directory imports (this prefix behavior is regression-tested — see CHANGELOG `0.6.1`).

### Snippet generation is a single-level dispatch per language

```
generateImportSnippet()                          ← src/snippets/dispatch.ts
  switch (destinationFileExt)
    → src/snippets/{javascript,typescript,jsx,tsx,css,scss,html,markdown}.ts
        each module's snippet() reads file-path info + user setting
        → resolveStyleIndex(<TABLE>, configValue) from src/snippets/_styles.ts
          switch on the matched ImportStyle.value to emit the SnippetString
```

JSX and TSX share their algorithm via `renderReactImport` in `src/snippets/_shared.ts`; the only difference is which script-snippet builder is "primary" (JS for JSX; TS for TSX, with JS as fallback for `.js` sources).

For HTML/SCSS/CSS/Markdown destinations, `determineImportType()` (`src/path/import-type.ts`) classifies the *source* into `script | stylesheet | markdown | image` and the per-language module chooses the snippet builder accordingly.

### Cross-import gating

`paste-import.ts` short-circuits with `NotifyType.NotSupported` when the source/destination pair is invalid. The allowed pairs are encoded as constants in `src/constants/extensions.ts`:

- `HTML_SUPPORTED_EXTENSIONS`, `MARKDOWN_SUPPORTED_EXTENSIONS`, `CSS_SUPPORTED_EXTENSIONS`, `SCSS_SUPPORTED_EXTENSIONS` — what each destination type accepts as a source.
- `CROSS_IMPORT_EXTENSIONS` — destinations that are allowed to import a *different* extension (HTML, MD, CSS, SCSS, JSX, TSX). For other destinations (JS, TS), source and destination extensions must match.
- `IMAGE_FILE_EXTENSIONS` — base set used by the supported-extension lists; reuse instead of inlining new image groups.

When adding a new accepted pair, update the matching constant **and** make sure the relevant per-language module in `snippets/` can produce a snippet for that source extension.

### Insertion placement

`insertImportSnippet()` in `src/editor/insert-snippet.ts`:

- `shouldRepositionCursor()` overrides placement to "Cursor" when the destination is HTML, Markdown, or a stylesheet importing a non-stylesheet source. The user's `importStatementPlacement` setting (Top/Bottom/Cursor) only applies otherwise.
- "Bottom" walks `document.getText().split('\n')` looking for any of `import `, `require(`, `@import`, `@use` markers and inserts after the last match. New import-syntax markers must be added to `importIndicators` for "Bottom" placement to recognize them.
- `determineInsertionColumn()` forces column 0 for script/stylesheet destinations; otherwise inserts at the cursor column.

### Configuration system

`src/config/settings.ts` defines `getAutoImportSetting(namespace, key)` over a frozen `AUTO_IMPORT_CONFIG` map. Adding or renaming a user setting requires changes in **three** places that must stay in sync:

1. `package.json` → `contributes.configuration.properties` (the VS Code-visible setting + its `enum`).
2. `src/snippets/_styles.ts` → an `ImportStyle[]` whose `description` strings match the package.json `enum` strings exactly (lookup is by string equality via `resolveStyleIndex`).
3. The relevant per-language module under `src/snippets/` → a `switch` on the resolved numeric `value` to emit the snippet.

The setting key in `getAutoImportSetting()` is a short alias (e.g. `'javascript'`) that maps to the full configuration name (`auto-import.importStatement.script.javascriptImportStyle`) inside `AUTO_IMPORT_CONFIG`.

### Snippet placeholders

Snippets use VS Code `SnippetString` placeholders (`$1`, `$2`). The TypeScript module has a special case: when the path contains `.component`/`.directive`/`.pipe`/`.service`/`.module` (Angular conventions), `generateImportName()` (local to `src/snippets/typescript.ts`) derives a PascalCase identifier from the filename instead of using the placeholder. Don't break this when refactoring `getTypeScriptImportSnippet()`.

## Build/test layout quirks

- Two independent TS pipelines: **esbuild** (bundles `src/extension.ts` → `dist/extension.js` as CommonJS with `vscode` external; see `esbuild.js`) and **tsc** (`compile-tests` emits `src/**` → `out/` for the test runner). The two outputs are independent.
- `tsconfig.json` has `"strict": false` and `"rootDir": "src"`. New source files belong under `src/`.
- Mocha tests are written in BDD style (`describe`/`it`); the runner UI is set to `bdd` in `.vscode-test.mjs`. Tests use Node's built-in `assert` (Chai/Sinon were dropped in commit `f06101f`).
- `process/` is gitignored — it holds private publishing notes and access tokens. Never commit to it.

## Naming conventions

- Files use noun-only kebab-case: `relative-path.ts`, `file-path-info.ts`. Do not reintroduce suffixes like `.command.ts`, `.util.ts`, `-fn.ts`, `.types.ts`, `.enums.ts`, `.interface.ts` — the parent directory carries the kind signal.
- Modules whose filename starts with `_` (e.g., `snippets/_styles.ts`) are internal to their directory; importing them from outside that directory is a smell.
- The only barrel file is `src/commands/index.ts`. Other directories use direct imports so dependency direction stays visible at the call site.
