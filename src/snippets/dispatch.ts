import * as vscode from 'vscode';

import { extractFileExtension } from '../path/extension';
import { getFilePathInfo } from '../editor/file-path-info';

import * as javascript from './languages/javascript';
import * as typescript from './languages/typescript';
import * as jsx from './languages/jsx';
import * as tsx from './languages/tsx';
import * as mdx from './languages/mdx';
import * as css from './languages/css';
import * as scss from './languages/scss';
import * as html from './languages/html';
import * as markdown from './languages/markdown';
import * as vue from './languages/vue';
import * as svelte from './languages/svelte';
import * as astro from './languages/astro';

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
    case '.vue':
      return vue.buildSnippet();
    case '.svelte':
      return svelte.buildSnippet();
    case '.astro':
      return astro.buildSnippet();
    default:
      return new vscode.SnippetString('');
  }
}
