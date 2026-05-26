# src/editor/

Helpers that touch the `vscode` API on behalf of `commands/` and `snippets/`. The only modules outside `commands/` and `extension.ts` that import `vscode` for clipboard/snippet/notification.

## Files

| File | Public function | Purpose |
|------|-----------------|---------|
| `file-path-info.ts` | `getFilePathInfo(): Promise<FilePathInfo>`, `getFilePathInfoFromPaths(src, dest): FilePathInfo` | Returns `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }`. Async variant reads clipboard + active editor; sync variant takes explicit paths (used by `drop/provider.ts`). |
| `placement.ts` | `computeImportPlacement(...)`, `isInlineSnippet(...)`, `IMPORT_INDICATORS`, etc. | Placement-rule helpers: inline-snippet detection, forced-cursor check, Astro frontmatter / SFC script bounds, Bottom-placement indicator scan. |
| `insert-snippet.ts` | `insertImportSnippet(snippet: SnippetString, info: FilePathInfo): void` | Orchestrates snippet insertion: delegates to `placement.ts` for placement decisions, then calls `editor.insertSnippet` at the computed position. |
| `notification.ts` | `showNotification(type, payload?)` / `clearNotifications()` | Centralized notification surface. Raises one of ten toasts (eight warning, two info) and dismisses prior toasts before a fresh one fires. |

## Where to add new code

- New helper that touches the `vscode` API → here.
- New helper that's pure (no `vscode` import) → `src/path/` instead.

See [`CLAUDE.md`](CLAUDE.md) (this directory) for the placement-rules deep dive (the nine `IMPORT_INDICATORS`, the inline-snippet and forced-cursor overrides).
