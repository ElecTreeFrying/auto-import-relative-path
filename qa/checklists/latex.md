# QA Checklist — `.tex` destination

> **These `[ ]` boxes are for the human tester** running the Extension Development
> Host (press **F5**). Tick them as you verify each case by hand. (They are *not*
> generation tasks.)
>
> **Assumes `general.md` has already passed.** This checklist tests only the
> `.tex`-specific **DELTA**. It does **not** re-test cross-destination behavior that
> `general.md` owns — Copy File Path, clipboard validation, same-file rejection,
> notification wording + toast buttons, path computation, and the *universal*
> mechanics of Drag-and-drop (`general.md §8`), Paste as Import / Pick Style
> (`general.md §9`), and Set Default Import Style (`general.md §10`). Where a section
> below has both universal and `.tex`-specific parts, only the delta is tested and a
> one-line cross-reference points at the owning `general.md` section.
>
> **No LaTeX extension required.** VS Code ships no LaTeX language, so a `.tex` file may
> open as plaintext; the drop fires by **file pattern** (`**/*.tex`) regardless, and the
> paste commands key off `path.extname` — so every case below works with or without a
> LaTeX extension installed.

## `.tex` at a glance

| Aspect | Behavior |
|--------|----------|
| **Gating** | Allow-list (`TEX_SUPPORTED_EXTENSIONS` = `.tex` `.bib` + graphics `.pdf` `.png` `.jpg` `.jpeg` `.eps`). **Web images `.svg`/`.gif`/`.webp`/`.avif` are rejected** — `pdflatex` can't render them. |
| **Styles** | **3-way source-extension dispatch.** graphics → `TEX_GRAPHICS_IMPORT_OPTIONS` (3: `figure` / sized / bare); `.tex` → `TEX_INPUT_IMPORT_OPTIONS` (2: `\input` / `\include`); `.bib` → `TEX_BIBLIOGRAPHY_IMPORT_OPTIONS` (2: `\addbibresource` / `\bibliography`). All three arms are **configurable** (its own `latex.*` namespace — no fixed/hardcoded shapes). |
| **Default style** | Index **0** for each arm: graphics → a multi-line `figure` float; `.tex` → `\input{…}`; `.bib` → `\addbibresource{….bib}`. The `figure` default is the **only multi-line snippet in the extension**. |
| **Smart identifier** | **None** — no exported-class detection, no Angular PascalCase. (See the §5 marker.) |
| **Placement** | **`forced-cursor`.** Top/Bottom/Cursor all insert at the **cursor line** (the setting has no effect); the **column follows the cursor** (not forced to 0). The import lands in the **body** — the top of the file is the LaTeX preamble. |
| **Path** | **graphics** keep the extension by default (`preserveGraphicsFileExtension`, default **on** — inverted from the script/stylesheet toggles); **`.tex`** sources always drop `.tex`; **`.bib`** is per-style (`\addbibresource` keeps `.bib`, `\bibliography` drops it). |

## Gestures

| Gesture | Trigger |
|---------|---------|
| Copy File Path | **`Cmd+Shift+A`** (mac) / `Ctrl+Shift+A` — or Command Palette → `Auto Import: Copy File Path` |
| Paste as Import | **`Cmd+I`** (mac) / `Ctrl+I` — or Command Palette → `Auto Import: Paste as Import` |
| Insert Import from Selected File | **`Alt+D`** with the file selected in the Explorer — or Command Palette → `Auto Import: Insert Import from Selected File` |
| Paste as Import (Pick Style) | Command Palette → `Auto Import: Paste as Import (Pick Style)` (also the **Paste with Style** button on the copy-success toast) |
| Set Default Import Style | Command Palette → `Auto Import: Set Default Import Style` |
| Drag-and-drop | Drag a file from the Explorer and drop it into the open `.tex` editor |

Settings referenced (in `settings.json` or the Settings UI):

- `auto-import.preferences.importStatementPlacement` — `Top` / `Bottom` / `Cursor` (default `Bottom`; **ignored** for `.tex`).
- `auto-import.importStatement.latex.graphicsImportStyle` (3 enum values; default the `figure` float).
- `auto-import.importStatement.latex.inputImportStyle` (2; default `\input{_relativePath_}`).
- `auto-import.importStatement.latex.bibliographyImportStyle` (2; default `\addbibresource{_relativePath_}`).
- `auto-import.importStatement.latex.preserveGraphicsFileExtension` — boolean (default **`true`/keep**).

