# QA Checklist — `.md` destination

> **These `[ ]` boxes are for the human tester** running the Extension Development
> Host (press **F5**). Tick them as you verify each case by hand. (They are *not*
> generation tasks.)
>
> **Assumes `general.md` has already passed.** This checklist tests only the
> `.md`-specific **DELTA**. It does **not** re-test cross-destination behavior that
> `general.md` owns — Copy File Path, clipboard validation, same-file rejection,
> notification wording + toast buttons, path computation, and the *universal*
> mechanics of Drag-and-drop (`general.md §8`), Paste as Import / Pick Style
> (`general.md §9`), and Set Default Import Style (`general.md §10`). Where a section
> below has both universal and `.md`-specific parts, only the delta is tested and a
> one-line cross-reference points at the owning `general.md` section.

## `.md` at a glance

| Aspect | Behavior |
|--------|----------|
| **Gating** | Allow-list (`MARKDOWN_SUPPORTED_EXTENSIONS` = `.md` + image). **`.md` imports its OWN extension** — there is **no `.md`→`.md` rejection**. **Media (`.mp4`/`.mp3`…), `.vtt`, data (`.json`/`.yaml`/`.yml`), and stylesheets (`.css`/`.scss`) are all rejected** (narrower than `.html`). |
| **Styles** | **2-way source-type dispatch.** `markdown` source (`.md`) → fixed `[text](path)` link (hardcoded, no setting). `image` source → **3** configurable styles (`markdownImageImportStyle`). |
| **Default style** | `markdown` → the fixed link `[${1:text}](path)`. `image` → index **0** `![${1:alt-text}](path)`. |
| **Smart identifier** | **None** — no exported-class detection, no Angular PascalCase. (See the §5 marker.) |
| **Placement** | **`forced-cursor`.** Top/Bottom/Cursor all insert at the **cursor line** (the setting has no effect); the **column follows the cursor** (not forced to 0). **Markdown-star quirk:** a leading `*` line (bullet / `*italic*`) is treated as content, so a cursor on it lands **at** the line — while `//` and `/*` still push above. |
| **Path** | **Always keeps the full source extension** (`.md`, `.png`, …). No preserve-extension setting applies — no toggle test. |

## Gestures

| Gesture | Trigger |
|---------|---------|
| Copy File Path | **`Cmd+Shift+A`** (mac) / `Ctrl+Shift+A` — or Command Palette → `Auto Import: Copy File Path` |
| Paste as Import | **`Cmd+I`** (mac) / `Ctrl+I` — or Command Palette → `Auto Import: Paste as Import` |
| Insert Import from Selected File | **`Alt+D`** with the file selected in the Explorer — or Command Palette → `Auto Import: Insert Import from Selected File` |
| Paste as Import (Pick Style) | Command Palette → `Auto Import: Paste as Import (Pick Style)` (also the **Paste with Style** button on the copy-success toast) |
| Set Default Import Style | Command Palette → `Auto Import: Set Default Import Style` |
| Drag-and-drop | Drag a file from the Explorer and drop it into the open `.md` editor |

Settings referenced (in `settings.json` or the Settings UI):

- `auto-import.preferences.importStatementPlacement` — `Top` / `Bottom` / `Cursor` (default `Bottom`; **ignored** for `.md`).
- `auto-import.importStatement.markup.markdownImageImportStyle` (3 enum values; default `![alt-text](_relativePath_)`).
- `auto-import.importStatement.markup.markdownImportStyle` (single dormant entry; default `[text](_relativePath_)`; the markdown-link shape is **hardcoded** and never reads this setting).

**Resetting between cases.** After any case that mutates a file, press **`Cmd+Z`** to
restore it before the next case; after any case that changes a setting, restore the
setting to its default. (Every paste/drop case below mutates the destination buffer —
the inserted links stack otherwise.)

## Fixtures — `qa/workspace/markdown/`

