# 15 — Gating & rejection

Validates every rejection path: same-file, the eight not-supported clauses, and degenerate inputs (empty clipboard, no active editor, garbage text).

**Sources:**
- `src/commands/paste-import.ts` — same-file check + 8-clause `if` conjunction
- `src/constants/extensions.ts` — `CROSS_IMPORT_DESTINATIONS`, `HTML/MARKDOWN/CSS/SCSS_SUPPORTED_EXTENSIONS`
- `src/snippets/dispatch.ts` — empty `SnippetString('')` for unhandled destination
- `src/snippets/_shared.ts` — empty for unhandled JSX/TSX source
- `src/editor/notification.ts` — `'same-file-path'` and `'not-supported'` warnings

## Setup

- 00-setup.md complete
- Default settings

## Same-file rejection

The check `sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()` runs **before** the 8-clause gating.

- [ ] **Identical path.** Open `src/foo.ts`. Copy. Paste.
  **Expect:** toast `Auto Import Relative Path: Same file path.` Editor unchanged.

- [ ] **Case difference.** macOS/Windows are case-insensitive. Verify same-file fires when one is uppercase. (Hard to construct on case-sensitive systems; on macOS just confirm `/Users/.../FOO.ts` (renamed) vs `/Users/.../foo.ts` triggers same-file.)

- [ ] **Empty clipboard.** Clear clipboard (copy empty text from another app). Open `src/foo.ts` (any editor). Paste.
  **Expect:** `Same file path.` toast — empty string `'' === ''.toLowerCase()` matches the destination's lowercased path? No, actually destination path is non-empty, source is `''`. They DON'T match. Verify what actually fires:
  - If clipboard returns `''`, source path is `''`. Comparison: `''` vs `'/path/to/foo.ts'` — NOT equal. Falls through to gating. The gating clause for empty `extractFileExtension('')` returns `''` which is not in any allowed list. Verify which toast fires (likely `Not supported.`).

## The 8 not-supported gating clauses (paste-import.ts)

Each clause should be testable in isolation. Set `placement = Cursor` for predictability.

### Clause 1: dest not in CROSS_IMPORT_DESTINATIONS AND src ≠ dest extension

`CROSS_IMPORT_DESTINATIONS = ['.html', '.md', '.css', '.scss', '.tsx', '.jsx']`. So `.js` and `.ts` are NOT cross-import.

- [ ] `.ts` source → `.js` dest: `src/foo.ts` → `src/sibling.js`. **Expect:** `Not supported.`
- [ ] `.js` source → `.ts` dest: `src/sibling.js` → `src/foo.ts`. **Expect:** `Not supported.`
- [ ] `.png` source → `.ts` dest: `assets/logo.png` → `src/foo.ts`. **Expect:** `Not supported.`
- [ ] **Negative case:** `.ts` source → `.ts` dest (different files): `src/foo.ts` → `src/bar.ts`. **Expect:** snippet inserted (no rejection — same extension).

### Clause 2: `.html → .html`

- [ ] `pages/index.html` → `pages/about.html`. **Expect:** `Not supported.` (Different files, same extension, but `.html → .html` is explicitly rejected even though `.html` IS in cross-import.)

### Clause 3: source not in HTML_SUPPORTED_EXTENSIONS, dest is `.html`

`HTML_SUPPORTED = .js + .css + 5 images`. Anything else rejected:

- [ ] `src/foo.ts` → `pages/index.html`. **Expect:** `Not supported.`
- [ ] `src/widget.tsx` → `pages/index.html`. **Expect:** `Not supported.`
- [ ] `styles/main.scss` → `pages/index.html`. **Expect:** `Not supported.`
- [ ] `docs/README.md` → `pages/index.html`. **Expect:** `Not supported.`
- [ ] `data/config.json` → `pages/index.html`. **Expect:** `Not supported.`
- [ ] `assets/font.woff2` → `pages/index.html`. **Expect:** `Not supported.`
- [ ] **Negative:** `src/sibling.js` → `pages/index.html`. **Expect:** `<script>` inserted.

### Clause 4: source not in MARKDOWN_SUPPORTED_EXTENSIONS, dest is `.md`

`MARKDOWN_SUPPORTED = .md + 5 images`. Anything else rejected:

- [ ] `src/foo.ts` → `docs/README.md`. **Expect:** `Not supported.`
- [ ] `styles/main.scss` → `docs/README.md`. **Expect:** `Not supported.`
- [ ] `pages/index.html` → `docs/README.md`. **Expect:** `Not supported.`
- [ ] `src/sibling.js` → `docs/README.md`. **Expect:** `Not supported.`
- [ ] `data/config.yaml` → `docs/README.md`. **Expect:** `Not supported.`
- [ ] **Negative:** `assets/logo.png` → `docs/README.md`. **Expect:** image syntax inserted.

### Clause 5: source not in CSS_SUPPORTED_EXTENSIONS, dest is `.css`

`CSS_SUPPORTED = .css + 5 images`.

