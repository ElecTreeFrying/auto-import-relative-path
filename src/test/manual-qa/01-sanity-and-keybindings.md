# 01 — Sanity & keybindings

Verify the extension loads and every entry point works. If any of these fail, stop — downstream tests are meaningless.

## Setup

- `00-setup.md` complete
- Extension Development Host running with `test-workspace/` open
- No prior toasts on screen (close VS Code's notifications panel if needed)

## Tests

### Activation

- [ ] **Output channel shows activation.** View → Output → select "Log (Extension Host)". Search for `auto-import` or run any command below — the extension activates lazily on first command. **Expect:** no errors logged.

### Command Palette

- [ ] **All 3 commands are listed.** `Cmd/Ctrl+Shift+P` → type `Auto Import`.
  **Expect:** three entries:
  - `Auto Import: Copy`
  - `Auto Import: Paste`
  - `Auto Import: Auto`

### Keybinding — Copy (`cmd/ctrl+shift+a`)

- [ ] **Editor focus.** Open `src/foo.ts` → press `Cmd/Ctrl+Shift+A`.
  **Expect:** toast `Auto Import: Copied foo.ts`.

- [ ] **Explorer focus.** Click `src/bar.ts` in the Explorer (don't open it) → press `Cmd/Ctrl+Shift+A`.
  **Expect:** toast `Auto Import: Copied bar.ts`. Clipboard now contains the absolute path of `bar.ts`.

- [ ] **Verify clipboard externally.** Paste in any non-VS-Code text field (browser URL bar, Terminal, Notes app, etc.).
  **Expect:** absolute path string of `bar.ts` (e.g. `/Users/.../test-workspace/src/bar.ts`).

### Keybinding — Paste (`cmd/ctrl+i`)

- [ ] **Editor focus required.** Click `src/foo.ts` in the Explorer (don't open) → press `Cmd/Ctrl+I`.
  **Expect:** nothing happens. Keybinding `when: editorTextFocus` blocks it.

- [ ] **Editor focus, valid clipboard.** First Copy `src/foo.ts`. Open `src/bar.ts`. Press `Cmd/Ctrl+I`.
  **Expect:** snippet inserted at the configured placement (default: Bottom). Path is `'./foo'` (or whatever your TS style emits).

### Keybinding — Auto (`alt+d`)

- [ ] **Explorer focus.** In Explorer, single-click `src/foo.ts` (don't open) → with `src/bar.ts` already as the active editor → press `Alt+D`.
  **Expect:** import for `foo` inserted into `bar.ts` AND toast `Auto Import: Copied foo.ts`.

- [ ] **Editor focus does NOT trigger.** Open `src/foo.ts` (editor focused) → press `Alt+D`.
  **Expect:** nothing happens. Keybinding `when: filesExplorerFocus` blocks it.

### Command Palette can invoke any command without keybindings

- [ ] **Run via Palette only.** `Cmd/Ctrl+Shift+P` → `Auto Import: Copy` → enter.
  **Expect:** behaves identically to keybinding.

- [ ] **Same for Paste and Auto.**

## Known limitations / not bugs

- The `Auto Import: Auto` palette entry runs from any focus (palette doesn't apply the keybinding `when` clause). This is VS Code's default behavior and intentional.

## Sign-off

- [ ] All commands listed
- [ ] All 3 keybindings work in their correct contexts and not outside them
- [ ] No errors in Output → Log (Extension Host)

Tester / date: ___________________
