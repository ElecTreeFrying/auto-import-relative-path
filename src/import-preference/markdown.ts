import * as vscode from 'vscode';

import { importStatement } from '../import-statement';
import { getFileExt, getImportType } from '../utilities';

/**
 * Returns the import statement
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @param {string} dragFilePath File extension of the dragged file. 
 * @returns Import statement string
 */
export function snippet(
  relativePath: string,
  dragFilePath: string
): vscode.SnippetString {
  switch (getImportType(dragFilePath)) {
    case 'markdown': return importStatement.markdownImportStatement(relativePath + getFileExt(dragFilePath));
    case 'image':    return importStatement.markdownImageImportStatement(relativePath + getFileExt(dragFilePath));
  }
}
