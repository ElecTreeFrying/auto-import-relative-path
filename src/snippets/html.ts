import * as vscode from 'vscode';

import { getAutoImportSetting } from '../config/settings';
import { extractFileExtension } from '../path/extension';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';
import { HTML_SCRIPT_IMPORT_OPTIONS, resolveStyleIndex } from './_styles';

export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'script': {
      const styleIndex = resolveStyleIndex(HTML_SCRIPT_IMPORT_OPTIONS, getAutoImportSetting<string>('markup', 'htmlScript'));
      return buildHtmlScriptImportSnippetByStyle(styleIndex, fullPath);
    }
    case 'image':
      return buildHtmlImageImportSnippet(fullPath);
    case 'stylesheet':
      return buildHtmlStylesheetImportSnippet(fullPath);
    default:
      return new vscode.SnippetString('');
  }
}

export function buildHtmlScriptImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`<script src="${relativePath}"></script>`);
    case 1:
      return new vscode.SnippetString(`<script src="${relativePath}" defer></script>`);
    case 2:
      return new vscode.SnippetString(`<script type="module" src="${relativePath}"></script>`);
    case 3:
      return new vscode.SnippetString(`<script src="${relativePath}" async></script>`);
    case 4:
      return new vscode.SnippetString(`<script type="text/javascript" src="${relativePath}"></script>`);
    default:
      return new vscode.SnippetString(`<script src="${relativePath}"></script>`);
  }
}

export function buildHtmlImageImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<img src="${relativePath}" alt="sample">`);
}

export function buildHtmlStylesheetImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<link href="${relativePath}" rel="stylesheet">`);
}
