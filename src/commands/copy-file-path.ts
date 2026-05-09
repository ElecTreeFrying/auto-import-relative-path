/**
 * Executes the built-in `copyFilePath` command, shows a confirmation toast,
 * and writes the path back to the clipboard.
 *
 * @remarks
 * The clipboard round-trip is intentional: VS Code's `copyFilePath` does
 * not always leave the clipboard in a state we can read back deterministically
 * (timing, focus). Reading then re-writing the same string guarantees the
 * subsequent paste-import command sees the path we just announced.
 */
import * as vscode from 'vscode';
import * as path from 'path';

/** Copies the active file's absolute path to the clipboard, toasts the basename, and rewrites the clipboard to the same value. */
export async function executeCopyFilePath(): Promise<void> {
  vscode.commands.executeCommand('notifications.clearAll');
  vscode.commands.executeCommand('copyFilePath');

  const filePath = await vscode.env.clipboard.readText();
  vscode.window.showInformationMessage(`Auto Import: Copied ${path.basename(filePath)}`);
  vscode.env.clipboard.writeText(filePath);
}
