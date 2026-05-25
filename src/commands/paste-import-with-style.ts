import * as vscode from 'vscode';
import * as path from 'path';

import {
  CSS_SUPPORTED_EXTENSIONS,
  HTML_SUPPORTED_EXTENSIONS,
  MARKDOWN_SUPPORTED_EXTENSIONS,
  CROSS_IMPORT_DESTINATIONS,
  SCSS_SUPPORTED_EXTENSIONS,
} from '../constants/extensions';
import { getFilePathInfo } from '../editor/file-path-info';
import { insertImportSnippet } from '../editor/insert-snippet';
import { clearNotifications, showNotification } from '../editor/notification';
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

  const [{ sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }, variants] =
    await Promise.all([getFilePathInfo(), buildImportSnippetVariants()]);

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

  const isEmptyVariantSet =
    variants.length === 0
    || variants[0].snippetText === ''
    || variants[0].snippetText === '\n';

  if (
    (!CROSS_IMPORT_DESTINATIONS.includes(destinationFileExt) && sourceFileExt !== destinationFileExt)
    || (sourceFileExt === '.html' && destinationFileExt === '.html')
    || (!HTML_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.html')
    || (!MARKDOWN_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.md')
    || (!CSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.css')
    || (!SCSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.scss')
    || isEmptyVariantSet
  ) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  if (variants.length === 1) {
    return insertImportSnippet(new vscode.SnippetString(variants[0].snippetText));
  }

  const picked = await vscode.window.showQuickPick(toQuickPickItems(variants), {
    placeHolder: 'Select an import style',
    matchOnDescription: true,
  });
  if (!picked) {
    return;
  }
  return insertImportSnippet(new vscode.SnippetString(picked.snippetText));
}

function toQuickPickItems(variants: ImportSnippetVariant[]): ImportStyleQuickPickItem[] {
  return variants.map(v => ({
    label: v.label,
    description: v.description,
    snippetText: v.snippetText,
  }));
}
