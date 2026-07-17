# src/commands/

The commands registered with VS Code. The clipboard is the data channel between copy and paste — except the settings commands (`set-import-placement`, `toggle-preserve-script-extension`, `reset-import-styles`), which read/write configuration only and have no source/destination pair.

## Files

| File | Export | What it does |
|------|--------|--------------|
| `copy-file-path.ts` | `executeCopyFilePath` | Copies the active file's absolute path to clipboard. Shows info toast with action buttons on success ("Paste with Style", "Paste Now"). Rejects with warning toast if clipboard is empty/non-absolute or file has no extension. |
| `paste-import.ts` | `executePasteImport` | Reads clipboard as source, builds and inserts a relative-path import snippet into the active editor. |
| `copy-paste.ts` | `executeCopyPaste` | Runs copy; if successful, runs paste. Paste executes only when copy returns true (file path copied successfully). |
| `paste-import-with-style.ts` | `executePasteImportWithStyle` | Shows a QuickPick of applicable import-style variants for the current pair and inserts the chosen one as a one-shot override; a single-variant pair inserts silently (no picker), an unsupported pair shows a not-supported toast. |
| `set-default-import-style.ts` | `executeSetDefaultImportStyle` | Same picker as `paste-import-with-style.ts`; persists the chosen style as the user's default instead of inserting a one-shot snippet. |
| `set-import-placement.ts` | `executeSetImportPlacement` | Settings command — no source/destination pair, no gating. QuickPick of `Top` / `Bottom` / `Cursor` for where imports are inserted; marks the current value with a checkmark, persists the pick, shows a toast. |
| `toggle-preserve-script-extension.ts` | `executeTogglePreserveScriptExtension` | Settings command — no gating. Flips the preserve-script-file-extension boolean and shows the new state (`On`/`Off`) in a toast. |
| `reset-import-styles.ts` | `executeResetImportStyles` | Settings command — no gating. Clears every customized import-style Global override (every configurable style in `RESETTABLE_STYLES`) back to its `package.json` default; shows an info toast if none are customized, otherwise a toast with an **Undo** action. |
| `index.ts` | (barrel) | Re-exports the commands above; the project's deliberate lone barrel. |

## Command registration

All are registered in `src/extension.ts:activate` with their VS Code IDs:

| Function | VS Code command ID | Default keybinding |
|----------|--------------------|---------------------|
| `executeCopyFilePath` | `extension.copyFilePath` | `cmd/ctrl+shift+a` |
| `executePasteImport` | `extension.pasteImport` | `cmd/ctrl+i` |
| `executeCopyPaste` | `extension.copyPaste` | `alt+d` (in explorer) |
| `executePasteImportWithStyle` | `extension.pasteImportWithStyle` | none (Command Palette / `copy-success` toast button) |
| `executeSetDefaultImportStyle` | `extension.setDefaultImportStyle` | none (Command Palette only) |
| `executeSetImportPlacement` | `extension.setImportPlacement` | none (Command Palette only) |
| `executeTogglePreserveScriptExtension` | `extension.togglePreserveScriptExtension` | none (Command Palette only) |
| `executeResetImportStyles` | `extension.resetImportStyles` | none (Command Palette only) |

Keybindings live in `package.json:contributes.keybindings`.

## Adding a new command

1. New file here, kebab-case noun (e.g. `clear-clipboard.ts`). No `.command.ts` suffix.
2. Export `executeX: () => Promise<void>` (exception: `executeCopyFilePath` returns `Promise<boolean>`). No `Command` suffix — the parent directory carries the kind signal.
3. Add a re-export in `index.ts`.
4. Register in `src/extension.ts`.
5. Add to `package.json:contributes.commands` (and optionally `keybindings`).

See [`CLAUDE.md`](CLAUDE.md) in this directory for invariants (sequential fetch, gating, error semantics).
