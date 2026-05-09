# src/commands/

The three commands registered with VS Code. The clipboard is the data channel between copy and paste.

## Files

| File | Export | What it does |
|------|--------|--------------|
| `copy-file-path.ts` | `executeCopyFilePath` | Copies the active file's absolute path to clipboard; shows "Copied <basename>" toast. |
| `paste-import.ts` | `executePasteImport` | Reads clipboard as source, builds and inserts a relative-path import snippet into the active editor. |
| `copy-paste.ts` | `executeCopyPaste` | Runs copy then paste sequentially. |
| `index.ts` | (barrel) | Re-exports the three above. The only barrel in the project. |

## Command registration

All three are registered in `src/extension.ts:activate` with their VS Code IDs:

| Function | VS Code command ID | Default keybinding |
|----------|--------------------|---------------------|
| `executeCopyFilePath` | `extension.copyFilePath` | `cmd/ctrl+shift+a` |
| `executePasteImport` | `extension.pasteImport` | `cmd/ctrl+i` |
| `executeCopyPaste` | `extension.copyPaste` | `alt+d` (in explorer) |

Keybindings live in `package.json:contributes.keybindings`.

## Adding a new command

1. New file here, kebab-case noun (e.g. `clear-clipboard.ts`). No `.command.ts` suffix.
2. Export `executeX: () => Promise<void>` (no `Command` suffix — the parent directory carries the kind signal).
3. Add a re-export in `index.ts`.
4. Register in `src/extension.ts`.
5. Add to `package.json:contributes.commands` (and optionally `keybindings`).

See `CLAUDE.md` in this directory for invariants (parallel fetch, gating, error semantics).
