# QA Checklist — `.html` destination

> **These `[ ]` boxes are for the human tester** running the Extension Development
> Host (press **F5**). Tick them as you verify each case by hand. (They are *not*
> generation tasks.)
>
> **Assumes `general.md` has already passed.** This checklist tests only the
> `.html`-specific **DELTA**. It does **not** re-test cross-destination behavior that
> `general.md` owns — Copy File Path, clipboard validation, same-file rejection,
> notification wording + toast buttons, path computation, and the *universal*
> mechanics of Drag-and-drop (`general.md §8`), Paste as Import / Pick Style
> (`general.md §9`), and Set Default Import Style (`general.md §10`). Where a section
> below has both universal and `.html`-specific parts, only the delta is tested and a
> one-line cross-reference points at the owning `general.md` section.

## `.html` at a glance

| Aspect | Behavior |
|--------|----------|
| **Gating** | Allow-list (`HTML_SUPPORTED_EXTENSIONS` = `.js` `.css` + image + video + audio + `.vtt`). **`.html`→`.html` is rejected** (a `.html` cannot import another `.html`). |
| **Styles** | **6-way source-type dispatch.** Configurable: `<script>` (5 styles), `<img>` (3), `<video>` (4), `<audio>` (2). Fixed single-shape: `<link>` (stylesheet source), `<track>` (text-track source). |
| **Default style** | Index **0** for each configurable arm: `<script src="…"></script>`, `<img src="…" alt="sample">`, `<video src="…" controls></video>`, `<audio src="…" controls></audio>`. |
| **Smart identifier** | **None** — no exported-class detection, no Angular PascalCase. (See the §5 marker.) |
| **Placement** | **`forced-cursor`.** Top/Bottom/Cursor all insert at the **cursor line** (the setting has no effect); the **column follows the cursor** (not forced to 0). |
| **Path** | **Always keeps the full source extension** (`.js`, `.css`, `.png`, …). No preserve-extension setting applies — no toggle test. |

## Gestures

| Gesture | Trigger |
|---------|---------|
| Copy File Path | **`Cmd+Shift+A`** (mac) / `Ctrl+Shift+A` — or Command Palette → `Auto Import: Copy File Path` |
| Paste as Import | **`Cmd+I`** (mac) / `Ctrl+I` — or Command Palette → `Auto Import: Paste as Import` |
| Insert Import from Selected File | **`Alt+D`** with the file selected in the Explorer — or Command Palette → `Auto Import: Insert Import from Selected File` |
| Paste as Import (Pick Style) | Command Palette → `Auto Import: Paste as Import (Pick Style)` (also the **Paste with Style** button on the copy-success toast) |
| Set Default Import Style | Command Palette → `Auto Import: Set Default Import Style` |
| Drag-and-drop | Drag a file from the Explorer and drop it into the open `.html` editor |

Settings referenced (in `settings.json` or the Settings UI):

- `auto-import.preferences.importStatementPlacement` — `Top` / `Bottom` / `Cursor` (default `Bottom`; **ignored** for `.html`).
- `auto-import.importStatement.markup.htmlScriptImportStyle` (5 enum values; default `<script src="_relativePath_"></script>`).
- `auto-import.importStatement.markup.htmlImageImportStyle` (3; default `<img src="_relativePath_" alt="sample">`).
- `auto-import.importStatement.markup.htmlVideoImportStyle` (4; default `<video src="_relativePath_" controls></video>`).
- `auto-import.importStatement.markup.htmlAudioImportStyle` (2; default `<audio src="_relativePath_" controls></audio>`).

**Resetting between cases.** After any case that mutates a file, press **`Cmd+Z`** to
restore it before the next case; after any case that changes a setting, restore the
setting to its default. (Every paste/drop case below mutates the destination buffer —
the inserted tags stack otherwise.)

## Fixtures — `qa/workspace/html/`

