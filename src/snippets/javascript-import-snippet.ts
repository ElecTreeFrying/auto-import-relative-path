import * as vscode from 'vscode';

import { importSnippetFunctions } from '../statements';
import { getFileExtension } from '../utilities';

/**
 * Generates an import snippet for a JavaScript file.
 *
 * @param relativeFilePath - The relative path of the dragged file in the editor.
 * @param draggedFilePath - The file path (extension) of the dragged file.
 * @returns A SnippetString containing the generated import statement.
 */
export function snippet(
  relativeFilePath: string,
  draggedFilePath: string
): vscode.SnippetString {
  const preserve = vscode.workspace
    .getConfiguration('auto-import.importStatement.script')
    .get('preserveScriptFileExtension');
  const fileExtension = preserve ? getFileExtension(draggedFilePath) : '';

  return importSnippetFunctions.getJavaScriptImportSnippet(
    relativeFilePath + fileExtension
  );
}
