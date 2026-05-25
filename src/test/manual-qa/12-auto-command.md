# 12 — Auto command (`extension.copyPaste`)

Validates `executeCopyPaste` — the sequential `await executeCopyFilePath(); await executePasteImport();` flow. Bound to `alt+d` from the Explorer only.

**Sources:**
- `src/commands/copy-paste.ts` — sequential composition
- `src/commands/copy-file-path.ts` — copy phase (Bug #3 fixes here)
- `src/commands/paste-import.ts` — paste phase

## Setup

- 00-setup.md complete; 01-sanity passed
- `placement = Bottom` (default)
- `typescriptImportStyle = import { name } from '_relativePath_';`
- `preserveScriptFileExtension = false`

## Basic happy path

- [ ] **Single Auto.** Open `src/bar.ts` (active editor). In Explorer, click `src/foo.ts` (single click — selected, not opened). Press `Alt+D`.
  **Expect:**
  - Info toast: `Auto Import: Copied path — foo.ts`
  - `src/bar.ts` now contains `import { $1 } from './foo';`
  - Clipboard contains the absolute path of `foo.ts`

## Sequential ordering

- [ ] **Copy fires before paste.** With `bar.ts` open, click `src/helpers.ts` in Explorer → `Alt+D`.
  **Expect:** clipboard now has `helpers.ts`'s path (verify by external paste). The import in `bar.ts` is for `helpers`, not whatever was in clipboard before.

- [ ] **Paste uses the just-copied path.** Run Auto on `foo.ts`. Verify the import is for `foo`, not for the previously-copied path.

## Race condition stress (Bug #3 verification)

The fix awaits `executeCommand('copyFilePath')` and `clipboard.writeText` so paste reliably reads the just-written path.

- [ ] **Rapid fire.** Click `foo.ts` in Explorer → `Alt+D`. Undo. Click `helpers.ts` → `Alt+D`. Undo. Click `bar.ts` → `Alt+D`. Repeat fast 10 times, varying source.
  **Expect:** every iteration imports the correct source. No stale paths.

- [ ] **Cross-extension stress.** Same as above but mix in `assets/logo.png` into `src/widget.tsx`, `styles/_partial.scss` into `styles/main.scss`, `src/sibling.js` into `src/badge.jsx`.
  **Expect:** every Auto imports the correct source with the correct shape.

- [ ] **Focus jitter.** Run `Alt+D`, then immediately click between editor tabs and back. Run another `Alt+D`.
  **Expect:** each call resolves its own copy→paste pair correctly.

## Keybinding context

- [ ] **`alt+d` from editor does NOT trigger.** Click inside the editor body (editor focus). Press `Alt+D`.
  **Expect:** nothing happens (keybinding `when: filesExplorerFocus` blocks it).

- [ ] **`alt+d` from Explorer triggers.** Click in the Explorer pane. Press `Alt+D`.
  **Expect:** Auto runs.

- [ ] **Palette invocation works regardless of focus.** `Cmd/Ctrl+Shift+P` → `Auto Import: Insert Import from Selected File`. With editor focused. Verify it runs.

## Behavior when paste rejects (copy still succeeds)

`executeCopyPaste` only runs paste when copy succeeds (`copy-paste.ts:6-8` short-circuits on `false`). When copy succeeds but paste's gating rejects, you get the copy-success toast first, then the paste-side warning. Clipboard is updated either way.

- [ ] **Mismatched pair.** `src/bar.ts` open. In Explorer, click `pages/index.html` → `Alt+D`.
  **Expect:**
  - Copy: info toast `Auto Import: Copied path — index.html`.
  - Paste: warning toast `Auto Import: Cannot import .html into .ts files.` because `.ts` destination is not in `CROSS_IMPORT_DESTINATIONS` and source ext (`.html`) ≠ `.ts`.
  - Clipboard now has `index.html`'s path (next paste will use this).

- [ ] **Self-target.** `src/foo.ts` open. Click `src/foo.ts` in Explorer → `Alt+D`.
  **Expect:**
  - Copy: info toast `Auto Import: Copied path — foo.ts`.
  - Paste: warning toast `Auto Import: A file cannot import itself.` (same-file rejection — fires before gating).
  - Editor unchanged.

## No-active-editor scenario

- [ ] **Close all editors, then Auto from Explorer.** Close all open editor tabs. Click `src/foo.ts` in Explorer → `Alt+D`.
  **Expect:**
  - Copy succeeds (info toast `Auto Import: Copied path — foo.ts`); clipboard updated.
  - Paste fires the warning toast `Auto Import: Open a file to paste an import.` — the `'no-active-editor'` notification was previously a silent return; it now toasts so the user knows why nothing was inserted.

## Copy fails → paste short-circuits

When copy can't produce a usable path, `executeCopyFilePath` returns `false` and `copy-paste.ts:6-8` bails before paste runs. Verifies the new contract introduced alongside the `'no-file-to-copy'` notification.

- [ ] **No Explorer selection.** Close all editors. Click an empty area of the Explorer (no file selected). Press `Alt+D`.
  **Expect:**
  - Single warning toast `Auto Import: No file selected to copy.`
  - **No** subsequent "no active editor" or "not supported" toast — paste was never invoked.
  - Clipboard untouched.

- [ ] **Selection in Explorer but a non-file (e.g., a folder).** Click `src/components/` (a folder) in Explorer → `Alt+D`.
  **Expect:** same — `'no-file-to-copy'` toast (the round-tripped clipboard fails the absolute-path-with-extension guard in `copy-file-path.ts:31-34`); paste short-circuited.

## Multiple files selected in Explorer

- [ ] **Multi-select then Auto.** Hold Cmd/Ctrl, click `foo.ts` and `bar.ts` in Explorer. Press `Alt+D`.
  **Expect:** the built-in `copyFilePath` copies the LAST clicked file's path (or whatever VS Code's default is). Paste uses that. **Document the actual behavior** — this is VS Code's behavior, not ours.

## Copy-then-paste vs Auto produce identical output

- [ ] **Manual sequence equivalence.** From Explorer, click `src/foo.ts` → `Cmd/Ctrl+Shift+A` (Copy). Then focus editor `src/bar.ts` → `Cmd/Ctrl+I` (Paste).
- [ ] Now compare with: `src/bar.ts` open + click `src/foo.ts` in Explorer + `Alt+D`.
  **Expect:** both produce the **identical** snippet in `bar.ts` (modulo content already there).

## Sign-off

- [ ] Basic happy path
- [ ] Sequential ordering (2 cases)
- [ ] Race condition stress (3 cases) — Bug #3
- [ ] Keybinding context (3 cases)
- [ ] Paste rejection still updates clipboard (2 cases) — exact toast text matches the new parameterized format
- [ ] No-active-editor toast fires (was silent — now warns)
- [ ] Copy fails → paste short-circuits (2 cases) — `'no-file-to-copy'` only, no paste-side toast
- [ ] Multi-select behavior documented
- [ ] Auto vs manual sequence equivalence

Tester / date: ___________________