```
html/
├── index.html                     # primary destination (happy path / styles / picker / set-default / DnD)
├── src/
│   ├── scripts/app.js             # script source        (.js)
│   ├── images/logo.png            # image source         (.png)
│   ├── media/intro.mp4            # video source         (.mp4)
│   ├── media/theme.mp3            # audio source         (.mp3)
│   ├── media/captions.vtt         # text-track source    (.vtt)
│   └── styles/theme.css           # stylesheet source    (.css)
├── destinations/
│   ├── blank.html                 # placement: empty body
│   ├── indented.html              # placement: cursor at a non-zero column
│   └── with-comments.html         # edge: HTML comment vs JS comment run
└── rejected/
    ├── widget.ts                  # script non-.js   (reject)
    ├── App.vue                    # framework        (reject)
    ├── theme.scss                 # stylesheet non-.css (reject)
    ├── notes.md                   # markdown         (reject)
    ├── data.json                  # data             (reject)
    ├── font.woff2                 # font             (reject)
    ├── doc.pdf                    # document         (reject)
    └── page.html                  # .html → .html    (reject)
```

**Source files** (imported *into* the destinations):

`html/src/scripts/app.js`
```js
export function init() {
  document.body.dataset.ready = 'true';
}
```

`html/src/styles/theme.css`
```css
:root {
  --brand: #0077aa;
}
```

`html/src/media/captions.vtt`
```vtt
WEBVTT

00:00.000 --> 00:02.000
Sample caption.
```

`html/src/images/logo.png`, `html/src/media/intro.mp4`, `html/src/media/theme.mp3`
— binary placeholders; the bytes are irrelevant (gating and the snippet shape key on
the **extension** alone). Any small valid file (or a stub) suffices.

**Destination files** (where imports are inserted):

`html/index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sample</title>
  </head>
  <body>
    <!-- paste / drop on the empty line below -->

  </body>
</html>
```

`html/destinations/blank.html`
```html
<!DOCTYPE html>
<html lang="en">
  <body>

  </body>
</html>
```

`html/destinations/indented.html` — line 2 is **six spaces** (no other content); the
cursor goes at column 6 (end of the spaces).
```html
<body>
      
</body>
```

`html/destinations/with-comments.html`
```html
<body>
  <!-- section marker -->
  <script>
    // bootstrap
    // init app
  </script>
</body>
```

**Reject-source files** (`html/rejected/`) — content is irrelevant to gating (it keys
on extension); minimal stubs:

```
widget.ts     →  export const widget = {};
App.vue       →  <template><div /></template>
theme.scss    →  $brand: #0077aa;
notes.md      →  # Notes
data.json     →  { "ok": true }
font.woff2    →  binary placeholder
doc.pdf       →  binary placeholder
page.html     →  <!DOCTYPE html><html></html>
```

---

## 1 — Cross-import gating matrix

`.html` is an **allow-list** destination. Accepted sources produce an import; every
other source raises `Auto Import: Cannot import .<src> into .html files.` and inserts
nothing. For each row: in the Explorer select the source, focus `html/index.html`,
and **`Alt+D`** (or copy the source then `Cmd+I`).

**Accepted (6 source buckets)** — each routes to its branch (full inserted strings in §2):

- [ ] `html/src/scripts/app.js` (`.js`, **script**) → inserts a `<script>` tag ✅
- [ ] `html/src/images/logo.png` (`.png`, **image**) → inserts an `<img>` tag ✅
- [ ] `html/src/media/intro.mp4` (`.mp4`, **video**) → inserts a `<video>` tag ✅
- [ ] `html/src/media/theme.mp3` (`.mp3`, **audio**) → inserts an `<audio>` tag ✅
- [ ] `html/src/styles/theme.css` (`.css`, **stylesheet**) → inserts a `<link>` tag ✅
- [ ] `html/src/media/captions.vtt` (`.vtt`, **text-track**) → inserts a `<track>` tag ✅

> Image, video, audio, and text-track are **accepted**, so they have **no** reject
> rows below.

**Rejected** — toast `Auto Import: Cannot import .<src> into .html files.`, nothing inserted:

