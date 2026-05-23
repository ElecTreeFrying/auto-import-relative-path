import * as vscode from 'vscode';
import * as path from 'path';

import { getAutoImportSetting } from '../config/settings';
import { SCRIPT_FILE_EXTENSIONS, STYLESHEET_FILE_EXTENSIONS } from '../constants/extensions';
import { FileExtension } from '../types/file-extension';
import { getFilePathInfo } from './file-path-info';

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

async function shouldRepositionCursor(): Promise<boolean> {
  const { sourceFileExt, destinationFileExt } = await getFilePathInfo();

  return (
    (sourceFileExt !== '.css' && destinationFileExt === '.css') ||
    (sourceFileExt !== '.scss' && destinationFileExt === '.scss') ||
    destinationFileExt === '.html' ||
    destinationFileExt === '.md'
  );
}

function insertSnippetAtTop(snippet: vscode.SnippetString): void {
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
    'import ', 'var name = require(', 'const name = require(', 'require(',
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

function insertSnippetAtPosition(snippet: vscode.SnippetString, lineNumber: number): void {
  const editor = vscode.window.activeTextEditor;
  const insertionColumn = determineInsertionColumn(editor);
  editor.insertSnippet(snippet, new vscode.Position(lineNumber, insertionColumn));
}

function determineInsertionColumn(editor: vscode.TextEditor): number {
  const currentColumn = editor.selection.anchor.character;
  const fileExtension = path.extname(editor.document.fileName) as FileExtension;

  const isScriptOrStylesheet =
    SCRIPT_FILE_EXTENSIONS.includes(fileExtension) || STYLESHEET_FILE_EXTENSIONS.includes(fileExtension);

  return isScriptOrStylesheet ? 0 : currentColumn;
}
