import * as vscode from 'vscode';
import * as path from 'path';

import { clearNotifications, showNotification } from '../editor/notification';

export async function executeCopyFilePath(): Promise<boolean> {
  clearNotifications();
  await vscode.commands.executeCommand('copyFilePath');

  const filePath = await vscode.env.clipboard.readText();
  const trimmed = filePath.trim();
  if (trimmed === '' || !path.isAbsolute(trimmed) || path.extname(trimmed) === '') {
    showNotification('no-file-to-copy');
    return false;
  }

  await vscode.env.clipboard.writeText(filePath);
  showNotification('copy-success', { basename: path.basename(filePath) }).then(action => {
    switch (action) {
      case 'Paste with Style':
        void vscode.commands.executeCommand('extension.pasteImportWithStyle');
        break;
      case 'Paste Now':
        void vscode.commands.executeCommand('extension.pasteImport');
        break;
    }
  });
  return true;
}
