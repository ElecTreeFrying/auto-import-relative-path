import * as vscode from 'vscode';

import { importSnippetFunctions } from '../statements';
import { getFileExtension } from '../utilities';

/**
 * Generates a snippet for a TypeScript import statement, optionally preserving the dragged file's extension.
 *
 * @param relativeFilePath - The relative path from the active file to the dragged file.
 * @param draggedFilePath - The full path of the dragged file.
 * @returns A vscode.SnippetString containing the TypeScript import statement.
 */
export function snippet(
  relativeFilePath: string,
  draggedFilePath: string
): vscode.SnippetString {
  const preserveExtension = vscode.workspace
    .getConfiguration('auto-import.importStatement.script')
    .get<boolean>('preserveScriptFileExtension');

  const extension = preserveExtension ? getFileExtension(draggedFilePath) : '';
  return importSnippetFunctions.getTypeScriptImportSnippet(relativeFilePath + extension);
}
