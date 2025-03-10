import * as vscode from 'vscode';

import { getFileExtension } from '../utilities';
import { FileExtension } from '../model';

/**
 * Generates an import snippet for a TSX file.
 *
 * @param relativeFilePath - The relative path of the dragged file in the editor.
 * @param draggedFilePath - The file path (extension) of the dragged file.
 * @returns A SnippetString containing the generated import statement.
 */
export function snippet(
  relativeFilePath: string,
  draggedFilePath: string
): vscode.SnippetString {
  switch (getFileExtension(draggedFilePath) as FileExtension) {
    // Images, Data, Scripts, Markup
    case '.gif':
    case '.jpeg':
    case '.jpg':
    case '.png':
    case '.webp':
    case '.json':
    case '.ts':
    case '.js':
    case '.tsx':
    case '.html':
    case '.yml':
    case '.yaml':
    case '.md':
      return new vscode.SnippetString(
        `import name$1 from '${relativeFilePath + getFileExtension(draggedFilePath)}';`
      );

    // Fonts, Stylesheets
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.eot':
    case '.css':
    case '.scss':
      return new vscode.SnippetString(
        `import '${relativeFilePath + getFileExtension(draggedFilePath)}';`
      );

    default:
      return new vscode.SnippetString('');
  }
}
