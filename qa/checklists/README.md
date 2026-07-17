# qa/checklists/

Manual QA checklists for the extension. One general checklist for shared behavior, plus one per destination language.

## Execution order

1. **`general.md`** — always run first. Covers cross-destination shared behavior.
2. Per-destination checklists — run after general passes. Each assumes general's items are already verified.

## Inventory

| Checklist | Scope |
|-----------|-------|
| [`general.md`](general.md) | Copy File Path, clipboard validation, same-file rejection, Alt+D failure paths, all notification toasts + buttons, edge cases (rapid pastes, many files, unicode, spaces), path computation, extension stripping, DnD universal behaviors, Pick Style QuickPick mechanics, Set Default QuickPick mechanics, settings mid-session, settings commands (Set Import Placement / Toggle Preserve / Reset All Import Styles) |
| [`javascript.md`](javascript.md) | Gating matrix, all import styles + style-name drift, no smart identifiers (§5 N/A for `.js`), Bottom/Top/Cursor placement, Pick Style, Set Default, drag-and-drop, edge cases |
| [`typescript.md`](typescript.md) | Gating matrix, all import styles + style-name drift, smart identifiers (exported-class detection + Angular PascalCase), Bottom/Top/Cursor placement, Pick Style (TS-specific), Set Default (TS-specific), drag-and-drop (TS-specific), edge cases |
| [`jsx.md`](jsx.md) | Accept-all gating (no source rejections; same-file owned by general.md), two-arm style model via source-extension dispatch (JavaScript styles **or** fixed asset shapes) + style-name drift, no smart identifiers (§5 N/A), Bottom/Top/Cursor placement incl. leading-`*`-is-comment, `.ts`/`.tsx` + `.tex`/`.bib`/`.eps`→empty-snippet, Pick Style, Set Default (shared `javascriptImportStyle`), drag-and-drop incl. drop suppression (empty-snippet `.ts`/`.tsx` source) |
| [`tsx.md`](tsx.md) | Accept-all gating (no source rejections; same-file owned by general.md), two-script-arm + asset style model (TypeScript styles for `.ts`/`.tsx` **or** JavaScript styles for `.js`/`.jsx` via fallback **or** fixed asset shapes; every source non-empty **except** `.tex`/`.bib`/`.eps` empty-snippet) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill), Bottom/Top/Cursor placement incl. leading-`*`-is-comment, shared `typescriptImportStyle`/`javascriptImportStyle`, Pick Style, Set Default, drag-and-drop (suppressed-drop only for `.tex`/`.bib`/`.eps`), markdown-star `.mdx`≠`.tsx` edge |
| [`mdx.md`](mdx.md) | Accept-all gating (no source rejections; same-file owned by general.md), two-script-arm + asset style model (TypeScript styles for `.ts`/`.tsx` **or** JavaScript styles for `.js`/`.jsx` via fallback **or** fixed asset shapes; every source non-empty **except** `.tex`/`.bib`/`.eps` empty-snippet) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill), generic Bottom/Top/Cursor placement incl. leading-`*`-**is-content**, shared `typescriptImportStyle`/`javascriptImportStyle`, Pick Style, Set Default, drag-and-drop (suppressed-drop only for `.tex`/`.bib`/`.eps`), markdown-star `.mdx`≠`.tsx` edge |
| [`html.md`](html.md) | Allow-list gating (`.js` `.css` + image/video/audio/`.vtt`; `.html`→`.html` rejected), source-type dispatch (`<script>`/`<img>`/`<video>`/`<audio>`/`<link>`/`<track>`), no smart identifiers (§5 N/A), `forced-cursor` placement (setting ignored, column follows cursor), always-keep-extension, Pick Style (tagless style-0 descriptions), Set Default, drag-and-drop, comment-marker mismatch edges |
| [`markdown.md`](markdown.md) | Allow-list gating (`.md` + image; **`.md`→`.md` accepted**, media/`.vtt`/data/stylesheets rejected), source-type dispatch (fixed `[text](…)` link + the `markdownImageImportStyle` image styles) + style-name drift, no smart identifiers (§5 N/A), `forced-cursor` placement (setting ignored, column follows cursor, markdown-star quirk), always-keep-extension, Pick Style, Set Default, drag-and-drop, markdown-star vs `.tsx` edge |
| [`css.md`](css.md) | Allow-list gating (`.css` + image), `@import` styles + fixed image `url()` arm + style-name drift, no smart identifiers (§5 N/A), Top/Bottom/Cursor placement + inline-`url()` (placement-ignored), Pick Style, Set Default, drag-and-drop, shared `@use`/`@forward` marker edges |
| [`scss.md`](scss.md) | Allow-list gating (`.scss` + `.css` + image), `@use`/`@forward`/`@import` styles + fixed image `url()` arm + style-name drift, no smart identifiers (§5 N/A), Bottom/Top/Cursor placement + inline-`url()`, partial-`_` normalization, `preserveStylesheetFileExtension` toggle, Pick Style, Set Default, drag-and-drop, edge cases |
| [`vue.md`](vue.md) | Allow-list gating (accept-vs-reject), one-table two-arm style model (TypeScript styles for **every** script source `.ts`/`.tsx`/`.js`/`.jsx` **or** a fixed asset shape) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill; fires for every script ext incl. `.js`), SFC `<script>`-block-confined placement, shared `typescriptImportStyle` (no `vueImportStyle`), Pick Style, Set Default, drag-and-drop incl. unsupported-pair drop suppression, `.vue`→`.vue` named-asset quirk |
| [`astro.md`](astro.md) | Allow-list gating (accept-vs-reject; **widest** framework accept-list; a framework-trio destination, shares `framework-component.ts`), one-table two-arm style model (TypeScript styles for **every** script source `.ts`/`.tsx`/`.js`/`.jsx` **or** a fixed asset shape) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill; fires for every script ext incl. `.js`), frontmatter `---`-fence-confined placement (no `<script setup>`/`<script context="module">`; create-if-missing wrapper), shared `typescriptImportStyle` (no `astroImportStyle`), Pick Style, Set Default, drag-and-drop incl. unsupported-pair drop suppression, named-asset family (`.astro`/`.vue`/`.svelte`/`.md`/`.mdx`→`.astro`) |
| [`svelte.md`](svelte.md) | Allow-list gating (accept-vs-reject; a framework-trio destination, shares `framework-component.ts`), one-table two-arm style model (TypeScript styles for **every** script source `.ts`/`.tsx`/`.js`/`.jsx` **or** a fixed asset shape) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill; fires for every script ext incl. `.js`), SFC `<script>`-block-confined placement (no `<script setup>`; `<script context="module">` tier-3 fallback), shared `typescriptImportStyle` (no `svelteImportStyle`), Pick Style, Set Default, drag-and-drop incl. unsupported-pair drop suppression, `.svelte`→`.svelte` named-asset quirk |
| [`latex.md`](latex.md) | Allow-list gating (`.tex` `.bib` + graphics `.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`; **web images `.svg`/`.gif`/`.webp`/`.avif` rejected** — not `pdflatex`-renderable), source-extension dispatch (graphics→`figure`/`\includegraphics` · `.tex`→`\input`/`\include` · `.bib`→`\addbibresource`/`\bibliography`; its own `latex.*` namespace) + `preserveGraphicsFileExtension` toggle (default keep, inverted) + style-name drift, no smart identifiers (§5 N/A), `forced-cursor` placement (setting ignored, column follows cursor, body not preamble), Pick Style, Set Default (all arms configurable — no fixed-shape arm), drag-and-drop, multi-line `figure` + LaTeX-`%`-comment edges |

## Workspace counterparts

Every checklist has a matching fixture directory under `workspace/`:

```
checklists/general.md      →  workspace/general/
checklists/javascript.md   →  workspace/javascript/
checklists/typescript.md   →  workspace/typescript/
checklists/jsx.md          →  workspace/jsx/
checklists/tsx.md          →  workspace/tsx/
checklists/mdx.md          →  workspace/mdx/
checklists/html.md         →  workspace/html/
checklists/markdown.md     →  workspace/markdown/
checklists/css.md          →  workspace/css/
checklists/scss.md         →  workspace/scss/
checklists/vue.md          →  workspace/vue/
checklists/astro.md        →  workspace/astro/
checklists/svelte.md       →  workspace/svelte/
checklists/latex.md        →  workspace/latex/
```

When a checklist is updated, ensure the workspace counterpart has every fixture file the checklist references.
