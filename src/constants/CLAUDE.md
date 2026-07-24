# src/constants/CLAUDE.md

Runtime gating tables for source/destination extension pairs.

## Files

- `extensions.ts` — the exports, listed below.

## What's here

| Constant | Consumed by | Purpose |
|----------|-------------|---------|
| `IMAGE_FILE_EXTENSIONS` | Every `*_SUPPORTED_EXTENSIONS` list except `TEX_SUPPORTED_EXTENSIONS` | Base set spread via `...IMAGE_FILE_EXTENSIONS` |
| `MEDIA_FILE_EXTENSIONS` | The `*_SUPPORTED_EXTENSIONS` lists that accept media (HTML, Vue, Svelte, Astro) | Video + audio only (`.vtt` lives in `TEXT_TRACK_FILE_EXTENSIONS`, not here); spread via `...MEDIA_FILE_EXTENSIONS` |
| `TEXT_TRACK_FILE_EXTENSIONS` | The `*_SUPPORTED_EXTENSIONS` lists that accept media (HTML, Vue, Svelte, Astro) | `.vtt` spread via `...TEXT_TRACK_FILE_EXTENSIONS` |
| `TEX_GRAPHICS_FILE_EXTENSIONS` | `TEX_SUPPORTED_EXTENSIONS`, `snippets/languages/latex.ts:isTexGraphicsSource` | LaTeX-renderable graphics (`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`) — the **engine**-renderable set, deliberately **not** `IMAGE_FILE_EXTENSIONS` (no `.svg`/`.gif`/`.webp`/`.avif`, which `pdflatex` can't render). Spread into `TEX_SUPPORTED_EXTENSIONS`; also the membership test in `latex.ts`. |
| `FRAMEWORK_COMPONENT_FILE_EXTENSIONS` | `TYPESCRIPT_SUPPORTED_EXTENSIONS` / `JAVASCRIPT_SUPPORTED_EXTENSIONS`; the component-source branch of `snippets/languages/{typescript,javascript}.ts` + `snippets/variants.ts` | Runtime mirror of the `FrameworkComponentFileExtension` type union (`.vue`/`.svelte`/`.astro`); spread into the script-destination allow-lists so `.ts`/`.js` accept SFC sources |
| `HTML_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.html` destinations |
| `MARKDOWN_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.md` destinations |
| `CSS_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.css` destinations |
| `SCSS_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.scss` destinations |
| `VUE_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.vue` destinations |
| `SVELTE_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.svelte` destinations |
| `ASTRO_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.astro` destinations |
| `TEX_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.tex` destinations — `.tex`, `.bib`, + `...TEX_GRAPHICS_FILE_EXTENSIONS` |
| `TYPESCRIPT_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.ts` destinations — `.ts` + `...FRAMEWORK_COMPONENT_FILE_EXTENSIONS` |
| `JAVASCRIPT_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.js` destinations — `.js` + `...FRAMEWORK_COMPONENT_FILE_EXTENSIONS` |
| `CROSS_IMPORT_DESTINATIONS` | `gating.ts:isPairSupported` | Destinations allowed to import a *different* extension. Destinations not listed require source extension to equal destination extension. |
| `SCRIPT_FILE_EXTENSIONS` | `editor/insert-snippet.ts:determineInsertionColumn` (internal) | Force column-0 placement for script destinations in the command flow (the drop flow consults no table: column 0 on every non-inline branch except forced-cursor, which follows the target line's indent). |
| `STYLESHEET_FILE_EXTENSIONS` | `editor/placement.ts` (`isInlineSnippet`, `isStyleBlockContext`), `editor/insert-snippet.ts:determineInsertionColumn` (internal); spread into `VUE_/SVELTE_/ASTRO_SUPPORTED_EXTENSIONS`; the stylesheet-source guard in `snippets/languages/framework-component.ts` + `snippets/variants.ts` | Gate inline `url()` insertion for non-stylesheet sources; force column-0 placement for stylesheet destinations in the command flow; accept `.css`/`.scss` sources into the framework SFC destinations and route them to the `<style>`-block dialect. Declared **above** the `*_SUPPORTED_EXTENSIONS` lists (they spread it), so it cannot move below them. |

## Why both a runtime table and a compile-time type union exist

Compile-time: `types/file-extension.ts:FileExtension` narrows `switch` dispatch in TS. The cast `as FileExtension` at boundaries (e.g. `extractFileExtension` return) is **erased at runtime** — without the gating tables, an unsupported source would produce a silent fall-through to a default branch instead of a user-facing toast.

Runtime: these tables are the runtime safety net. Keep them in sync with `types/file-extension.ts`. Drift is silent.

## Hidden coupling — touch with care

`SCRIPT_FILE_EXTENSIONS` is consumed by `editor/insert-snippet.ts:determineInsertionColumn` — the command flow's column rule. The drop flow does not consult it: `editor/placement.ts:computeImportPlacement` uses column 0 on every non-inline branch except forced-cursor, where the column follows the target line's indent (see `editor/CLAUDE.md`, precedence rule 2). `STYLESHEET_FILE_EXTENSIONS` is consumed by `editor/placement.ts:isInlineSnippet` (which gates whether a non-stylesheet source into a stylesheet destination triggers inline `url()` insertion), `editor/placement.ts:isStyleBlockContext` and the `framework-component.ts` / `variants.ts` builders (which use it to recognise a stylesheet source destined for an SFC `<style>` block), and `insert-snippet.ts:determineInsertionColumn`. It is also spread into `VUE_/SVELTE_/ASTRO_SUPPORTED_EXTENSIONS` — which forces its declaration **above** those lists (a `const` cannot reference a later `const`). They look like generic categorisation but changing them silently affects column-0 forcing, inline-insertion gating, and which sources the framework SFCs accept. Renaming or repurposing them silently changes insertion behaviour.

## Adding a new accepted source/destination pair

1. Add the source extension to the matching `*_SUPPORTED_EXTENSIONS` table.
2. Make sure the relevant per-language module under `src/snippets/languages/` knows how to produce a snippet for that source — the `gating.ts` clauses won't catch a source that lands at the per-language `switch`'s `default:` and emits an empty snippet (it will, but you'll have produced a less-useful error path).
3. Add a matching branch in `src/snippets/variants.ts` if the new source needs styled variants — missing this means `pasteImportWithStyle` and `setDefaultImportStyle` silently skip it.

## Adding a new file extension entirely

Four sites must stay in sync — see [`src/types/CLAUDE.md`](../types/CLAUDE.md) for the full rule.
