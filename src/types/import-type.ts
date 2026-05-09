/**
 * Four-way classifier for a *source* file's role from the perspective of a
 * destination snippet handler. Per-literal docs (below) describe each
 * shape; this header covers cross-cutting consumer rules.
 *
 * @remarks
 * Produced by `path/import-type.ts:determineImportType` (which returns
 * `ImportType | null`) and consumed by `snippets/{css,scss,html,markdown}.ts`.
 * JSX/TSX destinations branch on the raw source extension via
 * `snippets/_shared.ts` and do not consult this classifier.
 *
 * The classifier is deliberately lossy:
 *
 * - `.css → 'stylesheet'` but `.scss → null`, so SCSS-into-SCSS routes
 *   through `buildScssImportSnippet` (which knows about `@use` and partial
 *   filenames) rather than a generic stylesheet bucket.
 * - `.html → null` is defensive — HTML→HTML is rejected by gating before
 *   this classifier runs.
 * - Anything else → `'image'` via the function's `default:` branch. This is
 *   a catch-all, not a guarantee that the source is image-like; the gating
 *   tables in `constants/extensions.ts` are what makes it safe. Reaching
 *   this branch with a `.json` source would mean gating let a bad pair
 *   through.
 */
export type ImportType =
  /** JS-style import: `import` / `require()` / dynamic `import()`. */
  | 'script'
  /** Stylesheet-shaped reference: `@import` or HTML `<link>`. */
  | 'stylesheet'
  /** Markdown text reference: `![text](path)`. */
  | 'markdown'
  /** Image-shaped reference: `url('path')`, `<img>`, or Markdown image. Also the catch-all default for unrecognised extensions. */
  | 'image';
