import * as vscode from 'vscode';

import { extractFileExtension, determineImportType, importSnippetFunctions, getFilePathInfo } from '../utils';

/**
 * Generates an import snippet for a CSS file.
 *
 * @returns A SnippetString containing the generated import statement.
 */
export async function snippet(): Promise<vscode.SnippetString> {
  
  const { sourceFilePath, relativePath } = await getFilePathInfo();
  
  switch (determineImportType(sourceFilePath)) {
    case 'image':
      return importSnippetFunctions.getCssImageImportSnippet(
        relativePath + extractFileExtension(sourceFilePath)
      );
    default:
      return importSnippetFunctions.getCssImportSnippet(
        relativePath + extractFileExtension(sourceFilePath)
      );
  }
}
