# src/test/

Mocha BDD tests run via `@vscode/test-cli` against the `out/` build (NOT the esbuild bundle in `dist/`), plus two sibling directories that hold the manual-QA suite.

## Files

| File | Purpose |
|------|---------|
| `extension.test.ts` | Smoke test: asserts the five auto-import commands are registered after extension activation. |

## Subdirectories

| Directory | What it is | Where to look |
|-----------|------------|----------------|
| `manual-qa/` | 18 sequential markdown checklists (`00-setup.md` → `18-…`) for the human manual-QA pass before each release. Pure documentation, no executable code. | `manual-qa/README.md` for the run order. |
| `manual-qa-workspace/` | ~158 fixture files (every supported source/destination extension, deep-path stress fixtures, gating-rejection samples, all 5 Angular suffixes, full export-shape variety for TS/JS/JSX/TSX, plus binary placeholders for images and fonts). Opened as a folder in the Extension Development Host so testers paste imports between fixtures. | `manual-qa-workspace/README.md` for the layout and coverage matrix. |

> **Token-budget guidance for AI assistants** — the two subdirectories above are large, static, and unsearchable for useful signal. Don't read individual files inside them; read only their internal `README.md` if context is genuinely needed. The fixture workspace is excluded from `tsc` and `eslint` (`tsconfig.json:exclude`, `eslint.config.mjs:ignores`).

## Running tests

```bash
npm test                          # full pretest chain (compile-tests + compile + lint) then runner
npm test -- --grep "<pattern>"    # filter Mocha by name (forwarded to @vscode/test-cli)
npm run watch-tests               # rebuild on test source change
```

The runner is configured in `.vscode-test.mjs` (BDD UI, glob `out/test/**/*.test.js`). Tests must be compiled via `npm run compile-tests` before they run — the runner only sees emitted JS.

## Where to add new tests

New `*.test.ts` file in this directory. The runner picks it up automatically after `compile-tests` emits the matching `.js` to `out/test/`.

Use Node's built-in `assert` (Chai/Sinon were dropped — see `CLAUDE.md` here for context). BDD style (`describe`/`it`).
