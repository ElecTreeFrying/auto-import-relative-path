# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

Do NOT append a `Co-Authored-By: Claude ...` trailer (or any other Claude/AI attribution) to commit messages. Write commits as if authored solely by the user.

## Project

VS Code extension that generates relative-path import statements for JS/TS/JSX/TSX/MDX/CSS/SCSS/HTML/Markdown/Vue/Svelte/Astro. Five commands (`extension.copyFilePath`, `extension.pasteImport`, `extension.copyPaste`, `extension.pasteImportWithStyle`, `extension.setDefaultImportStyle`) are registered in `src/extension.ts`. The first three are bound to keybindings in `package.json` (`cmd/ctrl+shift+a`, `cmd/ctrl+i`, and `alt+d` in the explorer respectively); the latter two are reachable via the Command Palette (and `pasteImportWithStyle` also via the `copy-success` toast button).

## Subdirectory guides

Each directory under `src/` has its own pair of nested guides. Read the directory's `CLAUDE.md` first when editing files inside it; read its `README.md` when navigating or onboarding.

| Directory | Scope | Guides |
|-----------|-------|--------|
| `src/` | Source-tree overview, dependency layering, naming conventions | [`src/README.md`](src/README.md), [`src/CLAUDE.md`](src/CLAUDE.md) |
| `src/commands/` | The five commands; clipboard data channel, parallel fetch, eleven-clause gating | [`src/commands/README.md`](src/commands/README.md), [`src/commands/CLAUDE.md`](src/commands/CLAUDE.md) |
| `src/editor/` | VS Code-API helpers (clipboard, snippet insertion, notifications) | [`src/editor/README.md`](src/editor/README.md), [`src/editor/CLAUDE.md`](src/editor/CLAUDE.md) |
| `src/snippets/` | Per-language snippet builders + dispatch; style sync rules; JSX/TSX/MDX shared algorithm | [`src/snippets/README.md`](src/snippets/README.md), [`src/snippets/CLAUDE.md`](src/snippets/CLAUDE.md) |
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
├── extension.ts                # activate/deactivate; registers the 5 commands
├── commands/                   # public command surface (one file per command)
├── editor/                     # VS Code-API touching helpers (clipboard, snippets, notifications)
├── snippets/                   # per-language snippet builders + dispatch
├── path/                       # pure path math (no `vscode` import; Node-testable)
├── config/                     # workspace-config access (getAutoImportSetting)
├── constants/                  # cross-import gating tables
└── types/                      # cross-cutting type unions
```

Allowed dependency direction: `commands → editor, snippets, constants, types`; `snippets → config, path, editor, types, constants`; `editor → config, path, constants, types`; `path → types`. Lower layers never import from higher layers. Internal-only sibling modules in `snippets/` are prefixed with `_` (`_styles.ts`, `_react.ts`, `_class-name.ts`).

### End-to-end flow

The clipboard is the data channel between "copy" and "paste". The flow is:

1. **Copy** (`src/commands/copy-file-path.ts`) — delegates to VS Code's built-in `copyFilePath`, then reads the clipboard back and re-writes the same string. The round-trip is deliberate: the built-in command's clipboard write is timing/focus-sensitive, so the explicit re-write guarantees the next paste-import sees what we just announced. Also shows the "Copied <basename>" toast.
2. **Paste** (`src/commands/paste-import.ts`) — reads the clipboard as the *source* path, takes the active editor's file as the *destination*, runs `getFilePathInfo()` and `buildImportSnippet()` together via `Promise.all` (independent reads — running concurrently halves the latency), gates on supported extension pairs, and inserts the resulting snippet via `insertImportSnippet`. Two distinct user-visible rejections: source path equals destination path (case-insensitive) → `'same-file-path'` toast; bad source/destination pair *or* empty snippet → `'not-supported'` toast. Every failure path returns void; nothing throws.
3. **Auto** (`src/commands/copy-paste.ts`) — sequential `await` of the two above.

`getFilePathInfo()` in `src/editor/file-path-info.ts` is the single source of truth for `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }`. It is called from many sites (most per-language `buildSnippet()` functions — 7 of 9; `jsx.ts` and `tsx.ts` delegate to `_react.ts:buildReactImport` which calls it on their behalf — plus `dispatch.ts`, `variants.ts`, and `insert-snippet.ts:insertImportSnippet`); each call re-reads the clipboard, so don't introduce branches that mutate the clipboard between reads — `paste-import.ts`'s `Promise.all` runs two such reads in parallel and relies on both seeing the same value. The function dereferences `editor.document.uri.fsPath` unconditionally and will throw if there is no active editor; every command that starts the calling chain (`paste-import.ts`, `paste-import-with-style.ts`, `set-default-import-style.ts`) is responsible for that check.

`computeRelative(source, destination)` in `src/path/relative.ts` is pure (no `vscode` import — Node-testable): it returns a Unix-style path with the extension stripped. The `./` prefix is added when the two files are in the *same directory* (case-insensitive comparison of `path.parse(...).dir` for macOS/Windows) **or** when `path.relative` produced a result that doesn't already start with `.` — this catches edge cases where absolute → relative would otherwise emit `'foo'` instead of `'./foo'`. The prefix rule is regression-tested per CHANGELOG `0.6.1`.

### Snippet generation is a single-level dispatch per language

```
buildImportSnippet()                          ← src/snippets/dispatch.ts
  switch (destinationFileExt)
    → src/snippets/languages/{javascript,typescript,jsx,tsx,css,scss,html,markdown,framework-component}.ts
        each module's buildSnippet() reads file-path info + user setting
        → resolveStyleIndex(<TABLE>, configValue) from src/snippets/_styles.ts
          switch on the matched ImportStyle.value to emit the SnippetString
