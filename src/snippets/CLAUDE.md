# src/snippets/CLAUDE.md

Per-language snippet builders + the destination-extension dispatch in `dispatch.ts`. The public surface of this directory is `dispatch.ts:buildImportSnippet()`.

## Files

- `dispatch.ts` — single-level destination-extension switch.
- `javascript.ts`, `typescript.ts`, `jsx.ts`, `tsx.ts`, `css.ts`, `scss.ts`, `html.ts`, `markdown.ts` — one module per destination language.
- `_shared.ts` — internal: `buildReactImport` shared by JSX/TSX.
- `_styles.ts` — internal: `ImportStyle[]` tables + `resolveStyleIndex`.

The `_`-prefixed files are directory-internal — importing them from outside `snippets/` is a smell.

## `_styles.ts` — string-equality contracts

Every `ImportStyle.description` string is a **byte-exact contract** with `package.json:contributes.configuration.properties.<setting>.enum`. `resolveStyleIndex(table, configValue)` looks up by string equality. Drift causes a silent `undefined` result and a `default:` branch in the consuming snippet builder.

`value` is just a switch-case key. It is never serialised, never compared across tables. Reordering and renumbering inside one table is safe — what matters is that the consuming `switch` matches.

### "Currently unused" tables

`CSS_IMAGE_IMPORT_OPTIONS`, the three `HTML_*_IMPORT_OPTIONS`, and `MARKDOWN_IMPORT_OPTIONS` declare a single entry each, purely for `package.json` UI parity. The consuming snippet builder hardcodes that single shape and never calls `resolveStyleIndex`. They are flagged "Currently unused" in the table TSDoc — kept for parity. Safe to delete only **with** the matching `package.json` setting.

Note: there is no `SCSS_IMAGE_IMPORT_OPTIONS` — SCSS image sources reuse `buildCssImageImportSnippet` from `css.ts`, since the `url('…')` syntax is identical between the two languages. The `auto-import.importStatement.styleSheet.scssImageImportStyle` setting still exists in `package.json` for UI parity but is consumed via the CSS table at lookup time.

## JSX/TSX share `_shared.ts:buildReactImport`

Parameterised by `primaryExtensions` / `primarySnippet` (and optional `fallbackExtensions` / `fallbackSnippet`):

- **JSX**: `primaryExtensions: ['.js', '.jsx']` → `buildJavaScriptImportSnippet`. No fallback.
- **TSX**: `primaryExtensions: ['.ts', '.tsx']` → `buildTypeScriptImportSnippet`. `fallbackExtensions: ['.js']` → `buildJavaScriptImportSnippet` (a `.js` source dropped into a TSX file should emit a JS-shaped import, not TS).

Non-script sources fall through to a hardcoded `switch`:

- `.gif`/`.jpeg`/`.jpg`/`.png`/`.webp`/`.json`/`.html`/`.yml`/`.yaml`/`.md` → `import name$1 from '<path>';`
- `.woff`/`.woff2`/`.ttf`/`.eot`/`.css`/`.scss` → `import '<path>';` (side-effect)
- `default:` → empty `SnippetString` (means an unsupported extension slipped through gating in `commands/paste-import.ts`).

## Language quirks

### TypeScript Angular substitution — **only at index 1**

Index 1 is `import { name } from '_relativePath_';`. When the path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module` (Angular filename conventions), `generateImportName(relativePath)` returns a PascalCase identifier derived from the basename:

```
app-root.component.ts → import { AppRootComponent } from '...';
```

Every other index uses `$1` unconditionally. Don't break this when refactoring `buildTypeScriptImportSnippet()`.

### SCSS — partial filename + `.css` always preserved

- `normalizePartialFilename(relativePath)` strips a leading `_` from the *last* path segment: `_partial.scss` → `partial`. Sass resolves underscored partials against the bare name in `@import`/`@use`.
- `determineScssExtension(sourceFilePath)` always preserves `.css` on the import path **regardless** of the user's `preserveStylesheetFileExtension` setting (Sass needs the extension to recognise foreign-language imports). Other source types respect the setting.
- SCSS image sources reuse `buildCssImageImportSnippet` from `css.ts` — the `url('…')` syntax is identical between the two languages, so no SCSS-specific image variant exists.

### HTML / Markdown — fixed shapes, full extension preserved

HTML emits `<script type="text/javascript" src="…"></script>`, `<img src="…" alt="sample">`, or `<link href="…" rel="stylesheet">` based on `determineImportType`. Markdown emits `![text](path)` for Markdown sources, with two configurable shapes for image sources. **Full source extension is always preserved on the path** — there's no extension-stripping convention for these languages.

## Adding a new destination language

1. New file here, named after the language.
2. New `case` in `dispatch.ts:buildImportSnippet`.
3. New `case` in `types/file-extension.ts:ScriptFileExtension` (if scripty) or the relevant category type.
4. New gating table or entry in `constants/extensions.ts`.
5. New `*_IMPORT_OPTIONS` table in `_styles.ts` and matching `package.json` enum (three-site sync).
