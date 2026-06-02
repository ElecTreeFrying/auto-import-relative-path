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
| [`html/`](html/) | [`checklists/html.md`](../checklists/html.md) | 18 | `.html` destination — 6-way source-type dispatch (`<script>`/`<img>`/`<video>`/`<audio>`/`<link>`/`<track>`), `forced-cursor` placement, always-keep-extension, allow-list gating, DnD (no smart identifiers) |
| [`javascript/`](javascript/) | [`checklists/javascript.md`](../checklists/javascript.md) | 34 | `.js` destination — styles, placement, gating, DnD (no smart identifiers) |
| [`jsx/`](jsx/) | [`checklists/jsx.md`](../checklists/jsx.md) | 30 | `.jsx` destination — accept-all + 2-arm style model (7 JS styles or fixed asset shapes), source-ext dispatch, placement, DnD (no smart identifiers) |
| [`markdown/`](markdown/) | [`checklists/markdown.md`](../checklists/markdown.md) | 17 | `.md` destination — fixed `[text](…)` link + 3 image styles, `forced-cursor` placement + markdown-star quirk, allow-list gating, DnD (no smart identifiers) |
| [`scss/`](scss/) | [`checklists/scss.md`](../checklists/scss.md) | 33 | `.scss` destination — 5 `@use`/`@forward`/`@import` styles + image `url()` arm, partial-`_` normalization, preserve toggle, placement + inline-`url()`, allow-list gating, DnD (no smart identifiers) |
| [`tsx/`](tsx/) | [`checklists/tsx.md`](../checklists/tsx.md) | 39 | `.tsx` destination — accept-all + two-script-arm + asset model (7 TS / 7 JS-fallback styles or fixed asset shapes), Angular-only smart identifiers, placement, gating, DnD |
| [`typescript/`](typescript/) | [`checklists/typescript.md`](../checklists/typescript.md) | 53 | `.ts` destination — styles, class detection, Angular, placement, gating, DnD |

See each directory's own `README.md` for the full file tree and fixture-to-checklist mapping.
