# LaTeX — Specification (v1)

> **Status:** Shipped. **Code:** `src/snippets/languages/latex.ts`, `src/snippets/dispatch.ts`, `src/snippets/variants.ts`, `src/snippets/_styles.ts`, `src/gating.ts`, `src/editor/placement.ts`, `src/config/settings.ts`.
> **Why these shapes:** [../decisions/latex.md](../decisions/latex.md) · **Rubric:** [../CRITERIA.md](../CRITERIA.md)

## Overview

LaTeX (`.tex`) is an import destination. Unlike the script and framework destinations, a `.tex` file does not have a single "import" shape — it has **distinct source→shape relationships**, each dispatched by the raw source extension inside `src/snippets/languages/latex.ts`:

```latex
% graphics source (.pdf / .png / .jpg / .jpeg / .eps) → figure float (default)
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.5\textwidth]{figures/plot.png}
    \caption{caption}
    \label{fig:label}
\end{figure}

% .tex source → \input (default)
\input{chapters/intro}

% .bib source → \addbibresource (default)
\addbibresource{refs.bib}
```

`.tex` is a destination language that ships its own multi-shape picker for *non-script* sources. It introduces its own `importStatement.*` config namespace, `latex` (`src/config/settings.ts`), with style settings + a preserve boolean — a genuine `package.json` ↔ `_styles.ts` ↔ per-language `switch` three-site sync surface (where the framework SFCs deliberately introduced none, reusing the TS picker).

**Source classification is by raw extension, not `ImportType`.** `path/import-type.ts:determineImportType` returns `'image'` for `.tex`, `.bib`, and `.eps` alike (they all fall to its catch-all default), so it cannot distinguish the three LaTeX source kinds. `latex.ts:buildSnippet` therefore branches on the raw `sourceFileExt` directly — the same strategy `_react.ts:buildAssetImportStatement` uses for JSX/TSX/MDX — never consulting `determineImportType`.

**Scope.** LaTeX's three canonical relative-path relationships ship: graphics inclusion, file inclusion (`\input`/`\include`), and bibliography databases (`\addbibresource`/`\bibliography`). Package/class inclusion (`\usepackage{…}` / `\documentclass{…}`) is **out of scope** — those take a *kpathsea-resolved name*, not a relative path. See the rejection ledger.

## Graphics sources (`.pdf` / `.png` / `.jpg` / `.jpeg` / `.eps`)

**Accepted graphics formats** (`TEX_GRAPHICS_FILE_EXTENSIONS` in `src/constants/extensions.ts`): `.pdf`, `.png`, `.jpg`, `.jpeg`, `.eps`. This set is **engine-renderable** — it deliberately omits the web-image formats `.svg` / `.gif` / `.webp` / `.avif`, which `pdflatex` cannot render without a plugin + shell-escape (see decisions). `.pdf`/`.png`/`.jpg`/`.jpeg` are `pdflatex`-native; `.eps` is the classic vector format (native under `latex`+`dvips`, auto-converted under `pdflatex` via `epstopdf`).

**Setting:** `auto-import.importStatement.latex.graphicsImportStyle` (`TEX_GRAPHICS_IMPORT_OPTIONS`). `${path}` is the relative path with the extension governed by `preserveGraphicsFileExtension` (see Behavior).

| # | Style (enum / `description`) | Final `SnippetString` | Default |
|---|------------------------------|-----------------------|:---:|
| 0 | `\begin{figure}[htbp] \centering \includegraphics[width=0.5\textwidth]{_relativePath_} \caption{} \label{fig:} \end{figure}` | the **multi-line** block below | ✓ |
| 1 | `\includegraphics[width=0.5\textwidth]{_relativePath_}` | `` `\includegraphics[width=${1:0.5}\textwidth]{${path}}` `` | |
| 2 | `\includegraphics{_relativePath_}` | `` `\includegraphics{${path}}` `` | |

