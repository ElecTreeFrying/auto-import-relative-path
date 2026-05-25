# 10 — Paste into `.html` destination

Validates HTML-snippet generation. HTML emits one of six tag types (`<script>`, `<img>`, `<video>`, `<audio>`, `<track>`, `<link>`) routed by `determineImportType`. Four are configurable via style settings (script: 5, image: 3, video: 4, audio: 2); two are fixed single-shape (link, track). Cursor placement is **always** forced for `.html` destinations.

**Sources:**
- `src/snippets/languages/html.ts` — six builders (four configurable, two fixed)
- `src/path/import-type.ts` — `determineImportType` (`.html → null` defensively)
- `src/commands/paste-import.ts` — gating clauses 2 & 3
- `src/constants/extensions.ts` — `HTML_SUPPORTED_EXTENSIONS = .js + .css + 7 images + 7 media + 1 text-track`

## Setup

- 00-setup.md complete; 01-sanity passed
- Active editor: `pages/index.html`
- Default: `placement = Bottom` (will be overridden to cursor for HTML)

## Cross-import gating matrix

`HTML_SUPPORTED_EXTENSIONS = ['.js', '.css', ...IMAGE_FILE_EXTENSIONS, ...MEDIA_FILE_EXTENSIONS, ...TEXT_TRACK_FILE_EXTENSIONS]`. **`.html → .html` is explicitly rejected** by clause 2 (no relative-import syntax for HTML embedding itself).

| Source | Expected |
|--------|----------|
| `src/sibling.js` | ✅ `<script>` tag |
| `styles/global.css` | ✅ `<link>` tag |
| `assets/logo.png` | ✅ `<img>` tag |
| `assets/icon.gif` | ✅ `<img>` |
| `assets/photo.jpeg` | ✅ `<img>` |
| `assets/photo.jpg` | ✅ `<img>` |
| `assets/icon.svg` | ✅ `<img>` |
| `assets/banner.avif` | ✅ `<img>` |
| `assets/thumb.webp` | ✅ `<img>` |
| `assets/media/clip.mp4` | ✅ `<video>` tag |
| `assets/media/song.mp3` | ✅ `<audio>` tag |
| `assets/media/captions.vtt` | ✅ `<track>` tag |
| `pages/about.html` | ❌ `Auto Import: Cannot import .html into .html files.` (clause 2: html→html) |
| `src/foo.ts` | ❌ `Auto Import: Cannot import .ts into .html files.` |
| `src/widget.tsx` | ❌ `Auto Import: Cannot import .tsx into .html files.` |
| `src/badge.jsx` | ❌ `Auto Import: Cannot import .jsx into .html files.` |
| `styles/main.scss` | ❌ `Auto Import: Cannot import .scss into .html files.` |
| `docs/README.md` | ❌ `Auto Import: Cannot import .md into .html files.` |
| `data/config.json` | ❌ `Auto Import: Cannot import .json into .html files.` |
| `data/config.yaml` | ❌ `Auto Import: Cannot import .yaml into .html files.` |
| `assets/font.woff2` | ❌ `Auto Import: Cannot import .woff2 into .html files.` |
| `unsupported/texture.bmp` | ❌ `Auto Import: Cannot import .bmp into .html files.` |

- [ ] All 21 cases match — both extensions appear verbatim in the parameterized toast.

## Snippet shapes — six tag types

Four are configurable (`<script>`, `<img>`, `<video>`, `<audio>`) — the user picks the shape via `htmlScriptImportStyle`, `htmlImageImportStyle`, `htmlVideoImportStyle`, `htmlAudioImportStyle` in `package.json`. Two are fixed single-shape (`<link>`, `<track>`). The `htmlStyleSheetImportStyle` setting exists for UI parity only (single enum value).

### `<script>` for `.js` source — 5 styles

Default style 0: modern minimal (no `type` attribute).

- [ ] Copy `src/sibling.js` → paste into `pages/index.html`.
  **Expect (style 0):** `<script src="../src/sibling.js"></script>`
  - Full `.js` extension preserved on `src` attribute
  - Relative path uses forward slashes
  - No placeholder tabstops in this shape

Cycle through the other 4 styles:
- [ ] Style 1 → `<script src="../src/sibling.js" defer></script>`
- [ ] Style 2 → `<script type="module" src="../src/sibling.js"></script>`
- [ ] Style 3 → `<script src="../src/sibling.js" async></script>`
- [ ] Style 4 → `<script type="text/javascript" src="../src/sibling.js"></script>` (legacy)