```
markdown/
├── notes.md                        # primary destination (happy path / styles / picker / set-default / DnD)
├── src/
│   ├── docs/intro.md               # markdown source     (.md)  → fixed-link branch
│   └── images/logo.png             # image source        (.png) → image branch
├── destinations/
│   ├── blank.md                    # placement: cursor mid-document
│   ├── indented.md                 # placement: cursor at a non-zero column
│   ├── with-comments.md            # placement/edge: markdown `*` bullets vs `//` / `/*` runs
│   └── with-comments.tsx           # §10 contrast: byte-identical buffer, `*` is a comment
└── rejected/
    ├── widget.ts                   # script           (reject)
    ├── App.vue                     # framework        (reject)
    ├── theme.css                   # stylesheet       (reject)
    ├── page.html                   # html             (reject)
    ├── intro.mp4                   # video            (reject)
    ├── theme.mp3                   # audio            (reject)
    ├── captions.vtt                # text-track       (reject)
    ├── data.json                   # data             (reject)
    ├── font.woff2                  # font             (reject)
    └── doc.pdf                     # document         (reject)
```

**Source files** (imported *into* the destinations):

`markdown/src/docs/intro.md`
```md
# Intro

Sample Markdown source.
```

`markdown/src/images/logo.png` — binary placeholder; the bytes are irrelevant (gating
and the snippet shape key on the **extension** alone). Any small valid file (or a stub)
suffices.

**Destination files** (where imports are inserted):

`markdown/notes.md`
```md
# Notes

<!-- paste / drop on the empty line below -->

```

`markdown/destinations/blank.md` — the cursor goes on the **empty line 2** (between the
heading and the body line), so a mis-honored Top would jump to the top of the file and a mis-honored
Bottom to the end — both observably wrong.
```md
# Blank doc

Body text.
```

`markdown/destinations/indented.md` — line 2 is **six spaces** (no other content); the
cursor goes at column 6 (end of the spaces).
```md
# Indented
      
End.
```

`markdown/destinations/with-comments.md` — a `*` bullet run (lines 3–5), a `//` run
(lines 7–8), and a `/*` run (lines 10–11).
```md
# Doc

* alpha
* beta
* gamma

// note one
// note two

/* block one */
/* block two */
```

`markdown/destinations/with-comments.tsx` — **byte-identical** to `with-comments.md`
above (same text, `.tsx` extension), used only for the §10 contrast.
```tsx
# Doc

* alpha
* beta
* gamma

// note one
// note two

/* block one */
/* block two */
```

**Reject-source files** (`markdown/rejected/`) — content is irrelevant to gating (it
keys on extension); minimal stubs:

```
widget.ts     →  export const widget = {};
App.vue       →  <template><div /></template>
theme.css     →  :root { --brand: #0077aa; }
page.html     →  <!DOCTYPE html><html></html>
intro.mp4     →  binary placeholder
theme.mp3     →  binary placeholder
captions.vtt  →  WEBVTT
data.json     →  { "ok": true }
font.woff2    →  binary placeholder
doc.pdf       →  binary placeholder
```

---

## 1 — Cross-import gating matrix

`.md` is an **allow-list** destination accepting `MARKDOWN_SUPPORTED_EXTENSIONS` =
`.md` + the seven image extensions. Accepted sources produce an import; every other
source raises `Auto Import: Cannot import .<src> into .md files.` and inserts nothing.
For each row: in the Explorer select the source, focus `markdown/notes.md`, and
**`Alt+D`** (or copy the source then `Cmd+I`).

**Accepted (2 source buckets)** — each routes to its branch (full inserted strings in §2):

- [ ] `markdown/src/docs/intro.md` (`.md`, **markdown**) → inserts a `[text](…)` link ✅
      *(`.md` accepts its **own** extension — there is **no** `.md`→`.md` rejection, unlike `.html`→`.html`)*
- [ ] `markdown/src/images/logo.png` (`.png`, **image**) → inserts an `![alt-text](…)` image ✅
      *(the other six image exts `.gif` / `.jpeg` / `.jpg` / `.svg` / `.avif` / `.webp` are accepted identically)*

**Rejected** — toast `Auto Import: Cannot import .<src> into .md files.`, nothing inserted:

- [ ] `markdown/rejected/widget.ts` (`.ts`) → `Auto Import: Cannot import .ts into .md files.`
      *(the other scripts `.tsx` / `.mdx` / `.js` / `.jsx` reject identically — `.md` accepts **no** script source)*
- [ ] `markdown/rejected/App.vue` (`.vue`) → `Auto Import: Cannot import .vue into .md files.`
      *(`.svelte` / `.astro` reject identically)*
