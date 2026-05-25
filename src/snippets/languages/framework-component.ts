import * as vscode from 'vscode';

import { FileExtension } from '../../types/file-extension';
import { extractFileExtension } from '../../path/extension';
import { getFilePathInfo } from '../../editor/file-path-info';
import { getAutoImportSetting } from '../../config/settings';
import { buildTypeScriptImportSnippet } from './typescript';

const SCRIPT_SOURCE_EXTENSIONS: ReadonlyArray<FileExtension> = [ '.ts', '.tsx', '.js', '.jsx' ];

export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  const sourceFileExt = extractFileExtension(sourceFilePath) as FileExtension;

  if (SCRIPT_SOURCE_EXTENSIONS.includes(sourceFileExt)) {
    const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
    const fileExtension = shouldPreserveExtension ? sourceFileExt : '';
    return buildTypeScriptImportSnippet(relativePath + fileExtension);
  }

  return buildTypeScriptImportSnippet(relativePath + sourceFileExt);
}
