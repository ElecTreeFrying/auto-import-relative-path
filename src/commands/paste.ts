import * as vscode from 'vscode';
import { NotifyType } from '../model';
import { getFileExt, importStatementSnippet, notify, getRelativePath, insertSnippet } from '../utilities';
import { cssSupported, htmlSupported, markdownSupported, scssSupported } from '../providers';

export async function paste(): Promise<void> {
  vscode.commands.executeCommand('notifications.clearAll');

  const editor = vscode.window.activeTextEditor;
  const toFilepath = editor.document.uri.fsPath;
  const fromFilepath = await vscode.env.clipboard.readText();

  if (fromFilepath.toLowerCase() === toFilepath.toLowerCase()) {
    return notify(NotifyType.SameFilePath);
  }

  if (
    // Checks unsupported drag and drop files
    (
      ![ '.html', '.md', '.css', '.scss', '.tsx', '.jsx' ].includes(getFileExt(toFilepath))
      && (getFileExt(fromFilepath) !== getFileExt(toFilepath)) 
    )
    // Checks HTML to HTML drag and drop
    || (getFileExt(fromFilepath) === '.html' && getFileExt(toFilepath) === '.html')
    // Checks unsupported HTML drag import file extensions
    || (!htmlSupported.includes(getFileExt(fromFilepath)) && getFileExt(toFilepath) === '.html')
    // Checks unsupported Markdown drag import file extensions
    || (!markdownSupported.includes(getFileExt(fromFilepath)) && getFileExt(toFilepath) === '.md')
    // Checks unsupported CSS drag import file extensions
    || (!cssSupported.includes(getFileExt(fromFilepath)) && getFileExt(toFilepath) === '.css')
    // Checks unsupported SCSS drag import file extensions
    || (!scssSupported.includes(getFileExt(fromFilepath)) && getFileExt(toFilepath) === '.scss')
  ) {
    return notify(NotifyType.NotSupported);
  }

  const snippet = importStatementSnippet(
    getRelativePath(toFilepath, fromFilepath),
    fromFilepath,
    toFilepath
  );

  insertSnippet(snippet.appendText('\n'));
}