- [ ] `markdown/rejected/theme.css` (`.css`) → `Auto Import: Cannot import .css into .md files.`
      *(`.scss` rejects identically — `.md` accepts **no** stylesheet, even `.css`, unlike `.html`/`.scss`)*
- [ ] `markdown/rejected/page.html` (`.html`) → `Auto Import: Cannot import .html into .md files.`
- [ ] `markdown/rejected/intro.mp4` (`.mp4`, **video**) → `Auto Import: Cannot import .mp4 into .md files.`
      *(`.webm` / `.mov` reject identically — **media is rejected**, unlike `.html`)*
- [ ] `markdown/rejected/theme.mp3` (`.mp3`, **audio**) → `Auto Import: Cannot import .mp3 into .md files.`
      *(`.ogg` / `.wav` / `.m4a` reject identically)*
- [ ] `markdown/rejected/captions.vtt` (`.vtt`, **text-track**) → `Auto Import: Cannot import .vtt into .md files.`
      *(**`.vtt` is rejected**, unlike `.html`)*
- [ ] `markdown/rejected/data.json` (`.json`, **data**) → `Auto Import: Cannot import .json into .md files.`
      *(`.yaml` / `.yml` reject identically — **data is rejected**, unlike `.vue`/`.svelte`/`.astro`)*
- [ ] `markdown/rejected/font.woff2` (`.woff2`, **font**) → `Auto Import: Cannot import .woff2 into .md files.`
      *(`.woff` / `.ttf` / `.eot` reject identically)*
- [ ] `markdown/rejected/doc.pdf` (`.pdf`, **document**) → `Auto Import: Cannot import .pdf into .md files.`

> There is deliberately **no `.md`→`.md` rejection row** — `.md` is the counter-case to
> `.html`. `gating.ts` carries an explicit `.html`→`.html` reject clause but **none**
> for `.md`, and `MARKDOWN_SUPPORTED_EXTENSIONS` lists `.md` itself.

---

## 2 — Paste as Import (happy path)

One case per source-type branch, at the **default style**. Open `markdown/notes.md`,
put the cursor on the empty line below the comment, copy the source (`Cmd+Shift+A` in
the Explorer), then `Cmd+I`. Verify the **exact** inserted string. Undo (`Cmd+Z`) after
each — both cases paste into the same `notes.md`.

- [ ] **markdown** — `markdown/src/docs/intro.md` → `[${1:text}](./src/docs/intro.md)` · **1 tab stop** (`${1:text}`) — the fixed link shape (hardcoded, not a configurable style)
- [ ] **image** — `markdown/src/images/logo.png` → `![${1:alt-text}](./src/images/logo.png)` · **1 tab stop** (`${1:alt-text}`) — image style 0 (default)

> Both paths keep their **full extension** (`.md`, `.png`) — `.md` never strips it.

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Open `markdown/notes.md`, cursor on the empty line below the comment. In the
      Explorer select `markdown/src/images/logo.png` and press **`Alt+D`** → inserts the
      §2 happy-path string `![${1:alt-text}](./src/images/logo.png)` into the active editor
      (copy + paste in one gesture).

---

## 4 — All styles per source-type arm

`.md` has **two** source-type arms. The **markdown** arm is a single fixed link (no
setting). The **image** arm has **3** configurable styles via
`markup.markdownImageImportStyle`. For the image styles, set the setting, paste
`markdown/src/images/logo.png` into `markdown/notes.md`, verify the **literal inserted
string** and **tab-stop layout**, then Undo (`Cmd+Z`) and restore the setting.

### Markdown arm — fixed link (no setting), source `markdown/src/docs/intro.md`

- [ ] **fixed** `[${1:text}](./src/docs/intro.md)` · **1 tab stop** (`${1:text}`) — hardcoded;
      `markdownImportStyle` is a dormant single-entry table and is never read at runtime.

### Image arm — `markdownImageImportStyle` (3 styles), source `markdown/src/images/logo.png`

- [ ] **0** `![${1:alt-text}](./src/images/logo.png)` · **1 tab stop** (`${1:alt-text}`) — *default*
- [ ] **1** `![${1:alt-text}](./src/images/logo.png "${2:Hover text}")` · **2 tab stops** (`${1:alt-text}` → `${2:Hover text}`)
      — set `markdownImageImportStyle` = `![alt-text](_relativePath_ "Hover text")`
