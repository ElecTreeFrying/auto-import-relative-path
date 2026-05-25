# src/test/CLAUDE.md

Mocha BDD tests that run from `out/`, not `dist/`. Two sibling directories hold manual-QA procedure and fixtures.

## Conventions

- **Mocha BDD** (`describe`/`it`), configured in `.vscode-test.mjs` with `ui: 'bdd'`.
- **Node `assert`** only — no Chai, no Sinon.
- **Tests compile via `tsc -p . --outDir out`** (`npm run compile-tests`), not the esbuild pipeline. The runner glob is `out/test/**/*.test.js`.
- Test file names mirror the source path: `src/path/relative.ts` → `test/path/relative.test.ts`.

## Two independent compilation pipelines

Tests must compile via `compile-tests` (tsc → `out/`) before `npm test`. The esbuild bundle (`dist/extension.js`) is independent — it bundles the extension for VS Code, not the tests. Don't try to share outputs between the two.

## Sibling directories — DO NOT read into

| Directory | What it is | How to use it |
|-----------|------------|---------------|
| `demo-workspace/` | Small fixture workspace (~16 source files + framework `node_modules`) consumed by the Mocha test runner. | Only read or edit a specific fixture when a test references it by path. Don't survey the tree. |
| `manual-qa/` | 18 sequential markdown checklists for human QA. Pure documentation — no executable code. | Read its `README.md` for the run-order table and fixture-purpose map. Then read only the specific checklist file you need. See its own `CLAUDE.md` for the checklist anatomy and update rules. |
| `manual-qa-workspace/` | ~174 fixture files opened in the Extension Development Host for manual QA. Not compiled, not linted. | Never `find`, `grep`, or `ls -R` across this directory. Read its own `CLAUDE.md` for the fixture-roles table, or its `README.md` for layout and maintenance notes. Edit a specific fixture only when a task names it. |

The scan restriction on `manual-qa-workspace/` is load-bearing — the ~174 files are static placeholders that produce no signal beyond what the sibling `README.md` and `CLAUDE.md` already document.
