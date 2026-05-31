# src/path/CLAUDE.md

Pure path math. **No `vscode` import** — every file here is Node-testable. Don't introduce one.

## Files

- `relative.ts` — `computeRelative(sourceFilePath, destinationFilePath)` returns the import-ready relative path.
- `extension.ts` — `extractFileExtension` is a thin wrapper over `path.parse`; `removeFileExtension` strips the extension via string slicing.
- `import-type.ts` — `determineImportType(filePath)` seven-way classifier with two intentional `null` returns.

## `computeRelative` — the `./` prefix rule

Returns a Unix-style path (`toUnixPath` replaces `\` with `/`) with the file extension stripped, suitable for use inside an `import` statement.

**The `./` prefix is added when** `path.relative` produced a result that doesn't already start with `.` (a bare `'foo'` / `'utils/helper'`). Genuine same-directory imports are the common case — `path.relative` returns a bare filename, so they receive the `./` prefix here. Paths that already begin with `../` are left untouched (adding `./` would emit a redundant `./../…`).

**Regression test.** This rule is regression-tested per CHANGELOG `0.6.1` ("Prepend './' to relative paths for same-directory imports"). Don't simplify the prefix logic without re-running the test.

## `extension.ts` — the empty-string-on-no-extension quirk

- `extractFileExtension(filePath)` returns the trailing extension (e.g. `'.ts'`) or `''` when there is none. Thin wrapper over `path.parse(filePath).ext`.
- `removeFileExtension(filePath)` returns `filePath.slice(0, -ext.length)`. **When `ext` is `''`, `slice(0, -0)` is `''`** (because `-0 === 0`) — the function returns an empty string for any path with no extension.

This behaviour is intentional and regression-tested with extensionless paths (e.g. `Makefile` → `''`, in `test/path/extension.test.ts`). The test suite expects it — **don't add a guard** without re-running all path tests.

## `determineImportType` — `ImportType | null`, not just `ImportType`

Maps file extension to one of seven buckets, with two `null` returns:

| Source extension | Returns |
|------------------|---------|
| `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.astro` | `'script'` |
| `.css` | `'stylesheet'` |
| `.md` | `'markdown'` |
| `.mp4`, `.webm`, `.mov` | `'video'` |
| `.mp3`, `.ogg`, `.wav`, `.m4a` | `'audio'` |
| `.vtt` | `'text-track'` |
| `.html` | `null` (defensive — gating already rejects HTML→HTML upstream) |
| `.scss` | `null` (so `snippets/languages/scss.ts` falls through its `switch` to its SCSS-specific default that handles `@use`/partial filenames) |
| anything else | `'image'` (`default:` catch-all) |

The `'image'` branch is **not** a guarantee that the source is image-like — it's a default. The runtime gating in `src/gating.ts:isPairSupported` is what makes that safe.

Consumers: `snippets/languages/{css,scss,html,markdown}.ts` and `snippets/variants.ts`. JSX/TSX/MDX don't consult this — they branch on the raw source extension via `_react.ts`.
