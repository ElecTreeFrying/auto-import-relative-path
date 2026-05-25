import * as vscode from 'vscode';

import { extractFileExtension } from '../path/extension';
import { getFilePathInfo } from '../editor/file-path-info';

import * as javascript from './languages/javascript';
import * as typescript from './languages/typescript';
import * as jsx from './languages/jsx';
import * as tsx from './languages/tsx';
import * as css from './languages/css';
import * as scss from './languages/scss';
import * as html from './languages/html';
import * as markdown from './languages/markdown';
import * as frameworkComponent from './languages/framework-component';

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
    case '.mdx':
      return tsx.buildSnippet();
    case '.css':
      return css.buildSnippet();
    case '.scss':
      return scss.buildSnippet();
    case '.html':
      return html.buildSnippet();
    case '.md':
      return markdown.buildSnippet();
    case '.vue':
    case '.svelte':
    case '.astro':
      return frameworkComponent.buildSnippet();
    default:
      return new vscode.SnippetString('');
  }
}
