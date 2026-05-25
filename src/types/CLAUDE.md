# src/types/CLAUDE.md

Cross-cutting type unions used across the codebase. **String-literal unions, not enums** — compare with `===` against the literal string, never `EnumName.Variant`.

## Files

- `file-extension.ts` — `FileExtension` union (the only export from this file).
- `import-type.ts` — `ImportType` seven-way classifier.
- `notification.ts` — `NotificationType` nine-way notification kind (seven warning, two info).

## `file-extension.ts` — only `FileExtension` is exported

Category sub-types (`HtmlFileExtension`, `YamlFileExtension`, `MarkdownFileExtension`, `StylesheetFileExtension`, `ImageFileExtension`, `FontFileExtension`, `DocumentFileExtension`, `VideoFileExtension`, `AudioFileExtension`, `TextTrackFileExtension`, `VueFileExtension`, `SvelteFileExtension`, `AstroFileExtension`, `FrameworkComponentFileExtension`, `MediaFileExtension`, `WebFileExtension`, `ScriptFileExtension`, `DataFileExtension`) are **intentionally unexported** — consumers depend on the umbrella `FileExtension` union. The categories are organisational comments inside the file, not a public taxonomy.

**Conventions:** every value is lowercase and dot-prefixed (`.ts`, `.png`, etc.) so it matches `path.parse(filePath).ext` without normalisation. The `as FileExtension` cast at runtime boundaries (e.g. `extractFileExtension` return) is **erased** — no runtime check.

### Four-site sync when adding/removing an extension

1. The relevant category sub-type here.
2. Runtime gating tables in `src/constants/extensions.ts`.
3. The matching `case` in `src/snippets/dispatch.ts` (destination dispatch) or `src/snippets/_react.ts` (JSX/TSX/MDX source dispatch).
4. The matching `case` in `src/snippets/variants.ts:buildImportSnippetVariants` (so the picker commands work for the new extension).

A missing entry in (2) produces a silent fall-through to a `default:` branch — the cast in (1) won't catch it. Gating is the runtime safety net.

## `import-type.ts` — `ImportType`

Seven buckets: `'script' | 'stylesheet' | 'markdown' | 'image' | 'video' | 'audio' | 'text-track'`.

- **Producer**: `path/import-type.ts:determineImportType` (which returns `ImportType | null` — see that file's CLAUDE.md for the two intentional `null` returns).
- **Consumers**: `snippets/languages/{css,scss,html,markdown}.ts` and `snippets/variants.ts`. JSX/TSX/MDX **do not** consult this — they branch on the raw source extension via `_react.ts`.

The `'image'` value is the catch-all default for unrecognised extensions — *not* a guarantee that the source is image-like. Gating in `commands/paste-import.ts` is what makes the catch-all safe.

## `notification.ts` — `NotificationType`

Ten variants: `'same-file-path' | 'not-supported' | 'no-active-editor' | 'no-file-to-copy' | 'no-extension' | 'empty-clipboard' | 'source-not-found' | 'copy-success' | 'no-configurable-style' | 'default-style-saved'`. Five are raised from `commands/paste-import.ts` (also re-raised from `commands/paste-import-with-style.ts` and `commands/set-default-import-style.ts` for shared gating); `'no-file-to-copy'` and `'copy-success'` are raised from `commands/copy-file-path.ts`; `'no-extension'` is raised from all four command files that validate clipboard paths; the last two are raised exclusively from `commands/set-default-import-style.ts`. Messages live in `editor/notification.ts`.

Six variants are parameterized — see the overload signatures on `editor/notification.ts:showNotification`:
- `'not-supported'` takes `{ sourceExt, destinationExt }` — interpolated as `Cannot import .X into .Y files.`
- `'no-extension'` takes `{ basename }` — interpolated as `<basename> has no file extension.`
- `'source-not-found'` takes `{ basename }` — interpolated as `Source file no longer exists: <basename>.`
- `'copy-success'` takes `{ basename }` — interpolated as `Copied path — <basename>` (info toast).
- `'no-configurable-style'` takes `{ sourceExt, destinationExt }` — interpolated as `.X → .Y imports use a fixed style.`
- `'default-style-saved'` takes `{ description }` — interpolated as `Default style saved — <description>` (info toast).

The remaining four take no payload. Eight variants render as warning toasts; `'copy-success'` and `'default-style-saved'` render as info.
