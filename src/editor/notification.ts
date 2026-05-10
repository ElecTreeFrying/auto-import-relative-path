import * as vscode from 'vscode';

import { NotificationType } from '../types/notification';

const SUPPORTED_PAIRS_URL = 'https://github.com/ElecTreeFrying/auto-import-relative-path#supported-source--destination-pairs';

/**
 * Shows the toast that matches the given notification kind.
 *
 * Five variants accept a payload that gets interpolated into the rendered message:
 * - `'not-supported'` takes `{ sourceExt, destinationExt }`
 * - `'source-not-found'` takes `{ basename }`
 * - `'copy-success'` takes `{ basename }`
 * - `'no-configurable-style'` takes `{ sourceExt, destinationExt }`
 * - `'default-style-saved'` takes `{ description }`
 *
 * The remaining four variants take no payload. TypeScript overload resolution
 * enforces that callers pass the right payload (or omit it) for each kind.
 *
 * Seven variants render as warning toasts (`showWarningMessage`);
 * `'copy-success'` and `'default-style-saved'` render as info toasts
 * (`showInformationMessage`).
 *
 * Two variants surface action buttons:
 * - `'not-supported'` adds **View Supported Files** which opens the README's
 *   supported-pairs section on GitHub. The click handler is self-contained
 *   (fire-and-forget) so this overload still returns `void`.
 * - `'copy-success'` adds **Paste Now** (runs the default paste-import) and
 *   **Paste with Style** (runs the style-picker variant for ad-hoc style override).
 *   This overload returns the underlying `Thenable<string | undefined>` so
 *   the caller can dispatch on the chosen action without `editor/` reaching
 *   into `commands/`.
 *
 * @param type - Which user-visible toast to surface.
 * @param payload - Values interpolated into the message for parameterized variants.
 */
export function showNotification(type: 'same-file-path' | 'no-active-editor' | 'no-file-to-copy' | 'empty-clipboard'): void;
export function showNotification(type: 'not-supported', payload: { sourceExt: string; destinationExt: string }): void;
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
      vscode.window.showWarningMessage(
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
      vscode.window.showWarningMessage(`Auto Import: No configurable style for ${payload!.sourceExt} → ${payload!.destinationExt} files.`,);
      break;
    case 'default-style-saved':
      vscode.window.showInformationMessage(`Auto Import: Default style saved — ${payload!.description}`);
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
