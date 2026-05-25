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

function isCommentLine(line: string): boolean {
  const trimmed = line.trimStart();
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
}

/** Extracts leading whitespace (spaces or tabs) from a line. */
function getLineIndentation(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

/** Returns the indentation of the first non-empty content line within a bounded block. */
function detectBlockIndentation(lines: string[], openingLine: number, closingLine: number): string {
  for (let i = openingLine + 1; i < closingLine; i++) {
    if (lines[i].trim().length > 0) {
      return getLineIndentation(lines[i]);
    }
  }
  return '';
}

export async function insertImportSnippet(snippet: vscode.SnippetString): Promise<void> {
  const { sourceFileExt, destinationFileExt } = await getFilePathInfo();

  if (isInlineSnippet(sourceFileExt, destinationFileExt)) {
    return insertSnippetInline(snippet);
  }

  snippet = snippet.appendText('\n');

  if (shouldRepositionCursor(destinationFileExt)) {
    return insertSnippetAtCursor(snippet);
  }

  const placement = getAutoImportSetting<string>('preferences', 'placement');

  if (destinationFileExt === '.astro') {
    return insertSnippetAtAstroFrontmatter(snippet, placement);
  }

  if (destinationFileExt === '.vue' || destinationFileExt === '.svelte') {
    return insertSnippetAtSfcScript(snippet, placement);
  }

  switch (placement) {
    case 'Top':
      return insertSnippetAtTop(snippet);
    case 'Bottom':
      return insertSnippetAtBottom(snippet);
    case 'Cursor':
      return insertSnippetAtCursor(snippet);
    default:
      return insertSnippetAtBottom(snippet);
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
    if (!isCommentLine(lineContent) && IMPORT_INDICATORS.some(indicator => lineContent.includes(indicator))) {
      insertionLine = index + 1;
    }
  });

  insertSnippetAtPosition(snippet, insertionLine);
}

function insertSnippetAtPosition(snippet: vscode.SnippetString, lineNumber: number, indentation?: string): void {
  const editor = vscode.window.activeTextEditor;
  const insertionColumn = determineInsertionColumn(editor);
  const insertionSnippet = indentation
    ? new vscode.SnippetString(indentation + snippet.value)
    : snippet;
  editor.insertSnippet(insertionSnippet, new vscode.Position(lineNumber, insertionColumn));
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

/** Finds the insertion line for Bottom placement within a bounded region (Astro frontmatter or SFC script block). */
function findBottomLineInRange(
  lines: string[],
  openingLine: number,
  closingLine: number,
): { line: number; indentation: string } {
  let insertionLine = openingLine + 1;
  let lastImportIndentation = '';
  for (let i = openingLine + 1; i < closingLine; i++) {
    if (!isCommentLine(lines[i]) && IMPORT_INDICATORS.some(indicator => lines[i].includes(indicator))) {
      insertionLine = i + 1;
      lastImportIndentation = getLineIndentation(lines[i]);
    }
  }
  const indentation = lastImportIndentation || detectBlockIndentation(lines, openingLine, closingLine);
  return { line: insertionLine, indentation };
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
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, openingLine + 1, indentation);
      return;
    }
    case 'Cursor': {
      const cursorLine = editor.selection.anchor.line;
      if (cursorLine > openingLine && cursorLine < closingLine) {
        const indentation = getLineIndentation(lines[cursorLine]) || detectBlockIndentation(lines, openingLine, closingLine);
        insertSnippetAtPosition(snippet, cursorLine, indentation);
        return;
      }
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
  }
}

/** Finds a `<script...>` / `</script>` pair. Prefers `<script setup` (Vue composition API) over bare `<script`. */
function findSfcScriptBounds(lines: string[]): { openingLine: number; closingLine: number } | null {
  return findScriptBlock(lines, '<script setup') ?? findScriptBlock(lines, '<script');
}

function findScriptBlock(lines: string[], openingTag: string): { openingLine: number; closingLine: number } | null {
  let openingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (openingLine === -1) {
      if (trimmed.startsWith(openingTag)) {
        openingLine = i;
      }
    } else if (trimmed === '</script>') {
      return { openingLine, closingLine: i };
    }
  }
  return null;
}

function insertSnippetAtSfcScript(snippet: vscode.SnippetString, placement: string | undefined): void {
  const editor = vscode.window.activeTextEditor;
  const lines = editor.document.getText().split('\n');
  const bounds = findSfcScriptBounds(lines);

  if (!bounds) {
    const wrappedSnippet = new vscode.SnippetString(`<script>\n${snippet.value}</script>\n`);
    editor.insertSnippet(wrappedSnippet, new vscode.Position(0, 0));
    return;
  }

  const { openingLine, closingLine } = bounds;

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, openingLine + 1, indentation);
      return;
    }
    case 'Cursor': {
      const cursorLine = editor.selection.anchor.line;
      if (cursorLine > openingLine && cursorLine < closingLine) {
        const indentation = getLineIndentation(lines[cursorLine]) || detectBlockIndentation(lines, openingLine, closingLine);
        insertSnippetAtPosition(snippet, cursorLine, indentation);
        return;
      }
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
  }
}
