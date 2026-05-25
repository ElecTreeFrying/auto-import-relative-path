# src/constants/

Runtime gating tables for source/destination extension pairs.

## File

- `extensions.ts` — thirteen exported constants.

## What's exported

| Constant | Purpose |
|----------|---------|
| `IMAGE_FILE_EXTENSIONS` | Base raster-image extension set; spread into the seven supported-extension lists. |
| `MEDIA_FILE_EXTENSIONS` | Video + audio extensions; spread into the four supported-extension lists that accept media (HTML, Vue, Svelte, Astro). |
| `TEXT_TRACK_FILE_EXTENSIONS` | `.vtt`; spread into the four supported-extension lists that accept media (HTML, Vue, Svelte, Astro). |
| `HTML_SUPPORTED_EXTENSIONS` | Sources accepted when the destination is `.html`. |
| `MARKDOWN_SUPPORTED_EXTENSIONS` | Sources accepted when the destination is `.md`. |
| `CSS_SUPPORTED_EXTENSIONS` | Sources accepted when the destination is `.css`. |
| `SCSS_SUPPORTED_EXTENSIONS` | Sources accepted when the destination is `.scss`. |
| `VUE_SUPPORTED_EXTENSIONS` | Sources accepted when the destination is `.vue`. |
| `SVELTE_SUPPORTED_EXTENSIONS` | Sources accepted when the destination is `.svelte`. |
| `ASTRO_SUPPORTED_EXTENSIONS` | Sources accepted when the destination is `.astro`. |
| `CROSS_IMPORT_DESTINATIONS` | Destinations allowed to import a *different* extension. Destinations not listed require source extension to equal destination extension. |
| `SCRIPT_FILE_EXTENSIONS` | Used only by `editor/insert-snippet.ts` to force column-0 placement for script destinations. |
| `STYLESHEET_FILE_EXTENSIONS` | Used only by `editor/insert-snippet.ts` to force column-0 placement for stylesheet destinations. |

## Where to add a new entry

- New accepted source/destination pair → update the matching `*_SUPPORTED_EXTENSIONS` table here AND make sure the relevant per-language module under `src/snippets/` can produce a snippet for that source.
- New file extension entirely → see `CLAUDE.md` (this directory) for the three-site sync between this file, `src/types/file-extension.ts`, and `src/snippets/`.
