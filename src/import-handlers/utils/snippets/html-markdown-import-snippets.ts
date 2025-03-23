import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../../utils';
import { importStyle } from '../../../constants';
import { ImportStyle } from '../../../model';

/**
 * Retrieves an HTML script import snippet string based on the current configuration.
 *
 * @param relativePath - The relative path of the script file.
 * @returns A vscode.SnippetString representing the HTML script tag.
 */
export function getHtmlScriptImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = getAutoImportSetting('markup', 'htmlScript');
  configValue = importStyle.HTML_SCRIPT_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  return new vscode.SnippetString(`<script type="text/javascript" src="${relativePath}"></script>`);
}

/**
 * Retrieves an HTML image import snippet string based on the current configuration.
 *
 * @param relativePath - The relative path of the image file.
 * @returns A vscode.SnippetString representing the HTML image element.
 */
export function getHtmlImageImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = getAutoImportSetting('markup', 'htmlImage');
  configValue = importStyle.HTML_IMAGE_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  return new vscode.SnippetString(`<img src="${relativePath}" alt="sample">`);
}

/**
 * Retrieves an HTML stylesheet import snippet string based on the current configuration.
 *
 * @param relativePath - The relative path of the stylesheet file.
 * @returns A vscode.SnippetString representing the HTML link element.
 */
export function getHtmlStylesheetImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = getAutoImportSetting('markup', 'htmlStylesheet');
  configValue = importStyle.HTML_STYLESHEET_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  return new vscode.SnippetString(`<link href="${relativePath}" rel="stylesheet">`);
}

/**
 * Retrieves a Markdown import snippet string based on the current configuration.
 *
 * @param relativePath - The relative path of the file.
 * @returns A vscode.SnippetString representing the Markdown import syntax.
 */
export function getMarkdownImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = getAutoImportSetting('markup', 'markdown');
  configValue = importStyle.MARKDOWN_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  return new vscode.SnippetString(`![text](${relativePath})`);
}

/**
 * Retrieves a Markdown image import snippet string based on the current configuration.
 *
 * @param relativePath - The relative path of the image file.
 * @returns A vscode.SnippetString representing the Markdown image syntax.
 */
export function getMarkdownImageImportSnippet(relativePath: string): vscode.SnippetString {
  let configValue = getAutoImportSetting('markup', 'markdownImage');
  configValue = importStyle.MARKDOWN_IMAGE_IMPORT_OPTIONS.find(
    (option: ImportStyle) => option.description === configValue
  )?.value;

  switch (configValue as number) {
    case 0:
      return new vscode.SnippetString(`![alt-text](${relativePath} "Hover text")`);
    case 1:
      return new vscode.SnippetString(`![alt-text][image] / [image]: ${relativePath} "Hover text"`);
    default:
      return new vscode.SnippetString(`![alt-text](${relativePath} "Hover text")`);
  }
}
