import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../config/settings';
import { extractFileExtension } from '../../path/extension';
import { FilePathInfo } from '../../editor/file-path-info';
import { JAVASCRIPT_IMPORT_OPTIONS, resolveStyleIndex } from '../_styles';

export function buildSnippet(info: FilePathInfo): vscode.SnippetString {
  const { sourceFilePath, relativePath } = info;

  const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
  const fileExtension = shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';

  return buildJavaScriptImportSnippet(relativePath + fileExtension);
}

export function buildJavaScriptImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(JAVASCRIPT_IMPORT_OPTIONS, getAutoImportSetting<string>('script', 'javascript'));
  return buildJavaScriptImportSnippetByStyle(styleIndex, relativePath);
}

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
      return new vscode.SnippetString(`import $1, { $2 } from '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`import '${relativePath}';`);
    case 5:
      return new vscode.SnippetString(`const $1 = require('${relativePath}');`);
    case 6:
      return new vscode.SnippetString(`const $1 = await import('${relativePath}');`);
    default:
      return new vscode.SnippetString(`import $1 from '${relativePath}';`);
  }
}
