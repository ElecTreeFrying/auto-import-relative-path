# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

Do NOT append a `Co-Authored-By: Claude ...` trailer (or any other Claude/AI attribution) to commit messages. Write commits as if authored solely by the user.

## Project

VS Code extension that generates relative-path import statements for JS/TS/JSX/TSX/MDX/CSS/SCSS/HTML/Markdown/Vue/Svelte/Astro/LaTeX. Input gestures: **copy-paste** (the copy/paste command set) and **drag-and-drop** (a `DocumentDropEditProvider` covering every destination language). Both gestures accept Explorer multi-selections — the clipboard channel and the drop provider fan out per file and insert one stacked block, tab stops renumbered via `snippets/compose.ts`; the style-picker commands instead reduce a multi-selection to its primary member. The commands (`extension.copyFilePath`, `extension.pasteImport`, `extension.copyPaste`, `extension.pasteImportWithStyle`, `extension.setDefaultImportStyle`, `extension.setImportPlacement`, `extension.togglePreserveScriptExtension`, `extension.resetImportStyles`) are registered in `src/extension.ts`. The keybound commands (`copyFilePath` — `cmd/ctrl+shift+a`, `pasteImport` — `cmd/ctrl+i`, `copyPaste` — `alt+d` in the explorer) get their bindings from `package.json`; the rest are reachable via the Command Palette (and `pasteImportWithStyle` also via the `copy-success` toast button). The drop provider is registered alongside the commands in `activate()` and uses the same snippet pipeline.

## Subdirectory guides

Each directory under `src/` has its own nested `CLAUDE.md` guide. Read it before editing files inside that directory.

| Directory | Scope | Guides |
|-----------|-------|--------|
| `src/` | Source-tree overview, dependency layering, naming conventions | [`src/CLAUDE.md`](src/CLAUDE.md) |
| `src/commands/` | The command surface (paste/copy + settings commands); clipboard data channel; the paste/copy gating disjunction (shared `isPairSupported()` clauses plus the inline empty-snippet checks) | [`src/commands/CLAUDE.md`](src/commands/CLAUDE.md) |
| `src/drop/` | DocumentDropEditProvider; drag-from-Explorer import generation | [`src/drop/CLAUDE.md`](src/drop/CLAUDE.md) |
| `src/editor/` | VS Code-API helpers (clipboard, snippet insertion, notifications) | [`src/editor/CLAUDE.md`](src/editor/CLAUDE.md) |
| `src/snippets/` | Per-language snippet builders + dispatch; style sync rules; JSX/TSX/MDX shared algorithm | [`src/snippets/CLAUDE.md`](src/snippets/CLAUDE.md) |
| `src/snippets/languages/` | The per-language leaf builders; config/pure split, intra-directory delegation, source-classification routing | [`src/snippets/languages/CLAUDE.md`](src/snippets/languages/CLAUDE.md) |
| `src/path/` | Pure path math (no `vscode` import); `./` prefix rule | [`src/path/CLAUDE.md`](src/path/CLAUDE.md) |
| `src/config/` | Workspace-config access; three-site sync rule | [`src/config/CLAUDE.md`](src/config/CLAUDE.md) |
| `src/constants/` | Runtime gating tables; runtime mirror of `types/file-extension.ts` | [`src/constants/CLAUDE.md`](src/constants/CLAUDE.md) |
| `src/types/` | Cross-cutting type unions (no enums) | [`src/types/CLAUDE.md`](src/types/CLAUDE.md) |
| `src/test/` | Mocha BDD tests; runs from `out/`, not `dist/` | [`src/test/CLAUDE.md`](src/test/CLAUDE.md) |

