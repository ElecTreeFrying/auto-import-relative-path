# src/types/

Cross-cutting type unions used across the codebase. **String-literal unions, not enums.**

## Files

| File | Public type | Purpose |
|------|-------------|---------|
| `file-extension.ts` | `FileExtension` | Umbrella union of every recognised file extension (`.ts`, `.css`, `.png`, etc.). The category sub-types are intentionally unexported. |
| `import-type.ts` | `ImportType` | Seven-way classifier: `'script' \| 'stylesheet' \| 'markdown' \| 'image' \| 'video' \| 'audio' \| 'text-track'`. |
| `notification.ts` | `NotificationType` | Nine-way notification kind (seven warning, two info). |

All values are lowercase, dot-prefixed where they correspond to file extensions. Compare with `===` against the literal — there are no enums here.

## Where to add new code

- New cross-cutting union → here.
- Adding a new file extension is a three-site sync (this directory + `src/constants/extensions.ts` + `src/snippets/`). See `CLAUDE.md` here for the rule.
