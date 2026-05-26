# qa/CLAUDE.md

Manual QA suite and fixture workspaces. No executable code, no compilation surface — everything here is either markdown procedure or static fixture files.

## Subdirectories

| Directory | Role | Key rule |
|-----------|------|----------|
| `checklists/` | 21 sequential QA checklists + [`00-setup.md`](checklists/00-setup.md) + master sign-off | Read [`README.md`](checklists/README.md) first to find the specific checklist you need. Don't survey the tree. |
| `workspace/` | ~174 fixture files for manual QA; also `FIXTURE_ROOT` for 8 Mocha tests | Never `find`, `grep`, or `ls -R`. Read its [`CLAUDE.md`](workspace/CLAUDE.md) for fixture-role mappings or [`README.md`](workspace/README.md) for layout. |
| `demo-workspace/` | Small framework fixture workspace with real `node_modules` | No internal guides. Has its own `package.json` and `tsconfig.json` — don't confuse with the root project's. |

## Invariants

- **Don't scan `workspace/` wholesale.** The ~174 files are static placeholders; the sibling docs already index everything worth knowing.
- **Fixture filenames are locked.** The ~37 baseline names in [`workspace/README.md`](workspace/README.md) ("Maintenance notes") are referenced literally by checklists. Renaming one silently breaks manual QA.
- **Excluded from every toolchain surface.** `qa/` falls outside `tsconfig.json`'s `include` glob (`src/**/*`). `eslint.config.mjs` explicitly ignores `qa/workspace/**` and `qa/demo-workspace/**`. Don't lift these — fixtures intentionally import uninstalled packages and use undeclared globals.
- **`demo-workspace/` has no internal guides.** If you need context on its fixtures, check which test files reference it (currently none do).
