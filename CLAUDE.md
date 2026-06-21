# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

Do NOT append a `Co-Authored-By: Claude ...` trailer (or any other Claude/AI attribution) to commit messages. Write commits as if authored solely by the user.

## Project

VS Code extension that generates relative-path import statements for JS/TS/JSX/TSX/MDX/CSS/SCSS/HTML/Markdown/Vue/Svelte/Astro/LaTeX. Two input gestures: **copy-paste** (eight commands) and **drag-and-drop** (a `DocumentDropEditProvider` for all 13 destination languages). The eight commands (`extension.copyFilePath`, `extension.pasteImport`, `extension.copyPaste`, `extension.pasteImportWithStyle`, `extension.setDefaultImportStyle`, `extension.setImportPlacement`, `extension.togglePreserveScriptExtension`, `extension.resetImportStyles`) are registered in `src/extension.ts`. The first three are bound to keybindings in `package.json` (`cmd/ctrl+shift+a`, `cmd/ctrl+i`, and `alt+d` in the explorer respectively); the latter five are reachable via the Command Palette (and `pasteImportWithStyle` also via the `copy-success` toast button). The drop provider is registered alongside the commands in `activate()` and uses the same snippet pipeline.

## Subdirectory guides

Each directory under `src/` has its own pair of nested guides. Read the directory's `CLAUDE.md` first when editing files inside it; read its `README.md` when navigating or onboarding.

| Directory | Scope | Guides |
|-----------|-------|--------|
| `src/` | Source-tree overview, dependency layering, naming conventions | [`src/README.md`](src/README.md), [`src/CLAUDE.md`](src/CLAUDE.md) |
| `src/commands/` | The eight commands (five paste/copy + three settings); clipboard data channel, twelve-clause gating (paste/copy only) | [`src/commands/README.md`](src/commands/README.md), [`src/commands/CLAUDE.md`](src/commands/CLAUDE.md) |
| `src/drop/` | DocumentDropEditProvider; drag-from-Explorer import generation | [`src/drop/README.md`](src/drop/README.md), [`src/drop/CLAUDE.md`](src/drop/CLAUDE.md) |
| `src/editor/` | VS Code-API helpers (clipboard, snippet insertion, notifications) | [`src/editor/README.md`](src/editor/README.md), [`src/editor/CLAUDE.md`](src/editor/CLAUDE.md) |
| `src/snippets/` | Per-language snippet builders + dispatch; style sync rules; JSX/TSX/MDX shared algorithm | [`src/snippets/README.md`](src/snippets/README.md), [`src/snippets/CLAUDE.md`](src/snippets/CLAUDE.md) |
| `src/snippets/languages/` | The ten per-language leaf builders; config/pure split, intra-directory delegation, source-classification routing | [`src/snippets/languages/README.md`](src/snippets/languages/README.md), [`src/snippets/languages/CLAUDE.md`](src/snippets/languages/CLAUDE.md) |
| `src/path/` | Pure path math (no `vscode` import); `./` prefix rule | [`src/path/README.md`](src/path/README.md), [`src/path/CLAUDE.md`](src/path/CLAUDE.md) |
| `src/config/` | Workspace-config access; three-site sync rule | [`src/config/README.md`](src/config/README.md), [`src/config/CLAUDE.md`](src/config/CLAUDE.md) |
| `src/constants/` | Runtime gating tables; runtime mirror of `types/file-extension.ts` | [`src/constants/README.md`](src/constants/README.md), [`src/constants/CLAUDE.md`](src/constants/CLAUDE.md) |
| `src/types/` | Cross-cutting type unions (no enums) | [`src/types/README.md`](src/types/README.md), [`src/types/CLAUDE.md`](src/types/CLAUDE.md) |
| `src/test/` | Mocha BDD tests; runs from `out/`, not `dist/` | [`src/test/README.md`](src/test/README.md), [`src/test/CLAUDE.md`](src/test/CLAUDE.md) |
| `qa/` | Per-language manual-QA checklists + matching by-language fixture workspaces, the `_authoring/` checklist-codegen pipeline (RECIPE + frozen-IR PROFILE), and a standalone framework demo-workspace | [`qa/README.md`](qa/README.md), [`qa/CLAUDE.md`](qa/CLAUDE.md), [`qa/_authoring/README.md`](qa/_authoring/README.md), [`qa/checklists/README.md`](qa/checklists/README.md), [`qa/checklists/CLAUDE.md`](qa/checklists/CLAUDE.md), [`qa/workspace/README.md`](qa/workspace/README.md), [`qa/workspace/CLAUDE.md`](qa/workspace/CLAUDE.md) |
| `docs/` | Design library (the *why*): the import-statements design tree (criteria, decisions, rejection ledgers) + a reader-facing QA checklist-codegen overview. The product spec `SPEC.md` stays in root, paired with `README.md`. | [`docs/CLAUDE.md`](docs/CLAUDE.md), [`docs/import-statements/CLAUDE.md`](docs/import-statements/CLAUDE.md) |

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
├── extension.ts                # activate/deactivate; registers 8 commands + drop provider
├── gating.ts                   # shared isPairSupported() — ten-clause extension-pair check
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

