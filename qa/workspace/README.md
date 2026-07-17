# qa/workspace/

Fixture workspace for manual QA testing. Open this folder as the workspace in the Extension Development Host (F5) so the tester has every file needed for the checklists.

Organized by destination language — one directory per checklist. Each directory is self-contained with all the fixtures its checklist needs.

## Setup

1. Launch the Extension Development Host (F5 from the root project).
2. In the EDH, **File > Open Folder** and select this `workspace/` directory.
3. The Explorer sidebar shows language directories — navigate into the one you're testing.

## Tip: undo after each test

Destination files (e.g., `typescript/destinations/`) are pre-filled with specific content for placement tests. After pasting an import, press **Cmd+Z** (or **Ctrl+Z**) to undo before the next test step so the file returns to its original state.

## Languages

| Directory | Checklist | Scope |
|-----------|-----------|-------|
| [`general/`](general/) | [`checklists/general.md`](../checklists/general.md) | Cross-destination shared behavior |
| [`javascript/`](javascript/) | [`checklists/javascript.md`](../checklists/javascript.md) | `.js` destination — styles, placement, gating, DnD (no smart identifiers) |
| [`typescript/`](typescript/) | [`checklists/typescript.md`](../checklists/typescript.md) | `.ts` destination — styles, class detection, Angular, placement, gating, DnD |
| [`jsx/`](jsx/) | [`checklists/jsx.md`](../checklists/jsx.md) | `.jsx` destination — accept-all + two-arm style model (JS styles or fixed asset shapes), source-ext dispatch, placement, DnD (no smart identifiers) |
| [`tsx/`](tsx/) | [`checklists/tsx.md`](../checklists/tsx.md) | `.tsx` destination — accept-all + two-script-arm + asset model (TS / JS-fallback styles or fixed asset shapes), Angular-only smart identifiers, placement, gating, DnD |
| [`mdx/`](mdx/) | [`checklists/mdx.md`](../checklists/mdx.md) | `.mdx` destination — accept-all + two-script-arm + asset model (TS / JS-fallback styles or fixed asset shapes), Angular-only smart identifiers, markdown-star `.mdx`≠`.tsx` quirk, placement, gating, DnD |
| [`html/`](html/) | [`checklists/html.md`](../checklists/html.md) | `.html` destination — source-type dispatch (`<script>`/`<img>`/`<video>`/`<audio>`/`<link>`/`<track>`), `forced-cursor` placement, always-keep-extension, allow-list gating, DnD (no smart identifiers) |
| [`markdown/`](markdown/) | [`checklists/markdown.md`](../checklists/markdown.md) | `.md` destination — fixed `[text](…)` link + image styles, `forced-cursor` placement + markdown-star quirk, allow-list gating, DnD (no smart identifiers) |
| [`css/`](css/) | [`checklists/css.md`](../checklists/css.md) | `.css` destination — `@import` styles + image `url()` arm, placement + inline-`url()`, allow-list gating, DnD (no smart identifiers) |
| [`scss/`](scss/) | [`checklists/scss.md`](../checklists/scss.md) | `.scss` destination — `@use`/`@forward`/`@import` styles + image `url()` arm, partial-`_` normalization, preserve toggle, placement + inline-`url()`, allow-list gating, DnD (no smart identifiers) |
| [`vue/`](vue/) | [`checklists/vue.md`](../checklists/vue.md) | `.vue` destination — allow-list gating, one-table two-arm style model (TS styles for every script source **or** fixed asset shape), Angular-only smart identifiers, SFC `<script>`-block placement, DnD incl. drop suppression |
| [`astro/`](astro/) | [`checklists/astro.md`](../checklists/astro.md) | `.astro` destination — allow-list gating (widest accept-list), one-table two-arm style model (TS styles for every script source **or** fixed asset shape), Angular-only smart identifiers, frontmatter `---`-fence placement (no `<script setup>`/`<script context="module">`), DnD incl. drop suppression |
| [`svelte/`](svelte/) | [`checklists/svelte.md`](../checklists/svelte.md) | `.svelte` destination — allow-list gating, one-table two-arm style model (TS styles for every script source **or** fixed asset shape), Angular-only smart identifiers, SFC `<script>`-block placement (no `<script setup>`), DnD incl. drop suppression |
| [`latex/`](latex/) | [`checklists/latex.md`](../checklists/latex.md) | `.tex` destination — allow-list gating (`.tex`/`.bib` + graphics `.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`; web images `.svg`/`.gif`/`.webp`/`.avif` rejected), source-extension dispatch (graphics→`figure`/`\includegraphics` · `.tex`→`\input`/`\include` · `.bib`→`\addbibresource`/`\bibliography`) + `preserveGraphicsFileExtension` toggle, `forced-cursor` placement (body not preamble), no smart identifiers, DnD; the default `figure` is the only multi-line snippet |

See each directory's own `README.md` for the full file tree and fixture-to-checklist mapping.
