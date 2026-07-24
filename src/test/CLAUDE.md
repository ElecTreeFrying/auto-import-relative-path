# src/test/CLAUDE.md

Mocha BDD tests that run from `out/`, not `dist/`. The suite owns its fixtures in [`fixtures/`](fixtures/) — a self-contained copy that gives the tests **no dependency on the top-level `qa/` tree**. (The separate manual-QA checklists still live under `qa/`.) `fixtures/` is excluded from `tsc` (`tsconfig.json` `exclude`) and ESLint (`eslint.config.mjs` `ignores`) — see [`fixtures/CLAUDE.md`](fixtures/CLAUDE.md); don't lift those excludes, the fixtures are deliberately invalid.

## Conventions

- **Mocha BDD** (`describe`/`it`), configured in `.vscode-test.mjs` under `tests[0].mocha.ui: 'bdd'` (the config uses the `{ tests, coverage }` form).
- **Node `assert`** only — no Chai, no Sinon.
- **Tests compile via `tsc -p . --outDir out`** (`npm run compile-tests`), not the esbuild pipeline. The runner glob is `out/test/**/*.test.js`.
- Test file names mirror the source path: `src/path/relative.ts` → `test/path/relative.test.ts`.
- `test/qa/` holds checklist-anchored gap tests — each describe/it title carries its `qa/checklists/` anchor (e.g. `[general.md §5.4]`). They join the headless suite (`npm test`).
- `test/ui/` holds the ExTester UI suite: specs are named `*.ui-test.ts` so the `out/test/**/*.test.js` runner glob never picks them up; they run via `npm run qa:ui` against a real VS Code instance. `test/ui-workspace/` is that suite's fixture tree — excluded from `tsc` and ESLint like `fixtures/`, and staged to a short-path storage dir at runtime so the git tree is never mutated.
- Every command has behavior-level coverage: the settings-only `set-import-placement` and `toggle-preserve-script-extension` are exercised in `qa/settings-commands.test.ts` (the stubbed-QuickPick pattern), alongside the activation/registration smoke checks in `extension.test.ts`.
- Cross-module contracts are pinned by structural tests that read source: `editor/placement-parity.test.ts` (command flow ↔ drop flow placement) and `snippets/dispatch-variants-parity.test.ts` (the dispatch ↔ variants destination switch).

## Two independent compilation pipelines

Tests must compile via `compile-tests` (tsc → `out/`) before `npm test`. The esbuild bundle (`dist/extension.js`) is independent — it bundles the extension for VS Code, not the tests. Don't try to share outputs between the two.

## Coverage

- `npm run test:coverage` runs the suite with V8/c8 coverage (`vscode-test --coverage`); a plain `npm test` ignores coverage.
- Coverage is read ONLY from the `{ tests, coverage }` form of `.vscode-test.mjs` — a single-object config silently drops the `coverage` block. Don't collapse it back to one object.
- `tsconfig.json` has `sourceMap: true` so coverage maps back to `src/`, not the compiled `out/` JS.
- The block is `coverage: { includeAll: true, exclude: ['**/test/**', '**/*.test.*', '**/types/**'], reporter: ['text', 'html'] }` — `includeAll` surfaces zero-test files as 0% instead of dropping them; `types/**` is excluded because it's type-only (the compiler is its test).
- The `coverage/` output dir is git-ignored.