**Resetting between cases.** After any case that mutates a file, press **`Cmd+Z`** to
restore it before the next case; after any case that changes a setting, restore the
setting to its default. (Every paste/drop case below mutates the destination buffer.)

## Fixtures — `qa/workspace/latex/`

```
latex/
├── main.tex                       # primary destination (happy path / styles / picker / set-default / DnD)
├── src/
│   ├── figures/plot.png           # graphics source     (.png)
│   ├── figures/plot.pdf           # graphics source     (.pdf)
│   ├── figures/diagram.eps        # graphics source     (.eps)
│   ├── chapters/intro.tex         # .tex source         (\input / \include)
│   └── refs.bib                   # .bib source         (\addbibresource / \bibliography)
├── destinations/
│   ├── blank.tex                  # placement: empty body line
│   ├── indented.tex               # placement: cursor at a non-zero column
│   └── with-comments.tex          # edge: LaTeX % comment is not recognized
└── rejected/
    ├── icon.svg   anim.gif        # web images (reject — not pdflatex-renderable)
    ├── photo.webp banner.avif     # web images (reject)
    ├── widget.ts  App.vue         # script / framework (reject)
    ├── theme.css  page.html       # stylesheet / markup (reject)
    ├── notes.md   data.json       # markdown / data (reject)
    └── font.woff2 clip.mp4 captions.vtt   # font / media / text-track (reject)
```

**Source files** (imported *into* the destinations):

`latex/src/chapters/intro.tex`
```latex
\section{Introduction}
This is an included chapter.
```

`latex/src/refs.bib`
```bibtex
@article{sample2026,
  author  = {A. Author},
  title   = {A Sample Entry},
  journal = {Journal of Examples},
  year    = {2026},
}
```

`latex/src/figures/plot.png`, `latex/src/figures/plot.pdf`, `latex/src/figures/diagram.eps`
— binary placeholders; the bytes are irrelevant (gating and the snippet shape key on the
**extension** alone). Any small valid file (or a stub) suffices.

**Destination files** (where imports are inserted):

`latex/main.tex`
```latex
\documentclass{article}
\usepackage{graphicx}
\begin{document}

% paste / drop on the empty line below

\end{document}
```

`latex/destinations/blank.tex`
```latex
\documentclass{article}
\begin{document}

\end{document}
```

`latex/destinations/indented.tex` — line 4 is **six spaces** (no other content); the
cursor goes at column 6 (end of the spaces).
```latex
\documentclass{article}
\begin{document}
\section{Body}
      
\end{document}
```

`latex/destinations/with-comments.tex`
```latex
\documentclass{article}
\begin{document}
% section marker
\section{Body}
\end{document}
```

**Reject-source files** (`latex/rejected/`) — content is irrelevant to gating (it keys
on extension); minimal stubs:

```
icon.svg      →  <svg xmlns="http://www.w3.org/2000/svg"></svg>
anim.gif      →  binary placeholder
photo.webp    →  binary placeholder
banner.avif   →  binary placeholder
widget.ts     →  export const widget = {};
App.vue       →  <template><div /></template>
theme.css     →  :root { --brand: #0077aa; }
page.html     →  <!DOCTYPE html><html></html>
notes.md      →  # Notes
data.json     →  { "ok": true }
font.woff2    →  binary placeholder
clip.mp4      →  binary placeholder
captions.vtt  →  WEBVTT
```

---

## 1 — Cross-import gating matrix

`.tex` is an **allow-list** destination. Accepted sources produce an import; every
other source raises `Auto Import: Cannot import .<src> into .tex files.` and inserts
nothing. For each row: in the Explorer select the source, focus `latex/main.tex`,
and **`Alt+D`** (or copy the source then `Cmd+I`).

**Accepted (3 source buckets)** — each routes to its branch (full inserted strings in §2):

- [ ] `latex/src/figures/plot.png` (`.png`, **graphics**) → inserts a `figure` float ✅
      *(`.pdf` / `.jpg` / `.jpeg` / `.eps` accept identically — all `TEX_GRAPHICS_FILE_EXTENSIONS`)*
- [ ] `latex/src/figures/plot.pdf` (`.pdf`, **graphics**) → inserts a `figure` float ✅
      *(confirms `.pdf` is accepted here — unlike every other allow-list destination, which rejects it)*
