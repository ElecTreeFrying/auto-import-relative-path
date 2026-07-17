# qa/workspace/typescript/CLAUDE.md

Fixtures for `checklists/typescript.md` — the `.ts` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `typescript.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `typescript.md`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Source files to copy/drag FROM. Contains plain `.ts` files, Angular-convention files (no `export class`), and files WITH `export class` declarations. Also used as paste destinations for some tests. |
| `destinations/` | Pre-filled `.ts` files for placement tests. Each file has specific content (imports, comments, code) that the checklist expects. **Undo after each paste** so the file returns to its expected state. |
| `rejected/` | Non-`.ts` files (one per rejected extension) for gating rejection tests. Most are empty placeholders — content doesn't matter, only the file extension. |

## Fixture content expectations

- **`src/classes/*.ts`** — must contain real `export class` declarations (or commented-out versions) matching what the checklist specifies. The class name detection reads actual file content.
- **`src/angular/*.ts`** — must NOT contain `export class` (otherwise class detection takes priority over Angular PascalCase naming). The checklist tests the fallthrough path.
- **`destinations/*.ts`** — content matters. The checklist specifies exact file contents and expected insertion line numbers. Do not change these files without updating the checklist.
- **`rejected/*`** — content is irrelevant. Only the file extension matters for gating tests. Binary-type files (`.png`, `.mp4`, `.woff2`, `.mp3`, `.pdf`) are empty placeholders. The `.tex`/`.bib`/`.eps` reject stubs each carry a short self-documenting header naming the checklist case they exercise (§1.22–§1.24); content is still irrelevant to gating.
