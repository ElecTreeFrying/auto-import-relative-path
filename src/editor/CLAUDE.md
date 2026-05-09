# src/editor/CLAUDE.md

Helpers that touch the `vscode` API on behalf of `commands/` and `snippets/`. This is the **only** layer outside `commands/` and `extension.ts` that imports `vscode` for clipboard/snippet/notification.

## Files

- `file-path-info.ts` — single source of truth for `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }`.
- `insert-snippet.ts` — placement logic (Top/Bottom/Cursor + forced overrides + column 0/cursor column).
- `notification.ts` — single switch on `NotificationType` plus a `clearNotifications()` helper.

## `file-path-info.ts:getFilePathInfo()`

- Reads source from clipboard, destination from `vscode.window.activeTextEditor.document.uri.fsPath`.
- **Caller is responsible for the active-editor null check** — this function dereferences `editor.document.uri.fsPath` unconditionally and will throw otherwise. The only producer (`commands/paste-import.ts`) does this check.
- **Each call re-reads the clipboard.** Don't introduce branches that mutate the clipboard between calls. `paste-import.ts`'s `Promise.all` runs two such reads in parallel and relies on both seeing the same value.
- Called from many sites: every per-language `buildSnippet()`, `_shared.ts:buildReactImport`, `dispatch.ts`, and `insert-snippet.ts:shouldRepositionCursor`.

## `insert-snippet.ts` — placement rules

Order of precedence:

1. **Forced cursor** (`shouldRepositionCursor` returns true) — always wins. Triggers when:
   - Destination is `.html` or `.md` (no canonical "top of file" for embedded tags).
   - Destination is a stylesheet (`.css`/`.scss`) but source is *not* the same stylesheet kind (e.g. `.css` importing an image — `url('...')` belongs at the cursor).
2. **User setting** `auto-import.preferences.importStatementPlacement` — `'Top'` / `'Bottom'` / `'Cursor'` matched **literally** as strings. Adding a new placement requires editing both the `switch` here and the `enum` in `package.json`.

### "Bottom" insertion

Walks `document.getText().split('\n')` looking for any of **ten** `importIndicators` markers and inserts after the last match:

```
'import ', 'var name = require(', 'const name = require(', 'require(',
"@import '", '@import "', '@import url(', '@import (', "@use '", '@use "'
```

Falls through to line 0 when no marker matches. **New import-syntax markers must be added here** or "Bottom" placement will silently land at line 0 instead of after the existing imports.

### Insertion column

`determineInsertionColumn(editor)` returns `0` for destinations whose extension is in `constants/extensions.ts:SCRIPT_FILE_EXTENSIONS` or `STYLESHEET_FILE_EXTENSIONS`; otherwise the cursor's column (important for HTML/Markdown where the user is typing inline).

## `notification.ts:showNotification(type, payload?)` and `clearNotifications()`

### `showNotification(type, payload?)`

- Overloaded function dispatching on `NotificationType` (string-literal union from `types/notification.ts`).
- Seven variants. Four are payload-less; three interpolate values into the message:
  - `'not-supported'` takes `{ sourceExt, destinationExt }` — emits `Auto Import: Cannot import .X into .Y files.`
  - `'source-not-found'` takes `{ basename }` — emits `Auto Import: Source file no longer exists: <basename>.`
  - `'copy-success'` takes `{ basename }` — emits `Auto Import: Copied path — <basename>` (info toast, not warning)
- TypeScript overload resolution enforces the right payload (or no payload) at every call site. The implementation signature uses a wide payload type and `!` non-null assertions because the overloads are the type-safety boundary.
- Six variants render via `showWarningMessage`; only `'copy-success'` renders via `showInformationMessage`. The level is hardcoded per-variant inside the `switch`.
- Producers: `commands/paste-import.ts` raises five (`'same-file-path'`, `'not-supported'`, `'no-active-editor'`, `'empty-clipboard'`, `'source-not-found'`); `commands/copy-file-path.ts` raises two (`'no-file-to-copy'`, `'copy-success'`).
- All messages share the `Auto Import:` prefix — matches the command titles in `package.json`.

### `clearNotifications()`

- Wraps `vscode.commands.executeCommand('notifications.clearAll')` so commands don't reach into the VS Code command palette directly for notification-system side effects.
- Fire-and-forget — the underlying `executeCommand` returns a Thenable that's deliberately not awaited.
- Producers: `commands/paste-import.ts` and `commands/copy-file-path.ts` both call this at the top of their execution to dismiss any lingering toasts before a fresh one fires.
- This is the **only** allowed entry point for `notifications.clearAll` outside of `notification.ts`. Commands must not inline the `executeCommand('notifications.clearAll')` call.

### Command-name coupling

The `'empty-clipboard'` message references the literal command title `Auto Import: Copy File Path` from `package.json:contributes.commands`. If that title ever changes, three sites must update in lock-step:

1. `package.json:contributes.commands[].title` — the canonical command title.
2. `src/editor/notification.ts` — the `'empty-clipboard'` case's message string.
3. `src/types/notification.ts` — the TSDoc on the `'empty-clipboard'` variant that quotes the message verbatim.
