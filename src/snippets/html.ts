import * as vscode from 'vscode';

import { extractFileExtension } from '../path/extension';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';

export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'script':
      return buildHtmlScriptImportSnippet(fullPath);
    case 'image':
      return buildHtmlImageImportSnippet(fullPath);
    case 'stylesheet':
      return buildHtmlStylesheetImportSnippet(fullPath);
    default:
      return new vscode.SnippetString('');
  }
}

export function buildHtmlScriptImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<script type="text/javascript" src="${relativePath}"></script>`);
}

export function buildHtmlImageImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<img src="${relativePath}" alt="sample">`);
}

export function buildHtmlStylesheetImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<link href="${relativePath}" rel="stylesheet">`);
}
