# src/commands/

The five commands registered with VS Code. The clipboard is the data channel between copy and paste.

## Files

| File | Export | What it does |
|------|--------|--------------|
| `copy-file-path.ts` | `executeCopyFilePath` | Copies the active file's absolute path to clipboard. Shows info toast with action buttons on success ("Paste with Style", "Paste Now"). Rejects with warning toast if clipboard is empty/non-absolute or file has no extension. |
| `paste-import.ts` | `executePasteImport` | Reads clipboard as source, builds and inserts a relative-path import snippet into the active editor. |
| `copy-paste.ts` | `executeCopyPaste` | Runs copy; if successful, runs paste. Paste executes only when copy returns true (file path copied successfully). |
| `paste-import-with-style.ts` | `executePasteImportWithStyle` | Shows a QuickPick of every applicable import-style variant for the current source/destination pair; inserts the chosen one as a one-shot override. |
| `set-default-import-style.ts` | `executeSetDefaultImportStyle` | Same picker as `paste-import-with-style.ts`; persists the chosen style as the user's default instead of inserting a one-shot snippet. |
| `index.ts` | (barrel) | Re-exports the five above. The only barrel in the project. |

## Command registration

All five are registered in `src/extension.ts:activate` with their VS Code IDs:

| Function | VS Code command ID | Default keybinding |
|----------|--------------------|---------------------|
| `executeCopyFilePath` | `extension.copyFilePath` | `cmd/ctrl+shift+a` |
| `executePasteImport` | `extension.pasteImport` | `cmd/ctrl+i` |
| `executeCopyPaste` | `extension.copyPaste` | `alt+d` (in explorer) |
| `executePasteImportWithStyle` | `extension.pasteImportWithStyle` | none (Command Palette / `copy-success` toast button) |
| `executeSetDefaultImportStyle` | `extension.setDefaultImportStyle` | none (Command Palette only) |

Keybindings live in `package.json:contributes.keybindings`.

## Adding a new command

1. New file here, kebab-case noun (e.g. `clear-clipboard.ts`). No `.command.ts` suffix.
2. Export `executeX: () => Promise<void>` (exception: `executeCopyFilePath` returns `Promise<boolean>`). No `Command` suffix — the parent directory carries the kind signal.
3. Add a re-export in `index.ts`.
4. Register in `src/extension.ts`.
5. Add to `package.json:contributes.commands` (and optionally `keybindings`).

See [`CLAUDE.md`](CLAUDE.md) in this directory for invariants (sequential fetch, gating, error semantics).
