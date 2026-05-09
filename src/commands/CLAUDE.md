# src/commands/CLAUDE.md

The three commands registered in `src/extension.ts`. The clipboard is the data channel between copy and paste.

## Files

- `copy-file-path.ts` — `executeCopyFilePath`
- `paste-import.ts` — `executePasteImport`
- `copy-paste.ts` — `executeCopyPaste`
- `index.ts` — barrel re-export (the only barrel in the project)

## Conventions

- One file per command; one exported `executeX` per file (no `Command` suffix — the parent directory carries the kind signal).
- All commands are `async`, return `Promise<void>`.
- Every failure path returns void; **nothing throws**. User-visible signals are toasts (warning or info) via `editor/notification.ts:showNotification`. Commands never call `vscode.window.show*Message` or `vscode.commands.executeCommand('notifications.*')` directly — those go through `showNotification` / `clearNotifications`.

## `copy-file-path.ts` — clipboard round-trip

Delegates to VS Code's built-in `copyFilePath`, then reads the clipboard and re-writes the same string. The round-trip is deliberate: the built-in command's clipboard write is timing/focus-sensitive — re-writing guarantees the next paste-import sees what we just announced.

Calls `clearNotifications()` first, then `showNotification('copy-success', { basename })` on success or `showNotification('no-file-to-copy')` on failure. Both helpers live in `editor/notification.ts`.

## `paste-import.ts` — the heart of the gating logic

- Aborts if there's no `activeTextEditor`.
- **Parallel fetch.** `getFilePathInfo()` and `buildImportSnippet()` run together via `Promise.all`. They share no state and both internally read clipboard + active editor; running concurrently halves latency. Don't introduce a code path that mutates the clipboard between them.
- **Same-file rejection** runs before gating: `sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()` → `'same-file-path'` toast.
- **Eight-clause gating conjunction** rejects with `'not-supported'` toast if any clause matches:
  1. Destination not in `CROSS_IMPORT_DESTINATIONS` AND source ≠ destination extension
  2. `.html → .html` (no relative-import syntax for HTML embedding itself)
  3. Source not in `HTML_SUPPORTED_EXTENSIONS` AND destination is `.html`
  4. Source not in `MARKDOWN_SUPPORTED_EXTENSIONS` AND destination is `.md`
  5. Source not in `CSS_SUPPORTED_EXTENSIONS` AND destination is `.css`
  6. Source not in `SCSS_SUPPORTED_EXTENSIONS` AND destination is `.scss`
  7. `snippet.value === '\n'` (empty snippet — no language module handled this destination)
  8. `snippet.value === ''` (same)
- See `src/constants/CLAUDE.md` for the gating tables; see `src/snippets/CLAUDE.md` for what builds the snippet.

## `copy-paste.ts` — sequential composition

`await executeCopyFilePath(); await executePasteImport();`. **Must remain sequential** — paste reads what copy wrote.

## Adding a new command

1. New file here, kebab-case noun (no `.command.ts` suffix).
2. Export `executeX: () => Promise<void>` (no `Command` suffix).
3. Re-export from `index.ts`.
4. Register in `src/extension.ts:activate`.
5. Add to `package.json:contributes.commands` (and optionally `contributes.keybindings`).
