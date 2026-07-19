import * as vscode from 'vscode';
import * as path from 'path';

import { FilePathInfo, getFilePathInfo, getFilePathInfoFromPaths, parseClipboardPaths } from '../editor/file-path-info';
import { insertImportSnippet } from '../editor/insert-snippet';
import { clearNotifications, showNotification } from '../editor/notification';
import { isInlineSnippet } from '../editor/placement';
import { isPairSupported } from '../gating';
import { joinImportStatements } from '../snippets/compose';
import { buildImportSnippet } from '../snippets/dispatch';

export async function executePasteImport(): Promise<void> {
  clearNotifications();

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return showNotification('no-active-editor');
  }

  const clipboardPaths = parseClipboardPaths(await vscode.env.clipboard.readText());
  if (clipboardPaths.length > 1) {
    return pasteMultipleImports(clipboardPaths, editor.document.uri.fsPath);
  }

  const info = await getFilePathInfo();
  const { sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt } = info;

  const trimmedSource = sourceFilePath.trim();
  if (trimmedSource === '' || !path.isAbsolute(trimmedSource)) {
    return showNotification('empty-clipboard');
  }
  if (path.extname(trimmedSource) === '') {
    return showNotification('no-extension', { basename: path.basename(sourceFilePath) });
  }

  if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
    return showNotification('same-file-path');
  }

  try {
    await vscode.workspace.fs.stat(vscode.Uri.file(sourceFilePath));
  } catch {
    return showNotification('source-not-found', { basename: path.basename(sourceFilePath) });
  }

  const snippet = await buildImportSnippet(info);

  if (
    !isPairSupported(info)
    || snippet.value === '\n'
    || snippet.value === ''
  ) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  insertImportSnippet(snippet, info);
}

/** A clipboard member that cleared every check and produced a non-empty snippet. */
interface PasteCandidate {
  value: string;
  info: FilePathInfo;
}

/**
 * Multi-path paste: fans out over every clipboard line, mirroring the drop provider's skip
 * semantics (`drop/provider.ts`) on top of this command's clipboard checks. Skipped members are
 * silent while at least one member inserts; when nothing survives, one aggregate toast fires,
 * most informative first: `not-supported` > `source-not-found` > `same-file-path` >
 * `no-extension` > `empty-clipboard`.
 */
async function pasteMultipleImports(sourceFilePaths: string[], destinationFilePath: string): Promise<void> {
  const candidates: PasteCandidate[] = [];
  let sameFileCount = 0;
  let missingBasename: string | undefined;
  let extensionlessBasename: string | undefined;
  let rejectedInfo: FilePathInfo | undefined;

  for (const sourceFilePath of sourceFilePaths) {
    if (!path.isAbsolute(sourceFilePath)) {
      continue;
    }
    if (path.extname(sourceFilePath) === '') {
      extensionlessBasename = path.basename(sourceFilePath);
      continue;
    }
    if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
      sameFileCount++;
      continue;
    }

    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(sourceFilePath));
    } catch {
      missingBasename = path.basename(sourceFilePath);
      continue;
    }

    const info = getFilePathInfoFromPaths(sourceFilePath, destinationFilePath);

    if (!isPairSupported(info)) {
      rejectedInfo = info;
      continue;
    }

    const snippet = await buildImportSnippet(info);
    if (snippet.value === '' || snippet.value === '\n') {
      rejectedInfo = info;
      continue;
    }

    candidates.push({ value: snippet.value, info });
  }

  if (candidates.length === 0) {
    if (rejectedInfo) {
      return showNotification('not-supported', { sourceExt: rejectedInfo.sourceFileExt, destinationExt: rejectedInfo.destinationFileExt });
    }
    if (missingBasename) {
      return showNotification('source-not-found', { basename: missingBasename });
    }
    if (sameFileCount > 0) {
      return showNotification('same-file-path');
    }
    if (extensionlessBasename) {
      return showNotification('no-extension', { basename: extensionlessBasename });
    }
    return showNotification('empty-clipboard');
  }

  // Inline url() members can't stack (CSS values, not statements) — mirror the drop policy:
  // all-inline inserts the first only; a mixed set keeps the statement-style members.
  const blockCandidates = candidates.filter(candidate => !isInlineSnippet(candidate.info.sourceFileExt, candidate.info.destinationFileExt));
  if (blockCandidates.length === 0) {
    return insertImportSnippet(new vscode.SnippetString(candidates[0].value), candidates[0].info);
  }

  // joinImportStatements ends the block with '\n' and insertImportSnippet appends its own trailing
  // newline, so strip the composed one. Indentation is joined empty: editor.insertSnippet
  // re-indents interior lines to the insertion column (the LaTeX figure relies on the same).
  const block = joinImportStatements(blockCandidates.map(candidate => candidate.value), '').slice(0, -1);
  insertImportSnippet(new vscode.SnippetString(block), blockCandidates[0].info);
}
