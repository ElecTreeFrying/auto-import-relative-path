# src/commands/CLAUDE.md

The five commands registered in `src/extension.ts`. The clipboard is the data channel between copy and paste.

## Files

- `copy-file-path.ts` — `executeCopyFilePath`
- `paste-import.ts` — `executePasteImport`
- `copy-paste.ts` — `executeCopyPaste`
- `paste-import-with-style.ts` — `executePasteImportWithStyle`
- `set-default-import-style.ts` — `executeSetDefaultImportStyle`
- `index.ts` — barrel re-export (the only barrel in the project)

## Conventions

- One file per command; one exported `executeX` per file (no `Command` suffix — the parent directory carries the kind signal).
- All commands are `async`, return `Promise<void>` except `executeCopyFilePath` which returns `Promise<boolean>` to signal success/failure to `copy-paste.ts`.
- Every failure path returns void; **nothing throws**. User-visible signals are toasts (warning or info) via `editor/notification.ts:showNotification`. Commands never call `vscode.window.show*Message` or `vscode.commands.executeCommand('notifications.*')` directly — those go through `showNotification` / `clearNotifications`.

## `copy-file-path.ts` — clipboard round-trip

Delegates to VS Code's built-in `copyFilePath`, then reads the clipboard and re-writes the same string. The round-trip is deliberate: the built-in command's clipboard write is timing/focus-sensitive — re-writing guarantees the next paste-import sees what we just announced.

Calls `clearNotifications()` first. Three outcomes: `showNotification('copy-success', { basename })` on success; `showNotification('no-file-to-copy')` when the clipboard is empty or not an absolute path; `showNotification('no-extension', { basename })` when the copied file has no extension (e.g. `Makefile`, `Dockerfile`). All helpers live in `editor/notification.ts`.

On success, the `copy-success` toast carries two action buttons — **Paste with Style** and **Paste Now** (in that render order, leftmost first) — and the post-toast `.then` handler dispatches `extension.pasteImportWithStyle` / `extension.pasteImport` based on which the user clicked. **Two-site byte-exact contract**: the button label string in `editor/notification.ts` and the `switch` case in this file must match character-for-character — `showInformationMessage` resolves with the literal clicked label, so any drift silently no-ops.

## `paste-import.ts` — the heart of the gating logic

- Aborts if there's no `activeTextEditor`.
- **Sequential fetch.** `getFilePathInfo()` runs first (reads clipboard + active editor), then `buildImportSnippet(info)` runs with the resulting `FilePathInfo`. The snippet builder receives all path data through the `info` parameter — it performs no clipboard or editor reads of its own.
- **Clipboard validation** rejects with `'empty-clipboard'` when empty or not absolute; rejects with `'no-extension'` when the source path has no file extension (e.g. `Makefile`).
- **Same-file rejection** runs before gating: `sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()` → `'same-file-path'` toast.
- **File-existence check:** verifies the source file exists via `vscode.workspace.fs.stat()`; aborts with `'source-not-found'` notification if the file is not found.
- **Eleven-clause gating conjunction** rejects with `'not-supported'` toast if any clause matches. The first nine clauses are delegated to `src/gating.ts:isPairSupported(info)`; the last two are checked inline:
  1–9. `isPairSupported(info)` — see `src/gating.ts` for the nine extension-pair clauses (`CROSS_IMPORT_DESTINATIONS`, `.html → .html`, and the seven destination-specific supported-extension checks). See [`src/constants/CLAUDE.md`](../constants/CLAUDE.md) for the gating tables.
  10. `snippet.value === '\n'` (empty snippet — no language module handled this destination)
  11. `snippet.value === ''` (same)
- See [`src/snippets/CLAUDE.md`](../snippets/CLAUDE.md) for what builds the snippet.

## `copy-paste.ts` — sequential composition with gating

