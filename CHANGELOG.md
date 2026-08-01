# Changelog

## v1.0.3 (2026-08-08)

### Added

- **Runs in the browser.** A web build now ships alongside the desktop one, so the extension loads on [vscode.dev](https://vscode.dev) and [github.dev](https://github.dev) — drag a file in, or use the paste-as-import commands, and you get the same relative-path import. The web build uses POSIX-only path handling, matching what those hosts expose; the desktop build is untouched and keeps its platform-correct Windows behavior.
- **Commands and settings now follow VS Code's display language.** Every command title, the extension's name and description, and every setting's title, description, and dropdown descriptions render in Simplified Chinese, Spanish, French, Brazilian Portuguese, Russian, German, Japanese, or Turkish. English is the fallback for every other display language. The **Auto Import** prefix stays verbatim in every language, so a single palette search still surfaces the full command set, and the legacy `extension.*` ids share their translation with their `auto-import.*` twins.

### Changed

- **What stays English, on purpose.** Setting *values* — the import styles and the `Top` / `Bottom` / `Cursor` placements — are matched at runtime, so only their descriptions are translated. Toasts and Quick Picks shown while the extension is running are English too.
- **Open VSX is now linked directly from the README** — a version badge, an **Open VSX listing** line under Installation, and a link to the publisher's other extensions on the registry. Compatibility notes that the listing is published by **WinterNova5**, a verified Open VSX publisher, and now records that the extension runs on the web.
- **The publisher reads as WinterNova5** throughout the README. Install commands, URLs, and the extension id are unchanged.
- **GitHub Sponsors** now sits alongside the existing donation options.

## v1.0.2 (2026-07-25)

### Added

- **Namespaced command ids.** Every command is now also registered as `auto-import.<name>` — `auto-import.pasteImport`, `auto-import.copyFilePath`, `auto-import.copyPaste`, and so on. That family is what the Command Palette lists and what the three default keybindings target. The original `extension.<name>` ids stay registered permanently, so any keybinding, macro, or `tasks.json` entry referencing one keeps working untouched; they're hidden from the palette so each command appears exactly once.

### Fixed

- **Documentation links now work from the Marketplace listing.** The README's spec and support-guide links resolved only when read on GitHub — on the extension's Marketplace page they led nowhere, and the demo GIFs didn't load. Both now resolve from either surface.

### Changed

- **Repo housekeeping.** Image assets moved from `assets/` back to `images/`, and the extension icon is now `images/icon.png`. The Marketplace gallery banner was retuned to match the icon. Packaging and metadata only.
- New GitHub **issue forms** (bug report / feature request) with contact links, replacing free-form issues.

## v1.0.1 (2026-07-24)

### Fixed
- **Packaging — ship the minified production bundle.** The v1.0.0 package inadvertently included the unminified development build, roughly doubling the size of `dist/extension.js`. v1.0.1 ships the intended production-minified bundle (~44 KB, ~12 KB gzipped). Packaging-only fix — no functional, API, or settings changes.

## v1.0.0 (2026-07-24)

### Breaking Changes
- **Minimum VS Code version is `^1.97.0`.** The drag-and-drop import provider needs the drop-edit APIs (`DocumentDropOrPasteEditKind`, 3-argument `DocumentDropEdit`) finalized in VS Code 1.97 (February 2025), so the extension requires VS Code 1.97 or newer and won't load on builds older than 1.97. (This is the empirical floor for those APIs — and a slight *widening* versus the 0.6.x line, which required `^1.98.0`.) Recent Cursor, VSCodium, and Code Server builds that track the VS Code API at 1.97+ remain supported.
- **TypeScript import styles reshuffled.** The "aliased default" shape (`import { $1 as $2 } from '…'`) has been removed. Three new shapes added: type-only import, mixed value + type import (TS 4.5+), and dynamic `await import()`. Net change: 5 → 7 entries — **style indices have shifted**; users with a non-default `typescriptImportStyle` should re-select their preferred shape in Settings.
- **JavaScript import styles reshuffled.** Four legacy shapes removed: `import { default as name }`, `var = require()`, `var = import()`, `const = import()`. Two new shapes added: mixed default + named import, and `const = await import()`. Net change: 9 → 7 entries — **style indices have shifted**; users with a non-default `javascriptImportStyle` should re-select.
- **SCSS default flipped from `@import` to `@use`.** The `@import url(…)` shape has been dropped entirely. Two new shapes added: `@use '…' as name` and `@forward '…'` (`@use '…' as *` was already available). Users who relied on `@import` as the default should update their `scssImportStyle` setting.
- **HTML script default flipped to modern minimal.** `<script type="text/javascript" src="…"></script>` → `<script src="…"></script>`. Three new shapes added: `defer`, `type="module"`, and `async`. Users who need the legacy `type` attribute should select it explicitly.
- **Markdown image default reordered.** Two new shapes added (bare inline, HTML `<img>` embed), the reference-style `![alt-text][image]` shape dropped, and the default position rotated. Users with a non-default `markdownImageImportStyle` should verify their selection.
- **Markdown link default changed from image syntax to link syntax.** `markdownImportStyle` now defaults to `[text](path)` instead of `![text](path)`. Image embeds belong under the dedicated `markdownImageImportStyle` setting.

### Added
- **Review prompt.** After you have generated a number of imports, a single notification asks for a Marketplace review, offering **Rate It**, **Not Now**, and **Never Ask Again**. It counts gestures rather than files, never repeats once answered or dismissed, and is governed by the new `auto-import.preferences.requestReview` setting (default `true`) for anyone who would rather never see it.
- **Five new destination languages.** Vue (`.vue`), Svelte (`.svelte`), Astro (`.astro`), MDX (`.mdx`), and **LaTeX** (`.tex`) are now supported as import destinations — bringing the total to **13 destination file types**.
- **LaTeX (`.tex`) — figures, file includes, and bibliographies.** Drag or paste a file into a `.tex` document and get the right LaTeX command, via a dedicated `auto-import.importStatement.latex.*` settings namespace. Three source relationships, each with its own configurable style:
  - **Graphics** (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.eps`) → a `figure` float by default (`\begin{figure}[htbp] … \includegraphics[width=0.5\textwidth]{…} … \caption{} \label{fig:} … \end{figure}`, with `\caption` before `\label` for correct `\ref` numbering), or a bare / sized `\includegraphics`. The accepted graphics set is **engine-renderable only** — `.svg` / `.gif` / `.webp` / `.avif` are rejected (`pdflatex` can't render them). `preserveGraphicsFileExtension` (default *on* — keep) governs the path, the inverse of the script/stylesheet preserve toggles.
  - **`.tex`** → `\input{…}` (default) or `\include{…}`; the `.tex` extension is dropped (`\include` requires it omitted).
  - **`.bib`** → `\addbibresource{…bib}` (modern biblatex, default) or `\bibliography{…}` (legacy BibTeX).
  - Activates via `onLanguage:latex` + `workspaceContains:**/*.tex`; the drop provider matches `.tex` by file pattern (LaTeX has no guaranteed VS Code language ID), the same way `.mdx` is handled.
- **Media and document source types.** Video (`.mp4`, `.webm`, `.mov`), audio (`.mp3`, `.ogg`, `.wav`, `.m4a`), text-track (`.vtt`), and additional asset types (`.svg`, `.avif`, `.pdf`) can now be imported into JSX, TSX, MDX, and HTML destinations. Together with the LaTeX `.tex` / `.bib` / `.eps`, this brings the total to **38 supported file extensions across 18 categories**.
- **Five new commands.**
  - **Auto Import: Paste as Import (Pick Style)** — opens a QuickPick listing every applicable import shape for the current source/destination pair. Picker rows are labelled by the source file's basename; the full relative path is still what gets inserted. Reachable from the Command Palette and from the "Paste with Style" button on the copy-success toast. Single-shape destinations insert directly without showing the picker.
  - **Auto Import: Set Default Import Style** — same picker, but persists the chosen shape to User (Global) settings instead of inserting a snippet. The current default is marked with a checkmark icon and appears first in the list.
  - **Auto Import: Set Import Placement** — a QuickPick of Top / Bottom / Cursor that persists where imports are inserted (`auto-import.preferences.importStatementPlacement`); the current choice is marked with a checkmark. Command Palette only.
  - **Auto Import: Toggle Preserve Script File Extension** — flips `preserveScriptFileExtension` and shows the new state (On / Off) in a toast. Command Palette only.
  - **Auto Import: Reset All Import Styles to Defaults** — clears every customized import-style override (the **twelve** configurable styles, incl. the three `latex.*` styles) back to its `package.json` default, with an **Undo** action on the confirmation toast; shows an info toast when nothing is customized. Command Palette only.
- **Drag-and-drop import from Explorer.** Drag any supported source file from the Explorer sidebar into an open editor — the extension generates the same import snippet as the paste commands and inserts it on its own line at the drop point, never spliced into the middle of the line it lands on; in HTML, Markdown, and LaTeX it takes the target line's indentation, and a drop onto a blank line reuses that line in place. Registered as a `DocumentDropEditProvider` for all 13 supported destination languages. No keybinding needed; no new settings — uses the same styles and configuration as the paste commands. Unsupported pairs show the same "Cannot import" warning as paste commands and insert nothing — the provider suppresses VS Code's default raw-path drop.
- **Import multiple files in one gesture.** Select several files and import them all at once — every gesture fans out over the full selection and inserts one **stacked block** of import statements, one per file, in selection order, as a single insertion at the shared placement:
  - **Drag-and-drop:** drag an Explorer multi-selection into any supported editor — each dragged file is gated, built, and placed independently, and the surviving statements are stacked at the drop placement.
  - **Copy/paste:** multi-select in the Explorer, copy with `Cmd/Ctrl+Shift+A` (or run the one-step `Alt+D`), then paste with `Cmd/Ctrl+I` — the copy toast announces every copied path (`Copied 3 paths — logo.svg, app.ts, util.ts`), and paste inserts the same stacked block. Hand-assembled newline-joined path lists on the clipboard work too. *(This also removes an old rough edge where copying a multi-selection left a newline-joined blob that paste rejected with "Source file no longer exists.")*
  - **Independent placeholders:** each statement's tab stops are renumbered, so typing one import's identifier never edits another's.
  - **Per-member skips:** members that can't import are skipped silently while the rest insert — the destination itself, files that no longer exist, extensionless files into a non-`.md` destination (an extensionless member *does* import into a `.md` destination as a link), and unsupported pairs. When *nothing* in the selection can import, a single warning reports the most informative failure.
  - **Inline `url()` rule:** image-into-stylesheet snippets are inline CSS values and can't stack — an all-inline selection inserts the first file only.
  - **Style pickers stay single-pair:** *Paste as Import (Pick Style)* and *Set Default Import Style* operate on the first usable member of a multi-selection.
  - Single-file behavior is unchanged, byte-for-byte, on every gesture.
- **Auto-named default imports.** Default-import statements now pre-fill the binding from the source file's basename instead of an empty placeholder: `logo.svg` → `import logo from './logo.svg'`, `App.jsx` → `import App from './App'` (a PascalCase filename keeps its case; kebab/snake names camelCase — `my-logo.v2.svg` → `myLogoV2`). The pre-filled name is an editable, pre-selected tab stop, and falls back to the generic placeholder when the basename can't form a legal identifier (e.g. `404.png`). Applies to JavaScript and TypeScript default imports, and to asset default/URL imports in the JSX/TSX/MDX and framework-component destinations; named and type-only imports are unaffected (their binding must match a real export). Markdown and MDX sources keep the generic name (they are not framework components); Vue/Svelte/Astro components get the PascalCase treatment described below.
- **PascalCase component naming for Vue / Svelte / Astro.** A `.vue`/`.svelte`/`.astro` source imported as a default binding pre-fills the conventional PascalCase component identifier derived from the source filename — `my-button.vue` → `import MyButton from './my-button.vue'` — across paste, drag-and-drop, and the style-picker flows, into both the framework destinations (including self-imports) and `.jsx`/`.tsx`/`.mdx`. Kebab-case, snake_case, and dotted filenames all derive (`button.spec.vue` → `ButtonSpec`); an already-PascalCase name is unchanged; a basename that can't form a legal identifier (a leading digit, e.g. `2fa-widget.vue`) keeps the editable `name` placeholder. Markdown and MDX sources are not framework components and keep the generic `name`.
- **Stylesheet imports into Vue / Svelte / Astro.** Drag or paste a `.css` / `.scss` file into a framework SFC and the shape follows the cursor. Inside a `<style>` block it becomes the stylesheet dialect — `@import` for a `.css` source, `@use` for a `.scss` source (with the same partial-underscore stripping and extension handling as a `.scss` destination), configurable through the existing `cssImportStyle` / `scssImportStyle` styles and the style pickers. In the `<script>` block, Astro frontmatter, or template it becomes a side-effect `import './styles.css';` — the canonical global-styles pattern. Multi-file gestures stack inside the `<style>` block when every dragged/pasted file is a stylesheet; a mixed selection stays script-side. No new setting — the `styleSheet.*` styles are shared with the plain `.css`/`.scss` destinations.
- **Framework components into plain `.ts` / `.js`.** Vue (`.vue`), Svelte (`.svelte`), and Astro (`.astro`) components can now be imported into TypeScript and JavaScript destinations — the common test-and-setup-code path (Vitest, Vue Test Utils, `customElement` registration). Paste or drag a component into a `.ts` / `.js` file and get the same PascalCase default name import as JSX/TSX/MDX (`my-button.vue` → `import MyButton from './my-button.vue'`), with the full source extension always kept; the style pickers insert it directly and Set Default reports it as a fixed style. `.ts` / `.js` stay otherwise strict — every non-component cross-language source (scripts, images, data, LaTeX) is still rejected. No new setting.
- **Markdown / MDX sources into Vue and Svelte.** `.md` / `.mdx` files can now be imported as components into `.vue` and `.svelte` destinations — parity with Astro, which already accepted them. Paste and drag-and-drop emit the fixed named default import (`import name from './doc.md'`), inserted into the SFC `<script>` block; the binding stays the generic `name` (Markdown isn't a framework component, so it skips the PascalCase treatment). Wire it up with `unplugin-vue-markdown` / `vite-plugin-md` in Vue and `mdsvex` in Svelte. No new setting.
- **Extensionless sources as Markdown links.** Files with no extension — `LICENSE`, `Dockerfile`, `Makefile` — can now be imported into a `.md` destination as a `[text](path)` link, via copy/paste or drag-and-drop. They are the one exception to extension-based gating: no bundler resolves an extensionless import elsewhere, so every non-`.md` destination still rejects them (with a *"has no file extension — only Markdown links support extensionless files"* warning). Copying an extensionless file now succeeds — the rejection moved from copy time to paste/drop time, where the destination is known.
- **`onLanguage` activation events.** The extension now activates when any supported language file is opened (13 `onLanguage:*` entries in `package.json`, plus `workspaceContains:**/*.mdx` and `**/*.tex` for the two pattern-matched destinations), ensuring the drop provider is registered before the user's first drag.
- **Untrusted, virtual, and remote workspace support.** The manifest now declares `capabilities.untrustedWorkspaces` (supported) and `virtualWorkspaces` (true), so the extension loads in Restricted Mode and in virtual workspaces (e.g. github.dev, vscode.dev) — it only reads file paths and inserts snippets, with no workspace-trust requirement. It also declares `extensionKind: ["workspace"]`, pinning the extension to the workspace host in remote setups (Remote-SSH, WSL, Dev Containers, Codespaces) so imports are generated next to the files they reference.
- **Smart placement for component files.** Astro imports land inside `---` frontmatter fences. Vue and Svelte imports land inside `<script>` blocks (prefers `<script setup>`, then the instance `<script>` over a module/`context=` script). CSS/SCSS `url()` values insert inline at the exact cursor position. All modes respect the Top/Bottom/Cursor placement setting. Indentation automatically matches the surrounding block.
- **Actionable error and confirmation toasts.** Two generic warnings ("Same file path", "Not supported") replaced by five specific messages: *"A file cannot import itself"*, *"Cannot import .X into .Y files"* (the source/destination extensions interpolated), *"Open a file to paste an import"*, *"No file selected to copy"*, and *"Clipboard does not contain a file path"*. Four toast action buttons added: "Paste with Style", "Paste Now", "View Supported Files", and "Undo" (on the Reset All Import Styles toast). Two new confirmation toasts for the Set Default flow: *"No configurable style"* warning and *"Default style saved"* confirmation. Plus two new source guards: a *"No file extension"* warning when pasting or dropping an extensionless file into a non-Markdown destination (extensionless files import into `.md` as links, and copying them succeeds), and a *"Source file no longer exists"* warning when the copied source has been moved or deleted before the paste (the source path is `fs.stat`-checked first).
- **Class-name detection for TypeScript.** The named-import shape (`import { Name } from '…'`) now auto-fills the identifier from the source file's `export class Name` declaration when available. Falls back to Angular-convention PascalCase derivation (`.component`, `.directive`, `.pipe`, `.service`, `.module` suffixes), then to a `$1` tab-stop placeholder.
- **New import styles per language.** TypeScript: `import type { }`, mixed value + type, dynamic `await import()`. JavaScript: mixed default + named, `await import()`. SCSS: `@use '…' as name`, `@forward '…'`. HTML script: `defer`, `type="module"`, `async`. HTML image: lazy-loading with `loading="lazy"`, CLS-safe dimensions with `width`/`height` attributes. HTML `<video>` (new): controls, background autoplay, poster, and metadata-preload variants. HTML `<audio>` (new): controls and metadata-preload variants.
- **Comprehensive test coverage.** 38 automated test files covering path math, import-type classification, extension gating tables, style-table integrity, class-name detection, and per-language snippet builders for every supported destination (JavaScript, TypeScript, CSS, SCSS, HTML, Markdown, JSX, TSX, framework components, LaTeX). Eight-command registration guard test. Integration demo workspace with fixture files for every supported pair.
- **Toolchain modernization.** Webpack replaced by esbuild (~12 KB gzipped production bundle). Unified `typescript-eslint` package replaces the separate parser and plugin. `npm-run-all` powers parallel `watch:tsc` + `watch:esbuild` scripts. Build pipeline: `compile` runs `check-types && lint && esbuild`; `watch` runs both watchers concurrently.

### Changed
- **Command palette titles renamed for clarity.** `Auto Import: Paste` → *Paste as Import*. `Auto Import: Copy` → *Copy File Path*. `Auto Import: Auto` → *Insert Import from Selected File*.
- **Copy toast wording.** `Copied <basename>` → `Copied path — <basename>` to clarify that the *path* was copied, not the file contents.
- **Settings panel rewritten.** Every setting has a precise top-level description plus per-choice `enumDescriptions`. TypeScript documents the Angular auto-fill behavior; SCSS labels `@use` as "modern (recommended)" and `@import` as "legacy".
- **Marketplace metadata overhauled.** Description, keywords, and categories updated for the full **13-destination, 38-extension, 8-command** scope (45 import styles, 20 settings). A new `qna` field routes the Marketplace listing's Q&A tab to the project's GitHub issue tracker.
- **Source layout restructured.** Eight single-responsibility directories (`commands/`, `drop/`, `editor/`, `snippets/`, `path/`, `config/`, `constants/`, `types/`) with strict layered dependency direction.
- **Snippet pipeline parameterized.** All per-language `buildSnippet()` functions, `buildImportSnippet()`, `buildImportSnippetVariants()`, and `insertImportSnippet()` now receive `FilePathInfo` as a parameter. Clipboard-reading is isolated to the command layer — reduces clipboard reads from N per operation to exactly 1.
- **Gating logic extracted.** The thirteen-clause extension-pair check is now a shared `isPairSupported()` function in `src/gating.ts`, reused by both commands and the drop provider.
- **Documentation rewritten.** README.md restructured for quick-start onboarding with framework badges and inline demo; SUPPORT.md rewritten for the expanded command and language surface.

### Fixed
- **Angular auto-naming with `preserveScriptFileExtension: true`.** `app-root.component.ts` no longer produces `{ AppRootComponentTs }` — the script extension is stripped before PascalCase derivation.
- **CSS Modules in JSX/TSX/MDX.** `.module.css` and `.module.scss` sources now emit `import styles from '…'` (default import) instead of a named import.
- **Markdown-to-Markdown links.** `.md → .md` imports now use link syntax `[text](path)` instead of image syntax.
- **SCSS `@use … as` shape.** Now correctly emits `@use '…' as ${1:*};`.
- **JSX/TSX non-script placeholders.** Asset imports use descriptive `${1:name}` instead of bare `$1`.
- **Markdown image hover-text.** The title string now includes a tab-stop placeholder.
- **Bottom placement indicator scan.** The last-import scan now matches markers only in a *code* position (`isImportLine`): the line-leading keywords (`import`, `@import`, `@use`, `@forward`) must start the trimmed line, so an `import ` substring inside a string literal no longer drives placement, and comment lines are skipped. (`require(` is still matched anywhere — a `require(` inside a string literal remains a rare residual false positive.)
- **Inline `url()` insertion.** Inserts at the exact cursor position (line and column) with no trailing newline.
- **Placement default fallback.** Now aligns with the `package.json` default value instead of silently falling to a different position.
- **Markdown bullet lines no longer hijack placement.** A leading `*` (bullets, `*italic*`, `**bold**`) is treated as content, not a comment-continuation — a cursor or drop on the last item of a `*` run no longer lands the import at the first item. Applies to `.md` and `.mdx`, paste and drag-and-drop.
- **Redundant `./../` prefix dropped.** Sibling directories differing only by case (e.g. `src/Components` vs `src/components`) no longer emit `./../Components/Button`; paths that already start with `../` are left untouched.
- **`.jsx → .tsx` imports use JavaScript shapes.** A `.jsx` source pasted or dropped into a `.tsx` file routes through the JavaScript snippet builder (matching `.js`), and the Pick Style picker lists the JS options for that pair.
- **Assets dropped or pasted into Vue, Svelte, and Astro files.** An image, media file, data file, or a `.vue`/`.svelte`/`.astro` component imported into a Vue, Svelte, or Astro file no longer produces a malformed TypeScript named import (`import { $1 } from './logo.png';`). Images, data files, and components now emit a default name import (`import name from '…'`); media and subtitle (`.vtt`) sources emit a url import (`import url from '…'`). Both the inserted snippet and the Pick Style / Set Default Style picker are corrected. Applies to paste and drag-and-drop.
- **Angular auto-naming with unusual filenames.** The Angular-convention import-name autofill (for `.component`/`.directive`/`.pipe`/`.service`/`.module` sources without an exported class) no longer emits invalid syntax when the filename can't form a legal identifier — e.g. a name containing a space or starting with a digit. Such cases now fall back to a `$1` tab-stop placeholder; valid Angular filenames are unaffected.

### Removed
- `vsc-extension-quickstart.md` — scaffold artifact, not relevant to published extension users.
- `webpack`, `webpack-cli`, `ts-loader` — replaced by esbuild.
- `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` — replaced by unified `typescript-eslint`.
- `mocha` (direct devDep) — now pulled transitively via `@vscode/test-cli`.
- `chai`, `sinon` — legacy test-assertion and stubbing libraries; the suite now uses Node's built-in `assert` (commit `f06101f`).
- `vscode-test` — legacy duplicate of `@vscode/test-cli`.
- Seven legacy import shapes removed from style pickers: 4 JavaScript shapes (`{ default as name }`, `var = require()`, `var = import()`, `const = import()`), 1 TypeScript shape (`{ $1 as $2 }`), 1 SCSS shape (`@import url(…)`), and 1 Markdown image shape (reference-style `![alt-text][image]`).
- `DEMO.md` — demo content consolidated into the README.
- `extensionPack` dependency on `drag-import-relative-path` — drag-and-drop is now built-in.

## v0.6.1 (2025-03-28)

### Fixed

- **`./` prefix for same-directory and child-directory imports.** `computeRelativePath()` in `src/utils/relative-path.util.ts` now prepends `./` whenever the source and destination share a directory or the computed relative path does not already start with a `.`, so a path like `components/Button` is emitted as `./components/Button` instead of a bare, ambiguous specifier. Previously the prefix was added only for same-directory imports, leaving child-directory paths without the leading `./`.

## v0.6.0 (2025-03-28)

### Added

- **Automated test suite.** Introduced `src/test/` with Mocha/Chai specs covering the three commands (`copyFilePath`, `copyPaste`, `pasteImport`), import-snippet generation, file-extension parsing, and relative-path math.
- **`SUPPORT.md` and a Support section.** Added a dedicated `SUPPORT.md` and a "Support the Project" donation section (Bitcoin, Solana, Sui, ERC20 addresses) to `README.md` and `DEMO.md`.
- **`"pricing": "Free"` manifest field.** Declared the extension as free in `package.json` for Marketplace display.
- **Empty-snippet guard in paste.** `extension.pasteImport` now short-circuits when the generated snippet is empty or newline-only instead of inserting blank text.

### Changed

- **Renamed all command IDs.** `extension.autoImportPaste` → `extension.pasteImport`, `extension.autoImportCopy` → `extension.copyFilePath`, and `extension.autoImportRelative` → `extension.copyPaste`; titles, keybindings (`cmd/ctrl+i`, `cmd/ctrl+shift+a`, `alt+d`), and internal registrations were updated to match.
- **Restructured the source tree.** Replaced the old `import-snippets/`, `import-statements/`, `providers/`, `subscriptions/`, and `utilities/` folders with `commands/`, `constants/`, `import-handlers/` (split into `scripts/`, `styles/`, `markup/`), and `utils/`, and unified per-directory `index.ts` re-exports.
- **Async import handlers and shared config access.** Reworked the JS/TS/JSX/TSX/CSS/SCSS/HTML/Markdown import handlers into async functions that read settings through a single `getAutoImportSetting` helper, and moved file-path/extension extraction into the VS Code-API-backed `file-path.util.ts` and `relative-path.util.ts`.
- **Raised the minimum VS Code version.** Bumped `engines.vscode` and `@types/vscode` from `^1.76.0` to `^1.98.0`.
- **Modernized the test toolchain.** Switched from `@vscode/test-electron` + `runTest.js` to `@vscode/test-cli` driven by `.vscode-test.mjs` (`npm test` → `vscode-test`), and added `mocha`, `chai`, and `sinon` dev dependencies.
- **Upgraded the build/lint stack.** Moved ESLint to v9 flat config (`eslint src`) and bumped `typescript` (4.9 → 5.7), `@typescript-eslint/*` (5 → 8), `@types/node` (16 → 20), `webpack` (5.75 → 5.98), `webpack-cli` (5 → 6), and `ts-loader`.
- **Rewrote Marketplace metadata.** New extension description, added the `Programming Languages` category, expanded the keyword list, and rewrote every configuration setting's title and description for clarity.
- **Overhauled `README.md` and `DEMO.md`.** Added a table of contents, Features, Quick Start, per-language Configuration sections, and platform-specific keybinding notes.

### Removed

- **Redundant `activationEvents`.** Dropped the explicit `onCommand:*` activation entries from `package.json`; commands self-activate on modern VS Code.
- **Draft documentation variants.** Deleted the interim `README-2.md` and `DEMO-2.md` working drafts after folding their content into the main docs.

## v0.5.4 (2023-03-28)

### Changed

- **Pruned the README settings list.** Removed the `preferences.disableNotifications` entry from the "General settings" section of `README.md`, syncing the docs to a setting no longer present in `package.json`.

### Fixed

- **Dropped a stale setting reference from the docs.** The "Disable all notifications" line for `preferences.disableNotifications` documented a setting the extension no longer exposes; removing it keeps the README in step with the actual configuration surface.

## v0.5.3 (2023-03-28)

### Added

- **`Snippets` Marketplace category.** Added `"Snippets"` alongside `"Other"` in the `categories` array of `package.json`, improving how the extension is classified and discovered on the Marketplace.

### Changed

- **Relocated commands to a `subscriptions/` module.** The three command handlers moved out of `src/commands/` into a new `src/subscriptions/` directory (`copy-command.ts`, `paste-command.ts`, `patch-command.ts`, plus its `index.ts`) and were renamed `copy`/`paste`/`patch` → `copyCommand`/`pasteCommand`/`patchCommand`. `src/extension.ts` updated its imports and `registerCommand` callbacks; the registered command IDs (`extension.autoImportCopy`, `extension.autoImportPaste`, `extension.autoImportRelative`) are unchanged.
- **Pluralized the snippet directories.** Renamed `src/import-snippet/` → `src/import-snippets/` and `src/import-statement/` → `src/import-statements/`, with import paths updated in the affected snippet files and in `src/utilities/import-statement-snippet.ts`. Internal-only refactor with no change to generated import output.

## v0.5.2 (2023-03-28)

### Added

- **Angular directive and pipe import-name derivation.** Extended the Angular-aware naming heuristic in `importName()` (`src/import-statement/javascript-typescript.ts`) so that, alongside `.component` files, paths containing `.directive` or `.pipe` now auto-derive a PascalCase identifier for the named-import style (e.g. `foo.directive` → `FooDirective`, `foo.pipe` → `FooPipe`); all other files still fall back to the `$1` snippet placeholder.

## v0.5.1 (2023-03-28)

### Changed

- **Simplified `notify()`.** `src/utilities/notify.ts` no longer reads the `disableAllDropNotifications` preference; the short-circuit guard was removed from both warning cases (`SameFilePath`, `NotSupported`), so each `showWarningMessage` is emitted unconditionally.
- **Rewrote the Marketplace description.** The extension `description` in `package.json` was shortened and rephrased for clarity.

### Removed

- **`disableAllDropNotifications` setting.** Dropped the `auto-import.preferences.disableAllDropNotifications` boolean from the `package.json` configuration. The drag-and-drop "Same file path" and "Not supported" warnings can no longer be suppressed and now always fire.

## v0.5.0 (2023-03-28)

### Added

- **Ground-up rewrite into a modular source tree.** Replaced the flat `import-text.ts` / `config-enum.ts` implementation with a modular `src/` tree (`commands/`, `import-snippet/`, `import-statement/`, `model/`, `providers/`, `utilities/`) on the VS Code 1.76 engine.
- **Snippet-based insertion with an editable name tabstop.** Imports are now inserted via `SnippetString` / `editor.insertSnippet` rather than as raw text, so script imports drop in with the identifier (`name$1`) pre-selected as a snippet tabstop ready to rename.
- **Wider source-file support for `.jsx`/`.tsx` destinations.** The JSX/TSX snippet builders now accept many more dragged/copied source types — images (`.gif`, `.jpeg`, `.jpg`, `.png`, `.webp`), data (`.json`), scripts (`.js`, `.jsx`), `.html`, YAML (`.yml`, `.yaml`), Markdown (`.md`), fonts (`.woff`, `.woff2`, `.ttf`, `.eot`), and stylesheets (`.css`, `.scss`) — emitting `import name from '…'` for code/asset types and bare `import '…'` for fonts and stylesheets.
- **Image import styles for CSS, SCSS, and HTML.** New `cssImageImportStyle` / `scssImageImportStyle` (`url('_relativePath_')`) and `htmlImageImportStyle` (`<img src="_relativePath_" alt="sample">`) settings, plus an extra SCSS option `@use '_relativePath_' as *;`.
- **Extension pack pairing.** `package.json` now declares an `extensionPack` referencing `ElecTreeFrying.drag-import-relative-path`.

### Changed

- **Reworked the settings namespace to `auto-import.*`.** All configuration moved from `general.*` / `importStatements.*` to `auto-import.preferences.*`, `auto-import.importStatement.script.*`, `…styleSheet.*`, and `…markup.*`, with import-style enums now using the `_relativePath_` placeholder token. `disableNotifications` became `auto-import.preferences.disableAllDropNotifications` (default flipped to `false`), and `importType` became `auto-import.preferences.importStatementPlacement` (Top/Bottom/Cursor; default `Bottom`).
- **Replaced the per-language extension toggles with "Preserve file extension."** The old `withExtnameJS`/`withExtnameTS`/`withExtnameCSS` booleans collapsed into `preserveScriptFileExtension` and `preserveStylesheetFileExtension` (both default `false`).
- **Bumped the engine and toolchain.** Minimum VS Code raised from `^1.57.0` to `^1.76.0`; `@vscode/test-electron` replaces `vscode-test`, and `@types/node` (14 → 16), TypeScript (4.3 → 4.9), ESLint (7 → 8), Mocha (8 → 10), and `@typescript-eslint/*` (4 → 5) were all upgraded.
- **Migrated the bundler from esbuild to webpack.** Build now runs through `webpack` + `ts-loader` (`compile`/`package`/`watch` scripts), and the bundle output moved from `./out/extension.js` to `./dist/extension.js`.
- **Repo housekeeping.** Image/GIF assets moved from `images/` to `assets/` (extension icon now `assets/extension-icon.png`), the Marketplace description and keyword list were expanded (adding `typescript`, `scss`, `angular`, `react`, `vue`, `drag`, etc.), the issues contact email was updated, and the README and DEMO docs were rewritten.

### Fixed

- **Corrected the macOS copy keybinding.** The `extension.autoImportCopy` mac binding was fixed from the malformed `cmd++shift+a` to `cmd+shift+a`.
- **Closed issues [#6](https://github.com/ElecTreeFrying/auto-import-relative-path/issues/6) and [#7](https://github.com/ElecTreeFrying/auto-import-relative-path/issues/7).**

### Removed

- **All third-party runtime dependencies.** The `camelcase` and `relative` packages were dropped; relative-path and filename logic is now self-contained.
- **Discontinued settings.** `general.addSemicolon`, the LESS import style (`lessSupport`), the `.tsx`/Angular `addExportName` toggle, and the per-language `withExtname*` options were removed in the settings rewrite.

## v0.4.8 (2022-08-19)

### Changed

- **Marketplace badges in the manifest.** Added a `badges` array to `package.json` with four VS Code Marketplace badges (version, downloads, installs, rating) pointing at the `ElecTreeFrying.auto-import` listing.
- **README sister-extension link cleanup.** Promoted the "Drag And Drop Import Relative Path Extension" link in `README.md` to its own "Drag and drop import extension" heading and gave the link bold emphasis. No code, command, setting, or supported-language changes shipped in this release — a version bump only across `package.json` / `package-lock.json`.

## v0.4.7 (2022-08-18)

### Added

- **`vsc-extension-quickstart.md` scaffold doc.** Added the quickstart scaffold doc to the repository.

### Changed

- **Merged a long-dormant refactor/toolchain branch onto `master`.** This release lands the cumulative `0.4.4` → `0.4.7` work, modernizing the build and dependencies; no new languages, commands, or import styles ship here, and the README's supported-filetype table is unchanged.
- **Renamed the setting `general.disableNotifs` → `general.disableNotifications`.** The key is renamed in `package.json`, the `ConfigRetrieval` getter, the `Config` interface, and the `section` map. Users who had the old key set must re-enable it under the new name.
- **Bundled with esbuild.** `vscode:prepublish` now runs `esbuild-base -- --minify` (bundling `src/extension.ts` → `out/main.js` as `cjs`/`node` with `vscode` external) instead of plain `tsc`; new `esbuild` and `esbuild-watch` sourcemap scripts were added. `tsc` is retained for `compile`/`watch`.
- **Raised the minimum VS Code version to `^1.57.0`.** `engines.vscode` moved up from `^1.42.0`, with `@types/vscode` and `vscode-test` bumped to match.
- **Enabled strict TypeScript.** `tsconfig.json` flips `strict: false` → `strict: true` and adds `esModuleInterop: true`. Consequent code changes: default-style imports for `relative`, `camelcase`, `path`, `mocha`, and `glob`; `<any>` casts across the config getters; and a new `declarations.d.ts` (`declare module 'relative'`).
- **Upgraded toolchain dependencies.** TypeScript `3.7` → `4.3`, ESLint `6` → `7`, `@typescript-eslint/*` `2` → `4`, Mocha `7` → `8`, `@types/mocha` `7` → `8`, `@types/node` `12` → `14.x`, `camelcase` `5` → `6`, `glob` `7.1.6` → `7.1.7`; `esbuild ^0.12.9` added as a devDependency. `package-lock.json` was regenerated and substantially slimmed.
- **Split out the internal layout.** The `Config` / `Notification` (formerly `Notif`) / `ImportOption` interfaces moved to `src/interfaces/auto-import.interface.ts`, and the settings-key `section` map moved to `src/data/extension-settings.ts` with its keys re-cased from `SHOUTING_CASE` to camelCase. The `Notif.activeTEIsValid` field was renamed `activeEditorIsValid`. Behavior is unchanged.
- **Refreshed the lint and test config.** The ESLint `class-name-casing` rule was replaced with `naming-convention`, and `out` / `dist` / `**/*.d.ts` were added to `ignorePatterns`. Tests switched `assert.equal` → `assert.strictEqual`, and the Mocha runner moved from `useColors(true)` to the `color: true` option (Mocha 8 API).
- **Refreshed the README.** Marketplace status badges were migrated from `vsmarketplacebadge.apphb.com` (`.svg`) to `vsmarketplacebadges.dev` (`.png`); a "Valid Imports" table with per-pair demo links and a cross-link to the companion Drag-And-Drop extension were added; the "Related" section was reworked.

### Removed

- **Cryptocurrency donation section.** Removed the donation section from the README.

## v0.4.4 (2021-06-21)

### Changed

- **Version bump for re-publish.** Bumped `version` from `0.4.3` to `0.4.4` in `package.json` and `package-lock.json`; no source, dependency, or documentation changes ship in this release.

## v0.4.3 (2021-06-21)

### Changed

- **Version bump to `0.4.3`.** Maintenance republish that advances `version` from `0.4.2` to `0.4.3` in both `package.json` and `package-lock.json`; no source, settings, dependency, or `engines` changes ship in this release. The commit is labeled as a fix for the extension not working on other VS Code versions, but the diff carries only the version-number change.

## v0.4.2 (2021-06-21)

### Changed

- **Lowered the minimum VS Code engine to `^1.42.0`.** `engines.vscode` dropped from `^1.57.0` to `^1.42.0` so the extension installs and runs on a much wider range of editor versions.
- **Switched the build off esbuild back to plain `tsc`.** The `esbuild-base`/`esbuild`/`esbuild-watch` scripts were removed and `vscode:prepublish` now runs `npm run compile` (`tsc -p ./`); the `esbuild` devDependency was dropped. Publishing ships the `tsc` output rather than a bundled `out/main.js`.
- **Pinned the toolchain to 1.42-era versions.** Downgraded `@types/mocha` (8 → 7), `@types/node` (14 → 12), `@types/vscode` (1.57 → 1.42), `@typescript-eslint/parser` and `eslint-plugin` (4 → 2), `eslint` (7 → 6), `mocha` (8 → 7), `typescript` (4.3 → 3.7), `vscode-test` (1.5 → 1.3), and the runtime `camelcase` dependency (6 → 5).
- **Relaxed `tsconfig.json` for the older toolchain.** `strict` flipped from `true` to `false` and `esModuleInterop` was removed, which required namespace-style imports (`import * as relative`, `import * as camelcase`, `import * as path`/`Mocha`/`glob`) and explicit casts (`<string>`, `<any>`) across the source.
- **Renamed the notification toggle setting.** `general.disableNotifications` became `general.disableNotifs` (in `package.json`, `config-retrieval.ts`, and `extension.ts`); users who set the old key must re-set it under the new name.
- **Reverted the test runner to the older Mocha API.** The Mocha `color: true` constructor option was replaced with `mocha.useColors(true)`, and the sample test uses `assert.equal` instead of `assert.strictEqual`, for compatibility with Mocha 7.
- **Aligned the ESLint config with `@typescript-eslint` 2.** Swapped the `naming-convention` rule for `class-name-casing` and removed the `ignorePatterns` block in `.eslintrc.json`.
- **Gave the launch configs an explicit runtime.** Both Run Extension and Extension Tests configs in `.vscode/launch.json` now set `runtimeExecutable: "${execPath}"`.
- **Consolidated the type/config definitions.** The `src/interfaces/auto-import.interface.ts` and `src/data/extension-settings.ts` modules were folded back into `config-retrieval.ts` (`Config`, `section`) and `extension.ts` (`Notif`, `ImportOption`); internal refactor with no behavior change.

### Fixed

- **Extension failed to load on other VS Code versions.** The published build targeted `vscode` `^1.57.0`, so installs on older editors refused to activate. The minimum engine is lowered to `^1.42.0` and the activation/command surface is otherwise unchanged.

### Removed

- **`vsc-extension-quickstart.md`.** Removed the Yeoman scaffold artifact, not relevant to published users.
- **`declarations.d.ts`.** Removed the `declare module 'relative'` shim, no longer needed once the module is imported with `import * as relative`.

## v0.4.1 (2021-06-19)

### Changed

- **Version bump and metadata cleanup.** Bumped the package version `0.4.0` → `0.4.1` in `package.json` (and `package-lock.json`), and tidied the Marketplace-facing docs by removing a stray leading blank line in `README.md` and updating the `CHANGELOG.md` header. No code, command, setting, or language-support changes shipped in this release.

## v0.4.0 (2021-06-19)

### Changed

- **Switched the bundler from `tsc` to esbuild.** `vscode:prepublish` now runs a minified esbuild build (`esbuild ./src/extension.ts --bundle --outfile=out/main.js --external:vscode --format=cjs --platform=node --minify`) instead of `npm run compile`. New `esbuild-base`, `esbuild`, and `esbuild-watch` scripts back the dev/watch flows, and `esbuild ^0.12.9` was added as a dev dependency for a smaller, faster production bundle.
- **Raised the minimum VS Code version to `^1.57.0`.** Up from `^1.42.0`, with `@types/vscode` bumped to match; the README install step now reads "Install VS Code v1.57.0 or higher".
- **Enabled strict TypeScript.** `tsconfig.json` flips `strict` to `true` and adds `esModuleInterop: true`. As a consequence, `relative` and `camelcase` are now imported as default imports, the Mocha test runner uses default ESM imports, and a `declarations.d.ts` (`declare module 'relative'`) was added so the untyped `relative` package type-checks.
- **Modernized toolchain dependencies.** `typescript` 3.7 → 4.3, the `@typescript-eslint` parser/plugin 2 → 4, `eslint` 6 → 7, `mocha` 7 → 8 (`@types/mocha` 7 → 8), `@types/node` 12 → 14.x, plus `glob`/`@types/glob`/`vscode-test` bumps; the runtime `camelcase` dependency moved 5 → 6.
- **Reorganized the config and type code.** The `Config`, `ImportOption`, and `Notification` interfaces moved into a new `src/interfaces/auto-import.interface.ts`, and the settings-key map moved into a new `src/data/extension-settings.ts` (its keys renamed from `SCREAMING_CASE` to `camelCase`). The notify type was renamed `Notif` → `Notification` and its `activeTEIsValid` field renamed to `activeEditorIsValid`.
- **Updated the ESLint config.** The removed `@typescript-eslint/class-name-casing` rule was replaced by `@typescript-eslint/naming-convention`, and `ignorePatterns` (`out`, `dist`, `**/*.d.ts`) were added. The Mocha test setup also moved from the deprecated `mocha.useColors(true)` call to the `color: true` constructor option.

### Fixed

- **Renamed the setting `general.disableNotifs` → `general.disableNotifications`.** The "Disable all notifications" preference now uses a clearer, fully-spelled key across the `package.json` contribution, the `ConfigRetrieval` getter, the settings-key map, the `Config` interface, and the README. Users who set the old `general.disableNotifs` key must re-set it under the new name.

### Removed

- **Reworked the README roadmap and donation blocks.** The stale "To do" list (Svelte/Vue/Python/Java/PHP) was removed, and the Bitcoin/NiceHash donation sections were replaced with a single multi-coin (BTC/ETH/USDT/USDC) address table. A scaffold `vsc-extension-quickstart.md` was added.

## v0.3.12 (2020-07-25)

### Added

- **"Donate by Mining" section in the README.** Added a NiceHash mining donation address (`3GJoX9cKs7eUHr6n5LcwNYEkSoD6mEqb1r`) to `README.md`, alongside the existing Bitcoin donation option.

### Changed

- **Version bump to `0.3.12`.** Documentation-only release — no extension code, commands, settings, or supported languages changed; only `package.json` / `package-lock.json` versions and the README were updated.

## v0.3.11 (2020-07-24)

### Added

- **Bitcoin donation option in the README.** A new "Support" section adds a Bitcoin (BTC) donation address alongside an `images/BITCOIN.png` badge.

### Changed

- **Version bump to `0.3.11`.** Republished with the new README; `package.json` / `package-lock.json` advance from `0.3.10`, with no extension code, command, setting, or language-support changes.

## v0.3.10 (2020-07-22)

### Changed

- **Documentation-only release.** No extension code changed; only `README.md`, `DEMO.md`, and `CHANGELOG.md` were updated alongside the `package.json` version bump.
- **Rewrote the usage and demo walkthroughs.** Each demo section in `README.md` and `DEMO.md` now carries numbered steps (`Ctrl+Shift+A` then `Ctrl+I`, or `Alt+D` to auto-import), the `Usage` section was condensed into a two-step list, and the keybinding suffixes (`→ Ctrl+I`, `Alt+D`) were dropped from the demo headings.
- **Fixed and tidied the demo anchor links.** Updated the `usage-example-*` links and section anchors in `README.md` / `DEMO.md` to match the renamed demo headings.
- **Extended the roadmap.** Added Vue (`.vue`) to the "To do" list and tagged the planned Svelte (`.svelte`) and Vue support with target months (Aug./Sept. 2020).

## v0.3.9 (2020-07-18)

### Changed

- **Documentation-only release.** No source, command, setting, keybinding, or dependency changes shipped — `package.json` / `package-lock.json` only bump the version from `0.3.8` to `0.3.9`.
- **Clarified command descriptions in `README.md` and `DEMO.md`.** The `Auto Import: Paste` and `Auto Import: Auto` command-table rows were reworded for precision (e.g. "Paste import in selected tab" → "Paste import statement on selected tab"); the underlying `Auto Import: Copy` / `Paste` / `Auto` commands and their `Ctrl+Shift+A` / `Ctrl+I` / `Alt+D` key bindings are unchanged despite the "renamed commands" commit subject.
- **Linked the usage steps to their demos.** The `README.md` Usage section now points its `Ctrl+I` and `Alt+D` steps at the matching `DEMO.md` walkthroughs, and the `DEMO.md` table-of-contents entries are annotated with their key bindings (e.g. `Import to cursor → Ctrl+I`).
- **Reworded the tagline.** Updated the "alternative solution of drag and drop import" line in both `README.md` and `DEMO.md`.

## v0.3.8 (2020-07-18)

### Changed

- **Tidied the supported-extensions table.** Dropped a trailing empty row from the file-type compatibility table in `README.md`.
- **Version bump to `0.3.8`.** Updated `version` in `package.json` and `package-lock.json`, and merged the changelog header to cover `v0.3.7 - v0.3.8`. No command, keybinding, or runtime behavior changed in this release.

### Fixed

- **Corrected a broken demo anchor link.** In `DEMO.md`, the "Auto import across active tabs" table-of-contents entry now points to the real `#auto-import-across-active-tabs--ctrlshifta--ctrli` section instead of the stale `#Auto-Import-from-text-editor` anchor.

## v0.3.7 (2020-07-18)

### Changed

- **Shortened the three command titles.** Renamed the Command Palette entries to `Auto Import: Copy`, `Auto Import: Paste`, and `Auto Import: Auto` (previously `Auto Import: Copy path`, `Auto Import: Paste relative`, and `Auto Import: Import relative path`) in `package.json`. The underlying command IDs (`extension.autoImportCopy`, `extension.autoImportPaste`, `extension.autoImportRelative`) and keybindings (`Ctrl+Shift+A`, `Ctrl+I`, `Alt+D`) are unchanged.
- **Refreshed README and DEMO for the new titles.** Reworked the `Commands` tables and usage text in `README.md` and `DEMO.md` to the new names, added a supported-file-types table (`.html`, `.md`, `.js`/`.jsx`/`.ts`/`.tsx`, `.css`/`.scss`/`.sass`/`.less`), annotated the position demos with their `Ctrl+I` keybinding, and updated the demo GIF captions and section anchors.

## v0.3.6 (2020-04-23)

### Fixed

- **Broken `DEMO.md` anchor links.** Corrected the two demo table-of-contents links ("Auto import from Explorer" and "Single keybinding import") to GitHub's lowercase, slugified anchor format so they resolve, reordered the Commands and Contents sections, and dropped a stale duplicate Contents list along with two unused reference-link definitions. Documentation only — no behavior change; the version bump to `0.3.6` republishes the corrected README/demo to the Marketplace.

## v0.3.5 (2020-04-23)

### Changed

- **Version bump to `0.3.5`.** `package.json` and `package-lock.json` advanced from `0.3.4` to `0.3.5`; no source, command, setting, or dependency changes shipped (the only other edit was folding `0.3.5` into the shared `v0.3.2 - v0.3.5` `CHANGELOG.md` header).

### Fixed

- **Re-publish after an expired Marketplace token.** Version-only bump to republish the extension to the VS Code Marketplace after the publisher access token had expired; the previous `0.3.4` push could not complete.

## v0.3.4 (2020-04-23)

### Changed

- **Maintenance republish — no functional changes.** Bumped `version` to `0.3.4` in `package.json` and `package-lock.json` with no source or behavior changes; the author's `CHANGELOG.md` note ("publisher token has gone expired") attributes this and the preceding `0.3.2`/`0.3.3` bumps to re-establishing the Marketplace publisher token rather than to any feature or fix.

## v0.3.3 (2020-04-23)

### Changed

- **Version bump only.** Bumped `version` from `0.3.2` to `0.3.3` in `package.json` and `package-lock.json`; no functional, command, setting, language, or dependency changes shipped in this release.

## v0.3.2 (2020-04-23)

### Changed

- **Version bump only.** Bumped `version` to `0.3.2` in `package.json` and `package-lock.json` (a maintenance/republish release); no code, command, setting, supported-language, or dependency changes shipped in this version.

## v0.3.1 (2020-04-23)

### Added

- **Keybinding demo GIFs.** Added `images/keybinding-copy-and-paste.gif`, `images/keybinding-single.gif`, and `images/keybinding-feature.gif`, and a new **Keybindings** section in `DEMO.md` showcasing import from the Explorer (`Ctrl+Shift+A` / `Ctrl+I`), single-keybinding import (`Alt+D`), and import from the text editor.

### Changed

- **Restructured `DEMO.md`.** Reorganized the demo page with a **Contents** table of contents and grouped **Position**, **Keybindings**, **HTML Support**, and **Markdown Support** sections; reformatted the commands table to list `Auto Import: Copy path`, `Auto Import: Paste relative`, and `Auto Import: Import relative path` (`Alt+D`) with clearer descriptions.
- **`README.md` documentation touch-ups.** Fixed the import-styles anchor link, added a "Click here for more usage" link pointing to the `DEMO.md` Keybindings section, and reworded the contributing note. No behavior, command, setting, or supported-language changes — this is a docs/demo release; only the version was bumped to `0.3.1`.

## v0.3.0 (2020-04-04)

### Added

- **One-step "Import relative path" command.** New `extension.autoImportRelative` ("Auto Import: Import relative path"), bound to `Alt+D` in the Explorer (`filesExplorerFocus`), copies a file's relative path and pastes the import into the active editor in a single action — combining what previously required the separate Copy and Paste commands.
- **`html` and `markdown` keywords.** Added to the `package.json` `keywords` list to reflect existing HTML and Markdown support.

### Changed

- **Moved general settings under a `general.` namespace.** `quoteStyle`, `importType`, `addSemicolon`, and `disableNotifs` are now `general.quoteStyle`, `general.importType`, `general.addSemicolon`, and `general.disableNotifs` in `package.json`, and `ConfigRetrieval` reads them via `getConfiguration('general')`. Users with these settings customized must re-set them under the new keys.
- **Simplified the activation events.** The eight `onLanguage:*` triggers were dropped; the extension now activates on its commands only, adding `onCommand:extension.autoImportRelative` alongside the existing paste/copy commands.
- **Adjusted the copy toast wording.** The copy confirmation now reads `Auto Import: Copied: <file>` instead of `Copied: <file>`.
- **Simplified the Markdown image setting labels.** The `markdownImageSupport` default and enum dropped the `Inline style:` / `Reference style:` descriptive prefixes, leaving the bare syntax examples (e.g. `![alt-text](path "Hover text")`).
- **Consolidated the command handlers.** The three commands now delegate to a single parameterized `setup({ copy | paste | import })` routine, and `configObserve()` returns its disposable for registration in `activate()`. No change to generated import output.
- **Internal renames for clarity.** `src/config-retrival.ts` → `src/config-retrieval.ts` (class `ConfigRetrival` → `ConfigRetrieval`, `configEnum` → `section`), and every `config-enum.ts` export lost its `Enum` suffix (e.g. `quoteStyleEnum` → `quoteStyle`).
- **Documentation refresh.** README updated for the new command, the corrected command/settings tables, and a bumped minimum VS Code version (`v1.40.0`); dead `DEMO.md` links removed.

### Fixed

- **`Bottom` import-type typo.** The `general.importType` option formerly spelled `Buttom` is now `Bottom`, in both the settings enum and `config-enum.ts`.
- **Identifier typos.** Corrected mis-typed internal names such as `isHTMLSctive` → `isHTMLActive` and the `activeTE*` locals → `active*`, plus assorted README typos.

## v0.2.6 (2020-03-23)

### Changed

- **Version bump to `0.2.6`.** `package.json` and `package-lock.json` were updated from `0.2.5` to `0.2.6` for the release.

### Fixed

- **Corrected the supported-file-types line in `DEMO.md`.** The demo's "Supported file types" list was missing two entries; `html` and `md` were appended so it reads `js ∙ tsx ∙ ts ∙ tsx ∙ css ∙ scss ∙ sass ∙ less ∙ html ∙ md`. Documentation-only fix — no extension code or language registration changed.

## v0.2.5 (2020-03-23)

### Changed

- **Version bump to `0.2.5`.** `package.json` and `package-lock.json` updated; no runtime, command, setting, or language changes shipped in this release.

### Fixed

- **Broken feature links in `DEMO.md`.** The "Configure import styles" and "Copy and paste like import" entries pointed at in-page anchors (`#Import-statements`, `#heres-my-solution-`) that did not resolve within `DEMO.md`; they now use reference-style links that target the corresponding sections of `README.md` on GitHub.

## v0.2.4 (2020-03-23)

### Changed

- **Version bump to `0.2.4`.** Bumped `version` in `package.json` and `package-lock.json` from `0.2.3`; no extension code or behavior changed in this release.

### Fixed

- **README "Supported file types" typo.** Replaced two stray bullet separators (`•`) around `less` and `html` with the `∙` glyph used for the rest of the list, so the supported-type line reads consistently — `js ∙ tsx ∙ ts ∙ tsx ∙ css ∙ scss ∙ sass ∙ less ∙ html ∙ md`. The set of supported types itself is unchanged.

## v0.2.3 (2020-03-23)

### Fixed

- **`README.md` supported-file-types typo.** The "Supported file types" line was missing `html`, even though HTML script/stylesheet import support had already shipped in v0.2.2; the listing now reads `js ∙ tsx ∙ ts ∙ tsx ∙ css ∙ scss ∙ sass ∙ less • html • md`. Docs-only release — version bumped to `0.2.3` in `package.json` / `package-lock.json` with no code or behavior changes.

## v0.2.2 (2020-03-23)

### Added

- **HTML import destination.** `.html` files are now a supported import destination. Pasting a JavaScript or stylesheet source into an open HTML file inserts the matching tag instead of an ES-module statement. HTML accepts only `.js` and `.css` sources — other source types are gated out for HTML targets.
- **Script tag for `.js → .html`.** A `.js` source pasted into an HTML file emits a `<script type="text/javascript" src="path"></script>` tag at the cursor, driven by the new `importStatements.html.htmlScriptSupport` setting.
- **Stylesheet link for `.css → .html`.** A `.css` source pasted into an HTML file emits a `<link href="path" rel="stylesheet">` tag, driven by the new `importStatements.html.htmlStylesheetSupport` setting.
- **Two new HTML settings.** `importStatements.html.htmlScriptSupport` and `importStatements.html.htmlStylesheetSupport` register in `package.json` and are read live via `config-retrival.ts` (`HTMLScriptEnum` / `HTMLStylesheetEnum` in `config-enum.ts`); `extension.ts` watches both through `onDidChangeConfiguration` so style changes apply without reload.
- **HTML demo asset and docs.** Added `images/html.gif` plus an "HTML Support" section in `DEMO.md` and `README.md`. HTML moved out of the README "TODO" list into a documented feature, and the settings reference gained an `#### HTML` subsection.

### Changed

- **Refreshed the settings-preview screenshot.** README now points at `images/settings.gif` (replacing the removed `images/preview.gif`).
- **Keyed snippet dispatch on the active file type.** `import-text.ts` now records the destination file's extension (`activeExtname`) and routes `.js` / `.css` sources to the HTML builders when the target is `.html`, while the existing JS/TS/CSS/SCSS/LESS/Markdown/image builders are now guarded to fire only for non-HTML destinations.
- **Version bumped to `0.2.2`.** `package.json` and `package-lock.json` updated from `0.2.1`.

### Fixed

- **Markdown image-support description typo.** README setting description corrected from "iamge" to "image".

## v0.2.1 (2020-03-22)

### Fixed

- **Broken Markdown demo links in the README.** The three `DEMO.md` deep links (`[markdown support]`, `[markdown image import]`, `[markdown import]`) used PascalCase anchors (`#Markdown-support`, `#Import-image-to-markdown`, `#Import-markdown`) that did not match GitHub's lowercased heading slugs, so they resolved to nothing — they now point to the correct lowercase fragments (`#markdown-support`, `#import-image-to-markdown`, `#import-markdown`). README whitespace was also tidied. Docs-only change; the `0.2.1` version bump in `package.json` carries no code changes.

## v0.2.0 (2020-03-22)

### Added

- **Markdown file support.** `.md` is now a supported file type: copying a relative path between two Markdown files inserts a Markdown link via the new `extMD` builder in `src/import-text.ts`, controlled by the new `importStatements.markdown.markdownSupport` setting (style `![text](path)`).
- **Image-into-Markdown imports.** Copying an image (`.gif`, `.jpeg`, `.jpg`, `.png`) while a `.md` file is active inserts a Markdown image, driven by the new `extImgMD` builder and the `importStatements.markdown.markdownImageSupport` setting, which offers an inline style (`![alt-text](path "Hover text")`) and a reference style (`![alt-text][image]` with a trailing `[image]: path "Hover text"` definition).
- **New configuration plumbing for Markdown.** Added `markdownEnum` / `markdownImageEnum` to `src/config-enum.ts`, the `markdownSupport` / `markdownImageSupport` fields to the `Config` interface, `configEnum` keys, the `param` map, and two getters in `src/config-retrival.ts`, plus the matching `onDidChangeConfiguration` observers in `src/extension.ts` so the settings apply live.

### Changed

- **Relaxed cross-extension validation for images.** `extension.autoImportPaste` previously required the clipboard and active file to share an extension; it now also accepts an image source dropped into a Markdown file (`imageMDSupport = isMarkdownActive && isImageClipboard`), with `.gif` / `.jpeg` / `.jpg` / `.png` and `.md` added to `validTypes` in `src/extension.ts`.
- **Markdown imports always insert at the cursor.** In `src/import-position.ts`, `pasteImport()` now routes any `.md`/Markdown import to `importToCursor()` regardless of the configured Top/Bottom/Cursor placement, using an internal `markdown` marker that is stripped before insertion.
- **Tidied `.gitignore` and workspace settings.** `.gitignore` gained section headers and a `/images/test` entry, and `.vscode/settings.json` was trimmed to a single `files.exclude` rule.
- **Docs and demo refresh.** Added `DEMO.md` and the `images/markdown.gif` / `images/markdown-image.gif` walkthroughs, and reworked `README.md` (link references, a Markdown section, and a TODO note for HTML support); these are documentation-only and ship no behavior change.

## v0.1.14 (2020-03-21)

### Changed

- **README copy polish.** Minor punctuation cleanup in `README.md` — added trailing periods to the "Select Install Extensions" install step and to the "More extensions of mine" link label (and its matching link definition). No code, command, setting, or behavior changes; the `package.json` version was bumped `0.1.13` → `0.1.14`.

## v0.1.13 (2020-03-20)

### Fixed

- **`README.md` keybinding typo.** Corrected the documented shortcut for copying a relative path from `Ctrl+Shit+A` to `Ctrl+Shift+A`; docs-only, no behavior change (version bumped to `0.1.13` in `package.json`).

## v0.1.12 (2020-03-20)

### Fixed

- **Corrected the keybinding typo in the README Commands table.** The `Copy path` shortcut was misspelled `Ctrl+Shit+A`; it now reads `Ctrl+Shift+A`, matching the actual binding. The surrounding markdown table separators and column padding in `README.md` were tidied up at the same time. Docs-only patch release — the version bump in `package.json` and `package-lock.json` (`0.1.11` → `0.1.12`) carries no source, command, setting, language, or dependency changes.

## v0.1.11 (2020-03-19)

### Fixed

- **Broken in-page README navigation.** Corrected the "Copy and paste like import" table-of-contents link in `README.md` (`#Heres-my-solution` → `#heres-my-solution-`) so it resolves to the rendered heading anchor instead of dead-ending.

## v0.1.10 (2020-03-19)

### Changed

- **Renamed the README settings heading.** `## Extension Settings` became `## Configuration Settings`, and a couple of trailing-whitespace trims were applied to the supported-file-types line and the "Import to cursor" demo heading.

### Fixed

- **`README.md` in-page navigation links.** The "Copy and paste like import" entry in the table of contents pointed at an anchor (`#Here's-my-solution`) whose apostrophe didn't match the generated heading slug, so the link didn't jump; corrected to `#Heres-my-solution`.

## v0.1.9 (2020-03-19)

### Changed

- **Broadened the workspace ignore globs.** `.vscode/settings.json` `files.exclude` now hides `**/out`, `**/node_modules`, `**/.vscode-test/`, and `**/*.vsix` from the editor (developer-only config; no effect on the published extension).

### Fixed

- **Stale settings-preview GIF.** The "Settings Preview" image in `README.md` was showing the old animation; the asset was refreshed and renamed `images/settings.gif` → `images/preview.gif`, with the README reference re-pointed to it.

## v0.1.8 (2020-03-19)

### Changed

- **Refreshed the settings preview animation.** Regenerated `images/settings.gif` (the README/Marketplace demo) so it reflects the current settings UI; no functional changes ship in this release.

## v0.1.7 (2020-03-19)

### Changed

- **Expanded the README with Features and Demo sections.** Added a `## Features` list (linking to import-styles config, copy-paste import, and the three placements) and a `## Demo` section embedding three new screencasts — `images/cursor.gif`, `images/bottom.gif`, and `images/top.gif` — for import-to-cursor, import-to-bottom, and import-to-top. The settings reference was also re-leveled (`Import statements > X` headings flattened to `#### X` subsections under a single `### Import statements`).

### Fixed

- **No blank line on import-to-cursor.** `importToCursor()` in `src/import-position.ts` now inserts `this.importText.trim()`, stripping the trailing newline so an "Import to cursor" no longer leaves an empty line above the snippet. The top and bottom insert paths are unchanged.

## v0.1.6 (2020-03-18)

### Changed

- **Notifications now disabled by default.** The `disableNotifs` setting default flipped from `false` to `true` in `package.json`, so notifications on file drop to the active pane are off out of the box.
- **Clearer extension description.** The `package.json` `description` now reads "Auto import relative path without typing long and tedious import statements and file paths." (was "Auto import without...").
- **Author metadata added.** Added an `author` block (`John James Ermitaño`) to `package.json`.

### Fixed

- **Documentation refresh.** Updated `README.md` usage steps, capitalization, and Marketplace badges (added an installs badge, normalized the badge URLs), and pointed the changelog link at the GitHub `CHANGELOG.md` instead of the Marketplace page.

### Removed

- **`closeAllNotif` setting.** Dropped the "Close all active notifications on Escape keydown" configuration entirely — removed from the `package.json` contribution, the `Config` interface, the `configEnum.CLOSEALLNOTIF` key and getter in `src/config-retrival.ts`, and the change observer in `src/extension.ts`.

## v0.1.5 (2020-03-16)

### Changed

- **Renamed the extension to "Auto Import Relative Path".** The Marketplace `displayName` changed from `Auto Import Path` to `Auto Import Relative Path`, and the settings `configuration.title` from `Auto Import` to `Auto Import Relative Path`, to better describe what the extension does. The underlying package `name` (`auto-import`) and `publisher` (`ElecTreeFrying`) were left unchanged — a full package rename is still pending.
- **Moved the repository to `auto-import-relative-path`.** The `homepage`, `repository.url`, and `bugs.url` in `package.json` (and the GitHub Issues link in `README.md`) were repointed from the old `ElecTreeFrying/auto-import` repo to `ElecTreeFrying/auto-import-relative-path`.
- **Expanded the search keywords.** Added `relative` and `path` to the `keywords` array in `package.json` (alongside the existing `auto`, `import`, `javascript`, `css`).
- **Rebranded the README.** The title, Marketplace badge labels, and tagline in `README.md` were updated to the new "Auto Import Relative Path" name.

## v0.1.4 (2020-03-16)

### Changed

- **Renamed the extension to "Auto Import Path."** The Marketplace `displayName` in `package.json` and the `README.md` title were changed from "Auto Import" to "Auto Import Path"; the internal package `name` (`auto-import`), `publisher`, and `description` were left untouched. Recorded in `CHANGELOG.md` as an interim "Change extension name" note (the final name was still being decided).
- **Version bump only.** `package.json` and `package-lock.json` bumped `0.1.3` → `0.1.4`; no code, command, setting, supported-language, or dependency changes shipped in this release.

## v0.1.3 (2020-03-16)

### Fixed

- **`Auto Import: Copy` no longer steals focus to the Explorer.** The `extension.autoImportCopy` command dropped its `workbench.files.action.focusFilesExplorer` call, so copying a file path now respects the file you are focused on in the editor instead of forcing the Files Explorer to the front before running `copyFilePath`.

## v0.1.2 (2020-03-15)

### Changed

- **Renamed the settings-page title to "Auto Import".** The extension's `configuration.title` in `package.json` changed from `auto-import` to `Auto Import`, so the group now reads as a proper display name in the VS Code Settings UI. No commands, behavior, supported languages, or dependencies changed in this release.

## v0.1.1 (2020-03-15)

### Changed

- **New extension icon.** Replaced `images/github.png` (the icon referenced by `package.json`) with an updated graphic.
- **Version bump.** Bumped `version` to `0.1.1` in `package.json` and `package-lock.json`.

### Fixed

- **Commands table now renders on the Marketplace.** Rewrote the Commands table in `README.md` as a proper pipe-delimited Markdown table (with header separator and outer borders) so it displays correctly instead of as plain text.
- **Version badge fixed.** Switched the Marketplace version badge in `README.md` from the `version-short` to the full `version` `vsmarketplacebadge` URL.

## v0.1.0 (2020-03-15)

### Added

- **New `Auto Import: Copy path` command.** A dedicated `extension.autoImportCopy` command, bound to `cmd/ctrl+shift+a` and active in both the editor and the Explorer (`editorTextFocus || filesExplorerFocus`). It focuses the Files Explorer, runs VS Code's built-in `copyFilePath`, and validates the result against the supported `scripts`/`styles` extensions before writing it to the clipboard.
- **Copy confirmation toast.** A successful copy now shows a `Copied: <basename>` information message so it's clear which file's path was placed on the clipboard.
- **`onCommand` activation for the new command.** `onCommand:extension.autoImportCopy` added to `activationEvents` in `package.json`.

### Changed

- **Renamed `Auto Import` to `Auto Import: Paste relative`.** The paste command id changed from `extension.autoImport` to `extension.autoImportPaste` (still bound to `cmd/ctrl+i`), with its command title and `onCommand` activation event updated to match.
- **Moved path math into `ImportText`.** The relative-path resolution, `./` same-directory prefixing, and `extname` extraction were lifted out of `extension.ts`'s `setup()` and into the `ImportText` constructor, whose signature changed to `(param, toPath, fromPath)`. `extension.ts` no longer imports the `relative` module directly.
- **Tightened notification handling.** Both commands now call `notifications.clearAll` before running to clear stale popups, and the `notify()` invalid-import branch was rewritten around explicit "both" / "either" source/destination validity checks.
- **README overhaul.** Marketplace version/downloads/ratings badges, a Key Binding / Command / Description table, sectioned settings headings, a refreshed usage demo (`images/playback.gif`), a new settings-preview clip (`images/settings.gif`), and Changelog / Contributing / Related sections.

## v0.0.6 (2020-03-15)

### Fixed

- **`TypeError: camelcase_1.default is not a function` on every import.** `src/import-text.ts` imported the `camelcase` package as a default import (`import camelcase from 'camelcase'`), which transpiled to a `camelcase_1.default(...)` call that was `undefined` at runtime — so the PascalCase import-name derivation (`camelcase(importName, { pascalCase: true })`) crashed whenever the `extension.autoImport` command ran. Switched to a namespace import (`import * as camelcase from 'camelcase'`) so the CommonJS callable resolves correctly.
- **`camelcase` missing from `dependencies`.** The package was imported in source but never declared as a runtime dependency; added `camelcase` `^5.3.1` to `dependencies` (and `@types/camelcase` `^5.2.0` to `devDependencies`) so a clean install ships the module.

### Removed

- **Stray `console.clear()` on each run.** Dropped the `console.clear()` call at the top of the `extension.autoImport` handler in `src/extension.ts`, which wiped console output every time the command was invoked.

## v0.0.5 (2020-03-15)

### Added

- **`importType` setting to control where the import is pasted.** New string setting (enum `Top` / `Buttom` / `Cursor`) chooses whether the generated statement lands at the top of the import list, at the bottom of it, or on the currently selected line.
- **`ImportPosition` insertion engine.** New `src/import-position.ts` houses an `ImportPosition` class with three strategies dispatched by `pasteImport()`: `importToTop()` inserts at line 0, `importToCursor()` inserts at the selection's anchor line, and `importToBottom()` scans the document for import/`require`/`import()`/`@import`/`@use` indicator lines and inserts after the last one found.

### Changed

- **Auto Import now delegates insertion to `ImportPosition`.** `setup()` in `src/extension.ts` no longer reopens the document via `showTextDocument` and hardcodes the statement at position `(0,0)`; it constructs an `ImportPosition` and calls `pasteImport()`, so placement honors the new `importType` setting. The setting is also wired into the live `onDidChangeConfiguration` handler (via the `IMPORTTYPE` key) so changes apply without reload.
- **Plumbed `importType` through the config layer.** Added `importTypeEnum` in `src/config-enum.ts`, the `importType` field on the `Config` interface, the `IMPORTTYPE` key, and an `importType` getter in `src/config-retrival.ts`.
- **Config-retrieval cleanup.** Removed the unused `*DefaultValue` getters across `src/config-retrival.ts` and dropped the commented-out `importPosition` / `importCursor` scaffolding.

### Fixed

- **Console cleared per run.** The `extension.autoImport` command now calls `console.clear()` at the start of each invocation.

## v0.0.4 (2020-03-14)

### Fixed

- **Version-numbering consistency.** Bumped the package `version` to `0.0.4` in `package.json` and `package-lock.json` and corrected the `CHANGELOG.md` history, where a prior release had been mislabeled `v0.0.2` (it was `v0.0.3`) and the original `v0.0.2` entry carried the wrong date. No code or behavior changes.

## v0.0.3 (2020-03-14)

### Added

- **`bugs` field in `package.json`.** Declared a contact email and the GitHub issues URL (`https://github.com/ElecTreeFrying/auto-import/issues`) so the Marketplace listing surfaces a report-an-issue link.

### Changed

- **Tightened every setting description.** Reworded all `importStatements.*` and top-level setting descriptions in `package.json` and `README.md` to be terser (e.g. "Select **.js** import style", "Toggle semicolon...", and `addExportName` now reads "(Angular/.tsx)" instead of the prior HTML-laden "(Angular)<br/>*same behaviour applies in .tsx files.*").
- **README polish.** Renamed the title from "Auto-import" to "Auto Import", restructured the headings (Supported file types / Usage / Extension Settings), and clarified the copy-then-paste workflow; supported file types remain JS, JSX, TS, TSX, CSS, SCSS, SASS, LESS.
- **Source formatting pass.** Added block braces to single-line `if`/`return` statements and reordered the field assignments in `ImportText`'s constructor in `src/extension.ts` and `src/import-text.ts`; no behavior change.

## v0.0.2 (2020-03-13)

### Added

- **First functional release.** Replaced the prior `0.0.1` Yeoman hello-world scaffold (`extension.helloWorld`, placeholder metadata) with a working auto-import extension and published it to the Marketplace.
- **Auto Import command.** A single `extension.autoImport` command ("Auto Import") that inserts a relative-path import for a previously copied file. Workflow: copy a file's path from the Explorer tree view (`Shift+Alt+C`), then run the command in the destination editor — the import statement is generated and inserted at the top of the file (`Position(0,0)`).
- **Keybinding and Command Palette entry.** Bound to `ctrl+i` / `cmd+i` (active only when `editorTextFocus`), and also reachable via the Command Palette as *Auto Import*.
- **Eight supported file types.** Both source and destination may be `.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.scss`, `.sass`, or `.less`. The command only fires when both files are a supported type, share the same extension, and are not the same file.
- **Relative-path computation.** Uses the newly added `relative` dependency to compute the path between destination and source, normalizes Windows `\` separators to `/`, and prefixes `./` for same-directory siblings. The file extension is stripped from the emitted path by default.
- **Per-language import-style settings.** `importStatements.javascript.jsSupport` / `jsxSupport` (15 shapes each, from `import … from ''` through `require()` and dynamic `import()` variants), `importStatements.typescript.tsSupport` / `tsxSupport` (5 shapes each), and `importStatements.stylesheet.cssSupport` (`@import` / `@import url()`), `scssSupport` (adds `@use`), and `lessSupport` (`@import` / `@import ()`). SCSS/SASS share the SCSS builder; `.sass` routes to the same shapes as `.scss`, and leading `_` is stripped from SCSS partial paths.
- **Formatting and Angular settings.** `quoteStyle` (single vs. double quotes), `addSemicolon` (trailing `;`), the `withExtnameJS` / `withExtnameTS` / `withExtnameCSS` toggles (append the file extension to the path), and `addExportName` (include a PascalCase component name in TS/TSX imports, for Angular). The component name is derived from the filename via `camelcase`.
- **Notification settings.** `disableNotifs` and `closeAllNotif` configuration keys, plus contextual warning/error toasts for *No active pane*, *Same file path*, and *Invalid import*.
- **Live configuration reload.** A `workspace.onDidChangeConfiguration` listener updates the in-memory settings whenever any of the extension's configuration keys change, so edits take effect without a reload.
- **Activation events.** `onCommand:extension.autoImport` plus `onLanguage:*` events for all eight supported languages.
- **Marketplace metadata and assets.** Publisher `ElecTreeFrying`, display name "Auto Import", description, `MIT` license, extension icon, keywords, gallery banner, and repository URL added to `package.json`; `LICENSE.md`, a README rewrite, and `images/github.png` + `images/playback.gif` demo assets added.

### Changed

- **Version bump and homepage.** Bumped `version` from `0.0.1` to `0.0.2` in `package.json` / `package-lock.json`, and added a `homepage` field pointing at the GitHub README.

### Removed

- **Scaffold artifacts.** Dropped the generator's `vsc-extension-quickstart.md` and the placeholder `extension.helloWorld` command / "auto-import" + "test" metadata from the original scaffold.

## v0.0.1 (2020-03-05)

### Added

- **Initial project scaffold.** First commit ("add: working base") establishes the extension from the standard VS Code generator template — not yet the relative-path import tool it would later become.
- **`extension.helloWorld` command.** The sole contributed command ("Hello World"), activated via `onCommand:extension.helloWorld`; `src/extension.ts` logs an activation message and shows a "Hello World!" information message.
- **TypeScript build pipeline.** `tsc -p ./` compiles `src/` to `out/`, with `compile`, `watch`, `pretest`, and `vscode:prepublish` npm scripts; `tsconfig.json` and `main` point at `./out/extension.js`.
- **Lint setup.** ESLint with `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` via `.eslintrc.json` and the `lint` script (`eslint src --ext ts`).
- **Test harness.** Mocha + `vscode-test` integration scaffolding — `src/test/runTest.ts`, `src/test/suite/index.ts`, and a placeholder `src/test/suite/extension.test.ts` — wired to the `test` script.
- **Editor and packaging config.** `.vscode/` files (`launch.json`, `tasks.json`, `settings.json`, `extensions.json`), `.vscodeignore`, `.gitignore`, baseline `package.json` (`auto-import`, engine `vscode ^1.42.0`, category `Other`), and a generated `package-lock.json`.
