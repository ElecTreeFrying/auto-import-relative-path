/**
 * The "set default import style" command. Mirrors
 * `paste-import-with-style.ts` step-by-step through gating and clipboard
 * checks, but instead of inserting the picked variant, persists the chosen
 * style as the default in the user's workspace configuration via
 * {@link setAutoImportSetting}.
 *
 * @remarks
 * **Gating mirrors `paste-import-with-style.ts` verbatim** (which itself
 * mirrors `paste-import.ts`). The same eight-clause conjunction plus the
 * `isEmptyVariantSet` defensive check rejects with `'not-supported'`.
 *
 * **Length/setting branch.**
 *
 * - 0 variants OR empty first variant → `'not-supported'` (defensive, gated
 *   above).
 * - 1 variant OR `variants[0].setting === undefined` → `'no-configurable-style'`
 *   toast. Hardcoded destinations (HTML, Markdown text, CSS/SCSS image,
 *   JSX/TSX non-script source) have no user-configurable style — the
 *   matching `*ImportStyle` settings exist in `package.json` for UI parity
 *   only, and `_styles.ts` flags them "Currently unused". Persisting one
 *   would be misleading.
 * - ≥2 styled variants → `vscode.window.showQuickPick`. On pick, call
 *   `setAutoImportSetting(namespace, key, value)` and emit
 *   `'default-style-saved'` info toast.
 *
 * **Same picker items as `pasteImportWithStyle`.** Reuses
 * `snippets/variants.ts:buildImportSnippetVariants` so both commands surface
 * the same options for the same source/destination pair. The new `setting`
 * field on `ImportSnippetVariant` is what makes the persist path possible
 * without a parallel aggregator.
 *
 * **Current-default indicator.** Before showing the picker, the command
 * reads the persisted value via `getAutoImportSetting` (which falls back to
 * the `package.json` default when unset). The matching variant is moved to
 * position 0 and its `description` gets `$(check) Current default`
 * appended, so the user can see which entry is currently saved. The
 * destination switch in `variants.ts` enumerates from one table per branch,
 * so all picker variants share one `(namespace, key)` — a single setting
 * read suffices.
 *
 * **Silent rejection.** Cancellation (Esc) returns void, matching the
 * contract of the other commands.
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
import { getAutoImportSetting, setAutoImportSetting } from '../config/settings';
import { getFilePathInfo } from '../editor/file-path-info';
import { clearNotifications, showNotification } from '../editor/notification';
import { buildImportSnippetVariants, ImportSnippetVariant } from '../snippets/variants';

/** QuickPick item type — extends `vscode.QuickPickItem` with the `setting` triple needed to persist the choice on selection. */
interface ImportStyleQuickPickItem extends vscode.QuickPickItem {
  setting: NonNullable<ImportSnippetVariant['setting']>;
}

/**
 * Shows a QuickPick of every applicable import-style variant for the
 * clipboard's source path and the active editor's destination, then
 * persists the chosen style as the default in the user's workspace
 * configuration. Toasts on rejection or when the destination has no
 * configurable style.
 */
export async function executeSetDefaultImportStyle(): Promise<void> {
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

  if (variants.length === 1 || variants[0].setting === undefined) {
    return showNotification('no-configurable-style', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  const { namespace, key } = variants[0].setting;
  const currentValue = getAutoImportSetting<string>(namespace, key);

  const picked = await vscode.window.showQuickPick(toQuickPickItems(variants, currentValue), {
    placeHolder: 'Set default import style',
    matchOnDescription: true,
  });
  if (!picked) {
    return;
  }

  await setAutoImportSetting(picked.setting.namespace, picked.setting.key, picked.setting.value);
  return showNotification('default-style-saved', { description: picked.setting.value });
}

/**
 * Maps `ImportSnippetVariant`s to QuickPick items, carrying the `setting`
 * triple through for `setAutoImportSetting` at selection time. Variants
 * without a `setting` field are filtered out — the caller short-circuits
 * before reaching this helper when `variants[0].setting === undefined`,
 * but the filter is a defensive belt against future mixed sets.
 *
 * The variant whose `setting.value` matches `currentValue` is moved to
 * position 0 and gets `$(check) Current default` appended to its
 * `description` so the user can see which entry is currently persisted.
 * If no variant matches (configuration drift, or the user has typed a
 * value that isn't in `_styles.ts`), the table renders in its natural
 * order with no indicator.
 */
function toQuickPickItems(
  variants: ImportSnippetVariant[],
  currentValue: string | undefined,
): ImportStyleQuickPickItem[] {
  const items: ImportStyleQuickPickItem[] = [];
  let currentIdx = -1;
  for (const v of variants) {
    if (!v.setting) {
      continue;
    }
    const isCurrent = v.setting.value === currentValue;
    if (isCurrent) {
      currentIdx = items.length;
    }
    items.push({
      label: v.label,
      description: isCurrent ? `${v.description} $(check) Current default` : v.description,
      setting: v.setting,
    });
  }
  if (currentIdx > 0) {
    const [current] = items.splice(currentIdx, 1);
    items.unshift(current);
  }
  return items;
}
