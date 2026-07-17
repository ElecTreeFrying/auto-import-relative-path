# src/path/

Pure path helpers. **No `vscode` import** — fully Node-testable. New helpers in this directory must remain pure.

## Files

| File | Public function | Purpose |
|------|-----------------|---------|
| `relative.ts` | `computeRelative(sourceFilePath, destinationFilePath): string` | Returns a Unix-style, extension-stripped relative path (with `./` prefix for same-directory imports). Regression-tested in `src/test/path/relative.test.ts`. |
| `extension.ts` | `extractFileExtension(filePath): FileExtension`, `removeFileExtension(filePath): string` | `extractFileExtension` is a thin wrapper over Node's `path.parse`; `removeFileExtension` is a string-slicing helper that removes the extension returned by `extractFileExtension`. |
| `import-type.ts` | `determineImportType(filePath): ImportType \| null` | Classifies a source file as `'script' \| 'stylesheet' \| 'markdown' \| 'image' \| 'video' \| 'audio' \| 'text-track' \| null`. |

## Where to add new code

- Pure path helper → here.
- Anything that touches `vscode` or workspace config → `src/editor/` or `src/config/` instead.

See [`CLAUDE.md`](CLAUDE.md) (this directory) for the `./` prefix rule, the empty-string-on-no-extension quirk, and why `determineImportType` returns `null` for `.html` / `.scss`.
