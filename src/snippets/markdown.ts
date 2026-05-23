import * as vscode from 'vscode';

import { getAutoImportSetting } from '../config/settings';
import { extractFileExtension } from '../path/extension';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';
import { MARKDOWN_IMAGE_IMPORT_OPTIONS, resolveStyleIndex } from './_styles';

export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'markdown':
      return buildMarkdownImportSnippet(fullPath);
    case 'image':
      return buildMarkdownImageImportSnippet(fullPath);
    default:
      return new vscode.SnippetString('');
  }
}

export function buildMarkdownImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`[\${1:text}](${relativePath})`);
}

/**
 * Returns one of two Markdown image shapes (inline `![alt](path "Hover")` /
 * reference-style) selected by the user's `markdownImageImportStyle` setting.
 * Thin wrapper over {@link buildMarkdownImageImportSnippetByStyle} that reads
 * the user's setting and delegates.
 *
 * @param relativePath - The image's import path.
 * @returns The `SnippetString` for the matched style.
 */
function buildMarkdownImageImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(MARKDOWN_IMAGE_IMPORT_OPTIONS, getAutoImportSetting<string>('markup', 'markdownImage'));
  return buildMarkdownImageImportSnippetByStyle(styleIndex, relativePath);
}

/**
 * Pure switch on `styleIndex` that emits the matching Markdown image
 * `SnippetString`. Reused by the QuickPick aggregator
 * (`snippets/variants.ts`) to render both variants for a given image paste
 * without consulting the user's setting.
 *
 * @param styleIndex - The style key (matches `MARKDOWN_IMAGE_IMPORT_OPTIONS[i].value`).
 *   `undefined` falls through to the inline shape.
 * @param relativePath - The image's import path.
 * @returns The `SnippetString` for the matched style.
 */
export function buildMarkdownImageImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`![alt-text](${relativePath} "Hover text")`);
    case 1:
      return new vscode.SnippetString(`![alt-text][image] / [image]: ${relativePath} "Hover text"`);
    default:
      return new vscode.SnippetString(`![alt-text](${relativePath} "Hover text")`);
  }
}
