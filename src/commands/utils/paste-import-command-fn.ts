import * as vscode from 'vscode';

import * as snippetModules from '../../import-handlers';
import { NotifyType } from '../../model';
import { insertImportSnippet, getFilePathInfo, extractFileExtension } from ".";

/**
 * Generates an import statement snippet based on the destination file type.
 * 
 * @returns A vscode.SnippetString representing the appropriate import statement.
 */
export async function generateImportStatementSnippet(): Promise<vscode.SnippetString> {

  const { destinationFilePath } = await getFilePathInfo();

  switch (extractFileExtension(destinationFilePath)) {
    case '.js':
      return snippetModules.JavaScriptSnippets.snippet();
    case '.jsx':
      return snippetModules.JsxSnippets.snippet();
    case '.ts':
      return snippetModules.TypeScriptSnippets.snippet();
    case '.tsx':
      return snippetModules.TsxSnippets.snippet();
    case '.css':
      return snippetModules.CssSnippets.snippet();
    case '.scss':
      return snippetModules.ScssSnippets.snippet();
    case '.html':
      return snippetModules.HtmlSnippets.snippet();
    case '.md':
      return snippetModules.MarkdownSnippets.snippet();
    default:
      return new vscode.SnippetString('');
  }
}

/**
 * Displays a notification message based on the specified notification type.
 *
 * @param notifyType - The type of notification to show.
 */
export function showNotification(notifyType: NotifyType): void {
  switch (notifyType) {
    case NotifyType.SameFilePath:
      vscode.window.showWarningMessage('Auto Import Relative Path: Same file path.');
      break;
    case NotifyType.NotSupported:
      vscode.window.showWarningMessage('Auto Import Relative Path: Not supported.');
      break;
  }
}

/**
 * Inserts a raw relative path snippet into the active editor.
 */
export async function insertRelativePathSnippet(): Promise<void> {
  const { relativePath, sourceFileExt } = await getFilePathInfo();
  const snippet = new vscode.SnippetString(relativePath + sourceFileExt);
  insertImportSnippet(snippet);
}
