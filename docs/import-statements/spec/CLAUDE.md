# spec/CLAUDE.md — Specification (v1)

> **Status:** SEALED / Shipped. **Code:** the whole `../../../src/snippets/` tree, plus `../../../src/gating.ts`, `../../../src/editor/placement.ts`, `../../../src/editor/insert-snippet.ts`, and `../../../src/path/import-type.ts`.
> **Why these shapes:** [../decisions/](../decisions/CLAUDE.md) · **Rubric:** [../CRITERIA.md](../CRITERIA.md) · **Not yet built:** [../future/](../future/CLAUDE.md)

This is the spec layer's index and its **cross-cutting behavior model** — the parts that hold across every per-area spec doc below. The per-area docs state the picker shapes, snippet placeholders, and defaults; this file states the shared machinery they all ride on (dispatch, gating, placement, naming, extension preservation). Everything here describes behavior **as shipped** into `/src`.

## Index

| Doc | Scope |
|-----|-------|
| [statements.md](statements.md) | The per-language picker (the shipped enum), each language's default, and the snippet-placeholder spec for every builder. |
| [framework-components.md](framework-components.md) | Vue (`.vue`) / Svelte (`.svelte`) / Astro (`.astro`) SFC destinations — default-import-as-component, via the single shared `framework-component.ts` builder. |
| [media-files.md](media-files.md) | Video / audio / text-track support across JSX/TSX/MDX/HTML/Vue/Svelte/Astro. |
| [latex.md](latex.md) | LaTeX (`.tex`) destination — graphics→`figure`/`\includegraphics`, `.tex`→`\input`/`\include`, `.bib`→`\addbibresource`/`\bibliography`, via `latex.ts` + its own `latex.*` picker namespace. |

## Dispatch model

Import generation is a two-stage dispatch keyed on the **destination** file's extension, then on the **source** file's extension.

- **Destination-extension switch (`src/snippets/dispatch.ts`).** The destination's extension routes to one per-language builder. `.vue`/`.svelte`/`.astro` route to `languages/framework-component.ts`; `.mdx` routes to `languages/tsx.ts`; the remaining languages route to their own leaf builder.
- **Asset switch (`src/snippets/_react.ts:buildAssetImportStatement`).** Inside the JSX/TSX/MDX and framework-component path, the source-extension routing is a single canonical switch — `buildAssetImportStatement` is the one place that decides an asset's import shape. Its callers are `buildReactImport`, `languages/framework-component.ts`, and `variants.ts:buildReactNonScriptVariant`. Its structure:
  - A `.module.css`/`.module.scss` **guard before the switch** → emits `import ${1:styles}`.
  - **Switch group — default-import** → `import ${1:name}`.
  - **Switch group — media + text-track** → `import ${1:url}`.
  - **Switch group — side-effect** → `import '…'`.
  - `default: null` — an unhandled source emits nothing.

  There is no `_shared.ts`; `buildAssetImportStatement` is the shared asset switch.

## Gating

A source→destination pair is admitted by `gating.ts:isPairSupported`, a sequential reject-clause check:

1. One `CROSS_IMPORT_DESTINATIONS` guard (the cross-language allow-gate).
2. An `.html`↔`.html` block (HTML may not import HTML).
3. Per-destination allow-lists, one per destination family, including the `.vue`/`.svelte`/`.astro` framework destinations and the `.tex` LaTeX destination.

A pair that no clause admits is not supported and produces no snippet.

## Placement

The snippet's insertion point is governed by the default placement setting and per-destination overrides:

- **Default placement** is one of Bottom / Top / Cursor.
- **HTML, Markdown, and LaTeX (`.tex`) destinations force Cursor placement** regardless of the default. For `.tex`, this keeps a figure / `\input` in the document body (line 0 is the preamble) — see [latex.md](latex.md).
- **Vue/Svelte SFC-script override** — into a `.vue`/`.svelte` destination, the snippet is placed inside the SFC `<script>` block. Bounds and placement are computed by `findSfcScriptBounds` / `computeSfcPlacement` (`src/editor/placement.ts`) and inserted by `insertSnippetAtSfcScript` (`src/editor/insert-snippet.ts`).
- **Astro frontmatter override** — into a `.astro` destination, the snippet is placed inside the `---` frontmatter fence, honoring Top/Bottom/Cursor *within* the fence. Bounds and placement are computed by `findAstroFrontmatterBounds` / `computeAstroPlacement` (`src/editor/placement.ts`) and inserted by `insertSnippetAtAstroFrontmatter` (`src/editor/insert-snippet.ts`).

