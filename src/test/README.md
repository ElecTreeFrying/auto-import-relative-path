# src/test/

Mocha BDD tests run via `@vscode/test-cli` against the `out/` build (NOT the esbuild bundle in `dist/`).

## Files

| File | Purpose |
|------|---------|
| `extension.test.ts` | Smoke test: asserts the three auto-import commands are registered after extension activation. |

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