The default (style 0) is the only **multi-line** snippet in the whole extension:

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.5\textwidth]{<path>}
    \caption{${1:caption}}
    \label{fig:${2:label}}
\end{figure}
```

`\caption` is emitted **before** `\label` — a `\label` placed before its `\caption` captures the section counter, so `\ref` would print the wrong number. The two tab stops walk caption → label.

## `.tex` sources → `\input` / `\include`

**Setting:** `auto-import.importStatement.latex.inputImportStyle` (`TEX_INPUT_IMPORT_OPTIONS`). The `.tex` extension is **always dropped** from the path (`\include` *requires* it omitted — it appends `.tex` itself and also manages an `.aux` file; `\input` conventionally omits it too).

| # | Style | Final `SnippetString` | Default |
|---|-------|-----------------------|:---:|
| 0 | `\input{_relativePath_}` | `` `\input{${path}}` `` | ✓ |
| 1 | `\include{_relativePath_}` | `` `\include{${path}}` `` | |

`\input` inlines the file with no page break; `\include` starts a new page and is `\includeonly`-able (chapter-level inclusion).

## `.bib` sources → `\addbibresource` / `\bibliography`

**Setting:** `auto-import.importStatement.latex.bibliographyImportStyle` (`TEX_BIBLIOGRAPHY_IMPORT_OPTIONS`). The extension policy is **per-style** — modern biblatex keeps `.bib`, legacy BibTeX drops it — so the builder takes the extensionless path plus the source extension and decides per case.

| # | Style | Final `SnippetString` | Path | Default |
|---|-------|-----------------------|------|:---:|
| 0 | `\addbibresource{_relativePath_}` | `` `\addbibresource{${path}${ext}}` `` | keeps `.bib` | ✓ |
| 1 | `\bibliography{_relativePath_}` | `` `\bibliography{${path}}` `` | drops `.bib` | |

## Gating

**Accepted sources** (`TEX_SUPPORTED_EXTENSIONS` in `src/constants/extensions.ts`): `.tex`, `.bib`, plus `...TEX_GRAPHICS_FILE_EXTENSIONS` (`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`). `.tex` is in `CROSS_IMPORT_DESTINATIONS` (so it may import a *different* extension). It is **not** in `SCRIPT_FILE_EXTENSIONS` (so insertion uses the cursor column, not forced column 0 — see Placement).

`gating.ts:isPairSupported` carries a `.tex` clause rejecting a source not in `TEX_SUPPORTED_EXTENSIONS`. A `.tex` source only targets `.tex` (it appears in no other destination's allow-list); the graphics/`.bib` sources likewise reach no functional shape in any non-`.tex` destination (they hit the empty-snippet backstop elsewhere).

## Placement

`.tex` is a **forced-cursor** destination — `shouldRepositionCursor` (`src/editor/placement.ts`) returns `true` for `.html`, `.md`, **and `.tex`**. A figure / `\input` / `\addbibresource` belongs in the document **body** at the point of discussion, never at the top of the file (line 0 is the preamble — before `\documentclass`). "Top"/"Bottom" placement is meaningless here: "Top" would land in the preamble, and "Bottom" finds no `IMPORT_INDICATORS` marker (LaTeX commands are not in that list), so it would fall back to line 0. Forced-cursor sidesteps both, exactly as it does for HTML/Markdown.

Because `.tex` is not in `SCRIPT_FILE_EXTENSIONS`/`STYLESHEET_FILE_EXTENSIONS`, `determineInsertionColumn` returns the **cursor column** (not 0), like HTML/Markdown. For the common case (dropping/pasting on a blank body line at column 0) the multi-line figure lands cleanly; VS Code re-indents the snippet's interior lines to the insertion column.

`IMPORT_INDICATORS` carries no LaTeX markers — forced-cursor placement means "Bottom" never runs for `.tex`.

## Naming

The figure default emits two tab stops, `${1:caption}` and `${2:label}`; the sized graphic emits one (`${1:0.5}`, the width fraction). The legacy-Angular auto-naming (`typescript.ts:generateAngularLegacyImportName`) does not apply to LaTeX. The picker label for the multi-line figure is collapsed to a single line by `variants.ts:renderLabel` (a `.replace(/\n\s*/g, ' ')` added for this shape — the figure is the only multi-line snippet, so the collapse is a no-op for every other language).

## Behavior

- **Extension handling — graphics.** Governed by `latex.preserveGraphicsFileExtension` (boolean, **default `true`** — *keep* the extension). This is **inverted** from `script.preserveScriptFileExtension` / `styleSheet.preserveStylesheetFileExtension` (both default `false`): keeping `fig.png` is unambiguous and matches the dragged file, where LaTeX's "omit and let the engine resolve" convention is the opt-in. `resolveGraphicsPath(relativePath, sourceFileExt)` appends the extension unless the flag is off.
- **Extension handling — `.tex` / `.bib`.** `\input`/`\include` always drop `.tex` (independent of any flag). `\addbibresource` keeps `.bib`; `\bibliography` drops it.
- **Path separators.** Forward slashes, produced by the existing `path/relative.ts:computeRelative` — LaTeX requires forward slashes on every platform.
- **The default arms emit the post-audit default.** Each `…ByStyle` switch in `latex.ts` ends in a `default:` returning style 0 (figure / `\input` / `\addbibresource`), so a drifted/removed persisted value lands softly.

## Code map

- `src/snippets/languages/latex.ts` — the builder: `buildSnippet` (raw-extension dispatch) + `buildTexGraphicsImportSnippetByStyle` / `buildTexInputImportSnippetByStyle` / `buildTexBibliographyImportSnippetByStyle` + the `isTexGraphicsSource` / `resolveGraphicsPath` helpers (shared with `variants.ts`).
- `src/snippets/dispatch.ts` — the `.tex` `case` → `latex.buildSnippet(info)`.
- `src/snippets/variants.ts` — the `.tex` `case` → `buildTexVariants` (per-source-kind styled variants); `renderLabel` newline-collapse.
- `src/snippets/_styles.ts` — `TEX_GRAPHICS_IMPORT_OPTIONS`, `TEX_INPUT_IMPORT_OPTIONS`, `TEX_BIBLIOGRAPHY_IMPORT_OPTIONS`.
- `src/config/settings.ts` — the `latex` namespace (`auto-import.importStatement.latex`): `preserve` / `graphics` / `input` / `bibliography`.
- `src/constants/extensions.ts` — `TEX_GRAPHICS_FILE_EXTENSIONS`, `TEX_SUPPORTED_EXTENSIONS`, and `.tex` membership in `CROSS_IMPORT_DESTINATIONS`.
- `src/gating.ts` — the `.tex` per-destination allow-list clause of `isPairSupported`.
- `src/editor/placement.ts` — `shouldRepositionCursor` includes `.tex`.
- `src/types/file-extension.ts` — `LatexFileExtension` (`.tex`), `BibliographyFileExtension` (`.bib`), `EncapsulatedPostScriptFileExtension` (`.eps`).
- `src/drop/selector.ts` — `{ pattern: '**/*.tex', scheme: 'file' }` (no guaranteed LaTeX language ID — same as `.mdx`).
- `package.json` — `onLanguage:latex` + `workspaceContains:**/*.tex` activation; the four `auto-import.importStatement.latex.*` settings.

## See also

- [../decisions/latex.md](../decisions/latex.md) — why these shapes (the format-gating criteria application, the keep-extension default, the rejection ledger).
- [../CRITERIA.md](../CRITERIA.md) — the rubric. Criterion 1 (Frequency) and Criterion 3 (Framework-portable — the engine-renderable graphics gate) are the dispositive admission gates.
- [statements.md](statements.md) — the per-language picker inventory, which carries the three LaTeX rows.
- [framework-components.md](framework-components.md) — the sibling post-v1 destination-language addition (the structural template), which differs by reusing the TS picker rather than shipping its own settings.
