# 17 — Edge cases & regression

Final checklist. Validates uncommon scenarios, stress conditions, and explicit re-checks of prior fixed bugs (CHANGELOG 0.6.1 + the 4 fixes from this session).

**Sources covered:** entire codebase. This file catches anything not covered in 01–16.

## Setup

- 00-setup.md complete; all prior checklists 01-16 passed
- Default settings

## Empty / degenerate file destinations

- [ ] **Zero-byte destination.** Open `empty-file.ts` (0 bytes). Run paste with a valid clipboard.
  **Expect:** snippet inserted at line 0 column 0. No errors.

- [ ] **Comments-only destination, placement = Bottom.** Open `comments-only.ts`. Set `placement = Bottom`. Paste.
  **Expect:** snippet lands AFTER the line containing `// I want to import bar later` (heuristic false-positive — documented).

- [ ] **Whitespace-only file.** Create `printf "\n\n\n" > test-workspace/whitespace.ts`. Open it. Paste with `placement = Top`.
  **Expect:** snippet at line 0, displacing the existing newlines. Cleanup.

- [ ] **Single character file.** `echo "x" > test-workspace/single.ts`. Open. Paste with `placement = Cursor`, cursor at end.
  **Expect:** snippet inserted at the cursor's line. Cleanup.

## Untitled (unsaved) destination

- [ ] Open Command Palette → `File: New Untitled File`. Set the language mode to `TypeScript`. Paste import.
  **Expect:** behavior depends on `editor.document.uri.fsPath` for an untitled file — likely an empty string or a placeholder URI. Document the actual behavior:
  - If extension fails silently (no toast, no insertion): acceptable
  - If it produces a path computation error: should NOT throw — gracefully handle

- [ ] **Save the untitled to a real `.ts` path.** Then run paste again.
  **Expect:** works normally as a regular `.ts` destination.

## Diff-editor destination

- [ ] Open a diff view (Source Control panel → click a file with changes → opens diff). With cursor in the right side (modified file). Run paste.
  **Expect:** behavior depends on `vscode.window.activeTextEditor` for diff editors — verify it doesn't throw. Document.

## Read-only file

- [ ] Make a file read-only: `chmod 444 src/readonly.ts; echo "" > src/readonly.ts`. Open. Paste.
  **Expect:** VS Code prevents the insertion (read-only error). Extension itself shouldn't crash. Cleanup: `chmod 644 src/readonly.ts; rm src/readonly.ts`.

## Multi-root workspace

- [ ] Create a second folder: `mkdir -p ~/test-workspace-2/src; echo "" > ~/test-workspace-2/src/extern.ts`.
- [ ] In the Extension Development Host, **File → Add Folder to Workspace…** → add `~/test-workspace-2/`.
- [ ] Save the multi-root workspace as `multi.code-workspace`.
- [ ] Copy `extern.ts` from the second root → paste into `test-workspace/src/foo.ts`.
  **Expect:** absolute path computation works across root boundaries. Path likely is `'../../test-workspace-2/src/extern'` (or however the OS-level relative path resolves).

- [ ] Verify cross-root same-file rejection: copy `test-workspace-2/src/extern.ts` from the second root, paste into the same file. **Expect:** "Same file path."

- [ ] Cleanup: remove the second folder from workspace and delete `~/test-workspace-2/`.

## Multi-cursor mode in destination

