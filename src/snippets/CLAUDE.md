# src/snippets/CLAUDE.md

Per-language snippet builders + the destination-extension dispatch in `dispatch.ts`. The public surface of this directory is `dispatch.ts:buildImportSnippet()` (used by the default paste flow and the drag-drop provider) and `variants.ts:buildImportSnippetVariants()` (used by the pick-style and set-default-import-style commands).

## Files

- `dispatch.ts` — single-level destination-extension switch consumed by `commands/paste-import.ts` and `drop/provider.ts`.
- `variants.ts` — parallel aggregator that enumerates every applicable style for the current paste, consumed by `extension.pasteImportWithStyle` and `extension.setDefaultImportStyle`. Mirrors `dispatch.ts`'s destination switch and the per-language source classification, but calls each language's `buildXImportSnippetByStyle` **twice** per `*_IMPORT_OPTIONS` entry — once with the full relative path (for `snippetText`, the insertion payload) and once with `path.basename(...)` of that path (for `label`, the picker preview). The basename render keeps QuickPick labels short and width-stable regardless of source nesting depth (`'../../components/widget'` → `'widget'`). Each styled variant also carries a `setting?: { namespace, key, value }` triple pointing at the backing `package.json` setting, so `set-default-import-style.ts` can persist the chosen style via `setAutoImportSetting` without re-deriving the destination → table mapping. Hardcoded variants leave `setting` undefined. The "twice per entry" applies to script/styled sources; non-script and fixed-shape sources (HTML `<link>`/`<track>`, CSS/SCSS images, Markdown links, JSX/TSX/MDX non-script imports) instead build hardcoded variants via `toHardcodedVariant` without calling the `…ByStyle` builders.
- `_react.ts` — internal: `buildReactImport` (+ supporting `ReactImportOptions` interface / `BuildScriptSnippet` type) shared by JSX/TSX/MDX.
- `_styles.ts` — internal: `ImportStyle[]` tables + `resolveStyleIndex`. Most entries on the nine active tables carry an optional `tag` (free-form short label) used by the QuickPick rendered in `paste-import-with-style.ts` — 35 of the 38 active entries. The three exceptions are the first entry of `HTML_IMAGE_IMPORT_OPTIONS`, `HTML_VIDEO_IMPORT_OPTIONS`, and `HTML_AUDIO_IMPORT_OPTIONS`, which fall back to the full description via `opt.tag ?? opt.description` (`variants.ts:346`).
- `_class-name.ts` — internal: `readExportedClassName` reads a TS/JS source file and returns the first top-level exported class name (or `null`). `extractFirstExportedClassName` is the pure extraction function (strips comments first). Consumed by `languages/typescript.ts` and `variants.ts`.
- `languages/` — one module per destination language (`javascript.ts`, `typescript.ts`, `jsx.ts`, `tsx.ts`, `css.ts`, `scss.ts`, `html.ts`, `markdown.ts`, `framework-component.ts`). `.mdx` destinations fall through to `tsx.ts` in `dispatch.ts` (identical import semantics). `.vue`, `.svelte`, and `.astro` destinations share `framework-component.ts` (identical import semantics). The six styled languages (JS, TS, CSS, SCSS, HTML, MD-image) export both a config-reading `buildXImportSnippet` and pure `buildXImportSnippetByStyle(styleIndex, relativePath)` functions. HTML exports four styled builders (script, image, video, audio) plus two fixed-shape builders (stylesheet, text-track). In `variants.ts:buildHtmlVariants` the four styled builders are called once per `HTML_*_IMPORT_OPTIONS` entry inside a `.map(opt => …)`, while the two fixed-shape builders are invoked directly as single hardcoded variants.

The `_`-prefixed files are internal to the `snippets/` subtree — importing them from outside `snippets/` is a smell. The `languages/` modules importing `../_styles`, `../_react`, and `../_class-name` is expected (they are within the subtree). Per-file export contracts, intra-directory delegation, and source-classification routing are documented in [`languages/CLAUDE.md`](languages/CLAUDE.md).

## `_styles.ts` — string-equality contracts

Every `ImportStyle.description` string is a **byte-exact contract** with `package.json:contributes.configuration.properties.<setting>.enum`. `resolveStyleIndex(table, configValue)` looks up by string equality. Drift causes a silent `undefined` result and a `default:` branch in the consuming snippet builder.

`value` is just a switch-case key. It is never serialised, never compared across tables. Reordering and renumbering inside one table is safe — what matters is that the consuming `switch` matches.

### "Currently unused" tables

`CSS_IMAGE_IMPORT_OPTIONS`, `HTML_STYLESHEET_IMPORT_OPTIONS`, and `MARKDOWN_IMPORT_OPTIONS` declare a single entry each, purely for `package.json` UI parity. The consuming snippet builder hardcodes that single shape and never calls `resolveStyleIndex`. They are currently unused — kept for parity. Safe to delete only **with** the matching `package.json` setting.

The remaining HTML tables — `HTML_SCRIPT_IMPORT_OPTIONS` (5 entries), `HTML_IMAGE_IMPORT_OPTIONS` (3), `HTML_VIDEO_IMPORT_OPTIONS` (4), `HTML_AUDIO_IMPORT_OPTIONS` (2) — are multi-entry and actively consumed by `resolveStyleIndex` in `languages/html.ts`.

Note: there is no `SCSS_IMAGE_IMPORT_OPTIONS` — SCSS image sources reuse `buildCssImageImportSnippet` from `languages/css.ts`, since the `url('…')` syntax is identical between the two languages. The `auto-import.importStatement.styleSheet.scssImageImportStyle` setting exists in `package.json` for UI parity but is not consumed at runtime — matching the three single-shape settings above, the snippet builder hardcodes the one shape directly.

