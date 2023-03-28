import * as vscode from 'vscode';
import { copyCommand, pasteCommand, patchCommand } from './subscriptions';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
    vscode.commands.registerCommand('extension.autoImportCopy', () => copyCommand()),
    vscode.commands.registerCommand('extension.autoImportPaste', () => pasteCommand()),
    vscode.commands.registerCommand('extension.autoImportRelative', () => patchCommand())
  );
}

export function deactivate(): void {}