- [ ] Open `src/bar.ts`. Place 3 cursors (Cmd/Ctrl+Alt+ArrowDown). Run paste with valid clipboard.
  **Expect:** snippet inserts at all 3 cursor positions (VS Code's `editor.insertSnippet` handles multi-cursor by default).

- [ ] **Behavior verification:** the snippet should be inserted at each cursor; the placeholder tabstop should be at all cursor positions simultaneously. Tab navigates through them.

## Stress / rapid-fire

- [ ] **10× rapid paste.** Copy `src/foo.ts`. In `src/bar.ts`, press `Cmd/Ctrl+I` 10 times in quick succession.
  **Expect:** 10 imports inserted (or 10 attempts — duplicates are fine). No duplicates lost. No errors.

- [ ] **Auto burst.** From Explorer, click 5 different `.ts` files in sequence and `Alt+D` each before the previous toast clears.
  **Expect:** every Auto runs to completion. No race condition (Bug #4 fix verified).

- [ ] **Setting toggle mid-flight.** With `placement = Top`, paste once. Immediately change to `Bottom` (without reload). Paste again.
  **Expect:** second paste at Bottom. No reload required.

- [ ] **Source file deleted between copy and paste.** Copy `src/foo.ts` → delete `foo.ts` → paste.
  **Expect:** path computation still produces something (the path is just text — the source file's existence isn't checked at paste time). The inserted import will reference a non-existent file, but that's a user concern.

## Workspace events

- [ ] **Reload window mid-session.** With clipboard holding a path, `Developer: Reload Window`. Open `src/bar.ts`. Paste.
  **Expect:** clipboard might be cleared by reload — behavior is OS-dependent. Re-copy if needed; no extension crash.

- [ ] **Switch between editors mid-paste.** Run `Cmd/Ctrl+I`. Immediately switch tabs.
  **Expect:** snippet inserted into the original editor (whichever was active when the command fired).

## Setting persistence

- [ ] Set every setting to a non-default value:
  - `placement = Top`
  - `preserveScriptFileExtension = true`
  - `preserveStylesheetFileExtension = true`
  - `javascriptImportStyle = const name = require('_relativePath_');`
  - `typescriptImportStyle = import { default as name } from '_relativePath_';`
  - `cssImportStyle = @import url('_relativePath_');`
  - `scssImportStyle = @use '_relativePath_' as *;`
  - `markdownImageImportStyle = ![alt-text][image] / [image]: _relativePath_ "Hover text"`
- [ ] Reload window (Cmd/Ctrl+R or `Developer: Reload Window`).
- [ ] Verify each setting persists by triggering one paste per affected destination.
  **Expect:** all 8 settings retain their non-default values.

## Regression — CHANGELOG 0.6.1 (`./` prefix)

- [ ] Same-directory `.ts` import: `src/foo.ts` → `src/bar.ts` → path is `'./foo'` (with `./`)
- [ ] Same-directory `.scss` import: `styles/_partial.scss` → `styles/main.scss` → path is `'./partial'` (with `./`)
- [ ] Same-directory `.css` import in CSS dest: `styles/reset.css` → `styles/global.css` → path is `'./reset'` (with `./`)

This was the original 0.6.1 fix — verify it still works after our changes.

## Regression — the 4 fixes from this session

Re-verify (this is duplicated from `02-bug-fix-verification.md` as a final regression check before sign-off):

- [ ] **Bug #1.** SCSS style 3 → `@use './partial' as ${1:*};` with `*` default and `;`. (Pick one case.)
- [ ] **Bug #2.** TS style 1, preserveScriptFileExtension=true, `app-root.component.ts` → `import { AppRootComponent } from './components/app-root.component.ts';` (NOT `AppRootComponentTs`).
- [ ] **Bug #3.** TS style 2 → `import { default as $1 } from './foo';` (literal `default`, single placeholder).
- [ ] **Bug #4.** Auto command on `src/foo.ts` into `src/bar.ts` works deterministically across 10 rapid invocations.

## Manual smoke test of all 8 destination types

A quick final smoke pass to confirm nothing broke:

- [ ] `.js` → `.js` import works
- [ ] `.ts` → `.ts` import works
- [ ] `.js` → `.jsx` works
- [ ] `.ts` → `.tsx` works (TS shape)
- [ ] `.js` → `.tsx` works (JS shape — fallback)
- [ ] `.css` → `.css` works
- [ ] `.scss` → `.scss` works (partial stripped)
- [ ] `.css` → `.scss` works (extension preserved)
- [ ] `.png` → `.html` (img tag)
- [ ] `.png` → `.md` (image link)

## Type-check / lint / build still pass

- [ ] In the project root, run `npm run check-types`. **Expect:** no errors.
- [ ] Run `npm run lint`. **Expect:** no errors.
- [ ] Run `npm run compile`. **Expect:** clean build, `dist/extension.js` produced.
- [ ] Run `npm test` (Mocha smoke). **Expect:** the single existing test (`extension activation registers the three auto-import commands`) passes.

## Sign-off

- [ ] Empty/degenerate destinations (4 cases)
- [ ] Untitled / Diff editor / Read-only (3 cases)
- [ ] Multi-root workspace (3 cases)
- [ ] Multi-cursor mode
- [ ] Stress / rapid-fire (4 cases)
- [ ] Workspace events (2 cases)
- [ ] Setting persistence
- [ ] CHANGELOG 0.6.1 regression (3 cases)
- [ ] All 4 session-fix regressions (4 cases)
- [ ] Smoke test all destination types (10 cases)
- [ ] Type-check / lint / build / test all pass

## Final master sign-off

After all 17 checklists pass, return to `README.md` and complete the master sign-off matrix.

**Tester:** ____________________
**Date:** ____________________
**Build commit:** ____________________
**Result:** ☐ READY TO SHIP · ☐ BLOCKED (notes in README)
