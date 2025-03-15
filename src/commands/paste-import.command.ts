import * as vscode from 'vscode';

import { NotifyType } from '../model';
import { getFileExtension, generateImportStatementSnippet, showNotification, computeRelativePath, insertImportSnippet } from '../utilities';
import { CSS_SUPPORTED_EXTENSIONS, HTML_SUPPORTED_EXTENSIONS, MARKDOWN_SUPPORTED_EXTENSIONS, PERMITTED_FILE_EXTENSIONS, SCSS_SUPPORTED_EXTENSIONS } from '../constants';

/**
 * Attempts to paste/import a previously copied file path into the active editor,
 * generating the appropriate import snippet if supported.
 *
 * Steps:
 * 1. Clears notifications.
 * 2. Determines the active editor and its file path.
 * 3. Reads the previously copied file path from the clipboard.
 * 4. Checks for unsupported drag/drop scenarios and notifies if necessary.
 * 5. Generates and inserts an import snippet, or a raw relative path if not supported.
 */
export async function executePasteImportCommand(): Promise<void> {

  console.log('\n\n@@@ ', 'Command start: executePasteImportCommand');  

  vscode.commands.executeCommand('notifications.clearAll');

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const destinationFilePath = editor.document.uri.fsPath;
  const sourceFilePath = await vscode.env.clipboard.readText();

  // Prevent importing from the same file
  if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
    return showNotification(NotifyType.SameFilePath);
  }

  // Check for various unsupported scenarios
  if (
    // 1) File extensions not in the permitted list
    (!PERMITTED_FILE_EXTENSIONS.includes(getFileExtension(destinationFilePath)) &&
      getFileExtension(sourceFilePath) !== getFileExtension(destinationFilePath))
    // 2) HTML to HTML drag and drop
    || (getFileExtension(sourceFilePath) === '.html' && getFileExtension(destinationFilePath) === '.html')
    // 3) Unsupported HTML import
    || (!HTML_SUPPORTED_EXTENSIONS.includes(getFileExtension(sourceFilePath)) && getFileExtension(destinationFilePath) === '.html')
    // 4) Unsupported Markdown import
    || (!MARKDOWN_SUPPORTED_EXTENSIONS.includes(getFileExtension(sourceFilePath)) && getFileExtension(destinationFilePath) === '.md')
    // 5) Unsupported CSS import
    || (!CSS_SUPPORTED_EXTENSIONS.includes(getFileExtension(sourceFilePath)) && getFileExtension(destinationFilePath) === '.css')
    // 6) Unsupported SCSS import
    || (!SCSS_SUPPORTED_EXTENSIONS.includes(getFileExtension(sourceFilePath)) && getFileExtension(destinationFilePath) === '.scss')
  ) {
    insertRelativePathSnippet(destinationFilePath, sourceFilePath);
    return showNotification(NotifyType.NotSupported);
  }

  // Generate the import snippet
  const snippet = generateImportStatementSnippet(
    computeRelativePath(destinationFilePath, sourceFilePath),
    sourceFilePath,
    destinationFilePath
  );

  // If snippet is empty or just a newline, fall back to a raw relative path
  if (snippet.value === '\n') {
    insertRelativePathSnippet(destinationFilePath, sourceFilePath);
    return showNotification(NotifyType.NotSupported);
  }

  // Insert the snippet, positioning the cursor if required
  insertImportSnippet(
    snippet.appendText('\n'),
    shouldPositionCursor(destinationFilePath, sourceFilePath)
  );
}

/**
 * Inserts a raw relative path snippet into the active editor.
 *
 * @param destinationFilePath - The path of the active file.
 * @param sourceFilePath - The copied file path from the clipboard.
 */
function insertRelativePathSnippet(destinationFilePath: string, sourceFilePath: string): void {
  const snippet = new vscode.SnippetString(
    computeRelativePath(destinationFilePath, sourceFilePath) + getFileExtension(sourceFilePath)
  );
  insertImportSnippet(snippet.appendText('\n'), true);
}

/**
 * Determines whether the cursor should be positioned for certain file types.
 *
 * @param destinationFilePath - The path of the active file.
 * @param sourceFilePath - The copied file path from the clipboard.
 * @returns true if the cursor should be positioned; otherwise, false.
 */
function shouldPositionCursor(destinationFilePath: string, sourceFilePath: string): boolean {
  return (
    (getFileExtension(sourceFilePath) !== '.css' && getFileExtension(destinationFilePath) === '.css') ||
    (getFileExtension(sourceFilePath) !== '.scss' && getFileExtension(destinationFilePath) === '.scss') ||
    getFileExtension(destinationFilePath) === '.html' ||
    getFileExtension(destinationFilePath) === '.md'
  );
}
