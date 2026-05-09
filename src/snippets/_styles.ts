/**
 * Per-language tables of available snippet shapes plus the
 * {@link resolveStyleIndex} helper that maps a user's config selection to a
 * numeric switch-case key.
 *
 * @remarks
 * **`description` is a contract, not documentation.** Each entry's
 * `description` is matched by string equality against the user's
 * `vscode.workspace.getConfiguration().get(...)` value (which itself comes
 * from the `enum` list in `package.json:contributes.configuration.
 * properties`). The strings here, the strings in `package.json`, and the
 * strings VS Code persists in `settings.json` must all be byte-identical —
 * a typo or trailing-space drift causes {@link resolveStyleIndex} to
 * silently return `undefined`, and the consuming snippet builder falls
 * through to its `default:` branch.
 *
 * **`value` is just a switch-case key.** It is never serialised, never
 * compared across tables, and has no meaning beyond "which case in this
 * file's `switch` does this option select." Reordering members and
 * renumbering is safe.
 *
 * **Filename starts with `_` to mark this module as internal to
 * `snippets/`.** Importing from outside the `snippets/` directory is a
 * smell — the public surface of this directory is `dispatch.ts`.
 */
export interface ImportStyle {
  /** Numeric switch-case key consumed by the snippet builder; meaningless outside the table that owns it. */
  value: number;
  /** Human-readable snippet shape (with `_relativePath_` placeholder); matched byte-exact against the user's `package.json` enum selection. */
  description: string;
}

/**
 * Returns the `value` of the entry whose `description` matches `configValue`
 * exactly, or `undefined` if no entry matches.
 *
 * @param table - The `ImportStyle[]` lookup table for one language.
 * @param configValue - The user's `description` selection from
 *   `vscode.workspace.getConfiguration().get(...)`.
 * @returns The matched `value`, or `undefined` if `configValue` doesn't
 *   match any entry.
 */
export function resolveStyleIndex(table: ImportStyle[], configValue: string | undefined): number | undefined {
  return table.find(option => option.description === configValue)?.value;
}

/** Nine JS import shapes consumed by `javascript.ts:buildJavaScriptImportSnippet` via the `auto-import.importStatement.script.javascriptImportStyle` setting. */
export const JAVASCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "import name from '_relativePath_';" },
  { value: 1, description: "import { name } from '_relativePath_';" },
  { value: 2, description: "import { default as name } from '_relativePath_';" },
  { value: 3, description: "import * as name from '_relativePath_';" },
  { value: 4, description: "import '_relativePath_';" },
  { value: 5, description: "var name = require('_relativePath_');" },
  { value: 6, description: "const name = require('_relativePath_');" },
  { value: 7, description: "var name = import('_relativePath_');" },
  { value: 8, description: "const name = import('_relativePath_');" },
];

/**
 * Five TS import shapes consumed by `typescript.ts:buildTypeScriptImportSnippet`
 * via the `auto-import.importStatement.script.typescriptImportStyle` setting.
 * Index 1 also triggers Angular PascalCase substitution — see
 * `typescript.ts:generateImportName`.
 */
export const TYPESCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "import name from '_relativePath_';" },
  { value: 1, description: "import { name } from '_relativePath_';" },
  { value: 2, description: "import { default as name } from '_relativePath_';" },
  { value: 3, description: "import * as name from '_relativePath_';" },
  { value: 4, description: "import '_relativePath_';" },
];

/** Two CSS import shapes consumed by `css.ts:buildCssImportSnippet` via the `auto-import.importStatement.styleSheet.cssImportStyle` setting. */
export const CSS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import url('_relativePath_');" },
];

/**
 * Currently unused. The `auto-import.importStatement.styleSheet.cssImageImportStyle`
 * setting still appears in VS Code's UI because `package.json` declares it,
 * but `css.ts:buildCssImageImportSnippet` always emits `url('…')` regardless
 * of the user's selection. Kept for `package.json` parity; safe to delete
 * if the setting is also removed.
 */
export const CSS_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "url('_relativePath_')" },
];

/** Four SCSS import shapes consumed by `scss.ts:buildScssImportSnippet` via the `auto-import.importStatement.styleSheet.scssImportStyle` setting. */
export const SCSS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import url('_relativePath_');" },
  { value: 2, description: "@use '_relativePath_';" },
  { value: 3, description: "@use '_relativePath_' as *;" },
];

/**
 * Currently unused. `html.ts:buildHtmlScriptImportSnippet` always emits
 * `<script type="text/javascript" src="…"></script>`. The matching
 * `package.json` setting (`htmlScriptImportStyle`) exists for UI parity
 * only.
 */
export const HTML_SCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<script type="text/javascript" src="_relativePath_"></script>' },
];

/**
 * Currently unused. `html.ts:buildHtmlImageImportSnippet` always emits
 * `<img src="…" alt="sample">`. The matching `package.json` setting
 * (`htmlImageImportStyle`) exists for UI parity only.
 */
export const HTML_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<img src="_relativePath_" alt="sample">' },
];

/**
 * Currently unused. `html.ts:buildHtmlStylesheetImportSnippet` always emits
 * `<link href="…" rel="stylesheet">`. The matching `package.json` setting
 * (`htmlStyleSheetImportStyle`) exists for UI parity only.
 */
export const HTML_STYLESHEET_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<link href="_relativePath_" rel="stylesheet">' },
];

/**
 * Currently unused. `markdown.ts:buildMarkdownImportSnippet` always emits
 * `![text](path)`. The matching `package.json` setting (`markdownImportStyle`)
 * exists for UI parity only.
 */
export const MARKDOWN_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '![text](_relativePath_)' },
];

/** Two Markdown image shapes consumed by `markdown.ts:buildMarkdownImageImportSnippet` via the `auto-import.importStatement.markup.markdownImage` setting. */
export const MARKDOWN_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '![alt-text](_relativePath_ "Hover text")' },
  { value: 1, description: '![alt-text][image] / [image]: _relativePath_ "Hover text"' },
];
