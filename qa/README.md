# qa/

Manual QA suite and fixture workspaces for the Auto Import Relative Path extension.

## Layout

| Path | Purpose |
|------|---------|
| `checklists/` | 18 sequential markdown checklists driving the human QA pass before each release. |
| `workspace/` | ~174 fixture files opened as a VS Code folder in the Extension Development Host. Also used as `FIXTURE_ROOT` by 8 automated Mocha tests. |
| `demo-workspace/` | Small fixture workspace (~16 source files + framework `node_modules`). |

## Running a QA pass

1. `npm run compile` from the project root.
2. Press **F5** to launch the Extension Development Host.
3. In the EDH window, **File > Open Folder...** > `qa/workspace/`.
4. Walk `checklists/00-setup.md` through `checklists/18-style-pickers.md` in order.
5. Sign off in the master matrix at the bottom of `checklists/README.md`.

## See also

- [`checklists/README.md`](checklists/README.md) — run-order table, fixture-purpose map, master sign-off matrix.
- [`checklists/CLAUDE.md`](checklists/CLAUDE.md) — checklist anatomy, cross-file invariants, update rules.
- [`workspace/README.md`](workspace/README.md) — full fixture layout, coverage matrix, maintenance notes.
- [`workspace/CLAUDE.md`](workspace/CLAUDE.md) — fixture-role mappings, toolchain exclusions, scan restrictions.