- [ ] `html/rejected/widget.ts` (`.ts`) → `Auto Import: Cannot import .ts into .html files.`
      *(the other non-`.js` scripts `.tsx` / `.jsx` / `.mdx` reject identically — only `.js` is accepted)*
- [ ] `html/rejected/App.vue` (`.vue`) → `Auto Import: Cannot import .vue into .html files.`
      *(`.svelte` / `.astro` reject identically)*
- [ ] `html/rejected/theme.scss` (`.scss`) → `Auto Import: Cannot import .scss into .html files.`
      *(only `.css` is accepted among stylesheets)*
- [ ] `html/rejected/notes.md` (`.md`) → `Auto Import: Cannot import .md into .html files.`
- [ ] `html/rejected/data.json` (`.json`) → `Auto Import: Cannot import .json into .html files.`
      *(`.yaml` / `.yml` reject identically)*
- [ ] `html/rejected/font.woff2` (`.woff2`) → `Auto Import: Cannot import .woff2 into .html files.`
      *(`.woff` / `.ttf` / `.eot` reject identically)*
- [ ] `html/rejected/doc.pdf` (`.pdf`) → `Auto Import: Cannot import .pdf into .html files.`
- [ ] **`.html` → `.html`** — copy `html/rejected/page.html`, focus `html/index.html`, `Cmd+I`
      → `Auto Import: Cannot import .html into .html files.` *(a `.html` cannot import another `.html`)*

---

## 2 — Paste as Import (happy path)

One case per source-type branch, at the **default style (index 0)**. Open
`html/index.html`, put the cursor on the empty line inside `<body>`, copy the source
(`Cmd+Shift+A` in the Explorer), then `Cmd+I`. Verify the **exact** inserted string.
Undo (`Cmd+Z`) after each — all six cases paste into the same `index.html`.

- [ ] **script** — `html/src/scripts/app.js` → `<script src="./src/scripts/app.js"></script>` · *no tab stop*
- [ ] **image** — `html/src/images/logo.png` → `<img src="./src/images/logo.png" alt="sample">` · *no tab stop*
- [ ] **video** — `html/src/media/intro.mp4` → `<video src="./src/media/intro.mp4" controls></video>` · *no tab stop*
- [ ] **audio** — `html/src/media/theme.mp3` → `<audio src="./src/media/theme.mp3" controls></audio>` · *no tab stop*
- [ ] **stylesheet** — `html/src/styles/theme.css` → `<link href="./src/styles/theme.css" rel="stylesheet">` · *no tab stop*
- [ ] **text-track** — `html/src/media/captions.vtt` → `<track src="./src/media/captions.vtt" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>` · **tab stops `${1:en}` → `${2:English}`** — the **only** happy-path shape with placeholders

> Every path keeps its **full extension** (`.js`, `.png`, `.mp4`, `.mp3`, `.css`,
> `.vtt`) — `.html` never strips it.

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Open `html/index.html`, cursor on the empty `<body>` line. In the Explorer
      select `html/src/scripts/app.js` and press **`Alt+D`** → inserts the §2 happy-path
      string `<script src="./src/scripts/app.js"></script>` into the active editor (copy
      + paste in one gesture).

---

## 4 — All styles per source-type arm

Set the relevant `markup.html*ImportStyle` setting, paste `app.js` / `logo.png` /
`intro.mp4` / `theme.mp3` into `html/index.html`, verify the **literal inserted
string** and **tab-stop layout**, then Undo (`Cmd+Z`) the paste and restore the
setting. Undo (`Cmd+Z`) after each test — all 17 cases paste into the same `index.html`.

### Script — `htmlScriptImportStyle` (5 styles), source `html/src/scripts/app.js`

- [ ] **0** `<script src="./src/scripts/app.js"></script>` · *no tab stop* — *default*
- [ ] **1** `<script src="./src/scripts/app.js" defer></script>` · *no tab stop*
- [ ] **2** `<script type="module" src="./src/scripts/app.js"></script>` · *no tab stop*
- [ ] **3** `<script src="./src/scripts/app.js" async></script>` · *no tab stop*
- [ ] **4** `<script type="text/javascript" src="./src/scripts/app.js"></script>` · *no tab stop*

