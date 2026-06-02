# qa.new/

Manual QA for the Auto Import Relative Path extension. Organized into checklists (what to test) and a fixture workspace (files to test with).

## Layout

```
qa.new/
├── checklists/          Test checklists — one per destination language + one general
│   ├── general.md       Cross-destination shared behavior (run first)
│   ├── css.md           .css destination — 2 @import styles + image url() arm, no smart ids, placement, gating, DnD
│   ├── html.md          .html destination — 6-way source-type dispatch, forced-cursor placement, always-keep-ext, gating, DnD
│   ├── javascript.md    .js destination — all 7 styles, no smart identifiers, placement, gating, DnD
│   ├── jsx.md           .jsx destination — accept-all + 2-arm style model (7 JS styles or fixed asset shapes), source-ext dispatch, placement, DnD
│   ├── markdown.md      .md destination — fixed [text](…) link + 3 image styles, forced-cursor placement, markdown-star quirk, gating, DnD
│   ├── scss.md          .scss destination — 5 @use/@forward/@import styles + image url() arm, partial-_ norm, placement, gating, DnD
│   └── typescript.md    .ts destination — all 7 styles, class detection, Angular, placement
├── workspace/           Fixture workspace — open in EDH via File > Open Folder
│   ├── general/         Fixtures for general.md
│   ├── css/             Fixtures for css.md
│   ├── html/            Fixtures for html.md
│   ├── javascript/      Fixtures for javascript.md
│   ├── jsx/             Fixtures for jsx.md
│   ├── markdown/        Fixtures for markdown.md
│   ├── scss/            Fixtures for scss.md
│   └── typescript/      Fixtures for typescript.md
└── demo-workspace/      Standalone framework sandbox (Vue/Svelte/Astro/React + real node_modules)
```

## How to run a QA pass

1. Launch the Extension Development Host (F5 from the project root).
2. In the EDH, **File > Open Folder** and select the `qa.new/workspace/` directory.
3. Run `checklists/general.md` first — it covers shared behaviors.
4. Run each per-destination checklist (e.g., `checklists/typescript.md`).

## Current inventory

| Checklist | Workspace | Scope |
|-----------|-----------|-------|
| [`general.md`](checklists/general.md) | [`general/`](workspace/general/) | Copy, paste validation, same-file, notifications, edge cases |
| [`css.md`](checklists/css.md) | [`css/`](workspace/css/) | 2 `@import` styles + image `url()` arm, no smart identifiers, placement + inline-`url()`, allow-list gating, QuickPick, drag-and-drop |
| [`html.md`](checklists/html.md) | [`html/`](workspace/html/) | 6-way source-type dispatch (`<script>`/`<img>`/`<video>`/`<audio>`/`<link>`/`<track>`), no smart identifiers, `forced-cursor` placement, always-keep-extension, allow-list gating, QuickPick, drag-and-drop |
| [`javascript.md`](checklists/javascript.md) | [`javascript/`](workspace/javascript/) | 7 import styles, no smart identifiers, placement, gating, QuickPick, drag-and-drop |
| [`jsx.md`](checklists/jsx.md) | [`jsx/`](workspace/jsx/) | Accept-all gating, 2-arm style model (7 JS styles or fixed asset shapes) via source-ext dispatch, no smart identifiers, placement, `.ts`/`.tsx`→empty-snippet, QuickPick, drag-and-drop |
| [`markdown.md`](checklists/markdown.md) | [`markdown/`](workspace/markdown/) | Fixed `[text](…)` link + 3 image styles, no smart identifiers, `forced-cursor` placement + markdown-star quirk, allow-list gating, QuickPick, drag-and-drop |
| [`scss.md`](checklists/scss.md) | [`scss/`](workspace/scss/) | 5 `@use`/`@forward`/`@import` styles + image `url()` arm, no smart identifiers, partial-`_` normalization, placement + inline-`url()`, allow-list gating, QuickPick, drag-and-drop |
| [`typescript.md`](checklists/typescript.md) | [`typescript/`](workspace/typescript/) | 7 import styles, class detection, Angular PascalCase, placement, gating, QuickPick, drag-and-drop |

## Demo workspace

`demo-workspace/` is a standalone framework sandbox (Vue/Svelte/Astro/React) with
its own `package.json`/`tsconfig.json` and real `node_modules` — separate from the
checklist↔workspace model above and referenced by no checklist or test. Only its
~16 source files are tracked; run `npm install` inside it to restore the framework
packages before using it in the EDH.
