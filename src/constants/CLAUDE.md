# src/constants/CLAUDE.md

Runtime gating tables for source/destination extension pairs.

## Files

- `extensions.ts` — thirteen exports, listed below.

## What's here

| Constant | Consumed by | Purpose |
|----------|-------------|---------|
| `IMAGE_FILE_EXTENSIONS` | The seven `*_SUPPORTED_EXTENSIONS` lists | Base set spread via `...IMAGE_FILE_EXTENSIONS` |
| `MEDIA_FILE_EXTENSIONS` | The four `*_SUPPORTED_EXTENSIONS` lists that accept media (HTML, Vue, Svelte, Astro) | Video + audio only (`.vtt` lives in `TEXT_TRACK_FILE_EXTENSIONS`, not here); spread via `...MEDIA_FILE_EXTENSIONS` |
| `TEXT_TRACK_FILE_EXTENSIONS` | The four `*_SUPPORTED_EXTENSIONS` lists that accept media (HTML, Vue, Svelte, Astro) | `.vtt` spread via `...TEXT_TRACK_FILE_EXTENSIONS` |
| `HTML_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.html` destinations |
| `MARKDOWN_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.md` destinations |
| `CSS_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.css` destinations |
| `SCSS_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.scss` destinations |
| `VUE_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.vue` destinations |
| `SVELTE_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.svelte` destinations |
| `ASTRO_SUPPORTED_EXTENSIONS` | `gating.ts:isPairSupported` | Sources accepted for `.astro` destinations |
| `CROSS_IMPORT_DESTINATIONS` | `gating.ts:isPairSupported` | Destinations allowed to import a *different* extension. Destinations not listed require source extension to equal destination extension. |
| `SCRIPT_FILE_EXTENSIONS` | `editor/insert-snippet.ts:determineInsertionColumn`, `editor/placement.ts:determineInsertionColumn` | Force column-0 placement for script destinations. |
| `STYLESHEET_FILE_EXTENSIONS` | `editor/placement.ts:isInlineSnippet`, `editor/insert-snippet.ts:determineInsertionColumn`, `editor/placement.ts:determineInsertionColumn` | Gate inline `url()` insertion for non-stylesheet sources; force column-0 placement for stylesheet destinations. |

## Why both a runtime table and a compile-time type union exist

Compile-time: `types/file-extension.ts:FileExtension` narrows `switch` dispatch in TS. The cast `as FileExtension` at boundaries (e.g. `extractFileExtension` return) is **erased at runtime** — without the gating tables, an unsupported source would produce a silent fall-through to a default branch instead of a user-facing toast.

Runtime: these tables are the runtime safety net. Keep them in sync with `types/file-extension.ts`. Drift is silent.

## Hidden coupling — touch with care

`SCRIPT_FILE_EXTENSIONS` is consumed by `editor/insert-snippet.ts:determineInsertionColumn` and `editor/placement.ts:determineInsertionColumn`. `STYLESHEET_FILE_EXTENSIONS` is consumed by `editor/placement.ts:isInlineSnippet` (which gates whether a non-stylesheet source into a stylesheet destination triggers inline `url()` insertion) and both `determineInsertionColumn` implementations. They look like generic categorisation but changing them silently affects column-0 forcing and inline-insertion gating. Renaming or repurposing them silently changes insertion behaviour.

## Adding a new accepted source/destination pair

1. Add the source extension to the matching `*_SUPPORTED_EXTENSIONS` table.
2. Make sure the relevant per-language module under `src/snippets/languages/` knows how to produce a snippet for that source — the nine-clause gating won't catch a source that lands at the per-language `switch`'s `default:` and emits an empty snippet (it will, but you'll have produced a less-useful error path).
3. Add a matching branch in `src/snippets/variants.ts` if the new source needs styled variants — missing this means `pasteImportWithStyle` and `setDefaultImportStyle` silently skip it.

## Adding a new file extension entirely

Four sites must stay in sync — see [`src/types/CLAUDE.md`](../types/CLAUDE.md) for the full rule.
