import * as vscode from 'vscode';
import {
  executeCopyFilePath,
  executePasteImport,
  executeCopyPaste,
  executePasteImportWithStyle,
  executeSetDefaultImportStyle,
} from './commands';
import { AutoImportOnDropProvider } from './drop/provider';
import { DROP_LANGUAGE_SELECTORS } from './drop/selector';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.copyFilePath', () => executeCopyFilePath()),
    vscode.commands.registerCommand('extension.pasteImport', () => executePasteImport()),
    vscode.commands.registerCommand('extension.copyPaste', () => executeCopyPaste()),
    vscode.commands.registerCommand('extension.pasteImportWithStyle', () => executePasteImportWithStyle()),
    vscode.commands.registerCommand('extension.setDefaultImportStyle', () => executeSetDefaultImportStyle()),
    vscode.languages.registerDocumentDropEditProvider(DROP_LANGUAGE_SELECTORS, new AutoImportOnDropProvider()),
  );
}

export function deactivate(): void {
}
