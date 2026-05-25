import * as vscode from 'vscode';
import * as path from 'path';

import {
  ASTRO_SUPPORTED_EXTENSIONS,
  CSS_SUPPORTED_EXTENSIONS,
  HTML_SUPPORTED_EXTENSIONS,
  MARKDOWN_SUPPORTED_EXTENSIONS,
  CROSS_IMPORT_DESTINATIONS,
  SCSS_SUPPORTED_EXTENSIONS,
  SVELTE_SUPPORTED_EXTENSIONS,
  VUE_SUPPORTED_EXTENSIONS,
} from '../constants/extensions';
import { getFilePathInfo } from '../editor/file-path-info';
import { insertImportSnippet } from '../editor/insert-snippet';
import { clearNotifications, showNotification } from '../editor/notification';
import { buildImportSnippet } from '../snippets/dispatch';

export async function executePasteImport(): Promise<void> {
  clearNotifications();

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return showNotification('no-active-editor');
  }

  const [{ sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }, snippet] =
    await Promise.all([getFilePathInfo(), buildImportSnippet()]);

  const trimmedSource = sourceFilePath.trim();
  if (trimmedSource === '' || !path.isAbsolute(trimmedSource)) {
    return showNotification('empty-clipboard');
  }
  if (path.extname(trimmedSource) === '') {
    return showNotification('no-extension', { basename: path.basename(sourceFilePath) });
  }

  if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
    return showNotification('same-file-path');
  }

  try {
    await vscode.workspace.fs.stat(vscode.Uri.file(sourceFilePath));
  } catch {
    return showNotification('source-not-found', { basename: path.basename(sourceFilePath) });
  }

  if (
    (!CROSS_IMPORT_DESTINATIONS.includes(destinationFileExt) && sourceFileExt !== destinationFileExt)
    || (sourceFileExt === '.html' && destinationFileExt === '.html')
    || (!HTML_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.html')
    || (!MARKDOWN_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.md')
    || (!CSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.css')
    || (!SCSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.scss')
    || (!VUE_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.vue')
    || (!SVELTE_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.svelte')
    || (!ASTRO_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.astro')
    || snippet.value === '\n'
    || snippet.value === ''
  ) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  insertImportSnippet(snippet);
}
