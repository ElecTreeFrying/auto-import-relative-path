import * as vscode from 'vscode';

/**
 * Inserts a snippet string into the active text editor at the specified line and current cursor column.
 *
 * @param snippet - The snippet string to insert.
 * @param lineNumber - The line number at which to insert the snippet (default is 0).
 */
export function insertSnippetAtPosition(snippet: vscode.SnippetString, lineNumber: number = 0): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const currentColumn = editor.selection.anchor.character;
  editor.insertSnippet(snippet, new vscode.Position(lineNumber, currentColumn));
}
