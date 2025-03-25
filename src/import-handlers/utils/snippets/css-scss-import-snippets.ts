import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../utils';
import { importStyle } from '../../../constants';
import { ImportStyle } from '../../../model';

/**
 * Retrieves a CSS import snippet string based on the current workspace configuration.
 *
 * @param relativePath - The relative path of the imported file.
 * @returns A vscode.SnippetString representing the CSS import statement.
 */
export function getCssImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = getAutoImportSetting('stylesheet', 'css');
  configValue = importStyle.CSS_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  switch (configValue as number) {
    case 0:
      return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`@import url('${relativePath}');`);
    default:
      return new vscode.SnippetString(`@import '${relativePath}';`);
  }
}

/**
 * Retrieves a CSS image import snippet string based on the current workspace configuration.
 *
 * @param relativePath - The relative path of the image file.
 * @returns A vscode.SnippetString representing the CSS image import statement.
 */
export function getCssImageImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = getAutoImportSetting('stylesheet', 'cssImage');
  configValue = importStyle.CSS_IMAGE_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  return new vscode.SnippetString(`url('${relativePath}')`);
}

/**
 * Normalizes a partial filename by removing a leading underscore from the basename, if present.
 *
 * @param relativePath - The relative file path.
 * @returns The normalized file path.
 */
function normalizePartialFilename(relativePath: string): string {
  const segments = relativePath.split('/');
  const lastIndex = segments.length - 1;
  if (segments[lastIndex].startsWith('_')) {
    segments[lastIndex] = segments[lastIndex].substring(1);
  }
  return segments.join('/');
}

/**
 * Retrieves an SCSS import snippet string based on the current workspace configuration.
 *
 * @param relativePath - The relative path of the imported file.
 * @returns A vscode.SnippetString representing the SCSS import statement.
 */
export function getScssImportSnippet(relativePath: string): vscode.SnippetString {
  relativePath = normalizePartialFilename(relativePath);
  let configValue = getAutoImportSetting('stylesheet', 'scss');
  configValue = importStyle.SCSS_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  switch (configValue as number) {
    case 0:
      return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`@import url('${relativePath}');`);
    case 2:
      return new vscode.SnippetString(`@use '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`@use '${relativePath}' as $1`);
    default:
      return new vscode.SnippetString(`@import '${relativePath}';`);
  }
}

/**
 * Retrieves an SCSS image import snippet string based on the current workspace configuration.
 *
 * @param relativePath - The relative path of the image file.
 * @returns A vscode.SnippetString representing the SCSS image import statement.
 */
export function getScssImageImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = getAutoImportSetting('stylesheet', 'scssImage');
  configValue = importStyle.SCSS_IMAGE_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  return new vscode.SnippetString(`url('${relativePath}')`);
}
