import * as vscode from 'vscode';
import { NotifyType } from '../model';
import { getFileExt, importStatementSnippet, notify, getRelativePath, insertSnippet } from '../utilities';
import { cssSupported, htmlSupported, markdownSupported, permittedExts, scssSupported } from '../providers';

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
    (!permittedExts.includes(getFileExt(toFilepath)) && (getFileExt(fromFilepath) !== getFileExt(toFilepath)) )
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
    importRelativePath(toFilepath, fromFilepath);
    return notify(NotifyType.NotSupported);
  }

  const snippet = importStatementSnippet(
    getRelativePath(toFilepath, fromFilepath),
    fromFilepath,
    toFilepath
  );

  if (snippet.value === '\n') {
    importRelativePath(toFilepath, fromFilepath);
    return notify(NotifyType.NotSupported);
  }

  insertSnippet(
    snippet.appendText('\n'),
    isCursorPosition(toFilepath, fromFilepath)
  );
}

function importRelativePath(toFilepath: string, fromFilepath: string): void {
  const snippet = new vscode.SnippetString(`${getRelativePath(toFilepath, fromFilepath) + getFileExt(fromFilepath)}`);
  insertSnippet(snippet.appendText('\n'), true);
}

function isCursorPosition(toFilepath: string, fromFilepath: string): boolean {
  return (getFileExt(fromFilepath) !== '.css' && getFileExt(toFilepath) === '.css')
    || (getFileExt(fromFilepath) !== '.scss' && getFileExt(toFilepath) === '.scss')
    || getFileExt(toFilepath) === '.html'
    || getFileExt(toFilepath) === '.md';
}
