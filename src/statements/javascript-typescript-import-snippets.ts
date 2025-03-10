import * as vscode from 'vscode';
import * as path from 'path';
import { importStyle } from '../constants';
import { ImportStyle } from '../model';

/**
 * Retrieves a JavaScript import snippet string based on the current configuration.
 *
 * @param relativePath - The relative path of the module.
 * @returns A vscode.SnippetString representing the JavaScript import statement.
 */
export function getJavaScriptImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = vscode.workspace
    .getConfiguration('auto-import.importStatement.script')
    .get('javascriptImportStyle');
  configValue = importStyle.JAVASCRIPT_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  switch (configValue as number) {
    case 0:
      return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
    case 2:
      return new vscode.SnippetString(`import { $1 as $2 } from '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`import '${relativePath}';`);
    case 5:
      return new vscode.SnippetString(`var $1 = require('${relativePath}');`);
    case 6:
      return new vscode.SnippetString(`const $1 = require('${relativePath}');`);
    case 7:
      return new vscode.SnippetString(`var $1 = import('${relativePath}');`);
    case 8:
      return new vscode.SnippetString(`const $1 = import('${relativePath}');`);
    default:
      return new vscode.SnippetString(`import $1 from '${relativePath}';`);
  }
}

/**
 * Retrieves a TypeScript import snippet string based on the current configuration.
 *
 * @param relativePath - The relative path of the module.
 * @returns A vscode.SnippetString representing the TypeScript import statement.
 */
export function getTypeScriptImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = vscode.workspace
    .getConfiguration('auto-import.importStatement.script')
    .get('typescriptImportStyle');
  configValue = importStyle.TYPESCRIPT_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  switch (configValue as number) {
    case 0:
      return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`import { ${generateImportName(relativePath)} } from '${relativePath}';`);
    case 2:
      return new vscode.SnippetString(`import { $1 as $2 } from '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`import '${relativePath}';`);
    default:
      return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
  }
}

/**
 * Generates an appropriate import identifier for Angular-related files by converting the filename to PascalCase.
 *
 * @param relativePath - The relative path of the file.
 * @returns A formatted import name if the file is Angular-related; otherwise, a placeholder.
 */
function generateImportName(relativePath: string): string {
  if (
    relativePath.includes('.component') ||
    relativePath.includes('.directive') ||
    relativePath.includes('.pipe') ||
    relativePath.includes('.service') ||
    relativePath.includes('.module')
  ) {
    const baseName = path.basename(relativePath).replace(/\./g, '-');
    return baseName
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }
  return '$1';
}
