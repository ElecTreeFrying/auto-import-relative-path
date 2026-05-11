/**
 * JSX destination — thin wrapper that invokes the shared React algorithm
 * (`_shared.ts:buildReactImport`) with JS snippets as the primary builder.
 * See `_shared.ts` for the source-extension dispatch and non-script
 * hardcoded branch.
 */
import * as vscode from 'vscode';

import { buildJavaScriptImportSnippet } from './javascript';
import { buildReactImport } from './_shared';

/**
 * Delegates to `buildReactImport` with JavaScript snippets as the primary
 * script-source builder; no fallback.
 *
 * @returns The JSX import `SnippetString` for the current source.
 */
export function buildSnippet(): Promise<vscode.SnippetString> {
  return buildReactImport({
    primaryExtensions: ['.js', '.jsx'],
    primarySnippet: buildJavaScriptImportSnippet,
  });
}
