import * as vscode from 'vscode';

import { getFileExtension } from '../../utils';
import { determineImportType, importSnippetFunctions } from '../utils';

/**
 * Generates an import snippet for an HTML file.
 *
 * @param relativeFilePath - The relative path of the dragged file in the editor.
 * @param draggedFilePath - The file path (extension) of the dragged file.
 * @returns A SnippetString containing the generated import statement.
 */
export function snippet(
  relativeFilePath: string,
  draggedFilePath: string
): vscode.SnippetString {
  switch (determineImportType(draggedFilePath)) {
    case 'script':
      return importSnippetFunctions.getHtmlScriptImportSnippet(
        relativeFilePath + getFileExtension(draggedFilePath)
      );
    case 'image':
      return importSnippetFunctions.getHtmlImageImportSnippet(
        relativeFilePath + getFileExtension(draggedFilePath)
      );
    case 'stylesheet':
      return importSnippetFunctions.getHtmlStylesheetImportSnippet(
        relativeFilePath + getFileExtension(draggedFilePath)
      );
  }
}
