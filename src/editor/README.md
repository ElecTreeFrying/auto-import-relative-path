# src/editor/

Helpers that touch the `vscode` API on behalf of `commands/` and `snippets/`. The only home for clipboard reads and notification toasts outside `commands/` and `extension.ts` (snippet building also lives in `snippets/` and `drop/`).

## Files

| File | Public exports | Purpose |
|------|----------------|---------|
| `file-path-info.ts` | `FilePathInfo` (interface), `getFilePathInfo(): Promise<FilePathInfo>`, `getFilePathInfoFromPaths(src, dest): FilePathInfo` | `FilePathInfo` is `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }` — the shape every command and the drop provider passes down the pipeline. Async variant reads clipboard + active editor; sync variant takes explicit paths (used by `drop/provider.ts`). |
| `placement.ts` | High-level: `computeImportPlacement(...)`, `ComputedPlacement` (interface). Low-level: `isInlineSnippet`, `shouldRepositionCursor`, `isMarkdownDestination`, `isCommentLine`, `getLineIndentation`, `detectBlockIndentation`, `adjustForCommentBlock`, `findAstroFrontmatterBounds`, `findSfcScriptBounds`, `findBottomLineInRange`, `isImportLine`, `IMPORT_INDICATORS`. | Placement-rule helpers: inline-snippet detection, forced-cursor check, Astro frontmatter / SFC script bounds, Bottom-placement indicator scan. The low-level helpers feed `insert-snippet.ts`; `computeImportPlacement` is used only by `drop/provider.ts` (returns a `ComputedPlacement` for a `WorkspaceEdit` instead of touching the editor). The two flows duplicate the placement precedence and are pinned in sync by `src/test/editor/placement-parity.test.ts`. |
| `insert-snippet.ts` | `insertImportSnippet(snippet: SnippetString, info: FilePathInfo): void` | Orchestrates snippet insertion: delegates to `placement.ts` for placement decisions, then calls `editor.insertSnippet` at the computed position. |
| `notification.ts` | `showNotification(type, payload?)` / `clearNotifications()` | Centralized notification surface. Raises the toast variants defined in `types/notification.ts` (warning and info) and dismisses prior toasts before a fresh one fires. |

## Where to add new code

- New helper that touches the `vscode` API → here.
- New helper that's pure (no `vscode` import) → `src/path/` instead.

See [`CLAUDE.md`](CLAUDE.md) (this directory) for the placement-rules deep dive (the `IMPORT_INDICATORS` markers, the inline-snippet and forced-cursor overrides).
