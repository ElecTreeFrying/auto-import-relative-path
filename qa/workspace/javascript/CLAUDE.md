# qa/workspace/javascript/CLAUDE.md

Fixtures for `checklists/javascript.md` — the `.js` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `javascript.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `javascript.md`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Plain `.js` source files to copy/drag FROM (`foo.js`) plus the primary paste/drop destination (`bar.js`). `.js` has no smart-identifier detection, so — unlike `typescript/` — there are no `classes/` or `angular/` subtrees. |
| `destinations/` | Pre-filled `.js` files for placement tests. Each has specific content (imports, comments, code) that the checklist expects, with exact insertion line numbers. **Undo after each paste** so the file returns to its expected state. |
| `rejected/` | Non-`.js` files (one per rejected extension) for gating rejection tests. Content is irrelevant — only the file extension matters. Most are empty placeholders. |

## Fixture content expectations

- **`src/foo.js`** — a plain module (`export const foo = 'foo';`). `.js` has no smart-identifier detection, so the inserted tab stop is always a bare `$1`; no `export class` or Angular naming is needed (or honored).
- **`destinations/*.js`** — content matters. The checklist specifies exact file contents and expected insertion line numbers. Do not change these files without updating the checklist. `large-file.js`'s three leading imports are inert scan-bait for the Bottom placement scan (textual; they need not resolve — there is no `src/helpers.js`).
- **`rejected/*`** — content is irrelevant; only the extension matters for gating. Binary-type files (`.png`, `.woff2`, `.mp4`, `.mp3`, `.pdf`) are empty placeholders.
