import * as vscode from 'vscode';
import * as path from 'path';

import { getFilePathInfo } from '../editor/file-path-info';
import { insertImportSnippet } from '../editor/insert-snippet';
import { clearNotifications, showNotification } from '../editor/notification';
import { isPairSupported } from '../gating';
import { buildImportSnippet } from '../snippets/dispatch';

export async function executePasteImport(): Promise<void> {
  clearNotifications();

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return showNotification('no-active-editor');
  }

  const info = await getFilePathInfo();
  const { sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt } = info;

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

  const snippet = await buildImportSnippet(info);

  if (
    !isPairSupported(info)
    || snippet.value === '\n'
    || snippet.value === ''
  ) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  insertImportSnippet(snippet, info);
}
