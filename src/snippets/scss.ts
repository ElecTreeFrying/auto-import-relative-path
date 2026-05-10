/**
 * SCSS import-snippet generator. Four styles (`@import` / `@import url(…)` /
 * `@use` / `@use … as *`) selectable via
 * `auto-import.importStatement.styleSheet.scssImportStyle`.
 *
 * @remarks
 * **SCSS partial convention.** {@link normalizePartialFilename} strips a
 * leading `_` from the *last* path segment: `_partial.scss` → `partial`.
 * Sass resolves underscored partials against the bare name in `@import`
 * and `@use`, and writing the underscore in the generated import would
 * be syntactically valid but conventionally wrong.
 *
 * **`determineScssExtension` is asymmetric** — different from the script
 * `preserveScriptFileExtension` rule:
 *
 * - `.css` source → always preserves the `.css` extension on the import
 *   path, regardless of the user's `preserveStylesheetFileExtension`
 *   setting. (Sass needs the extension to know it's a foreign file.)
 * - Any other source → respects the setting.
 *
 * **Image branch routes to CSS.** `'image'` source delegates to
 * `buildCssImageImportSnippet` (`url('path')`) — there is no SCSS-specific
 * image snippet because the syntax is identical between the two languages.
 */
import * as vscode from 'vscode';

import { getAutoImportSetting } from '../config/settings';
import { extractFileExtension } from '../path/extension';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';
import { SCSS_IMPORT_OPTIONS, resolveStyleIndex } from './_styles';
import { buildCssImageImportSnippet } from './css';

/**
 * Routes image sources to CSS's `url(...)` snippet and everything else to
 * the SCSS by-style switch with extension and partial-filename handling
 * applied by {@link prepareScssImportPath}.
 *
 * @returns The SCSS import `SnippetString` for the current source.
 */
export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  switch (determineImportType(sourceFilePath)) {
    case 'image':
      return buildCssImageImportSnippet(relativePath + extractFileExtension(sourceFilePath));
    default: {
      const preparedPath = prepareScssImportPath(sourceFilePath, relativePath);
      const styleIndex = resolveStyleIndex(SCSS_IMPORT_OPTIONS, getAutoImportSetting<string>('stylesheet', 'scss'));
      return buildScssImportSnippetByStyle(styleIndex, preparedPath);
    }
  }
}

/**
 * Pure switch on `styleIndex` that emits the matching SCSS import
 * `SnippetString`. The path passed in **must already be extension-suffixed
 * and partial-normalized** — call {@link prepareScssImportPath} first.
 * Reused by the QuickPick aggregator (`snippets/variants.ts`) to render
 * every variant for a given paste without consulting the user's setting.
 *
 * @param styleIndex - The style key (matches `SCSS_IMPORT_OPTIONS[i].value`).
 *   `undefined` falls through to the quoted-`@import` shape.
 * @param relativePath - The already-prepared import path (extension-suffixed
 *   per {@link determineScssExtension}, partial leading-underscore stripped
 *   per {@link normalizePartialFilename}).
 * @returns The `SnippetString` for the matched style.
 */
export function buildScssImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`@import url('${relativePath}');`);
    case 2:
      return new vscode.SnippetString(`@use '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`@use '${relativePath}' as \${1:*};`);
    default:
      return new vscode.SnippetString(`@import '${relativePath}';`);
  }
}

/**
 * Combines the SCSS-specific extension rule and partial-filename
 * normalization into a single path-prep step. Centralizes the two SCSS
 * invariants so the QuickPick aggregator doesn't have to reimplement them.
 *
 * @param sourceFilePath - Absolute path of the source file being imported.
 * @param relativePath - The relative-path string from `computeRelative`
 *   (extension stripped, no leading-underscore handling yet).
 * @returns The path ready to drop into a SCSS `@import`/`@use` statement.
 */
export function prepareScssImportPath(sourceFilePath: string, relativePath: string): string {
  return normalizePartialFilename(relativePath + determineScssExtension(sourceFilePath));
}

/**
 * Returns the file extension to append to the SCSS import path. See module
 * header for the asymmetric `.css`-always-preserved rule.
 *
 * @param sourceFilePath - Path of the file being imported.
 * @returns Either the source extension or `''`, depending on type and setting.
 */
function determineScssExtension(sourceFilePath: string): string {
  if (extractFileExtension(sourceFilePath) === '.css') {
    return extractFileExtension(sourceFilePath);
  }
  const shouldPreserveExtension = getAutoImportSetting('stylesheet', 'preserve');
  return shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';
}

/**
 * Strips a leading underscore from the *last* path segment. Sass partial
 * convention — see module header.
 *
 * @param relativePath - Forward-slash path whose last segment may be a Sass partial.
 * @returns The same path with the basename's leading underscore removed.
 */
function normalizePartialFilename(relativePath: string): string {
  const segments = relativePath.split('/');
  const lastIndex = segments.length - 1;
  if (segments[lastIndex].startsWith('_')) {
    segments[lastIndex] = segments[lastIndex].substring(1);
  }
  return segments.join('/');
}
