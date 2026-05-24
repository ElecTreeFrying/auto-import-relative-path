import * as vscode from 'vscode';
import * as path from 'path';

import { getAutoImportSetting } from '../../config/settings';
import { extractFileExtension } from '../../path/extension';
import { getFilePathInfo } from '../../editor/file-path-info';
import { TYPESCRIPT_IMPORT_OPTIONS, resolveStyleIndex } from '../_styles';

const LEGACY_ANGULAR_FILE_SUFFIXES = [
  '.component',
  '.directive',
  '.pipe',
  '.service',
  '.module',
];

export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
  const fileExtension = shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';

  return buildTypeScriptImportSnippet(relativePath + fileExtension);
}

export function buildTypeScriptImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(TYPESCRIPT_IMPORT_OPTIONS, getAutoImportSetting<string>('script', 'typescript'));
  return buildTypeScriptImportSnippetByStyle(styleIndex, relativePath);
}

export function buildTypeScriptImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`import { ${generateAngularLegacyImportName(relativePath)} } from '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 2:
      return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`import '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`import type { $1 } from '${relativePath}';`);
    case 5:
      return new vscode.SnippetString(`import { $1, type $2 } from '${relativePath}';`);
    case 6:
      return new vscode.SnippetString(`const $1 = await import('${relativePath}');`);
    default:
      return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
  }
}

function generateAngularLegacyImportName(relativePath: string): string {
  if (LEGACY_ANGULAR_FILE_SUFFIXES.some(suffix => relativePath.includes(suffix))) {
    const ext = extractFileExtension(relativePath);
    const withoutExt = (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx')
      ? relativePath.slice(0, -ext.length)
      : relativePath;
    const baseName = path.basename(withoutExt).replace(/\./g, '-');
    return baseName
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }
  return '$1';
}
