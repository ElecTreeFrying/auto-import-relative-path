import * as vscode from 'vscode';
import {
  executeCopyFilePath,
  executePasteImport,
  executeCopyPaste,
  executePasteImportWithStyle,
} from './commands';

/**
 * Activates the extension by registering import commands with VS Code.
 *
 * This function registers four commands:
 * - **extension.copyFilePath**: Copies the current file's path to the clipboard.
 * - **extension.pasteImport**: Pastes an import statement into the active editor.
 * - **extension.copyPaste**: Performs a copy-then-paste action for auto-import.
 * - **extension.pasteImportWithStyle**: Shows a QuickPick of every applicable
 *   import-style variant for the current source/destination pair and inserts
 *   the chosen one — a one-shot override of the persisted style setting.
 *
 * @param context - The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.copyFilePath', () => executeCopyFilePath()),
    vscode.commands.registerCommand('extension.pasteImport', () => executePasteImport()),
    vscode.commands.registerCommand('extension.copyPaste', () => executeCopyPaste()),
    vscode.commands.registerCommand('extension.pasteImportWithStyle', () => executePasteImportWithStyle())
  );
}

/**
 * Deactivates the extension.
 */
export function deactivate(): void {
}
