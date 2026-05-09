/**
 * Markdown import-snippet generator. Markdown sources emit a fixed inline
 * link (`![text](path)`); image sources have two configurable styles via
 * `MARKDOWN_IMAGE_IMPORT_OPTIONS` — inline `![alt-text](path "Hover")` or
 * reference-style `![alt-text][image] / [image]: path "Hover"`. Full
 * extension is preserved on the path.
 */
import * as vscode from 'vscode';

import { getAutoImportSetting } from '../config/settings';
import { extractFileExtension } from '../path/extension';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';
import { MARKDOWN_IMAGE_IMPORT_OPTIONS, resolveStyleIndex } from './_styles';

/**
 * Routes Markdown sources to inline-link syntax and image sources to the
 * configured Markdown image style, returning empty for any other
 * classification.
 *
 * @returns The Markdown link/image `SnippetString` for the current source, or empty.
 */
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

/**
 * Returns the Markdown inline-link shape `![text](relativePath)`.
 *
 * @param relativePath - The import path.
 * @returns The Markdown inline link as a `SnippetString`.
 */
function buildMarkdownImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`![text](${relativePath})`);
}

/**
 * Returns one of two Markdown image shapes (inline `![alt](path "Hover")` /
 * reference-style) selected by the user's `markdownImageImportStyle` setting.
 *
 * @param relativePath - The image's import path.
 * @returns The `SnippetString` for the matched style.
 */
function buildMarkdownImageImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(MARKDOWN_IMAGE_IMPORT_OPTIONS, getAutoImportSetting<string>('markup', 'markdownImage'));

  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`![alt-text](${relativePath} "Hover text")`);
    case 1:
      return new vscode.SnippetString(`![alt-text][image] / [image]: ${relativePath} "Hover text"`);
    default:
      return new vscode.SnippetString(`![alt-text](${relativePath} "Hover text")`);
  }
}
