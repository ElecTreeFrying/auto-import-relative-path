import * as vscode from 'vscode';

import { FileExtension } from '../../model';
import { importSnippetFunctions, extractFileExtension, getAutoImportSetting, getFilePathInfo } from '../utils';

/**
 * Generates an import snippet for a JSX file.
 *
 * @returns A SnippetString containing the generated import statement.
 */
export async function snippet(): Promise<vscode.SnippetString> {
  
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  const preserve = getAutoImportSetting('script', 'preserveScriptFileExtension');
  const fileExtension = preserve ? extractFileExtension(sourceFilePath) : '';

  switch (extractFileExtension(sourceFilePath) as FileExtension) {

    // Javascript
    case '.js':
    case '.jsx':
      return importSnippetFunctions.getJavaScriptImportSnippet(relativePath + fileExtension);

    // Images, Data, Scripts, Markup
    case '.gif':
    case '.jpeg':
    case '.jpg':
    case '.png':
    case '.webp':
    case '.json':
    case '.html':
    case '.yml':
    case '.yaml':
    case '.md':
      return new vscode.SnippetString(
        `import name$1 from '${relativePath + extractFileExtension(sourceFilePath)}';`
      );

    // Fonts, Stylesheets
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.eot':
    case '.css':
    case '.scss':
      return new vscode.SnippetString(
        `import '${relativePath + extractFileExtension(sourceFilePath)}';`
      );

    default:
      return new vscode.SnippetString('');
  }
}
