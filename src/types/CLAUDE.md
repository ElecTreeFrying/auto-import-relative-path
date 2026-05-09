# src/types/CLAUDE.md

Cross-cutting type unions used across the codebase. **String-literal unions, not enums** — compare with `===` against the literal string, never `EnumName.Variant`.

## Files

- `file-extension.ts` — `FileExtension` union (the only export from this file).
- `import-type.ts` — `ImportType` four-way classifier.
- `notification.ts` — `NotificationType` seven-way notification kind (six warning, one info).

## `file-extension.ts` — only `FileExtension` is exported

Category sub-types (`HtmlFileExtension`, `YamlFileExtension`, `StylesheetFileExtension`, `ImageFileExtension`, `FontFileExtension`, `WebFileExtension`, `ScriptFileExtension`, `DataFileExtension`) are **intentionally unexported** — consumers depend on the umbrella `FileExtension` union. The categories are organisational comments inside the file, not a public taxonomy.

**Conventions:** every value is lowercase and dot-prefixed (`.ts`, `.png`, etc.) so it matches `path.parse(filePath).ext` without normalisation. The `as FileExtension` cast at runtime boundaries (e.g. `extractFileExtension` return) is **erased** — no runtime check.

### Three-site sync when adding/removing an extension

1. The relevant category sub-type here.
2. Runtime gating tables in `src/constants/extensions.ts`.
3. The matching `case` in `src/snippets/dispatch.ts` (destination dispatch) or `src/snippets/_shared.ts` (JSX/TSX source dispatch).

A missing entry in (2) produces a silent fall-through to a `default:` branch — the cast in (1) won't catch it. Gating is the runtime safety net.

## `import-type.ts` — `ImportType`

Four buckets: `'script' | 'stylesheet' | 'markdown' | 'image'`.

- **Producer**: `path/import-type.ts:determineImportType` (which returns `ImportType | null` — see that file's CLAUDE.md for the two intentional `null` returns).
- **Consumers**: `snippets/{css,scss,html,markdown}.ts`. JSX/TSX **do not** consult this — they branch on the raw source extension via `_shared.ts`.

The `'image'` value is the catch-all default for unrecognised extensions — *not* a guarantee that the source is image-like. Gating in `commands/paste-import.ts` is what makes the catch-all safe.

## `notification.ts` — `NotificationType`

Seven variants: `'same-file-path' | 'not-supported' | 'no-active-editor' | 'no-file-to-copy' | 'empty-clipboard' | 'source-not-found' | 'copy-success'`. Five are raised from `commands/paste-import.ts`; `'no-file-to-copy'` and `'copy-success'` are raised from `commands/copy-file-path.ts`. Messages live in `editor/notification.ts`.

Three variants are parameterized — see the overload signatures on `editor/notification.ts:showNotification`:
- `'not-supported'` takes `{ sourceExt, destinationExt }` — interpolated as `Cannot import .X into .Y files.`
- `'source-not-found'` takes `{ basename }` — interpolated as `Source file no longer exists: <basename>.`
- `'copy-success'` takes `{ basename }` — interpolated as `Copied path — <basename>` (info toast).

The remaining four take no payload. Six variants render as warning toasts; only `'copy-success'` renders as info.
