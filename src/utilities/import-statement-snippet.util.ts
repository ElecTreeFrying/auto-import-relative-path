import * as vscode from 'vscode';
import * as snippetModules from '../snippets';
import { getFileExtension } from './file-extension.util';

/**
 * Generates an import statement snippet based on the destination file type.
 *
 * @param relativeFilePath - The relative path from the destination file to the source file.
 * @param sourceFilePath - The full path of the dragged (source) file.
 * @param destinationFilePath - The full path of the active editor (destination) file.
 * @returns A vscode.SnippetString representing the appropriate import statement.
 */
export function generateImportStatementSnippet(
  relativeFilePath: string,
  sourceFilePath: string,
  destinationFilePath: string
): vscode.SnippetString {
  switch (getFileExtension(destinationFilePath)) {
    case '.js':
      return snippetModules.JavaScriptSnippets.snippet(relativeFilePath, sourceFilePath);
    case '.jsx':
      return snippetModules.JsxSnippets.snippet(relativeFilePath, sourceFilePath);
    case '.ts':
      return snippetModules.TypeScriptSnippets.snippet(relativeFilePath, sourceFilePath);
    case '.tsx':
      return snippetModules.TsxSnippets.snippet(relativeFilePath, sourceFilePath);
    case '.css':
      return snippetModules.CssSnippets.snippet(relativeFilePath, sourceFilePath);
    case '.scss':
      return snippetModules.ScssSnippets.snippet(relativeFilePath, sourceFilePath);
    case '.html':
      return snippetModules.HtmlSnippets.snippet(relativeFilePath, sourceFilePath);
    case '.md':
      return snippetModules.MarkdownSnippets.snippet(relativeFilePath, sourceFilePath);
    default:
      return new vscode.SnippetString('');
  }
}
