# 03 — Copy command (`extension.copyFilePath`)

Validates `executeCopyFilePath` end-to-end. This is a prerequisite for every paste/auto test.

**Source:** `src/commands/copy-file-path.ts`

## Setup

- 00-setup.md complete; 01-sanity passed
- Clipboard cleared (copy any unrelated text first)

## Tests

### Toast format

- [ ] **Basename in toast.** Open `src/foo.ts`. Press `Cmd/Ctrl+Shift+A`.
  **Expect:** toast text is exactly `Auto Import: Copied foo.ts` (with the `.ts` extension).

- [ ] **Different basename.** Open `src/components/app-root.component.ts`. Copy.
  **Expect:** toast is `Auto Import: Copied app-root.component.ts` (basename only — no directory).

### Clipboard population

- [ ] **External paste check.** After copying `src/foo.ts`, paste into a non-VS-Code app (Terminal, Notes, browser).
  **Expect:** the absolute path of `foo.ts` appears (e.g. `/Users/.../test-workspace/src/foo.ts`).

- [ ] **Path is absolute.** Verify the pasted path begins with `/` (macOS/Linux) or a drive letter (Windows). **Expect:** absolute, never relative.

### `notifications.clearAll`

- [ ] **Prior toast cleared.** Trigger any error toast (e.g., from VS Code's built-in: try Save with no editor → no toast). Or: run `Auto Import: Paste` with no clipboard → wait for the warning toast. Now run Copy.
  **Expect:** the prior warning toast is dismissed before the new "Copied …" toast shows.

### Explorer focus (no active editor)

- [ ] **Explorer-only copy.** Close all editors (Cmd/Ctrl+W until empty). In Explorer, click `src/bar.ts` (single click — file selected, not opened).
- [ ] Press `Cmd/Ctrl+Shift+A`.
  **Expect:** toast `Auto Import: Copied bar.ts`. Clipboard has `bar.ts`'s absolute path.

### Re-copy overwrites clipboard

- [ ] **Sequential copies.** Copy `src/foo.ts`. Then copy `src/bar.ts`. Then paste in an external app.
  **Expect:** path of `bar.ts` (the later copy). Not `foo.ts`.

### Files with special characters

- [ ] **Spaced path.** Open the file at `my files/spaced.ts`. Copy it.
  **Expect:** toast `Auto Import: Copied spaced.ts`. Pasting clipboard externally yields a path containing `my files` (with the space).

- [ ] **Angular convention basename in toast.** Copy `src/components/app-root.component.ts`.
  **Expect:** toast is `Auto Import: Copied app-root.component.ts` (full basename including the `.component.ts` suffix is preserved as-is).

### Files of different extensions

For each of these, the toast should match the basename verbatim:

- [ ] `src/widget.tsx` → `Auto Import: Copied widget.tsx`
- [ ] `src/badge.jsx` → `Auto Import: Copied badge.jsx`
- [ ] `styles/main.scss` → `Auto Import: Copied main.scss`
- [ ] `styles/_partial.scss` → `Auto Import: Copied _partial.scss` (underscore preserved in toast — only stripped at snippet generation)
- [ ] `styles/global.css` → `Auto Import: Copied global.css`
- [ ] `pages/index.html` → `Auto Import: Copied index.html`
- [ ] `docs/README.md` → `Auto Import: Copied README.md`
- [ ] `assets/logo.png` → `Auto Import: Copied logo.png`
- [ ] `data/config.json` → `Auto Import: Copied config.json`

## Known limitations / not bugs

- The toast uses `path.basename()` which preserves the entire trailing extension (including double-extensions like `.component.ts`). This is intentional — the toast is for user confirmation, not for snippet generation.

## Sign-off

- [ ] Toast format correct
- [ ] Clipboard population correct
- [ ] `clearAll` works
- [ ] Explorer-only copy works
- [ ] Re-copy overwrites
- [ ] Special-character paths work
- [ ] All extension types tested

Tester / date: ___________________