### `<img>` for image sources — 3 styles

Default style 0: basic with `alt="sample"`.

- [ ] `assets/logo.png` → `<img src="../assets/logo.png" alt="sample">`
- [ ] `assets/icon.gif` → `<img src="../assets/icon.gif" alt="sample">`
- [ ] `assets/photo.jpeg` → `<img src="../assets/photo.jpeg" alt="sample">`
- [ ] `assets/photo.jpg` → `<img src="../assets/photo.jpg" alt="sample">`
- [ ] `assets/icon.svg` → `<img src="../assets/icon.svg" alt="sample">`
- [ ] `assets/banner.avif` → `<img src="../assets/banner.avif" alt="sample">`
- [ ] `assets/thumb.webp` → `<img src="../assets/thumb.webp" alt="sample">`

Cycle through the other 2 styles (using any image fixture):
- [ ] Style 1 → `<img src="..." alt="$1" loading="lazy">`
- [ ] Style 2 → `<img src="..." alt="$1" width="$2" height="$3">`

### `<video>` for video sources — 4 styles

Default style 0: controls only.

- [ ] `assets/media/clip.mp4` → `<video src="../assets/media/clip.mp4" controls></video>`
- [ ] `assets/media/demo.webm` → `<video src="../assets/media/demo.webm" controls></video>`
- [ ] `assets/media/animation.mov` → `<video src="../assets/media/animation.mov" controls></video>`

Cycle through the other 3 styles:
- [ ] Style 1 → `<video src="..." autoplay muted loop playsinline></video>`
- [ ] Style 2 → `<video src="..." controls poster="$1"></video>`
- [ ] Style 3 → `<video src="..." controls preload="metadata"></video>`

### `<audio>` for audio sources — 2 styles

Default style 0: controls only.

- [ ] `assets/media/song.mp3` → `<audio src="../assets/media/song.mp3" controls></audio>`
- [ ] `assets/media/effect.ogg` → `<audio src="../assets/media/effect.ogg" controls></audio>`

Style 1:
- [ ] Style 1 → `<audio src="..." controls preload="metadata"></audio>`

### `<track>` for text-track source — fixed shape

- [ ] `assets/media/captions.vtt` → `<track src="../assets/media/captions.vtt" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>`

### `<link>` for `.css` source — fixed shape

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
  **Expect:** `Auto Import: A file cannot import itself.` (same-file check fires before clause 2).
- [ ] **Different `.html` source.** Copy `pages/about.html`, paste into `pages/index.html`.
  **Expect:** `Auto Import: Cannot import .html into .html files.` (clause 2 — same extension on both sides, distinct files; same-file check did not match).
- [ ] **Empty `.html` file.** Create `touch pages/empty.html`. Paste `.js` source.
  **Expect:** snippet at cursor (which is line 0, column 0). Cleanup.
- [ ] **Inside a tag, mid-line.** Position cursor inside `<body>|</body>` (between the tags). Paste `.png`.
  **Expect:** `<img>` inserted at the cursor's column inside the body.

## Known limitations / not bugs

- `htmlStyleSheetImportStyle` is UI-only — it has a single enum value and the builder hardcodes the single `<link>` shape. The other three HTML style settings (`htmlScriptImportStyle`, `htmlImageImportStyle`, `htmlVideoImportStyle`, `htmlAudioImportStyle`) are multi-entry and actively consumed.
- HTML doesn't strip extensions from paths; full extension always preserved (`.js`, `.css`, `.png` all visible in `src`/`href`).

## Sign-off

- [ ] Cross-import matrix (21 cases, including `.html→.html` rejection)
- [ ] `<script>` shape + 4 style variants
- [ ] `<img>` shape + 2 style variants (7 image sources)
- [ ] `<video>` shape + 3 style variants (3 video sources)
- [ ] `<audio>` shape + 1 style variant (2 audio sources)
- [ ] `<track>` fixed shape (1 text-track source)
- [ ] `<link>` fixed shape (2 CSS sources)
- [ ] Forced-cursor placement (3 overrides)
- [ ] Insertion column = cursor (not 0) — 3 cases
- [ ] Path computation (4 cases)
- [ ] Edge cases (4 cases)

Tester / date: ___________________
