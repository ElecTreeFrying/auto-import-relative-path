# 12 — Auto command (`extension.copyPaste`)

Validates `executeCopyPaste` — the sequential `await executeCopyFilePath(); await executePasteImport();` flow. Bound to `alt+d` from the Explorer only.

**Sources:**
- `src/commands/copy-paste.ts` — sequential composition
- `src/commands/copy-file-path.ts` — copy phase (Bug #4 fixes here)
- `src/commands/paste-import.ts` — paste phase

## Setup

- 00-setup.md complete; 01-sanity passed
- `placement = Bottom` (default)
- `typescriptImportStyle = import { name } from '_relativePath_';`
- `preserveScriptFileExtension = false`

## Basic happy path

- [ ] **Single Auto.** Open `src/bar.ts` (active editor). In Explorer, click `src/foo.ts` (single click — selected, not opened). Press `Alt+D`.
  **Expect:**
  - Toast: `Auto Import: Copied foo.ts`
  - `src/bar.ts` now contains `import { $1 } from './foo';`
  - Clipboard contains the absolute path of `foo.ts`

## Sequential ordering

- [ ] **Copy fires before paste.** With `bar.ts` open, click `src/helpers.ts` in Explorer → `Alt+D`.
  **Expect:** clipboard now has `helpers.ts`'s path (verify by external paste). The import in `bar.ts` is for `helpers`, not whatever was in clipboard before.

- [ ] **Paste uses the just-copied path.** Run Auto on `foo.ts`. Verify the import is for `foo`, not for the previously-copied path.

## Race condition stress (Bug #4 verification)

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

- [ ] **Palette invocation works regardless of focus.** `Cmd/Ctrl+Shift+P` → `Auto Import: Auto`. With editor focused. Verify it runs.

## Behavior when paste rejects

`executeCopyPaste` runs paste even if paste would produce a "Not supported" toast. The copy phase still updates the clipboard.

- [ ] **Mismatched pair.** `src/bar.ts` open. In Explorer, click `pages/index.html` → `Alt+D`.
  **Expect:**
  - Copy succeeds (toast: `Copied index.html`).
  - Paste fails (toast: `Not supported.`) because `.ts` destination requires `.ts` source.
  - Clipboard now has `index.html`'s path (next paste will use this).

- [ ] **Self-target.** `src/foo.ts` open. Click `src/foo.ts` in Explorer → `Alt+D`.
  **Expect:**
  - Copy: `Copied foo.ts`.
  - Paste: `Same file path.` toast (same-file rejection).
  - Editor unchanged.

## No-active-editor scenario

- [ ] **Close all editors, then Auto from Explorer.** Close all open editor tabs. Click `src/foo.ts` in Explorer → `Alt+D`.
  **Expect:** Copy succeeds (toast); paste returns silently (no "Not supported" toast — it just exits when there's no `activeTextEditor`). Clipboard updated.

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
- [ ] Race condition stress (3 cases) — Bug #4
- [ ] Keybinding context (3 cases)
- [ ] Paste rejection still updates clipboard (2 cases)
- [ ] No-active-editor scenario
- [ ] Multi-select behavior documented
- [ ] Auto vs manual sequence equivalence

Tester / date: ___________________