- [ ] `latex/src/chapters/intro.tex` (`.tex`, **file include**) → inserts `\input{…}` ✅
- [ ] `latex/src/refs.bib` (`.bib`, **bibliography**) → inserts `\addbibresource{…}` ✅

**Rejected** — toast `Auto Import: Cannot import .<src> into .tex files.`, nothing inserted:

- [ ] `latex/rejected/icon.svg` (`.svg`) → `Auto Import: Cannot import .svg into .tex files.`
      *(`pdflatex` cannot render `.svg` — needs the `svg` package + Inkscape + shell-escape)*
- [ ] `latex/rejected/anim.gif` (`.gif`) → `Auto Import: Cannot import .gif into .tex files.`
- [ ] `latex/rejected/photo.webp` (`.webp`) → `Auto Import: Cannot import .webp into .tex files.`
- [ ] `latex/rejected/banner.avif` (`.avif`) → `Auto Import: Cannot import .avif into .tex files.`
      *(`.svg`/`.gif`/`.webp`/`.avif` are the web-image formats rejected here — the graphics set is the `pdflatex`-renderable `.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps` only)*
- [ ] `latex/rejected/widget.ts` (`.ts`) → `Auto Import: Cannot import .ts into .tex files.`
      *(`.tsx` / `.js` / `.jsx` / `.mdx` reject identically)*
- [ ] `latex/rejected/App.vue` (`.vue`) → `Auto Import: Cannot import .vue into .tex files.`
      *(`.svelte` / `.astro` reject identically)*
- [ ] `latex/rejected/theme.css` (`.css`) → `Auto Import: Cannot import .css into .tex files.`
      *(`.scss` rejects identically)*
- [ ] `latex/rejected/page.html` (`.html`) → `Auto Import: Cannot import .html into .tex files.`
- [ ] `latex/rejected/notes.md` (`.md`) → `Auto Import: Cannot import .md into .tex files.`
- [ ] `latex/rejected/data.json` (`.json`) → `Auto Import: Cannot import .json into .tex files.`
      *(`.yaml` / `.yml` reject identically)*
- [ ] `latex/rejected/font.woff2` (`.woff2`) → `Auto Import: Cannot import .woff2 into .tex files.`
      *(`.woff` / `.ttf` / `.eot` reject identically)*
- [ ] `latex/rejected/clip.mp4` (`.mp4`) → `Auto Import: Cannot import .mp4 into .tex files.`
      *(all video/audio reject identically)*
- [ ] `latex/rejected/captions.vtt` (`.vtt`) → `Auto Import: Cannot import .vtt into .tex files.`

---

## 2 — Paste as Import (happy path)

One case per source-extension branch, at the **default style (index 0)**. Open
`latex/main.tex`, put the cursor on the empty line inside `document`, copy the source
(`Cmd+Shift+A` in the Explorer), then `Cmd+I`. Verify the **exact** inserted string.
Undo (`Cmd+Z`) after each — all three cases paste into the same `main.tex`.

- [ ] **graphics** — `latex/src/figures/plot.png` → the **multi-line** `figure` float (six lines), **tab stops `${1:caption}` → `${2:label}`**:
      ```latex
      \begin{figure}[htbp]
          \centering
          \includegraphics[width=0.5\textwidth]{./src/figures/plot.png}
          \caption{${1:caption}}
          \label{fig:${2:label}}
      \end{figure}
      ```
      *(graphics keep the `.png` extension by default; `\caption` is emitted **before** `\label` so `\ref` resolves to the figure number)*
- [ ] **file include** — `latex/src/chapters/intro.tex` → `\input{./src/chapters/intro}` · *no tab stop* — the `.tex` extension is **dropped**
- [ ] **bibliography** — `latex/src/refs.bib` → `\addbibresource{./src/refs.bib}` · *no tab stop* — keeps the `.bib` extension

> The `figure` is the **only multi-line shape** in the whole extension; it is inserted as one block
> at the cursor line and VS Code re-indents the interior lines to the insertion column.

---

## 3 — Insert Import from Selected File (`Alt+D`)

- [ ] Open `latex/main.tex`, cursor on the empty `document` line. In the Explorer
      select `latex/src/figures/plot.png` and press **`Alt+D`** → inserts the §2 happy-path
      `figure` float into the active editor (copy + paste in one gesture).

---

## 4 — All styles per source-extension arm

