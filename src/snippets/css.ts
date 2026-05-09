/**
 * CSS import-snippet generator. Two styles (`@import 'path';` /
 * `@import url('path');`) selectable via
 * `auto-import.importStatement.styleSheet.cssImportStyle`.
 *
 * `getCssImageImportSnippet` is exported (not just internal) because
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
 * Routes image sources to `getCssImageImportSnippet` and everything else to
 * `getCssImportSnippet`.
 *
 * @returns The CSS import `SnippetString` for the current source.
 */
export async function snippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'image':
      return getCssImageImportSnippet(fullPath);
    default:
      return getCssImportSnippet(fullPath);
  }
}

/**
 * Returns one of two CSS import shapes (`@import '…';` / `@import url('…');`)
 * selected by the user's `cssImportStyle` setting.
 *
 * @param relativePath - The already-computed import path.
 * @returns The `SnippetString` for the matched style.
 */
export function getCssImportSnippet(relativePath: string): vscode.SnippetString {
  const idx = resolveStyleIndex(CSS_IMPORT_OPTIONS, getAutoImportSetting<string>('stylesheet', 'css'));

  switch (idx) {
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
export function getCssImageImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`url('${relativePath}')`);
}
