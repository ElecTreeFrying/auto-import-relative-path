import * as vscode from 'vscode';
import {
  executeCopyFilePath,
  executePasteImport,
  executeCopyPaste,
  executePasteImportWithStyle,
  executeSetDefaultImportStyle,
} from './commands';

/**
 * Activates the extension by registering import commands with VS Code.
 *
 * This function registers five commands:
 * - **extension.copyFilePath**: Copies the current file's path to the clipboard.
 * - **extension.pasteImport**: Pastes an import statement into the active editor.
 * - **extension.copyPaste**: Performs a copy-then-paste action for auto-import.
 * - **extension.pasteImportWithStyle**: Shows a QuickPick of every applicable
 *   import-style variant for the current source/destination pair and inserts
 *   the chosen one — a one-shot override of the persisted style setting.
 * - **extension.setDefaultImportStyle**: Same picker as `pasteImportWithStyle`,
 *   but persists the chosen style as the default in the user's workspace
 *   configuration instead of inserting a one-shot snippet.
 *
 * @param context - The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.copyFilePath', () => executeCopyFilePath()),
    vscode.commands.registerCommand('extension.pasteImport', () => executePasteImport()),
    vscode.commands.registerCommand('extension.copyPaste', () => executeCopyPaste()),
    vscode.commands.registerCommand('extension.pasteImportWithStyle', () => executePasteImportWithStyle()),
    vscode.commands.registerCommand('extension.setDefaultImportStyle', () => executeSetDefaultImportStyle())
  );
}

/**
 * Deactivates the extension.
 */
export function deactivate(): void {
}
