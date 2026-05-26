# src/test/CLAUDE.md

Mocha BDD tests that run from `out/`, not `dist/`. Manual QA checklists and fixture workspaces live in the top-level `qa/` directory — see [`qa/checklists/CLAUDE.md`](../../qa/checklists/CLAUDE.md) and [`qa/workspace/CLAUDE.md`](../../qa/workspace/CLAUDE.md).

## Conventions

- **Mocha BDD** (`describe`/`it`), configured in `.vscode-test.mjs` with `ui: 'bdd'`.
- **Node `assert`** only — no Chai, no Sinon.
- **Tests compile via `tsc -p . --outDir out`** (`npm run compile-tests`), not the esbuild pipeline. The runner glob is `out/test/**/*.test.js`.
- Test file names mirror the source path: `src/path/relative.ts` → `test/path/relative.test.ts`.

## Two independent compilation pipelines

Tests must compile via `compile-tests` (tsc → `out/`) before `npm test`. The esbuild bundle (`dist/extension.js`) is independent — it bundles the extension for VS Code, not the tests. Don't try to share outputs between the two.
