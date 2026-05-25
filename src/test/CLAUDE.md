# src/test/CLAUDE.md

Mocha BDD tests plus two supporting sibling directories.

## File

- `extension.test.ts` — `describe('extension activation', () => { it('registers the five auto-import commands', ...) })`.

## Sibling directories

Two subdirectories under `src/test/` are large and mostly static. Reading their full trees is usually not worth the tokens — start with the summary file inside each and drill into individual files only when a task requires it.

| Directory | What's inside | Summary file |
|-----------|----------------|--------------|
| `manual-qa/` | 20 markdown files: 18 sequential checklists (`00-setup.md` → `18-style-pickers.md`) plus a top-level `README.md` and `CLAUDE.md`. Pure documentation; no code. | `manual-qa/README.md` |
| `manual-qa-workspace/` | ~158 fixture files (TS/JS/JSX/TSX/SCSS/CSS/HTML/MD/JSON/YAML plus zero-byte image and font placeholders) used as paste-import sources/destinations inside the Extension Development Host. | `manual-qa-workspace/README.md` |

The fixture workspace is excluded from both compilation surfaces — `tsconfig.json:exclude` and `eslint.config.mjs:ignores` list `src/test/manual-qa-workspace/**`. **Don't lift those exclusions.** A fixture is allowed to import from packages that aren't installed and to use DOM globals that aren't in `lib`.

If the user asks you to add or change a fixture, edit precisely the named file with `Write` or `Edit` — don't survey the surrounding tree first.

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