Set the relevant `latex.*ImportStyle` setting, paste `plot.png` / `intro.tex` / `refs.bib`
into `latex/main.tex`, verify the **literal inserted string** and **tab-stop layout**, then
Undo (`Cmd+Z`) the paste and restore the setting. All 7 style cases paste into the same `main.tex`.

### Graphics — `graphicsImportStyle` (3 styles), source `latex/src/figures/plot.png`

- [ ] **0** the multi-line `figure` float (below) · **2 tab stops `${1:caption}` → `${2:label}`** — *default*
      ```latex
      \begin{figure}[htbp]
          \centering
          \includegraphics[width=0.5\textwidth]{./src/figures/plot.png}
          \caption{${1:caption}}
          \label{fig:${2:label}}
      \end{figure}
      ```
- [ ] **1** `\includegraphics[width=${1:0.5}\textwidth]{./src/figures/plot.png}` · **1 tab stop** (`${1:0.5}` = width fraction)
- [ ] **2** `\includegraphics{./src/figures/plot.png}` · *no tab stop*

### File include — `inputImportStyle` (2 styles), source `latex/src/chapters/intro.tex`

- [ ] **0** `\input{./src/chapters/intro}` · *no tab stop* — *default* (`.tex` dropped)
- [ ] **1** `\include{./src/chapters/intro}` · *no tab stop* (`.tex` dropped — `\include` requires it)

### Bibliography — `bibliographyImportStyle` (2 styles), source `latex/src/refs.bib`

- [ ] **0** `\addbibresource{./src/refs.bib}` · *no tab stop* — *default* (**keeps** `.bib`)
- [ ] **1** `\bibliography{./src/refs}` · *no tab stop* (**drops** `.bib`)

### Graphics extension preservation — `preserveGraphicsFileExtension` (default **on**)

> The **third** preserve namespace — default **`true`/keep**, *inverted* from
> `preserveScriptFileExtension` / `preserveStylesheetFileExtension` (both default off/strip).
> Applies to **graphics only** (`.tex` always drops; `.bib` is per-style above). Test with the
> bare style (graphics **2**) so the path is isolated:

- [ ] **on** (default) — paste `plot.png` → `\includegraphics{./src/figures/plot.png}` (extension **kept**)
- [ ] **off** — set `latex.preserveGraphicsFileExtension` = `false`, paste `plot.png` →
      `\includegraphics{./src/figures/plot}` (extension **dropped**). Restore the setting to `true`.

### Style-name drift (config drift, distinct from style-count)

- [ ] Set `graphicsImportStyle` to a string matching **no** enum value (e.g. hand-type
      `"banana"` into `settings.json`), paste `plot.png` → the import still inserts using the
      **style-0 shape** (the multi-line `figure` float, the builder `default:` arm), **never
      nothing**. Restore the setting.

---

## 5 — Smart identifier behavior

**§5 (Smart identifier) — N/A for `.tex`: no exported-class detection, no Angular
PascalCase.** `.tex` has `smartId: none`; no PascalCase-fill or exported-class case
appears anywhere in this checklist.

---

## 6 — Placement (`forced-cursor`)

