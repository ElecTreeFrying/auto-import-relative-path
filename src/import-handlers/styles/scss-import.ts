import * as vscode from 'vscode';

import { extractFileExtension, determineImportType, importSnippetFunctions, getFilePathInfo, getAutoImportSetting } from '../utils';

/**
 * Generates an import snippet for an SCSS file.
 *
 * @returns A SnippetString containing the generated import statement.
 */
export async function snippet(): Promise<vscode.SnippetString> {

  const { sourceFilePath, relativePath } = await getFilePathInfo();

  switch (determineImportType(sourceFilePath)) {
    case 'image':
      return importSnippetFunctions.getCssImageImportSnippet(
        relativePath + extractFileExtension(sourceFilePath)
      );
    default:
      return importSnippetFunctions.getScssImportSnippet(
        relativePath + determineScssExtension(sourceFilePath)
      );
  }
}

/**
 * Determines whether to preserve the .css extension or not, based on user settings.
 *
 * @param sourceFilePath - The file path (extension) of the dragged file.
 * @returns Either the `.css` extension (if applicable) or an empty string.
 */
function determineScssExtension(sourceFilePath: string): string {
  if (extractFileExtension(sourceFilePath) === '.css') {
    // Auto preserve file extension if it is CSS
    return extractFileExtension(sourceFilePath);
  } else {
    const preserve = getAutoImportSetting('stylesheet', 'preserveStylesheetFileExtension');
    return preserve ? extractFileExtension(sourceFilePath) : '';
  }
}
