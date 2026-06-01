# qa.new/checklists/CLAUDE.md

Each file in this directory is a manual QA checklist. Naming convention: `{language}.md` maps to `workspace/{language}/`.

## Files

| File | Scope |
|------|-------|
| `general.md` | Cross-destination shared behavior — clipboard validation, same-file rejection, notifications, toast buttons, edge cases, path computation, extension stripping, DnD universal behaviors, Pick Style / Set Default QuickPick mechanics, settings mid-session. Run first; per-destination checklists assume it passed. |
| `javascript.md` | `.js` destination — gating matrix, 7 import styles + style-name drift, no smart identifiers (N/A for `.js`), placement modes, Pick Style / Set Default, drag-and-drop, edge cases. |
| `typescript.md` | `.ts` destination — gating matrix, 7 import styles + style-name drift, smart identifiers (exported-class detection + Angular PascalCase), placement modes, Pick Style / Set Default (TS-specific), drag-and-drop (TS-specific), edge cases. |

## Rules

- **Checklist changes propagate.** When a checklist is added, removed, or updated, update surrounding docs and the workspace. Full propagation list is in [`../CLAUDE.md`](../CLAUDE.md) under "Propagation rule."
- **Checklist → workspace sync.** When a checklist references a fixture file, that file must exist in `workspace/{language}/`. After editing a checklist, verify the workspace has every referenced path. Add missing fixtures.
- **No general.md duplication.** Per-destination checklists must not re-test behaviors covered by `general.md` (clipboard validation, same-file rejection, notification wording, toast button actions, path computation, extension stripping, DnD same-file / notification behavior, Pick Style / Set Default QuickPick mechanics, settings mid-session). If a behavior is destination-neutral, it belongs in `general.md`.
- **Automated-test coverage.** Many behaviors are fully covered by the automated test suite in `src/test/`. Checklists should only contain items that require manual EDH verification — VS Code UI interactions, setting-change wiring, toast content, QuickPick rendering, drag-and-drop integration.