### Image — `htmlImageImportStyle` (3 styles), source `html/src/images/logo.png`

- [ ] **0** `<img src="./src/images/logo.png" alt="sample">` · *no tab stop* — *default*
- [ ] **1** `<img src="./src/images/logo.png" alt="$1" loading="lazy">` · **1 tab stop** (`$1` = alt)
- [ ] **2** `<img src="./src/images/logo.png" alt="$1" width="$2" height="$3">` · **3 tab stops** (`$1` alt → `$2` width → `$3` height)

### Video — `htmlVideoImportStyle` (4 styles), source `html/src/media/intro.mp4`

- [ ] **0** `<video src="./src/media/intro.mp4" controls></video>` · *no tab stop* — *default*
- [ ] **1** `<video src="./src/media/intro.mp4" autoplay muted loop playsinline></video>` · *no tab stop*
- [ ] **2** `<video src="./src/media/intro.mp4" controls poster="$1"></video>` · **1 tab stop** (`$1` = poster)
- [ ] **3** `<video src="./src/media/intro.mp4" controls preload="metadata"></video>` · *no tab stop*

### Audio — `htmlAudioImportStyle` (2 styles), source `html/src/media/theme.mp3`

- [ ] **0** `<audio src="./src/media/theme.mp3" controls></audio>` · *no tab stop* — *default*
- [ ] **1** `<audio src="./src/media/theme.mp3" controls preload="metadata"></audio>` · *no tab stop*

### Fixed shapes (not configurable — no setting)

- [ ] **stylesheet** — source `html/src/styles/theme.css` (`.css`) → `<link href="./src/styles/theme.css" rel="stylesheet">` · *no tab stop* — single fixed shape, no `htmlStyleSheetImportStyle` choice at runtime
- [ ] **text-track** — source `html/src/media/captions.vtt` (`.vtt`) → `<track src="./src/media/captions.vtt" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>` · **2 tab stops** — single fixed shape

### Always-keep-extension

> **Note (no test case).** `.html` reads **no** preserve-extension setting — the path
> **always** keeps the full source extension (`.js`, `.css`, `.png`, …). The
> `preserveScriptFileExtension` toggle has **no effect** here, so there is no
> preserve-toggle case to run.

### Style-name drift (config drift, distinct from style-count)

- [ ] Set `htmlScriptImportStyle` to a string matching **no** enum value (e.g. hand-type
      `"banana"` into `settings.json`), paste `app.js` → the import still inserts using the
      **style-0 shape** `<script src="./src/scripts/app.js"></script>` (the builder
      `default:` arm), **never nothing**. Restore the setting.

---

## 5 — Smart identifier behavior

**§5 (Smart identifier) — N/A for `.html`: no exported-class detection, no Angular
PascalCase.** `.html` has `smartId: none`; no PascalCase-fill or exported-class case
appears anywhere in this checklist.

---

## 6 — Placement (`forced-cursor`)

`.html` uses **forced-cursor** placement: the `importStatementPlacement` setting has
**no effect** — every mode inserts at the **cursor line**, and the **column follows
the cursor** (it is *not* forced to column 0, unlike script/stylesheet destinations).
A trailing newline is appended (the tag is a standalone line).

**Setting has no effect** — using `html/destinations/blank.html`, cursor on the empty
body line, paste `html/src/scripts/app.js` (inserts `<script src="../src/scripts/app.js"></script>`).
Undo (`Cmd+Z`) and re-place the cursor on the empty body line between each mode, so
every mode is evaluated from the same start state:

- [ ] `importStatementPlacement` = **Top** → import lands at the **cursor line** (NOT line 0)
- [ ] `importStatementPlacement` = **Bottom** → import lands at the **cursor line** (NOT after the last import / end of file)
- [ ] `importStatementPlacement` = **Cursor** → import lands at the **cursor line**
- [ ] All three produce the **same** result → confirms the setting is ignored. Restore to `Bottom`.

