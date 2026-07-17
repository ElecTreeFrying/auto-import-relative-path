# qa/workspace/latex/CLAUDE.md

Fixtures for `checklists/latex.md` — the `.tex` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `latex.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `latex.md`.

## Subdirectories

| Location | Purpose |
|----------|---------|
| root | `main.tex` — the primary paste/drop/picker/set-default/DnD target. Sits at the root so its §2 happy-path inserts read `./src/…`. Holds a `% paste / drop on the empty line below` marker above an empty target line; **undo after each paste** so the buffer returns to its expected state. |
| `src/figures/` | The graphics sources (`plot.png`, `plot.pdf`, `diagram.eps`) → `figure` float / `\includegraphics`. `plot.png` is the most-referenced source (figure, preserve-toggle §4, drop §9, multi-line edge §10); `plot.pdf` exists to prove `.pdf` is **accepted** as a LaTeX graphics source (it is rejected by every *other* allow-list destination); `diagram.eps` covers the classic vector format. All three are empty placeholders — gating keys on the extension. |
| `src/chapters/` | `intro.tex` — the file-include source (`.tex` → `\input`/`\include`, extension dropped). The **single-line** placement + drop source (§6/§9), used in preference to the multi-line `figure` for clean cursor/column assertions. |
| `src/` (`refs.bib`) | The bibliography source (`.bib` → `\addbibresource` keeps `.bib`, `\bibliography` drops it). |
| `destinations/` | Pre-filled `.tex` placement targets, one level deep (so paste inserts resolve as `../src/…`). `blank.tex` (empty body line), `indented.tex` (line 4 = **exactly six spaces** — the column-follows-cursor test), `with-comments.tex` (a LaTeX `% comment` line, which `isCommentLine` does **not** recognize). **Undo after each paste.** |
| `rejected/` | One source per rejected extension for allow-list gating. Content is irrelevant — only the extension matters. The web-image stubs (`icon.svg`, `anim.gif`, `photo.webp`, `banner.avif`) are the **LaTeX-distinctive** rejects: `pdflatex` can't render them, so they are gate-rejected even though every *other* image-accepting destination takes them. `icon.svg` also drives the unsupported-pair drop (§9b). |

## Fixture content expectations

- **Source files (`src/chapters/intro.tex`, `src/refs.bib`)** — content is cosmetic (any valid file of that type); they are imported, never edited by a test. The snippet depends only on the path + extension. `.tex` sources **always drop** the `.tex` extension (`\input{./src/chapters/intro}`); `.bib` is **per-style** (`\addbibresource` keeps `.bib`, `\bibliography` drops it).
- **`main.tex`** — the primary target. Keep the empty paste-target line inside `document` intact; the tester places the cursor there. Pasting then undoing is the normal cycle. The `\usepackage{graphicx}` line is cosmetic context — the extension never reads the file's contents.
- **`src/figures/plot.png`, `plot.pdf`, `diagram.eps`** — empty 0-byte placeholders. `.tex` keys on the extension (`.png`/`.pdf`/`.eps`), not the bytes; the generated `figure` / `\includegraphics` is identical regardless of content. **Graphics keep the extension by default** (`preserveGraphicsFileExtension` defaults to on — inverted from the script/stylesheet toggles); the §4 off-case drops it.
- **`destinations/*.tex` targets** — content matters and is whitespace-sensitive. `indented.tex` line 4 **must stay exactly six spaces** (the §6 column-6 / §9 c-ii assertions fail otherwise); `with-comments.tex` must keep the `% section marker` line (the §10 / §9 c-iii LaTeX-`%`-not-recognized assertion). `blank.tex` keeps one empty body line. Do not reformat them without updating the checklist.
- **`rejected/*`** — content is irrelevant; only the extension matters for gating. `anim.gif`, `photo.webp`, `banner.avif`, `font.woff2`, `clip.mp4` are empty 0-byte placeholders; the remaining text stubs hold a one-line body.
