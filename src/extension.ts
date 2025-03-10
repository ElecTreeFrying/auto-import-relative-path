import * as vscode from 'vscode';
import {
  executeCopyFilePathCommand,
  executePasteImportCommand,
  executeCopyPasteCommand,
} from './commands';

/**
 * Activates the extension by registering import commands with VS Code.
 *
 * This function registers three commands:
 * - **autoImport.copyFilePath**: Copies the current file's path to the clipboard.
 * - **autoImport.pasteImport**: Pastes an import statement into the active editor.
 * - **autoImport.copyPaste**: Performs a copy-then-paste action for auto-import.
 *
 * @param context - The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.copyFilePath', () => executeCopyFilePathCommand()),
    vscode.commands.registerCommand('extension.pasteImport', () => executePasteImportCommand()),
    vscode.commands.registerCommand('extension.copyPaste', () => executeCopyPasteCommand())
  );
}

/**
 * Deactivates the extension.
 */
export function deactivate(): void {
}
