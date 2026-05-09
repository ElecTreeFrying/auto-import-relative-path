# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

Do NOT append a `Co-Authored-By: Claude ...` trailer (or any other Claude/AI attribution) to commit messages. Write commits as if authored solely by the user.

## Project

VS Code extension that generates relative-path import statements for JS/TS/JSX/TSX/CSS/SCSS/HTML/Markdown. Three commands (`extension.copyFilePath`, `extension.pasteImport`, `extension.copyPaste`) are registered in `src/extension.ts` and bound to keybindings in `package.json` (`cmd/ctrl+shift+a`, `cmd/ctrl+i`, and `alt+d` in the explorer respectively).

## Subdirectory guides

Each directory under `src/` has its own pair of nested guides. Read the directory's `CLAUDE.md` first when editing files inside it; read its `README.md` when navigating or onboarding.

| Directory | Scope | Guides |
|-----------|-------|--------|
| `src/` | Source-tree overview, dependency layering, naming conventions | [`src/README.md`](src/README.md), [`src/CLAUDE.md`](src/CLAUDE.md) |
| `src/commands/` | The three commands; clipboard data channel, parallel fetch, eight-clause gating | [`src/commands/README.md`](src/commands/README.md), [`src/commands/CLAUDE.md`](src/commands/CLAUDE.md) |
| `src/editor/` | VS Code-API helpers (clipboard, snippet insertion, notifications) | [`src/editor/README.md`](src/editor/README.md), [`src/editor/CLAUDE.md`](src/editor/CLAUDE.md) |
| `src/snippets/` | Per-language snippet builders + dispatch; style sync rules; JSX/TSX shared algorithm | [`src/snippets/README.md`](src/snippets/README.md), [`src/snippets/CLAUDE.md`](src/snippets/CLAUDE.md) |
| `src/path/` | Pure path math (no `vscode` import); `./` prefix rule | [`src/path/README.md`](src/path/README.md), [`src/path/CLAUDE.md`](src/path/CLAUDE.md) |
| `src/config/` | Workspace-config access; three-site sync rule | [`src/config/README.md`](src/config/README.md), [`src/config/CLAUDE.md`](src/config/CLAUDE.md) |
| `src/constants/` | Runtime gating tables; runtime mirror of `types/file-extension.ts` | [`src/constants/README.md`](src/constants/README.md), [`src/constants/CLAUDE.md`](src/constants/CLAUDE.md) |
| `src/types/` | Cross-cutting type unions (no enums) | [`src/types/README.md`](src/types/README.md), [`src/types/CLAUDE.md`](src/types/CLAUDE.md) |
| `src/test/` | Mocha BDD tests; runs from `out/`, not `dist/` | [`src/test/README.md`](src/test/README.md), [`src/test/CLAUDE.md`](src/test/CLAUDE.md) |

The detailed subsections that follow ("End-to-end flow", "Snippet generation", "Cross-import gating", etc.) remain a unified high-level reference for the architecture; the nested guides go deeper on directory-specific invariants.

## Commands

```bash
npm run compile          # type-check + lint + esbuild bundle (dev) → dist/extension.js
npm run watch            # parallel esbuild watch + tsc --noEmit watch (via npm-run-all)
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
└── types/                      # cross-cutting type unions
```

Allowed dependency direction: `commands → editor, snippets, constants, types`; `snippets → config, path, editor, types, constants`; `editor → config, path, constants, types`; `path → types`. Lower layers never import from higher layers. Internal-only sibling modules in `snippets/` are prefixed with `_` (`_styles.ts`, `_shared.ts`).

### End-to-end flow

The clipboard is the data channel between "copy" and "paste". The flow is:

