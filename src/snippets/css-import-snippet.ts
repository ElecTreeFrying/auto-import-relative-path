import * as vscode from 'vscode';

import { importSnippetFunctions } from '../statements';
import { getFileExtension, determineImportType } from '../utilities';

/**
 * Generates an import snippet for a CSS file.
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
    case 'image':
      return importSnippetFunctions.getCssImageImportSnippet(
        relativeFilePath + getFileExtension(draggedFilePath)
      );
    default:
      return importSnippetFunctions.getCssImportSnippet(
        relativeFilePath + getFileExtension(draggedFilePath)
      );
  }
}
