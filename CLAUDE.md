# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

Do NOT append a `Co-Authored-By: Claude ...` trailer (or any other Claude/AI attribution) to commit messages. Write commits as if authored solely by the user.

## Project

VS Code extension that generates relative-path import statements for JS/TS/JSX/TSX/CSS/SCSS/HTML/Markdown. Three commands (`extension.copyFilePath`, `extension.pasteImport`, `extension.copyPaste`) are registered in `src/extension.ts`.

## Commands

```bash
npm run compile          # webpack bundle (dev) → dist/extension.js
npm run watch            # webpack watch
npm run package          # production bundle (used by vscode:prepublish)
npm run compile-tests    # tsc → out/ (separate from webpack; required before npm test)
npm run watch-tests      # tsc watch for the test build
npm run lint             # eslint src
npm test                 # @vscode/test-cli; pretest runs compile-tests + compile + lint
```

Run a single test by filtering Mocha via `npm test -- --grep "<name>"` (the filter is forwarded to `@vscode/test-cli`). Tests must be compiled first — `out/test/**/*.test.js` is what `.vscode-test.mjs` picks up.

Press **F5** inside VS Code to launch an Extension Development Host with the extension loaded (`.vscode/launch.json`); the default build task (`npm: watch`) runs first.

Publishing flow lives in `process/workflow.md` (gitignored): `vsce publish patch|minor|major` after `npm run vscode:prepublish`.

## Architecture

### End-to-end flow

The clipboard is the data channel between "copy" and "paste". The flow is:

1. **Copy** (`src/commands/copy-file-path.command.ts`) — delegates to VS Code's built-in `copyFilePath`, which writes the absolute path of the selected/active file to the system clipboard.
2. **Paste** (`src/commands/paste-import.command.ts`) — reads the clipboard as the *source* path, takes the active editor's file as the *destination*, gates on supported extension pairs, generates a `vscode.SnippetString`, and inserts it.
3. **Auto** (`src/commands/copy-paste.command.ts`) — sequential `await` of the two above.

`getFilePathInfo()` in `src/utils/file-path.util.ts` is the single source of truth for `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }`. It is called from multiple sites; each call re-reads the clipboard, so don't introduce branches that mutate the clipboard between reads.

`computeRelativePath()` in `src/utils/relative-path.util.ts` returns a Unix-style path with the extension stripped, prefixing `./` for same-directory imports (this prefix behavior is regression-tested — see CHANGELOG `0.6.1`).

### Snippet generation is a two-level dispatch

```
generateImportStatementSnippet()        ← src/commands/utils/paste-import-command-fn.ts
  switch (destinationFileExt)
    → import-handlers/scripts/{javascript,typescript,jsx,tsx}-import.ts
    → import-handlers/styles/{css,scss}-import.ts
    → import-handlers/markup/{html,markdown}-import.ts
        each handler reads user setting → calls
            importSnippetFunctions.get<Lang>ImportSnippet(path)   ← src/import-handlers/utils/snippets/
              switch on numeric `value` of the matched ImportStyle option
```

JSX/TSX handlers additionally `switch` on the **source** extension (images, fonts, JSON, YAML, stylesheets) — this is why `.jsx`/`.tsx` accept the widest set of source types in the README's "Examples by Active Editor" table.

For HTML/SCSS/CSS/Markdown destinations, `determineImportType()` (`src/import-handlers/utils/import-type.util.ts`) classifies the *source* into `script | stylesheet | markdown | image` and the handler chooses the snippet builder accordingly.

### Cross-import gating

`paste-import.command.ts` short-circuits with `NotifyType.NotSupported` when the source/destination pair is invalid. The allowed pairs are encoded as constants in `src/constants/file-extension-constants.ts`:

- `HTML_SUPPORTED_EXTENSIONS`, `MARKDOWN_SUPPORTED_EXTENSIONS`, `CSS_SUPPORTED_EXTENSIONS`, `SCSS_SUPPORTED_EXTENSIONS` — what each destination type accepts as a source.
- `CROSS_IMPORT_EXTENSIONS` — destinations that are allowed to import a *different* extension (HTML, MD, CSS, SCSS, JSX, TSX). For other destinations (JS, TS), source and destination extensions must match.

When adding a new accepted pair, update the matching constant **and** make sure the relevant import handler can produce a snippet for that source extension.

### Insertion placement

`insertImportSnippet()` in `src/commands/utils/import-position.util.ts`:

- `shouldRepositionCursor()` overrides placement to "Cursor" when the destination is HTML, Markdown, or a stylesheet importing a non-stylesheet source. The user's `importStatementPlacement` setting (Top/Bottom/Cursor) only applies otherwise.
- "Bottom" walks `document.getText().split('\n')` looking for any of `import `, `require(`, `@import`, `@use` markers and inserts after the last match. New import-syntax markers must be added to `importIndicators` for "Bottom" placement to recognize them.
- `determineInsertionColumn()` forces column 0 for script/stylesheet destinations; otherwise inserts at the cursor column.

### Configuration system

`src/utils/configurations.ts` defines `getAutoImportSetting(namespace, key)` over a frozen `AUTO_IMPORT_CONFIG` map. Adding or renaming a user setting requires changes in **three** places that must stay in sync:

1. `package.json` → `contributes.configuration.properties` (the VS Code-visible setting + its `enum`).
2. `src/constants/import-style-options.ts` → an `ImportStyle[]` whose `description` strings match the package.json `enum` strings exactly (lookup is by string equality).
3. `src/import-handlers/utils/snippets/*` → a `switch` on the resolved numeric `value` to emit the snippet.

The setting key in `getAutoImportSetting()` is a short alias (e.g. `'javascript'`) that maps to the full configuration name (`auto-import.importStatement.script.javascriptImportStyle`) inside `AUTO_IMPORT_CONFIG`.

### Snippet placeholders

Snippets use VS Code `SnippetString` placeholders (`$1`, `$2`). The TypeScript handler has a special case: when the path contains `.component`/`.directive`/`.pipe`/`.service`/`.module` (Angular conventions), `generateImportName()` derives a PascalCase identifier from the filename instead of using the placeholder. Don't break this when refactoring `getTypeScriptImportSnippet()`.

## Build/test layout quirks

- Two parallel TS pipelines: webpack (`ts-loader`, bundles `src/extension.ts` → `dist/extension.js` as commonjs2 with `vscode` external) and `tsc` (compiles `src/**` to `out/` for tests). The two outputs are independent.
- `tsconfig.json` has `"strict": false` and `"rootDir": "src"`. New source files belong under `src/`.
- Mocha tests are written in BDD style (`describe`/`it`) using Chai + Sinon; the placeholder `src/test/extension.test.ts` is TDD-style (`suite`/`test`) and is the only one using that style — match the BDD style in new tests under `src/test/{commands,utils,import-handlers}/`.
- `process/` is gitignored — it holds private publishing notes and access tokens. Never commit to it.
