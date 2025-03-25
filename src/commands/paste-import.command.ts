import * as vscode from 'vscode';

import { NotifyType } from '../model';
import { CSS_SUPPORTED_EXTENSIONS, HTML_SUPPORTED_EXTENSIONS, MARKDOWN_SUPPORTED_EXTENSIONS, CROSS_IMPORT_EXTENSIONS, SCSS_SUPPORTED_EXTENSIONS } from '../constants';
import { generateImportStatementSnippet, showNotification, insertImportSnippet, getFilePathInfo } from './utils';

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

  vscode.commands.executeCommand('notifications.clearAll');

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const [ { sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }, snippet ]
    = await Promise.all([ getFilePathInfo(), generateImportStatementSnippet() ]);

  // Prevent importing from the same file
  if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
    return showNotification(NotifyType.SameFilePath);
  }

  // Check for various unsupported scenarios
  if (
    // 1) The destination file extension is not in the allowed cross-import list
    (!CROSS_IMPORT_EXTENSIONS.includes(destinationFileExt) && sourceFileExt !== destinationFileExt)
    // 2) HTML to HTML relative import
    || (sourceFileExt === '.html' && destinationFileExt === '.html')
    // 3) Unsupported HTML import
    || (!HTML_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.html')
    // 4) Unsupported Markdown import
    || (!MARKDOWN_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.md')
    // 5) Unsupported CSS import
    || (!CSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.css')
    // 6) Unsupported SCSS import
    || (!SCSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.scss')
    // 7) If snippet is empty or just a newline
    || snippet.value === '\n' || snippet.value === ''
  ) {
    return showNotification(NotifyType.NotSupported);
  }

  // Insert the snippet, positioning the cursor if required
  insertImportSnippet(snippet);
}
