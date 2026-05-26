# 11 — Paste into `.md` destination

Validates Markdown-snippet generation. Markdown emits one of two kinds: inline link `[text](path)` for Markdown sources, or one of three configurable image shapes for image sources. Cursor placement is **always** forced for `.md` destinations.

**Sources:**
- `src/snippets/languages/markdown.ts` — `buildMarkdownImportSnippet` + `buildMarkdownImageImportSnippet`
- `src/path/import-type.ts` — `determineImportType`
- `src/gating.ts` — isPairSupported clause 4
- `src/constants/extensions.ts` — `MARKDOWN_SUPPORTED_EXTENSIONS = .md + 7 images`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: `docs/README.md`
- Default: `placement = Bottom` (will be overridden)

## Cross-import gating matrix

`MARKDOWN_SUPPORTED_EXTENSIONS = ['.md', ...IMAGE_FILE_EXTENSIONS]`.

| Source | Expected |
|--------|----------|
| `docs/guide.md` | ✅ Inline link |
| `assets/logo.png` | ✅ Image (configurable shape) |
| `assets/icon.gif` | ✅ Image |
| `assets/photo.jpeg` | ✅ Image |
| `assets/photo.jpg` | ✅ Image |
| `assets/icon.svg` | ✅ Image |
| `assets/banner.avif` | ✅ Image |
| `assets/thumb.webp` | ✅ Image |
| `src/foo.ts` | ❌ `Auto Import: Cannot import .ts into .md files.` |
| `src/sibling.js` | ❌ `Auto Import: Cannot import .js into .md files.` |
| `src/widget.tsx` | ❌ `Auto Import: Cannot import .tsx into .md files.` |
| `src/badge.jsx` | ❌ `Auto Import: Cannot import .jsx into .md files.` |
| `styles/global.css` | ❌ `Auto Import: Cannot import .css into .md files.` |
| `styles/main.scss` | ❌ `Auto Import: Cannot import .scss into .md files.` |
| `pages/index.html` | ❌ `Auto Import: Cannot import .html into .md files.` |
| `data/config.json` | ❌ `Auto Import: Cannot import .json into .md files.` |
| `data/config.yaml` | ❌ `Auto Import: Cannot import .yaml into .md files.` |
| `assets/font.woff2` | ❌ `Auto Import: Cannot import .woff2 into .md files.` |
| `unsupported/texture.bmp` | ❌ `Auto Import: Cannot import .bmp into .md files.` |

- [ ] All 19 cases match — both extensions appear verbatim in the parameterized toast.

## Markdown-source shape (fixed inline link)

`markdownImportStyle` setting exists in package.json for UI parity but is unused at runtime.

- [ ] **Markdown source.** Copy `docs/guide.md` → paste into `docs/README.md`.
  **Expect:** `[text](./guide.md)`
  - Full `.md` extension preserved on the path
  - Cursor lands on `text` (tabstop 1 with default value `text`)

## Image-source shapes — all three `markdownImageImportStyle` enum values

### Style 0 — `![alt-text](_relativePath_)`

Set `auto-import.importStatement.markup.markdownImageImportStyle` to this value (the default).

- [ ] `assets/logo.png` → `![alt-text](../assets/logo.png)`
- [ ] `assets/icon.gif` → `![alt-text](../assets/icon.gif)`
- [ ] `assets/photo.jpeg` → `![alt-text](../assets/photo.jpeg)`
- [ ] `assets/photo.jpg` → `![alt-text](../assets/photo.jpg)`
- [ ] `assets/thumb.webp` → `![alt-text](../assets/thumb.webp)`

### Style 1 — `![alt-text](_relativePath_ "Hover text")`

Set the setting to the second enum value.

- [ ] `assets/logo.png` → `![alt-text](../assets/logo.png "Hover text")`
- [ ] Other images analogous.
- [ ] Two tabstops: `alt-text` (tabstop 1) then `Hover text` (tabstop 2).

### Style 2 — `<img src="_relativePath_" alt="" width="" height="">`

Set the setting to the third enum value.

- [ ] `assets/logo.png` → `<img src="../assets/logo.png" alt="" width="" height="">`
- [ ] Other images analogous.
- [ ] Three tabstops: `alt` (tabstop 1), `width` (tabstop 2), `height` (tabstop 3).

## Forced-cursor placement (always wins for `.md`)

- [ ] **Top setting overridden.** Set `placement = Top`. Cursor at line 5 of `docs/README.md`. Paste an image.
  **Expect:** image snippet at **line 5**, not line 0.

- [ ] **Bottom setting overridden.** Set `placement = Bottom`. Cursor at line 5. Paste a `.md` source.
  **Expect:** inline link at line 5, not after any prior import marker.

- [ ] **Cursor setting honored.** Set `placement = Cursor`. Cursor at line 5. Paste.
  **Expect:** at line 5.

## Insertion column — uses cursor's column

`.md` is not in `SCRIPT_FILE_EXTENSIONS` or `STYLESHEET_FILE_EXTENSIONS` → cursor's column wins.

- [ ] **Mid-paragraph insertion.** Type `Here is an image: |` (cursor at end). Paste an image.
  **Expect:** image syntax inserted at the cursor's column, mid-line. The text before/after stays intact.

- [ ] **Indent preserved.** Cursor at column 4 (4-space indent). Paste a Markdown source.
  **Expect:** `[text](./...)` starts at column 4.

## Path computation

- [ ] **Same directory.** `docs/guide.md` → `docs/README.md`. Path: `./guide.md`.
- [ ] **Sibling directory.** `assets/logo.png` → `docs/README.md`. Path: `../assets/logo.png`.
- [ ] **Forward slashes only.** Even on Windows.
- [ ] **Full extension preserved.** Both Markdown and image paths keep their full extension (`.md`, `.png`, etc.).

## Edge cases

- [ ] **Self-import.** Open `docs/README.md`, copy itself, paste → `Auto Import: A file cannot import itself.`
- [ ] **Empty `.md` file.** Create `touch docs/empty.md`. Paste an image. Snippet at line 0 column 0. Cleanup.
- [ ] **`md → md` with different basenames.** `docs/guide.md` → `docs/README.md`. Works (only `.html → .html` is the special-case rejection, not `.md → .md`).

## Known limitations / not bugs

- The `markdownImportStyle` setting (for `.md` source) has only one enum value and is hardcoded in `buildMarkdownImportSnippet`. UI parity only.
- The Markdown inline link shape `[text](path)` pre-fills `text` as a snippet tabstop (tabstop 1). The cursor lands on it and the user can type over it.

## Sign-off

- [ ] Cross-import matrix (17 cases)
- [ ] Markdown source → inline link
- [ ] All three image styles (12+ cases)
- [ ] Forced-cursor placement (3 overrides)
- [ ] Insertion column = cursor
- [ ] Path computation (3 cases)
- [ ] Edge cases (3 cases)

Tester / date: ___________________