1. **Copy** (`src/commands/copy-file-path.ts`) — delegates to VS Code's built-in `copyFilePath`, then reads the clipboard back and re-writes the same string. The round-trip is deliberate: the built-in command's clipboard write is timing/focus-sensitive, so the explicit re-write guarantees the next paste-import sees what we just announced. Also shows the "Copied <basename>" toast.
2. **Paste** (`src/commands/paste-import.ts`) — reads the clipboard as the *source* path, takes the active editor's file as the *destination*, runs `getFilePathInfo()` and `buildImportSnippet()` together via `Promise.all` (independent reads — running concurrently halves the latency), gates on supported extension pairs, and inserts the resulting snippet via `insertImportSnippet`. Two distinct user-visible rejections: source path equals destination path (case-insensitive) → `'same-file-path'` toast; bad source/destination pair *or* empty snippet → `'not-supported'` toast. Every failure path returns void; nothing throws.
3. **Auto** (`src/commands/copy-paste.ts`) — sequential `await` of the two above.

`getFilePathInfo()` in `src/editor/file-path-info.ts` is the single source of truth for `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }`. It is called from many sites (every per-language `buildSnippet()`, `_shared.ts:buildReactImport`, `dispatch.ts`, `insert-snippet.ts:shouldRepositionCursor`); each call re-reads the clipboard, so don't introduce branches that mutate the clipboard between reads — `paste-import.ts`'s `Promise.all` runs two such reads in parallel and relies on both seeing the same value. The function dereferences `editor.document.uri.fsPath` unconditionally and will throw if there is no active editor; the only producer of the calling chain (`paste-import.ts`) is responsible for that check.

`computeRelative(source, destination)` in `src/path/relative.ts` is pure (no `vscode` import — Node-testable): it returns a Unix-style path with the extension stripped. The `./` prefix is added when the two files are in the *same directory* (case-insensitive comparison of `path.parse(...).dir` for macOS/Windows) **or** when `path.relative` produced a result that doesn't already start with `.` — this catches edge cases where absolute → relative would otherwise emit `'foo'` instead of `'./foo'`. The prefix rule is regression-tested per CHANGELOG `0.6.1`.

### Snippet generation is a single-level dispatch per language

```
buildImportSnippet()                          ← src/snippets/dispatch.ts
  switch (destinationFileExt)
    → src/snippets/{javascript,typescript,jsx,tsx,css,scss,html,markdown}.ts
        each module's buildSnippet() reads file-path info + user setting
        → resolveStyleIndex(<TABLE>, configValue) from src/snippets/_styles.ts
          switch on the matched ImportStyle.value to emit the SnippetString
```

JSX and TSX share their algorithm via `buildReactImport` in `src/snippets/_shared.ts`; the only difference is which script-snippet builder is "primary" (JS for JSX; TS for TSX, with JS as fallback for `.js` sources). Non-script sources (image/data/font/markup/stylesheet) fall through to a hardcoded `switch` inside `buildReactImport` — image/JSON/HTML/YAML/MD emit `import name$1 from '<path>';`, fonts and stylesheets emit a side-effect `import '<path>';`. Reaching the `default:` branch means an unsupported extension slipped through gating in `paste-import.ts`.

For HTML/SCSS/CSS/Markdown destinations, `determineImportType()` (`src/path/import-type.ts`) classifies the *source* into `'script' | 'stylesheet' | 'markdown' | 'image'`, with two `null` returns: `.html` (defensive — gating already rejects HTML→HTML before this runs) and `.scss` (so `snippets/scss.ts` falls through its `switch` to the SCSS-specific default that handles `@use` and partial filenames). The `'image'` branch is a `default:` catch-all, not a guarantee the source is image-like — the gating tables in `constants/extensions.ts` are what makes that safe.

### Cross-import gating

`paste-import.ts` short-circuits with the `'not-supported'` toast (`NotificationType` is a string-literal union, not an enum — see `src/types/notification.ts`) when the source/destination pair is invalid. The eight-clause conjunction in that file is the canonical rejection list; each clause cross-references a table in `src/constants/extensions.ts`:

