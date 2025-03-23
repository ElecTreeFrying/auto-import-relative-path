import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../utils';
import { shouldRepositionCursor, insertSnippetAtPosition } from './import-position-fn';

/**
 * Inserts an import snippet in the active editor based on the configured placement.
 *
 * The insertion position is determined by the workspace setting which may be:
 * - 'Top': Insert at the top of the file.
 * - 'Bottom': Insert after the last import statement.
 * - 'Cursor': Insert at the current cursor position.
 *
 * @param snippet - The snippet to insert.
 * @param useCursorPosition - If true, forces insertion at the current cursor position.
 */
export async function insertImportSnippet(snippet: vscode.SnippetString): Promise<void> {

  snippet = snippet.appendText('\n');

  if (await shouldRepositionCursor()) {
    return insertSnippetAtCursor(snippet);
  }

  const placement = getAutoImportSetting('preferences', 'placement');

  switch (placement) {
    case 'Top':
      return insertSnippetAtTop(snippet);
    case 'Bottom':
      return insertSnippetAtBottom(snippet);
    case 'Cursor':
      return insertSnippetAtCursor(snippet);
    default:
      return insertSnippetAtCursor(snippet);
  }
}

function insertSnippetAtTop(snippet: vscode.SnippetString): void {
  // Insert at the top of the file (line 0)
  insertSnippetAtPosition(snippet, 0);
}

function insertSnippetAtCursor(snippet: vscode.SnippetString): void {
  const editor = vscode.window.activeTextEditor;
  const currentLine = editor.selection.anchor.line;
  insertSnippetAtPosition(snippet, currentLine);
}

function insertSnippetAtBottom(snippet: vscode.SnippetString): void {
  const editor = vscode.window.activeTextEditor;
  const documentText = editor.document.getText();
  const importIndicators = [
    // Script indicators
    'import ', 'var name = require(', 'const name = require(', 'require(',
    // Stylesheet indicators
    "@import '", '@import "', '@import url(', '@import (', "@use '", '@use "'
  ];
  
  let insertionLine = 0;
  documentText.split('\n').forEach((lineContent, index) => {
    if (importIndicators.some(indicator => lineContent.includes(indicator))) {
      insertionLine = index + 1;
    }
  });

  insertSnippetAtPosition(snippet, insertionLine);
}
