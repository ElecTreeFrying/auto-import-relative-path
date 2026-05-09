# src/snippets/

Per-language snippet builders and the destination-extension dispatch. The public surface of this directory is `dispatch.ts:buildImportSnippet()`.

## Files

| File | Purpose |
|------|---------|
| `dispatch.ts` | `buildImportSnippet()` — switches on `destinationFileExt` and delegates. The public entry point. |
| `javascript.ts` | JS shapes (9 styles) via `auto-import.importStatement.script.javascriptImportStyle`. |
| `typescript.ts` | TS shapes (5 styles), with Angular PascalCase substitution at index 1. |
| `jsx.ts` | JSX entry — delegates to `_shared.ts:buildReactImport` with JS as primary. |
| `tsx.ts` | TSX entry — delegates to `_shared.ts:buildReactImport` with TS primary, JS fallback for `.js` sources. |
| `css.ts` | CSS shapes (2 styles); `buildCssImageImportSnippet` exported for SCSS reuse. |
| `scss.ts` | SCSS shapes (4 styles), with partial-filename underscore stripping and asymmetric `.css` extension preservation. |
| `html.ts` | HTML `<script>` / `<img>` / `<link>` (fixed shapes). |
| `markdown.ts` | Markdown link (fixed) + image (2 configurable styles). |
| `_shared.ts` | Internal: `buildReactImport` shared by JSX/TSX. |
| `_styles.ts` | Internal: `ImportStyle[]` tables + `resolveStyleIndex` lookup. |

`_`-prefixed files are directory-internal. Importing them from outside `snippets/` is a smell.

## Where to add new code

- **New destination language** → new module here + `case` in `dispatch.ts` + `case` in `src/types/file-extension.ts` + a gating table in `src/constants/extensions.ts`.
- **New style for an existing language** → entry in the relevant `*_IMPORT_OPTIONS` table in `_styles.ts` + matching `enum` value in `package.json` + matching `case` in the per-language `switch`. See three-site sync in `CLAUDE.md` (this directory) and `src/config/CLAUDE.md`.