**Column follows the cursor** — using `html/destinations/indented.html`:

- [ ] Put the cursor at **column 6** (end of the six spaces on line 2), paste `app.js` →
      the `<script>` is inserted **at column 6** (indented six spaces), **not** flush to
      column 0. `Cmd+Z`. *(A script/stylesheet destination would force column 0; `.html` does not.)*

---

## 7 — Paste as Import (Pick Style) — DELTA

Command Palette → `Auto Import: Paste as Import (Pick Style)`; QuickPick placeholder
**`Select an import style`**. For each style item, the **LABEL** is the snippet preview
built from the source **basename** (nested paths collapse — `./src/scripts/app.js` →
`app.js`), while the **inserted** text uses the **full relative path**; `$1`/`${n:…}`
render as `name`/the default in the label. The **DESCRIPTION** is the style's tag —
**except** the 3 tagless style-0 entries (image / video / audio), whose description
falls back to the **full template string**.

> Universal QuickPick mechanics — escape to dismiss, filter by description, clipboard
> validation, one-shot (no default written), single-variant silent insert — are
> covered by **`general.md §9`**; not retested here.

### Script — 5 items (source `html/src/scripts/app.js`)

- [ ] **0** · LABEL `<script src="app.js"></script>` · INSERT `<script src="./src/scripts/app.js"></script>` · DESC `Modern minimal — type is the HTML5 default`
- [ ] **1** · LABEL `<script src="app.js" defer></script>` · INSERT `<script src="./src/scripts/app.js" defer></script>` · DESC `Deferred execution — runs after parsing, preserves order`
- [ ] **2** · LABEL `<script type="module" src="app.js"></script>` · INSERT `<script type="module" src="./src/scripts/app.js"></script>` · DESC `ES module — native ESM in HTML`
- [ ] **3** · LABEL `<script src="app.js" async></script>` · INSERT `<script src="./src/scripts/app.js" async></script>` · DESC `Async execution — order-independent, runs when downloaded`
- [ ] **4** · LABEL `<script type="text/javascript" src="app.js"></script>` · INSERT `<script type="text/javascript" src="./src/scripts/app.js"></script>` · DESC `Legacy — includes redundant type="text/javascript"`

### Image — 3 items (source `html/src/images/logo.png`) — **style 0 is tagless**

- [ ] **0** · LABEL `<img src="logo.png" alt="sample">` · INSERT `<img src="./src/images/logo.png" alt="sample">` · **DESC = full template** `<img src="_relativePath_" alt="sample">` *(no tag → fallback)*
- [ ] **1** · LABEL `<img src="logo.png" alt="name" loading="lazy">` · INSERT `<img src="./src/images/logo.png" alt="$1" loading="lazy">` · DESC `Lazy loading — opt-in for below-fold images`
- [ ] **2** · LABEL `<img src="logo.png" alt="name" width="name" height="name">` · INSERT `<img src="./src/images/logo.png" alt="$1" width="$2" height="$3">` · DESC `Explicit dimensions — Core Web Vitals CLS prevention`

### Video — 4 items (source `html/src/media/intro.mp4`) — **style 0 is tagless**

- [ ] **0** · LABEL `<video src="intro.mp4" controls></video>` · INSERT `<video src="./src/media/intro.mp4" controls></video>` · **DESC = full template** `<video src="_relativePath_" controls></video>`
- [ ] **1** · LABEL `<video src="intro.mp4" autoplay muted loop playsinline></video>` · INSERT `<video src="./src/media/intro.mp4" autoplay muted loop playsinline></video>` · DESC `Silent autoplay — background video (hero sections)`
- [ ] **2** · LABEL `<video src="intro.mp4" controls poster="name"></video>` · INSERT `<video src="./src/media/intro.mp4" controls poster="$1"></video>` · DESC `Controls + poster — custom thumbnail before playback`
- [ ] **3** · LABEL `<video src="intro.mp4" controls preload="metadata"></video>` · INSERT `<video src="./src/media/intro.mp4" controls preload="metadata"></video>` · DESC `Long-form video — preload metadata only (Core Web Vitals)`

