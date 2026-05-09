/**
 * Shared algorithm for JSX and TSX snippet generation. Both destinations
 * use the same source-extension dispatch; they differ only in *which*
 * script-snippet builder they delegate to. {@link renderReactImport}
 * parameterises that choice via {@link ReactImportOptions}.
 *
 * @remarks
 * **JSX vs TSX asymmetry — the entire reason this helper exists:**
 *
 * - JSX: primary `['.js', '.jsx']` → JavaScript snippet. No fallback.
 * - TSX: primary `['.ts', '.tsx']` → TypeScript snippet. *Fallback*
 *   `['.js']` → JavaScript snippet, because a `.js` source dropped into
 *   a TSX file should still emit a JS-shaped import, not a TS-shaped one.
 *
 * **Non-script sources fall through to a hardcoded switch.** Image, data,
 * markup, and YAML extensions emit `import name$1 from '${path}';`; fonts
 * and stylesheets emit a side-effect `import '${path}';`. The switch
 * intentionally hardcodes the source list — duplicating it as a constant
 * would just create two places to update. Reaching the `default:` branch
 * means an unsupported extension slipped through gating in
 * `commands/paste-import.ts`; the empty `SnippetString` is then caught by
 * that file's `snippet.value === ''` check.
 *
 * **Filename starts with `_` to mark this module as internal to
 * `snippets/`.** Only `jsx.ts` and `tsx.ts` should import from here.
 */
import * as vscode from 'vscode';

import { FileExtension } from '../types/file-extension';
import { extractFileExtension } from '../path/extension';
import { getFilePathInfo } from '../editor/file-path-info';
import { getAutoImportSetting } from '../config/settings';

/** Builder that turns an already-computed relative path into a script-import `SnippetString`. JSX uses the JS variant; TSX uses TS for `.ts`/`.tsx` and falls back to JS for `.js`. */
export type ScriptSnippet = (relativePath: string) => vscode.SnippetString;

export interface ReactImportOptions {
  /** Source extensions that should be rendered with `primarySnippet` (e.g. `['.js', '.jsx']` for JSX, `['.ts', '.tsx']` for TSX). */
  primaryExts: ReadonlyArray<FileExtension>;
  /** Snippet builder used when the source extension is in `primaryExts`. */
  primarySnippet: ScriptSnippet;
  /** Optional secondary extension list. TSX sets `['.js']` so a `.js` source dropped into a TSX file gets a JS-shaped import; JSX leaves this unset. */
  fallbackExts?: ReadonlyArray<FileExtension>;
  /** Optional snippet builder paired with `fallbackExts`. Required iff `fallbackExts` is set. */
  fallbackSnippet?: ScriptSnippet;
}

/**
 * Generates a JSX/TSX import snippet by routing the source extension
 * through (in order) `opts.primaryExts`, `opts.fallbackExts`, then a
 * hardcoded image/data/font/stylesheet switch.
 *
 * @param opts - Strategy configuration.
 * @param opts.primaryExts - Source extensions that route to `primarySnippet`.
 * @param opts.primarySnippet - Snippet builder for `primaryExts` sources.
 * @param opts.fallbackExts - Optional secondary extension list (used by TSX for `.js`).
 * @param opts.fallbackSnippet - Optional snippet builder for `fallbackExts` sources.
 * @returns The rendered `SnippetString`, or an empty one for sources outside
 *   every list.
 */
export async function renderReactImport(opts: ReactImportOptions): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  const preserve = getAutoImportSetting('script', 'preserveScriptFileExtension');
  const fileExtension = preserve ? extractFileExtension(sourceFilePath) : '';
  const sourceExt = extractFileExtension(sourceFilePath) as FileExtension;

  if (opts.primaryExts.includes(sourceExt)) {
    return opts.primarySnippet(relativePath + fileExtension);
  }
  if (opts.fallbackSnippet && opts.fallbackExts?.includes(sourceExt)) {
    return opts.fallbackSnippet(relativePath + fileExtension);
  }

  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (sourceExt) {
    case '.gif':
    case '.jpeg':
    case '.jpg':
    case '.png':
    case '.webp':
    case '.json':
    case '.html':
    case '.yml':
    case '.yaml':
    case '.md':
      return new vscode.SnippetString(`import name$1 from '${fullPath}';`);
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.eot':
    case '.css':
    case '.scss':
      return new vscode.SnippetString(`import '${fullPath}';`);
    default:
      return new vscode.SnippetString('');
  }
}