- [ ] `styles/main.scss` → `styles/global.css`. **Expect:** `Not supported.`
- [ ] `src/foo.ts` → `styles/global.css`. **Expect:** `Not supported.`
- [ ] `docs/README.md` → `styles/global.css`. **Expect:** `Not supported.`
- [ ] `data/config.json` → `styles/global.css`. **Expect:** `Not supported.`
- [ ] **Negative:** `styles/reset.css` → `styles/global.css`. **Expect:** `@import` inserted.

### Clause 6: source not in SCSS_SUPPORTED_EXTENSIONS, dest is `.scss`

`SCSS_SUPPORTED = .scss + .css + 5 images`.

- [ ] `src/foo.ts` → `styles/main.scss`. **Expect:** `Not supported.`
- [ ] `pages/index.html` → `styles/main.scss`. **Expect:** `Not supported.`
- [ ] `docs/README.md` → `styles/main.scss`. **Expect:** `Not supported.`
- [ ] `data/config.json` → `styles/main.scss`. **Expect:** `Not supported.`
- [ ] **Negative `.css`:** `styles/global.css` → `styles/main.scss`. **Expect:** `@import` (with `.css` always preserved).
- [ ] **Negative image:** `assets/logo.png` → `styles/main.scss`. **Expect:** `url(...)`.

### Clause 7: snippet value is `'\n'`

This is the catch-all for "no language module handled this destination." Triggered when `dispatch.ts` falls through to its `default:` returning `new SnippetString('')`, then `insertImportSnippet` appends `'\n'`. Wait — checking `paste-import.ts`: the `\n` check is on `snippet.value === '\n'`, but `\n` appending happens in `insertImportSnippet`. So the gating actually catches `''` before append. The `'\n'` clause covers cases where a builder explicitly returns `'\n'`.

- [ ] **Unsupported destination extension.** Create `touch test-workspace/foo.unknown`. Open it. Copy `src/foo.ts`. Paste. **Expect:** `Not supported.` (dispatch's `default:` returns `''`, caught by clause 8 — but if the destination ext were ever `'\n'`, clause 7 would catch).

### Clause 8: snippet value is `''`

Empty snippet. Most direct path: a destination not handled by dispatch.

- [ ] **Custom unsupported extension.** `touch test-workspace/foo.unknown`. Open it. Copy `src/foo.ts`. Paste. **Expect:** `Not supported.`

- [ ] **JSX/TSX with unsupported source.** `assets/icon.svg` → `src/badge.jsx`. **Expect:** `Not supported.` (`.svg` isn't in primary or fallback or the hardcoded switch → `_shared.ts` `default:` returns empty.)

- [ ] **TSX with .jsx source.** `src/badge.jsx` → `src/widget.tsx`. **Expect:** `Not supported.` (`.jsx` not in primary `[.ts,.tsx]` or fallback `[.js]`.)

## Garbage clipboard text

- [ ] **Plain text in clipboard.** Copy `Hello world` from any text app. Open `src/foo.ts`. Paste import.
  **Expect:** Behavior:
  - source path = `'Hello world'`
  - `extractFileExtension('Hello world')` = `''`
  - dest = `/path/to/src/foo.ts`, ext = `.ts`
  - Same-file check: `'hello world' !== '/path/to/src/foo.ts'` → no same-file
  - Clause 1: `.ts` not in cross-import + `'' !== '.ts'` → REJECTED → `Not supported.` ✓

- [ ] **URL in clipboard.** Copy `https://example.com`. Paste.
  **Expect:** `Not supported.` (extracted ext is `.com`, doesn't match any allowed list).

- [ ] **Numeric in clipboard.** Copy `12345`. Paste.
  **Expect:** `Not supported.`

## No active editor

- [ ] Close all editors (Cmd/Ctrl+W repeatedly). Make sure clipboard has a valid path. Run `Auto Import: Paste` from Command Palette.
  **Expect:** silent return — no toast, no error. (`paste-import.ts` early-returns when `!editor`.)

## Notification messages — exact text

- [ ] **Same-file:** `Auto Import Relative Path: Same file path.`
- [ ] **Not supported:** `Auto Import Relative Path: Not supported.`
- [ ] Both prefixed with `Auto Import Relative Path:` (the longer prefix; **not** `Auto Import:` which is the Copy toast).
- [ ] Both render as **warning** toasts (yellow/orange icon, NOT red error).

## `notifications.clearAll` clears prior warnings on next Copy

- [ ] Trigger `Not supported.` warning. Don't dismiss it. Run Copy on any file.
  **Expect:** prior warning toast is cleared before the new "Copied …" info toast appears.

## Cleanup

```bash
rm -f test-workspace/foo.unknown
```

## Sign-off

- [ ] Same-file rejection (3 cases)
- [ ] Clause 1 (4 cases incl. negative)
- [ ] Clause 2: `.html → .html`
- [ ] Clause 3: HTML supported sources (7 cases)
- [ ] Clause 4: MD supported sources (6 cases)
- [ ] Clause 5: CSS supported sources (5 cases)
- [ ] Clause 6: SCSS supported sources (6 cases)
- [ ] Clause 7/8: empty/newline snippet (3 cases)
- [ ] Garbage clipboard (3 cases)
- [ ] No active editor
- [ ] Notification message text exact
- [ ] clearAll behavior

Tester / date: ___________________
