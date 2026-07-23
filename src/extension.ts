import * as vscode from 'vscode';
import {
  executeCopyFilePath,
  executePasteImport,
  executeCopyPaste,
  executePasteImportWithStyle,
  executeSetDefaultImportStyle,
  executeSetImportPlacement,
  executeTogglePreserveScriptExtension,
  executeResetImportStyles,
} from './commands';
import { AutoImportOnDropProvider, EDIT_KIND } from './drop/provider';
import { DROP_LANGUAGE_SELECTORS } from './drop/selector';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.copyFilePath', () => executeCopyFilePath()),
    vscode.commands.registerCommand('extension.pasteImport', () => executePasteImport()),
    vscode.commands.registerCommand('extension.copyPaste', () => executeCopyPaste()),
    vscode.commands.registerCommand('extension.pasteImportWithStyle', () => executePasteImportWithStyle()),
    vscode.commands.registerCommand('extension.setDefaultImportStyle', () => executeSetDefaultImportStyle()),
    vscode.commands.registerCommand('extension.setImportPlacement', () => executeSetImportPlacement()),
    vscode.commands.registerCommand('extension.togglePreserveScriptExtension', () => executeTogglePreserveScriptExtension()),
    vscode.commands.registerCommand('extension.resetImportStyles', () => executeResetImportStyles()),
    vscode.languages.registerDocumentDropEditProvider(
      DROP_LANGUAGE_SELECTORS,
      new AutoImportOnDropProvider(),
      // `providedDropEditKinds` declares our edit's kind up front so VS Code ranks it against
      // competing providers. Without it, our `.tsx`/`.jsx` edit lost to the built-in TypeScript
      // "drop to update imports" provider (a raw default import inserted at the drop point); declaring
      // our more-specific `TextUpdateImports.autoImport` kind makes ours the applied edit, preserving
      // the span-hop / column-0 placement. See EDIT_KIND in drop/provider.ts.
      { dropMimeTypes: [ 'text/uri-list' ], providedDropEditKinds: [ EDIT_KIND ] },
    ),
  );
}

export function deactivate(): void {
}