## JSX/TSX/MDX share `_react.ts:buildReactImport`

Parameterised by `primaryExtensions` / `primarySnippet` (and optional `fallbackExtensions` / `fallbackSnippet`):

- **JSX**: `primaryExtensions: ['.js', '.jsx']` → `buildJavaScriptImportSnippet`. No fallback.
- **TSX**: `primaryExtensions: ['.ts', '.tsx']` → `buildTypeScriptImportSnippet`. `fallbackExtensions: ['.js', '.jsx']` → `buildJavaScriptImportSnippet` (a `.js` source dropped into a TSX file should emit a JS-shaped import, not TS).
- **MDX**: identical to TSX — `primaryExtensions: ['.ts', '.tsx']` + TS primary + JS fallback for `.js`/`.jsx` sources. MDX content is JSX-with-Markdown-syntax and canonically imports `.tsx` / `.ts` components.

Non-script sources fall through to a hardcoded `switch` with four groups:

- CSS Modules (`.module.css`/`.module.scss`) → `import ${1:styles} from '<path>';` (checked before the `switch`)
- `.gif`/`.jpeg`/`.jpg`/`.png`/`.svg`/`.avif`/`.webp`/`.json`/`.html`/`.yml`/`.yaml`/`.md`/`.mdx`/`.pdf`/`.vue`/`.svelte`/`.astro` → `import ${1:name} from '<path>';`
- `.mp4`/`.webm`/`.mov`/`.mp3`/`.ogg`/`.wav`/`.m4a`/`.vtt` → `import ${1:url} from '<path>';`
- `.woff`/`.woff2`/`.ttf`/`.eot`/`.css`/`.scss` → `import '<path>';` (side-effect)
- `default:` → empty `SnippetString` (means an unsupported extension slipped through gating in `src/gating.ts`).

The picker flow duplicates this same source-extension switch in `variants.ts:buildReactNonScriptVariant` (lines 180-226), returning `ImportSnippetVariant | null` instead of a `SnippetString`; keep the two in sync.

## Language quirks

### TypeScript class-name detection + legacy-Angular fallback

Both `buildSnippet()` (line 18) and `variants.ts` (`.ts` case) call `readExportedClassName(sourceFilePath)` from `_class-name.ts` before building the snippet. If the source file contains a top-level `export class Name`, the detected name is passed as `detectedImportName`.

Import-name resolution per style index:

- **Index 0** (`import { name } from '...';`): uses `detectedImportName` if available; otherwise falls back to `generateAngularLegacyImportName()`, which derives a PascalCase identifier when the path matches a suffix in `LEGACY_ANGULAR_FILE_SUFFIXES` (`.component`, `.directive`, `.pipe`, `.service`, `.module`), or emits `$1` if neither applies.
- **Indices 1–6**: use `$1` unconditionally.
- **Default branch** (when `resolveStyleIndex` returns `undefined`): uses `detectedImportName` if available; otherwise `$1`.

The Angular substitution is back-compat for legacy Angular codebases (v2–v17, ~2016 onward); standalone-era Angular (v17+) generally does not use these suffixes. Don't break this when refactoring `buildTypeScriptImportSnippet()`.

### SCSS — partial filename + `.css` always preserved

- `normalizePartialFilename(relativePath)` strips a leading `_` from the *last* path segment: `_partial.scss` → `partial`. Sass resolves underscored partials against the bare name in `@import`/`@use`.
- `determineScssExtension(sourceFilePath)` always preserves `.css` on the import path **regardless** of the user's `preserveStylesheetFileExtension` setting (Sass needs the extension to recognise foreign-language imports). Other source types respect the setting.
- SCSS image sources reuse `buildCssImageImportSnippet` from `languages/css.ts` — the `url('…')` syntax is identical between the two languages, so no SCSS-specific image variant exists.

### HTML — configurable + fixed shapes, full extension preserved

HTML dispatches on `determineImportType(sourceFilePath)` and emits six tag types. Four are configurable via `resolveStyleIndex`: `<script>` (5 styles — default is modern minimal without `type`), `<img>` (3 styles), `<video>` (4 styles), `<audio>` (2 styles). Two are fixed single-shape: `<link>` (stylesheet) and `<track>` (text-track / subtitles).

### Markdown — fixed link + configurable image, full extension preserved

Markdown emits `[text](path)` for Markdown-to-Markdown links (fixed), with three configurable shapes for image sources (bare inline, inline with hover-text title, HTML `<img>` embed for sizing). **Full source extension is always preserved on the path** — neither HTML nor Markdown has an extension-stripping convention.

## Adding a new destination language

1. New file in `languages/`, named after the language.
2. New `case` in `dispatch.ts:buildImportSnippet`.
3. New `case` in `variants.ts:buildImportSnippetVariants` (so the picker commands work for the new destination).
4. New `case` in `types/file-extension.ts:ScriptFileExtension` (if scripty) or the relevant category type.
5. New gating table or entry in `constants/extensions.ts`.
6. New `*_IMPORT_OPTIONS` table in `_styles.ts` and matching `package.json` enum (three-site sync).
7. New `if` clause in `gating.ts:isPairSupported` checking the gating table from step 5 — **only if the destination restricts its sources**. A script-like destination that accepts all sources (like `.jsx`/`.tsx`/`.mdx`) just needs the `CROSS_IMPORT_DESTINATIONS` entry from step 5 and skips this.
8. New `{ language, scheme: 'file' }` entry in `drop/selector.ts:DROP_LANGUAGE_SELECTORS`.
