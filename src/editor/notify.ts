import * as vscode from 'vscode';

import { NotifyType } from '../types/notification';

/**
 * Shows the warning toast that matches the given notification kind.
 *
 * @param notifyType - Which user-visible warning to surface.
 */
export function showNotification(notifyType: NotifyType): void {
  switch (notifyType) {
    case 'same-file-path':
      vscode.window.showWarningMessage('Auto Import Relative Path: Same file path.');
      break;
    case 'not-supported':
      vscode.window.showWarningMessage('Auto Import Relative Path: Not supported.');
      break;
  }
}
