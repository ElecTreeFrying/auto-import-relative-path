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

- [ ] **Whitespace-only file.** Open `whitespace-only.ts` (3 newlines, ships in workspace). Paste with `placement = Top`.
  **Expect:** snippet at line 0, displacing the existing newlines.

- [ ] **Single character file.** Open `single-char.ts` (1 byte: `x\n`, ships in workspace). Paste with `placement = Cursor`, cursor at end.
  **Expect:** snippet inserted at the cursor's line.

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

- [ ] **Construct a read-only file** at the workspace root: `touch src/readonly.ts; chmod 444 src/readonly.ts`. Open it. Paste.
  **Expect:** VS Code prevents the insertion (read-only error). Extension itself shouldn't crash. **Cleanup:** `chmod 644 src/readonly.ts; rm src/readonly.ts`.

## Multi-root workspace

This needs a *second* folder unrelated to `manual-qa-workspace/`. Construct it outside the repo so it doesn't clutter the fixture tree:

- [ ] Create a second folder: `mkdir -p ~/multi-root-test/src; touch ~/multi-root-test/src/extern.ts`.
- [ ] In the EDH, **File → Add Folder to Workspace…** → add `~/multi-root-test/`. (Both `manual-qa-workspace/` and `multi-root-test/` are now top-level roots.)
- [ ] Save the multi-root workspace as `~/multi-root-test/multi.code-workspace` (or anywhere — VS Code will prompt).
- [ ] Copy `extern.ts` from the second root → paste into `src/foo.ts` of the *first* root (the fixture workspace). **Expect:** absolute path computation works across root boundaries; the resulting path resolves up out of `manual-qa-workspace/` and back down into `multi-root-test/` (exact form depends on where each root lives on disk).

- [ ] **Cross-root same-file rejection:** copy `~/multi-root-test/src/extern.ts`, paste into the same file. **Expect:** warning toast `Auto Import: A file cannot import itself.`.

- [ ] **Cleanup:** remove the second folder from the workspace and `rm -rf ~/multi-root-test`.

## Multi-cursor mode in destination

- [ ] Open `src/bar.ts`. Place 3 cursors (Cmd/Ctrl+Alt+ArrowDown). Run paste with valid clipboard.
  **Expect:** snippet inserts at all 3 cursor positions (VS Code's `editor.insertSnippet` handles multi-cursor by default).

- [ ] **Behavior verification:** the snippet should be inserted at each cursor; the placeholder tabstop should be at all cursor positions simultaneously. Tab navigates through them.

## Stress / rapid-fire

- [ ] **10× rapid paste.** Copy `src/foo.ts`. In `src/bar.ts`, press `Cmd/Ctrl+I` 10 times in quick succession.
  **Expect:** 10 imports inserted (or 10 attempts — duplicates are fine). No duplicates lost. No errors.

- [ ] **Auto burst.** From Explorer, click 5 different `.ts` files in sequence and `Alt+D` each before the previous toast clears.
  **Expect:** every Auto runs to completion. No race condition (Bug #3 fix verified).

- [ ] **Setting toggle mid-flight.** With `placement = Top`, paste once. Immediately change to `Bottom` (without reload). Paste again.
  **Expect:** second paste at Bottom. No reload required.

- [ ] **Source file deleted between copy and paste.** Copy `src/foo.ts` (clipboard now holds its absolute path). Delete the file from a terminal: `rm src/test/manual-qa-workspace/src/foo.ts` (run from the repo root). Back in the EDH, paste into `src/bar.ts`.
  **Expect:** warning toast `Auto Import: Source file no longer exists: foo.ts.` — `paste-import.ts:70-74` runs `vscode.workspace.fs.stat` after the same-file check and fires the `'source-not-found'` notification when the file is gone. Editor unchanged. **Cleanup:** `git checkout src/test/manual-qa-workspace/src/foo.ts` (also from the repo root).

- [ ] **Extreme-depth path stress.** Open `very-deep/level-01/level-02/level-03/level-04/level-05/level-06/level-07/level-08/level-09/extreme-leaf.ts`. Copy `src/foo.ts`. Paste.
  **Expect:** snippet inserted with a 9-level relative path (`'../../../../../../../../../src/foo'`). Verifies the path-math layer doesn't choke on extreme traversal depth.

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
  - `typescriptImportStyle = import * as name from '_relativePath_';`
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

## Regression — the 3 fixes from this session

Re-verify (this is duplicated from `02-bug-fix-verification.md` as a final regression check before sign-off):

- [ ] **Bug #1.** SCSS style 1 → `@use './partial' as ${1:*};` with `*` default and `;`. (Pick one case.)
- [ ] **Bug #2.** TS style 0, preserveScriptFileExtension=true, `app-root.component.ts` → `import { AppRootComponent } from './components/app-root.component.ts';` (NOT `AppRootComponentTs`).
- [ ] **Bug #3.** Auto command on `src/foo.ts` into `src/bar.ts` works deterministically across 10 rapid invocations. Additionally verify: with no Explorer selection, `Alt+D` fires only the `'no-file-to-copy'` toast and `paste-import` is not invoked (`copy-paste.ts:6-8` short-circuit).

## Manual smoke test of all 9 destination types

A quick final smoke pass to confirm nothing broke:

- [ ] `.js` → `.js` import works
- [ ] `.ts` → `.ts` import works
- [ ] `.js` → `.jsx` works
- [ ] `.ts` → `.tsx` works (TS shape)
- [ ] `.js` → `.tsx` works (JS shape — fallback)
- [ ] `.ts` → `.mdx` works (TS shape)
- [ ] `.js` → `.mdx` works (JS shape — fallback)
- [ ] `.css` → `.css` works
- [ ] `.scss` → `.scss` works (partial stripped)
- [ ] `.css` → `.scss` works (extension preserved)
- [ ] `.png` → `.html` (img tag)
- [ ] `.png` → `.md` (image link)

## Type-check / lint / build still pass

- [ ] In the project root, run `npm run check-types`. **Expect:** no errors.
- [ ] Run `npm run lint`. **Expect:** no errors.
- [ ] Run `npm run compile`. **Expect:** clean build, `dist/extension.js` produced.
- [ ] Run `npm test` (Mocha smoke). **Expect:** the activation test (`extension activation registers the five auto-import commands`) passes alongside the per-language `buildXImportSnippetByStyle` suites.

## Sign-off

- [ ] Empty/degenerate destinations (4 cases via `empty-file.ts`, `comments-only.ts`, `whitespace-only.ts`, `single-char.ts`)
- [ ] Untitled / Diff editor / Read-only (3 cases)
- [ ] Multi-root workspace (3 cases)
- [ ] Multi-cursor mode
- [ ] Stress / rapid-fire (5 cases incl. extreme-depth via `very-deep/.../extreme-leaf.ts`)
- [ ] Workspace events (2 cases)
- [ ] Setting persistence
- [ ] CHANGELOG 0.6.1 regression (3 cases)
- [ ] All 4 session-fix regressions (4 cases)
- [ ] Smoke test all destination types (12 cases)
- [ ] Type-check / lint / build / test all pass

## Final master sign-off

After all 17 checklists pass, return to `README.md` and complete the master sign-off matrix.

**Tester:** ____________________
**Date:** ____________________
**Build commit:** ____________________
**Result:** ☐ READY TO SHIP · ☐ BLOCKED (notes in README)
