/**
 * JavaScript import-snippet generator. Nine styles selectable via
 * `auto-import.importStatement.script.javascriptImportStyle`.
 *
 * `buildJavaScriptImportSnippet` is exported (not just internal) because
 * `snippets/_shared.ts` consumes it on behalf of `jsx.ts` (JSX uses JS
 * snippets) and `tsx.ts` (TSX falls back to JS snippets for `.js` sources).
 */
import * as vscode from 'vscode';

import { getAutoImportSetting } from '../config/settings';
import { extractFileExtension } from '../path/extension';
import { getFilePathInfo } from '../editor/file-path-info';
import { JAVASCRIPT_IMPORT_OPTIONS, resolveStyleIndex } from './_styles';

/**
 * Builds the relative path (optionally extension-suffixed per the user's
 * `preserveScriptFileExtension` setting) and emits the JavaScript snippet.
 *
 * @returns The JavaScript import `SnippetString` for the current source.
 */
export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
  const fileExtension = shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';

  return buildJavaScriptImportSnippet(relativePath + fileExtension);
}

/**
 * Returns one of nine JavaScript import shapes (`import`, `require()`,
 * dynamic `import()` variants) selected by the user's `javascriptImportStyle`
 * setting. Thin wrapper over {@link buildJavaScriptImportSnippetByStyle} that
 * reads the user's setting and delegates.
 *
 * @param relativePath - The already-computed import path (with or without extension).
 * @returns The `SnippetString` for the matched style, or the default-import shape.
 */
export function buildJavaScriptImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(JAVASCRIPT_IMPORT_OPTIONS, getAutoImportSetting<string>('script', 'javascript'));
  return buildJavaScriptImportSnippetByStyle(styleIndex, relativePath);
}

/**
 * Pure switch on `styleIndex` that emits the matching JavaScript import
 * `SnippetString`. Reused by the QuickPick aggregator (`snippets/variants.ts`)
 * to render every variant for a given paste without consulting the user's
 * setting.
 *
 * @param styleIndex - The style key (matches `JAVASCRIPT_IMPORT_OPTIONS[i].value`).
 *   `undefined` falls through to the default-import shape, mirroring the
 *   existing `default:` branch when `resolveStyleIndex` doesn't match.
 * @param relativePath - The already-computed import path (with or without extension).
 * @returns The `SnippetString` for the matched style.
 */
export function buildJavaScriptImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
    case 2:
      return new vscode.SnippetString(`import { default as $1 } from '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`import '${relativePath}';`);
    case 5:
      return new vscode.SnippetString(`var $1 = require('${relativePath}');`);
    case 6:
      return new vscode.SnippetString(`const $1 = require('${relativePath}');`);
    case 7:
      return new vscode.SnippetString(`var $1 = import('${relativePath}');`);
    case 8:
      return new vscode.SnippetString(`const $1 = import('${relativePath}');`);
    default:
      return new vscode.SnippetString(`import $1 from '${relativePath}';`);
  }
}
