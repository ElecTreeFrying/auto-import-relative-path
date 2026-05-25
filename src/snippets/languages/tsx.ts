import * as vscode from 'vscode';

import { buildJavaScriptImportSnippet } from './javascript';
import { buildTypeScriptImportSnippet } from './typescript';
import { buildReactImport } from '../_react';

export function buildSnippet(): Promise<vscode.SnippetString> {
  return buildReactImport({
    primaryExtensions: ['.ts', '.tsx'],
    primarySnippet: buildTypeScriptImportSnippet,
    fallbackExtensions: ['.js', '.jsx'],
    fallbackSnippet: buildJavaScriptImportSnippet,
  });
}