```

`.mdx` destinations fall through to `tsx.ts` (identical import semantics). `.vue`, `.svelte`, and `.astro` destinations share `framework-component.ts` (all three delegate to `buildTypeScriptImportSnippet`). The picker commands (`pasteImportWithStyle`, `setDefaultImportStyle`) use a parallel entry point — `variants.ts:buildImportSnippetVariants()` — which mirrors the same destination switch but enumerates all applicable styles instead of applying the user's default.

JSX, TSX, and MDX share their algorithm via `buildReactImport` in `src/snippets/_react.ts`; the only difference is which script-snippet builder is "primary" (JS for JSX; TS for TSX and MDX, with JS as fallback for `.js` sources in both). Non-script sources fall through to a hardcoded `switch` inside `buildReactImport` with four groups: CSS Modules (`.module.css`/`.module.scss`) emit `import ${1:styles} from '<path>';`; image/data/markup/component (`.gif`/`.jpeg`/`.jpg`/`.png`/`.svg`/`.avif`/`.webp`/`.json`/`.html`/`.yml`/`.yaml`/`.md`/`.mdx`/`.pdf`/`.vue`/`.svelte`/`.astro`) emit `import ${1:name} from '<path>';`; media/text-track (`.mp4`/`.webm`/`.mov`/`.mp3`/`.ogg`/`.wav`/`.m4a`/`.vtt`) emit `import ${1:url} from '<path>';`; fonts and stylesheets (`.woff`/`.woff2`/`.ttf`/`.eot`/`.css`/`.scss`) emit a side-effect `import '<path>';`. Reaching the `default:` branch means an unsupported extension slipped through gating in `paste-import.ts`.

For HTML/SCSS/CSS/Markdown destinations, `determineImportType()` (`src/path/import-type.ts`) classifies the *source* into `'script' | 'stylesheet' | 'markdown' | 'image' | 'video' | 'audio' | 'text-track'`, with two `null` returns: `.html` (defensive — gating already rejects HTML→HTML before this runs) and `.scss` (so `snippets/languages/scss.ts` falls through its `switch` to the SCSS-specific default that handles `@use` and partial filenames). The `'image'` branch is a `default:` catch-all, not a guarantee the source is image-like — the gating tables in `constants/extensions.ts` are what makes that safe.

### Cross-import gating

`paste-import.ts` short-circuits with the `'not-supported'` toast (`NotificationType` is a string-literal union, not an enum — see `src/types/notification.ts`) when the source/destination pair is invalid. The eleven-clause conjunction in that file is the canonical rejection list; each clause cross-references a table in `src/constants/extensions.ts`:

- `HTML_SUPPORTED_EXTENSIONS`, `MARKDOWN_SUPPORTED_EXTENSIONS`, `CSS_SUPPORTED_EXTENSIONS`, `SCSS_SUPPORTED_EXTENSIONS`, `VUE_SUPPORTED_EXTENSIONS`, `SVELTE_SUPPORTED_EXTENSIONS`, `ASTRO_SUPPORTED_EXTENSIONS` — what each markup/stylesheet/framework-component destination accepts as a source.
- `CROSS_IMPORT_DESTINATIONS` — destinations allowed to import a *different* extension (`.html`, `.md`, `.css`, `.scss`, `.tsx`, `.mdx`, `.jsx`, `.vue`, `.svelte`, `.astro`). For destinations *not* in this list (currently `.js`, `.ts`), source extension must equal destination extension.
- `IMAGE_FILE_EXTENSIONS` — base set spliced into the seven supported-extension lists via `...IMAGE_FILE_EXTENSIONS`; reuse instead of inlining new image groups. Runtime mirror of `types/file-extension.ts:ImageFileExtension` — keep both in sync.
- `MEDIA_FILE_EXTENSIONS` — video + audio extensions; spliced into `HTML_SUPPORTED_EXTENSIONS`, `VUE_SUPPORTED_EXTENSIONS`, `SVELTE_SUPPORTED_EXTENSIONS`, and `ASTRO_SUPPORTED_EXTENSIONS` via `...MEDIA_FILE_EXTENSIONS`. Runtime mirror of `types/file-extension.ts:VideoFileExtension | AudioFileExtension`.
- `TEXT_TRACK_FILE_EXTENSIONS` — `.vtt`; spliced into `HTML_SUPPORTED_EXTENSIONS`, `VUE_SUPPORTED_EXTENSIONS`, `SVELTE_SUPPORTED_EXTENSIONS`, and `ASTRO_SUPPORTED_EXTENSIONS` via `...TEXT_TRACK_FILE_EXTENSIONS`. Runtime mirror of `types/file-extension.ts:TextTrackFileExtension`.
- `SCRIPT_FILE_EXTENSIONS` — consumed only by `editor/insert-snippet.ts:determineInsertionColumn` to force column-0 insertion for script destinations. Hidden coupling — touch with care.
- `STYLESHEET_FILE_EXTENSIONS` — consumed by `editor/insert-snippet.ts:determineInsertionColumn` (column-0 insertion) and `editor/insert-snippet.ts:isInlineSnippet` (non-stylesheet source into stylesheet destination triggers inline `url()` insertion). Hidden coupling — touch with care.

`.html → .html` is rejected explicitly (no relative-import syntax for HTML embedding itself); an empty snippet (`''` or `'\n'`) is the catch-all signal that "no language module handled this destination" — see `snippets/dispatch.ts`'s `default:` branch. A separate same-file check (`sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()`) raises the `'same-file-path'` toast *before* the gating conjunction runs.

When adding a new accepted pair, update the matching constant **and** make sure the relevant per-language module in `snippets/languages/` can produce a snippet for that source extension. When adding a new file extension entirely, four sites must stay in sync: (1) the matching category type in `src/types/file-extension.ts`, (2) the runtime gating tables in `src/constants/extensions.ts`, (3) the matching `case` in `snippets/dispatch.ts` (destination dispatch) or `snippets/_react.ts` (JSX/TSX/MDX source dispatch), and (4) the matching `case` in `snippets/variants.ts:buildImportSnippetVariants` (so the picker commands work for the new extension). The runtime cast `as FileExtension` is erased, so a missing gating entry produces a silent fall-through rather than a type error — gating is the runtime safety net.

### Insertion placement

`insertImportSnippet()` in `src/editor/insert-snippet.ts`:

- All overrides are resolved from a single `getFilePathInfo()` call at the top — no redundant clipboard re-reads.
- `isInlineSnippet()` (checked first) handles non-stylesheet source into stylesheet destination (image → `.css`/`.scss`). Inserts the `url()` snippet at the exact cursor position (line *and* column via `editor.selection.anchor`) with no trailing newline — bypasses `determineInsertionColumn` and the `\n` append since `url()` is an inline CSS value, not a standalone statement.
- `shouldRepositionCursor()` overrides placement to "Cursor" when the destination is `.html` or `.md` (no canonical "top of file" for embedded tags). The user's `importStatementPlacement` setting only applies otherwise.
- Astro frontmatter: for `.astro` destinations, constrains placement to within the `---` frontmatter fences via `insertSnippetAtAstroFrontmatter`. Reads the user's placement setting: **Top** inserts after the opening `---`; **Bottom** scans the frontmatter region for import indicators and inserts after the last match (falls back to after the opening `---`); **Cursor** inserts at the cursor line if inside the fences, otherwise falls back to Bottom. If no frontmatter exists, all modes create a new `---` block at line 0.
- SFC script block: for `.vue` / `.svelte` destinations, constrains placement to within a `<script...>` / `</script>` pair via `insertSnippetAtSfcScript`. Prefers `<script setup` (Vue composition API) over bare `<script`. Same Top/Bottom/Cursor logic as the Astro handler, constrained to the script block. If no script block exists, wraps the import in a new `<script>` / `</script>` pair at line 0.
- "Bottom" (for non-overridden destinations) walks `document.getText().split('\n')` looking for any of nine `IMPORT_INDICATORS` markers (`import `, `require(`, five `@import`/`@use` shapes covering both quote styles and the `url(...)` form, and two `@forward` shapes) and inserts after the last match — falls through to line 0 when no marker matches. New import-syntax markers must be added to `IMPORT_INDICATORS` or "Bottom" placement will silently land at line 0.
- `determineInsertionColumn()` forces column 0 for destinations whose extension is in `SCRIPT_FILE_EXTENSIONS` or `STYLESHEET_FILE_EXTENSIONS`; otherwise inserts at the cursor's column (important for HTML/Markdown where the user is typing inline).
- The placement strings `'Top'`, `'Bottom'`, `'Cursor'` are matched literally against the user's setting — adding a new placement requires editing both the `switch` here and the `enum` in `package.json`.

### Configuration system

`src/config/settings.ts` defines `getAutoImportSetting(namespaceKey, settingKey)` (reader) and `setAutoImportSetting(namespaceKey, settingKey, value, target?)` (writer, consumed by `set-default-import-style.ts` to persist the user's chosen default; defaults to `ConfigurationTarget.Global`) over the frozen `AUTO_IMPORT_CONFIG` map (four namespaces: `preferences`, `script`, `stylesheet`, `markup`). Adding or renaming a user setting requires changes in **three** places that must stay byte-exact in sync — drift causes `vscode.workspace.getConfiguration().get(...)` to return `undefined` and the snippet builder silently falls through to its `default:` branch:

1. `package.json` → `contributes.configuration.properties` (the VS Code-visible setting + its `enum`).
2. `src/snippets/_styles.ts` → an `ImportStyle[]` whose `description` strings match the `package.json` `enum` strings exactly (lookup is by string equality via `resolveStyleIndex`).
3. The relevant per-language module under `src/snippets/languages/` → a `switch` on the resolved numeric `value` to emit the snippet.

The `settingKey` is a short alias (e.g. `'javascript'`) that maps to the full configuration name (`auto-import.importStatement.script.javascriptImportStyle`) via the `(namespaceKey, settingKey)` pair. Several `*_IMPORT_OPTIONS` tables in `_styles.ts` (`CSS_IMAGE_IMPORT_OPTIONS`, `HTML_STYLESHEET_IMPORT_OPTIONS`, and `MARKDOWN_IMPORT_OPTIONS`) declare a single entry purely for `package.json` UI parity — the consuming snippet builder hardcodes that single shape and never calls `resolveStyleIndex`. They are flagged "Currently unused" in their TSDoc. The remaining HTML tables — `HTML_SCRIPT_IMPORT_OPTIONS` (5 entries), `HTML_IMAGE_IMPORT_OPTIONS` (3), `HTML_VIDEO_IMPORT_OPTIONS` (4), `HTML_AUDIO_IMPORT_OPTIONS` (2) — are multi-entry and actively consumed by `resolveStyleIndex` in `languages/html.ts`. (There is no `SCSS_IMAGE_IMPORT_OPTIONS`; SCSS images reuse `buildCssImageImportSnippet` from `languages/css.ts`.)

### Snippet placeholders and language-specific quirks

Snippets use VS Code `SnippetString` placeholders (`$1`, `$2`).

**TypeScript class-name detection and legacy-Angular fallback** (`src/snippets/languages/typescript.ts`) — both `buildSnippet()` and `variants.ts` (`.ts` case) call `readExportedClassName()` from `snippets/_class-name.ts` to scan the source file for a top-level `export class Name`. If found, the detected name is passed as `detectedImportName` to `buildTypeScriptImportSnippetByStyle`. At **index 0** (`import { name } from '_relativePath_';`): `detectedImportName` is used if available; otherwise `generateAngularLegacyImportName()` derives a PascalCase identifier from Angular-convention suffixes in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component`, `.directive`, `.pipe`, `.service`, `.module`) as a back-compat fallback (`app-root.component.ts` → `{ AppRootComponent }`), or emits `$1` if neither applies. At the **default branch** (when `resolveStyleIndex` returns `undefined`): `detectedImportName` is used if available; otherwise `$1`. Indices 1–6 use `$1` unconditionally. Don't break this when refactoring `buildTypeScriptImportSnippet()`.

