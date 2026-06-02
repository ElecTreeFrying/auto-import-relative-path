# src/test/CLAUDE.md

Mocha BDD tests that run from `out/`, not `dist/`. Manual QA checklists and fixture workspaces live in the top-level `qa/` directory — see [`qa/checklists/CLAUDE.md`](../../qa/checklists/CLAUDE.md) and [`qa/workspace/CLAUDE.md`](../../qa/workspace/CLAUDE.md).

## Conventions

- **Mocha BDD** (`describe`/`it`), configured in `.vscode-test.mjs` under `tests[0].mocha.ui: 'bdd'` (the config uses the `{ tests, coverage }` form).
- **Node `assert`** only — no Chai, no Sinon.
- **Tests compile via `tsc -p . --outDir out`** (`npm run compile-tests`), not the esbuild pipeline. The runner glob is `out/test/**/*.test.js`.
- Test file names mirror the source path: `src/path/relative.ts` → `test/path/relative.test.ts`.

## Two independent compilation pipelines

Tests must compile via `compile-tests` (tsc → `out/`) before `npm test`. The esbuild bundle (`dist/extension.js`) is independent — it bundles the extension for VS Code, not the tests. Don't try to share outputs between the two.

## Coverage

- `npm run test:coverage` runs the suite with V8/c8 coverage (`vscode-test --coverage`); line coverage sits at ~96%. A plain `npm test` ignores coverage.
- Coverage is read ONLY from the `{ tests, coverage }` form of `.vscode-test.mjs` — a single-object config silently drops the `coverage` block. Don't collapse it back to one object.
- `tsconfig.json` has `sourceMap: true` so coverage maps back to `src/`, not the compiled `out/` JS.
- The block is `coverage: { includeAll: true, exclude: ['**/test/**', '**/*.test.*', '**/types/**'], reporter: ['text', 'html'] }` — `includeAll` surfaces zero-test files as 0% instead of dropping them; `types/**` is excluded because it's type-only (the compiler is its test).
- The `coverage/` output dir is git-ignored.
