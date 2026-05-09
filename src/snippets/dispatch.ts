/**
 * Destination-extension dispatch — the public surface of `snippets/`. One
 * `case` per per-language module. Keep in sync with
 * `constants/extensions.ts`: a new destination extension requires a new
 * `case` here AND a new per-language module under `snippets/`.
 */
import * as vscode from 'vscode';

import { extractFileExtension } from '../path/extension';
import { getFilePathInfo } from '../editor/file-path-info';

import * as javascript from './javascript';
import * as typescript from './typescript';
import * as jsx from './jsx';
import * as tsx from './tsx';
import * as css from './css';
import * as scss from './scss';
import * as html from './html';
import * as markdown from './markdown';

/**
 * Returns the snippet for the active editor's destination extension by
 * delegating to the matching per-language module.
 *
 * @returns The per-language snippet, or an empty `SnippetString` when the
 *   destination extension doesn't match any `case` (must stay in sync with
 *   `constants/extensions.ts`).
 */
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
