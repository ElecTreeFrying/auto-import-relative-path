import * as vscode from 'vscode';

import { NotificationType } from '../types/notification';

const SUPPORTED_PAIRS_URL = 'https://github.com/ElecTreeFrying/auto-import-relative-path#supported-source--destination-pairs';

export function showNotification(type: 'same-file-path' | 'no-active-editor' | 'no-file-to-copy' | 'empty-clipboard'): void;
export function showNotification(type: 'not-supported', payload: { sourceExt: string; destinationExt: string }): void;
export function showNotification(type: 'no-extension', payload: { basename: string }): void;
export function showNotification(type: 'source-not-found', payload: { basename: string }): void;
export function showNotification(type: 'copy-success', payload: { basename: string }): Thenable<string | undefined>;
export function showNotification(type: 'no-configurable-style', payload: { sourceExt: string; destinationExt: string }): void;
export function showNotification(type: 'default-style-saved', payload: { description: string }): void;
export function showNotification(
  type: NotificationType,
  payload?: { sourceExt?: string; destinationExt?: string; basename?: string; description?: string },
): Thenable<string | undefined> | void {
  switch (type) {
    case 'same-file-path':
      vscode.window.showWarningMessage('Auto Import: A file cannot import itself.');
      break;
    case 'not-supported':
      void vscode.window.showWarningMessage(
        `Auto Import: Cannot import ${payload!.sourceExt} into ${payload!.destinationExt} files.`,
        'View Supported Files',
      ).then(action => {
        if (action === 'View Supported Files') {
          vscode.env.openExternal(vscode.Uri.parse(SUPPORTED_PAIRS_URL));
        }
      });
      break;
    case 'no-active-editor':
      vscode.window.showWarningMessage('Auto Import: Open a file to paste an import.');
      break;
    case 'no-file-to-copy':
      vscode.window.showWarningMessage('Auto Import: No file selected to copy.');
      break;
    case 'no-extension':
      vscode.window.showWarningMessage(`Auto Import: ${payload!.basename} has no file extension.`);
      break;
    case 'empty-clipboard':
      vscode.window.showWarningMessage('Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.');
      break;
    case 'source-not-found':
      vscode.window.showWarningMessage(`Auto Import: Source file no longer exists: ${payload!.basename}.`);
      break;
    case 'copy-success':
      return vscode.window.showInformationMessage(
        `Auto Import: Copied path — ${payload!.basename}`,
        'Paste with Style',
        'Paste Now',
      );
    case 'no-configurable-style':
      vscode.window.showWarningMessage(`Auto Import: ${payload!.sourceExt} → ${payload!.destinationExt} imports use a fixed style.`);
      break;
    case 'default-style-saved':
      vscode.window.showInformationMessage(`Auto Import: Default style saved — ${payload!.description}`);
      break;
  }
}

export function clearNotifications(): void {
  void vscode.commands.executeCommand('notifications.clearAll');
}
