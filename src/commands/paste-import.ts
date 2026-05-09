/**
 * The paste-import command. Reads a previously-copied source path from the
 * clipboard, generates a language-appropriate import snippet for the active
 * editor's destination, and inserts it.
 *
 * @remarks
 * **Gating.** The eight-clause conjunction below is the canonical list of
 * rejected source/destination pairs. Each clause cross-references a table
 * in `constants/extensions.ts`:
 *
 * - `CROSS_IMPORT_DESTINATIONS` — destinations allowed to import a different
 *   extension. For destinations *not* in this list (currently `.js`, `.ts`),
 *   source and destination extensions must match.
 * - `HTML_SUPPORTED_EXTENSIONS`, `MARKDOWN_SUPPORTED_EXTENSIONS`,
 *   `CSS_SUPPORTED_EXTENSIONS`, `SCSS_SUPPORTED_EXTENSIONS` — what each
 *   markup/stylesheet destination accepts as a source.
 * - `.html → .html` is always rejected (no relative-import syntax for HTML
 *   embedding itself).
 * - Empty snippet output (`''` or `'\n'`) is the catch-all for "no language
 *   module handled this destination" — see `snippets/dispatch.ts`.
 *
 * Changing any gating table requires updating the matching clause here in
 * lock-step.
 *
 * **Parallel fetch.** `getFilePathInfo()` and `buildImportSnippet()` are
 * resolved together via `Promise.all` because both internally read the
 * clipboard and the active editor — running them concurrently halves the
 * latency. Neither depends on the other's result.
 *
 * **Silent rejection.** Every failure path returns void without throwing.
 * The user-visible signal is the warning toast raised via
 * `showNotification` (see `types/notification.ts:NotificationType`).
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
import { buildImportSnippet } from '../snippets/dispatch';

/** Generates and inserts a relative-path import snippet for the clipboard's source path into the active editor, toasting the user on rejection. */
export async function executePasteImport(): Promise<void> {
  clearNotifications();

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return showNotification('no-active-editor');
  }

  const [{ sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }, snippet] =
    await Promise.all([getFilePathInfo(), buildImportSnippet()]);

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

  if (
    (!CROSS_IMPORT_DESTINATIONS.includes(destinationFileExt) && sourceFileExt !== destinationFileExt)
    || (sourceFileExt === '.html' && destinationFileExt === '.html')
    || (!HTML_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.html')
    || (!MARKDOWN_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.md')
    || (!CSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.css')
    || (!SCSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt) && destinationFileExt === '.scss')
    || snippet.value === '\n'
    || snippet.value === ''
  ) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  insertImportSnippet(snippet);
}
