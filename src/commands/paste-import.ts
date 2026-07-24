import * as vscode from 'vscode';
import * as path from 'path';

import { FilePathInfo, getFilePathInfo, getFilePathInfoFromPaths, parseClipboardPaths } from '../editor/file-path-info';
import { insertImportSnippet } from '../editor/insert-snippet';
import { clearNotifications, showNotification } from '../editor/notification';
import { isInlineSnippet, isStyleBlockContext } from '../editor/placement';
import { extractFileExtension } from '../path/extension';
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
    return pasteMultipleImports(clipboardPaths, editor);
  }

  const info = await getFilePathInfo();
  const { sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt } = info;

  const trimmedSource = sourceFilePath.trim();
  if (trimmedSource === '' || !path.isAbsolute(trimmedSource)) {
    return showNotification('empty-clipboard');
  }
  // An extensionless source is admitted only into a Markdown destination (as a link); anywhere else
  // it stays a `no-extension` rejection.
  if (path.extname(trimmedSource) === '' && destinationFileExt !== '.md') {
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

  // A stylesheet source dropped inside an SFC `<style>` block takes the `@import`/`@use` dialect and
  // style-block placement; anywhere else it stays the script-block side-effect import.
  const insideStyleBlock = isStyleBlockContext(
    editor.document.getText(),
    destinationFileExt,
    [ sourceFileExt ],
    editor.selection.anchor.line,
  );

  const snippet = await buildImportSnippet(info, insideStyleBlock);

  if (
    !isPairSupported(info)
    || snippet.value === '\n'
    || snippet.value === ''
  ) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  insertImportSnippet(snippet, info, insideStyleBlock);
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
async function pasteMultipleImports(sourceFilePaths: string[], editor: vscode.TextEditor): Promise<void> {
  const destinationFilePath = editor.document.uri.fsPath;
  const destinationFileExt = extractFileExtension(destinationFilePath);
  const destinationIsMarkdown = destinationFileExt === '.md';
  // Decided once for the whole gesture: style-dialect only when every member is a stylesheet and the
  // cursor sits in a `<style>` block (a mixed selection stays script-dialect). See isStyleBlockContext.
  const insideStyleBlock = isStyleBlockContext(
    editor.document.getText(),
    destinationFileExt,
    sourceFilePaths.map(sourceFilePath => extractFileExtension(sourceFilePath)),
    editor.selection.anchor.line,
  );
  const candidates: PasteCandidate[] = [];
  let sameFileCount = 0;
  let missingBasename: string | undefined;
  let extensionlessBasename: string | undefined;
  let rejectedInfo: FilePathInfo | undefined;

  for (const sourceFilePath of sourceFilePaths) {
    if (!path.isAbsolute(sourceFilePath)) {
      continue;
    }
    // Extensionless sources import only into a Markdown destination (as a link). Elsewhere they are
    // remembered for the aggregate `no-extension` toast and skipped; into `.md` they fall through to
    // the same same-file / stat / gating pipeline as any other source.
    if (path.extname(sourceFilePath) === '' && !destinationIsMarkdown) {
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

    const snippet = await buildImportSnippet(info, insideStyleBlock);
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
    return insertImportSnippet(new vscode.SnippetString(candidates[0].value), candidates[0].info, insideStyleBlock);
  }

  // joinImportStatements ends the block with '\n' and insertImportSnippet appends its own trailing
  // newline, so strip the composed one. Indentation is joined empty: editor.insertSnippet
  // re-indents interior lines to the insertion column (the LaTeX figure relies on the same).
  const block = joinImportStatements(blockCandidates.map(candidate => candidate.value), '').slice(0, -1);
  insertImportSnippet(new vscode.SnippetString(block), blockCandidates[0].info, insideStyleBlock);
}
