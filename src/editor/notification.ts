import * as vscode from 'vscode';

import { NotificationType } from '../types/notification';

/**
 * Shows the toast that matches the given notification kind.
 *
 * Three variants accept a payload that gets interpolated into the rendered message:
 * - `'not-supported'` takes `{ sourceExt, destinationExt }`
 * - `'source-not-found'` takes `{ basename }`
 * - `'copy-success'` takes `{ basename }`
 *
 * The remaining four variants take no payload. TypeScript overload resolution
 * enforces that callers pass the right payload (or omit it) for each kind.
 *
 * Six variants render as warning toasts (`showWarningMessage`); only
 * `'copy-success'` renders as an info toast (`showInformationMessage`).
 *
 * @param type - Which user-visible toast to surface.
 * @param payload - Values interpolated into the message for parameterized variants.
 */
export function showNotification(type: 'same-file-path' | 'no-active-editor' | 'no-file-to-copy' | 'empty-clipboard'): void;
export function showNotification(type: 'not-supported', payload: { sourceExt: string; destinationExt: string }): void;
export function showNotification(type: 'source-not-found', payload: { basename: string }): void;
export function showNotification(type: 'copy-success', payload: { basename: string }): void;
export function showNotification(
  type: NotificationType,
  payload?: { sourceExt?: string; destinationExt?: string; basename?: string },
): void {
  switch (type) {
    case 'same-file-path':
      vscode.window.showWarningMessage('Auto Import: A file cannot import itself.');
      break;
    case 'not-supported':
      vscode.window.showWarningMessage(`Auto Import: Cannot import ${payload!.sourceExt} into ${payload!.destinationExt} files.`);
      break;
    case 'no-active-editor':
      vscode.window.showWarningMessage('Auto Import: Open a file to paste an import.');
      break;
    case 'no-file-to-copy':
      vscode.window.showWarningMessage('Auto Import: No file selected to copy.');
      break;
    case 'empty-clipboard':
      vscode.window.showWarningMessage('Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.');
      break;
    case 'source-not-found':
      vscode.window.showWarningMessage(`Auto Import: Source file no longer exists: ${payload!.basename}.`);
      break;
    case 'copy-success':
      vscode.window.showInformationMessage(`Auto Import: Copied path — ${payload!.basename}`);
      break;
  }
}

/**
 * Dismisses any lingering notification toasts so a fresh one isn't visually stacked on top.
 *
 * @remarks
 * Fire-and-forget — VS Code's `notifications.clearAll` returns a Thenable we
 * deliberately don't await. Centralized here so commands don't reach into
 * `vscode.commands.executeCommand` for notification-system side effects.
 */
export function clearNotifications(): void {
  vscode.commands.executeCommand('notifications.clearAll');
}
