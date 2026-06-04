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

## Dispatch model

Import generation is a two-stage dispatch keyed on the **destination** file's extension, then on the **source** file's extension.

- **Destination-extension switch (`src/snippets/dispatch.ts`).** The destination's extension routes to one per-language builder. `.vue`/`.svelte`/`.astro` route to `languages/framework-component.ts`; `.mdx` routes to `languages/tsx.ts`; the remaining languages route to their own leaf builder.
- **Asset switch (`src/snippets/_react.ts:buildAssetImportStatement`, `_react.ts:48-94`).** Inside the JSX/TSX/MDX and framework-component path, the source-extension routing is a single canonical switch — `buildAssetImportStatement` is the one place that decides an asset's import shape. Its callers are `buildReactImport` (`_react.ts:17`), `languages/framework-component.ts`, and `variants.ts:buildReactNonScriptVariant`. Its structure:
  - A `.module.css`/`.module.scss` **guard before the switch** (`_react.ts:52-54`) → emits `import ${1:styles}`.
  - **Switch group 1 — default-import** (`_react.ts:57-74`) → `import ${1:name}`.
  - **Switch group 2 — media + text-track** (`_react.ts:75-83`) → `import ${1:url}`. This is the 2nd of the three switch groups, and the 3rd distinct snippet shape overall (after the styles guard and the default-import group).
  - **Switch group 3 — side-effect** (`_react.ts:84-90`) → `import '…'`.
  - `default: null` (`_react.ts:91-92`) — an unhandled source emits nothing.

  There is no `_shared.ts`; `buildAssetImportStatement` is the shared asset switch.

## Gating

A source→destination pair is admitted by `gating.ts:isPairSupported`, a **nine-clause** check:

1. One `CROSS_IMPORT_DESTINATIONS` guard (the cross-language allow-gate).
2. An `.html`↔`.html` block (HTML may not import HTML).
3. Through 9 — seven per-destination allow-lists, one per destination family, including the `.vue`/`.svelte`/`.astro` framework destinations (`gating.ts:35`, `gating.ts:38`, `gating.ts:41`).

A pair that no clause admits is not supported and produces no snippet.

## Placement

The snippet's insertion point is governed by the default placement setting and per-destination overrides:

- **Default placement** is one of Bottom / Top / Cursor.
- **HTML and Markdown destinations force Cursor placement** regardless of the default.
- **Vue/Svelte SFC-script override** — into a `.vue`/`.svelte` destination, the snippet is placed inside the SFC `<script>` block. Bounds and placement are computed by `findSfcScriptBounds` / `computeSfcPlacement` (`src/editor/placement.ts`) and inserted by `insertSnippetAtSfcScript` (`src/editor/insert-snippet.ts`).
- **Astro frontmatter override** — into a `.astro` destination, the snippet is placed inside the `---` frontmatter fence, honoring Top/Bottom/Cursor *within* the fence. Bounds and placement are computed by `findAstroFrontmatterBounds` / `computeAstroPlacement` (`src/editor/placement.ts`) and inserted by `insertSnippetAtAstroFrontmatter` (`src/editor/insert-snippet.ts`).

The `IMPORT_INDICATORS` markers used to detect an existing import region live in `placement.ts` (not `insert-snippet.ts`).

## Naming

The default-import placeholder name for TS-family destinations comes from `detectedImportName`. When detection yields no usable identifier, a **legacy-Angular index-0 fallback** supplies the name, guarded so it can never produce an invalid identifier.

## Extension preservation

Two shipped **booleans** (both default `false`) govern whether script and stylesheet imports keep their file extension:

- `script.preserveScriptFileExtension` — read at four call sites (`src/snippets/languages/javascript.ts`, `src/snippets/languages/typescript.ts`, `src/snippets/variants.ts`, and `src/snippets/_react.ts:buildAssetImportStatement`'s script bucket via its callers). It gates **script-to-script** imports only (JS/TS/JSX/TSX/MDX → JS/TS).
- `styleSheet.preserveStylesheetFileExtension` — read at one call site (`src/snippets/languages/scss.ts:determineScssExtension`). It gates **SCSS-to-SCSS** imports.

**SCSS always preserves `.css` on `.css` sources**, as a hardcoded exception independent of the flag (Sass requires the `.css` extension to recognize a foreign-language import).

Six import-statement categories append the extension **unconditionally**, never consulting either setting — so flipping a flag to `true` changes only the script-to-script (and SCSS-to-SCSS) call sites, and no other shape regresses with the default `false`:

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

- [statements.md](statements.md) · [framework-components.md](framework-components.md) · [media-files.md](media-files.md) — the per-area specs.
- [../CRITERIA.md](../CRITERIA.md) — the rubric admitting each shape; [../decisions/](../decisions/CLAUDE.md) — why each shape is in or out; [../future/](../future/CLAUDE.md) — designed but unbuilt work.
- `../../../src/snippets/CLAUDE.md` — the shipped dispatch + snippet-builder rules (`buildReactImport` and the single `buildAssetImportStatement` asset switch live in `src/snippets/_react.ts`).
- `../../../src/gating.ts` — `isPairSupported`, the nine-clause source/destination pair check.
