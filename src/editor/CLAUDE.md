# src/editor/CLAUDE.md

Helpers that touch the `vscode` API on behalf of `commands/` and `snippets/`. This is the **only** layer outside `commands/` and `extension.ts` that imports `vscode` for clipboard/snippet/notification.

## Files

- `file-path-info.ts` — single source of truth for `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }`.
- `insert-snippet.ts` — placement logic (Top/Bottom/Cursor + forced overrides + column 0/cursor column).
- `notify.ts` — single switch on `NotifyType`.

## `file-path-info.ts:getFilePathInfo()`

- Reads source from clipboard, destination from `vscode.window.activeTextEditor.document.uri.fsPath`.
- **Caller is responsible for the active-editor null check** — this function dereferences `editor.document.uri.fsPath` unconditionally and will throw otherwise. The only producer (`commands/paste-import.ts`) does this check.
- **Each call re-reads the clipboard.** Don't introduce branches that mutate the clipboard between calls. `paste-import.ts`'s `Promise.all` runs two such reads in parallel and relies on both seeing the same value.
- Called from many sites: every per-language `snippet()`, `_shared.ts:renderReactImport`, `dispatch.ts`, and `insert-snippet.ts:shouldRepositionCursor`.

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

`determineInsertionColumn(editor)` returns `0` for destinations whose extension is in `constants/extensions.ts:SCRIPT_EXTENSIONS` or `STYLESHEET_EXTENSIONS`; otherwise the cursor's column (important for HTML/Markdown where the user is typing inline).

## `notify.ts:showNotification(notifyType)`

- Single `switch` on `NotifyType` (string-literal union from `types/notification.ts`).
- Two cases: `'same-file-path'` and `'not-supported'`. Both messages are warning toasts prefixed with `Auto Import Relative Path:`.
- Both variants are raised exclusively from `commands/paste-import.ts`.
