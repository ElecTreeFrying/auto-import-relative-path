# src/test/

Mocha BDD tests. The suite's fixtures live in [`fixtures/`](fixtures/) — self-contained, with no dependency on the top-level `qa/` tree.

## Layout

| Path | Purpose |
|------|---------|
| `extension.test.ts` | Activation smoke test |
| `gating.test.ts` | Extension-pair gating tests (`isPairSupported`) |
| `commands/` | Command-level tests (`copy-file-path`, `copy-paste`, `paste-import`, `paste-import-with-style`, `set-default-import-style`, `reset-import-styles`) — six of the eight commands. The two remaining settings-only commands (`set-import-placement`, `toggle-preserve-script-extension`) have no command-level test; they're covered by the activation/registration smoke checks in `extension.test.ts` |
| `drop/` | Drag-and-drop provider tests (`provider`, `selector`) |
| `editor/` | Editor-helper tests (`file-path-info`, `insert-snippet`, `notification`, `placement`, `placement-parity`) |
| `path/` | Pure path-math tests (`relative`, `extension`, `import-type`) |
| `config/` | Workspace-config access tests (`settings`) |
| `constants/` | Gating-table tests (`extensions`) |
| `snippets/` | Snippet builder, dispatch, variants, class-name, react, and styles tests, plus `dispatch-variants-parity` — a structural test that reads source to pin the dispatch↔variants destination switch |
| `snippets/languages/` | Per-language snippet builder tests (10 files: 9 per-destination-language — incl. `latex` — plus `framework-component` for the shared Vue/Svelte/Astro path) |
| `fixtures/` | Self-contained fixture tree (paste sources + destinations) opened by the 15 fixture-driven tests via `FIXTURE_ROOT`; excluded from `tsc`/ESLint |

## Running

```bash
npm test                         # pretest (compile-tests + compile + lint) then run
npm test -- --grep "<pattern>"   # filter by Mocha test name
npm run test:coverage            # pretest then run with V8/c8 coverage (text + HTML report under coverage/)
npm run compile-tests            # tsc → out/ (prerequisite — tests don't use esbuild)
npm run watch-tests              # tsc watch for the test build
```

## Adding a new test

1. New file here, mirroring the source path: `src/snippets/foo.ts` → `src/test/snippets/foo.test.ts`.
2. Use Mocha BDD style (`describe`/`it`) and Node `assert`.
3. Run `npm run compile-tests` before `npm test` — the runner picks up `out/test/**/*.test.js`.

See [`CLAUDE.md`](CLAUDE.md) (this directory) for conventions and gotchas.
