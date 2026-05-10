/**
 * The "paste as import (pick style)" command. Mirrors `paste-import.ts`
 * step-by-step but interposes a `vscode.window.showQuickPick` over every
 * style variant produced by `snippets/variants.ts:buildImportSnippetVariants`,
 * letting the user choose ad-hoc per paste without mutating the persisted
 * setting.
 *
 * @remarks
 * **Gating mirrors `paste-import.ts`.** The eight-clause conjunction is
 * preserved verbatim except clauses 7/8 (empty-snippet checks) collapse to
 * `variants.length === 0` — the aggregator returns `[]` for unsupported
 * destinations, which is the structural equivalent of `''`/`'\n'` from a
 * per-language `buildSnippet()`. Defensive snippet-text checks on the
 * first variant catch the "single empty variant" pathological case.
 *
 * **Length-based branch.**
 *
 * - 0 variants → `'not-supported'` toast (defensive — gating already
 *   covers this).
 * - 1 variant → insert directly (matches `cmd+i`'s silent-insert UX for
 *   HTML/Markdown-text/CSS-image/SCSS-image/JSX-non-script destinations
 *   that have a single hardcoded shape).
 * - ≥2 variants → show the QuickPick.
 *
 * **`SnippetString` mutation.** `editor/insert-snippet.ts` mutates the
 * snippet via `appendText('\n')`. Variants store text as a plain string;
 * we reconstruct `new vscode.SnippetString(...)` immediately before
 * insertion so a previous render's appended newline never leaks into a
 * subsequent paste.
 *
 * **Silent rejection.** Every failure path returns void without throwing,
 * matching the contract of the other commands.
 */
import * as vscode from 'vscode';
import * as path from 'path';

import {
  CSS_SUPPORTED_EXTENSIONS,
  HTML_SUPPORTED_EXTENSIONS,
  MARKDOWN_SUPPORTED_EXTENSIONS,
  CROSS_IMPORT_DESTINATIONS,
  SCSS_SUPPORTED_EXTENSIONS,
} from '../constants/extensions';
import { getFilePathInfo } from '../editor/file-path-info';
import { insertImportSnippet } from '../editor/insert-snippet';
import { clearNotifications, showNotification } from '../editor/notification';
import { buildImportSnippetVariants, ImportSnippetVariant } from '../snippets/variants';

/** QuickPick item type — extends `vscode.QuickPickItem` with the snippet text needed to reconstruct the `SnippetString` on selection. */
interface ImportStyleQuickPickItem extends vscode.QuickPickItem {
  snippetText: string;
}

/**
 * Shows a QuickPick of every applicable import-style variant for the
 * clipboard's source path and the active editor's destination, then
 * inserts the chosen snippet. Toasts the user on rejection or empty
 * variant set.
 */
export async function executePasteImportWithStyle(): Promise<void> {
  clearNotifications();

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return showNotification('no-active-editor');
  }

  const [{ sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }, variants] =
    await Promise.all([getFilePathInfo(), buildImportSnippetVariants()]);

  const trimmedSource = sourceFilePath.trim();
  if (trimmedSource === '' || !path.isAbsolute(trimmedSource) || path.extname(trimmedSource) === '') {
    return showNotification('empty-clipboard');
  }

  if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
    return showNotification('same-file-path');
  }

  try {
    await vscode.workspace.fs.stat(vscode.Uri.file(sourceFilePath));
  } catch {
    return showNotification('source-not-found', { basename: path.basename(sourceFilePath) });
  }

  const isEmptyVariantSet =
    variants.length === 0
    || variants[0].snippetText === ''
    || variants[0].snippetText === '\n';

  if (
    (!CROSS_IMPORT_DESTINATIONS.includes(destinationFileExt) && sourceFileExt !== destinationFileExt)
    || (sourceFileExt === '.html' && destinationFileExt === '.html')
    || (!HTML_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.html')
    || (!MARKDOWN_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.md')
    || (!CSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.css')
    || (!SCSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.scss')
    || isEmptyVariantSet
  ) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  if (variants.length === 1) {
    return insertImportSnippet(new vscode.SnippetString(variants[0].snippetText));
  }

  const picked = await vscode.window.showQuickPick(toQuickPickItems(variants), {
    placeHolder: 'Select an import style',
    matchOnDescription: true,
  });
  if (!picked) {
    return;
  }
  return insertImportSnippet(new vscode.SnippetString(picked.snippetText));
}

/** Maps `ImportSnippetVariant`s to QuickPick items, carrying `snippetText` through for reconstruction at insertion time. */
function toQuickPickItems(variants: ImportSnippetVariant[]): ImportStyleQuickPickItem[] {
  return variants.map(v => ({
    label: v.label,
    description: v.description,
    snippetText: v.snippetText,
  }));
}
