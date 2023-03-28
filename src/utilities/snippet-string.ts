import * as vscode from 'vscode';

export function insertSnippetString(snippetString: vscode.SnippetString, line: number = 0) {
  const activeTextEditor = vscode.window.activeTextEditor;
  const character = activeTextEditor.selection.anchor.character;
  activeTextEditor.insertSnippet(snippetString, new vscode.Position(line, character));
}
