import * as vscode from 'vscode';

import { extractFileExtension, getAutoImportSetting, getFilePathInfo, importSnippetFunctions } from '../utils';

/**
 * Generates an import snippet for a JavaScript file.
 *
 * @returns A SnippetString containing the generated import statement.
 */
export async function snippet(): Promise<vscode.SnippetString> {
  
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  const preserve = getAutoImportSetting('script', 'preserveScriptFileExtension');
  const fileExtension = preserve ? extractFileExtension(sourceFilePath) : '';

  return importSnippetFunctions.getJavaScriptImportSnippet(relativePath + fileExtension);
}