- [ ] **2** `<img src="./src/images/logo.png" alt="$1" width="$2" height="$3">` · **3 tab stops** (`$1` alt → `$2` width → `$3` height)
      — set `markdownImageImportStyle` = `<img src="_relativePath_" alt="" width="" height="">`

### Always-keep-extension

> **Note (no test case).** `.md` reads **no** preserve-extension setting — the path
> **always** keeps the full source extension (`.md`, `.png`, …). The
> `preserveScriptFileExtension` toggle has **no effect** here, so there is no
> preserve-toggle case to run.

### Style-name drift (config drift, distinct from style-count)

- [ ] Set `markdownImageImportStyle` to a string matching **no** enum value (e.g. hand-type
      `"banana"` into `settings.json`), paste `markdown/src/images/logo.png` → the import
      still inserts using the **image style-0 shape** `![${1:alt-text}](./src/images/logo.png)`
      (the builder `default:` arm), **never nothing**. Restore the setting.
- [ ] *(For contrast — no setting to break.)* The **markdown-link** arm is hardcoded and reads
      no style setting, so it is **immune** to style-name drift; `[${1:text}](…)` is unaffected.

---

## 5 — Smart identifier behavior

**§5 (Smart identifier) — N/A for `.md`: no exported-class detection, no Angular
PascalCase.** `.md` has `smartId: none`; no PascalCase-fill or exported-class case
appears anywhere in this checklist.

---

## 6 — Placement (`forced-cursor`)

`.md` uses **forced-cursor** placement: the `importStatementPlacement` setting has
**no effect** — every mode inserts at the **cursor line**, and the **column follows
the cursor** (it is *not* forced to column 0, unlike script/stylesheet destinations).
A trailing newline is appended (the link is a standalone line).

**Setting has no effect** — using `markdown/destinations/blank.md`, cursor on the
**empty line 2** (between the heading and `Body text.`), paste `markdown/src/images/logo.png`
(inserts `![${1:alt-text}](../src/images/logo.png)`). Undo (`Cmd+Z`) and re-place the
cursor on the empty line 2 between each mode, so every mode starts from the same state:

- [ ] `importStatementPlacement` = **Top** → import lands at the **cursor line** (line 2, **NOT** the top of the file above the heading)
- [ ] `importStatementPlacement` = **Bottom** → import lands at the **cursor line** (line 2, **NOT** after `Body text.` / end of file)
- [ ] `importStatementPlacement` = **Cursor** → import lands at the **cursor line** (line 2)
- [ ] All three produce the **same** result → confirms the setting is ignored. Restore to `Bottom`.

**Column follows the cursor** — using `markdown/destinations/indented.md`:

- [ ] Put the cursor at **column 6** (end of the six spaces on line 2), paste
      `markdown/src/images/logo.png` → the `![${1:alt-text}](../src/images/logo.png)` is
      inserted **at column 6** (indented six spaces), **not** flush to column 0. `Cmd+Z`.
      *(A script/stylesheet destination would force column 0; `.md` does not.)*

**Markdown-star quirk** — using `markdown/destinations/with-comments.md`, paste
`markdown/src/images/logo.png` (`Cmd+Z` after each):

- [ ] **`*` bullet — lands at it.** Cursor on `* beta` (line 4) → the import inserts **at
      line 4** (between `* alpha` and `* beta`); the `*` bullet run is **not** treated as a
      comment block, so the import is **not** pushed above `* alpha`. *(A leading `*` is
      content in Markdown — bullets / `*italic*` / `**bold**` / `***`.)*
- [ ] **`//` run — pushed above.** Cursor on `// note two` (line 8) → the import is
      relocated **above** the contiguous `//` run (above `// note one`, line 7). *(`//` is
      still recognized as a comment in `.md`.)*
- [ ] **`/*` run — pushed above.** Cursor on `/* block two */` (line 11) → the import is
      relocated **above** the contiguous `/*` run (above `/* block one */`, line 10). *(Only
      a leading `*` is reclassified as content; `//` and `/*` are unchanged.)*

---

## 7 — Paste as Import (Pick Style) — DELTA

