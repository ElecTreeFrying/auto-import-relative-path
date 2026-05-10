/**
 * Executes the built-in `copyFilePath` command, validates the resulting clipboard,
 * shows the appropriate toast, and writes the path back to the clipboard on success.
 *
 * @remarks
 * The clipboard round-trip is intentional: VS Code's `copyFilePath` does
 * not always leave the clipboard in a state we can read back deterministically
 * (timing, focus). Reading then re-writing the same string guarantees the
 * subsequent paste-import command sees the path we just announced.
 *
 * When the built-in `copyFilePath` is a no-op (no focused file / no explorer
 * selection), the clipboard read returns whatever was there before — empty,
 * non-absolute text, or a stale path. The post-condition guard rejects any
 * value that is not an absolute path with an extension, fires the
 * `'no-file-to-copy'` warning, and returns `false` so callers like
 * `commands/copy-paste.ts` can short-circuit before paste-import runs against
 * stale clipboard contents.
 */
import * as vscode from 'vscode';
import * as path from 'path';

import { clearNotifications, showNotification } from '../editor/notification';

/** Copies the active file's absolute path to the clipboard, toasts the basename, and rewrites the clipboard to the same value. Returns `true` on success, or `false` when the built-in `copyFilePath` produced no usable path. */
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
