import * as vscode from 'vscode';

import { getFileExtension } from '../../utils';
import { importSnippetFunctions } from '../utils';

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
