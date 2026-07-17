# General — Cross-Destination QA Checklist

Covers shared infrastructure that behaves identically regardless of which destination language is open. Run this checklist once — per-destination checklists (e.g., [typescript.md](typescript.md)) assume it has already passed.

**Sources under test:**

- `src/commands/copy-file-path.ts` — Copy File Path command
- `src/commands/paste-import.ts` — clipboard validation and gating entry point
- `src/commands/copy-paste.ts` — Insert Import from Selected File (sequential copy + paste)
- `src/commands/paste-import-with-style.ts` — Paste as Import (Pick Style) command
- `src/commands/set-default-import-style.ts` — Set Default Import Style command
- `src/commands/set-import-placement.ts` — Set Import Placement command
- `src/commands/toggle-preserve-script-extension.ts` — Toggle Preserve Script File Extension command
- `src/commands/reset-import-styles.ts` — Reset All Import Styles to Defaults command (+ Undo restore)
- `src/editor/notification.ts` — all toast messages and button actions
- `src/path/relative.ts` — relative path computation
- `src/drop/provider.ts` — `AutoImportOnDropProvider` (drag-and-drop)
- `src/config/settings.ts` — `getAutoImportSetting` / `setAutoImportSetting` / `inspectAutoImportSetting`

---

## Prerequisites

- Extension Development Host launched (F5)
- QA workspace open as a folder — open `qa/workspace/` in the EDH via **File > Open Folder**
- `general/destination.ts` open as the active editor

**Workspace layout** — all fixture files live under `general/`:

| File | Purpose |
|------|---------|
| `general/source.ts` | Default source file to copy |
| `general/destination.ts` | Default destination to paste into |
| `general/Makefile` | No-extension file for rejection tests |
| `general/unsupported.js` | Unsupported-pair source (`.js` → `.ts`) |
| `general/fixed-source.css` | Fixed-style source (`.css` → `.html`) |
| `general/fixed-destination.html` | Fixed-style destination |
| `general/components/child.ts` | Child-directory and parent-directory path tests |
| `general/edge-cases/komponent-日本語.ts` | Unicode filename |
| `general/edge-cases/my folder/spaced.ts` | Spaces in path |

### How the commands work

The extension has three keyboard-bound commands (of eight total — the other five are Command Palette–only). Each interacts with the **active editor** — the editor tab where your text cursor is blinking. Click into an editor tab to make it active.

| Command | Shortcut | How to use |
|---|---|---|
| **Copy File Path** | <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> | Click a file in the **Explorer sidebar**, then press the shortcut — it copies that file's path. Alternatively, if the file you want to copy is already open and active (cursor blinking in it), just press the shortcut directly — it copies the active editor's file path. |
| **Paste as Import** | <kbd>Cmd</kbd>+<kbd>I</kbd> | Open or click into the **destination file** (the editor where you want the import), then press the shortcut. It reads the previously copied path from the clipboard and inserts the import. |
| **Insert Import from Selected File** | <kbd>Alt</kbd>+<kbd>D</kbd> | Copy + Paste in one step. Click the **source file** in the Explorer sidebar, then press the shortcut — it copies that file's path and immediately pastes the import into the active editor. |

### How to change extension settings

1. Open VS Code Settings: <kbd>Cmd</kbd>+<kbd>,</kbd> (macOS) or <kbd>Ctrl</kbd>+<kbd>,</kbd> (Windows/Linux).
2. In the left sidebar, scroll down and expand **Extensions**.
3. Click **Auto Import Relative Path** — the extension's settings appear in the main panel.

---

## 1 — Copy File Path command (`Cmd+Shift+A` / `Ctrl+Shift+A`)

### 1.1 — Happy path

- [ ] Select `general/source.ts` in the Explorer, press `Cmd+Shift+A`
- [ ] Info toast appears: `Auto Import: Copied path — {basename}` (e.g., `Auto Import: Copied path — source.ts`)
- [ ] Toast has two buttons: **Paste with Style** (left) and **Paste Now** (right)

