import * as vscode from 'vscode';

import { buildJavaScriptImportSnippet } from './javascript';
import { buildReactImport } from '../_shared';

export function buildSnippet(): Promise<vscode.SnippetString> {
  return buildReactImport({
    primaryExtensions: ['.js', '.jsx'],
    primarySnippet: buildJavaScriptImportSnippet,
  });
}
