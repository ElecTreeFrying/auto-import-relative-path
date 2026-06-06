# qa/checklists/

Manual QA checklists for the extension. One general checklist for shared behavior, plus one per destination language.

## Execution order

1. **`general.md`** — always run first. Covers cross-destination shared behavior.
2. Per-destination checklists — run after general passes. Each assumes general's items are already verified.

## Inventory

| Checklist | Cases | Scope |
|-----------|-------|-------|
| [`general.md`](general.md) | 62 | Copy File Path, clipboard validation, same-file rejection, Alt+D failure paths, all notification toasts + buttons, edge cases (rapid pastes, many files, unicode, spaces), path computation, extension stripping, DnD universal behaviors, Pick Style QuickPick mechanics, Set Default QuickPick mechanics, settings mid-session, settings commands (Set Import Placement / Toggle Preserve / Reset All Import Styles) |
| [`javascript.md`](javascript.md) | ~65 | Gating matrix (21 pairs), 7 import styles + style-name drift, no smart identifiers (§5 N/A for `.js`), Bottom/Top/Cursor placement, Pick Style, Set Default, drag-and-drop, edge cases |
| [`typescript.md`](typescript.md) | ~89 | Gating matrix (21 pairs), 7 import styles + style-name drift, smart identifiers (exported-class detection + Angular PascalCase), Bottom/Top/Cursor placement, Pick Style (TS-specific), Set Default (TS-specific), drag-and-drop (TS-specific), edge cases |
| [`jsx.md`](jsx.md) | ~70 | Accept-all gating (17-row matrix, 0 source rejections; same-file owned by general.md), two-arm style model via source-extension dispatch (7 JavaScript styles **or** 4 fixed asset shapes) + style-name drift, no smart identifiers (§5 N/A), Bottom/Top/Cursor placement incl. leading-`*`-is-comment, `.ts`/`.tsx`→empty-snippet, Pick Style, Set Default (shared `javascriptImportStyle`), drag-and-drop incl. drop suppression (empty-snippet `.ts`/`.tsx` source) |
| [`tsx.md`](tsx.md) | ~90 | Accept-all gating (18-row matrix, 0 source rejections; same-file owned by general.md), two-script-arm + asset style model (7 TypeScript styles for `.ts`/`.tsx` **or** 7 JavaScript styles for `.js`/`.jsx` via fallback **or** 4 fixed asset shapes; every source non-empty — no empty-snippet case) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill), Bottom/Top/Cursor placement incl. leading-`*`-is-comment, shared `typescriptImportStyle`/`javascriptImportStyle`, Pick Style, Set Default, drag-and-drop (no suppressed-drop case), markdown-star `.mdx`≠`.tsx` edge |
| [`mdx.md`](mdx.md) | ~90 | Accept-all gating (18-row matrix, 0 source rejections; same-file owned by general.md), two-script-arm + asset style model (7 TypeScript styles for `.ts`/`.tsx` **or** 7 JavaScript styles for `.js`/`.jsx` via fallback **or** 4 fixed asset shapes; every source non-empty — no empty-snippet case) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill), generic Bottom/Top/Cursor placement incl. leading-`*`-**is-content**, shared `typescriptImportStyle`/`javascriptImportStyle`, Pick Style, Set Default, drag-and-drop (no suppressed-drop case), markdown-star `.mdx`≠`.tsx` edge |
| [`html.md`](html.md) | 75 | Allow-list gating (`.js` `.css` + image/video/audio/`.vtt`; `.html`→`.html` rejected), 6-way source-type dispatch (`<script>`/`<img>`/`<video>`/`<audio>`/`<link>`/`<track>`), no smart identifiers (§5 N/A), `forced-cursor` placement (setting ignored, column follows cursor), always-keep-extension, Pick Style (3 tagless style-0 descriptions), Set Default, drag-and-drop, comment-marker mismatch edges |
| [`markdown.md`](markdown.md) | 44 | Allow-list gating (`.md` + 7 image; **`.md`→`.md` accepted**, media/`.vtt`/data/stylesheets rejected), 2-way source-type dispatch (fixed `[text](…)` link + 3 `markdownImageImportStyle` image styles) + style-name drift, no smart identifiers (§5 N/A), `forced-cursor` placement (setting ignored, column follows cursor, markdown-star quirk), always-keep-extension, Pick Style, Set Default, drag-and-drop, markdown-star vs `.tsx` edge |
| [`css.md`](css.md) | 30 | Allow-list gating (`.css` + 7 image exts), 2 `@import` styles + fixed image `url()` arm + style-name drift, no smart identifiers (§5 N/A), Top/Bottom/Cursor placement + inline-`url()` (placement-ignored), Pick Style, Set Default, drag-and-drop, shared `@use`/`@forward` marker edges |
| [`scss.md`](scss.md) | ~65 | Allow-list gating (21 pairs: `.scss` + `.css` + 7 image), 5 `@use`/`@forward`/`@import` styles + fixed image `url()` arm + style-name drift, no smart identifiers (§5 N/A), Bottom/Top/Cursor placement + inline-`url()`, partial-`_` normalization, `preserveStylesheetFileExtension` toggle, Pick Style, Set Default, drag-and-drop, edge cases |
| [`vue.md`](vue.md) | ~80 | Allow-list gating (accept-vs-reject; 12 accept / 9 reject), one-table two-arm style model (7 TypeScript styles for **all four** script sources `.ts`/`.tsx`/`.js`/`.jsx` **or** a fixed asset shape) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill; fires for all four script exts incl. `.js`), SFC `<script>`-block-confined placement, shared `typescriptImportStyle` (no `vueImportStyle`), Pick Style, Set Default, drag-and-drop incl. unsupported-pair drop suppression, `.vue`→`.vue` named-asset quirk |
| [`astro.md`](astro.md) | ~84 | Allow-list gating (accept-vs-reject; **widest** framework accept-list, 16 accept / 5 reject; third framework-trio destination, shares `framework-component.ts`), one-table two-arm style model (7 TypeScript styles for **all four** script sources `.ts`/`.tsx`/`.js`/`.jsx` **or** a fixed asset shape) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill; fires for all four script exts incl. `.js`), frontmatter `---`-fence-confined placement (no `<script setup>`/`<script context="module">`; create-if-missing wrapper), shared `typescriptImportStyle` (no `astroImportStyle`), Pick Style, Set Default, drag-and-drop incl. unsupported-pair drop suppression, named-asset family (`.astro`/`.vue`/`.svelte`/`.md`/`.mdx`→`.astro`) |
| [`svelte.md`](svelte.md) | ~80 | Allow-list gating (accept-vs-reject; 12 accept / 9 reject; second framework-trio destination, shares `framework-component.ts`), one-table two-arm style model (7 TypeScript styles for **all four** script sources `.ts`/`.tsx`/`.js`/`.jsx` **or** a fixed asset shape) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill; fires for all four script exts incl. `.js`), SFC `<script>`-block-confined placement (no `<script setup>`; `<script context="module">` tier-3 fallback), shared `typescriptImportStyle` (no `svelteImportStyle`), Pick Style, Set Default, drag-and-drop incl. unsupported-pair drop suppression, `.svelte`→`.svelte` named-asset quirk |

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
```

When a checklist is updated, ensure the workspace counterpart has every fixture file the checklist references.
