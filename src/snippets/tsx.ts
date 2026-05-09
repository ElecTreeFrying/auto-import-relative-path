import * as vscode from 'vscode';

import { getJavaScriptImportSnippet } from './javascript';
import { getTypeScriptImportSnippet } from './typescript';
import { renderReactImport } from './_shared';

/**
 * Delegates to `renderReactImport` with TypeScript snippets as primary
 * (`.ts`/`.tsx`) and JavaScript snippets as fallback for `.js` sources.
 *
 * @returns The TSX import `SnippetString` for the current source.
 */
export function snippet(): Promise<vscode.SnippetString> {
  return renderReactImport({
    primaryExts: ['.ts', '.tsx'],
    primarySnippet: getTypeScriptImportSnippet,
    fallbackExts: ['.js'],
    fallbackSnippet: getJavaScriptImportSnippet,
  });
}
