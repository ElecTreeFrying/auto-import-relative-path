# LaTeX — Design Decisions

> These are the design decisions taken while specifying the LaTeX destination (the criteria applied, the shapes locked in, and the alternatives rejected); living gate, it stays open for new rows.
>
> Rationale companion to [`../spec/latex.md`](../spec/latex.md) (what ships). Applies the rubric in [`../CRITERIA.md`](../CRITERIA.md).
>
> **Status: LIVING gate.** The `.tex` destination shipped (graphics → figure, `.tex` → `\input`, `.bib` → `\addbibresource`, one `src/snippets/languages/latex.ts` builder), but this ledger stays open — new shapes earn rows. The per-step implementation history (src edits, four-site sync, the test suite) lives in git, not here.
>
> **Origin.** Feature request: LaTeX figure-on-drop, ported from the drag-and-drop sibling extension (issue #5 — "It inserts a new figure like `\begin{figure}…\includegraphics…\caption…\label…\end{figure}`"). The shipped figure default reproduces that block verbatim.

## Criteria application

Each proposed source/shape maps to the rubric in [`../CRITERIA.md`](../CRITERIA.md). Multi-hit shapes are easy adds; single-hit shapes are flagged. C1 (Frequency) and C3 (Framework-portable — here, *engine*-portable) are the dispositive gates.

### Source-extension inclusion

| Extension(s) | Criteria hit | Notes |
|--------------|--------------|-------|
| `.pdf` / `.png` / `.jpg` / `.jpeg` (graphics core) | 1, 3, 4 | The `pdflatex`-native raster/vector set; `\includegraphics` is *the* figure-insertion command across every engine. Multi-hit. |
| `.eps` | 3 (with weak 1) | Classic LaTeX vector format. Native under `latex`+`dvips`; auto-converted under `pdflatex` via the `epstopdf` package. **C3-borderline** (pure `pdflatex` without shell-escape needs a pre-converted PDF), but iconic in academic/journal LaTeX. Included for academic parity — the same "weak-C1/C3-but-ecosystem-standard" call as `.mov`/`.m4a` in [media-files.md](media-files.md); revisit if it proves to confuse `pdflatex`-only users. |
| `.tex` (`\input` target) | 1, 3, 4 | File inclusion is the canonical multi-file LaTeX structure (chapters/sections). Universal across engines. Multi-hit. |
| `.bib` (`\addbibresource` target) | 1, 3, 4 | The single bibliography-database format; `\addbibresource` (biblatex) / `\bibliography` (BibTeX) are the only two consumption commands. Multi-hit. |

### Graphics shapes (`latex.graphicsImportStyle` — `TEX_GRAPHICS_IMPORT_OPTIONS`)

| Shape | Criteria hit | Notes |
|-------|--------------|-------|
| `figure` float — `[htbp]` + `\centering` + sized `\includegraphics` + `\caption` + `\label` ← default | 1, 4, 6 | The dominant figure idiom and the issue's exact request. C6: `[htbp]` (maximal placement flexibility), `\centering` over `\centerline`, and `\caption`-before-`\label` (correct `\ref` numbering) are the documented best practice. Strong default. |
| `\includegraphics[width=…]{…}` (sized, no float) | 1, 4 | Inline sized graphic — common inside the author's own custom float/minipage, or in beamer frames where `figure` floats are discouraged. |
| `\includegraphics{…}` (bare) | 1, 4 | Minimal inclusion at natural size — the primitive every other shape builds on. |

### `.tex` shapes (`latex.inputImportStyle` — `TEX_INPUT_IMPORT_OPTIONS`)

| Shape | Criteria hit | Notes |
|-------|--------------|-------|
| `\input{…}` ← default | 1, 3, 4 | Inline inclusion, no page break — the general-purpose include. Strongest C1. |
| `\include{…}` | 1, 4 | Chapter-level inclusion (page break + `\includeonly` support). Both omit `.tex` (`\include` *requires* it omitted). |

### `.bib` shapes (`latex.bibliographyImportStyle` — `TEX_BIBLIOGRAPHY_IMPORT_OPTIONS`)

| Shape | Criteria hit | Notes |
|-------|--------------|-------|
| `\addbibresource{…bib}` ← default | 1, 2, 3 | Modern biblatex+biber — the current recommended toolchain; keeps the `.bib` extension (biblatex convention). |
| `\bibliography{…}` | 1 | Legacy BibTeX — still dominant in many journal/conference templates; drops `.bib`. Kept on **Tiebreaker 1 (Frequency beats spec-recency)** — biblatex is the spec direction, but BibTeX-`\bibliography` remains the majority shape in supplied templates. A fragile-tag candidate to re-check when biblatex adoption crosses the majority. |

### Picker-bloat ceiling check

| Setting | Entries | Sweet-spot fit |
|---------|---------|----------------|
| `latex.graphicsImportStyle` | 3 | Below the ~7 ceiling; room to grow (a `[H]` float-here variant is rejection-ledgered below). |
| `latex.inputImportStyle` | 2 | Below floor; the two shapes are the complete `\input`/`\include` surface. |
| `latex.bibliographyImportStyle` | 2 | Below floor; the two shapes are the complete biblatex/BibTeX surface. |

All are well under the ceiling — no picker-bloat risk.

## Locked-in decisions

Each row anchors to a specific criterion or tiebreaker.

| # | Decision | Justification |
|---|----------|---------------|
| 1 | **LaTeX ships its own picker namespace (`latex.*`), not a reused picker** | LaTeX import shapes (`\includegraphics`, `\input`, `\addbibresource`) share nothing with the JS/TS/CSS surfaces, so there is no existing picker to reuse — this is the **opposite** call from the framework SFCs (which reused `TYPESCRIPT_IMPORT_OPTIONS` and added *no* new setting; see [framework-components.md](framework-components.md) decision #1). A genuine `package.json` ↔ `_styles.ts` ↔ per-language `switch` three-site surface is introduced: namespace `latex` with `graphics`/`input`/`bibliography` + `preserve`. |
| 2 | **`preserveGraphicsFileExtension` defaults to `true` (keep the extension)** — inverted from the script/stylesheet preserve toggles | *(Anchors C4 + a drag-a-specific-file UX call.)* The two existing `preserve*FileExtension` booleans default `false` (omit) because bundlers/TS resolve extensionless paths. LaTeX is different: keeping `fig.png` is **unambiguous and always compiles**, matches the *specific* file the user dragged, and matches the issue/TexStudio reference. LaTeX's "omit and let `\DeclareGraphicsExtensions` resolve" convention is the *opt-in*, not the default. (A Tiebreaker-1 fragility candidate — re-check if extensionless-graphics adoption rises.) |
| 3 | **Graphics default = the full `figure` float (the issue's block)** | *(C1 + C6.)* `[htbp]` + `\centering` + `width=0.5\textwidth` + `\caption{${1:caption}}` + `\label{fig:${2:label}}` reproduces issue #5 verbatim and is the documented best-practice structure. `\caption` is emitted **before** `\label` so `\ref` resolves to the figure counter (a `\label` above its `\caption` captures the section counter — the classic gotcha). |
| 4 | **The figure is the codebase's only multi-line snippet** | *(Doc-local — implementation invariant.)* Every other shape is single-line. The picker label would otherwise span six lines, so `variants.ts:renderLabel` gained a single `.replace(/\n\s*/g, ' ')` collapse — a no-op for every other language (none has a newline). The `description`/enum value is a clean *single-line* `\begin{figure}…\end{figure}`, decoupled from the multi-line rendered output (the `description` is only a `resolveStyleIndex` lookup key — it never has to equal the inserted text). |
| 5 | **`.tex` is a forced-cursor destination (body, never preamble)** | *(Doc-local — placement correctness.)* `shouldRepositionCursor` now returns `true` for `.tex` (joining `.html`/`.md`). "Top" placement would land in the preamble (before `\documentclass`); "Bottom" finds no `IMPORT_INDICATORS` marker and falls back to line 0 — both wrong. `IMPORT_INDICATORS` is left unchanged precisely because forced-cursor means "Bottom" never runs for `.tex`. `.tex` is intentionally **not** added to `SCRIPT_FILE_EXTENSIONS`, so insertion uses the cursor column (like HTML/MD), not forced column 0. |
| 6 | **Source classification by raw extension, not `ImportType`** | *(Doc-local — `determineImportType` can't distinguish them.)* `.tex`, `.bib`, and `.eps` all fall to `determineImportType`'s `'image'` catch-all, so it cannot route the three LaTeX source kinds. `latex.ts:buildSnippet` branches on the raw `sourceFileExt` (the `_react.ts:buildAssetImportStatement` strategy), never consulting `ImportType`. `path/import-type.ts` is therefore left untouched. |
| 7 | **One `latex.ts` builder for all three source kinds** | *(Doc-local — cohesion.)* The three relationships share the destination and the config namespace; splitting into `graphics.ts`/`input.ts`/`bib.ts` would fragment one small, cohesive switch. Mirrors how `html.ts` houses six source-type arms in one file. |
| 8 | **`.bib` extension policy is per-style, not a global toggle** | *(Doc-local — the two shapes disagree.)* `\addbibresource` keeps `.bib` (biblatex), `\bibliography` drops it (BibTeX). So `buildTexBibliographyImportSnippetByStyle` takes the extensionless path *plus* the extension and decides per case — it cannot be pre-joined like the graphics path. |
| 9 | **`.tex` is matched by file pattern in the drop selector, not language ID** | *(Doc-local — no guaranteed language ID.)* VS Code ships no LaTeX language; a `.tex` file opens as plaintext unless a LaTeX extension is installed. `{ pattern: '**/*.tex', scheme: 'file' }` fires the drop regardless of language — the exact `.mdx` precedent. Activation pairs `onLanguage:latex` (when an extension provides it) with `workspaceContains:**/*.tex`. |

## Things considered and rejected

Criterion-tagged rejections. Each opens with its criterion tag in parenthetical italics and cites either an Inclusion criterion (1–6) the shape fails or a Rejection criterion (A–F) from [`../CRITERIA.md`](../CRITERIA.md). Doc-local notes are flagged explicitly.

- **`.svg` as a `.tex` graphics source** — *(Fails Criterion 3: Framework-portable — not engine-renderable.)* `pdflatex` cannot embed `.svg`; the `svg` package shells out to Inkscape (`--shell-escape`, an Inkscape install) to convert at build time. Gating an import that compiles only with shell-escape + an external tool fails C3 — the same call that rejected `.mkv`/`.avi` for HTML `<video>` (compiles, won't render). Skip; revisit only if a pure-LaTeX SVG path lands.
- **`.gif` / `.webp` / `.avif` as `.tex` graphics sources** — *(Fails Criterion 3: Framework-portable — no LaTeX engine renders them.)* None is supported by `pdflatex`/`xelatex`/`lualatex`'s native graphics drivers. Including them would silently emit `\includegraphics` calls that error at compile time. Skip.
- **`\usepackage{…}` / `\documentclass{…}` (package/class inclusion)** — *(Fails Rejection Criterion C: Different feature wearing the same syntax — and the "wrong signal-content" sub-rule.)* These take a **kpathsea-resolved package/class name** (resolved against `TEXINPUTS`/the TeX tree), not a relative path. A local `.sty`/`.cls` is referenced by bare name (`\usepackage{mystyle}`) only after it is on the search path — the relative path the extension computes is the wrong content. Out of scope, like lockfiles for JS.
- **`.sty` / `.cls` as sources** — *(Fails Rejection Criterion C — same as `\usepackage` above.)* Their consumption command (`\usepackage`/`\documentclass`) is name-based, not path-based. Skip.
- **`\graphicspath{{figures/}}` emission / extensionless-by-`\DeclareGraphicsExtensions`** — *(Doc-local rejection — preamble project config, not a per-paste shape.)* Both are set **once** in the preamble to configure how *all* `\includegraphics` calls resolve. They are project configuration, not a per-file paste shape (a set-once destination, structurally low paste-frequency — the same reasoning that keeps `index.html` script tags low-frequency in [statements.md](statements.md)). The `preserveGraphicsFileExtension=false` opt-in already covers users who run an extensionless graphics path.
- **`subfigure` / `\begin{subfigure}` (side-by-side figures)** — *(Fails Criterion 4: Single-path-paste fit + Tiebreaker 4: Single-path beats expressiveness.)* A subfigure float references *multiple* images per environment; it cannot be modeled from a single dragged path. The same reason `<picture>`/`srcset` is rejected for HTML.
- **`[H]` float-here figure variant** — *(Fails Rejection Criterion B: Framework-specific + Criterion F: Picker bloat.)* `\begin{figure}[H]` needs `\usepackage{float}` in the preamble; emitting it would produce a figure that errors without that package (fails portability), and it adds a fourth graphics row for a preamble-dependent variant. Skip; the `[htbp]` default already serves the common case.
- **`\input` of TikZ/PGF externalized figures (`.tikz` / `.pgf`)** — *(Fails Criterion 1: Frequency — niche; would need their own extension union.)* `\input{fig.tikz}` is real in heavy-TikZ documents but a minority pattern, and `.tikz`/`.pgf` would each need a new `FileExtension` entry for a small audience. Skip; revisit on demand (a `\input`-keeps-extension variant could fold them in).
- **`\inputminted` / `\lstinputlisting` (source-code inclusion)** — *(Fails Rejection Criterion B: Bundler/framework-specific — needs the `minted`/`listings` package + (minted) shell-escape.)* Package-specific, configuration-heavy, and a niche audience. Skip.
- **`\includestandalone` (the `standalone` package)** — *(Fails Criterion 1: Frequency.)* A real cross-document-reuse workflow, but a minority of LaTeX projects adopt `standalone`. Skip; revisit on user demand.
- **`\bibliographystyle{…}` / biblatex `style=` options** — *(Fails Rejection Criterion C: Different feature wearing the same syntax — a style declaration, not a relative-path import.)* Takes a style *name*, not a path. Out of scope.
- **`.ltx` / `.latex` as additional destination extensions** — *(Fails Criterion 1: Frequency — `.tex` is overwhelmingly dominant.)* Both are valid LaTeX extensions but rare in practice; `.tex` covers the audience. Trivially addable later (one `LatexFileExtension` union member + selector/activation glob) if demand surfaces.
- **A combined `\input`/graphics/bibliography picker** — *(Fails Rejection Criterion F: Picker bloat with low marginal value.)* The three relationships are distinguished by the source extension, not a user choice — a combined picker would force the user to scroll past graphics shapes when pasting a `.bib`. Per-source-kind dispatch (one setting each) routes correctly with no UX cost.

## See also

- [`../spec/latex.md`](../spec/latex.md) — what ships (the shipped LaTeX shapes, settings, placement, gating).
- [`../CRITERIA.md`](../CRITERIA.md) — the rubric. Criterion 3 (Framework-portable, read as *engine*-renderable) is the central gate that shapes the graphics-format set; see its worked example for LaTeX.
- [`framework-components.md`](framework-components.md) — the sibling post-v1 destination addition; LaTeX's "ship a new picker namespace" is the deliberate opposite of its "reuse the TS picker" call.
- [`media-files.md`](media-files.md) — the format-portability precedent (`.mkv`/`.avi` rejected for `<video>` the same way `.svg`/`.gif` are rejected here).
- `src/snippets/languages/latex.ts` — the single builder these decisions govern.
- `src/gating.ts` — the `.tex` per-destination clause of `isPairSupported`.
