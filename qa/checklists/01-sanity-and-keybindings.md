# 01 — Sanity & keybindings

Verify the extension loads and every entry point works. If any of these fail, stop — downstream tests are meaningless.

## Setup

- [`00-setup.md`](00-setup.md) complete
- Extension Development Host running with `qa/workspace/` open as the folder
- No prior toasts on screen (close VS Code's notifications panel if needed)

## Tests

### Activation

- [ ] **Output channel shows activation.** View → Output → select "Log (Extension Host)". Search for `auto-import` — the extension activates when a supported file is opened (`onLanguage` activation). If no supported file is open yet, running any Auto Import command also activates it. **Expect:** no errors logged.

### Drop Provider

- [ ] **DnD edit offered.** Open `src/bar.ts`. Drag `src/foo.ts` from the Explorer sidebar and drop it into the editor. VS Code's drop-edit widget offers an "Auto Import" entry. Accept it.
  **Expect:** import snippet inserted (same as Paste behavior). Confirms `DocumentDropEditProvider` is registered alongside the 5 commands.

### Command Palette

- [ ] **All 5 commands are listed.** `Cmd/Ctrl+Shift+P` → type `Auto Import`.
  **Expect:** five entries (titles match `package.json:contributes.commands` byte-exactly):
  - `Auto Import: Copy File Path`
  - `Auto Import: Paste as Import`
  - `Auto Import: Insert Import from Selected File`
  - `Auto Import: Paste as Import (Pick Style)`
  - `Auto Import: Set Default Import Style`

### Keybinding — Copy (`cmd/ctrl+shift+a`)

- [ ] **Editor focus.** Open `src/foo.ts` → press `Cmd/Ctrl+Shift+A`.
  **Expect:** info toast `Auto Import: Copied path — foo.ts`.

- [ ] **Explorer focus.** Click `src/bar.ts` in the Explorer (don't open it) → press `Cmd/Ctrl+Shift+A`.
  **Expect:** info toast `Auto Import: Copied path — bar.ts`. Clipboard now contains the absolute path of `bar.ts`.

- [ ] **Verify clipboard externally.** Paste in any non-VS-Code text field (browser URL bar, Terminal, Notes app, etc.).
  **Expect:** absolute path string of `bar.ts` (e.g. `/Users/<you>/<repo>/qa/workspace/src/bar.ts`).

### Keybinding — Paste (`cmd/ctrl+i`)

- [ ] **Editor focus required.** Click `src/foo.ts` in the Explorer (don't open) → press `Cmd/Ctrl+I`.
  **Expect:** nothing happens. Keybinding `when: editorTextFocus` blocks it.

- [ ] **Editor focus, valid clipboard.** First Copy `src/foo.ts`. Open `src/bar.ts`. Press `Cmd/Ctrl+I`.
  **Expect:** snippet inserted at the configured placement (default: Bottom). Path is `'./foo'` (or whatever your TS style emits).

### Keybinding — Auto (`alt+d`)

- [ ] **Explorer focus.** In Explorer, single-click `src/foo.ts` (don't open) → with `src/bar.ts` already as the active editor → press `Alt+D`.
  **Expect:** import for `foo` inserted into `bar.ts` AND info toast `Auto Import: Copied path — foo.ts`.

- [ ] **Editor focus does NOT trigger.** Open `src/foo.ts` (editor focused) → press `Alt+D`.
  **Expect:** nothing happens. Keybinding `when: filesExplorerFocus` blocks it.

### Command Palette can invoke any command without keybindings

- [ ] **Run via Palette only.** `Cmd/Ctrl+Shift+P` → `Auto Import: Copy File Path` → enter.
  **Expect:** behaves identically to keybinding.

- [ ] **Same for `Auto Import: Paste as Import` and `Auto Import: Insert Import from Selected File`.**

### Palette can surface the no-active-editor toast

Paste's keybinding `when: editorTextFocus` blocks the keystroke when no editor is focused, but the Palette has no such guard.

- [ ] **No editor open.** Close every editor tab (Cmd/Ctrl+W repeatedly until the welcome page is visible). `Cmd/Ctrl+Shift+P` → `Auto Import: Paste as Import` → enter.
  **Expect:** warning toast `Auto Import: Open a file to paste an import.` (the `'no-active-editor'` notification — was previously a silent return).

## Known limitations / not bugs

- The `Auto Import: Insert Import from Selected File` palette entry runs from any focus (palette doesn't apply the keybinding `when` clause). This is VS Code's default behavior and intentional.

## Sign-off

- [ ] All 5 commands listed
- [ ] All 3 keybindings work in their correct contexts and not outside them
- [ ] No errors in Output → Log (Extension Host)

Tester / date: ___________________
