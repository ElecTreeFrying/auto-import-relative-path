import * as vscode from 'vscode';

import { getJavaScriptImportSnippet } from './javascript';
import { renderReactImport } from './_shared';

/**
 * Delegates to `renderReactImport` with JavaScript snippets as the primary
 * script-source builder; no fallback.
 *
 * @returns The JSX import `SnippetString` for the current source.
 */
export function snippet(): Promise<vscode.SnippetString> {
  return renderReactImport({
    primaryExts: ['.js', '.jsx'],
    primarySnippet: getJavaScriptImportSnippet,
  });
}
