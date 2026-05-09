import * as vscode from 'vscode';

import { NotificationType } from '../types/notification';

/**
 * Shows the warning toast that matches the given notification kind.
 *
 * @param notificationType - Which user-visible warning to surface.
 */
export function showNotification(notificationType: NotificationType): void {
  switch (notificationType) {
    case 'same-file-path':
      vscode.window.showWarningMessage('Auto Import Relative Path: Same file path.');
      break;
    case 'not-supported':
      vscode.window.showWarningMessage('Auto Import Relative Path: Not supported.');
      break;
  }
}
