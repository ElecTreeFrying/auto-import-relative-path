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
 * `preserve` rule:
 *
 * - `.css` source → always preserves the `.css` extension on the import
 *   path, regardless of the user's `preserveStylesheetFileExtension`
 *   setting. (Sass needs the extension to know it's a foreign file.)
 * - Any other source → respects the setting.
 *
 * **Image branch routes to CSS.** `'image'` source delegates to
 * `getCssImageImportSnippet` (`url('path')`) — there is no SCSS-specific
 * image snippet because the syntax is identical between the two languages.
 */
import * as vscode from 'vscode';

import { getAutoImportSetting } from '../config/settings';
import { extractFileExtension } from '../path/extension';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';
import { SCSS_IMPORT_OPTIONS, resolveStyleIndex } from './_styles';
import { getCssImageImportSnippet } from './css';

/**
 * Routes image sources to CSS's `url(...)` snippet and everything else to
 * `getScssImportSnippet` with extension handled by `determineScssExtension`.
 *
 * @returns The SCSS import `SnippetString` for the current source.
 */
export async function snippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  switch (determineImportType(sourceFilePath)) {
    case 'image':
      return getCssImageImportSnippet(relativePath + extractFileExtension(sourceFilePath));
    default:
      return getScssImportSnippet(relativePath + determineScssExtension(sourceFilePath));
  }
}

/**
 * Returns one of four SCSS import shapes (`@import`, `@import url(…)`,
 * `@use`, `@use … as *`) selected by the user's `scssImportStyle`, with the
 * partial-filename underscore stripped.
 *
 * @param relativePath - The already-computed import path.
 * @returns The `SnippetString` for the matched style.
 */
function getScssImportSnippet(relativePath: string): vscode.SnippetString {
  relativePath = normalizePartialFilename(relativePath);
  const idx = resolveStyleIndex(SCSS_IMPORT_OPTIONS, getAutoImportSetting<string>('stylesheet', 'scss'));

  switch (idx) {
    case 0:
      return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`@import url('${relativePath}');`);
    case 2:
      return new vscode.SnippetString(`@use '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`@use '${relativePath}' as $1`);
    default:
      return new vscode.SnippetString(`@import '${relativePath}';`);
  }
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
  const preserve = getAutoImportSetting('stylesheet', 'preserveStylesheetFileExtension');
  return preserve ? extractFileExtension(sourceFilePath) : '';
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
