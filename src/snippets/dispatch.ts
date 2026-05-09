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
export async function generateImportSnippet(): Promise<vscode.SnippetString> {
  const { destinationFilePath } = await getFilePathInfo();

  switch (extractFileExtension(destinationFilePath)) {
    case '.js':
      return javascript.snippet();
    case '.jsx':
      return jsx.snippet();
    case '.ts':
      return typescript.snippet();
    case '.tsx':
      return tsx.snippet();
    case '.css':
      return css.snippet();
    case '.scss':
      return scss.snippet();
    case '.html':
      return html.snippet();
    case '.md':
      return markdown.snippet();
    default:
      return new vscode.SnippetString('');
  }
}
