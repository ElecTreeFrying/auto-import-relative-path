import * as vscode from 'vscode';

import { extractFileExtension } from '../path/extension';
import { getFilePathInfo } from '../editor/file-path-info';

import * as javascript from './javascript';
import * as typescript from './typescript';
import * as jsx from './jsx';
import * as tsx from './tsx';
import * as mdx from './mdx';
import * as css from './css';
import * as scss from './scss';
import * as html from './html';
import * as markdown from './markdown';

export async function buildImportSnippet(): Promise<vscode.SnippetString> {
  const { destinationFilePath } = await getFilePathInfo();

  switch (extractFileExtension(destinationFilePath)) {
    case '.js':
      return javascript.buildSnippet();
    case '.jsx':
      return jsx.buildSnippet();
    case '.ts':
      return typescript.buildSnippet();
    case '.tsx':
      return tsx.buildSnippet();
    case '.mdx':
      return mdx.buildSnippet();
    case '.css':
      return css.buildSnippet();
    case '.scss':
      return scss.buildSnippet();
    case '.html':
      return html.buildSnippet();
    case '.md':
      return markdown.buildSnippet();
    default:
      return new vscode.SnippetString('');
  }
}
