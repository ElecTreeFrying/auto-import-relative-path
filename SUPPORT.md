# Support & Contributing — Auto Import Relative Path

Where to get help, how to diagnose common issues, and how to contribute. For features and configuration see the [README][README]; for visual workflows see the [demo gallery][DEMO].

[README]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/README.md
[DEMO]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/DEMO.md

---

## Table of Contents

- [Quick Links](#quick-links)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Troubleshooting](#troubleshooting)
- [Reporting a bug](#reporting-a-bug)
- [Feature requests](#feature-requests)
- [Contributing](#contributing)
  - [Setup](#setup)
  - [Useful commands](#useful-commands)
  - [Architecture overview](#architecture-overview)
  - [Adding a new file-type pair](#adding-a-new-file-type-pair)
  - [Adding a new file extension](#adding-a-new-file-extension)
  - [Tests](#tests)
- [Support the project](#support-the-project)

---

## Quick Links

| Resource                                                                                              | What you'll find                                                  |
|-------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| [README][README]                                                                                      | Feature overview, commands, full configuration reference          |
| [Demo gallery][DEMO]                                                                                  | Animated walkthroughs and per-language output examples            |
| [CHANGELOG][CHANGELOG]                                                                                | Release notes and version history                                 |
| [GitHub Issues][issues]                                                                               | Bug reports, feature requests, questions                          |
| [VS Code Marketplace][marketplace]                                                                    | Install page, reviews, version listings                           |

[CHANGELOG]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/CHANGELOG.md
[issues]: https://github.com/ElecTreeFrying/auto-import-relative-path/issues
[marketplace]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

---

## Frequently Asked Questions

### Does this extension send my data anywhere?

**No.** It is 100% local — no telemetry, no network calls, no AI. The whole bundle is ~11 KB minified, and you can read every line of the [source on GitHub][source].

[source]: https://github.com/ElecTreeFrying/auto-import-relative-path/tree/master/src

### Is it compatible with Cursor / VSCodium / Code Server?

**Yes.** The extension uses only the public VS Code API. It runs in any host that implements the API at engine `^1.118.0` or later — including Cursor, VSCodium, Code Server, and other forks.

### Does it work in monorepos / pnpm / Yarn workspaces?

**Yes,** with a caveat. The extension treats every file as just a path on disk and computes the relative path between two files — it has no concept of package boundaries. If you're importing across packages and your build prefers package-name imports (e.g. `@org/pkg/util`), the extension won't deduce that for you. It will give you the correct `../../packages/pkg/util` relative path instead.

### Why are some configurations single-option dropdowns?

HTML and Markdown shapes have a single canonical form (`<script src="...">`, `<img>`, `<link>`, `![](...)`). The dropdowns exist for VS Code settings-UI parity. They will gain options as soon as multiple are sensible. If you want a different default, [open an issue][issues] with your preferred shape.

### Why does the import shape change when I switch destination files?

Because the **destination decides the syntax**. Pasting into `.scss` produces `@import` or `@use`; pasting into `.html` produces `<script>` or `<link>`; pasting into `.tsx` produces an ES module `import`. The source extension is one input; the destination is the other. The extension's job is to pick the right shape automatically.

### Can I rebind `Ctrl+I` / `Cmd+I` / `Alt+D`?

**Yes.** Open VS Code's keyboard shortcuts editor (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>K</kbd> <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>S</kbd>), search for `extension.copyFilePath`, `extension.pasteImport`, or `extension.copyPaste`, and rebind. Useful if `Cmd+I` clashes with another extension you use.

### Can I import a folder (barrel) instead of a file?

**Not directly.** The extension targets individual files. If you have an `index.ts` barrel, copy that file specifically. There is no `dir → import './dir';` shortcut yet — [open an issue][issues] if you'd like one.

### Can I add `.vue` / `.svelte` / `.astro` support?

**Not out of the box.** Adding a new destination language is a four-step contributor task — see [Adding a new file extension](#adding-a-new-file-extension).

### Why does my import path not show file extensions (or always show them)?

By default, JS / TS / JSX / TSX imports omit the file extension (matching ecosystem convention) and CSS / SCSS imports omit the extension (matching the most common style). Toggle one of these settings to change the behaviour:

- `auto-import.importStatement.script.preserveScriptFileExtension`
- `auto-import.importStatement.styleSheet.preserveStylesheetFileExtension`

Note: `.css` extensions are **always** preserved inside `.scss` imports — Sass requires the extension to recognise a foreign-language import.

---

## Troubleshooting

Each section below is **symptom → cause → fix**. If your issue isn't here, [open an issue][issues].

### Nothing happens when I press the keybinding

**Causes:**

- No file is **selected** in the Explorer panel (click a file — having one visible isn't enough).
- For `Paste` and `Auto`, no editor tab is open or focused.
- The source / destination extension pair isn't supported.

**Fix:** Select a file in the Explorer, make sure an editor tab is focused, and check the [supported pairs table][pairs] in the README. If your pair *should* be supported, [open an issue][issues].

[pairs]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/README.md#supported-source--destination-pairs

---

### "Not supported" notification appears

**Cause:** The source extension is not allowed for the active editor's destination. The most common cases:

- `.js` and `.ts` destinations only accept the **same extension** (no cross-extension imports — use `.jsx` or `.tsx` for those).
- `.html` → `.html` is explicitly rejected (HTML has no relative-import syntax for embedding itself).
- A typo or unusual extension that's not in the gating tables.

**Fix:** Check the [supported pairs table][pairs]. If your pair *should* be supported, [open an issue][issues] with your source / destination extensions.

---

### "Same file path" notification appears

**Cause:** The file selected in the Explorer is the same file open in the active editor (case-insensitive comparison).

**Fix:** Pick a different source file. Self-imports are rejected — there's no scenario where they're useful.

---

### Import is placed at the wrong line

**Cause:** Your `auto-import.preferences.importStatementPlacement` setting is `Top`, `Bottom`, or `Cursor`, and the inserter is doing exactly what you told it to.

**Fix:** Change the setting (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>,</kbd>, search `auto-import`).

> **Note:** For `.html` and `.md` destinations, and when importing a non-stylesheet into a stylesheet, placement is **always** forced to `Cursor` regardless of the setting. Those contexts don't have an "import block" to attach to.

---

### "Bottom" placement always lands at line 0

**Cause:** "Bottom" appends after the *last recognised* import line. The detector looks for `import …`, `var/const x = require(…)`, `@import '…'`, `@import url(…)`, and `@use '…'`. If none are found, it falls back to line 0.

**Fix:** Add at least one import line manually to seed the file. Subsequent inserts will then anchor correctly to the bottom of the import block.

---

### File extension is included (or missing) in the import path

**Causes and fixes:**

- For `.js` / `.ts` / `.jsx` / `.tsx`, toggle `auto-import.importStatement.script.preserveScriptFileExtension`.
- For `.css` / `.scss`, toggle `auto-import.importStatement.styleSheet.preserveStylesheetFileExtension`.

**Special case:** `.css` extensions are **always preserved** when imported into a `.scss` file — Sass requires the extension to distinguish a plain-CSS import from a Sass import. The setting has no effect there. This is by design and matches Sass convention.

---

### TypeScript shows a PascalCase name instead of `$1`

**Cause:** This is the Angular auto-fill, and it's intentional. When the `import { name }` style is selected and the source filename contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the extension derives a PascalCase identifier from the basename automatically (e.g., `app-root.component.ts` → `{ AppRootComponent }`).

**Fix:** Switch to a different TypeScript shape (`import name from '_relativePath_';` is the closest equivalent) if you don't want this. The auto-fill only triggers on the `import { name }` shape — every other shape uses `$1` unconditionally.

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

**Fix:** Rebind from VS Code's keyboard shortcuts editor (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>K</kbd> <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>S</kbd>). The command IDs to search for are `extension.copyFilePath`, `extension.pasteImport`, and `extension.copyPaste`.

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

### Useful commands

| Command                  | Purpose                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------|
| `npm run compile`        | Type-check, lint, and bundle for development (sourcemaps included).                       |
| `npm run watch`          | Parallel `tsc --noEmit --watch` and `esbuild --watch` via `npm-run-all`.                  |
| `npm run package`        | Production bundle (used by `vscode:prepublish`). ~11 KB minified.                         |
| `npm run check-types`    | `tsc --noEmit` with no bundling — fastest correctness check.                              |
| `npm run lint`           | ESLint over `src/`.                                                                      |
| `npm run compile-tests`  | Compile `src/test/` to `out/` for the test runner (separate from esbuild).                |
| `npm test`               | Full pretest chain (`compile-tests` + `compile` + `lint`) then `@vscode/test-cli`.        |

Run a single test by filtering Mocha:

```bash
npm test -- --grep "<test name>"
```

The runner glob is `out/test/**/*.test.js` — only files emitted by `compile-tests` get picked up.

### Architecture overview

The source tree is **layered by responsibility**, with strict directional dependencies (lower layers never import from higher ones):

```
src/
├── extension.ts             ← entry point: activate / deactivate
├── commands/                ← public command surface (3 commands)
├── editor/                  ← VS Code-API helpers (clipboard, snippets, notifications)
├── snippets/                ← per-language snippet builders + dispatch
├── path/                    ← pure path math (no `vscode` import; Node-testable)
├── config/                  ← workspace-config access
├── constants/               ← runtime gating tables (supported extension pairs)
├── types/                   ← string-literal type unions (no enums)
└── test/                    ← Mocha BDD tests
```

**Allowed dependency direction:**

- `commands → editor, snippets, constants, types`
- `snippets → config, path, editor, types, constants`
- `editor → config, path, constants, types`
- `path → types`

`config`, `constants`, and `types` are leaves — they import only from `vscode` (config) or nothing project-internal.

**Conventions:**

- Files use noun-only kebab-case (`relative-path.ts`, `file-path-info.ts`). No suffixes like `.command.ts`, `.util.ts`, `.types.ts` — the parent directory carries the kind signal.
- Filename starts with `_` (e.g. `_styles.ts`, `_shared.ts`) → directory-internal; importing from outside the directory is a smell.
- The only barrel file is `commands/index.ts`. Other directories use direct imports so dependency direction stays visible at the call site.
- Every module, function, type, interface property, and constant has TSDoc.

Each `src/<dir>/` has its own `CLAUDE.md` (architecture invariants) and `README.md` (navigation) for deeper, directory-specific guidance.

### Adding a new file-type pair

To accept a new source extension for an existing destination (e.g. `.yaml` for `.html`):

1. **`src/constants/extensions.ts`** — add the source to the matching `*_SUPPORTED_EXTENSIONS` table (`HTML_SUPPORTED_EXTENSIONS`, `MARKDOWN_SUPPORTED_EXTENSIONS`, `CSS_SUPPORTED_EXTENSIONS`, or `SCSS_SUPPORTED_EXTENSIONS`).
2. **`src/snippets/<destination-language>.ts`** — make sure the per-language `buildSnippet` knows how to handle that source. The eight-clause gating in `commands/paste-import.ts` won't catch a source that lands at the per-language `switch`'s `default:` and emits an empty snippet.

### Adding a new file extension

To add a new file extension entirely (e.g. accepting `.bmp` everywhere `.png` is accepted), three sites must stay in sync:

1. **`src/types/file-extension.ts`** — add to the relevant category sub-type (`ImageFileExtension`, `ScriptFileExtension`, `StyleSheetFileExtension`, etc).
2. **`src/constants/extensions.ts`** — add to the matching runtime gating table (`IMAGE_FILE_EXTENSIONS` mirrors `ImageFileExtension`).
3. **`src/snippets/dispatch.ts`** (if it's a new destination) **or** `src/snippets/_shared.ts` (if it's a new JSX / TSX source).

Drift between these three sites is **silent** — a missing gating entry produces a fall-through to a `default:` branch rather than a type error. The runtime cast `as FileExtension` at boundaries is erased.

### Tests

Tests live in `src/test/` and are compiled to `out/test/` by `npm run compile-tests`. The runner picks up `out/test/**/*.test.js`.

- Write tests in BDD style (`describe` / `it`).
- Use Node's built-in `assert` — Chai and Sinon were dropped in commit `f06101f` and should not be reintroduced.
- Tests run from `out/`, **not** `dist/` — `dist/` is the production esbuild bundle, `out/` is the tsc test build.

---

## Support the project

If this extension saves you time, consider:

- ⭐ **Starring** the repo on [GitHub](https://github.com/ElecTreeFrying/auto-import-relative-path)
- 💬 **Leaving a review** on the [VS Code Marketplace][marketplace]
- **Donating** — addresses are listed in the [README's Support the project section][donate]

[donate]: https://github.com/ElecTreeFrying/auto-import-relative-path/blob/master/README.md#support-the-project