`.tex` uses **forced-cursor** placement: the `importStatementPlacement` setting has
**no effect** — every mode inserts at the **cursor line**, and the **column follows the
cursor** (it is *not* forced to column 0). The import lands in the document **body**;
the top of the file is the LaTeX preamble. A trailing newline is appended. (Use the single-line
`\input` shape here for clean assertions; the multi-line `figure`'s placement is §10.)

**Setting has no effect** — using `latex/destinations/blank.tex`, cursor on the empty
body line, paste `latex/src/chapters/intro.tex` (inserts `\input{../src/chapters/intro}`).
Undo (`Cmd+Z`) and re-place the cursor on the empty body line between each mode:

- [ ] `importStatementPlacement` = **Top** → import lands at the **cursor line** (NOT the top of the file / the preamble)
- [ ] `importStatementPlacement` = **Bottom** → import lands at the **cursor line** (NOT after the last import / end of body)
- [ ] `importStatementPlacement` = **Cursor** → import lands at the **cursor line**
- [ ] All three produce the **same** result → confirms the setting is ignored. Restore to `Bottom`.

**Column follows the cursor** — using `latex/destinations/indented.tex`:

- [ ] Put the cursor at **column 6** (end of the six spaces on line 4), paste `intro.tex` →
      `\input{../src/chapters/intro}` is inserted **at column 6** (indented six spaces), **not**
      flush to column 0. `Cmd+Z`. *(A script/stylesheet destination would force column 0; `.tex` does not.)*

---

## 7 — Paste as Import (Pick Style) — DELTA

Command Palette → `Auto Import: Paste as Import (Pick Style)`; QuickPick placeholder
**`Select an import style`**. For each style item, the **LABEL** is the snippet preview
built from the source **basename** (nested paths collapse — `./src/figures/plot.png` →
`plot.png`), while the **inserted** text uses the **full relative path**; `${n:…}` render
as their default text, and the multi-line `figure` LABEL is **collapsed to one line**
(`variants.ts:renderLabel`). The **DESCRIPTION** is the style's tag (every LaTeX style has one).

> Universal QuickPick mechanics — escape to dismiss, filter by description, clipboard
> validation, one-shot (no default written), single-variant silent insert — are
> covered by **`general.md §9`**; not retested here.

### Graphics — 3 items (source `latex/src/figures/plot.png`)

- [ ] **0** · LABEL `\begin{figure}[htbp] \centering \includegraphics[width=0.5\textwidth]{plot.png} \caption{caption} \label{fig:label} \end{figure}` (one line) · INSERT the multi-line `figure` block with `{./src/figures/plot.png}` · DESC `Figure float — centered, sized, with caption and label`
- [ ] **1** · LABEL `\includegraphics[width=0.5\textwidth]{plot.png}` · INSERT `\includegraphics[width=${1:0.5}\textwidth]{./src/figures/plot.png}` · DESC `Sized graphic — width as a fraction of \textwidth, no float`
- [ ] **2** · LABEL `\includegraphics{plot.png}` · INSERT `\includegraphics{./src/figures/plot.png}` · DESC `Bare graphic — natural size, no float`

### File include — 2 items (source `latex/src/chapters/intro.tex`)

- [ ] **0** · LABEL `\input{intro}` · INSERT `\input{./src/chapters/intro}` · DESC `Inline include — \input (no page break)`
- [ ] **1** · LABEL `\include{intro}` · INSERT `\include{./src/chapters/intro}` · DESC `Chapter include — \include (page break, \includeonly-able)`

### Bibliography — 2 items (source `latex/src/refs.bib`)

- [ ] **0** · LABEL `\addbibresource{refs.bib}` · INSERT `\addbibresource{./src/refs.bib}` · DESC `Modern biblatex — \addbibresource (keeps .bib)`
- [ ] **1** · LABEL `\bibliography{refs}` · INSERT `\bibliography{./src/refs}` · DESC `Legacy BibTeX — \bibliography (drops .bib)`

> **No single-variant / fixed-shape arm** — unlike `.html`/`.md`, every LaTeX source bucket has a
> multi-entry style table, so the picker always shows (graphics 3 / `.tex` 2 / `.bib` 2 items).

---

## 8 — Set Default Import Style — DELTA

Command Palette → `Auto Import: Set Default Import Style`. On selecting a style: info toast
**`Auto Import: Default style saved — <enum value>`** and the matching `latex.*ImportStyle`
setting now holds that **enum value string**.

> The saved toast surfaces the **enum value** (the template with `_relativePath_`), **not** the
> §7 picker tag. Universal mechanics (placeholder `Set default import style`, current default
> spliced to position 0 with `$(check) Current default`, escape, filter, **never inserts**) are
> **`general.md §10`**. All three LaTeX arms are configurable — there is **no** `no-configurable-style`
> case (contrast `.html`'s `<link>`/`<track>`).

- [ ] **graphics** → pick "Sized graphic…" → `Auto Import: Default style saved — \includegraphics[width=0.5\textwidth]{_relativePath_}`; `latex.graphicsImportStyle` = that value
- [ ] **file include** → pick "Chapter include…" → `Auto Import: Default style saved — \include{_relativePath_}`; `latex.inputImportStyle` = `\include{_relativePath_}`
- [ ] **bibliography** → pick "Legacy BibTeX…" → `Auto Import: Default style saved — \bibliography{_relativePath_}`; `latex.bibliographyImportStyle` = `\bibliography{_relativePath_}`

Restore each setting afterward.

---

## 9 — Drag-and-drop — DELTA

A drop reuses the **same** snippet + placement pipeline as paste, so the inserted
string is **byte-identical** to §2. Drag from the Explorer into the open `.tex` editor
(`latex/main.tex` for the happy path; the `destinations/*.tex` fixtures for the
placement cases below).

> Universal drop mechanics are covered by **`general.md §8`**; only the `.tex` delta
> is tested here.

- [ ] **(a) happy-path drop** — drag `latex/src/figures/plot.png` onto the empty `document`
      line → inserts the multi-line `figure` float (identical to §2 graphics).
- [ ] **(b) unsupported-pair drop** — drag `latex/rejected/icon.svg` → toast
      `Auto Import: Cannot import .svg into .tex files.` **and no import is inserted**; the
      provider returns a suppressing empty edit that out-ranks VS Code's default drop, so
      **nothing lands** (no stray path text — the same no-op as paste).
- [ ] **(c-i) setting ignored on drop** — drag `latex/src/chapters/intro.tex` onto the empty
      body line of `latex/destinations/blank.tex` under `importStatementPlacement` =
      **Top**, then **Bottom**, then **Cursor** → all three insert
      `\input{../src/chapters/intro}` at the **drop line** (NOT the top of the file, NOT end of body).
      Restore the setting to `Bottom`; `Cmd+Z` after each.
- [ ] **(c-ii) column follows the drop** — drop `intro.tex` onto **column 6** (end of the
      six-space line 4) of `latex/destinations/indented.tex` → `\input{../src/chapters/intro}`
      inserts **at column 6**, not flush to column 0. `Cmd+Z`.
- [ ] **(c-iii) LaTeX `%` comment — lands at it** — drop `intro.tex` onto the
      `% section marker` line of `latex/destinations/with-comments.tex` → the `\input` inserts
      **at that line** (`%` is not recognized as a comment marker), same as §10. `Cmd+Z`.
- [ ] **(d) preserve-extension on drop** — with `latex.preserveGraphicsFileExtension` = `false`
      and `graphicsImportStyle` = bare (style 2), drop `plot.png` onto `main.tex` →
      `\includegraphics{./src/figures/plot}` (extension dropped on drop, same as §4). Restore both. *(No class-detect / Angular applies — `.tex` has no smart identifier.)*

> The DnD untitled/unsaved-buffer no-op precondition is tested **once for all 13
> destinations** in `typescript.md §9.10` — not repeated here.

---

## 10 — Edge cases (multi-line figure + comment-marker mismatch)

- [ ] **Multi-line `figure` insertion.** Paste `latex/src/figures/plot.png` (default graphics
      style) onto the empty body line of `latex/main.tex` → the **six-line** block lands as one
      unit at the cursor line; the interior `\centering` / `\includegraphics` / `\caption` /
      `\label` lines are indented (VS Code re-indents to the insertion column), and the cursor
      lands on the first tab stop `${1:caption}`, then `Tab` → `${2:label}`. This is the only
      multi-line shape in the extension. `Cmd+Z`.
- [ ] **LaTeX `%` comment — not recognized.** `isCommentLine` recognizes `//`, `/*`, `*` but
      **not** LaTeX's `%`. Cursor on the `% section marker` line of
      `latex/destinations/with-comments.tex`, paste `intro.tex` → the `\input` inserts **at that
      line** (the `%` line is **not** treated as a comment, so the import is **not** pushed above
      it — the same behavior as HTML's `<!-- -->` in `html.md §10`). `Cmd+Z`.

---

## 11 — Sign-off

Tester: ____________________  ·  Date: ____________  ·  Extension version: __________

**Case counts** (this checklist; excludes everything owned by `general.md`):

| § | Section | Cases |
|---|---------|------:|
| 1 | Gating matrix (4 accept + 13 reject) | 17 |
| 2 | Happy path (one per source branch) | 3 |
| 3 | Insert from Selected File (`Alt+D`) | 1 |
| 4 | All styles (3+2+2 + preserve-toggle on/off + name-drift) | 10 |
| 5 | Smart identifier — **N/A** (omitted) | 0 |
| 6 | Placement — `forced-cursor` (3 setting + 1 column) | 5 |
| 7 | Pick Style (3+2+2) | 7 |
| 8 | Set Default (3 configurable, no fixed-shape arm) | 3 |
| 9 | Drag-and-drop (a/b/c-i/c-ii/c-iii/d) | 6 |
| 10 | Edge cases (multi-line figure + `%`-comment) | 2 |
| | **Total** | **54** |

- [ ] All cases above pass on the target build.
