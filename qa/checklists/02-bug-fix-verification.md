# 02 — Bug-fix verification (PRIORITY 1)

Verify every fix from this session. **If any of these fails, the fix has regressed — stop and investigate before proceeding.**

## Setup

- `00-setup.md` complete
- Extension Development Host running with `qa/workspace/` open as the folder
- 01-sanity-and-keybindings passed

---

## Bug #1 — SCSS `@use … as *;` snippet

**File:** `src/snippets/languages/scss.ts`. Style index 1 had `@use 'path' as $1` (no `*` default, no `;`). Now: `@use 'path' as ${1:*};`.

### Configure
- Open Settings (`Cmd/Ctrl+,`) → search `scssImportStyle`
- Set `auto-import.importStatement.styleSheet.scssImportStyle` to `@use '_relativePath_' as *;`

### Tests

- [ ] **Snippet shape.** Copy `styles/_partial.scss` → open `styles/main.scss` → paste (Cmd/Ctrl+I).
  **Expect:** line inserted: `@use './partial' as *;`
  - The trailing `;` is present
  - The cursor is on `*` (placeholder selected — visible as a highlighted token)
  - The leading `_` was stripped from `_partial.scss` → path is `'./partial'`, not `'./_partial'`

- [ ] **Tab confirms default.** With `*` selected, press `Tab` (or `Esc`).
  **Expect:** cursor exits placeholder. The literal `*` remains in the file.

- [ ] **Tab over with custom name.** Repeat: copy `_partial.scss`, paste into `main.scss`. With `*` highlighted, type `prefix` then press `Tab`.
  **Expect:** result is `@use './partial' as prefix;`

- [ ] **Verify settings round-trip.** Reload window → reopen settings → confirm the SCSS import style still shows `@use '_relativePath_' as *;` exactly. **Expect:** byte-exact match (no auto-conversion).

---

## Bug #2 — TypeScript Angular naming with `preserveScriptFileExtension`

**File:** `src/snippets/languages/typescript.ts:generateAngularLegacyImportName`. Was producing `AppRootComponentTs` when extension preservation was on. Now correctly produces `AppRootComponent`.

### Configure
- `auto-import.importStatement.script.typescriptImportStyle` = `import { name } from '_relativePath_';`
- `auto-import.importStatement.script.preserveScriptFileExtension` = **TRUE**

### Tests (preserveScriptFileExtension = TRUE)

- [ ] **Component.** Copy `src/components/app-root.component.ts` → paste into `src/foo.ts`.
  **Expect:** `import { AppRootComponent } from './components/app-root.component.ts';`
  - `AppRootComponent` (NOT `AppRootComponentTs`)
  - Path includes `.ts` extension

- [ ] **Module.** Copy `src/components/auth.module.ts` → paste into `src/foo.ts`.
  **Expect:** `import { AuthModule } from './components/auth.module.ts';`

- [ ] **Directive.** Copy `src/components/highlight.directive.ts` → paste into `src/foo.ts`.
  **Expect:** `import { HighlightDirective } from './components/highlight.directive.ts';`

- [ ] **Pipe.** Copy `src/components/trim.pipe.ts` → paste into `src/foo.ts`.
  **Expect:** `import { TrimPipe } from './components/trim.pipe.ts';`

- [ ] **Service.** Copy `src/components/user.service.ts` → paste into `src/foo.ts`.
  **Expect:** `import { UserService } from './components/user.service.ts';`

### Tests (preserveScriptFileExtension = FALSE)

Now flip `preserveScriptFileExtension` to **FALSE**.

- [ ] **Component.** Copy `src/components/app-root.component.ts` → paste into `src/foo.ts`.
  **Expect:** `import { AppRootComponent } from './components/app-root.component';` (no `.ts`)

- [ ] **Service.** Copy `src/components/user.service.ts` → paste into `src/foo.ts`.
  **Expect:** `import { UserService } from './components/user.service';`

### Tests — non-Angular file (should NOT auto-name)

- [ ] **Plain helper.** Copy `src/helpers.ts` → paste into `src/foo.ts`.
  **Expect:** `import { $1 } from './helpers';` — `$1` is a tabstop placeholder (NOT an auto-derived `Helpers` identifier).

---

## Bug #3 — Copy command race conditions

**File:** `src/commands/copy-file-path.ts:27,37`. `executeCommand('copyFilePath')` and `clipboard.writeText` are now awaited, eliminating a race where the read could resolve before the built-in command finished writing.

The same file was further hardened to validate the post-condition: when the round-tripped clipboard is not an absolute path with an extension, copy fires the `'no-file-to-copy'` warning and returns `false`. `commands/copy-paste.ts:6-8` then short-circuits before paste-import runs against stale clipboard contents — verify that branch separately in `03-copy-command.md` and `12-auto-command.md`.

### Tests — single-shot

- [ ] **Cold copy.** Close VS Code, restart, open Extension Development Host fresh, open `src/foo.ts`. Press `Cmd/Ctrl+Shift+A`.
  **Expect:** clipboard contains the absolute path of `foo.ts` (verify by pasting in an external app).

- [ ] **Cold paste in different file.** With clipboard from above, open `src/bar.ts`, press `Cmd/Ctrl+I`.
  **Expect:** import refers to `./foo`, not a stale path.

### Tests — chained Auto

- [ ] **Auto across rapid switches.** In Explorer, click `src/foo.ts` while `src/bar.ts` is the active editor → `Alt+D`.
  **Expect:** import for `foo` lands in `bar.ts`. Toast: `Copied foo.ts`.

- [ ] **Repeat 5×.** Quickly: alt+D on foo into bar → undo → alt+D on helpers into bar → undo → … 5 cycles, varying source.
  **Expect:** every iteration imports the correct source. No stale paths.

### Tests — focus-shift stress

- [ ] **Focus jitter.** Run `Cmd/Ctrl+Shift+A` while clicking between Explorer and editor mid-press (within reason — not actually possible to time, but click rapidly before/after).
  **Expect:** toast still shows the right basename, clipboard has the right path.

- [ ] **Multi-window stress.** Open a second VS Code window (any project). Run `Cmd/Ctrl+Shift+A` in the Extension Development Host. Switch focus to the other window briefly. Switch back. Run paste.
  **Expect:** clipboard wasn't clobbered by the focus change.

---

## Sign-off

- [ ] **Bug #1 — SCSS `@use … as *;`** all 4 cases pass
- [ ] **Bug #2 — Angular naming** all 5 components × 2 preserve states + non-Angular case pass (11 cases)
- [ ] **Bug #3 — Race conditions** all stress cases pass

Tester / date: ___________________
