# src/test/

Mocha BDD tests and two manual-QA directories.

## Layout

| Path | Purpose |
|------|---------|
| `extension.test.ts` | Activation smoke test |
| `commands/` | Command-level tests (`paste-import`) |
| `editor/` | Editor-helper tests (`insert-snippet` placement) |
| `path/` | Pure path-math tests (`relative`, `extension`, `import-type`) |
| `constants/` | Gating-table tests (`extensions`) |
| `snippets/` | Snippet builder, dispatch, variants, class-name, and styles tests |
| `snippets/languages/` | Per-language snippet builder tests (9 files, one per destination language) |
| `demo-workspace/` | Small fixture workspace consumed by the Mocha test runner |
| `manual-qa/` | 18 sequential checklists for human QA before release |
| `manual-qa-workspace/` | ~174 fixture files for manual QA (opened in the Extension Development Host) |

## Running

```bash
npm test                         # pretest (compile-tests + compile + lint) then run
npm test -- --grep "<pattern>"   # filter by Mocha test name
npm run compile-tests            # tsc → out/ (prerequisite — tests don't use esbuild)
npm run watch-tests              # tsc watch for the test build
```

## Adding a new test

1. New file here, mirroring the source path: `src/snippets/foo.ts` → `src/test/snippets/foo.test.ts`.
2. Use Mocha BDD style (`describe`/`it`) and Node `assert`.
3. Run `npm run compile-tests` before `npm test` — the runner picks up `out/test/**/*.test.js`.

See `CLAUDE.md` (this directory) for conventions and gotchas.
