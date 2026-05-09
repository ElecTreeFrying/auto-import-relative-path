import * as vscode from 'vscode';

import { buildJavaScriptImportSnippet } from './javascript';
import { buildTypeScriptImportSnippet } from './typescript';
import { buildReactImport } from './_shared';

/**
 * Delegates to `buildReactImport` with TypeScript snippets as primary
 * (`.ts`/`.tsx`) and JavaScript snippets as fallback for `.js` sources.
 *
 * @returns The TSX import `SnippetString` for the current source.
 */
export function buildSnippet(): Promise<vscode.SnippetString> {
  return buildReactImport({
    primaryExtensions: ['.ts', '.tsx'],
    primarySnippet: buildTypeScriptImportSnippet,
    fallbackExtensions: ['.js'],
    fallbackSnippet: buildJavaScriptImportSnippet,
  });
}
