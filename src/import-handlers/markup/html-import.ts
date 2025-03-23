import * as vscode from 'vscode';

import { extractFileExtension, determineImportType, importSnippetFunctions, getFilePathInfo } from '../utils';

/**
 * Generates an import snippet for an HTML file.
 *
 * @returns A SnippetString containing the generated import statement.
 */
export async function snippet(): Promise<vscode.SnippetString> {

  const { sourceFilePath, relativePath } = await getFilePathInfo();

  switch (determineImportType(sourceFilePath)) {
    case 'script':
      return importSnippetFunctions.getHtmlScriptImportSnippet(
        relativePath + extractFileExtension(sourceFilePath)
      );
    case 'image':
      return importSnippetFunctions.getHtmlImageImportSnippet(
        relativePath + extractFileExtension(sourceFilePath)
      );
    case 'stylesheet':
      return importSnippetFunctions.getHtmlStylesheetImportSnippet(
        relativePath + extractFileExtension(sourceFilePath)
      );
  }
}
