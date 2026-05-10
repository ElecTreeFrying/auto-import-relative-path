/**
 * CSS import-snippet generator. Two styles (`@import 'path';` /
 * `@import url('path');`) selectable via
 * `auto-import.importStatement.styleSheet.cssImportStyle`.
 *
 * `buildCssImageImportSnippet` is exported (not just internal) because
 * `snippets/scss.ts` reuses it for the SCSS image branch — the `url(...)`
 * syntax is identical in both languages, so there is no SCSS-specific
 * variant.
 */
import * as vscode from 'vscode';

import { getAutoImportSetting } from '../config/settings';
import { extractFileExtension } from '../path/extension';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';
import { CSS_IMPORT_OPTIONS, resolveStyleIndex } from './_styles';

/**
 * Routes image sources to `buildCssImageImportSnippet` and everything else
 * to `buildCssImportSnippet`.
 *
 * @returns The CSS import `SnippetString` for the current source.
 */
export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'image':
      return buildCssImageImportSnippet(fullPath);
    default:
      return buildCssImportSnippet(fullPath);
  }
}

/**
 * Returns one of two CSS import shapes (`@import '…';` / `@import url('…');`)
 * selected by the user's `cssImportStyle` setting. Thin wrapper over
 * {@link buildCssImportSnippetByStyle} that reads the user's setting and
 * delegates.
 *
 * @param relativePath - The already-computed import path.
 * @returns The `SnippetString` for the matched style.
 */
export function buildCssImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(CSS_IMPORT_OPTIONS, getAutoImportSetting<string>('stylesheet', 'css'));
  return buildCssImportSnippetByStyle(styleIndex, relativePath);
}

/**
 * Pure switch on `styleIndex` that emits the matching CSS import
 * `SnippetString`. Reused by the QuickPick aggregator (`snippets/variants.ts`)
 * to render every variant for a given paste without consulting the user's
 * setting.
 *
 * @param styleIndex - The style key (matches `CSS_IMPORT_OPTIONS[i].value`).
 *   `undefined` falls through to the quoted-`@import` shape.
 * @param relativePath - The already-computed import path.
 * @returns The `SnippetString` for the matched style.
 */
export function buildCssImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`@import url('${relativePath}');`);
    default:
      return new vscode.SnippetString(`@import '${relativePath}';`);
  }
}

/**
 * Returns the CSS image-reference shape `url('relativePath')`. Reused by
 * `snippets/scss.ts` for the SCSS image branch.
 *
 * @param relativePath - The already-computed image path.
 * @returns A `SnippetString` of the form `url('relativePath')`.
 */
export function buildCssImageImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`url('${relativePath}')`);
}
