import * as vscode from 'vscode';

import { extractFileExtension, determineImportType, importSnippetFunctions, getFilePathInfo } from '../utils';

/**
 * Generates an import snippet for a Markdown file.
 * 
 * @returns A SnippetString containing the generated import statement.
 */
export async function snippet(): Promise<vscode.SnippetString> {
  
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  switch (determineImportType(sourceFilePath)) {
    case 'markdown':
      return importSnippetFunctions.getMarkdownImportSnippet(
        relativePath + extractFileExtension(sourceFilePath)
      );
    case 'image':
      return importSnippetFunctions.getMarkdownImageImportSnippet(
        relativePath + extractFileExtension(sourceFilePath)
      );
  }
}