- `HTML_SUPPORTED_EXTENSIONS`, `MARKDOWN_SUPPORTED_EXTENSIONS`, `CSS_SUPPORTED_EXTENSIONS`, `SCSS_SUPPORTED_EXTENSIONS` — what each markup/stylesheet destination accepts as a source.
- `CROSS_IMPORT_DESTINATIONS` — destinations allowed to import a *different* extension (`.html`, `.md`, `.css`, `.scss`, `.tsx`, `.jsx`). For destinations *not* in this list (currently `.js`, `.ts`), source extension must equal destination extension.
- `IMAGE_FILE_EXTENSIONS` — base set spliced into the four supported-extension lists via `...IMAGE_FILE_EXTENSIONS`; reuse instead of inlining new image groups. Runtime mirror of `types/file-extension.ts:ImageFileExtension` — keep both in sync.
- `SCRIPT_FILE_EXTENSIONS`, `STYLESHEET_FILE_EXTENSIONS` — consumed only by `editor/insert-snippet.ts:determineInsertionColumn` to force column-0 insertion for those destinations. Hidden coupling — touch with care.

`.html → .html` is rejected explicitly (no relative-import syntax for HTML embedding itself); an empty snippet (`''` or `'\n'`) is the catch-all signal that "no language module handled this destination" — see `snippets/dispatch.ts`'s `default:` branch. A separate same-file check (`sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()`) raises the `'same-file-path'` toast *before* the gating conjunction runs.

When adding a new accepted pair, update the matching constant **and** make sure the relevant per-language module in `snippets/` can produce a snippet for that source extension. When adding a new file extension entirely, three sites must stay in sync: (1) the matching category type in `src/types/file-extension.ts`, (2) the runtime gating tables in `src/constants/extensions.ts`, and (3) the matching `case` in `snippets/dispatch.ts` (destination dispatch) or `snippets/_shared.ts` (JSX/TSX source dispatch). The runtime cast `as FileExtension` is erased, so a missing gating entry produces a silent fall-through rather than a type error — gating is the runtime safety net.

### Insertion placement

`insertImportSnippet()` in `src/editor/insert-snippet.ts`:

- `shouldRepositionCursor()` overrides placement to "Cursor" when the destination is `.html`, `.md`, or a stylesheet importing a non-stylesheet source. The user's `importStatementPlacement` setting (Top/Bottom/Cursor) only applies otherwise.
- "Bottom" walks `document.getText().split('\n')` looking for any of ten `importIndicators` markers (`import `, the three `require(` shapes, six `@import`/`@use` shapes covering both quote styles and the `url(...)` form) and inserts after the last match — falls through to line 0 when no marker matches. New import-syntax markers must be added to `importIndicators` or "Bottom" placement will silently land at line 0.
- `determineInsertionColumn()` forces column 0 for destinations whose extension is in `SCRIPT_FILE_EXTENSIONS` or `STYLESHEET_FILE_EXTENSIONS`; otherwise inserts at the cursor's column (important for HTML/Markdown where the user is typing inline).
- The placement strings `'Top'`, `'Bottom'`, `'Cursor'` are matched literally against the user's setting — adding a new placement requires editing both the `switch` here and the `enum` in `package.json`.

### Configuration system

`src/config/settings.ts` defines `getAutoImportSetting(namespaceKey, settingKey)` over the frozen `AUTO_IMPORT_CONFIG` map (four namespaces: `preferences`, `script`, `stylesheet`, `markup`). Adding or renaming a user setting requires changes in **three** places that must stay byte-exact in sync — drift causes `vscode.workspace.getConfiguration().get(...)` to return `undefined` and the snippet builder silently falls through to its `default:` branch:

1. `package.json` → `contributes.configuration.properties` (the VS Code-visible setting + its `enum`).
2. `src/snippets/_styles.ts` → an `ImportStyle[]` whose `description` strings match the `package.json` `enum` strings exactly (lookup is by string equality via `resolveStyleIndex`).
3. The relevant per-language module under `src/snippets/` → a `switch` on the resolved numeric `value` to emit the snippet.

