import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../config/settings';
import { extractFileExtension } from '../../path/extension';
import { determineImportType } from '../../path/import-type';
import { getFilePathInfo } from '../../editor/file-path-info';
import { MARKDOWN_IMAGE_IMPORT_OPTIONS, resolveStyleIndex } from '../_styles';

export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'markdown':
      return buildMarkdownImportSnippet(fullPath);
    case 'image':
      return buildMarkdownImageImportSnippet(fullPath);
    default:
      return new vscode.SnippetString('');
  }
}

export function buildMarkdownImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`[\${1:text}](${relativePath})`);
}

function buildMarkdownImageImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(MARKDOWN_IMAGE_IMPORT_OPTIONS, getAutoImportSetting<string>('markup', 'markdownImage'));
  return buildMarkdownImageImportSnippetByStyle(styleIndex, relativePath);
}

export function buildMarkdownImageImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`![\${1:alt-text}](${relativePath})`);
    case 1:
      return new vscode.SnippetString(`![\${1:alt-text}](${relativePath} "\${2:Hover text}")`);
    case 2:
      return new vscode.SnippetString(`<img src="${relativePath}" alt="$1" width="$2" height="$3">`);
    default:
      return new vscode.SnippetString(`![\${1:alt-text}](${relativePath})`);
  }
}
