# qa/workspace/html/CLAUDE.md

Fixtures for `checklists/html.md` — the `.html` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `html.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `html.md`.

## Layout

```
html/
├── index.html                   Primary target — §2 paste, §3 Alt+D, §4 styles, §7 picker, §8 set-default, §9a drop
├── src/                         Import sources — one per source-type branch
│   ├── scripts/app.js           script (.js)       → <script src="./src/scripts/app.js"></script>
│   ├── styles/theme.css         stylesheet (.css)  → fixed <link href="…" rel="stylesheet">
│   ├── images/logo.png          image (.png)       → <img src="…" alt="sample">   (empty placeholder)
│   ├── media/intro.mp4          video (.mp4)       → <video src="…" controls></video>  (empty placeholder)
│   ├── media/theme.mp3          audio (.mp3)       → <audio src="…" controls></audio>  (empty placeholder)
│   └── media/captions.vtt       text-track (.vtt)  → fixed <track … srclang="${1:en}" label="${2:English}">
├── destinations/                Pre-filled placement targets (undo after each paste; paths resolve as ../src/…)
│   ├── blank.html               Empty body line — placement setting-ignored test (§6, §9c-i)
│   ├── indented.html            Line 2 = exactly six spaces — column-follows-cursor test at col 6 (§6, §9c-ii)
│   └── with-comments.html       HTML <!-- --> vs embedded-JS // run — comment-marker mismatch (§10, §9c-iii/iv)
└── rejected/                    One source per rejected category
    ├── widget.ts   App.vue      theme.scss   notes.md
    ├── data.json   page.html    font.woff2   doc.pdf
    └── sample.tex  refs.bib     diagram.eps
```

## Subdirectories

| Location | Purpose |
|----------|---------|
| root | `index.html` — the primary paste/drop/picker/set-default/DnD target. Sits at the root so its §2 happy-path inserts read `./src/…`. Holds a `<!-- paste / drop on the empty line below -->` marker above an empty target line; **undo after each paste** so the buffer returns to its expected state. |
| `src/scripts/` | `app.js` — the script source (`.js` → `<script>`). The single most-referenced source: it also drives placement (§6), edge cases (§10), and drop (§9). |
| `src/styles/` | `theme.css` — the stylesheet source (`.css` → fixed `<link>`). Single-variant, so Pick Style silent-inserts and Set Default returns `no-configurable-style`. |
| `src/images/` | `logo.png` — the image source (→ `<img>`). Empty placeholder — `.html` keys on the `.png` extension, not bytes. |
| `src/media/` | `intro.mp4` (video → `<video>`), `theme.mp3` (audio → `<audio>`), `captions.vtt` (text-track → fixed `<track>` with `${1:en}`/`${2:English}` tab stops). `.mp4`/`.mp3` are empty placeholders; `captions.vtt` holds a minimal `WEBVTT` cue. |
| `destinations/` | Pre-filled `.html` placement targets, one level deep (so paste inserts resolve as `../src/…`). `blank.html` (empty body line), `indented.html` (line 2 = **exactly six spaces** — the column-follows-cursor test), `with-comments.html` (HTML `<!-- -->` vs an embedded-JS `//` run). **Undo after each paste.** |
| `rejected/` | One source per rejected extension for allow-list gating. Content is irrelevant — only the extension matters. `page.html` drives the dedicated `.html → .html` rejection. |

## Fixture content expectations

- **Source files (`src/scripts/app.js`, `src/styles/theme.css`, `src/media/captions.vtt`)** — content is cosmetic (any valid file of that type); they are imported, never edited by a test. The snippet depends only on the path + extension. `.html` **always keeps the full extension** (`<script src="./src/scripts/app.js">`, `<link href="./src/styles/theme.css">`) — no preserve toggle applies.
- **`index.html`** — the primary target. Keep the empty paste-target line inside `<body>` intact; the tester places the cursor there. Pasting then undoing is the normal cycle.
- **`src/images/logo.png`, `src/media/intro.mp4`, `src/media/theme.mp3`** — empty 0-byte placeholders. `.html` keys on the extension (`.png`/`.mp4`/`.mp3`), not the bytes; the generated `<img>`/`<video>`/`<audio>` tag is identical regardless of content.
- **`destinations/*.html` targets** — content matters and is whitespace-sensitive. `indented.html` line 2 **must stay exactly six spaces** (the §6 column-6 / §9 c-ii assertions fail otherwise); `with-comments.html` must keep both the `<!-- section marker -->` line and the contiguous `// bootstrap` / `// init app` run inside the embedded `<script>` (they exercise the opposite comment-marker behaviors in §10). `blank.html` keeps one empty body line. Do not reformat them without updating the checklist.
- **`rejected/*`** — content is irrelevant; only the extension matters for gating. `font.woff2` and `doc.pdf` are empty 0-byte placeholders; `diagram.eps` is a 2-line PostScript (EPS) stub; the remaining text stubs hold a one-line body.
