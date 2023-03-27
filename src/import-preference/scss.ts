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
    case 'image':  return importStatement.cssImageImportStatement(relativePath + getFileExt(dragFilePath));
    default:       return importStatement.scssImportStatement(relativePath + getScssFileExt(dragFilePath));
  }
}

/**
 * Get SCSS file extension.
 * @param {string} dragFilePath Dragged file path. 
 * @returns CSS file extension if dragFilePath ext is .css else none
 */
function getScssFileExt(dragFilePath: string): string {
  if (getFileExt(dragFilePath) === '.css') {
    // Auto preserve file extension if file extension is CSS
    return getFileExt(dragFilePath);
  } else {
    const preserve = vscode.workspace.getConfiguration('auto-import.importStatement.styleSheet').get('preserveStylesheetFileExtension');
    return preserve ? getFileExt(dragFilePath) : '';
  }
}
