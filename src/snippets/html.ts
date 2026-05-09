/**
 * HTML import-snippet generator. Routes on the source's import type to one
 * of `<script>`, `<img>`, or `<link>`. The full extension is always
 * preserved on the path — HTML has no extension-stripping convention like
 * JS/TS modules do.
 */
import * as vscode from 'vscode';

import { extractFileExtension } from '../path/extension';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';

/**
 * Routes the source's import type to a `<script>`, `<img>`, or `<link>`
 * snippet, returning empty for any other classification.
 *
 * @returns The HTML tag `SnippetString` for the current source, or empty.
 */
export async function snippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'script':
      return getHtmlScriptImportSnippet(fullPath);
    case 'image':
      return getHtmlImageImportSnippet(fullPath);
    case 'stylesheet':
      return getHtmlStylesheetImportSnippet(fullPath);
    default:
      return new vscode.SnippetString('');
  }
}

/**
 * Returns `<script type="text/javascript" src="…"></script>`.
 *
 * @param relativePath - The script's import path.
 * @returns The corresponding `<script>` tag as a `SnippetString`.
 */
function getHtmlScriptImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<script type="text/javascript" src="${relativePath}"></script>`);
}

/**
 * Returns `<img src="…" alt="sample">`.
 *
 * @param relativePath - The image's import path.
 * @returns The corresponding `<img>` tag as a `SnippetString`.
 */
function getHtmlImageImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<img src="${relativePath}" alt="sample">`);
}

/**
 * Returns `<link href="…" rel="stylesheet">`.
 *
 * @param relativePath - The stylesheet's import path.
 * @returns The corresponding `<link>` tag as a `SnippetString`.
 */
function getHtmlStylesheetImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<link href="${relativePath}" rel="stylesheet">`);
}