The `IMPORT_INDICATORS` markers used to detect an existing import region live in `placement.ts` (not `insert-snippet.ts`).

## Naming

The default-import placeholder name for TS-family destinations comes from `detectedImportName`. When detection yields no usable identifier, a **legacy-Angular index-0 fallback** supplies the name, guarded so it can never produce an invalid identifier.

## Extension preservation

The shipped preserve **booleans** govern whether imports keep their file extension — script and stylesheet default `false`, LaTeX graphics defaults `true`:

- `script.preserveScriptFileExtension` — read at the import-gating call sites (`src/snippets/languages/javascript.ts`, `src/snippets/languages/typescript.ts`, `src/snippets/languages/framework-component.ts`, `src/snippets/variants.ts`, and `src/snippets/_react.ts:buildReactImport`). It gates **script-source** imports only (`.ts`/`.tsx`/`.js`/`.jsx` sources) into script and SFC destinations (`.js`/`.ts`/`.jsx`/`.tsx`/`.mdx` and `.vue`/`.svelte`/`.astro`).
- `styleSheet.preserveStylesheetFileExtension` — read at one call site (`src/snippets/languages/scss.ts:determineScssExtension`). It gates **SCSS-to-SCSS** imports.
- `latex.preserveGraphicsFileExtension` — read at one call site (`src/snippets/languages/latex.ts:resolveGraphicsPath`). It gates **LaTeX graphics** imports (`figure` / `\includegraphics`) only, and **defaults `true` (keep)** — inverted from the other two (keeping `fig.png` is unambiguous; the LaTeX omit-and-resolve convention is opt-in). See [latex.md](latex.md).

**SCSS always preserves `.css` on `.css` sources**, as a hardcoded exception independent of the flag (Sass requires the `.css` extension to recognize a foreign-language import).

The import-statement categories below append the extension **unconditionally**, never consulting any preserve setting — so the preserve flags affect only their own call sites (script-to-script, SCSS-to-SCSS, and LaTeX graphics) — though LaTeX's non-graphics shapes carry their own fixed, preserve-independent extension rules (`\addbibresource` appends `.bib`; `\input`/`\bibliography` drop the extension), documented in [latex.md](latex.md) rather than this table:

| Category | Where forced | Reason |
|----------|--------------|--------|
| HTML destinations (`<script>`, `<img>`, `<link>`) | `src/snippets/languages/html.ts` (`fullPath = relativePath + extension`) | Browsers require literal filenames |
| CSS destinations (`@import`, `url()`) | `src/snippets/languages/css.ts` (same pattern) | CSS parser requires explicit filename |
| Markdown destinations (`![]()`, `[]()`) | `src/snippets/languages/markdown.ts` (same pattern) | Renderers require explicit filename |
| JSX / TSX / MDX non-script sources (image / JSON / font URL imports) | `src/snippets/_react.ts:buildAssetImportStatement` (non-script asset switch) | URL-import semantics need extensions |
| SCSS importing `.css` source | `src/snippets/languages/scss.ts:determineScssExtension` (`.css` short-circuit) | Sass requires `.css` extension to recognize foreign-language imports |
| CSS image-import via SCSS | `src/snippets/languages/scss.ts:buildSnippet` (image branch) | Image URL needs extension |

The tri-state auto-detect enum that would replace `preserveScriptFileExtension` is **not shipped** — see [../future/auto-detect-extensions.md](../future/auto-detect-extensions.md).

## See also

- [statements.md](statements.md) · [framework-components.md](framework-components.md) · [media-files.md](media-files.md) · [latex.md](latex.md) — the per-area specs.
- [../CRITERIA.md](../CRITERIA.md) — the rubric admitting each shape; [../decisions/](../decisions/CLAUDE.md) — why each shape is in or out; [../future/](../future/CLAUDE.md) — designed but unbuilt work.
- `../../../src/snippets/CLAUDE.md` — the shipped dispatch + snippet-builder rules (`buildReactImport` and the single `buildAssetImportStatement` asset switch live in `src/snippets/_react.ts`).
- `../../../src/gating.ts` — `isPairSupported`, the source/destination pair check.
