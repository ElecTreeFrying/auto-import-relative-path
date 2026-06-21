# src/drop/CLAUDE.md

Drag-and-drop import provider registered via the VS Code `DocumentDropEditProvider` API. A second entry point for import generation alongside the clipboard-based commands in `src/commands/`.

## Files

- `provider.ts` — `AutoImportOnDropProvider` class implementing `DocumentDropEditProvider`.
- `selector.ts` — `DROP_LANGUAGE_SELECTORS` constant: `DocumentSelector` covering all 13 supported destination languages (`scheme: 'file'` only).

## `provider.ts` — `AutoImportOnDropProvider`

### Source resolution

`resolveSourcePath(dataTransfer)` extracts the dragged file's path from the `DataTransfer` object:

1. Tries `text/uri-list` first — parses the first line as a URI and returns `Uri.parse(raw).fsPath`.
2. Would fall back to `text/plain` — returns the value only if it's an absolute path (`path.isAbsolute`). Unreachable in practice: the provider is registered with `dropMimeTypes: [ 'text/uri-list' ]` (see Architectural position), so VS Code never populates `text/plain` in the `DataTransfer`. Kept as a defensive branch.
3. Returns `null` if neither item yields a usable path → provider returns `null` (no drop edit offered).

### Flow

1. Resolve source path from `DataTransfer`. Return `null` if missing.
2. Read destination from `document.uri.fsPath` (passed by the API — no active-editor lookup).
3. **Same-file check** (case-insensitive) → `'same-file-path'` toast, return `suppressDrop()`.
4. Build `FilePathInfo` via sync `getFilePathInfoFromPaths(source, dest)` — no clipboard read, no async.
5. **Gating** via `isPairSupported(info)` from `src/gating.ts` (shared with `commands/`) → `'not-supported'` toast, return `suppressDrop()`.
6. Build snippet via async `buildImportSnippet(info)` → `Promise<SnippetString>` (awaited). Empty/newline-only snippet value → `'not-supported'` toast, return `suppressDrop()`.
7. Compute placement via `computeImportPlacement(...)` from `src/editor/placement.ts` — same Top/Bottom/Cursor/Astro/SFC logic as the command flow, parameterised with the drop position.
8. If inline snippet: return `DocumentDropEdit(snippet)` directly. Otherwise: build a `WorkspaceEdit` with a `SnippetTextEdit.insert` at the computed line/column and attach it as `dropEdit.additionalEdit`.

**`null` vs. `suppressDrop()`.** The provider returns a real `null` in exactly one place — step 1, when the dragged file can't be identified at all — which *cedes* the drop to VS Code's built-in handling. The early-exits at steps 3/5/6 instead return `suppressDrop()`: an **empty** `DocumentDropEdit` (empty `SnippetString`, tagged with the module constants `EDIT_KIND` = `DocumentDropOrPasteEditKind.TextUpdateImports.append('autoImport')` and `EDIT_TITLE` = `'Auto Import'`). Returning `null` there would let VS Code fall back to its default *insert-relative-path* edit — the stray raw path that used to land on unsupported drops; the empty edit **out-ranks** that default, resolving the drop to a no-op so **nothing is inserted**. The `'same-file-path'` / `'not-supported'` toast still fires at the call site.

### What the drop flow does NOT do (vs. the command flow)

| Concern | Command flow | Drop flow |
|---------|-------------|-----------|
| Source | Clipboard (`env.clipboard.readText`) | `DataTransfer` (`text/uri-list` / `text/plain`) |
| Destination | `activeTextEditor.document.uri.fsPath` | `document.uri.fsPath` (provider parameter) |
| FilePathInfo | Async `getFilePathInfo()` | Sync `getFilePathInfoFromPaths()` |
| Clipboard validation | `'empty-clipboard'`, `'no-extension'` | Skipped — DataTransfer items are file-backed |
| File-exists stat | `vscode.workspace.fs.stat` → `'source-not-found'` | Skipped — dragged file exists by definition |
| Unsupported pair | `'not-supported'` toast, return void | `'not-supported'` toast, return `suppressDrop()` — an empty edit that out-ranks VS Code's default, so nothing is inserted |
| Placement | `insertImportSnippet` orchestrator | `computeImportPlacement` + `WorkspaceEdit` |
| `clearNotifications` | Called at entry | Not called — the provider only *proposes* an edit it doesn't own, and `clearNotifications` is the window-global `notifications.clearAll`; too blunt to fire off a drag |

## `selector.ts` — `DROP_LANGUAGE_SELECTORS`

Thirteen entries covering every supported destination language: eleven matched by VS Code language ID (`javascript`, `javascriptreact`, `typescript`, `typescriptreact`, `css`, `scss`, `html`, `markdown`, `vue`, `svelte`, `astro`), plus `.mdx` and `.tex` matched by **file pattern** (`**/*.mdx`, `**/*.tex`) — neither has a guaranteed VS Code language ID (VS Code ships no LaTeX language; a `.tex` file opens as plaintext without a LaTeX extension). All entries use `scheme: 'file'`.

These are VS Code language IDs, whereas the four-site sync and `dispatch.ts` are keyed on file extension — so the two move independently:

- **New language ID for an existing file extension** → add a `{ language, scheme: 'file' }` entry here only. The extension already flows through the four-site sync, so it needs no change.
- **New file extension** (e.g. `.rs`) → run the four-site sync described in [`src/types/CLAUDE.md`](../types/CLAUDE.md), and add a `{ language, scheme: 'file' }` entry here too unless its language ID is already listed above.

## Architectural position

Same layer as `commands/` — imports from `editor/`, `snippets/`, and `gating.ts`. Registered in `src/extension.ts:activate` via `vscode.languages.registerDocumentDropEditProvider(DROP_LANGUAGE_SELECTORS, new AutoImportOnDropProvider(), { dropMimeTypes: [ 'text/uri-list' ] })`.
