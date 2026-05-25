import * as vscode from 'vscode';
import * as path from 'path';

import { getAutoImportSetting } from '../config/settings';
import { SCRIPT_FILE_EXTENSIONS, STYLESHEET_FILE_EXTENSIONS } from '../constants/extensions';
import { FileExtension } from '../types/file-extension';
import { getFilePathInfo } from './file-path-info';

/** Markers used by Bottom placement to find the last import line. */
const IMPORT_INDICATORS = [
  'import ', 'require(',
  "@import '", '@import "', '@import url(', "@use '", '@use "',
  "@forward '", '@forward "'
];

export async function insertImportSnippet(snippet: vscode.SnippetString): Promise<void> {
  const { sourceFileExt, destinationFileExt } = await getFilePathInfo();

  if (isInlineSnippet(sourceFileExt, destinationFileExt)) {
    return insertSnippetInline(snippet);
  }

  snippet = snippet.appendText('\n');

  if (shouldRepositionCursor(destinationFileExt)) {
    return insertSnippetAtCursor(snippet);
  }

  if (destinationFileExt === '.astro') {
    const placement = getAutoImportSetting<string>('preferences', 'placement');
    return insertSnippetAtAstroFrontmatter(snippet, placement);
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

/** Non-stylesheet source into a stylesheet destination produces an inline `url()` snippet. */
function isInlineSnippet(sourceFileExt: FileExtension, destinationFileExt: FileExtension): boolean {
  return (
    !STYLESHEET_FILE_EXTENSIONS.includes(sourceFileExt) && STYLESHEET_FILE_EXTENSIONS.includes(destinationFileExt)
  );
}

function shouldRepositionCursor(destinationFileExt: FileExtension): boolean {
  return destinationFileExt === '.html' || destinationFileExt === '.md';
}

/** Inserts at the exact cursor position (line and column) without a trailing newline. */
function insertSnippetInline(snippet: vscode.SnippetString): void {
  const editor = vscode.window.activeTextEditor;
  editor.insertSnippet(snippet, editor.selection.anchor);
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

  let insertionLine = 0;
  documentText.split('\n').forEach((lineContent, index) => {
    if (IMPORT_INDICATORS.some(indicator => lineContent.includes(indicator))) {
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

/** Finds the opening and closing `---` fence lines. Returns `null` if fewer than two fences exist. */
function findAstroFrontmatterBounds(lines: string[]): { openingLine: number; closingLine: number } | null {
  let openingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (openingLine === -1) {
        openingLine = i;
      } else {
        return { openingLine, closingLine: i };
      }
    }
  }
  return null;
}

/** Finds the insertion line for Bottom placement within a frontmatter region. */
function findAstroBottomLine(lines: string[], openingLine: number, closingLine: number): number {
  let insertionLine = openingLine + 1;
  for (let i = openingLine + 1; i < closingLine; i++) {
    if (IMPORT_INDICATORS.some(indicator => lines[i].includes(indicator))) {
      insertionLine = i + 1;
    }
  }
  return insertionLine;
}

function insertSnippetAtAstroFrontmatter(snippet: vscode.SnippetString, placement: string | undefined): void {
  const editor = vscode.window.activeTextEditor;
  const lines = editor.document.getText().split('\n');
  const bounds = findAstroFrontmatterBounds(lines);

  if (!bounds) {
    const wrappedSnippet = new vscode.SnippetString(`---\n${snippet.value}---\n`);
    editor.insertSnippet(wrappedSnippet, new vscode.Position(0, 0));
    return;
  }

  const { openingLine, closingLine } = bounds;

  switch (placement) {
    case 'Top':
      insertSnippetAtPosition(snippet, openingLine + 1);
      return;
    case 'Cursor': {
      const cursorLine = editor.selection.anchor.line;
      if (cursorLine > openingLine && cursorLine < closingLine) {
        insertSnippetAtPosition(snippet, cursorLine);
        return;
      }
      insertSnippetAtPosition(snippet, findAstroBottomLine(lines, openingLine, closingLine));
      return;
    }
    case 'Bottom':
    default:
      insertSnippetAtPosition(snippet, findAstroBottomLine(lines, openingLine, closingLine));
      return;
  }
}
