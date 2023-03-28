import * as vscode from 'vscode';
import { insertSnippetString } from './snippet-string';

export function insertSnippet(snippet: vscode.SnippetString, cursorPosition: boolean): void {

  if (cursorPosition) {
    return importToCursor(snippet); 
  }
  
  switch (vscode.workspace.getConfiguration('auto-import.preferences').get('importStatementPlacement')) {
    case 'Top':    return importToTop(snippet);
    case 'Bottom': return importToBottom(snippet);
    case 'Cursor': return importToCursor(snippet);
  }
}

function importToTop(snippet: vscode.SnippetString): void {
  insertSnippetString(snippet);
}

function importToCursor(snippet: vscode.SnippetString): void {
  const selection = vscode.window.activeTextEditor.selection.anchor.line;
  insertSnippetString(snippet, selection);
}

function importToBottom(snippet: vscode.SnippetString): void {

  const indicators = [
    // Script
    'import ', 'var = require(', 'require(',
    // Stylesheet
    '@import \'', '@import \"', '@import url(', '@import (', '@use \'', '@use \"'
  ];

  const documentText = vscode.window.activeTextEditor.document.getText();
  
  let position = 0;
  documentText.split('\n').forEach((context, line) => {
    const count = indicators.some((e) => context.includes(e));
    count ? (position = ++line) : 0;
  });

  insertSnippetString(snippet, position);
}
