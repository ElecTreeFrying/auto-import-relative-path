import * as vscode from 'vscode';
import * as path from 'path';

import { SCRIPT_EXTENSIONS, STYLESHEET_EXTENSIONS } from '../../constants';

/**
 * Inserts a snippet into the active text editor at a specified line and an appropriate column position.
 *
 * The column position is determined by the file type:
 * - For script or stylesheet files, the snippet is inserted at the beginning of the line (column 0).
 * - Otherwise, the snippet is inserted at the current cursor column.
 *
 * @param snippet - The snippet to insert.
 * @param lineNumber - The line number at which to insert the snippet (defaults to 0).
 */
export function insertSnippetAtPosition(snippet: vscode.SnippetString, lineNumber: number = 0): void {
  const editor = vscode.window.activeTextEditor;
  const insertionColumn = determineInsertionColumn(editor);
  editor.insertSnippet(snippet, new vscode.Position(lineNumber, insertionColumn));
}

/**
 * Determines the column position for snippet insertion based on the active file's extension.
 *
 * For script or stylesheet files, returns 0 (start of the line). Otherwise, returns the current cursor column.
 *
 * @param editor - The active text editor instance.
 * @returns The column number at which the snippet should be inserted.
 */
function determineInsertionColumn(editor: vscode.TextEditor): number {
  const currentColumn = editor.selection.anchor.character;
  const fileExtension = path.extname(editor.document.fileName);

  const isScriptOrStylesheet = SCRIPT_EXTENSIONS.includes(fileExtension) || STYLESHEET_EXTENSIONS.includes(fileExtension);
  
  return isScriptOrStylesheet ? 0 : currentColumn;
}