**SCSS source-aware tweaks** (`src/snippets/languages/scss.ts`) — `normalizePartialFilename()` strips a leading `_` from the *last* path segment (`_partial.scss` → `partial`, matching Sass's partial-resolution convention). `determineScssExtension()` always preserves `.css` on the import path regardless of the user's `preserveStylesheetFileExtension` setting (Sass needs the extension to recognise a foreign-language import); other source types respect the setting. SCSS image sources reuse `buildCssImageImportSnippet` from `snippets/languages/css.ts` — the `url('…')` syntax is identical between the two languages, so there is no SCSS-specific image variant.

**HTML destinations** (`src/snippets/languages/html.ts`) — six tag types, four of which are configurable via `resolveStyleIndex`: `<script>` (5 styles, default is modern minimal without `type`), `<img>` (3 styles), `<video>` (4 styles), `<audio>` (2 styles). Two remain fixed single-shape: `<link>` (stylesheet) and `<track>` (text-track / subtitles). Each branch dispatches on `determineImportType(sourceFilePath)`.

**Markdown destinations** (`src/snippets/languages/markdown.ts`) — fixed `[text](path)` for Markdown-to-Markdown links; three configurable shapes for image sources (bare inline, inline with hover-text title, HTML `<img>` embed for sizing). The full source extension is always preserved on the path — neither HTML nor Markdown has an extension-stripping convention like JS/TS modules do.

## Build/test layout quirks

- Two independent TS pipelines: **esbuild** (bundles `src/extension.ts` → `dist/extension.js` as CommonJS with `vscode` external; sourcemaps in dev, minified with `--production`; see `esbuild.js`) and **tsc** (`compile-tests` emits `src/**` → `out/` for the test runner). The two outputs are independent — don't try to share them.
- `tsconfig.json` is `module: Node16`, `target: ES2022`, `strict: false`, `rootDir: src`, and `types: ["node", "mocha"]`. New source files belong under `src/`.
- Mocha tests are written in BDD style (`describe`/`it`); the runner UI is set to `bdd` in `.vscode-test.mjs`. Tests use Node's built-in `assert` (Chai/Sinon were dropped in commit `f06101f`). The test runner glob is `out/test/**/*.test.js` — only files emitted by `compile-tests` get picked up.
- `process/` and `.claude/` are gitignored; `process/` holds private publishing notes and access tokens. Never commit to either.

## Naming conventions

- Files use noun-only kebab-case: `relative-path.ts`, `file-path-info.ts`. Do not reintroduce suffixes like `.command.ts`, `.util.ts`, `-fn.ts`, `.types.ts`, `.enums.ts`, `.interface.ts` — the parent directory carries the kind signal.
- Modules whose filename starts with `_` (e.g., `snippets/_styles.ts`, `snippets/_react.ts`, `snippets/_class-name.ts`) are internal to their parent subtree; importing them from outside `snippets/` is a smell. The `snippets/languages/` modules importing `../_styles`, `../_react`, and `../_class-name` is expected.
- The only barrel file is `src/commands/index.ts`. Other directories use direct imports so dependency direction stays visible at the call site.
