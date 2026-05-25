# src/snippets/

Per-language snippet builders and the destination-extension dispatch. The public surface of this directory is `dispatch.ts:buildImportSnippet()` (default paste flow) and `variants.ts:buildImportSnippetVariants()` (pick-style + set-default flows).

## Files

| File | Purpose |
|------|---------|
| `dispatch.ts` | `buildImportSnippet()` — switches on `destinationFileExt` and delegates. The public entry point for the default paste flow. |
| `variants.ts` | `buildImportSnippetVariants()` — enumerates every applicable style for the current source/destination pair. Consumed by `pasteImportWithStyle` and `setDefaultImportStyle`; renders full-path snippets for insertion and basename-only labels for the QuickPick in parallel. |
| `_react.ts` | Internal: `buildReactImport` shared by JSX/TSX/MDX. |
| `_styles.ts` | Internal: `ImportStyle[]` tables + `resolveStyleIndex` lookup. |
| `_class-name.ts` | Internal: reads source files for exported class names; consumed by `typescript.ts` and `variants.ts`. |

### `languages/`

One module per destination language.

| File | Purpose |
|------|---------|
| `javascript.ts` | JS shapes (7 styles) via `auto-import.importStatement.script.javascriptImportStyle`. |
| `typescript.ts` | TS shapes (7 styles), with Angular PascalCase substitution at index 0. |
| `jsx.ts` | JSX entry — delegates to `_react.ts:buildReactImport` with JS as primary. |
| `tsx.ts` | TSX/MDX entry — delegates to `_react.ts:buildReactImport` with TS primary, JS fallback for `.js` sources. `.mdx` shares this builder via fall-through in `dispatch.ts`. |
| `css.ts` | CSS shapes (2 styles); `buildCssImageImportSnippet` exported for SCSS reuse. |
| `scss.ts` | SCSS shapes (5 styles), with partial-filename underscore stripping and asymmetric `.css` extension preservation. |
| `html.ts` | HTML `<script>` (5 styles) / `<img>` (3) / `<video>` (4) / `<audio>` (2) configurable + `<link>` / `<track>` fixed. |
| `markdown.ts` | Markdown link (fixed) + image (3 configurable styles). |
| `framework-component.ts` | Vue/Svelte/Astro entry — delegates to `buildTypeScriptImportSnippet` for all sources; strips extension for script sources per preserve setting. All three share identical import semantics. |

`_`-prefixed files are internal to the `snippets/` subtree. Importing them from outside `snippets/` is a smell; `languages/` modules importing `../_styles`, `../_react`, and `../_class-name` is expected.

## Where to add new code

- **New destination language** → new module in `languages/` + `case` in `dispatch.ts` + `case` in `variants.ts` + `case` in `src/types/file-extension.ts` + a gating table in `src/constants/extensions.ts`.
- **New style for an existing language** → entry in the relevant `*_IMPORT_OPTIONS` table in `_styles.ts` + matching `enum` value in `package.json` + matching `case` in the per-language `switch`. See three-site sync in `CLAUDE.md` (this directory) and `src/config/CLAUDE.md`.
