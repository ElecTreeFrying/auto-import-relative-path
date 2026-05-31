# src/test/

Mocha BDD tests. Manual QA checklists and fixture workspaces live in the top-level `qa/` directory.

## Layout

| Path | Purpose |
|------|---------|
| `extension.test.ts` | Activation smoke test |
| `gating.test.ts` | Extension-pair gating tests (`isPairSupported`) |
| `commands/` | Command-level tests (`paste-import` only — the other four commands have no test file) |
| `drop/` | Drag-and-drop provider tests (`provider`) |
| `editor/` | Editor-helper tests (`insert-snippet`, `notification`, `placement`) |
| `path/` | Pure path-math tests (`relative`, `extension`, `import-type`) |
| `constants/` | Gating-table tests (`extensions`) |
| `snippets/` | Snippet builder, dispatch, variants, class-name, and styles tests |
| `snippets/languages/` | Per-language snippet builder tests (9 files, one per destination language) |

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

See [`CLAUDE.md`](CLAUDE.md) (this directory) for conventions and gotchas.
