# src/types/CLAUDE.md

Cross-cutting type unions used across the codebase. **String-literal unions, not enums** — compare with `===` against the literal string, never `EnumName.Variant`.

## Files

- `file-extension.ts` — `FileExtension` union (the only export from this file).
- `import-type.ts` — the `ImportType` classifier.
- `notification.ts` — the `NotificationType` notification kind (warning + info variants).

## `file-extension.ts` — only `FileExtension` is exported

Category sub-types (`HtmlFileExtension`, `YamlFileExtension`, `MarkdownFileExtension`, `StylesheetFileExtension`, `ImageFileExtension`, `FontFileExtension`, `DocumentFileExtension`, `VideoFileExtension`, `AudioFileExtension`, `TextTrackFileExtension`, `VueFileExtension`, `SvelteFileExtension`, `AstroFileExtension`, `FrameworkComponentFileExtension`, `MediaFileExtension`, `WebFileExtension`, `ScriptFileExtension`, `DataFileExtension`, `LatexFileExtension`, `BibliographyFileExtension`, `EncapsulatedPostScriptFileExtension`) are **intentionally unexported** — consumers depend on the umbrella `FileExtension` union. The categories are organisational comments inside the file, not a public taxonomy.

One intentional type↔runtime divergence: the `MediaFileExtension` type includes `.vtt` (via `TextTrackFileExtension`), but the runtime `MEDIA_FILE_EXTENSIONS` constant in `constants/extensions.ts` is video+audio only — `.vtt` is spread separately from `TEXT_TRACK_FILE_EXTENSIONS`.

**Conventions:** every value is lowercase and dot-prefixed (`.ts`, `.png`, etc.) so it matches `path.parse(filePath).ext` without normalisation. The `as FileExtension` cast at runtime boundaries (e.g. `extractFileExtension` return) is **erased** — no runtime check.

### Four-site sync when adding/removing an extension

1. The relevant category sub-type here.
2. Runtime gating tables in `src/constants/extensions.ts` — required **only** for extensions that target a *gated* destination (HTML, MD, CSS, SCSS, Vue, Svelte, Astro, LaTeX). Source extensions that target **only** script-like destinations (`.jsx`/`.tsx`/`.mdx`) skip this site: those destinations accept any source via `CROSS_IMPORT_DESTINATIONS` and never consult a per-destination `*_SUPPORTED_EXTENSIONS` allow-list, so there is no table to add them to. The fonts `.woff`/`.woff2`/`.ttf`/`.eot` (`FontFileExtension`) are exactly this case — present in the `FileExtension` union (1) and in the `_react.ts` asset switch (3b), with **no** gating-table entry, because they import only into JSX/TSX/MDX. (Another type↔runtime divergence, beyond the `.vtt` one noted above.) `.pdf` (`DocumentFileExtension`) is **not** in this set: it carries gating-table entries (`TEX_GRAPHICS_FILE_EXTENSIONS` / `TEX_SUPPORTED_EXTENSIONS`) and imports into both JSX/TSX/MDX (via the asset switch) and `.tex` (gated). The `.tex` / `.bib` / `.eps` extensions all target the gated `.tex` destination, so they take this site.
3. The dispatch case(s). Two sub-sites, depending on what is new:
   - **3a — destination dispatch:** if the new extension is a *destination* language, add its `case` to `src/snippets/dispatch.ts:buildImportSnippet` (which switches on the **destination** extension).
   - **3b — source dispatch for non-script assets into JSX/TSX/MDX:** if the new extension is a non-script **source** (image, font, data, doc, media, component) imported into `.jsx`/`.tsx`/`.mdx`, add its `case` to the single canonical asset switch `src/snippets/_react.ts:buildAssetImportStatement` (which switches on the **source** extension). That switch is shared by the default paste flow (`buildReactImport` and `languages/framework-component.ts`) and the variant-picker flow (`variants.ts:buildReactNonScriptVariant`, which just calls it), so there is only one switch to update. For non-script sources into the *other* destination languages (HTML, CSS, SCSS, Markdown, …), the per-language builder in `src/snippets/languages/` classifies the source itself — do **not** add it to `_react.ts`.
4. The matching `case` in `src/snippets/variants.ts:buildImportSnippetVariants` (so the picker commands work for the new extension).

