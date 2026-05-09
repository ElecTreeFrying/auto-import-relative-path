# src/constants/CLAUDE.md

Runtime gating tables for source/destination extension pairs.

## File

- `extensions.ts` — eight exports, listed below.

## What's here

| Constant | Consumed by | Purpose |
|----------|-------------|---------|
| `IMAGE_FILE_EXTENSIONS` | The four `*_SUPPORTED_EXTENSIONS` lists | Base set spread via `...IMAGE_FILE_EXTENSIONS` |
| `HTML_SUPPORTED_EXTENSIONS` | `commands/paste-import.ts` clause 3 | Sources accepted for `.html` destinations |
| `MARKDOWN_SUPPORTED_EXTENSIONS` | `commands/paste-import.ts` clause 4 | Sources accepted for `.md` destinations |
| `CSS_SUPPORTED_EXTENSIONS` | `commands/paste-import.ts` clause 5 | Sources accepted for `.css` destinations |
| `SCSS_SUPPORTED_EXTENSIONS` | `commands/paste-import.ts` clause 6 | Sources accepted for `.scss` destinations |
| `CROSS_IMPORT_DESTINATIONS` | `commands/paste-import.ts` clause 1 | Destinations allowed to import a *different* extension |
| `SCRIPT_FILE_EXTENSIONS` | `editor/insert-snippet.ts:determineInsertionColumn` | Force column-0 placement |
| `STYLESHEET_FILE_EXTENSIONS` | `editor/insert-snippet.ts:determineInsertionColumn` | Force column-0 placement |

## Why both a runtime table and a compile-time type union exist

Compile-time: `types/file-extension.ts:FileExtension` narrows `switch` dispatch in TS. The cast `as FileExtension` at boundaries (e.g. `extractFileExtension` return) is **erased at runtime** — without the gating tables, an unsupported source would produce a silent fall-through to a default branch instead of a user-facing toast.

Runtime: these tables are the runtime safety net. Keep them in sync with `types/file-extension.ts`. Drift is silent.

## Hidden coupling — touch with care

`SCRIPT_FILE_EXTENSIONS` and `STYLESHEET_FILE_EXTENSIONS` are consumed *only* by `editor/insert-snippet.ts:determineInsertionColumn`. They look like generic categorisation but their sole purpose is forcing column 0 for those destinations. Renaming or repurposing them silently changes insertion behaviour.

## Adding a new accepted source/destination pair

1. Add the source extension to the matching `*_SUPPORTED_EXTENSIONS` table.
2. Make sure the relevant per-language module under `src/snippets/` knows how to produce a snippet for that source — the eight-clause gating won't catch a source that lands at the per-language `switch`'s `default:` and emits an empty snippet (it will, but you'll have produced a less-useful error path).

## Adding a new file extension entirely

Three sites must stay in sync — see `src/types/CLAUDE.md` for the full rule.
