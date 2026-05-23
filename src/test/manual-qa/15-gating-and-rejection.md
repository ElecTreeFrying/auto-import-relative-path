# 15 — Gating & rejection

Validates every rejection path: no active editor, empty/garbage clipboard, same-file, source-not-found, the eight not-supported clauses, and the seven-variant notification system.

**Sources:**
- `src/commands/paste-import.ts` — order-of-checks: `no-active-editor` → `empty-clipboard` → `same-file-path` → `source-not-found` → 8-clause `not-supported`
- `src/commands/copy-file-path.ts` — post-condition guard fires `no-file-to-copy` and returns `false`; `commands/copy-paste.ts` short-circuits on that return
- `src/constants/extensions.ts` — `CROSS_IMPORT_DESTINATIONS`, `HTML/MARKDOWN/CSS/SCSS_SUPPORTED_EXTENSIONS`
- `src/snippets/dispatch.ts` — empty `SnippetString('')` for unhandled destination
- `src/snippets/_shared.ts` — empty for unhandled JSX/TSX/MDX source
- `src/editor/notification.ts` — seven `NotificationType` variants (six warning + one info), each with verbatim text the toast must match
- `src/types/notification.ts` — the string-literal union (no enum)

## Setup

- 00-setup.md complete
- Default settings

## Order of checks (paste-import.ts)

The order matters because earlier checks can mask later ones. Per `paste-import.ts:50-89`:

1. `!editor` → `'no-active-editor'` warning
2. clipboard fails `trim() !== ''` AND `path.isAbsolute()` AND `path.extname() !== ''` → `'empty-clipboard'` warning
3. `sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()` → `'same-file-path'` warning
4. `vscode.workspace.fs.stat(source)` throws → `'source-not-found'` warning
5. eight-clause gating fails → `'not-supported'` warning (parameterized with `sourceExt`/`destinationExt`)
6. otherwise → snippet inserted

When testing each clause below, ensure the test setup *only* trips that clause — earlier clauses will short-circuit before later ones run.

## Same-file rejection (check #3)

`sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()` runs after the empty-clipboard guard.

- [ ] **Identical path.** Open `src/foo.ts`. Copy. Paste.
  **Expect:** warning toast `Auto Import: A file cannot import itself.` Editor unchanged.

- [ ] **Case difference (macOS/Windows).** Both filesystems are case-insensitive. Confirm `/Users/.../FOO.ts` (renamed) and `/Users/.../foo.ts` trigger same-file rejection. Hard to construct on case-sensitive Linux ext4 — accept the documented platform behavior there.

## Empty / non-path clipboard (check #2)

The guard runs `trimmedSource === '' || !path.isAbsolute(trimmedSource) || path.extname(trimmedSource) === ''` BEFORE the same-file check, so even a clipboard that "looks" like the destination's name lands here when it's not an absolute path.

- [ ] **Empty clipboard.** Clear clipboard (copy empty text from another app). Open `src/foo.ts`. Paste.
  **Expect:** warning toast `Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.`
- [ ] **Whitespace-only clipboard.** Copy `   ` (3 spaces). Paste.
  **Expect:** same `'empty-clipboard'` toast (trim drops it to `''`).
- [ ] **Relative path in clipboard.** Copy `./foo.ts` (the literal text) from another app. Paste.
  **Expect:** `'empty-clipboard'` toast — `path.isAbsolute('./foo.ts')` is `false`, so the guard fires before any extension check.
- [ ] **Path without extension.** Copy `/Users/me/project/somefile` (literal text, no `.ext`). Paste.
  **Expect:** `'empty-clipboard'` toast — `path.extname()` is `''`.

## Source-file-deleted (check #4)

After the same-file check passes, `vscode.workspace.fs.stat` verifies the source still exists on disk.

- [ ] **Delete then paste.** Copy `src/foo.ts` (clipboard now holds its absolute path). Delete the file: `rm src/foo.ts`. Paste into a different editor (e.g., `src/bar.ts`).
  **Expect:** warning toast `Auto Import: Source file no longer exists: foo.ts.` (basename interpolated). Editor unchanged. Cleanup: `git checkout src/foo.ts`.
