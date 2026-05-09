# src/test/CLAUDE.md

Mocha BDD tests. Currently a single smoke test asserting the three commands register on activation.

## File

- `extension.test.ts` — `describe('extension activation', () => { it('registers the three auto-import commands', ...) })`.

## Toolchain

- **Runner**: `@vscode/test-cli` (configured in `.vscode-test.mjs`, BDD UI).
- **Test build**: `npm run compile-tests` runs `tsc -p . --outDir out`. The runner glob is `out/test/**/*.test.js` — *only* compiled output gets picked up.
- **Bundle vs test build**: tests run from `out/`, NOT from the esbuild bundle in `dist/`. The two pipelines are independent.
- **Assertions**: Node's built-in `assert`. **Don't reintroduce Chai or Sinon** — they were dropped in commit `f06101f` precisely to remove third-party deps.

## Running tests

```bash
npm test                              # full pretest chain (compile-tests + compile + lint) then runner
npm test -- --grep "<pattern>"        # filter Mocha by name (forwarded to test-cli)
npm run watch-tests                   # rebuild on test source change
```

## Adding a new test

- New `*.test.ts` file under `src/test/`. The runner glob picks it up automatically once `compile-tests` has emitted it.
- BDD style: `describe(...)` and `it(...)`. No `before`/`after` hooks needed unless you're activating the extension or setting up state.
- Use Node's `assert.ok` / `assert.strictEqual` / `assert.deepStrictEqual`. No assertion library imports.
