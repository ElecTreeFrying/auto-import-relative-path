import * as vscode from 'vscode';

import * as importPath from '../import-preference';
import { getFileExt } from '.';

/**
 * Get calculated import style to append in editor.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @param {string} fromFilepath Dragged file path. 
 * @param {string} toFilepath Dropped file path. 
 * @returns Import statement string
 */
export function importStatement(
  relativePath: string,
  fromFilepath: string,
  toFilepath: string
): vscode.SnippetString {

  switch (getFileExt(toFilepath)) {
    case '.js':
    case '.jsx': {
      return importPath.javascript.snippet(relativePath, fromFilepath);
    }
    case '.ts':
    case '.tsx': {
      return importPath.typescript.snippet(relativePath, fromFilepath, toFilepath);
    }
    case '.css': {
      return importPath.css.snippet(relativePath, fromFilepath);
    }
    case '.scss': {
      return importPath.scss.snippet(relativePath, fromFilepath);
    }
    case '.html': {
      return importPath.html.snippet(relativePath, fromFilepath);
    }
    case '.md': {
      return importPath.markdown.snippet(relativePath, fromFilepath);
    }
  }
}
