/**
 * TSX destination — thin wrapper that invokes the shared React algorithm
 * (`_shared.ts:buildReactImport`) with TS snippets as the primary builder
 * and JS as the fallback for `.js` sources. See `_shared.ts` for the
 * source-extension dispatch and non-script hardcoded branch.
 */
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
