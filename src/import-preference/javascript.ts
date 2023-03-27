import * as vscode from 'vscode';

import { importStatement } from '../import-statement';
import { getFileExt } from '../utilities';

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
    const preserve = vscode.workspace.getConfiguration('auto-import.importStatement.script').get('preserveScriptFileExtension');
    const fileType = preserve ? getFileExt(dragFilePath) : '';
    return importStatement.javascriptImportStatement(relativePath + fileType);
}
