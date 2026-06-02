# src/snippets/

Per-language snippet builders and the destination-extension dispatch. The public surface of this directory is `dispatch.ts:buildImportSnippet()` (default paste flow + drag-drop provider) and `variants.ts:buildImportSnippetVariants()` (pick-style + set-default flows).

## Files

| File | Purpose |
|------|---------|
| `dispatch.ts` | `buildImportSnippet()` — switches on `destinationFileExt` and delegates. The public entry point for the default paste flow. |
| `variants.ts` | `buildImportSnippetVariants()` — enumerates every applicable style for the current source/destination pair. Consumed by `pasteImportWithStyle` and `setDefaultImportStyle`; renders full-path snippets for insertion and basename-only labels for the QuickPick in parallel. |
| `_react.ts` | Internal: `buildReactImport` (+ supporting `ReactImportOptions` interface / `BuildScriptSnippet` type) shared by JSX/TSX/MDX, plus `buildAssetImportStatement` — the single canonical non-script asset-shape switch reused by `buildReactImport`, `languages/framework-component.ts`, and `variants.ts`. |
| `_styles.ts` | Internal: `ImportStyle` interface + `*_IMPORT_OPTIONS` tables + `resolveStyleIndex` lookup. |
| `_class-name.ts` | Internal: reads source files for exported class names; consumed by `typescript.ts` and `variants.ts`. |

### `languages/`

One module per destination language.

| File | Purpose |
|------|---------|
| `javascript.ts` | JS shapes (7 styles) via `auto-import.importStatement.script.javascriptImportStyle`. |
| `typescript.ts` | TS shapes (7 styles), with Angular PascalCase substitution at index 0. |
| `jsx.ts` | JSX entry — delegates to `_react.ts:buildReactImport` with JS as primary. |
| `tsx.ts` | TSX/MDX entry — delegates to `_react.ts:buildReactImport` with TS primary, JS fallback for `.js`/`.jsx` sources. `.mdx` shares this builder via fall-through in `dispatch.ts`. |
| `css.ts` | CSS shapes (2 styles); `buildCssImageImportSnippet` exported for SCSS reuse. |
| `scss.ts` | SCSS shapes (5 styles), with partial-filename underscore stripping and asymmetric `.css` extension preservation. |
| `html.ts` | HTML `<script>` (5 styles) / `<img>` (3) / `<video>` (4) / `<audio>` (2) configurable + `<link>` / `<track>` fixed. |
| `markdown.ts` | Markdown link (fixed) + image (3 configurable styles). |
| `framework-component.ts` | Vue/Svelte/Astro entry — script sources (`.ts`/`.tsx`/`.js`/`.jsx`) delegate to `buildTypeScriptImportSnippet` (extension stripped per preserve setting); non-script sources delegate to `../_react:buildAssetImportStatement`. All three share identical import semantics. |

`_`-prefixed files are internal to the `snippets/` subtree. Importing them from outside `snippets/` is a smell; `languages/` modules importing `../_styles`, `../_react`, and `../_class-name` is expected.

For per-file export signatures and the editing rules, see [`languages/README.md`](languages/README.md) and [`languages/CLAUDE.md`](languages/CLAUDE.md).

## Where to add new code

- **New destination language** → a new module in `languages/` plus the full eight-step checklist: the 4-site extension sync (`src/types/file-extension.ts`, `src/constants/extensions.ts`, `dispatch.ts`, `variants.ts`), the 3-site style sync (`_styles.ts` + `package.json` + the per-language `switch`), an `isPairSupported` clause in `src/gating.ts`, and a selector entry in `src/drop/selector.ts`. See "Adding a new destination language" in [`CLAUDE.md`](CLAUDE.md) (this directory) for the ordered steps.
- **New style for an existing language** → entry in the relevant `*_IMPORT_OPTIONS` table in `_styles.ts` + matching `enum` value in `package.json` + matching `case` in the per-language `switch`. See three-site sync in [`CLAUDE.md`](CLAUDE.md) (this directory) and [`src/config/CLAUDE.md`](../config/CLAUDE.md).

See [`CLAUDE.md`](CLAUDE.md) (this directory) for the style-sync contracts, the "Currently unused" tables, and the JSX/TSX/MDX shared algorithm.
