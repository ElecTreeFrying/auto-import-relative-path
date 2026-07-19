import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../config/settings';
import { extractFileExtension } from '../../path/extension';
import { deriveImportName } from '../../path/import-name';
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
  // The default-import binding is pre-filled from the source basename (falls back to a bare `$1`).
  // The named-import shape (style 1) is left as `$1` — the binding must match an actual export.
  const name = defaultImportPlaceholder(relativePath);
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`import ${name} from '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
    case 2:
      return new vscode.SnippetString(`import ${name}, { $2 } from '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`import * as ${name} from '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`import '${relativePath}';`);
    case 5:
      return new vscode.SnippetString(`const ${name} = require('${relativePath}');`);
    case 6:
      return new vscode.SnippetString(`const ${name} = await import('${relativePath}');`);
    default:
      return new vscode.SnippetString(`import ${name} from '${relativePath}';`);
  }
}

/** The default-import placeholder: `${1:derived}` from the basename, or a bare `$1` when none forms. */
function defaultImportPlaceholder(relativePath: string): string {
  const derived = deriveImportName(relativePath);
  return derived ? `\${1:${derived}}` : '$1';
}
