import * as vscode from 'vscode';

import { importSnippetFunctions } from '../statements';
import { getFileExtension, determineImportType } from '../utilities';

/**
 * Generates an import snippet for an SCSS file.
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
      return importSnippetFunctions.getScssImportSnippet(
        relativeFilePath + determineScssExtension(draggedFilePath)
      );
  }
}

/**
 * Determines whether to preserve the .css extension or not, based on user settings.
 *
 * @param draggedFilePath - The file path (extension) of the dragged file.
 * @returns Either the `.css` extension (if applicable) or an empty string.
 */
function determineScssExtension(draggedFilePath: string): string {
  if (getFileExtension(draggedFilePath) === '.css') {
    // Auto preserve file extension if it is CSS
    return getFileExtension(draggedFilePath);
  } else {
    const preserve = vscode.workspace
      .getConfiguration('auto-import.importStatement.styleSheet')
      .get('preserveStylesheetFileExtension');
    return preserve ? getFileExtension(draggedFilePath) : '';
  }
}
