# 10 — Paste into `.html` destination

Validates HTML-snippet generation. HTML emits one of three fixed shapes (`<script>`, `<img>`, `<link>`) routed by `determineImportType`. Cursor placement is **always** forced for `.html` destinations.

**Sources:**
- `src/snippets/html.ts` — three fixed builders
- `src/path/import-type.ts` — `determineImportType` (`.html → null` defensively)
- `src/commands/paste-import.ts` — gating clauses 2 & 3
- `src/constants/extensions.ts` — `HTML_SUPPORTED_EXTENSIONS = .js + .css + 5 images`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: `pages/index.html`
- Default: `placement = Bottom` (will be overridden to cursor for HTML)

## Cross-import gating matrix

`HTML_SUPPORTED_EXTENSIONS = ['.js', '.css', ...IMAGE_FILE_EXTENSIONS]`. **`.html → .html` is explicitly rejected** by clause 2 (no relative-import syntax for HTML embedding itself).

| Source | Expected |
|--------|----------|
| `src/sibling.js` | ✅ `<script>` tag |
| `styles/global.css` | ✅ `<link>` tag |
| `assets/logo.png` | ✅ `<img>` tag |
| `assets/icon.gif` | ✅ `<img>` |
| `assets/photo.jpeg` | ✅ `<img>` |
| `assets/photo.jpg` | ✅ `<img>` |
| `assets/thumb.webp` | ✅ `<img>` |
| `pages/about.html` | ❌ Not supported (clause 2: html→html) |
| `src/foo.ts` | ❌ Not supported |
| `src/widget.tsx` | ❌ Not supported |
| `src/badge.jsx` | ❌ Not supported |
| `styles/main.scss` | ❌ Not supported |
| `docs/README.md` | ❌ Not supported |
| `data/config.json` | ❌ Not supported |
| `data/config.yaml` | ❌ Not supported |
| `assets/font.woff2` | ❌ Not supported |
| `assets/icon.svg` | ❌ Not supported |

- [ ] All 17 cases match.

## Snippet shapes — fixed (no configurable styles)

The `htmlScriptImportStyle` / `htmlImageImportStyle` / `htmlStyleSheetImportStyle` settings exist in `package.json` for UI parity but each has only a single enum value; the corresponding builder always emits that single shape.

### `<script>` for `.js` source

- [ ] Copy `src/sibling.js` → paste into `pages/index.html`.
  **Expect:** `<script type="text/javascript" src="../src/sibling.js"></script>`
  - Full `.js` extension preserved on `src` attribute
  - Relative path uses forward slashes
  - No placeholder tabstops in this shape

### `<img>` for image sources

- [ ] `assets/logo.png` → `<img src="../assets/logo.png" alt="sample">`
- [ ] `assets/icon.gif` → `<img src="../assets/icon.gif" alt="sample">`
- [ ] `assets/photo.jpeg` → `<img src="../assets/photo.jpeg" alt="sample">`
- [ ] `assets/photo.jpg` → `<img src="../assets/photo.jpg" alt="sample">`
- [ ] `assets/thumb.webp` → `<img src="../assets/thumb.webp" alt="sample">`

### `<link>` for `.css` source

- [ ] `styles/global.css` → `<link href="../styles/global.css" rel="stylesheet">`
- [ ] `styles/reset.css` → `<link href="../styles/reset.css" rel="stylesheet">`

## Forced-cursor placement (always wins for `.html`)

`shouldRepositionCursor` returns `true` whenever destination is `.html`, regardless of the user's `placement` setting.

- [ ] **Top setting overridden.** Set `placement = Top`. Place cursor at line 5 of `pages/index.html`. Paste a `.js` source.
  **Expect:** `<script>` snippet inserted at **line 5 (cursor)**, not line 0 (Top).

- [ ] **Bottom setting overridden.** Set `placement = Bottom`. Cursor at line 5. Paste an image.
  **Expect:** `<img>` at line 5, not after the last `import` marker.

- [ ] **Cursor setting honored (no change).** Set `placement = Cursor`. Cursor at line 5. Paste.
  **Expect:** at line 5 (same as overrides — cursor was already the rule).

## Insertion column — uses cursor's column (NOT 0)

`.html` is **not** in `SCRIPT_FILE_EXTENSIONS` or `STYLESHEET_FILE_EXTENSIONS` → `determineInsertionColumn` returns the **current cursor column**, not 0.

- [ ] Place cursor inside an indented body, e.g. column 4 (after 4 spaces of indent). Paste an `.png` source.
  **Expect:** `<img>` snippet starts at column 4 (preserving the indent), NOT column 0.

- [ ] Cursor at column 0 → snippet at column 0. Cursor at column 8 → snippet at column 8.

## Path computation

- [ ] **Cross-directory.** `src/sibling.js` → `pages/index.html`. Path: `../src/sibling.js`.
- [ ] **Same directory.** Create `cp src/sibling.js pages/local.js`. Copy `pages/local.js` → paste into `pages/index.html`. Path: `./local.js`. (Cleanup: `rm pages/local.js`.)
- [ ] **Multi-level.** Copy `assets/logo.png` → paste into `pages/index.html`. Path: `../assets/logo.png`.
- [ ] **Forward slashes only.** Verify the path in every `src=`/`href=` attribute uses `/`, never `\` (Windows users especially).

## Edge cases

- [ ] **Self-import (html→html).** Copy `pages/index.html`, paste into itself.
  **Expect:** "Same file path." (same-file check fires before clause 2).
- [ ] **Different `.html` source.** Copy `pages/about.html`, paste into `pages/index.html`.
  **Expect:** "Not supported." (clause 2: `.html → .html` regardless of basenames).
- [ ] **Empty `.html` file.** Create `touch pages/empty.html`. Paste `.js` source.
  **Expect:** snippet at cursor (which is line 0, column 0). Cleanup.
- [ ] **Inside a tag, mid-line.** Position cursor inside `<body>|</body>` (between the tags). Paste `.png`.
  **Expect:** `<img>` inserted at the cursor's column inside the body.

## Known limitations / not bugs

- The `htmlScriptImportStyle`, `htmlImageImportStyle`, and `htmlStyleSheetImportStyle` settings are UI-only — changing them has no functional effect. The corresponding `_styles.ts` tables (`HTML_SCRIPT_IMPORT_OPTIONS`, etc.) declare a single entry purely for `package.json` parity.
- HTML doesn't strip extensions from paths; full extension always preserved (`.js`, `.css`, `.png` all visible in `src`/`href`).

## Sign-off

- [ ] Cross-import matrix (17 cases, including `.html→.html` rejection)
- [ ] `<script>`, `<img>`, `<link>` shapes (8 source variants)
- [ ] Forced-cursor placement (3 overrides)
- [ ] Insertion column = cursor (not 0) — 3 cases
- [ ] Path computation (4 cases)
- [ ] Edge cases (4 cases)

Tester / date: ___________________