Command Palette → `Auto Import: Paste as Import (Pick Style)`; QuickPick placeholder
**`Select an import style`**. For each style item, the **LABEL** is the snippet preview
built from the source **basename** (nested paths collapse — `./src/images/logo.png` →
`logo.png`), while the **inserted** text uses the **full relative path**; `$1`/`${n:…}`
render as `name`/the default text in the label. The **DESCRIPTION** is the style's **tag**
(all three image styles carry a tag — there is **no** tagless full-template fallback,
unlike `.html`'s `<img>`/`<video>`/`<audio>` style 0).

> Universal QuickPick mechanics — escape to dismiss, filter by description, clipboard
> validation, one-shot (no default written), single-variant silent insert — are
> covered by **`general.md §9`**; not retested here.

### Image — 3 items (source `markdown/src/images/logo.png`)

- [ ] **0** · LABEL `![alt-text](logo.png)` · INSERT `![${1:alt-text}](./src/images/logo.png)` · DESC `Bare inline image — most common Markdown image form`
- [ ] **1** · LABEL `![alt-text](logo.png "Hover text")` · INSERT `![${1:alt-text}](./src/images/logo.png "${2:Hover text}")` · DESC `Inline image syntax with hover-text title`
- [ ] **2** · LABEL `<img src="logo.png" alt="name" width="name" height="name">` · INSERT `<img src="./src/images/logo.png" alt="$1" width="$2" height="$3">` · DESC `HTML embed for sizing — Core Web Vitals CLS prevention`

### Single-variant (no picker shown)

- [ ] **markdown** (`.md` source `markdown/src/docs/intro.md`) → only one variant → Pick
      Style **silently inserts** `[${1:text}](./src/docs/intro.md)` with no QuickPick (the
      hardcoded link has an empty description).

---

## 8 — Set Default Import Style — DELTA

Command Palette → `Auto Import: Set Default Import Style`. On selecting a configurable
image style: info toast **`Auto Import: Default style saved — <enum value>`** and the
`markup.markdownImageImportStyle` setting now holds that **enum value string**.

> The saved toast surfaces the **enum value** (the template with `_relativePath_`), **not**
> the §7 picker **tag** — same style, two different surfaced strings. For style 2 the saved
> value is `alt="" width="" height=""` (the enum value), distinct from the inserted
> `alt="$1" width="$2" height="$3"`. Universal mechanics (placeholder `Set default import
> style`, current default spliced to position 0 with `$(check) Current default`, escape,
> filter, **never inserts**) are **`general.md §10`**.

**Configurable arm — image** (saved toast shows the enum value; setting updates):

- [ ] **image** → pick "Inline image syntax with hover-text title" →
      `Auto Import: Default style saved — ![alt-text](_relativePath_ "Hover text")`;
      `markdownImageImportStyle` = `![alt-text](_relativePath_ "Hover text")`
- [ ] **image** → pick "HTML embed for sizing…" →
      `Auto Import: Default style saved — <img src="_relativePath_" alt="" width="" height="">`;
      `markdownImageImportStyle` updated *(note the saved value is `alt=""` — the enum value —
      distinct from the inserted `alt="$1"`)*

Restore the setting afterward.

**Fixed-shape arm — markdown** (no configurable setting → `no-configurable-style`):

- [ ] **markdown** (`.md` source `markdown/src/docs/intro.md`) → `Auto Import: .md → .md
      imports use a fixed style.` — the markdown-link variant carries no `setting`, so there
      is no style offered to save.

---

## 9 — Drag-and-drop — DELTA

A drop reuses the **same** snippet + placement pipeline as paste, so the inserted
string is **byte-identical** to §2. Drag from the Explorer into the open `.md` editor
(`markdown/notes.md` for the happy path; the `destinations/*.md` fixtures for the
placement cases below).

> Universal drop mechanics are covered by **`general.md §8`**; only the `.md` delta is
> tested here.

- [ ] **(a) happy-path drop** — drag `markdown/src/images/logo.png` onto the empty line of
      `markdown/notes.md` → inserts `![${1:alt-text}](./src/images/logo.png)` (identical to §2 image).
- [ ] **(b) unsupported-pair drop** — drag `markdown/rejected/widget.ts` → toast
      `Auto Import: Cannot import .ts into .md files.` **and no import is inserted**; the
      provider returns a suppressing empty edit that out-ranks VS Code's default drop, so
      **nothing lands** (no stray path text — the same no-op as paste).
- [ ] **(c-i) setting ignored on drop** — drag `markdown/src/images/logo.png` onto the empty
      line 2 of `markdown/destinations/blank.md` under `importStatementPlacement` = **Top**,
      then **Bottom**, then **Cursor** → all three insert
      `![${1:alt-text}](../src/images/logo.png)` at the **drop line** (NOT the top of the file, NOT end of
      file). Restore the setting to `Bottom`; `Cmd+Z` after each.
- [ ] **(c-ii) column follows the drop** — drop `markdown/src/images/logo.png` onto **column 6**
      (end of the six-space line 2) of `markdown/destinations/indented.md` →
      `![${1:alt-text}](../src/images/logo.png)` inserts **at column 6**, not flush to column 0.
      `Cmd+Z`.
- [ ] **(c-iii) markdown-star at the drop** — drop `markdown/src/images/logo.png` onto the
      `* beta` line (line 4) of `markdown/destinations/with-comments.md` → the import lands
      **at that line** (the `*` bullet is content, not a comment), same as §6. `Cmd+Z`.
- [ ] **(d)** class-detect / Angular / preserve-extension on drop — **none apply** to `.md`
      (no smart identifier; extension always preserved).

> The DnD untitled/unsaved-buffer no-op precondition is tested **once for all 12
> destinations** in `typescript.md §9.10` — not repeated here.

---

## 10 — Edge cases (markdown-star vs the `.tsx` contrast)

`isCommentLine(line, isMarkdown)` reclassifies a leading `*` as **content** only when
`isMarkdown` is true. `.md` (and `.mdx`) pass `isMarkdown = true`; every other
destination — including `.tsx` — passes `false`, so the **same** `*` line behaves
**oppositely** in a byte-identical buffer.

- [ ] **`.md` — lands at the `*` line (recap).** In `markdown/destinations/with-comments.md`,
      cursor on `* beta` (line 4), paste `markdown/src/images/logo.png` → import inserts **at
      line 4** (between `* alpha` and `* beta`). *(forced-cursor; no setting needed.)* `Cmd+Z`.
- [ ] **`.tsx` — pushed above the `*` block (contrast).** Open the byte-identical
      `markdown/destinations/with-comments.tsx`, set `importStatementPlacement` = **Cursor**,
      cursor on `* beta` (line 4), paste `markdown/src/images/logo.png` (its TS/React import
      *shape* is owned by `typescript.md`/`general.md` — only the **line position** is under
      test here) → the import is relocated **above** the entire `*` run (above `* alpha`,
      line 3), because
      in `.tsx` a leading `*` **is** a comment continuation. This proves the `isMarkdown` flag
      and the **`.mdx` ≠ `.tsx`** story: `.mdx` shares the `tsx.ts` builder and is also
      `generic`/column-0, yet `.mdx` treats `*` as content (would land **at** the line, like
      `.md`) — the divergence is the comment-line flag, not the snippet builder. Restore the
      setting; `Cmd+Z`.

> **Bottom-marker false positives are N/A for `.md`.** Because `.md` is `forced-cursor`,
> it never runs Bottom placement, so the string-literal / `require(` `IMPORT_INDICATORS`
> false-positive marker edges (tested for script destinations) do **not** apply here.

---

## 11 — Sign-off

Tester: ____________________  ·  Date: ____________  ·  Extension version: __________

**Case counts** (this checklist; excludes everything owned by `general.md`):

| § | Section | Cases |
|---|---------|------:|
| 1 | Gating matrix (2 accept + 10 reject) | 12 |
| 2 | Happy path (one per source branch) | 2 |
| 3 | Insert from Selected File (`Alt+D`) | 1 |
| 4 | All styles (1 markdown + 3 image + 2 name-drift) | 6 |
| 5 | Smart identifier — **N/A** (omitted) | 0 |
| 6 | Placement — `forced-cursor` (3 setting + 1 same + 1 column + 3 comment) | 8 |
| 7 | Pick Style (3 image + 1 single-variant) | 4 |
| 8 | Set Default (2 image configurable + 1 fixed) | 3 |
| 9 | Drag-and-drop (a/b/c-i…iii/d) | 6 |
| 10 | Edge cases (markdown-star vs `.tsx`) | 2 |
| | **Total** | **44** |

- [ ] All cases above pass on the target build.
