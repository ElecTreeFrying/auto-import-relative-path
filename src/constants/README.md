# src/constants/

Runtime gating tables for source/destination extension pairs.

## Files

- `extensions.ts` — the exported constants, listed below.

## What's exported

| Constant | Consumed by | Purpose |
|----------|-------------|---------|
| `IMAGE_FILE_EXTENSIONS` | Every `*_SUPPORTED_EXTENSIONS` list except `TEX_SUPPORTED_EXTENSIONS` | Base image-extension set; spread into those lists. |
| `MEDIA_FILE_EXTENSIONS` | The `*_SUPPORTED_EXTENSIONS` lists that accept media (HTML, Vue, Svelte, Astro) | Video + audio extensions; spread into the supported-extension lists that accept media. |
| `TEXT_TRACK_FILE_EXTENSIONS` | The `*_SUPPORTED_EXTENSIONS` lists that accept media (HTML, Vue, Svelte, Astro) | `.vtt`; spread into the supported-extension lists that accept media. |
| `TEX_GRAPHICS_FILE_EXTENSIONS` | `TEX_SUPPORTED_EXTENSIONS`, `snippets/languages/latex.ts:isTexGraphicsSource` | LaTeX-renderable graphics (`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`) — the engine-renderable set, not `IMAGE_FILE_EXTENSIONS`. |
| `HTML_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted when the destination is `.html`. |
| `MARKDOWN_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted when the destination is `.md`. |
| `CSS_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted when the destination is `.css`. |
| `SCSS_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted when the destination is `.scss`. |
| `VUE_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted when the destination is `.vue`. |
| `SVELTE_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted when the destination is `.svelte`. |
| `ASTRO_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted when the destination is `.astro`. |
| `TEX_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted when the destination is `.tex` (`.tex`, `.bib`, + `...TEX_GRAPHICS_FILE_EXTENSIONS`). |
| `CROSS_IMPORT_DESTINATIONS` | `gating.ts:isPairSupported` | Destinations allowed to import a *different* extension. Destinations not listed require source extension to equal destination extension. |
| `SCRIPT_FILE_EXTENSIONS` | `editor/insert-snippet.ts:determineInsertionColumn` (internal), `editor/placement.ts:determineInsertionColumn` (internal) | Force column-0 placement for script destinations. |
| `STYLESHEET_FILE_EXTENSIONS` | `editor/placement.ts:isInlineSnippet`, `editor/insert-snippet.ts:determineInsertionColumn` (internal), `editor/placement.ts:determineInsertionColumn` (internal) | Gate inline `url()` insertion; force column-0 placement for stylesheet destinations. |

## Where to add a new entry

- New accepted source/destination pair → update the matching `*_SUPPORTED_EXTENSIONS` table here AND make sure the relevant per-language module under `src/snippets/languages/` can produce a snippet for that source. If the new source needs styled picker variants, also add the `variants.ts` branch — see [`CLAUDE.md`](CLAUDE.md) → "Adding a new accepted source/destination pair", step 3.
- New file extension entirely → see [`CLAUDE.md`](CLAUDE.md) (this directory) for the four-site sync between this file, `src/types/file-extension.ts`, `src/snippets/dispatch.ts`, and `src/snippets/variants.ts`.
