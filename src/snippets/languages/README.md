# src/snippets/languages/

One module per destination language — the leaf builders `dispatch.ts` and `variants.ts` delegate to. Each turns an already-classified source file into a `vscode.SnippetString` for one destination extension; none of them switch on the *destination* (that is `dispatch.ts`'s job). Every module exports `buildSnippet(info: FilePathInfo)`; the styled languages additionally export pure `buildXImportSnippetByStyle(styleIndex, relativePath)` builders that `variants.ts` drives directly.

## Files

| File | Key exports | Purpose |
|------|-------------|---------|
| `javascript.ts` | `buildSnippet`, `buildJavaScriptImportSnippet`, `…ByStyle` | JS shapes (7 styles). `buildJavaScriptImportSnippet` is reused by `jsx.ts`/`tsx.ts`. |
| `typescript.ts` | `buildSnippet` *(async)*, `buildTypeScriptImportSnippet`, `…ByStyle` | TS shapes (7 styles), with detected/legacy-Angular import-name substitution at style 0. The only async `buildSnippet` — it awaits `readExportedClassName`. |
| `jsx.ts` | `buildSnippet` | Thin JSX entry — hands `buildJavaScriptImportSnippet` to `../_react.ts` as primary, no fallback. |
| `tsx.ts` | `buildSnippet` | TSX/MDX entry — TS primary + JS fallback for `.js`/`.jsx` sources, via `../_react.ts`. `.mdx` reaches here through fall-through in `dispatch.ts`. |
| `css.ts` | `buildSnippet`, `buildCssImportSnippet`, `…ByStyle`, `buildCssImageImportSnippet` | CSS `@import` (2 styles) + `url()` for image sources. `buildCssImageImportSnippet` is reused by `scss.ts`. |
| `scss.ts` | `buildSnippet`, `buildScssImportSnippetByStyle`, `prepareScssImportPath` | SCSS `@use`/`@forward`/`@import` (5 styles); strips partial underscores, always keeps `.css`. Image sources defer to `css.ts`. Unlike CSS/JS/TS, config is resolved inline in `buildSnippet` — there is no `buildScssImportSnippet` wrapper. |
| `html.ts` | `buildSnippet`, four `buildHtml…ImportSnippetByStyle` (script/image/video/audio) + `buildHtmlStylesheetImportSnippet` / `buildHtmlTextTrackImportSnippet` | `<script>` (5) / `<img>` (3) / `<video>` (4) / `<audio>` (2) configurable; `<link>` / `<track>` fixed. |
| `markdown.ts` | `buildSnippet`, `buildMarkdownImportSnippet`, `buildMarkdownImageImportSnippetByStyle` | `[text](path)` link (fixed) + image (3 styles). |
| `framework-component.ts` | `buildSnippet` | Vue/Svelte/Astro entry — script sources (`.ts`/`.tsx`/`.js`/`.jsx`) defer to `buildTypeScriptImportSnippet` (respecting the preserve-extension setting); non-script sources defer to `../_react:buildAssetImportStatement` (which always keeps the full extension). All three share identical semantics. Calling the sync config-lookup wrapper `buildTypeScriptImportSnippet` (not the async `buildSnippet`) keeps this entry synchronous by skipping the `readExportedClassName` file read — so, unlike `typescript.ts`, the script path runs no class-name pre-fill, and style 0 emits `$1` (or the Angular fallback) rather than a detected class name. |

## Intra-directory delegation

Builders reuse each other instead of re-deriving a shape. These are the only imports between modules here:

- `jsx.ts` → `javascript.ts`; `tsx.ts` → `javascript.ts` + `typescript.ts` (the script builders handed to `../_react.ts`).
- `scss.ts` → `css.ts` (`buildCssImageImportSnippet`).
- `framework-component.ts` → `typescript.ts` (`buildTypeScriptImportSnippet`) for script sources, and `../_react` (`buildAssetImportStatement`) for non-script asset sources.

## Where to add new code

- **New destination language** → new module here, then wire the cases in `dispatch.ts` + `variants.ts` + the four-site extension sync. Full checklist in the parent [`../CLAUDE.md`](../CLAUDE.md).
- **New style for an existing language** → don't start here. Add the entry in `../_styles.ts` + `package.json`, then the matching `case` in this directory's per-language `switch`. See three-site sync in [`../CLAUDE.md`](../CLAUDE.md) and [`../../config/CLAUDE.md`](../../config/CLAUDE.md).

See [`CLAUDE.md`](CLAUDE.md) (this directory) for the editing rules. The cross-cutting behavior — Angular fallback, SCSS quirks, the JSX/TSX/MDX shared algorithm, and the style-string sync contract — lives in the parent [`../CLAUDE.md`](../CLAUDE.md).