### Audio — 2 items (source `html/src/media/theme.mp3`) — **style 0 is tagless**

- [ ] **0** · LABEL `<audio src="theme.mp3" controls></audio>` · INSERT `<audio src="./src/media/theme.mp3" controls></audio>` · **DESC = full template** `<audio src="_relativePath_" controls></audio>`
- [ ] **1** · LABEL `<audio src="theme.mp3" controls preload="metadata"></audio>` · INSERT `<audio src="./src/media/theme.mp3" controls preload="metadata"></audio>` · DESC `Network-friendly — preload metadata only`

### Single-variant (no picker shown)

- [ ] **stylesheet** (`.css`) → only one variant → Pick Style **silently inserts**
      `<link href="./src/styles/theme.css" rel="stylesheet">` with no QuickPick (empty description).
- [ ] **text-track** (`.vtt`) → only one variant → Pick Style **silently inserts**
      `<track src="./src/media/captions.vtt" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>` with no QuickPick.

---

## 8 — Set Default Import Style — DELTA

Command Palette → `Auto Import: Set Default Import Style`. On selecting a configurable
style: info toast **`Auto Import: Default style saved — <enum value>`** and the matching
`markup.html*ImportStyle` setting now holds that **enum value string**.

> The saved toast surfaces the **enum value** (the template), **not** the §7 picker
> tag — same style, two different surfaced strings. Universal mechanics (placeholder
> `Set default import style`, current default spliced to position 0 with
> `$(check) Current default`, escape, filter, **never inserts**) are **`general.md §10`**.

**Configurable arms** (saved toast shows the enum value; setting updates):

- [ ] **script** → pick "Deferred…" → `Auto Import: Default style saved — <script src="_relativePath_" defer></script>`; `htmlScriptImportStyle` = `<script src="_relativePath_" defer></script>`
- [ ] **image** → pick "Lazy loading…" → `Auto Import: Default style saved — <img src="_relativePath_" alt="" loading="lazy">`; `htmlImageImportStyle` updated *(note the saved value is `alt=""`, the enum value — distinct from the inserted `alt="$1"`)*
- [ ] **video** → pick "Controls + poster…" → `Auto Import: Default style saved — <video src="_relativePath_" controls poster=""></video>`; `htmlVideoImportStyle` updated
- [ ] **audio** → pick "Network-friendly…" → `Auto Import: Default style saved — <audio src="_relativePath_" controls preload="metadata"></audio>`; `htmlAudioImportStyle` updated

Restore each setting afterward.

**Fixed-shape arms** (no configurable setting → `no-configurable-style`):

- [ ] **stylesheet** (`.css` source) → `no-configurable-style` rejection (no style offered
      to save). The verbatim `.css → .html` toast is owned by `general.md §5.10` — confirm
      only that the stylesheet arm routes to it; don't re-assert the string here.
- [ ] **text-track** (`.vtt` source) → `Auto Import: .vtt → .html imports use a fixed style.`

---

## 9 — Drag-and-drop — DELTA

A drop reuses the **same** snippet + placement pipeline as paste, so the inserted
string is **byte-identical** to §2. Drag from the Explorer into the open `.html` editor
(`html/index.html` for the happy path; the `destinations/*.html` fixtures for the
placement cases below).

> Universal drop mechanics are covered by **`general.md §8`**; only the `.html` delta
> is tested here.

- [ ] **(a) happy-path drop** — drag `html/src/scripts/app.js` onto the empty `<body>`
      line → inserts `<script src="./src/scripts/app.js"></script>` (identical to §2 script).