> **Local-only trees (gitignored).** `import-statement-design/` — the design library (the import-statement rubric, shipped picker shapes, decisions + rejection ledgers) — and `qa/` — the manual-QA checklists + fixture workspaces, plus `qa/staging/` holding per-roadmap-item acceptance sessions awaiting their fold into the corpus — are kept on disk for development, not tracked or shipped. Their guides live locally at `import-statement-design/CLAUDE.md` and `qa/CLAUDE.md`.

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
npm run test:coverage    # @vscode/test-cli with --coverage (opt-in; writes coverage/ + text report)
```

Run a single test by filtering Mocha via `npm test -- --grep "<name>"` (the filter is forwarded to `@vscode/test-cli`). Tests must be compiled first — `out/test/**/*.test.js` is what `.vscode-test.mjs` picks up.

Press **F5** inside VS Code to launch an Extension Development Host with the extension loaded (`.vscode/launch.json`); the default build task (`npm: watch`) runs first.

Publishing flow lives in `process/workflow.md` (gitignored): `vsce publish patch|minor|major` after `npm run vscode:prepublish`.

## Architecture

The source tree is layered by responsibility, with strict directional dependencies:

```
src/
├── extension.ts                # activate/deactivate; registers the commands + drop provider
├── gating.ts                   # shared isPairSupported() — extension-pair check
├── commands/                   # public command surface (one file per command)
├── drop/                       # DocumentDropEditProvider (drag-from-Explorer imports)
├── editor/                     # VS Code-API touching helpers (clipboard, snippets, notifications)
├── snippets/                   # per-language snippet builders + dispatch
├── path/                       # pure path math (no `vscode` import; Node-testable)
├── config/                     # workspace-config access (getAutoImportSetting)
├── constants/                  # cross-import gating tables
├── types/                      # cross-cutting type unions
└── test/                       # Mocha BDD tests (runs from out/, not dist/)
```

Allowed dependency direction: `commands → gating, editor, snippets, config, constants, path, types`; `drop → gating, editor, snippets, constants, path, types`; `gating → editor, constants, types`; `snippets → config, path, editor, types, constants`; `editor → config, path, constants, types`; `path → types`. Lower layers never import from higher layers. Internal-only sibling modules in `snippets/` are prefixed with `_` (`_styles.ts`, `_react.ts`, `_class-name.ts`).

## Cross-cutting sync rules

These multi-site contracts silently break on drift. The linked guides have the full rules.

- **Four-site extension sync** — adding a file extension requires updates in `types/file-extension.ts` → `constants/extensions.ts` → `snippets/dispatch.ts` → `snippets/variants.ts` (non-script asset sources into JSX/TSX/MDX route through `snippets/_react.ts:buildAssetImportStatement` instead of `dispatch.ts`; of those, only JSX/TSX/MDX-exclusive sources like fonts skip the `constants` gating table — images, media, documents, and components also target gated destinations and keep their `constants` entries). See [`src/types/CLAUDE.md`](src/types/CLAUDE.md).
- **Three-site config sync** — setting enum strings must be byte-identical across `package.json` → `snippets/_styles.ts` → per-language `switch`. The dormant single-shape keys (`cssImage`, `scssImage`, `htmlStyleSheet`, `markdown`) are the exception — kept in `package.json` for backward compatibility but not style-synced at runtime. See [`src/config/CLAUDE.md`](src/config/CLAUDE.md).
- **Two-site button-label sync** — toast action-button labels in `editor/notification.ts` must match the `switch` cases in the dispatching command character-for-character, at two sites: the `copy-success` buttons ↔ `commands/copy-file-path.ts`, and the `styles-reset` **Undo** ↔ `commands/reset-import-styles.ts`. See [`src/commands/CLAUDE.md`](src/commands/CLAUDE.md).
- **Runtime-type mirror sync** — `IMAGE_FILE_EXTENSIONS` (mirrors `ImageFileExtension`), `TEXT_TRACK_FILE_EXTENSIONS` (mirrors `TextTrackFileExtension`), and `FRAMEWORK_COMPONENT_FILE_EXTENSIONS` (mirrors `FrameworkComponentFileExtension`) in `constants/extensions.ts` track their type unions; `MEDIA_FILE_EXTENSIONS` holds video + audio only (`.vtt` lives in `TEXT_TRACK_FILE_EXTENSIONS`, and both are spread together into the destination lists). See [`src/constants/CLAUDE.md`](src/constants/CLAUDE.md).

## Build/test layout quirks

- Independent TS pipelines: **esbuild** (bundles `src/extension.ts` → `dist/extension.js` as CommonJS with `vscode` external; sourcemaps in dev, minified with `--production`; see `esbuild.js`) and **tsc** (`compile-tests` emits `src/**` → `out/` for the test runner). Their outputs are independent — don't try to share them.
- `tsconfig.json` is `module: Node16`, `target: ES2022`, `strict: false`, `rootDir: src`, `sourceMap: true`, and `types: ["node", "mocha"]`. New source files belong under `src/`. (`sourceMap` is on so `test:coverage` maps `out/` back to `src/`.)
- Mocha tests are written in BDD style (`describe`/`it`); the runner UI is set to `bdd` in `.vscode-test.mjs`. Tests use Node's built-in `assert` (no Chai/Sinon). The test runner glob is `out/test/**/*.test.js` — only files emitted by `compile-tests` get picked up.
- **Coverage is opt-in:** `npm run test:coverage` runs the same suite with `vscode-test --coverage` (V8/c8). `.vscode-test.mjs` uses the `{ tests, coverage }` form — the `coverage` block (`includeAll`, `exclude` of `test`/`*.test.*`/`types`, `text`+`html` reporters) is silently ignored unless `--coverage` is passed. Report lands in the git-ignored `coverage/`.
- `process/` is gitignored — private publishing notes + access tokens; never commit it. `import-statement-design/` (the design library) and `qa/` (the manual-QA corpus, including the `qa/staging/` roadmap-item sessions) are gitignored too — kept locally for development, never tracked or shipped. Under `.claude/`, `.gitignore` carves out `agents/`, `skills/`, and `workflows/` as trackable; `agents/state/` and everything else under `.claude/` stays gitignored.

## Naming conventions

- Files use noun-only kebab-case: `relative-path.ts`, `file-path-info.ts`. Do not reintroduce suffixes like `.command.ts`, `.util.ts`, `-fn.ts`, `.types.ts`, `.enums.ts`, `.interface.ts` — the parent directory carries the kind signal.
- Modules whose filename starts with `_` (e.g., `snippets/_styles.ts`, `snippets/_react.ts`, `snippets/_class-name.ts`) are internal to their parent subtree; importing them from outside `snippets/` is a smell. The `snippets/languages/` modules importing `../_styles`, `../_react`, and `../_class-name` is expected.
- Barrel files are avoided — `src/commands/index.ts` is the deliberate exception. Other directories use direct imports so dependency direction stays visible at the call site.

## Documentation hygiene — no volatile facts

Internal docs must not carry facts that silently rot when code changes.

**Scope — the maintainer-facing docs:** every `CLAUDE.md` guide under `src/`, `qa/`, and `import-statement-design/`, plus the QA checklists and `ROADMAP.md`.

**Exempt — the reader-facing root docs:** `README.md`, `SPEC.md`, and `SUPPORT.md` keep their counts, totals, and bundle sizes. They orient users and carry the marketplace-facing selling points, so those numbers are deliberate copy — maintained by hand at release time, not avoided. Do not sweep them. `CHANGELOG.md` is likewise exempt: dates and versions are its content.

When writing or editing an in-scope doc:

- **Enumerate, never count.** Lists self-maintain; counts are a second copy of a list's length with no sync gate. "The commands (`a`, `b`, …)", never "the eight commands". No table row-counts, no "N styles/clauses/sites/languages". The named multi-site contracts (four-site extension sync, three-site config sync, two-site button-label sync) are names — keep them, and never "reconcile" a count you think is wrong: reword or flag it.
- **No dates or decision trails.** Git blame owns chronology. State the present rule; drop "as of …", "previously X, now Y", "added in commit `abc123`", "later promoted". (External-ecosystem dates — "Sass deprecated `@import` in 2022" — are evidence, not provenance; they stay. The `import-statement-design/` Design-Decisions ledger rows — each topic file's Part 2 — are append-only records; their internals stay.)
- **No code-volume or coverage numbers.** Point at the tool ("run `npm run test:coverage`") or drop the number.
- **Symbols, not line numbers.** "the `switch` in `executeCopyFilePath`", never "`copy-file-path.ts:23-30`".
- **No temporal deixis** ("currently", "now", "for now") and **no positional references** ("the first three…") — name things by property instead.
- **Uniqueness claims only as policed invariants**, phrased as rules ("Barrel files are avoided; `commands/index.ts` is the deliberate exception") — delete passing observations ("the only …").
- **Numbers that ARE the fact keep:** design thresholds (the 30% Frequency bar, the ~7 picker ceiling), `engines.vscode ^1.97`, config/enum values and keybindings, QA case numbers and the 1-indexed checklist convention, the "Picker inventory" ceiling ledger in `import-statement-design/statements.md`, fixture-content constants the checklists depend on.
