# src/snippets/CLAUDE.md

Per-language snippet builders + the destination-extension dispatch in `dispatch.ts`. The public surface of this directory is `dispatch.ts:buildImportSnippet()` (used by the default paste flow and the drag-drop provider), `variants.ts:buildImportSnippetVariants()` (used by the `extension.pasteImportWithStyle` and `extension.setDefaultImportStyle` commands), and `compose.ts` (`shiftTabStops` / `joinImportStatements` — the multi-file stacking helpers).

## Files

- `dispatch.ts` — single-level destination-extension switch consumed by `commands/paste-import.ts` and `drop/provider.ts`. Threads an optional `insideStyleBlock` flag to the framework-component arm (`.vue`/`.svelte`/`.astro`), so a stylesheet source pasted/dropped inside an SFC `<style>` block takes the stylesheet dialect; every other destination ignores it.
- `compose.ts` — pure (`vscode`-free, Node-testable) multi-file stacking. `shiftTabStops(value, offset)` renumbers every tab stop in one statement — both `${N:default}` (default text preserved) and bare `$N` forms — and reports the original (pre-offset) max so a caller can chain offsets; `joinImportStatements(values, indentation)` runs the chain across N statements (keeping every statement's placeholders independent — VS Code links equal-numbered tab stops within one inserted snippet), prefixes each statement's first line with `indentation`, joins with newlines, and ends the block with one trailing newline. A single statement renders `indentation + value + '\n'`, byte-identical to the single-source output. Consumed by `drop/provider.ts` for multi-file drops.
- `variants.ts` — parallel aggregator that enumerates every applicable style for the current paste, consumed by `extension.pasteImportWithStyle` and `extension.setDefaultImportStyle`. Mirrors `dispatch.ts`'s destination switch and the per-language source classification, but calls each language's `buildXImportSnippetByStyle` **twice** per `*_IMPORT_OPTIONS` entry — once with the full relative path (for `snippetText`, the insertion payload) and once with `path.basename(...)` of that path (for `label`, the picker preview). The basename render keeps QuickPick labels short and width-stable regardless of source nesting depth (`'../../components/widget'` → `'widget'`). Each styled variant also carries a `setting?: { namespace, key, value }` triple pointing at the backing `package.json` setting, so `set-default-import-style.ts` can persist the chosen style via `setAutoImportSetting` without re-deriving the destination → table mapping. Hardcoded variants leave `setting` undefined. The "twice per entry" applies to script/styled sources; non-script and fixed-shape sources (HTML `<link>`/`<track>`, CSS/SCSS images, Markdown links, JSX/TSX/MDX and Vue/Svelte/Astro non-script imports, and framework-component sources into `.ts`/`.js`) instead build hardcoded variants via `toHardcodedVariant` without calling the `…ByStyle` builders. `buildImportSnippetVariants` also takes the `insideStyleBlock` flag: in it, a stylesheet source into a framework SFC is the exception to that "hardcoded" rule — it re-enters `buildCssVariants` / `buildScssVariants`, so the SFC `<style>`-block styled variants carry the shared `stylesheet` `css`/`scss` settings (Set Default persists the same `cssImportStyle` / `scssImportStyle` the plain `.css`/`.scss` destinations use).
- `_react.ts` — internal: `buildReactImport` (+ supporting `ReactImportOptions` interface / `BuildScriptSnippet` function-signature type) shared by JSX/TSX/MDX, plus `buildAssetImportStatement(sourceFileExt, importPath)` — the single canonical non-script asset-shape switch. Plain-asset name imports (image / data / doc) and media/text-track url imports **pre-fill** their `${1:…}` binding with an identifier derived from the source basename via `path/import-name.ts:deriveImportName` (falling back to `${1:name}` / `${1:url}` when none forms); framework SFCs (`.vue`/`.svelte`/`.astro`) instead pre-fill a **PascalCase** component identifier via `path/import-name.ts:deriveComponentName` (falling back to `${1:name}`), while Markdown/MDX (`.md`/`.mdx`) keep the generic `${1:name}` (their component naming is out of the SFC pathway's scope); font/stylesheet → side-effect; CSS-module → `${1:styles}`; else `null`. Called by `buildReactImport`, `languages/framework-component.ts`, `languages/typescript.ts` / `languages/javascript.ts` (framework-component sources into `.ts`/`.js`), and `variants.ts:buildReactNonScriptVariant`, so the asset switch lives in exactly one place.
- `_styles.ts` — internal: `ImportStyle[]` tables + `resolveStyleIndex`. Most entries carry an optional `tag` (free-form short label) used by the QuickPick rendered in `paste-import-with-style.ts` — most active entries carry one. The exceptions are the first entry of `HTML_IMAGE_IMPORT_OPTIONS`, `HTML_VIDEO_IMPORT_OPTIONS`, and `HTML_AUDIO_IMPORT_OPTIONS`, which fall back to the full description via `opt.tag ?? opt.description` (`variants.ts:toStyledVariant`).
- `_class-name.ts` — internal: `readExportedClassName` reads a TS/JS source file and returns the first top-level exported class name (or `null`). `extractFirstExportedClassName` is the pure extraction function (strips comments first). Consumed by `languages/typescript.ts` and `variants.ts`.
- `languages/` — one module per destination language (`javascript.ts`, `typescript.ts`, `jsx.ts`, `tsx.ts`, `css.ts`, `scss.ts`, `html.ts`, `markdown.ts`, `framework-component.ts`, `latex.ts`). `.mdx` destinations fall through to `tsx.ts` in `dispatch.ts` (identical import semantics). `.vue`, `.svelte`, and `.astro` destinations share `framework-component.ts` (identical import semantics). The JS, TS, CSS, and SCSS builders export a config-reading `buildXImportSnippet` wrapper above a pure `buildXImportSnippetByStyle(styleIndex, relativePath)` renderer (SCSS's wrapper is `buildScssImportSnippet(sourceFilePath, relativePath)`, which also runs `prepareScssImportPath`; the wrapper is reused by `framework-component.ts` for a `.scss` source in an SFC `<style>` block). HTML and LaTeX deviate by resolving config inline in `buildSnippet` (no wrapper): HTML exports styled builders (script, image, video, audio) plus fixed-shape builders (stylesheet, text-track); LaTeX exports three styled renderers (graphics, `\input`, bibliography) plus `isTexGraphicsSource` / `resolveGraphicsPath`. Markdown also deviates: it exports the hardcoded `buildMarkdownImportSnippet` for Markdown-to-Markdown links (no config, no style variants) and `buildMarkdownImageImportSnippetByStyle` for the configurable image shapes (the only Markdown variant with user-selectable styles). In `variants.ts:buildHtmlVariants` the styled builders are called once per `HTML_*_IMPORT_OPTIONS` entry inside a `.map(opt => …)`, while the fixed-shape builders are invoked directly as single hardcoded variants.

The `_`-prefixed files are internal to the `snippets/` subtree — importing them from outside `snippets/` is a smell. The `languages/` modules importing `../_styles`, `../_react`, and `../_class-name` is expected (they are within the subtree). Per-file export contracts, intra-directory delegation, and source-classification routing are documented in [`languages/CLAUDE.md`](languages/CLAUDE.md).

## `_styles.ts` — string-equality contracts

Every `ImportStyle.description` string is a **byte-exact contract** with `package.json:contributes.configuration.properties.<setting>.enum`. `resolveStyleIndex(table, configValue)` looks up by string equality. Drift causes a silent `undefined` result and a `default:` branch in the consuming snippet builder.

`value` is just a switch-case key. It is never serialised, never compared across tables. Reordering and renumbering inside one table is safe — what matters is that the consuming `switch` matches.

### Parity-only tables

`CSS_IMAGE_IMPORT_OPTIONS`, `HTML_STYLESHEET_IMPORT_OPTIONS`, and `MARKDOWN_IMPORT_OPTIONS` declare a single entry each, purely for `package.json` UI parity. The consuming snippet builder hardcodes that single shape and never calls `resolveStyleIndex`. They are parity-only — never consulted at runtime. Safe to delete only **with** the matching `package.json` setting.

The remaining HTML tables — `HTML_SCRIPT_IMPORT_OPTIONS`, `HTML_IMAGE_IMPORT_OPTIONS`, `HTML_VIDEO_IMPORT_OPTIONS`, `HTML_AUDIO_IMPORT_OPTIONS` — are multi-entry and actively consumed by `resolveStyleIndex` in `languages/html.ts`.

Note: there is no `SCSS_IMAGE_IMPORT_OPTIONS` — SCSS image sources reuse `buildCssImageImportSnippet` from `languages/css.ts`, since the `url('…')` syntax is identical between the two languages. The `auto-import.importStatement.styleSheet.scssImageImportStyle` setting exists in `package.json` for UI parity but is not consumed at runtime — matching the single-shape settings above, the snippet builder hardcodes the one shape directly.

## JSX/TSX/MDX share `_react.ts:buildReactImport`

Parameterised by `primaryExtensions` / `primarySnippet` (and optional `fallbackExtensions` / `fallbackSnippet`):

- **JSX**: `primaryExtensions: ['.js', '.jsx']` → `buildJavaScriptImportSnippet`. No fallback.
- **TSX**: `primaryExtensions: ['.ts', '.tsx']` → `buildTypeScriptImportSnippet`. `fallbackExtensions: ['.js', '.jsx']` → `buildJavaScriptImportSnippet` (a `.js` source dropped into a TSX file should emit a JS-shaped import, not TS).
- **MDX**: identical to TSX — `primaryExtensions: ['.ts', '.tsx']` + TS primary + JS fallback for `.js`/`.jsx` sources. MDX content is JSX-with-Markdown-syntax and canonically imports `.tsx` / `.ts` components.

Non-script sources delegate to `buildAssetImportStatement(sourceFileExt, importPath)` (also in `_react.ts`) — the single canonical asset-shape switch:

- CSS Modules (`.module.css`/`.module.scss`) → `import ${1:styles} from '<path>';` (checked before the `switch`; `styles` is the CSS-Modules idiom — never basename-derived)
- **Plain assets** `.gif`/`.jpeg`/`.jpg`/`.png`/`.svg`/`.avif`/`.webp`/`.json`/`.html`/`.yml`/`.yaml`/`.pdf` → `import ${1:⟨derived⟩} from '<path>';` — the binding is **pre-filled** from the source basename via `path/import-name.ts:deriveImportName`, falling back to `${1:name}` when no legal identifier forms. (`.pdf` reaches THIS asset switch only from JSX/TSX/MDX, the any-source destinations; for `.tex` destinations `.pdf` is instead a graphics source gated by `TEX_GRAPHICS_FILE_EXTENSIONS` and rendered by `latex.ts:buildTexGraphicsImportSnippetByStyle`. `isPairSupported()` keeps `.pdf` out of every other destination.)
- **Framework SFCs** `.vue`/`.svelte`/`.astro` → `import ${1:⟨PascalCase⟩} from '<path>';` — the binding is **pre-filled** with the conventional PascalCase component identifier via `path/import-name.ts:deriveComponentName` (`my-button.vue` → `MyButton`), falling back to `${1:name}` when no legal identifier forms.
- **Markdown/MDX** `.md`/`.mdx` → `import ${1:name} from '<path>';` — kept generic (neither camelCased like a plain asset nor PascalCased like an SFC): the shipped PascalCase pathway is scoped to framework SFCs, so Markdown-as-component naming stays out (see `docs/import-statements/decisions/framework-components.md`, locked-in decision #14).
- `.mp4`/`.webm`/`.mov`/`.mp3`/`.ogg`/`.wav`/`.m4a`/`.vtt` → `import ${1:⟨derived⟩} from '<path>';` — basename-derived, falling back to `${1:url}`.
- `.woff`/`.woff2`/`.ttf`/`.eot`/`.css`/`.scss` → `import '<path>';` (side-effect — no binding)
- `default:` → `null`, which `buildReactImport` wraps as an empty `SnippetString` (means an unsupported extension slipped through gating in `src/gating.ts`).

The picker flow's `variants.ts:buildReactNonScriptVariant`, `languages/framework-component.ts`, and the framework-component-source branches of `languages/typescript.ts` / `languages/javascript.ts` (SFC sources into `.ts`/`.js`) all call this same `buildAssetImportStatement`. One switch, shared by all its callers — no parallel copy to keep in sync.

## Framework SFC `<style>`-block stylesheet dialect

`.vue`/`.svelte`/`.astro` accept `.css`/`.scss` sources (spread into their `*_SUPPORTED_EXTENSIONS` lists via `STYLESHEET_FILE_EXTENSIONS`). The shape depends on **where the gesture lands**, decided once per gesture by `editor/placement.ts:isStyleBlockContext` and threaded in as `insideStyleBlock`:

- **Inside a `<style…>` block** (`insideStyleBlock` true) — the source takes the **stylesheet dialect**: a `.css` source → `languages/css.ts:buildCssImportSnippet` (respects `cssImportStyle`; full extension kept), a `.scss` source → `languages/scss.ts:buildScssImportSnippet` (respects `scssImportStyle` + `preserveStylesheetFileExtension`, strips a partial's leading `_`, always keeps a foreign `.css`). The **source extension** — not the block's `lang` attribute — picks CSS vs. SCSS. `framework-component.ts` tests the source against `STYLESHEET_FILE_EXTENSIONS` and delegates to those two `css.ts`/`scss.ts` wrappers.
- **Anywhere else** (script block / frontmatter / template) — the source falls through to `_react.ts:buildAssetImportStatement`, whose `.css`/`.scss` arm is the **side-effect** `import '<path>';` (the canonical global-stylesheet shape). The CSS-Modules `${1:styles}` guard fires only here (script context), never in a `<style>` block.

Placement mirrors the shape: a style-dialect gesture lands inside the enclosing `<style>` block (`insertSnippetAtStyleBlock` / `computeStyleBlockPlacement`, `editor/`); a script-dialect one lands in the `<script>`/frontmatter region. A **mixed** multi-file gesture (any non-stylesheet member) stays script-dialect for the whole block, which is why `isStyleBlockContext` requires *every* source to be a stylesheet. No `<style>` block is ever synthesised — without one, the script dialect is already correct. Full design (local library): `docs/import-statements/spec/framework-components.md`; rationale + rejection ledger: `docs/import-statements/decisions/framework-components.md`.

## Language quirks

### TypeScript class-name detection + legacy-Angular fallback

Both `buildSnippet()` and `variants.ts` (`.ts` case) call `readExportedClassName(sourceFilePath)` from `_class-name.ts` before building the snippet. If the source file contains a top-level `export class Name`, the detected name is passed as `detectedImportName`.

Import-name resolution per style index:

- **Index 0** (`import { name } from '...';`): uses `detectedImportName` if available; otherwise falls back to `generateAngularLegacyImportName()`, which derives a PascalCase identifier when the path matches a suffix in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component`, `.directive`, `.pipe`, `.service`, `.module`). The derived name is validated against `/^[A-Za-z_$][\w$]*$/`; if it is not a legal identifier (e.g. a space-containing basename) — or if no suffix matches — it emits `$1` instead.
- **Indices 1, 2, 6** (the default-import positions): pre-fill `${1:⟨derived⟩}` from the source basename via `path/import-name.ts:deriveImportName`, falling back to a bare `$1` when no legal identifier forms.
- **Indices 4, 5** (the type-only positions `import type { $1 }` / `import { $1, type $2 }`): use `$1` unconditionally — a type import's binding must name an actual export, so it is never basename-guessed.
- **Index 3** (`import '${relativePath}';`): side-effect import — no binding, so no `$1`.
- **Default branch** (when `resolveStyleIndex` returns `undefined`): the named-import shape, so `detectedImportName` if available; otherwise `$1`.

The Angular substitution is back-compat for legacy Angular codebases (v2–v17, ~2016 onward); standalone-era Angular (v17+) generally does not use these suffixes. Don't break this when refactoring `buildTypeScriptImportSnippet()`.

### Default-import auto-naming from the source basename

The default-import positions across every builder pre-fill their `${1:…}` binding with an identifier derived from the source basename, so a paste/drop arrives with a sensible name selected instead of an empty `$1`. The camelCase derivation lives in `path/import-name.ts:deriveImportName` (splits the extension-stripped basename on `-`/`_`/`.`/space, camelCases, **preserves the first segment's case** so `App.jsx` → `App` and `logo.svg` → `logo`, validates against `/^[A-Za-z_$][\w$]*$/`, returns `null` on failure); its PascalCase sibling `deriveComponentName` (framework SFCs) shares the same split and guard. Its consumers:

- **JS builder** (`buildJavaScriptImportSnippetByStyle`) — styles 0, 2, 3, 5, 6 and the `default:` arm (the named import at style 1 stays `$1`).
- **TS builder** (`buildTypeScriptImportSnippetByStyle`) — styles 1, 2, 6 (index 0 keeps its class-detection / Angular mechanism; the type positions stay `$1`).
- **Asset switch** (`_react.ts:buildAssetImportStatement`) — the plain-asset name group and the media/text-track url group. Framework SFCs (`.vue`/`.svelte`/`.astro`) use the PascalCase sibling `deriveComponentName` instead (`my-button.vue` → `MyButton`); Markdown/MDX keep the generic `${1:name}`; CSS-modules keeps `${1:styles}`.

On `null` (a leading-digit or non-ASCII basename like `404.png`), each caller falls back to its prior placeholder (`$1` / `${1:name}` / `${1:url}`). A pre-filled tab stop arrives selected, so type-over behaviour is identical to a bare `$1` — the feature is strictly additive. Full rationale: `docs/import-statements/decisions/statements.md`.

### SCSS — partial filename + `.css` always preserved

- `normalizePartialFilename(relativePath)` strips a leading `_` from the *last* path segment: `_partial.scss` → `partial`. Sass resolves underscored partials against the bare name in `@import`/`@use`.
- `determineScssExtension(sourceFilePath)` always preserves `.css` on the import path **regardless** of the user's `preserveStylesheetFileExtension` setting (Sass needs the extension to recognise foreign-language imports). Other source types respect the setting.
- SCSS image sources reuse `buildCssImageImportSnippet` from `languages/css.ts` — the `url('…')` syntax is identical between the two languages, so no SCSS-specific image variant exists.

### HTML — configurable + fixed shapes, full extension preserved

HTML dispatches on `determineImportType(sourceFilePath)`. Configurable via `resolveStyleIndex`: `<script>` (default is modern minimal without `type`), `<img>`, `<video>`, `<audio>`. Fixed single-shape: `<link>` (stylesheet) and `<track>` (text-track / subtitles).

### Markdown — fixed link + configurable image, full extension preserved

Markdown emits `[text](path)` for Markdown-to-Markdown links (fixed), with configurable shapes for image sources (bare inline, inline with hover-text title, HTML `<img>` embed for sizing). An **extensionless source** (`LICENSE`, `Dockerfile`, `Makefile`) also emits the fixed `[text](path)` link, handled **before** `determineImportType` (whose `'image'` default arm would otherwise emit `![…]`); `.md` is the only destination that accepts an extensionless source (the `gating.ts` first clause). **Full source extension is always preserved on the path** — neither HTML nor Markdown has an extension-stripping convention.

### LaTeX — raw-extension dispatch, forced-cursor, the multi-line figure

`latex.ts` serves a destination with its **own** multi-shape picker namespace (`latex.*`) for non-script sources. It branches on the **raw source extension** — not `determineImportType`, which returns `'image'` for `.tex` / `.bib` / `.eps` alike: graphics (`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`) → `figure` / `\includegraphics`, `.tex` → `\input` / `\include`, `.bib` → `\addbibresource` / `\bibliography`. Config is resolved inline in `buildSnippet` (like SCSS/HTML); the `buildTex…ImportSnippetByStyle` renderers stay config-free, and `isTexGraphicsSource` / `resolveGraphicsPath` are exported for `variants.ts` reuse.

- **The figure default is the only multi-line `SnippetString` in the extension.** `variants.ts:renderLabel` gained a `.replace(/\n\s*/g, ' ')` so the QuickPick label collapses to one line — a no-op for every other (single-line) shape. The enum `description` is a clean single-line `\begin{figure}…\end{figure}`, decoupled from the multi-line rendered output.
- **Forced-cursor placement.** `.tex` joins `.html` / `.md` in `shouldRepositionCursor` (`editor/placement.ts`) — a figure / `\input` belongs in the body, never the preamble (line 0). `.tex` is **not** in `SCRIPT_FILE_EXTENSIONS`, so insertion uses the cursor column (not forced 0), and `IMPORT_INDICATORS` carries no LaTeX markers (Bottom placement never runs for `.tex`).
- **Per-relationship extension policy.** Graphics honour `latex.preserveGraphicsFileExtension` (**default `true` — keep**, inverted from the script/stylesheet preserve toggles); `\input` / `\include` always drop `.tex`; `\addbibresource` keeps `.bib`, `\bibliography` drops it (so the bib renderer takes the extensionless path *plus* the extension and decides per case).
- **Graphics format set ≠ web images.** `TEX_GRAPHICS_FILE_EXTENSIONS` (`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`) is the engine-renderable set — `.svg`/`.gif`/`.webp`/`.avif` are deliberately excluded (`pdflatex` can't render them).

Full design (local design library): `docs/import-statements/spec/latex.md` · rationale + rejection ledger: `docs/import-statements/decisions/latex.md`.

## Adding a new destination language

1. New file in `languages/`, named after the language.
2. New `case` in `dispatch.ts:buildImportSnippet`.
3. New `case` in `variants.ts:buildImportSnippetVariants` (so the picker commands work for the new destination).
4. New `case` in `types/file-extension.ts:ScriptFileExtension` (if scripty) or the relevant category type.
5. New gating table or entry in `constants/extensions.ts`.
6. New `*_IMPORT_OPTIONS` table in `_styles.ts` and matching `package.json` enum (three-site sync).
7. New `if` clause in `gating.ts:isPairSupported` checking the gating table from step 5 — **only if the destination restricts its sources**. A script-like destination that accepts all sources (like `.jsx`/`.tsx`/`.mdx`) just needs the `CROSS_IMPORT_DESTINATIONS` entry from step 5 and skips this.
8. New entry in `drop/selector.ts:DROP_LANGUAGE_SELECTORS` — `{ language, scheme: 'file' }` if the extension has a guaranteed VS Code language ID, otherwise `{ pattern: '**/*.ext', scheme: 'file' }` (as done for `.mdx`/`.tex`, which open as plaintext). See `drop/CLAUDE.md`.
