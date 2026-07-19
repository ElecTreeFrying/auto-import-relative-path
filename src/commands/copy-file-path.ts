import * as vscode from 'vscode';
import * as path from 'path';

import { filterCopyablePaths, parseClipboardPaths } from '../editor/file-path-info';
import { clearNotifications, showNotification } from '../editor/notification';

export async function executeCopyFilePath(): Promise<boolean> {
  clearNotifications();
  await vscode.commands.executeCommand('copyFilePath');

  const clipboardText = await vscode.env.clipboard.readText();
  const copiedPaths = parseClipboardPaths(clipboardText);

  if (copiedPaths.length > 1) {
    return copyMultipleFilePaths(copiedPaths);
  }

  const filePath = clipboardText;
  const trimmed = filePath.trim();
  if (trimmed === '' || !path.isAbsolute(trimmed)) {
    showNotification('no-file-to-copy');
    return false;
  }
  if (path.extname(trimmed) === '') {
    showNotification('no-extension', { basename: path.basename(trimmed) });
    return false;
  }

  await vscode.env.clipboard.writeText(filePath);
  void showNotification('copy-success', { basenames: [path.basename(filePath)] }).then(dispatchPasteAction);
  return true;
}

/**
 * Multi-selection copy: keeps the copyable members (absolute + extensioned), then re-writes the
 * clipboard with exactly that filtered list — newline-joined, the same wire format the built-in
 * `copyFilePath` produced — so the next paste sees precisely what the toast announced. A selection
 * with no copyable member reuses the single-path failure toasts (`no-extension` when an absolute
 * member merely lacks an extension, else `no-file-to-copy`).
 */
async function copyMultipleFilePaths(copiedPaths: string[]): Promise<boolean> {
  const copyablePaths = filterCopyablePaths(copiedPaths);

  if (copyablePaths.length === 0) {
    const extensionless = copiedPaths.find(candidate => path.isAbsolute(candidate) && path.extname(candidate) === '');
    if (extensionless) {
      showNotification('no-extension', { basename: path.basename(extensionless) });
    } else {
      showNotification('no-file-to-copy');
    }
    return false;
  }

  await vscode.env.clipboard.writeText(copyablePaths.join('\n'));
  void showNotification('copy-success', { basenames: copyablePaths.map(candidate => path.basename(candidate)) })
    .then(dispatchPasteAction);
  return true;
}

/**
 * Dispatches the `copy-success` toast's clicked action button. The case labels are bound by the
 * two-site byte-exact contract with the button literals in `editor/notification.ts`.
 */
function dispatchPasteAction(action: string | undefined): void {
  switch (action) {
    case 'Paste with Style':
      void vscode.commands.executeCommand('extension.pasteImportWithStyle');
      break;
    case 'Paste Now':
      void vscode.commands.executeCommand('extension.pasteImport');
      break;
  }
}
