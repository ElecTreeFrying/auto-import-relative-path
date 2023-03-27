import * as vscode from 'vscode';

export function insertSnippetString(snippetString: vscode.SnippetString, position: number = 0) {
  const activeTextEditor = vscode.window.activeTextEditor;
  activeTextEditor.insertSnippet(snippetString, new vscode.Position(position, 0));
}
