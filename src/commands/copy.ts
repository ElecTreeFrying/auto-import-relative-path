import * as vscode from 'vscode';
import * as path from 'path';
import { notify } from '../utilities';
import { NotifyType } from '../model';
import { supportedFileExt } from '../providers';

export async function copy(): Promise<void> {
  vscode.commands.executeCommand('notifications.clearAll');

  await vscode.commands.executeCommand('copyFilePath');
  
  const filepath = await vscode.env.clipboard.readText();
  const extname = path.extname(filepath);
  const file = path.basename(filepath);

  if (supportedFileExt.includes(extname)) {
    vscode.env.clipboard.writeText(filepath);
    vscode.window.showInformationMessage(`Auto Import: Copied ${file}`);
  } else {
    notify(NotifyType.NotSupported);
  }
}
