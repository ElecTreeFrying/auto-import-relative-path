import * as vscode from 'vscode';
import { NotifyType } from '../model';

/**
 * Displays a notification message based on the specified notification type.
 *
 * @param notifyType - The type of notification to show.
 */
export function showNotification(notifyType: NotifyType): void {
  switch (notifyType) {
    case NotifyType.SameFilePath:
      vscode.window.showWarningMessage('Same file path.');
      break;
    case NotifyType.NotSupported:
      vscode.window.showWarningMessage('Not supported.');
      break;
  }
}