A missing entry in (2) produces a silent fall-through to a `default:` branch — the cast in (1) won't catch it. Gating is the runtime safety net **for gated destinations**; script-like destinations are safe without it because their source set is unrestricted.

## `import-type.ts` — `ImportType`

The buckets: `'script' | 'stylesheet' | 'markdown' | 'image' | 'video' | 'audio' | 'text-track'`.

- **Producer**: `path/import-type.ts:determineImportType` (which returns `ImportType | null` — see that file's CLAUDE.md for the two intentional `null` returns).
- **Consumers**: `snippets/languages/{css,scss,html,markdown}.ts` and `snippets/variants.ts`. JSX/TSX/MDX **do not** consult `ImportType` in the default snippet flow — they branch on the raw source extension via `_react.ts`. In the `variants.ts` picker flow, JSX/TSX/MDX sources branch on the raw source extension via `buildReactNonScriptVariant`, which delegates to the shared `_react.ts:buildAssetImportStatement` switch, instead of consulting `ImportType`.

The `'image'` value is the catch-all default for unrecognised extensions — *not* a guarantee that the source is image-like. Gating in `src/gating.ts:isPairSupported` is what makes the catch-all safe.

## `notification.ts` — `NotificationType`

The variants: `'same-file-path' | 'not-supported' | 'no-active-editor' | 'no-file-to-copy' | 'no-extension' | 'empty-clipboard' | 'source-not-found' | 'copy-success' | 'no-configurable-style' | 'default-style-saved' | 'placement-saved' | 'preserve-script-extension-toggled' | 'styles-reset' | 'no-styles-to-reset' | 'styles-restored'`. Raised from `commands/paste-import.ts`: `'same-file-path'`, `'not-supported'`, `'no-active-editor'`, `'no-extension'`, `'empty-clipboard'`, and `'source-not-found'`, re-raised from `commands/paste-import-with-style.ts` and `commands/set-default-import-style.ts` for shared gating; `'no-file-to-copy'` and `'copy-success'` come from `commands/copy-file-path.ts` (which also raises `'no-extension'`); `'no-configurable-style'` and `'default-style-saved'` are exclusive to `commands/set-default-import-style.ts`. The settings commands raise their own info toasts: `'placement-saved'` from `commands/set-import-placement.ts`, `'preserve-script-extension-toggled'` from `commands/toggle-preserve-script-extension.ts`, and `'no-styles-to-reset'` / `'styles-reset'` / `'styles-restored'` from `commands/reset-import-styles.ts`. `drop/provider.ts` raises `'same-file-path'` and `'not-supported'`. Messages live in `editor/notification.ts`.

The parameterized variants — see the overload signatures on `editor/notification.ts:showNotification`:
- `'not-supported'` takes `{ sourceExt, destinationExt }` — interpolated as `Auto Import: Cannot import .X into .Y files.`
- `'no-extension'` takes `{ basename }` — interpolated as `Auto Import: <basename> has no file extension.`
- `'source-not-found'` takes `{ basename }` — interpolated as `Auto Import: Source file no longer exists: <basename>.`
- `'copy-success'` takes `{ basename }` — interpolated as `Auto Import: Copied path — <basename>` (info toast).
- `'no-configurable-style'` takes `{ sourceExt, destinationExt }` — interpolated as `Auto Import: .X → .Y imports use a fixed style.`
- `'default-style-saved'` takes `{ description }` — interpolated as `Auto Import: Default style saved — <description>` (info toast).
- `'placement-saved'` takes `{ placement }` — interpolated as `Auto Import: Import placement saved — <placement>` (info toast).
- `'preserve-script-extension-toggled'` takes `{ enabled }` — interpolated as `Auto Import: Preserve script file extension — On`/`Off` (info toast).
- `'styles-reset'` takes `{ count }` — interpolated as `Auto Import: Reset 1 import style to defaults` (`count === 1`) / `Auto Import: Reset <count> import styles to defaults` (info toast, carries an **Undo** button).

The rest take no payload. Warning variants render as warnings; the info variants (`'copy-success'`, `'default-style-saved'`, `'placement-saved'`, `'preserve-script-extension-toggled'`, `'styles-reset'`, `'no-styles-to-reset'`, `'styles-restored'`) render as info.