- [ ] **Move during edit.** Copy `src/helpers.ts`. Rename it: `mv src/helpers.ts src/helpers-renamed.ts`. Paste into `src/bar.ts`.
  **Expect:** `Auto Import: Source file no longer exists: helpers.ts.` (the basename in the toast matches the *original* — the clipboard wasn't aware of the rename). Cleanup.

## The 8 not-supported gating clauses (paste-import.ts, check #5)

Each clause should be testable in isolation. Set `placement = Cursor` for predictability. The `'not-supported'` toast is parameterized — the source and destination extensions appear verbatim:
`Auto Import: Cannot import ${sourceExt} into ${destinationExt} files.`

### Clause 1: dest not in CROSS_IMPORT_DESTINATIONS AND src ≠ dest extension

`CROSS_IMPORT_DESTINATIONS = ['.html', '.md', '.css', '.scss', '.tsx', '.jsx']`. So `.js` and `.ts` are NOT cross-import.

- [ ] `.ts` source → `.js` dest: `src/foo.ts` → `src/sibling.js`. **Expect:** `Auto Import: Cannot import .ts into .js files.`
- [ ] `.js` source → `.ts` dest: `src/sibling.js` → `src/foo.ts`. **Expect:** `Auto Import: Cannot import .js into .ts files.`
- [ ] `.png` source → `.ts` dest: `assets/logo.png` → `src/foo.ts`. **Expect:** `Auto Import: Cannot import .png into .ts files.`
- [ ] **Arbitrary unsupported language source.** `unsupported/Main.java` → `src/foo.ts`. **Expect:** `Auto Import: Cannot import .java into .ts files.` (`.java` is in no allowed-source list anywhere — not even a candidate.)
- [ ] **Binary unsupported source.** `unsupported/animation.mov` → `src/foo.ts`. **Expect:** `Auto Import: Cannot import .mov into .ts files.`
- [ ] **Negative case:** `.ts` source → `.ts` dest (different files): `src/foo.ts` → `src/bar.ts`. **Expect:** snippet inserted (no rejection — same extension).

### Clause 2: `.html → .html`

- [ ] `pages/index.html` → `pages/about.html`. **Expect:** `Auto Import: Cannot import .html into .html files.` (Different files, same extension, but `.html → .html` is explicitly rejected even though `.html` IS in cross-import.)

### Clause 3: source not in HTML_SUPPORTED_EXTENSIONS, dest is `.html`

`HTML_SUPPORTED = .js + .css + 5 images`. Anything else rejected (each row produces a parameterized toast naming the actual source ext):

- [ ] `src/foo.ts` → `pages/index.html`. **Expect:** `Auto Import: Cannot import .ts into .html files.`
- [ ] `src/widget.tsx` → `pages/index.html`. **Expect:** `Auto Import: Cannot import .tsx into .html files.`
- [ ] `styles/main.scss` → `pages/index.html`. **Expect:** `Auto Import: Cannot import .scss into .html files.`
- [ ] `docs/README.md` → `pages/index.html`. **Expect:** `Auto Import: Cannot import .md into .html files.`
- [ ] `data/config.json` → `pages/index.html`. **Expect:** `Auto Import: Cannot import .json into .html files.`
- [ ] `assets/font.woff2` → `pages/index.html`. **Expect:** `Auto Import: Cannot import .woff2 into .html files.`
- [ ] **Negative:** `src/sibling.js` → `pages/index.html`. **Expect:** `<script>` inserted.

### Clause 4: source not in MARKDOWN_SUPPORTED_EXTENSIONS, dest is `.md`

`MARKDOWN_SUPPORTED = .md + 5 images`. Anything else rejected:

- [ ] `src/foo.ts` → `docs/README.md`. **Expect:** `Auto Import: Cannot import .ts into .md files.`
- [ ] `styles/main.scss` → `docs/README.md`. **Expect:** `Auto Import: Cannot import .scss into .md files.`
- [ ] `pages/index.html` → `docs/README.md`. **Expect:** `Auto Import: Cannot import .html into .md files.`
- [ ] `src/sibling.js` → `docs/README.md`. **Expect:** `Auto Import: Cannot import .js into .md files.`
- [ ] `data/config.yaml` → `docs/README.md`. **Expect:** `Auto Import: Cannot import .yaml into .md files.`
- [ ] **Negative:** `assets/logo.png` → `docs/README.md`. **Expect:** image syntax inserted.

### Clause 5: source not in CSS_SUPPORTED_EXTENSIONS, dest is `.css`

`CSS_SUPPORTED = .css + 5 images`.

- [ ] `styles/main.scss` → `styles/global.css`. **Expect:** `Auto Import: Cannot import .scss into .css files.`
- [ ] `src/foo.ts` → `styles/global.css`. **Expect:** `Auto Import: Cannot import .ts into .css files.`
- [ ] `docs/README.md` → `styles/global.css`. **Expect:** `Auto Import: Cannot import .md into .css files.`
- [ ] `data/config.json` → `styles/global.css`. **Expect:** `Auto Import: Cannot import .json into .css files.`
- [ ] **Negative:** `styles/reset.css` → `styles/global.css`. **Expect:** `@import` inserted.

### Clause 6: source not in SCSS_SUPPORTED_EXTENSIONS, dest is `.scss`

`SCSS_SUPPORTED = .scss + .css + 5 images`. Notably, `.less` is NOT supported even though Sass and Less are syntactically close.

- [ ] `src/foo.ts` → `styles/main.scss`. **Expect:** `Auto Import: Cannot import .ts into .scss files.`
- [ ] `pages/index.html` → `styles/main.scss`. **Expect:** `Auto Import: Cannot import .html into .scss files.`
- [ ] `docs/README.md` → `styles/main.scss`. **Expect:** `Auto Import: Cannot import .md into .scss files.`
- [ ] `data/config.json` → `styles/main.scss`. **Expect:** `Auto Import: Cannot import .json into .scss files.`
- [ ] **Close-but-rejected.** `unsupported/styles.less` → `styles/main.scss`. **Expect:** `Auto Import: Cannot import .less into .scss files.` (`.less` is intentionally not in `SCSS_SUPPORTED_EXTENSIONS` — Sass cannot transitively `@use` Less files.)
- [ ] **Negative `.css`:** `styles/global.css` → `styles/main.scss`. **Expect:** `@import` (with `.css` always preserved).
- [ ] **Negative image:** `assets/logo.png` → `styles/main.scss`. **Expect:** `url(...)`.

### Clause 7: snippet value is `'\n'`

Catch-all for builders that explicitly return `'\n'`. Most production paths fall through to clause 8 (empty `''`) instead.

- [ ] **Unsupported destination extension.** Create `touch foo.unknown` at the workspace root, open it. Copy `src/foo.ts`. Paste. **Expect:** `Auto Import: Cannot import .ts into .unknown files.` (dispatch's `default:` returns `''`, caught by clause 8 — but if the destination ext were ever `'\n'`, clause 7 would catch).

### Clause 8: snippet value is `''`

Empty snippet. Most direct path: a destination not handled by dispatch.

- [ ] **Custom unsupported extension.** `touch foo.unknown` at the workspace root, open it. Copy `src/foo.ts`. Paste. **Expect:** `Auto Import: Cannot import .ts into .unknown files.`

- [ ] **JSX/TSX/MDX with unsupported source.** `assets/icon.svg` → `src/badge.jsx`. **Expect:** `Auto Import: Cannot import .svg into .jsx files.` (`.svg` isn't in primary or fallback or the hardcoded switch → `_shared.ts` `default:` returns empty.)

- [ ] **TSX with .jsx source.** `src/badge.jsx` → `src/widget.tsx`. **Expect:** `Auto Import: Cannot import .jsx into .tsx files.` (`.jsx` not in primary `[.ts,.tsx]` or fallback `[.js]`.)

## Garbage clipboard text — fires `'empty-clipboard'` (not `'not-supported'`)

The clipboard guard runs *before* the same-file check, gating, and snippet build. Plain text/URLs/numbers all fail the absolute-path-with-extension test → `'empty-clipboard'`. None of these reach clause 1.

- [ ] **Plain text in clipboard.** Copy `Hello world` from any text app. Open `src/foo.ts`. Paste import.
  - `path.isAbsolute('Hello world')` is `false` → guard fires.
  **Expect:** `Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.`

- [ ] **URL in clipboard.** Copy `https://example.com`. Paste.
  - `path.isAbsolute()` is `false` (URL, not a filesystem path).
  **Expect:** same `'empty-clipboard'` toast.

- [ ] **Numeric in clipboard.** Copy `12345`. Paste.
  - `path.isAbsolute()` is `false`.
  **Expect:** same `'empty-clipboard'` toast.

- [ ] **Absolute path with no extension.** Copy `/Users/me` (literal text). Paste.
  - Absolute, but `path.extname()` is `''`.
  **Expect:** same `'empty-clipboard'` toast.

## No active editor — fires `'no-active-editor'` (not silent)

The first check in `paste-import.ts:53-56`. Was previously a silent return; now toasts so the user knows why nothing was inserted.

- [ ] Close all editors (Cmd/Ctrl+W repeatedly). Make sure the clipboard has a valid path (Copy any source file first). Run `Auto Import: Paste as Import` from the Command Palette.
  **Expect:** warning toast `Auto Import: Open a file to paste an import.`. No insertion happens.

- [ ] **Welcome page focused (not an editor).** Quit and relaunch the Extension Development Host so the Welcome page is visible. Without opening any file, run `Auto Import: Paste as Import` from the Palette.
  **Expect:** same `'no-active-editor'` toast.

## Notification messages — exact text (all 7 variants)

Every toast must match `src/editor/notification.ts:30-52` byte-for-byte. All are prefixed with `Auto Import:` (no more `Auto Import Relative Path:` prefix anywhere).

| Type | Rendered text | Toast level |
|------|---------------|-------------|
| `same-file-path` | `Auto Import: A file cannot import itself.` | warning |
| `not-supported` | `Auto Import: Cannot import ${sourceExt} into ${destinationExt} files.` | warning |
| `no-active-editor` | `Auto Import: Open a file to paste an import.` | warning |
| `no-file-to-copy` | `Auto Import: No file selected to copy.` | warning |
| `empty-clipboard` | `Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.` | warning |
| `source-not-found` | `Auto Import: Source file no longer exists: ${basename}.` | warning |
| `copy-success` | `Auto Import: Copied path — ${basename}` | info |

- [ ] All six warning toasts render as warning (yellow/orange icon), not error (red).
- [ ] `copy-success` is the only **info** toast (blue/neutral icon, no warning glyph).
- [ ] `not-supported`, `source-not-found`, and `copy-success` interpolate their payload — verify the dynamic value (e.g., `.png`, `foo.ts`) appears verbatim in the rendered toast.

## `notifications.clearAll` clears prior warnings on the next command

`clearNotifications()` is called at the top of `paste-import.ts` and `copy-file-path.ts` — any lingering toast from a prior command is dismissed before the new toast fires.

- [ ] Trigger any not-supported warning (e.g., `.ts` source → `.js` dest). Don't dismiss it. Run Copy on any source file.
  **Expect:** the prior warning toast is dismissed before the new `Auto Import: Copied path — <basename>` info toast appears.

- [ ] Trigger an `'empty-clipboard'` warning. Don't dismiss. Run Paste again with a valid clipboard.
  **Expect:** prior warning dismissed; new snippet inserted (no second toast on success — the only success notification is for Copy).

## Notification flow coverage — provoke each of the 7 variants

A single end-to-end pass that fires every notification at least once. Tick when each variant has been observed with the exact text from the table above.

- [ ] `same-file-path` — copy any file, paste into itself.
- [ ] `not-supported` — copy `src/foo.ts`, paste into `src/sibling.js` (clause 1).
- [ ] `no-active-editor` — close all editors, run Paste from Palette.
- [ ] `no-file-to-copy` — close all editors AND deselect Explorer, run Copy from Palette.
- [ ] `empty-clipboard` — copy `Hello world` plain text, run Paste in any editor.
- [ ] `source-not-found` — copy `src/foo.ts`, delete it, run Paste in `src/bar.ts`. Cleanup: `git checkout src/foo.ts`.
- [ ] `copy-success` — copy any file. Verify info-level (blue), not warning (yellow).

## Cleanup

Run from the workspace root:

```bash
rm -f foo.unknown
```

## Sign-off

- [ ] Order-of-checks understood
- [ ] Same-file rejection (2 cases)
- [ ] Empty / non-path clipboard (4 cases)
- [ ] Source-file-deleted (2 cases)
- [ ] Clause 1 (6 cases incl. arbitrary unsupported, binary, negative)
- [ ] Clause 2: `.html → .html`
- [ ] Clause 3: HTML supported sources (7 cases)
- [ ] Clause 4: MD supported sources (6 cases)
- [ ] Clause 5: CSS supported sources (5 cases)
- [ ] Clause 6: SCSS supported sources (7 cases incl. `.less` close-but-rejected)
- [ ] Clause 7/8: empty/newline snippet (3 cases)
- [ ] Garbage clipboard fires `empty-clipboard` (4 cases)
- [ ] No-active-editor fires `no-active-editor` toast (2 cases)
- [ ] All 7 notification texts exact (warning vs info levels correct)
- [ ] clearAll behavior (2 cases)
- [ ] Notification flow coverage — every variant observed (7 cases)

Tester / date: ___________________
