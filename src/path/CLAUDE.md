# src/path/CLAUDE.md

Pure path math. **No `vscode` import** — every file here is Node-testable. Don't introduce one.

## Files

- `relative.ts` — `computeRelative(source, destination)` returns the import-ready relative path.
- `extension.ts` — `extractFileExtension` / `removeFileExtension` thin wrappers over `path.parse`.
- `import-type.ts` — `determineImportType(filePath)` four-way classifier with two intentional `null` returns.

## `computeRelative` — the `./` prefix rule

Returns a Unix-style path (`toUnixPath` replaces `\` with `/`) with the file extension stripped, suitable for use inside an `import` statement.

**The `./` prefix is added when:**

- Files are in the **same directory** (case-insensitive comparison of `path.parse(...).dir`, since macOS/Windows are case-insensitive by default), **OR**
- `path.relative` produced a result that doesn't already start with `.`.

The second condition catches edge cases on absolute → relative computations that would otherwise emit `'foo'` instead of `'./foo'`.

**Regression test.** This rule is regression-tested per CHANGELOG `0.6.1` ("Prepend './' to relative paths for same-directory imports"). Don't simplify the prefix logic without re-running the test.

## `extension.ts` — the empty-string-on-no-extension quirk

- `extractFileExtension(filePath)` returns the trailing extension (e.g. `'.ts'`) or `''` when there is none. Thin wrapper over `path.parse(filePath).ext`.
- `removeFileExtension(filePath)` returns `filePath.slice(0, -ext.length)`. **When `ext` is `''`, `slice(0, -0)` is `''`** — the function returns an empty string for any path with no extension.

This quirk is unreachable in practice: the only caller (`computeRelative`) always passes paths produced from real files with extensions. **Don't add a guard** without re-running the `./` prefix regression test — the unguarded behaviour is what the test was written against.

## `determineImportType` — `ImportType | null`, not just `ImportType`

Maps file extension to one of four buckets, with two `null` returns:

| Source extension | Returns |
|------------------|---------|
| `.js`, `.jsx`, `.ts`, `.tsx` | `'script'` |
| `.css` | `'stylesheet'` |
| `.md` | `'markdown'` |
| `.html` | `null` (defensive — gating already rejects HTML→HTML upstream) |
| `.scss` | `null` (so `snippets/languages/scss.ts` falls through its `switch` to its SCSS-specific default that handles `@use`/partial filenames) |
| anything else | `'image'` (`default:` catch-all) |

The `'image'` branch is **not** a guarantee that the source is image-like — it's a default. The runtime gating in `commands/paste-import.ts` is what makes that safe.

Consumers: `snippets/{css,scss,html,markdown}.ts`. JSX/TSX/MDX don't consult this — they branch on the raw source extension via `_shared.ts`.
