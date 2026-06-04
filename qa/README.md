# qa/

Manual QA for the Auto Import Relative Path extension. Organized into checklists (what to test) and a fixture workspace (files to test with).

## Layout

```
qa/
├── checklists/          Test checklists — one per destination language + one general
│   ├── general.md       Cross-destination shared behavior (run first)
│   ├── javascript.md    .js destination — all 7 styles, no smart identifiers, placement, gating, DnD
│   ├── typescript.md    .ts destination — all 7 styles, class detection, Angular, placement
│   ├── jsx.md           .jsx destination — accept-all + 2-arm style model (7 JS styles or fixed asset shapes), source-ext dispatch, placement, DnD
│   ├── tsx.md           .tsx destination — accept-all + two-script-arm + asset model (7 TS / 7 JS-fallback / fixed asset), Angular-only smart ids, placement, gating, DnD
│   ├── mdx.md           .mdx destination — accept-all + two-script-arm + asset model (7 TS / 7 JS-fallback / fixed asset), Angular-only smart ids, markdown-star quirk, placement, gating, DnD
│   ├── html.md          .html destination — 6-way source-type dispatch, forced-cursor placement, always-keep-ext, gating, DnD
│   ├── markdown.md      .md destination — fixed [text](…) link + 3 image styles, forced-cursor placement, markdown-star quirk, gating, DnD
│   ├── css.md           .css destination — 2 @import styles + image url() arm, no smart ids, placement, gating, DnD
│   ├── scss.md          .scss destination — 5 @use/@forward/@import styles + image url() arm, partial-_ norm, placement, gating, DnD
│   ├── vue.md           .vue destination — allow-list gating, one-table 7-TS-style script arm (all four script exts) + fixed asset arm, Angular-only smart ids, SFC <script>-block placement, DnD raw-text fallback
│   ├── astro.md         .astro destination — allow-list gating (widest accept-list), one-table 7-TS-style script arm (all four script exts) + fixed asset arm, Angular-only smart ids, frontmatter ---fence placement, DnD raw-text fallback
│   └── svelte.md        .svelte destination — allow-list gating, one-table 7-TS-style script arm (all four script exts) + fixed asset arm, Angular-only smart ids, SFC <script>-block placement (no <script setup>), DnD raw-text fallback
├── workspace/           Fixture workspace — open in EDH via File > Open Folder
│   ├── general/         Fixtures for general.md
│   ├── javascript/      Fixtures for javascript.md
│   ├── typescript/      Fixtures for typescript.md
│   ├── jsx/             Fixtures for jsx.md
│   ├── tsx/             Fixtures for tsx.md
│   ├── mdx/             Fixtures for mdx.md
│   ├── html/            Fixtures for html.md
│   ├── markdown/        Fixtures for markdown.md
│   ├── css/             Fixtures for css.md
│   ├── scss/            Fixtures for scss.md
│   ├── vue/             Fixtures for vue.md
│   ├── astro/           Fixtures for astro.md
│   └── svelte/          Fixtures for svelte.md
└── demo-workspace/      Standalone framework sandbox (Vue/Svelte/Astro/React + real node_modules)
```

## How to run a QA pass

1. Launch the Extension Development Host (F5 from the project root).
2. In the EDH, **File > Open Folder** and select the `qa/workspace/` directory.
3. Run `checklists/general.md` first — it covers shared behaviors.
4. Run each per-destination checklist (e.g., `checklists/typescript.md`).

## Current inventory

| Checklist | Workspace | Scope |
|-----------|-----------|-------|
| [`general.md`](checklists/general.md) | [`general/`](workspace/general/) | Copy, paste validation, same-file, notifications, edge cases |
| [`javascript.md`](checklists/javascript.md) | [`javascript/`](workspace/javascript/) | 7 import styles, no smart identifiers, placement, gating, QuickPick, drag-and-drop |
| [`typescript.md`](checklists/typescript.md) | [`typescript/`](workspace/typescript/) | 7 import styles, class detection, Angular PascalCase, placement, gating, QuickPick, drag-and-drop |
| [`jsx.md`](checklists/jsx.md) | [`jsx/`](workspace/jsx/) | Accept-all gating, 2-arm style model (7 JS styles or fixed asset shapes) via source-ext dispatch, no smart identifiers, placement, `.ts`/`.tsx`→empty-snippet, QuickPick, drag-and-drop |
| [`tsx.md`](checklists/tsx.md) | [`tsx/`](workspace/tsx/) | Accept-all gating, two-script-arm + asset model (7 TS / 7 JS-fallback styles or fixed asset shapes), Angular-only smart identifiers, placement, gating, QuickPick, drag-and-drop |
| [`mdx.md`](checklists/mdx.md) | [`mdx/`](workspace/mdx/) | Accept-all gating, two-script-arm + asset model (7 TS / 7 JS-fallback styles or fixed asset shapes), Angular-only smart identifiers, markdown-star `.mdx`≠`.tsx` quirk, placement, gating, QuickPick, drag-and-drop |
| [`html.md`](checklists/html.md) | [`html/`](workspace/html/) | 6-way source-type dispatch (`<script>`/`<img>`/`<video>`/`<audio>`/`<link>`/`<track>`), no smart identifiers, `forced-cursor` placement, always-keep-extension, allow-list gating, QuickPick, drag-and-drop |
| [`markdown.md`](checklists/markdown.md) | [`markdown/`](workspace/markdown/) | Fixed `[text](…)` link + 3 image styles, no smart identifiers, `forced-cursor` placement + markdown-star quirk, allow-list gating, QuickPick, drag-and-drop |
| [`css.md`](checklists/css.md) | [`css/`](workspace/css/) | 2 `@import` styles + image `url()` arm, no smart identifiers, placement + inline-`url()`, allow-list gating, QuickPick, drag-and-drop |
| [`scss.md`](checklists/scss.md) | [`scss/`](workspace/scss/) | 5 `@use`/`@forward`/`@import` styles + image `url()` arm, no smart identifiers, partial-`_` normalization, placement + inline-`url()`, allow-list gating, QuickPick, drag-and-drop |
| [`vue.md`](checklists/vue.md) | [`vue/`](workspace/vue/) | Allow-list gating, one-table two-arm style model (7 TS styles for all four script sources **or** fixed asset shape), Angular-only smart identifiers, SFC `<script>`-block placement, shared `typescriptImportStyle`, QuickPick, drag-and-drop incl. raw-text fallback |
| [`astro.md`](checklists/astro.md) | [`astro/`](workspace/astro/) | Allow-list gating (widest accept-list), one-table two-arm style model (7 TS styles for all four script sources **or** fixed asset shape), Angular-only smart identifiers, frontmatter `---`-fence placement, shared `typescriptImportStyle`, QuickPick, drag-and-drop incl. raw-text fallback |
| [`svelte.md`](checklists/svelte.md) | [`svelte/`](workspace/svelte/) | Allow-list gating, one-table two-arm style model (7 TS styles for all four script sources **or** fixed asset shape), Angular-only smart identifiers, SFC `<script>`-block placement (no `<script setup>`), shared `typescriptImportStyle`, QuickPick, drag-and-drop incl. raw-text fallback |

## Demo workspace

`demo-workspace/` is a standalone framework sandbox (Vue/Svelte/Astro/React) with
its own `package.json`/`tsconfig.json` and real `node_modules` — separate from the
checklist↔workspace model above and referenced by no checklist or test. Only its
~16 source files are tracked; run `npm install` inside it to restore the framework
packages before using it in the EDH.