### 1.2 — No file selected

- [ ] Deselect all files in the Explorer (click empty space), press `Cmd+Shift+A`
- [ ] Warning toast: `Auto Import: No file selected to copy.`

### 1.3 — File without extension

- [ ] Select `general/Makefile` in the Explorer, press `Cmd+Shift+A`
- [ ] Warning toast: `Auto Import: Makefile has no file extension.`

### 1.4 — Previous notifications cleared

- [ ] Copy `general/unsupported.js`, open `general/destination.ts`, press `Cmd+I` (triggers the unsupported-pair warning). Then select `general/source.ts` in the Explorer and press `Cmd+Shift+A`
- [ ] Previous toast is dismissed before the new one appears

---

## 2 — Clipboard validation (Paste as Import)

These tests verify the shared validation in `commands/paste-import.ts` that runs before any destination-specific logic.

### 2.1 — Empty clipboard

- [ ] Copy the text `hello world` to the clipboard, open `general/destination.ts`, press `Cmd+I`
- [ ] Warning toast: `Auto Import: Clipboard does not contain a file path.`

### 2.2 — Relative path on clipboard

- [ ] Copy the text `./relative/path.ts` to the clipboard, open `general/destination.ts`, press `Cmd+I`
- [ ] Warning toast: `Auto Import: Clipboard does not contain a file path.`

### 2.3 — No file extension on clipboard path

- [ ] In the Explorer, right-click `general/Makefile` → **Copy Path** (puts its absolute path on the clipboard). Open `general/destination.ts`, press `Cmd+I`
- [ ] Warning toast: `Auto Import: Makefile has no file extension.`

### 2.4 — Source file deleted

- [ ] Copy `general/source.ts` with `Cmd+Shift+A`, delete `general/source.ts` from disk (right-click → Delete in the Explorer), open `general/destination.ts`, press `Cmd+I`. Recreate `general/source.ts` afterward (undo the delete).
- [ ] Warning toast: `Auto Import: Source file no longer exists: {basename}.`

### 2.5 — No active editor

- [ ] Close all editors, press `Cmd+I`
- [ ] Warning toast: `Auto Import: Open a file to paste an import.`

### 2.6 — Previous notifications cleared

- [ ] Copy `general/unsupported.js`, open `general/destination.ts`, press `Cmd+I` (unsupported-pair warning). Then copy `general/source.ts` and press `Cmd+I` in `general/destination.ts` again
- [ ] Previous toast is dismissed before the paste toast/result

---

## 3 — Same-file rejection

### 3.1 — Same file

- [ ] Open `general/destination.ts`, copy `general/destination.ts` with `Cmd+Shift+A`, press `Cmd+I` in `general/destination.ts`
- [ ] Warning toast: `Auto Import: A file cannot import itself.`

### 3.2 — Same file (case mismatch)

- [ ] Copy `general/source.ts` with `Cmd+Shift+A`. Manually edit the clipboard path to change its case (e.g. `SOURCE.ts`). Open `general/source.ts`, press `Cmd+I`
- [ ] Warning toast: `Auto Import: A file cannot import itself.` (comparison is case-insensitive)

---

## 4 — Insert Import from Selected File (`Alt+D`) — failure paths

### 4.1 — Copy fails (no extension)

- [ ] Click `general/Makefile` in the Explorer
- [ ] Press `Alt+D`
- [ ] Warning toast from copy step: `Auto Import: Makefile has no file extension.`
- [ ] Paste step does NOT run (no second toast)

### 4.2 — Copy succeeds but paste fails (unsupported pair)

- [ ] Click `general/unsupported.js` in the Explorer with `general/destination.ts` open as the active editor
- [ ] Press `Alt+D`
- [ ] Copy toast appears: `Auto Import: Copied path — unsupported.js`
- [ ] Then paste fails: `Auto Import: Cannot import .js into .ts files.`
- [ ] Two toasts in sequence — the copy succeeded but the paste was rejected

---

## 5 — Notification reference