- [ ] **(b) unsupported-pair drop** — drag `html/rejected/widget.ts` → toast
      `Auto Import: Cannot import .ts into .html files.` **and no import is inserted**; the
      drop edit resolves to `null`, so VS Code falls back to its default text-drop and the
      **raw path text** lands (distinct from paste, which inserts nothing at all).
- [ ] **(b′) `.html` → `.html` drop** — drag `html/rejected/page.html` → toast
      `Auto Import: Cannot import .html into .html files.` + raw-path fallback (no import).
- [ ] **(c-i) setting ignored on drop** — drag `html/src/scripts/app.js` onto the empty
      body line of `html/destinations/blank.html` under `importStatementPlacement` =
      **Top**, then **Bottom**, then **Cursor** → all three insert
      `<script src="../src/scripts/app.js"></script>` at the **drop line** (NOT line 0,
      NOT end of file). Restore the setting to `Bottom`; `Cmd+Z` after each.
- [ ] **(c-ii) column follows the drop** — drop `app.js` onto **column 6** (end of the
      six-space line 2) of `html/destinations/indented.html` →
      `<script src="../src/scripts/app.js"></script>` inserts **at column 6**, not flush
      to column 0 *(a script/stylesheet destination would force column 0)*. `Cmd+Z`.
- [ ] **(c-iii) HTML comment — lands at it** — drop `app.js` onto the
      `<!-- section marker -->` line of `html/destinations/with-comments.html` → the
      `<script>` inserts **at that line** (`<!--` is not recognized as a comment), same
      as §10. `Cmd+Z`.
- [ ] **(c-iv) JS comment run — pushed above** — drop `app.js` onto the `// init app`
      line inside the embedded `<script>` → the import is relocated **above** the
      contiguous `//` run (above `// bootstrap`), same as §10. `Cmd+Z`.
- [ ] **(d)** class-detect / Angular / preserve-extension on drop — **none apply** to
      `.html` (no smart identifier; extension always preserved).

> The DnD untitled/unsaved-buffer no-op precondition is tested **once for all 12
> destinations** in `typescript.md §9.10` — not repeated here.

---

## 10 — Edge cases (comment-marker mismatch)

`isCommentLine` recognizes JS/CSS markers (`//`, `/*`, `*`) but **not** HTML's
`<!-- -->`. `adjustForCommentBlock` still runs for `.html` (it is not Markdown), so the
two comment syntaxes behave **oppositely** in the same buffer. Use
`html/destinations/with-comments.html`, paste `html/src/scripts/app.js`.

- [ ] **HTML comment — lands at it.** Cursor on the `<!-- section marker -->` line →
      the import inserts **at that line** (the `<!--` line is not recognized as a comment,
      so it is **not** pushed above).
- [ ] **JS comment run — pushed above.** Cursor on the `// init app` line inside the
      embedded `<script>` → the import is relocated **above** the contiguous `//` run
      (above `// bootstrap`), because `//` *is* recognized and `adjustForCommentBlock`
      walks to the top of the run.

---

## 11 — Sign-off

Tester: ____________________  ·  Date: ____________  ·  Extension version: __________

**Case counts** (this checklist; excludes everything owned by `general.md`):

| § | Section | Cases |
|---|---------|------:|
| 1 | Gating matrix (6 accept + 8 reject) | 14 |
| 2 | Happy path (one per source branch) | 6 |
| 3 | Insert from Selected File (`Alt+D`) | 1 |
| 4 | All styles (5+3+4+2 + 2 fixed + name-drift) | 17 |
| 5 | Smart identifier — **N/A** (omitted) | 0 |
| 6 | Placement — `forced-cursor` (3 setting + 1 column) | 5 |
| 7 | Pick Style (5+3+4+2 + 2 single-variant) | 16 |
| 8 | Set Default (4 configurable + 2 fixed) | 6 |
| 9 | Drag-and-drop (a/b/b′/c-i…iv/d) | 8 |
| 10 | Edge cases (comment-marker mismatch) | 2 |
| | **Total** | **75** |

- [ ] All cases above pass on the target build.
