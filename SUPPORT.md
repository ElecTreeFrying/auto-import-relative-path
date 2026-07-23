# Support & Contributing — Auto Import Relative Path

Where to get help, how to diagnose common issues, and how to contribute. For features and configuration see the [README][README]; for the full specification see [SPEC.md][SPEC].

[README]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/main/README.md
[SPEC]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/main/SPEC.md

---

## Table of Contents

- [Quick Links](#quick-links)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Troubleshooting](#troubleshooting)
- [Reporting a bug](#reporting-a-bug)
- [Feature requests](#feature-requests)
- [Contributing](#contributing)
  - [Setup](#setup)
  - [Adding a new file-type pair](#adding-a-new-file-type-pair)
  - [Adding a new file extension](#adding-a-new-file-extension)
  - [Tests](#tests)
- [Support the project](#support-the-project)

---

## Quick Links

| Resource                    | What you'll find                                                  |
|-----------------------------|-------------------------------------------------------------------|
| [README][README]            | Feature overview, commands, full configuration reference           |
| [SPEC.md][SPEC]             | Full specification — commands, extensions, styles, placement, path logic |
| [CHANGELOG][CHANGELOG]      | Release notes and version history                                 |
| [GitHub Issues][issues]     | Bug reports, feature requests, questions                          |
| [VS Code Marketplace][marketplace] | Install page, reviews, version listings                    |

[CHANGELOG]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/main/CHANGELOG.md
[issues]: https://github.com/ElecTreeFrying/auto-import-relative-path/issues
[marketplace]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

---

## Frequently Asked Questions

### Does this extension send my data anywhere?

**No.** It is 100% local — no telemetry, no network calls, no AI. The whole bundle is ~10 KB gzipped, and you can read every line of the [source on GitHub][source].

[source]: https://github.com/ElecTreeFrying/auto-import-relative-path/tree/main/src

### Is it compatible with Cursor / VSCodium / Code Server?

**Yes.** The extension uses only the public VS Code API. It runs in any host that implements the API at engine `^1.97.0` or later — including Cursor, VSCodium, Code Server, and other forks.

### Does it work in monorepos / pnpm / Yarn workspaces?

**Yes,** with a caveat. The extension treats every file as just a path on disk and computes the relative path between two files — it has no concept of package boundaries. If you're importing across packages and your build prefers package-name imports (e.g. `@org/pkg/util`), the extension won't deduce that for you. It will give you the correct `../../packages/pkg/util` relative path instead.

### How do Vue / Svelte / Astro imports work?

All three are fully supported destinations. Script sources (`.ts` / `.tsx` / `.js` / `.jsx`) use the **TypeScript import style**. Non-script sources get an asset-shaped import keyed on the source type — images, data (`.json` / `.yml` / `.yaml`), and `.md` / `.mdx` (Markdown/MDX as components) emit a default name import (`import name from './…';`); a `.vue` / `.svelte` / `.astro` component instead emits a **PascalCase** default import (`my-button.vue` → `import MyButton from './my-button.vue';`) — into its own framework (self-imports included), with `.vue` / `.svelte` also accepted into Astro (Islands) — while media and `.vtt` text tracks emit a url import (`import url from './…';`). **Stylesheet sources (`.css` / `.scss`) are shaped by where the cursor sits:** inside a `<style>` block they become the CSS/SCSS dialect (`@import` for `.css`, `@use` for `.scss`, configurable via the same `cssImportStyle` / `scssImportStyle` settings); anywhere else — the `<script>` block, Astro frontmatter, or template — they become a side-effect `import './styles.css';`. Import placement is automatically constrained to the correct region:

- **Astro** — inside the `---` frontmatter fences
- **Vue** — inside the `<script setup>` block (or `<script>` if no setup block exists)
- **Svelte** — inside the `<script>` block
- **A stylesheet in a `<style>` block** — beside that block's other `@import` / `@use` rules (a mixed multi-file selection stays script-side)

If no frontmatter or script block exists, one is created at line 0 automatically (a `<style>` block is never fabricated — without one, the script-side side-effect import is already correct). Inserted imports also **match the surrounding indentation** — the extension reads the indentation of existing lines inside the frontmatter, `<script>`, or `<style>` block (or inherits the block's own indentation when it's empty), so generated imports line up with your code. See [README — §Supported Languages](README.md#supported-languages) and [SPEC — §Framework component destinations](SPEC.md#framework-component-destinations) for the full accepted-source lists.

### How do LaTeX imports work?

LaTeX (`.tex`) is a fully supported destination with its **own** style settings. The source extension picks the relationship:

- **Graphics** (`.pdf` / `.png` / `.jpg` / `.jpeg` / `.eps`) → a `figure` float by default (`\begin{figure}…\includegraphics…\caption…\label…\end{figure}`), or a bare / sized `\includegraphics`. Web-only formats (`.svg` / `.gif` / `.webp` / `.avif`) are rejected — `pdflatex` can't render them.
- **`.tex`** → `\input{…}` (default) or `\include{…}`; the `.tex` extension is dropped.
- **`.bib`** → `\addbibresource{…bib}` (modern biblatex, default) or `\bibliography{…}` (legacy BibTeX).

Imports land in the document **body** at the cursor — never the preamble (line 0). The graphics extension is **kept** by default; toggle `auto-import.importStatement.latex.preserveGraphicsFileExtension` to drop it. See [README — §LaTeX](README.md#latex) and [SPEC — §LaTeX](SPEC.md#latex).

### Why are some configurations single-option dropdowns?

HTML stylesheet (`<link>`), Markdown link (`[text](path)`), and CSS/SCSS image (`url('…')`) shapes each have a single canonical form. The dropdowns exist for VS Code settings-UI parity. They will gain options as soon as multiple are sensible. If you want a different default, [open an issue][issues] with your preferred shape.

### Why does the import shape change when I switch destination files?

Because the **destination decides the syntax**. Pasting into `.scss` produces `@use`; pasting into `.html` produces `<script>` or `<link>`; pasting into `.tsx` produces an ES module `import`. The source extension is one input; the destination is the other. The extension's job is to pick the right shape automatically.

### Why do `.module.css` / `.module.scss` imports look different from plain `.css`?

CSS Modules are special-cased for JSX / TSX / MDX destinations — and, in the **script region**, for Vue / Svelte / Astro. A `.module.css` or `.module.scss` source emits a **default import** — `import styles from './Button.module.css';` (where `styles` is an editable placeholder) — because that binding is what exposes the generated class map (`styles.button`). A plain `.css` / `.scss` source into the same destination stays a **side-effect import** (`import './Button.css';`), since there's no binding to consume. (Inside a Vue / Svelte / Astro `<style>` block, a `.module.css` source takes the plain `@import` shape instead — the class-map binding is a script-side idiom.)

### Does drag-and-drop work from the Explorer?

**Yes.** Drag any supported source file from the Explorer sidebar and drop it into an open editor. The extension generates the same import snippet as the paste commands. Unsupported pairs are rejected with the same "Cannot import" warning. No keybinding or setting needed — it uses the same style configuration and placement setting as the paste commands.

### Can I rebind `Ctrl+I` / `Cmd+I`, `Ctrl+Shift+A` / `Cmd+Shift+A`, or `Alt+D`?

**Yes.** Open VS Code's keyboard shortcuts editor (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>K</kbd> <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>S</kbd>), search for `extension.copyFilePath`, `extension.pasteImport`, or `extension.copyPaste`, and rebind. Useful if `Cmd+I` clashes with another extension you use.

The five palette-only commands — `extension.pasteImportWithStyle`, `extension.setDefaultImportStyle`, `extension.setImportPlacement`, `extension.togglePreserveScriptExtension`, and `extension.resetImportStyles` — have no default keybinding; assign one from the same editor if you use them often.

### How do I pick an import style without changing my default?

Run **Auto Import: Paste as Import (Pick Style)** from the Command Palette (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) — or click *Paste with Style* on the "Copied …" toast that appears after Copy. A QuickPick opens with every import shape accepted for the current source/destination pair. Pick one and it's inserted once; your `*ImportStyle` settings are not modified.

### How do I change my default import style without opening Settings?

Run **Auto Import: Set Default Import Style** from the Command Palette. The QuickPick lists every style for the current source/destination pair (e.g. open a `.ts` file with a `.ts` source on the clipboard to set your TypeScript default). Your current default is marked with a check and pinned to the top. The chosen style is written to your global VS Code User settings.

Some destinations don't have a configurable default — HTML stylesheet, Markdown link, and CSS/SCSS image references all use a single hardcoded shape. The command shows a "No configurable style" warning in those cases.

### Can I import a folder (barrel) instead of a file?

**Not directly.** The extension targets individual files. If you have an `index.ts` barrel, copy that file specifically. There is no `dir → import './dir';` shortcut yet — [open an issue][issues] if you'd like one.

### Why does my import path not show file extensions (or always show them)?

By default, JS / TS / JSX / TSX imports omit the file extension (matching ecosystem convention) and CSS / SCSS imports omit the extension (matching the most common style). Toggle one of these settings to change the behaviour:

- `auto-import.importStatement.script.preserveScriptFileExtension`
- `auto-import.importStatement.styleSheet.preserveStylesheetFileExtension`

Note: `.css` extensions are **always** preserved inside `.scss` imports — Sass requires the extension to recognise a foreign-language import.

---

## Troubleshooting

Each section below is **symptom → cause → fix**. If your issue isn't here, [open an issue][issues].

### Drag-and-drop doesn't generate an import

**Causes:**

- The destination file language isn't in the 13 supported destination languages.
- The source/destination pair isn't supported — the same gating rules apply as for the paste commands.
- For a **`.tex`** destination: VS Code has no built-in LaTeX language, so the drop matches `.tex` by file pattern (not language) — this works regardless of whether a LaTeX extension is installed; if it still doesn't fire, confirm the file is saved to disk (the provider is `scheme: 'file'` only).

**Fix:** Check the [supported languages table][langs]. The drop provider uses the same gating as the paste commands.

---

### Nothing happens when I press the keybinding

**Causes:**

- No file is **selected** in the Explorer panel (click a file — having one visible isn't enough).
- For `Paste as Import` and `Insert Import from Selected File`, no editor tab is open or focused.
- The source / destination extension pair isn't supported.

**Fix:** Select a file in the Explorer, make sure an editor tab is focused, and check the [supported languages table][langs] in the README. If your pair *should* be supported, [open an issue][issues].

[langs]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/main/README.md#supported-languages

---

### "Cannot import … into … files" notification appears

**Cause:** The source extension is not allowed for the active editor's destination. The most common cases:

- `.js` and `.ts` destinations accept their own extension **plus framework components** (`.vue` / `.svelte` / `.astro`); every other cross-extension source is rejected — use `.jsx` or `.tsx` destinations for asset imports.
- `.html` → `.html` is explicitly rejected (HTML has no relative-import syntax for embedding itself).
- A typo or unusual extension that's not in the gating tables.

**Fix:** Check the [supported languages table][langs]. If your pair *should* be supported, [open an issue][issues] with your source / destination extensions.

---

### "A file cannot import itself" notification appears

**Cause:** The file selected in the Explorer is the same file open in the active editor (case-insensitive comparison).

**Fix:** Pick a different source file. Self-imports are rejected — there's no scenario where they're useful.

---

### Import is placed at the wrong line

**Cause:** Your `auto-import.preferences.importStatementPlacement` setting is `Top`, `Bottom`, or `Cursor`, and the inserter is doing exactly what you told it to.

**Fix:** Change the setting (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>,</kbd>, search `auto-import`).

> **Note:** For `.html`, `.md`, and `.tex` destinations, and when importing a non-stylesheet into a stylesheet, placement is **always** forced to `Cursor` regardless of the setting. Those contexts don't have an "import block" to attach to — for LaTeX, line 0 is the preamble, so a figure / `\input` belongs in the body at the cursor. **`.mdx` is the exception among Markdown files:** it respects your `Top` / `Bottom` / `Cursor` setting like a script file (only `.md` is force-cursored), while still treating a leading `*` as prose rather than a comment.

---

### "Bottom" placement always lands at line 0

**Cause:** "Bottom" appends after the *last recognised* import line. The detector looks for any of nine markers — `import `, `require(`, `@import '`, `@import "`, `@import url(`, `@use '`, `@use "`, `@forward '`, `@forward "` (single- and double-quote variants both count) — skipping comment lines that start with `//`, `/*`, or `*`. If none are found, it falls back to line 0.

**Fix:** Add at least one import line manually to seed the file. Subsequent inserts will then anchor correctly to the bottom of the import block.

---

### File extension is included (or missing) in the import path

**Causes and fixes:**

- For `.js` / `.ts` / `.jsx` / `.tsx`, toggle `auto-import.importStatement.script.preserveScriptFileExtension`.
- For `.css` / `.scss`, toggle `auto-import.importStatement.styleSheet.preserveStylesheetFileExtension`.

**Special case:** `.css` extensions are **always preserved** when imported into a `.scss` file — Sass requires the extension to distinguish a plain-CSS import from a Sass import. The setting has no effect there. This is by design and matches Sass convention.

---

### TypeScript shows a PascalCase name instead of a placeholder

**Cause:** This is the Angular auto-fill, and it's intentional. When the `import { name }` style is selected and the source filename contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the extension derives a PascalCase identifier from the basename automatically (e.g., `app-root.component.ts` → `{ AppRootComponent }`).

**Fix:** Switch to a different TypeScript shape (`import name from './path';` is the closest equivalent) if you don't want this. The auto-fill only triggers on the `import { name }` shape — every other shape uses a placeholder unconditionally.

---

### SCSS partial filename has the leading underscore stripped

**Cause:** Intentional. Sass resolves `@import './variables'` to `_variables.scss` automatically, and including the underscore in the import path is non-idiomatic.

**Fix:** None needed; this matches Sass convention. If you genuinely want to keep the underscore, [open an issue][issues] so we can discuss a setting for it.

---

### Import path uses backslashes on Windows

**Cause:** Likely a regression — the extension always normalises to forward slashes regardless of platform. Windows backslashes should never appear in the output.

**Fix:** [Open an issue][issues] with your VS Code version, OS version, the source path, and the destination path so we can reproduce.

---

### A keybinding clashes with another extension

**Cause:** Another extension or keymap binds the same combo (`Ctrl+I`, `Ctrl+Shift+A`, or `Alt+D`).

**Fix:** Rebind from VS Code's keyboard shortcuts editor (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>K</kbd> <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>S</kbd>). The command IDs to search for are `extension.copyFilePath`, `extension.pasteImport`, and `extension.copyPaste` — the only three with default keybindings. The five palette-only commands (`extension.pasteImportWithStyle`, `extension.setDefaultImportStyle`, `extension.setImportPlacement`, `extension.togglePreserveScriptExtension`, `extension.resetImportStyles`) accept assignments from the same editor if you want to give them a key.

---

## Reporting a bug

[Open an issue][issues] and include:

1. **Extension version** (visible in the Extensions panel — click the gear icon → *About*).
2. **VS Code version** (`Help → About` or <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> → *About*).
3. **OS and version** (e.g. macOS 14.5, Windows 11, Ubuntu 24.04).
4. **Source file extension and destination file extension** (e.g. `.scss` source → `.html` destination).
5. **Steps to reproduce** — ideally a minimal directory tree and the exact keybinding sequence.
6. **Expected vs. actual** behaviour — paste the actual generated snippet (or "no output").
7. **Screenshot or screen recording** if the problem is visual.

The faster the reproducer, the faster the fix.

---

## Feature requests

Open an issue labelled **enhancement** on [GitHub Issues][issues]. Include:

- The workflow it would improve (the *why*, not just the *what*).
- Which file types are involved (source extension, destination extension).
- An example of the snippet you'd want generated.

---

## Contributing

### Setup

```bash
git clone https://github.com/ElecTreeFrying/auto-import-relative-path.git
cd auto-import-relative-path
npm install
```

Press <kbd>F5</kbd> inside VS Code to launch an Extension Development Host with the extension loaded. The default build task (`npm: watch`) starts automatically and rebuilds on every save.

See [README — §Commands & Keybindings](README.md#commands--keybindings) for the full command table and [SPEC.md](SPEC.md) for the detailed architecture specification. Each `src/<dir>/` also has its own `CLAUDE.md` (architecture invariants) for directory-specific guidance.

### Adding a new file-type pair

To accept a new source extension for an existing destination (e.g. `.yaml` for `.html`):

1. **`src/constants/extensions.ts`** — add the source to the matching `*_SUPPORTED_EXTENSIONS` table (`HTML_SUPPORTED_EXTENSIONS`, `MARKDOWN_SUPPORTED_EXTENSIONS`, `CSS_SUPPORTED_EXTENSIONS`, `SCSS_SUPPORTED_EXTENSIONS`, `VUE_SUPPORTED_EXTENSIONS`, `SVELTE_SUPPORTED_EXTENSIONS`, `ASTRO_SUPPORTED_EXTENSIONS`, `TEX_SUPPORTED_EXTENSIONS`, `TYPESCRIPT_SUPPORTED_EXTENSIONS`, or `JAVASCRIPT_SUPPORTED_EXTENSIONS`).
2. **`src/snippets/languages/<destination>.ts`** — make sure the per-language `buildSnippet` knows how to handle that source. The shared gating in `src/gating.ts` won't catch a source that lands at the per-language `switch`'s `default:` and emits an empty snippet.

### Adding a new file extension

To add a new file extension entirely (e.g. accepting `.bmp` everywhere `.png` is accepted), **four sites** must stay in sync:

1. **`src/types/file-extension.ts`** — add to the relevant category sub-type (`ImageFileExtension`, `ScriptFileExtension`, `StylesheetFileExtension`, etc).
2. **`src/constants/extensions.ts`** — add to the matching runtime gating table (`IMAGE_FILE_EXTENSIONS` mirrors `ImageFileExtension`).
3. **`src/snippets/dispatch.ts`** (if it's a new destination) or the relevant `src/snippets/languages/*.ts` / `src/snippets/_react.ts` (if it's a new source for JSX/TSX/MDX).
4. **`src/snippets/variants.ts`** — add a matching `case` so the picker commands (`pasteImportWithStyle`, `setDefaultImportStyle`) work for the new extension.

**Additionally — and only when the new extension is itself a new _destination_ language** — register it in **`src/drop/selector.ts`** (`DROP_LANGUAGE_SELECTORS`): add `{ language, scheme: 'file' }` if it has a guaranteed VS Code language ID, otherwise a `{ pattern: '**/*.ext', scheme: 'file' }` entry (as done for `.mdx`/`.tex`). A new _source_ extension for existing destinations — the `.bmp`-like-`.png` case above — needs no selector change, because selectors are keyed on destination language IDs, not source extensions.

Drift between the four sites is **silent** — a missing gating entry produces a fall-through to a `default:` branch rather than a type error. The runtime cast `as FileExtension` at boundaries is erased.

### Tests

Tests live in `src/test/` and are compiled to `out/test/` by `npm run compile-tests`. The runner picks up `out/test/**/*.test.js`.

```bash
npm test                          # full chain: compile-tests + compile + lint + run
npm test -- --grep "<test name>"  # run a single test by name
npm run test:coverage             # same chain + V8/c8 coverage report (opt-in; writes coverage/)
```

- Write tests in BDD style (`describe` / `it`).
- Use Node's built-in `assert` — Chai and Sinon were dropped and should not be reintroduced.
- Tests run from `out/`, **not** `dist/` — `dist/` is the production esbuild bundle, `out/` is the tsc test build.

---

## Support the project

If this extension saves you time, consider:

- **Starring** the repo on [GitHub](https://github.com/ElecTreeFrying/auto-import-relative-path)
- **Leaving a review** on the [VS Code Marketplace][marketplace]
- **Donating** — addresses are listed in the [README's Support section][donate]

[donate]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/main/README.md#support