Allowed dependency direction: `commands → gating, editor, snippets, constants, types`; `drop → gating, editor, snippets, constants, types`; `gating → editor, constants, types`; `snippets → config, path, editor, types, constants`; `editor → config, path, constants, types`; `path → types`. Lower layers never import from higher layers. Internal-only sibling modules in `snippets/` are prefixed with `_` (`_styles.ts`, `_react.ts`, `_class-name.ts`).

## Cross-cutting sync rules

These multi-site contracts silently break on drift. The linked guides have the full rules.

- **Four-site extension sync** — adding a file extension requires updates in `types/file-extension.ts` → `constants/extensions.ts` → `snippets/dispatch.ts` → `snippets/variants.ts` (non-script asset sources into JSX/TSX/MDX route through `snippets/_react.ts:buildAssetImportStatement` instead of `dispatch.ts`, and skip the `constants` gating table). See [`src/types/CLAUDE.md`](src/types/CLAUDE.md).
- **Three-site config sync** — setting enum strings must be byte-identical across `package.json` → `snippets/_styles.ts` → per-language `switch`. Four dormant single-shape keys (`cssImage`, `scssImage`, `htmlStyleSheet`, `markdown`) are the exception — kept in `package.json` for backward compatibility but not style-synced at runtime. See [`src/config/CLAUDE.md`](src/config/CLAUDE.md).
- **Two-site button-label sync** — toast action-button labels in `editor/notification.ts` must match the `switch` cases in the dispatching command character-for-character, at two sites: the `copy-success` buttons ↔ `commands/copy-file-path.ts`, and the `styles-reset` **Undo** ↔ `commands/reset-import-styles.ts`. See [`src/commands/CLAUDE.md`](src/commands/CLAUDE.md).
- **Runtime-type mirror sync** — `IMAGE_FILE_EXTENSIONS` (mirrors `ImageFileExtension`) and `TEXT_TRACK_FILE_EXTENSIONS` (mirrors `TextTrackFileExtension`) in `constants/extensions.ts` track their type unions; `MEDIA_FILE_EXTENSIONS` holds video + audio only (`.vtt` lives in `TEXT_TRACK_FILE_EXTENSIONS`, and both are spread together into the destination lists). See [`src/constants/CLAUDE.md`](src/constants/CLAUDE.md).

## Build/test layout quirks

- Two independent TS pipelines: **esbuild** (bundles `src/extension.ts` → `dist/extension.js` as CommonJS with `vscode` external; sourcemaps in dev, minified with `--production`; see `esbuild.js`) and **tsc** (`compile-tests` emits `src/**` → `out/` for the test runner). The two outputs are independent — don't try to share them.
- `tsconfig.json` is `module: Node16`, `target: ES2022`, `strict: false`, `rootDir: src`, `sourceMap: true`, and `types: ["node", "mocha"]`. New source files belong under `src/`. (`sourceMap` is on so `test:coverage` maps `out/` back to `src/`.)
- Mocha tests are written in BDD style (`describe`/`it`); the runner UI is set to `bdd` in `.vscode-test.mjs`. Tests use Node's built-in `assert` (Chai/Sinon were dropped in commit `f06101f`). The test runner glob is `out/test/**/*.test.js` — only files emitted by `compile-tests` get picked up.
- **Coverage is opt-in:** `npm run test:coverage` runs the same suite with `vscode-test --coverage` (V8/c8, ~96% lines). `.vscode-test.mjs` uses the `{ tests, coverage }` form — the `coverage` block (`includeAll`, `exclude` of `test`/`*.test.*`/`types`, `text`+`html` reporters) is silently ignored unless `--coverage` is passed. Report lands in the git-ignored `coverage/`.
- `process/` is gitignored — private publishing notes + access tokens; never commit it. Under `.claude/`, the shared tooling (`agents/`, `skills/`, `workflows/`) is tracked; `agents/state/` and everything else under `.claude/` stays gitignored.

## Naming conventions

- Files use noun-only kebab-case: `relative-path.ts`, `file-path-info.ts`. Do not reintroduce suffixes like `.command.ts`, `.util.ts`, `-fn.ts`, `.types.ts`, `.enums.ts`, `.interface.ts` — the parent directory carries the kind signal.
- Modules whose filename starts with `_` (e.g., `snippets/_styles.ts`, `snippets/_react.ts`, `snippets/_class-name.ts`) are internal to their parent subtree; importing them from outside `snippets/` is a smell. The `snippets/languages/` modules importing `../_styles`, `../_react`, and `../_class-name` is expected.
- The only barrel file is `src/commands/index.ts`. Other directories use direct imports so dependency direction stays visible at the call site.
