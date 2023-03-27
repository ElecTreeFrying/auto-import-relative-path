import * as vscode from 'vscode';
import { copy, paste, patch } from './commands';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
    vscode.commands.registerCommand('extension.autoImportCopy', () => copy()),
    vscode.commands.registerCommand('extension.autoImportPaste', () => paste()),
    vscode.commands.registerCommand('extension.autoImportRelative', () => patch())
  );
}

export function deactivate(): void {}
