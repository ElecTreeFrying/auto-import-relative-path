# src/types/

Cross-cutting type unions used across the codebase. **String-literal unions, not enums.**

## Files

| File | Public type | Purpose |
|------|-------------|---------|
| `file-extension.ts` | `FileExtension` | Umbrella union of every recognised file extension (`.ts`, `.css`, `.png`, etc.). The category sub-types are intentionally unexported. |
| `import-type.ts` | `ImportType` | Seven-way classifier: `'script' \| 'stylesheet' \| 'markdown' \| 'image' \| 'video' \| 'audio' \| 'text-track'`. |
| `notification.ts` | `NotificationType` | Ten-variant notification kind (eight warning, two info). |

`FileExtension` values are lowercase and dot-prefixed (`.ts`, `.css`, `.png`) to match `path.parse(filePath).ext`. `ImportType` and `NotificationType` values are lowercase but carry no dot — `ImportType` uses plain names (`'script'`, `'stylesheet'`) and `NotificationType` uses hyphenated names (`'same-file-path'`, `'not-supported'`). Compare with `===` against the literal — there are no enums here.

## Where to add new code

- New cross-cutting union → here.
- Adding a new file extension is a four-site sync (this directory + `src/constants/extensions.ts` + snippet dispatch in `src/snippets/` + `src/snippets/variants.ts`). The dispatch site depends on usage: a new destination language touches `src/snippets/dispatch.ts`; a new JSX/TSX/MDX non-script source extension touches the single shared asset switch `src/snippets/_react.ts:buildAssetImportStatement` (used by both the default paste flow and `variants.ts:buildReactNonScriptVariant`). See [`CLAUDE.md`](CLAUDE.md) here for the full rule.
