import * as vscode from 'vscode';

import { getFileExt } from '../utilities';
import { TSX_SupportedFileExtension } from '../model';

export function snippet(
  relativePath: string,
  fromFilepath: string
): vscode.SnippetString {

  switch (getFileExt(fromFilepath) as TSX_SupportedFileExtension) {
    case '.gif': // Images
    case '.jpeg':
    case '.jpg':
    case '.png':
    case '.webp':
    case '.json': // Data
    case '.ts': case '.js': // Scripts
    case '.tsx':
    case '.html': // HTML
    case '.yml': // YAML
    case '.yaml':
    case '.md': // MD
    {
      return new vscode.SnippetString(`import name$1 from '${relativePath + getFileExt(fromFilepath)}';`);
    }
    case '.woff': // Fonts
    case '.woff2':
    case '.ttf':
    case '.eot':
    case '.css': // Stylesheets
    case '.scss':
    {
      return new vscode.SnippetString(`import '${relativePath + getFileExt(fromFilepath)}';`);
    }
    default: {
      return new vscode.SnippetString(``);
    }
  }
}
