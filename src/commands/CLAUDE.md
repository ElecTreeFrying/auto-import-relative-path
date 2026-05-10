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
- All commands are `async`, return `Promise<void>`.
- Every failure path returns void; **nothing throws**. User-visible signals are toasts (warning or info) via `editor/notification.ts:showNotification`. Commands never call `vscode.window.show*Message` or `vscode.commands.executeCommand('notifications.*')` directly — those go through `showNotification` / `clearNotifications`.

## `copy-file-path.ts` — clipboard round-trip

Delegates to VS Code's built-in `copyFilePath`, then reads the clipboard and re-writes the same string. The round-trip is deliberate: the built-in command's clipboard write is timing/focus-sensitive — re-writing guarantees the next paste-import sees what we just announced.

Calls `clearNotifications()` first, then `showNotification('copy-success', { basename })` on success or `showNotification('no-file-to-copy')` on failure. Both helpers live in `editor/notification.ts`.

On success, the `copy-success` toast carries two action buttons — **Paste Now** and **Paste with Style** — and the post-toast `.then` handler dispatches `extension.pasteImport` / `extension.pasteImportWithStyle` based on which the user clicked. **Two-site byte-exact contract**: the button label string in `editor/notification.ts` and the `switch` case in this file must match character-for-character — `showInformationMessage` resolves with the literal clicked label, so any drift silently no-ops.

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

## `paste-import-with-style.ts` — pick-style variant of paste-import

Mirrors `paste-import.ts` step-by-step (clearNotifications → null-check editor → parallel fetch → clipboard sanity → same-file check → file-exists stat → 8-clause gating), but swaps `buildImportSnippet()` for `snippets/variants.ts:buildImportSnippetVariants()`. Branches on `variants.length` after gating:

- **0** → `'not-supported'` toast (defensive — gating already caught this).
- **1** → insert directly via `insertImportSnippet(new vscode.SnippetString(variants[0].snippetText))`. Single-shape destinations (HTML, Markdown text, CSS image, SCSS image, JSX/TSX non-script source) take this path so the user gets the same silent-insert UX as `cmd+i`.
- **≥2** → `vscode.window.showQuickPick` with `matchOnDescription: true`. Cancellation (Esc) returns silently — no toast.

The eight-clause gating is reused verbatim except clauses 7/8 (the `snippet.value === ''` / `'\n'` checks) collapse to `variants.length === 0` plus a defensive check on `variants[0].snippetText`. **Persisted style settings are not consulted**; the picker is a one-shot override.

## `set-default-import-style.ts` — picker that persists instead of pasting

Mirrors `paste-import-with-style.ts` step-by-step through gating, clipboard checks, parallel fetch, same-file rejection, file-existence stat, and the eight-clause `'not-supported'` rejection. Diverges after gating:

- **0 variants OR empty first variant** → `'not-supported'` toast (defensive).
- **1 variant OR `variants[0].setting === undefined`** (hardcoded destination — HTML, Markdown text, CSS/SCSS image, JSX/TSX non-script source) → new `'no-configurable-style'` toast. The matching `*ImportStyle` settings exist in `package.json` for UI parity only and are flagged "Currently unused" in `_styles.ts`; persisting one would be misleading.
- **≥2 styled variants** → `vscode.window.showQuickPick`. On pick, calls `setAutoImportSetting(namespace, key, value)` (writer in `config/settings.ts`, mirror of `getAutoImportSetting`) with `vscode.ConfigurationTarget.Global` and emits `'default-style-saved'` info toast.

The `(namespace, key, value)` triple comes from the new `setting?` field on `ImportSnippetVariant` (see `snippets/CLAUDE.md`). All styled variants in a single picker invocation share one `(namespace, key)` because the destination switch in `snippets/variants.ts` enumerates from one table per branch — the pair varies between picker runs but never within one. Cancellation (Esc) returns silently — no toast.

**Current-default indicator.** Before opening the picker, the command reads the persisted value via `getAutoImportSetting(namespace, key)` (`vscode.workspace.getConfiguration().get(...)` falls back to the `package.json` default when no user override exists). The variant whose `setting.value` matches the result is moved to position 0 and its `description` gets `$(check) Current default` appended (rendered as a checkmark icon by VS Code's QuickPick). If no variant matches — e.g. the user typed a custom value into `settings.json` that isn't in `_styles.ts` — the picker renders in natural order with no indicator. Byte-exact comparison is safe because `ImportStyle.description` strings are byte-exact contracts with `package.json:enum` per `config/CLAUDE.md`.

The same picker items appear in both `pasteImportWithStyle` and `setDefaultImportStyle` for the same source/destination pair — `buildImportSnippetVariants` is the shared aggregator.

## Adding a new command

1. New file here, kebab-case noun (no `.command.ts` suffix).
2. Export `executeX: () => Promise<void>` (no `Command` suffix).
3. Re-export from `index.ts`.
4. Register in `src/extension.ts:activate`.
5. Add to `package.json:contributes.commands` (and optionally `contributes.keybindings`).
