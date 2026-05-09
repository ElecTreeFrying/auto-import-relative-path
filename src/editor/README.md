# src/editor/

Helpers that touch the `vscode` API on behalf of `commands/` and `snippets/`. The only modules outside `commands/` and `extension.ts` that import `vscode` for clipboard/snippet/notification.

## Files

| File | Public function | Purpose |
|------|-----------------|---------|
| `file-path-info.ts` | `getFilePathInfo(): Promise<FilePathInfo>` | Returns `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }` from clipboard + active editor. |
| `insert-snippet.ts` | `insertImportSnippet(snippet: SnippetString): Promise<void>` | Chooses Top / Bottom / Cursor placement (or forces Cursor for HTML/MD/non-stylesheet → stylesheet) and sets the insertion column. |
| `notification.ts` | `showNotification(type, payload?)` / `clearNotifications()` | Centralized notification surface. Raises one of seven toasts (six warning, one info) and dismisses prior toasts before a fresh one fires. |

## Where to add new code

- New helper that touches the `vscode` API → here.
- New helper that's pure (no `vscode` import) → `src/path/` instead.

See `CLAUDE.md` (this directory) for the placement-rules deep dive (the ten `importIndicators`, the forced-cursor override).