The `settingKey` is a short alias (e.g. `'javascript'`) that maps to the full configuration name (`auto-import.importStatement.script.javascriptImportStyle`) via the `(namespaceKey, settingKey)` pair. Several `*_IMPORT_OPTIONS` tables in `_styles.ts` (`CSS_IMAGE_IMPORT_OPTIONS`, the three `HTML_*_IMPORT_OPTIONS`, and `MARKDOWN_IMPORT_OPTIONS`) declare a single entry purely for `package.json` UI parity — the consuming snippet builder hardcodes that single shape and never calls `resolveStyleIndex`. They are flagged "Currently unused" in their TSDoc. (There is no `SCSS_IMAGE_IMPORT_OPTIONS`; SCSS images reuse `buildCssImageImportSnippet` from `css.ts`.)

### Snippet placeholders and language-specific quirks

Snippets use VS Code `SnippetString` placeholders (`$1`, `$2`).

**TypeScript Angular substitution** (`src/snippets/typescript.ts`) — **only at index 1** (`import { name } from '_relativePath_';`): when the path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, `generateImportName()` derives a PascalCase identifier from the basename (`app-root.component.ts` → `{ AppRootComponent }`) instead of leaving the `$1` placeholder. Every other index uses `$1` unconditionally. Don't break this when refactoring `buildTypeScriptImportSnippet()`.

**SCSS source-aware tweaks** (`src/snippets/scss.ts`) — `normalizePartialFilename()` strips a leading `_` from the *last* path segment (`_partial.scss` → `partial`, matching Sass's partial-resolution convention). `determineScssExtension()` always preserves `.css` on the import path regardless of the user's `preserveStylesheetFileExtension` setting (Sass needs the extension to recognise a foreign-language import); other source types respect the setting. SCSS image sources reuse `buildCssImageImportSnippet` from `snippets/css.ts` — the `url('…')` syntax is identical between the two languages, so there is no SCSS-specific image variant.

**HTML and Markdown destinations** (`src/snippets/html.ts`, `src/snippets/markdown.ts`) emit fixed shapes (`<script>`/`<img>`/`<link>` for HTML; `![text](path)` for Markdown link, two configurable shapes for Markdown image). The full source extension is always preserved on the path — neither HTML nor Markdown has an extension-stripping convention like JS/TS modules do.

## Build/test layout quirks

- Two independent TS pipelines: **esbuild** (bundles `src/extension.ts` → `dist/extension.js` as CommonJS with `vscode` external; sourcemaps in dev, minified with `--production`; see `esbuild.js`) and **tsc** (`compile-tests` emits `src/**` → `out/` for the test runner). The two outputs are independent — don't try to share them.
- `tsconfig.json` is `module: Node16`, `target: ES2022`, `strict: false`, `rootDir: src`, and `types: ["node", "mocha"]`. New source files belong under `src/`.
- Mocha tests are written in BDD style (`describe`/`it`); the runner UI is set to `bdd` in `.vscode-test.mjs`. Tests use Node's built-in `assert` (Chai/Sinon were dropped in commit `f06101f`). The test runner glob is `out/test/**/*.test.js` — only files emitted by `compile-tests` get picked up.
- `process/` and `.claude/` are gitignored; `process/` holds private publishing notes and access tokens. Never commit to either.

## Naming conventions

- Files use noun-only kebab-case: `relative-path.ts`, `file-path-info.ts`. Do not reintroduce suffixes like `.command.ts`, `.util.ts`, `-fn.ts`, `.types.ts`, `.enums.ts`, `.interface.ts` — the parent directory carries the kind signal.
- Modules whose filename starts with `_` (e.g., `snippets/_styles.ts`, `snippets/_shared.ts`) are internal to their directory; importing them from outside that directory is a smell.
- The only barrel file is `src/commands/index.ts`. Other directories use direct imports so dependency direction stays visible at the call site.
