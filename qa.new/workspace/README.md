# qa.new/workspace/

Fixture workspace for manual QA testing. Open this folder as the workspace in the Extension Development Host (F5) so the tester has every file needed for the checklists.

Organized by destination language — one directory per checklist. Each directory is self-contained with all the fixtures its checklist needs.

## Setup

1. Launch the Extension Development Host (F5 from the root project).
2. In the EDH, **File > Open Folder** and select this `workspace/` directory.
3. The Explorer sidebar shows language directories — navigate into the one you're testing.

## Tip: undo after each test

Destination files (e.g., `typescript/destinations/`) are pre-filled with specific content for placement tests. After pasting an import, press **Cmd+Z** (or **Ctrl+Z**) to undo before the next test step so the file returns to its original state.

## Languages

| Directory | Checklist | Files | Scope |
|-----------|-----------|-------|-------|
| [`general/`](general/) | [`checklists/general.md`](../checklists/general.md) | 9 | Cross-destination shared behavior |
| [`css/`](css/) | [`checklists/css.md`](../checklists/css.md) | 20 | `.css` destination — 2 `@import` styles + image `url()` arm, placement + inline-`url()`, allow-list gating, DnD (no smart identifiers) |
| [`javascript/`](javascript/) | [`checklists/javascript.md`](../checklists/javascript.md) | 34 | `.js` destination — styles, placement, gating, DnD (no smart identifiers) |
| [`typescript/`](typescript/) | [`checklists/typescript.md`](../checklists/typescript.md) | 53 | `.ts` destination — styles, class detection, Angular, placement, gating, DnD |

See each directory's own `README.md` for the full file tree and fixture-to-checklist mapping.
