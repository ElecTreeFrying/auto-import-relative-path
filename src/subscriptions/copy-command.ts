import * as vscode from 'vscode';
import * as path from 'path';

export async function copyCommand(): Promise<void> {

  vscode.commands.executeCommand('notifications.clearAll');
  vscode.commands.executeCommand('copyFilePath');

  const filepath = await vscode.env.clipboard.readText();

  vscode.window.showInformationMessage(`Auto Import: Copied ${path.basename(filepath)}`);
  vscode.env.clipboard.writeText(filepath);
}
