/**
 * Inserts the generated import snippet into the active editor at a position
 * determined by file type and the user's `importStatementPlacement` setting.
 *
 * @remarks
 * **Placement strings.** `'Top'`, `'Bottom'`, `'Cursor'` must match the
 * `enum` values in `package.json` for `auto-import.preferences.
 * importStatementPlacement` byte-for-byte — the comparison in this file's
 * `switch` is a literal string match. Adding a new placement requires
 * editing both sites.
 *
 * **Forced-cursor override.** {@link shouldRepositionCursor} ignores the
 * user's setting and always uses the cursor for:
 *
 * - HTML and Markdown destinations (their natural insertion is wherever
 *   the user is typing — there's no canonical "top of file" for embedded
 *   tags).
 * - Stylesheets importing a non-stylesheet source (e.g. `.css` importing
 *   an image — `url('...')` belongs at the cursor, not the file top).
 *
 * **`insertSnippetAtBottom` is a heuristic.** It scans for the last line
 * matching any entry in `importIndicators` and inserts after it. The
 * 10-marker list covers JS (`import`, `require()`, dynamic `import()`),
 * CSS/SCSS (`@import`, `@use` with both quote styles and `url(...)`
 * forms). New import-syntax markers must be added here or "Bottom"
 * placement will silently land at line 0 instead.
 *
 * **Column 0 for code, cursor for markup.** {@link determineInsertionColumn}
 * forces column 0 for destinations whose extension is in
 * `SCRIPT_FILE_EXTENSIONS` or `STYLESHEET_FILE_EXTENSIONS` (defined in
 * `constants/extensions.ts`); otherwise it inserts at the cursor's
 * column — important for HTML/Markdown where the user is typing inline.
 */
import * as vscode from 'vscode';
import * as path from 'path';

import { getAutoImportSetting } from '../config/settings';
import { SCRIPT_FILE_EXTENSIONS, STYLESHEET_FILE_EXTENSIONS } from '../constants/extensions';
import { FileExtension } from '../types/file-extension';
import { getFilePathInfo } from './file-path-info';

/**
 * Appends a newline to the snippet and inserts it at the position dictated
 * by user setting, unless the destination forces cursor placement.
 *
 * @remarks
 * The forced-cursor branch ({@link shouldRepositionCursor}) wins over the
 * `importStatementPlacement` setting; only when no override applies does
 * the user's `'Top'` / `'Bottom'` / `'Cursor'` selection take effect.
 *
 * @param snippet - The import snippet to insert. Mutated in place to append `'\n'`.
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

/**
 * True when the destination type forces cursor placement (see module header).
 *
 * @returns Whether to override `importStatementPlacement` for this source/destination pair.
 */
async function shouldRepositionCursor(): Promise<boolean> {
  const { sourceFileExt, destinationFileExt } = await getFilePathInfo();

  return (
    (sourceFileExt !== '.css' && destinationFileExt === '.css') ||
    (sourceFileExt !== '.scss' && destinationFileExt === '.scss') ||
    destinationFileExt === '.html' ||
    destinationFileExt === '.md'
  );
}

/**
 * Inserts at line 0 of the document.
 *
 * @param snippet - The snippet to insert.
 */
function insertSnippetAtTop(snippet: vscode.SnippetString): void {
  insertSnippetAtPosition(snippet, 0);
}

/**
 * Inserts at the current cursor's line.
 *
 * @param snippet - The snippet to insert.
 */
function insertSnippetAtCursor(snippet: vscode.SnippetString): void {
  const editor = vscode.window.activeTextEditor;
  const currentLine = editor.selection.anchor.line;
  insertSnippetAtPosition(snippet, currentLine);
}

/**
 * Inserts after the last line containing any of ten import-syntax markers
 * (`import `, `require(`, `@import`, `@use`, …). Falls through to line 0
 * when no marker matches — the heuristic is approximate and won't recognise
 * new import-statement forms without a corresponding entry in
 * `importIndicators`.
 *
 * @param snippet - The snippet to insert.
 */
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

/**
 * Inserts the snippet at `lineNumber` and the column resolved by
 * {@link determineInsertionColumn}.
 *
 * @param snippet - The snippet to insert.
 * @param lineNumber - Zero-based line at which to anchor the snippet.
 */
function insertSnippetAtPosition(snippet: vscode.SnippetString, lineNumber: number): void {
  const editor = vscode.window.activeTextEditor;
  const insertionColumn = determineInsertionColumn(editor);
  editor.insertSnippet(snippet, new vscode.Position(lineNumber, insertionColumn));
}

/**
 * Picks the insertion column based on the destination's extension.
 *
 * @param editor - The active text editor whose document determines the column rule.
 * @returns `0` for script/stylesheet destinations, the current cursor
 *   column otherwise.
 */
function determineInsertionColumn(editor: vscode.TextEditor): number {
  const currentColumn = editor.selection.anchor.character;
  const fileExtension = path.extname(editor.document.fileName) as FileExtension;

  const isScriptOrStylesheet =
    SCRIPT_FILE_EXTENSIONS.includes(fileExtension) || STYLESHEET_FILE_EXTENSIONS.includes(fileExtension);

  return isScriptOrStylesheet ? 0 : currentColumn;
}
