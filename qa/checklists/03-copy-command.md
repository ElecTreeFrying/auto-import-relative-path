# 03 — Copy command (`extension.copyFilePath`)

Validates `executeCopyFilePath` end-to-end. This is a prerequisite for every paste/auto test.

**Source:** `src/commands/copy-file-path.ts`

## Setup

- 00-setup.md complete; 01-sanity passed
- Clipboard cleared (copy any unrelated text first)

## Tests

### Toast format

- [ ] **Basename in toast.** Open `src/foo.ts`. Press `Cmd/Ctrl+Shift+A`.
  **Expect:** toast text is exactly `Auto Import: Copied path — foo.ts` (with the `.ts` extension).

- [ ] **Different basename.** Open `src/components/app-root.component.ts`. Copy.
  **Expect:** toast is `Auto Import: Copied path — app-root.component.ts` (basename only — no directory).

### Clipboard population

- [ ] **External paste check.** After copying `src/foo.ts`, paste into a non-VS-Code app (Terminal, Notes, browser).
  **Expect:** the absolute path of `foo.ts` appears (e.g. `/Users/<you>/<repo>/qa/workspace/src/foo.ts`).

- [ ] **Path is absolute.** Verify the pasted path begins with `/` (macOS/Linux) or a drive letter (Windows). **Expect:** absolute, never relative.

### `notifications.clearAll`

- [ ] **Prior toast cleared.** First, copy plain text (`Hello world`) from any external app and run `Auto Import: Paste as Import` from the Palette in any open file → wait for the warning toast `Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.`. Without dismissing it, run Copy on any source file.
  **Expect:** the prior warning toast is dismissed (`clearNotifications()` calls `notifications.clearAll`) before the new info toast `Auto Import: Copied path — <basename>` appears.

### Explorer focus (no active editor)

- [ ] **Explorer-only copy.** Close all editors (Cmd/Ctrl+W until empty). In Explorer, click `src/bar.ts` (single click — file selected, not opened).
- [ ] Press `Cmd/Ctrl+Shift+A`.
  **Expect:** toast `Auto Import: Copied path — bar.ts`. Clipboard has `bar.ts`'s absolute path.

### No file to copy — `'no-file-to-copy'` toast

The post-condition guard in `commands/copy-file-path.ts:31-34` rejects any clipboard read that isn't an absolute path with an extension, fires `'no-file-to-copy'`, and returns `false`.

- [ ] **No focus, no Explorer selection.** Close every editor tab. Click an empty area of the Explorer pane (or click the editor's welcome page) so no file is selected anywhere. Note the current clipboard contents (e.g., copy `pre-existing` from another app first). Run Palette → `Auto Import: Copy File Path`.
  **Expect:** warning toast `Auto Import: No file selected to copy.` Clipboard is unchanged (still `pre-existing` — no overwrite happened, since the round-trip read was rejected before the writeText call).

- [ ] **Alt+D short-circuits paste when copy fails.** Same setup as above (no Explorer selection). Open `src/bar.ts` as the active editor. Press `Alt+D`.
  **Expect:** warning toast `Auto Import: No file selected to copy.` AND `bar.ts` is unchanged — paste was never invoked because `commands/copy-paste.ts:6-8` short-circuits when `executeCopyFilePath` returns `false`.

### Extensionless file — `'no-extension'` toast

The guard in `commands/copy-file-path.ts` rejects clipboard reads where `path.extname(trimmed) === ''`, fires `'no-extension'`, and returns `false`.

- [ ] **Extensionless file.** Create `touch Makefile` at the workspace root. In Explorer, click `Makefile` (single click — selected, not opened). Press `Cmd/Ctrl+Shift+A`.
  **Expect:** warning toast `Auto Import: Makefile has no file extension.` Clipboard unchanged. Cleanup: `rm Makefile`.

- [ ] **Alt+D short-circuits when copy rejects extensionless.** Same setup (Makefile selected in Explorer). Open `src/bar.ts` as the active editor. Press `Alt+D`.
  **Expect:** warning toast `Auto Import: Makefile has no file extension.` AND `bar.ts` unchanged — paste never invoked. Cleanup: `rm Makefile`.

### Re-copy overwrites clipboard

- [ ] **Sequential copies.** Copy `src/foo.ts`. Then copy `src/bar.ts`. Then paste in an external app.
  **Expect:** path of `bar.ts` (the later copy). Not `foo.ts`.

### Files with special characters

- [ ] **Spaced path.** Open the file at `my files/spaced.ts`. Copy it.
  **Expect:** toast `Auto Import: Copied path — spaced.ts`. Pasting clipboard externally yields a path containing `my files` (with the space).

- [ ] **Angular convention basename in toast.** Copy `src/components/app-root.component.ts`.
  **Expect:** toast is `Auto Import: Copied path — app-root.component.ts` (full basename including the `.component.ts` suffix is preserved as-is).

### Files of different extensions

For each of these, the toast should match the basename verbatim:

- [ ] `src/widget.tsx` → `Auto Import: Copied path — widget.tsx`
- [ ] `src/badge.jsx` → `Auto Import: Copied path — badge.jsx`
- [ ] `styles/main.scss` → `Auto Import: Copied path — main.scss`
- [ ] `styles/_partial.scss` → `Auto Import: Copied path — _partial.scss` (underscore preserved in toast — only stripped at snippet generation)
- [ ] `styles/global.css` → `Auto Import: Copied path — global.css`
- [ ] `pages/index.html` → `Auto Import: Copied path — index.html`
- [ ] `docs/README.md` → `Auto Import: Copied path — README.md`
- [ ] `assets/logo.png` → `Auto Import: Copied path — logo.png`
- [ ] `data/config.json` → `Auto Import: Copied path — config.json`

### Copy-success toast action buttons

The `'copy-success'` toast carries two action buttons: **Paste with Style** and **Paste Now** (in that render order, leftmost first). Clicking one dispatches the corresponding command.

- [ ] **"Paste Now" button inserts import.** Copy `src/foo.ts`. When the info toast appears (`Auto Import: Copied path — foo.ts`), open `src/bar.ts` as the active editor, then click **Paste Now**.
  **Expect:** import snippet inserted into `bar.ts` (same result as pressing `Cmd/Ctrl+I`).

- [ ] **"Paste with Style" button opens picker.** Copy `src/foo.ts`. When the toast appears, with `src/bar.ts` open, click **Paste with Style**.
  **Expect:** QuickPick opens listing the applicable TS import styles (same as running `Auto Import: Paste as Import (Pick Style)` from the Palette).

- [ ] **Dismissing the toast without clicking.** Copy `src/foo.ts`. Let the toast auto-dismiss (or close notifications). Verify no side effect — no import inserted, no picker opened.

## Known limitations / not bugs

- The toast uses `path.basename()` which preserves the entire trailing extension (including double-extensions like `.component.ts`). This is intentional — the toast is for user confirmation, not for snippet generation.

## Sign-off

- [ ] Toast format correct (info-level, includes `Copied path — `)
- [ ] Clipboard population correct
- [ ] `clearAll` works
- [ ] Explorer-only copy works
- [ ] No-file-to-copy toast fires (2 cases: Palette and Alt+D short-circuit)
- [ ] No-extension toast fires (2 cases: Palette and Alt+D short-circuit)
- [ ] Copy-success toast buttons work (Paste Now, Paste with Style, dismiss)
- [ ] Re-copy overwrites
- [ ] Special-character paths work
- [ ] All extension types tested

Tester / date: ___________________
