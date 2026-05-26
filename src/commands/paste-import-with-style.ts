import * as vscode from 'vscode';
import * as path from 'path';

import { getFilePathInfo } from '../editor/file-path-info';
import { insertImportSnippet } from '../editor/insert-snippet';
import { clearNotifications, showNotification } from '../editor/notification';
import { isPairSupported } from '../gating';
import { buildImportSnippetVariants, ImportSnippetVariant } from '../snippets/variants';

interface ImportStyleQuickPickItem extends vscode.QuickPickItem {
  snippetText: string;
}

export async function executePasteImportWithStyle(): Promise<void> {
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

  const variants = await buildImportSnippetVariants(info);

  const isEmptyVariantSet =
    variants.length === 0
    || variants[0].snippetText === ''
    || variants[0].snippetText === '\n';

  if (!isPairSupported(info) || isEmptyVariantSet) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  if (variants.length === 1) {
    return insertImportSnippet(new vscode.SnippetString(variants[0].snippetText), info);
  }

  const picked = await vscode.window.showQuickPick(toQuickPickItems(variants), {
    placeHolder: 'Select an import style',
    matchOnDescription: true,
  });
  if (!picked) {
    return;
  }
  return insertImportSnippet(new vscode.SnippetString(picked.snippetText), info);
}

function toQuickPickItems(variants: ImportSnippetVariant[]): ImportStyleQuickPickItem[] {
  return variants.map(v => ({
    label: v.label,
    description: v.description,
    snippetText: v.snippetText,
  }));
}
