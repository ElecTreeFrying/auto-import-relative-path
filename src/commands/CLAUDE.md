# src/commands/CLAUDE.md

The eight commands registered in `src/extension.ts`. The clipboard is the data channel between copy and paste; the three settings commands are the exception — they read/write configuration only and have no source/destination pair (see [Settings commands](#settings-commands)).

## Files

- `copy-file-path.ts` — `executeCopyFilePath`
- `paste-import.ts` — `executePasteImport`
- `copy-paste.ts` — `executeCopyPaste`
- `paste-import-with-style.ts` — `executePasteImportWithStyle`
- `set-default-import-style.ts` — `executeSetDefaultImportStyle`
- `set-import-placement.ts` — `executeSetImportPlacement`
- `toggle-preserve-script-extension.ts` — `executeTogglePreserveScriptExtension`
- `reset-import-styles.ts` — `executeResetImportStyles` (+ `restoreImportStyles`, the Undo helper)
- `index.ts` — barrel re-export (the only barrel in the project)

## Conventions

- One file per command; one exported `executeX` per file (no `Command` suffix — the parent directory carries the kind signal).
- All commands are `async`, return `Promise<void>` except `executeCopyFilePath` which returns `Promise<boolean>` to signal success/failure to `copy-paste.ts`.
- Every failure path returns void; **nothing throws**. User-visible signals are toasts (warning or info) via `editor/notification.ts:showNotification`. Commands never call `vscode.window.show*Message` or `vscode.commands.executeCommand('notifications.*')` directly — those go through `showNotification` / `clearNotifications`.

## `copy-file-path.ts` — clipboard round-trip

Delegates to VS Code's built-in `copyFilePath`, then reads the clipboard and re-writes the same string. The round-trip is deliberate: the built-in command's clipboard write is timing/focus-sensitive — re-writing guarantees the next paste-import sees what we just announced.

Calls `clearNotifications()` first. Three outcomes: `showNotification('copy-success', { basename })` on success; `showNotification('no-file-to-copy')` when the clipboard is empty or not an absolute path; `showNotification('no-extension', { basename })` when the copied file has no extension (e.g. `Makefile`, `Dockerfile`). All helpers live in `editor/notification.ts`.

On success, the `copy-success` toast carries two action buttons — **Paste with Style** and **Paste Now** (in that render order, leftmost first) — and the post-toast `.then` handler dispatches `extension.pasteImportWithStyle` / `extension.pasteImport` based on which the user clicked. **Two-site byte-exact contract**: the button label strings in `editor/notification.ts` (lines 50–51) and the `switch` cases in this file (lines 23–30) must match character-for-character — `showInformationMessage` resolves with the literal clicked label, so any drift silently no-ops.

## `paste-import.ts` — the heart of the gating logic

- Aborts if there's no `activeTextEditor`.
- **Sequential fetch.** `getFilePathInfo()` runs first (reads clipboard + active editor), then `buildImportSnippet(info)` runs with the resulting `FilePathInfo`. The snippet builder receives all path data through the `info` parameter — it performs no clipboard or editor reads of its own.
- **Clipboard validation** rejects with `'empty-clipboard'` when empty or not absolute; rejects with `'no-extension'` when the source path has no file extension (e.g. `Makefile`).
- **Same-file rejection** runs before gating: `sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()` → `'same-file-path'` toast.
- **File-existence check:** verifies the source file exists via `vscode.workspace.fs.stat()`; aborts with `'source-not-found'` notification if the file is not found.
- **Eleven-clause gating disjunction** rejects with `'not-supported'` toast if any clause matches. The first nine clauses are delegated to `src/gating.ts:isPairSupported(info)`; the last two are checked inline:
  1–9. `isPairSupported(info)` — see `src/gating.ts` for the nine extension-pair clauses (`CROSS_IMPORT_DESTINATIONS`, `.html → .html`, and the seven destination-specific supported-extension checks). See [`src/constants/CLAUDE.md`](../constants/CLAUDE.md) for the gating tables.
  10. `snippet.value === '\n'` (empty snippet — no language module handled this destination)
  11. `snippet.value === ''` (same)
- See [`src/snippets/CLAUDE.md`](../snippets/CLAUDE.md) for what builds the snippet.

## `copy-paste.ts` — sequential composition with gating

Gates paste on copy success: `const ok = await executeCopyFilePath(); if (!ok) { return; } await executePasteImport();`. Copy failures abort silently (copy's notification already informed the user); only successful copies proceed to paste. **Must remain sequential** — paste reads what copy wrote.

## `paste-import-with-style.ts` — pick-style variant of paste-import

Mirrors `paste-import.ts` step-by-step (clearNotifications → null-check editor → sequential fetch → clipboard sanity → same-file check → file-exists stat → eleven-clause gating), but swaps `buildImportSnippet()` for `snippets/variants.ts:buildImportSnippetVariants()`. Branches on `variants.length` after gating:

- **0** → `'not-supported'` toast (defensive — gating already caught this).
- **1** → insert directly via `insertImportSnippet(new vscode.SnippetString(variants[0].snippetText), info)`. Single-shape destinations (HTML, Markdown text, CSS image, SCSS image, JSX/TSX/MDX non-script source) take this path so the user gets the same silent-insert UX as `cmd+i`.
- **≥2** → `vscode.window.showQuickPick` with `{ placeHolder: 'Select an import style', matchOnDescription: true }`. Cancellation (Esc) returns silently — no toast.

The gating mirrors `paste-import.ts` via `src/gating.ts:isPairSupported(info)` clauses 1–9 (`CROSS_IMPORT_DESTINATIONS`, `.html → .html`, the four markup/stylesheet supported-extension checks, and the three framework-component checks for Vue/Svelte/Astro). Clauses 10/11 (the `snippet.value === ''` / `'\n'` checks) collapse to `isEmptyVariantSet` (`variants.length === 0` plus two defensive checks on `variants[0].snippetText` (empty string or newline)). **Persisted style settings are not consulted**; the picker is a one-shot override.

## `set-default-import-style.ts` — picker that persists instead of pasting

Mirrors `paste-import-with-style.ts` step-by-step through gating, clipboard checks, sequential fetch, same-file rejection, file-existence stat, and the eleven-clause `'not-supported'` rejection. Diverges after gating into two sequential guards (not three alternative branches):

- **Line 50:** if `!isPairSupported(info) || isEmptyVariantSet`, return `'not-supported'` toast — a single OR guard, not two separate checks.
- **Lines 45–48:** `isEmptyVariantSet` is computed just above the guard: `variants.length === 0` or `variants[0].snippetText` is `''` or `'\n'`. It feeds the line-50 disjunction, so an empty variant set also yields the `'not-supported'` toast.
- **Lines 54–55:** only after passing the first guard, if `variants.length === 1 || variants[0].setting === undefined`, return `'no-configurable-style'` toast. The second condition rejects hardcoded destinations (HTML, Markdown text, CSS/SCSS images, JSX/TSX/MDX non-script source) which have no configurable `ImportStyle` setting. The matching `*ImportStyle` settings exist in `package.json` for UI parity only and are flagged "Currently unused" in `_styles.ts`; persisting one would be misleading.
- **Lines 61+:** else (≥2 variants with defined settings and supported pair), show `vscode.window.showQuickPick`. On pick, calls `setAutoImportSetting(namespace, key, value)` (writer in `config/settings.ts`, mirror of `getAutoImportSetting`) with `vscode.ConfigurationTarget.Global` and emits `'default-style-saved'` info toast.

The `(namespace, key, value)` triple comes from the new `setting?` field on `ImportSnippetVariant` (see [`snippets/CLAUDE.md`](../snippets/CLAUDE.md)). All styled variants in a single picker invocation share one `(namespace, key)` because the destination switch in `snippets/variants.ts` enumerates from one table per branch — the pair varies between picker runs but never within one. Cancellation (Esc) returns silently — no toast.

**Current-default indicator.** Before opening the picker, the command reads the persisted value via `getAutoImportSetting(namespace, key)` (`vscode.workspace.getConfiguration().get(...)` falls back to the `package.json` default when no user override exists). The variant whose `setting.value` matches the result is moved to position 0 and its `description` is **replaced** with `$(check) Current default` (rendered as a checkmark icon by VS Code's QuickPick) — the per-style description text is dropped on that one row, leaving just the checkmark annotation. If no variant matches — e.g. the user typed a custom value into `settings.json` that isn't in `_styles.ts` — the picker renders in natural order with no indicator. Byte-exact comparison is safe because `ImportStyle.description` strings are byte-exact contracts with `package.json:enum` per [`config/CLAUDE.md`](../config/CLAUDE.md).

The same picker items appear in both `pasteImportWithStyle` and `setDefaultImportStyle` for the same source/destination pair — `buildImportSnippetVariants` is the shared aggregator.

## Settings commands

`set-import-placement.ts`, `toggle-preserve-script-extension.ts`, and `reset-import-styles.ts` are **settings commands**: they act on global configuration, not on a source→destination pair. Unlike the five copy/paste commands above, they run **none** of the gating preamble — no `activeTextEditor` requirement, no clipboard read, no `getFilePathInfo`, no `fs.stat`, no `isPairSupported`, no `buildImportSnippetVariants`. Each reads/writes configuration via `getAutoImportSetting` / `setAutoImportSetting` (defaulting to `ConfigurationTarget.Global`, like `set-default-import-style.ts`); `reset-import-styles.ts` additionally calls `inspectAutoImportSetting` to find user overrides. Each emits an info toast through `showNotification`, and all work with no editor open.

- `set-import-placement.ts` — QuickPick over `Top` / `Bottom` / `Cursor` for `auto-import.preferences.importStatementPlacement` (`preferences` / `placement`). Reuses the `$(check)`-current + splice-to-position-0 shape of `set-default-import-style.ts:73-98`, minus the variant/pair logic. The option list and `detail` strings are local to the file — the placement enum is **not** in `_styles.ts` (it is matched literally in `editor/placement.ts` + `editor/insert-snippet.ts`), so adding this command introduces no new enum value and does not touch those switches. Persists the pick and emits `'placement-saved'`. Esc cancels silently.
- `toggle-preserve-script-extension.ts` — flips the `auto-import.importStatement.script.preserveScriptFileExtension` boolean (`script` / `preserve`, `?? false` when unset) and emits `'preserve-script-extension-toggled'` (`On` / `Off`). No QuickPick. **Living-gate note:** if the deferred tri-state enum in [`docs/import-statements/future/auto-detect-extensions.md`](../../docs/import-statements/future/auto-detect-extensions.md) ever replaces the boolean, this 2-state toggle must be reconciled (3-way picker or removal).
- `reset-import-styles.ts` — clears the user's Global override on the **nine** configurable import-style settings (`RESETTABLE_STYLES`: `script.javascript`/`typescript`, `stylesheet.css`/`scss`, `markup.htmlScript`/`htmlImage`/`htmlVideo`/`htmlAudio`/`markdownImage`), restoring each to its `package.json` default. Excludes the two `preserve…FileExtension` booleans, `importStatementPlacement`, and the four dormant single-shape keys (`cssImage`, `scssImage`, `htmlStyleSheet`, `markdown`) — resetting a one-value setting is meaningless. Counts only settings with an actual Global override via `inspectAutoImportSetting(...).globalValue`: none customized → `'no-styles-to-reset'` and return; otherwise clears them and emits `'styles-reset'` (`{ count }`) carrying an **Undo** action that re-writes the captured prior values through the exported `restoreImportStyles` (which then emits `'styles-restored'`). The **Undo** label is a second instance of the two-site button-label contract — `editor/notification.ts` ↔ this file's `switch`. Workspace-level overrides are left untouched; the extension writes only to Global.

## Adding a new command

1. New file here, kebab-case noun (no `.command.ts` suffix).
2. Export `executeX: () => Promise<void>` (no `Command` suffix).
3. Re-export from `index.ts`.
4. Register in `src/extension.ts:activate`.
5. Add to `package.json:contributes.commands` (and optionally `contributes.keybindings`).