Gates paste on copy success: `const ok = await executeCopyFilePath(); if (!ok) { return; } await executePasteImport();`. Copy failures abort silently (copy's notification already informed the user); only successful copies proceed to paste. **Must remain sequential** — paste reads what copy wrote.

## `paste-import-with-style.ts` — pick-style variant of paste-import

Mirrors `paste-import.ts` step-by-step (clearNotifications → null-check editor → sequential fetch → clipboard sanity → same-file check → file-exists stat → eleven-clause gating), but swaps `buildImportSnippet()` for `snippets/variants.ts:buildImportSnippetVariants()`. Branches on `variants.length` after gating:

- **0** → `'not-supported'` toast (defensive — gating already caught this).
- **1** → insert directly via `insertImportSnippet(new vscode.SnippetString(variants[0].snippetText))`. Single-shape destinations (HTML, Markdown text, CSS image, SCSS image, JSX/TSX/MDX non-script source) take this path so the user gets the same silent-insert UX as `cmd+i`.
- **≥2** → `vscode.window.showQuickPick` with `matchOnDescription: true`. Cancellation (Esc) returns silently — no toast.

The gating mirrors `paste-import.ts` via `src/gating.ts:isPairSupported(info)` clauses 1–9 (`CROSS_IMPORT_DESTINATIONS`, `.html → .html`, the four markup/stylesheet supported-extension checks, and the three framework-component checks for Vue/Svelte/Astro). Clauses 10/11 (the `snippet.value === ''` / `'\n'` checks) collapse to `isEmptyVariantSet` (`variants.length === 0` plus two defensive checks on `variants[0].snippetText` (empty string or newline)). **Persisted style settings are not consulted**; the picker is a one-shot override.

## `set-default-import-style.ts` — picker that persists instead of pasting

Mirrors `paste-import-with-style.ts` step-by-step through gating, clipboard checks, sequential fetch, same-file rejection, file-existence stat, and the eleven-clause `'not-supported'` rejection. Diverges after gating into two sequential guards (not three alternative branches):

- **Line 50:** if `!isPairSupported(info)`, return `'not-supported'` toast.
- **Lines 45–48:** as part of that same guard, if empty variant set (`variants.length === 0` or `variants[0].snippetText` is `''` or `'\n'`), also return `'not-supported'` toast.
- **Lines 54–55:** only after passing the first guard, if `variants.length === 1 || variants[0].setting === undefined`, return `'no-configurable-style'` toast. The second condition rejects hardcoded destinations (HTML, Markdown text, CSS/SCSS images, JSX/TSX/MDX non-script source) which have no configurable `ImportStyle` setting. The matching `*ImportStyle` settings exist in `package.json` for UI parity only and are flagged "Currently unused" in `_styles.ts`; persisting one would be misleading.
- **Lines 61+:** else (≥2 variants with defined settings and supported pair), show `vscode.window.showQuickPick`. On pick, calls `setAutoImportSetting(namespace, key, value)` (writer in `config/settings.ts`, mirror of `getAutoImportSetting`) with `vscode.ConfigurationTarget.Global` and emits `'default-style-saved'` info toast.

The `(namespace, key, value)` triple comes from the new `setting?` field on `ImportSnippetVariant` (see [`snippets/CLAUDE.md`](../snippets/CLAUDE.md)). All styled variants in a single picker invocation share one `(namespace, key)` because the destination switch in `snippets/variants.ts` enumerates from one table per branch — the pair varies between picker runs but never within one. Cancellation (Esc) returns silently — no toast.

**Current-default indicator.** Before opening the picker, the command reads the persisted value via `getAutoImportSetting(namespace, key)` (`vscode.workspace.getConfiguration().get(...)` falls back to the `package.json` default when no user override exists). The variant whose `setting.value` matches the result is moved to position 0 and its `description` gets `$(check) Current default` appended (rendered as a checkmark icon by VS Code's QuickPick). If no variant matches — e.g. the user typed a custom value into `settings.json` that isn't in `_styles.ts` — the picker renders in natural order with no indicator. Byte-exact comparison is safe because `ImportStyle.description` strings are byte-exact contracts with `package.json:enum` per [`config/CLAUDE.md`](../config/CLAUDE.md).

The same picker items appear in both `pasteImportWithStyle` and `setDefaultImportStyle` for the same source/destination pair — `buildImportSnippetVariants` is the shared aggregator.

## Adding a new command

1. New file here, kebab-case noun (no `.command.ts` suffix).
2. Export `executeX: () => Promise<void>` (no `Command` suffix).
3. Re-export from `index.ts`.
4. Register in `src/extension.ts:activate`.
5. Add to `package.json:contributes.commands` (and optionally `contributes.keybindings`).