Verify exact wording for every toast the copy / paste / drop flow produces. (The settings-command toasts — `placement-saved`, `preserve-script-extension-toggled`, and `styles-reset` / `no-styles-to-reset` / `styles-restored`, plus the **Undo** button — are verified with their commands in [§12](#12--settings-commands).)

### Info toasts

#### 5.1 — Copy success

- [ ] Select `general/source.ts` in the Explorer, press `Cmd+Shift+A`
- [ ] Info toast: `Auto Import: Copied path — source.ts`
- [ ] Toast has two buttons: **Paste with Style** (left) and **Paste Now** (right)

#### 5.2 — Default style saved

- [ ] Copy `general/source.ts` with `Cmd+Shift+A`
- [ ] Open `general/destination.ts`
- [ ] Command Palette (<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) → `Auto Import: Set Default Import Style`
- [ ] Pick any style from the QuickPick
- [ ] Info toast: `Auto Import: Default style saved — <style template>` — the suffix is the raw import-style **value** you selected (e.g. `import { name } from '_relativePath_';`), not the picker's description tag

### Warning toasts

#### 5.3 — Same file

- [ ] Copy `general/source.ts` with `Cmd+Shift+A`
- [ ] Open that same file (`general/source.ts`), press `Cmd+I`
- [ ] Warning toast: `Auto Import: A file cannot import itself.`

#### 5.4 — Unsupported pair

- [ ] Copy `general/unsupported.js` with `Cmd+Shift+A`
- [ ] Open `general/destination.ts`, press `Cmd+I`
- [ ] Warning toast: `Auto Import: Cannot import .js into .ts files.`
- [ ] Toast has a **View Supported Files** button

#### 5.5 — No active editor

- [ ] Close all editor tabs
- [ ] Press `Cmd+I`
- [ ] Warning toast: `Auto Import: Open a file to paste an import.`

#### 5.6 — No file to copy

- [ ] Click empty space in the Explorer to deselect all files
- [ ] Press `Cmd+Shift+A`
- [ ] Warning toast: `Auto Import: No file selected to copy.`

#### 5.7 — No extension

- [ ] Select `general/Makefile` in the Explorer
- [ ] Press `Cmd+Shift+A`
- [ ] Warning toast: `Auto Import: Makefile has no file extension.`

#### 5.8 — Empty clipboard

- [ ] Copy the text `hello world` to the system clipboard (e.g., select it in an editor and `Cmd+C`)
- [ ] Open `general/destination.ts`, press `Cmd+I`
- [ ] Warning toast: `Auto Import: Clipboard does not contain a file path.`

#### 5.9 — Source not found

- [ ] Copy `general/source.ts` with `Cmd+Shift+A`
- [ ] Delete that file from disk (right-click → Delete in Explorer)
- [ ] Press `Cmd+I`
- [ ] Warning toast: `Auto Import: Source file no longer exists: {basename}.`
- [ ] Recreate the deleted file afterward (undo or re-create manually)

#### 5.10 — No configurable style

- [ ] Copy `general/fixed-source.css` with `Cmd+Shift+A`
- [ ] Open `general/fixed-destination.html`
- [ ] Command Palette (<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) → `Auto Import: Set Default Import Style`
- [ ] Warning toast: `Auto Import: .css → .html imports use a fixed style.`

### Button actions

#### 5.11 — View Supported Files

- [ ] Trigger the unsupported-pair toast (5.4)
- [ ] Click **View Supported Files** on the toast
- [ ] Browser opens the [Supported Languages](https://github.com/ElecTreeFrying/auto-import-relative-path#supported-languages) section of the GitHub README

#### 5.12 — Paste with Style

- [ ] Trigger the copy-success toast (5.1)
- [ ] Click **Paste with Style** on the toast
- [ ] The QuickPick appears with import style options

#### 5.13 — Paste Now

- [ ] Trigger the copy-success toast (5.1)
- [ ] Click **Paste Now** on the toast
- [ ] An import is inserted into the active editor using the default style

---

## 6 — General edge cases

### 6.1 — Multiple rapid pastes

- [ ] Copy `general/source.ts`, paste 3 times rapidly into `general/destination.ts`
- [ ] Each import is inserted, stacking correctly (Bottom mode places each after the previous)

### 6.2 — Paste into many files

- [ ] Copy `general/source.ts` once with `Cmd+Shift+A`, then press `Cmd+I` in `general/destination.ts`, `general/components/child.ts`, and `general/edge-cases/komponent-日本語.ts`
- [ ] The clipboard retains the path — all 3 pastes succeed

### 6.3 — Unicode characters in filename

- [ ] Copy `general/edge-cases/komponent-日本語.ts`, paste into `general/destination.ts`
- [ ] Path is `'./edge-cases/komponent-日本語'` — unicode characters preserved

### 6.4 — Spaces in path

- [ ] Copy `general/edge-cases/my folder/spaced.ts`, paste into `general/destination.ts`
- [ ] Path is `'./edge-cases/my folder/spaced'` — spaces preserved

---

## 7 — Path computation

The relative-path algorithm in `src/path/relative.ts` is universal — it produces the same output regardless of destination language. These tests verify the core path mechanics using `general/source.ts` → `general/destination.ts` as the default pair.

All tests use `preserveScriptFileExtension = false` (default) unless noted. Verify via the extension settings (see [How to change extension settings](#how-to-change-extension-settings)).

### 7.1 — Same directory (`./` prefix)

- [ ] Copy `general/source.ts`, paste into `general/destination.ts`
- [ ] Path in the import is `'./source'` (starts with `./` because both files are in the same directory)

### 7.2 — Child directory

- [ ] Copy `general/components/child.ts`, paste into `general/destination.ts`
- [ ] Path: `'./components/child'`

### 7.3 — Parent directory

- [ ] Copy `general/source.ts`, paste into `general/components/child.ts`
- [ ] Path: `'../source'`

### 7.4 — Forward slashes on all platforms

- [ ] Repeat 7.2 — verify the path `'./components/child'` uses `/` separators, never `\`

### 7.5 — `preserveScriptFileExtension = false` (default)

- [ ] Copy `general/source.ts`, paste into `general/destination.ts`
- [ ] Path is `'./source'` — the `.ts` extension is stripped

### 7.6 — `preserveScriptFileExtension = true`

- [ ] In the extension settings, check the **Preserve script file extension in imports** checkbox
- [ ] Copy `general/source.ts`, paste into `general/destination.ts`
- [ ] Path is `'./source.ts'` — the `.ts` extension is preserved
- [ ] In the extension settings, uncheck the **Preserve script file extension in imports** checkbox to restore the default

### 7.7 — Non-script source always preserves extension

- [ ] Copy `general/fixed-source.css`, paste into `general/fixed-destination.html`
- [ ] Path preserves the `.css` extension regardless of the `preserveScriptFileExtension` setting

---

## 8 — Drag-and-drop (universal behaviors)

These behaviors are identical across every destination language.

### 8.1 — Same-file rejection via DnD

- [ ] Open `general/destination.ts` in the editor
- [ ] Drag `general/destination.ts` from the Explorer sidebar into the same editor
- [ ] Warning toast: `Auto Import: A file cannot import itself.`

### 8.2 — DnD does NOT clear previous notifications

- [ ] Copy `general/unsupported.js`, open `general/destination.ts`, press `Cmd+I` (triggers the unsupported-pair warning toast)
- [ ] Then drag `general/source.ts` from the Explorer into the `general/destination.ts` editor
- [ ] Previous toast is NOT dismissed — unlike the paste commands, DnD does not call `clearNotifications()`. This asymmetry is intentional: a command *owns* its outcome so it earns the window-global `notifications.clearAll` at entry, whereas the drop provider only *proposes* an edit VS Code may discard — firing a destructive, all-extensions clear off a drag would be too blunt.

---

## 9 — Paste as Import (Pick Style) — universal mechanics

Run via Command Palette: `Auto Import: Paste as Import (Pick Style)`, or click **Paste with Style** on the copy-success toast.

These tests verify QuickPick behaviors that are identical regardless of which destination language's styles are shown.

### 9.1 — Escape dismisses silently

- [ ] Copy `general/source.ts` with `Cmd+Shift+A`
- [ ] Open `general/destination.ts`, run Paste as Import (Pick Style) via Command Palette
- [ ] Press `Escape`
- [ ] No toast, no import inserted

### 9.2 — Filter by description

- [ ] Open the picker (same setup as 9.1)
- [ ] Type part of a style description in the filter box
- [ ] List narrows to matching styles

### 9.3 — Does NOT change the default setting

- [ ] Pick a non-default style from the picker
- [ ] Check VS Code Settings → the import style setting is unchanged (still the original default)

### 9.4 — Clipboard validation applies before picker opens

- [ ] Copy the text `hello world` to the system clipboard, run Paste as Import (Pick Style)
- [ ] Warning toast: `Auto Import: Clipboard does not contain a file path...` — picker does NOT open
- [ ] Copy `general/source.ts`, open that same file, run Paste as Import (Pick Style)
- [ ] Warning toast: `Auto Import: A file cannot import itself.` — picker does NOT open

### 9.5 — Single-variant fast path

- [ ] Copy `general/fixed-source.css` with `Cmd+Shift+A`
- [ ] Open `general/fixed-destination.html`, run Paste as Import (Pick Style)
- [ ] Import is inserted directly — the QuickPick does NOT appear (`.css` → `.html` stylesheet has only one fixed shape)

---

## 10 — Set Default Import Style — universal mechanics

Run via Command Palette: `Auto Import: Set Default Import Style`.

These tests verify QuickPick behaviors that are identical regardless of which destination language's styles are shown.

### 10.1 — Current default has checkmark and appears first

- [ ] Copy `general/source.ts` with `Cmd+Shift+A`
- [ ] Open `general/destination.ts`, run Set Default Import Style via Command Palette
- [ ] QuickPick appears with placeholder text: `Set default import style`
- [ ] Current default has `$(check) Current default` appended to its description
- [ ] Current default appears as the **first item** in the list

### 10.2 — Checkmark moves after changing default

- [ ] Select a different style from the picker
- [ ] Reopen the picker (run Set Default Import Style again)
- [ ] The newly set style now has the checkmark and appears first

### 10.3 — Persists to VS Code global settings

- [ ] After changing the default in 10.2, open VS Code Settings (User tab)
- [ ] The import style setting reflects the new default

### 10.4 — Escape dismisses silently

- [ ] Open the picker, press `Escape`
- [ ] No toast, no setting change

### 10.5 — Does NOT insert an import

- [ ] Select any style from the picker
- [ ] No import appears in the active editor — the command only persists the setting

### 10.6 — Filter by description

- [ ] Type part of a style description in the QuickPick filter
- [ ] List narrows to matching styles

### 10.7 — Clipboard validation applies before picker opens

- [ ] Copy the text `hello world` to the system clipboard, run Set Default Import Style
- [ ] Warning toast: `Auto Import: Clipboard does not contain a file path...` — picker does NOT open
- [ ] Copy `general/source.ts`, open that same file, run Set Default Import Style
- [ ] Warning toast: `Auto Import: A file cannot import itself.` — picker does NOT open

---

## 11 — Settings mid-session

The extension reads settings fresh on every operation — there is no caching. Changing a setting mid-session takes effect on the very next paste or drag-and-drop.

### 11.1 — Import style change takes effect immediately

- [ ] Copy `general/source.ts`, paste into `general/destination.ts` with the default style
- [ ] Change the import style setting to a different value (see [How to change extension settings](#how-to-change-extension-settings))
- [ ] Paste again — the new style is used
- [ ] Undo both inserts and restore the original style setting

### 11.2 — Placement change takes effect immediately

- [ ] Copy `general/source.ts`, paste into `general/destination.ts` with `importStatementPlacement = "Bottom"`
- [ ] Change the setting to `"Top"`
- [ ] Paste again — the import lands at line 1 (Top), not after the previous import (Bottom)
- [ ] Undo both inserts and restore `"Bottom"`

### 11.3 — Preserve extension change takes effect immediately

- [ ] Copy `general/source.ts`, paste into `general/destination.ts` with `preserveScriptFileExtension = false`
- [ ] Check the **Preserve script file extension in imports** checkbox
- [ ] Paste again — the path now includes `.ts`
- [ ] Undo both inserts and uncheck the checkbox

---

## 12 — Settings commands

The three settings commands act on global configuration only — no source/destination pair, no clipboard, no gating; each works with no editor open. Restore every setting you change at the end of its test.

### 12.1 — Set Import Placement — QuickPick + current marker

- [ ] Command Palette → `Auto Import: Set Import Placement`
- [ ] QuickPick placeholder: `Set import placement`
- [ ] Three items `Top` / `Bottom` / `Cursor`, each with a `detail` line (e.g. Cursor → `Insert at the current cursor position.`)
- [ ] The current value (default `Bottom`) shows `$(check) Current` and appears **first**

### 12.2 — Set Import Placement — persist + toast + marker moves

- [ ] Select `Top` → info toast: `Auto Import: Import placement saved — Top`
- [ ] VS Code Settings → `auto-import.preferences.importStatementPlacement` is now `Top`
- [ ] Reopen the command → `Top` now shows `$(check) Current` and is first
- [ ] Restore: run again, select `Bottom`

### 12.3 — Set Import Placement — Escape dismisses silently

- [ ] Run the command, press `Escape` → no toast, no setting change

### 12.4 — Toggle Preserve Script File Extension

- [ ] Confirm **Preserve script file extension in imports** is unchecked (default `false`); this command has no QuickPick
- [ ] Command Palette → `Auto Import: Toggle Preserve Script File Extension` → info toast: `Auto Import: Preserve script file extension — On`
- [ ] VS Code Settings → `auto-import.importStatement.script.preserveScriptFileExtension` is now `true`
- [ ] Run again → info toast: `Auto Import: Preserve script file extension — Off`; setting back to `false`

### 12.5 — Reset All Import Styles — nothing customized

- [ ] With no import-style override set (clear any left from §10/§11), Command Palette → `Auto Import: Reset All Import Styles to Defaults`
- [ ] Info toast: `Auto Import: No custom import styles to reset.` — **no** Undo button, no setting change

### 12.6 — Reset All Import Styles — reset a customized style

- [ ] Set one style: run `Auto Import: Set Default Import Style` on `general/source.ts` → `general/destination.ts`, pick a non-default TS style (writes a Global `typescriptImportStyle` override)
- [ ] Run `Auto Import: Reset All Import Styles to Defaults` → info toast: `Auto Import: Reset 1 import style to defaults` (plural `styles` if more than one was customized), carrying an **Undo** button
- [ ] VS Code Settings → the changed style is back to its default; `preserveScriptFileExtension` and `importStatementPlacement` are **untouched**

### 12.7 — Reset All Import Styles — Undo restores

- [ ] Click **Undo** on the 12.6 toast → info toast: `Auto Import: Import styles restored.`
- [ ] VS Code Settings → the 12.6 customized value is back
- [ ] Restore: clear that override so no customization lingers

---

## Sign-off

- [ ] Copy File Path command (4 cases)
- [ ] Clipboard validation (6 cases)
- [ ] Same-file rejection (2 cases)
- [ ] Insert Import failure paths (2 cases)
- [ ] Notification reference (13 cases)
- [ ] General edge cases (4 cases)
- [ ] Path computation (7 cases)
- [ ] Drag-and-drop universal (2 cases)
- [ ] Pick Style universal mechanics (5 cases)
- [ ] Set Default universal mechanics (7 cases)
- [ ] Settings mid-session (3 cases)
- [ ] Settings commands — Placement / Toggle Preserve / Reset (7 cases)

**Total: 62 test cases**
