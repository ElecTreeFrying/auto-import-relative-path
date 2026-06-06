import * as vscode from 'vscode';
import * as path from 'path';

import { getFilePathInfoFromPaths } from '../editor/file-path-info';
import { showNotification } from '../editor/notification';
import { computeImportPlacement } from '../editor/placement';
import { isPairSupported } from '../gating';
import { buildImportSnippet } from '../snippets/dispatch';

const EDIT_KIND = vscode.DocumentDropOrPasteEditKind.TextUpdateImports.append('autoImport');
const EDIT_TITLE = 'Auto Import';

/** Offers an import snippet when a file is dragged from the Explorer onto a supported editor. */
export class AutoImportOnDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    dataTransfer: vscode.DataTransfer,
    _token: vscode.CancellationToken,
  ): Promise<vscode.DocumentDropEdit | null> {
    const sourceFilePath = resolveSourcePath(dataTransfer);
    if (!sourceFilePath) {
      // Couldn't identify the dragged file at all — cede to VS Code's default drop
      // handling rather than swallowing an unidentified payload.
      return null;
    }

    const destinationFilePath = document.uri.fsPath;

    if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
      showNotification('same-file-path');
      return suppressDrop();
    }

    const info = getFilePathInfoFromPaths(sourceFilePath, destinationFilePath);

    if (!isPairSupported(info)) {
      showNotification('not-supported', { sourceExt: info.sourceFileExt, destinationExt: info.destinationFileExt });
      return suppressDrop();
    }

    const snippet = await buildImportSnippet(info);

    if (snippet.value === '' || snippet.value === '\n') {
      showNotification('not-supported', { sourceExt: info.sourceFileExt, destinationExt: info.destinationFileExt });
      return suppressDrop();
    }

    const placement = computeImportPlacement(
      document.getText(),
      info.destinationFileExt,
      info.sourceFileExt,
      position.line,
      position.character,
    );

    if (placement.isInline) {
      return new vscode.DocumentDropEdit(snippet, EDIT_TITLE, EDIT_KIND);
    }

    const finalValue = placement.wrapperPrefix
      ? placement.wrapperPrefix + placement.indentation + snippet.value + '\n' + (placement.wrapperSuffix || '')
      : placement.indentation + snippet.value + '\n';

    const dropEdit = new vscode.DocumentDropEdit(new vscode.SnippetString(''), EDIT_TITLE, EDIT_KIND);
    const edit = new vscode.WorkspaceEdit();
    edit.set(document.uri, [
      vscode.SnippetTextEdit.insert(
        new vscode.Position(placement.line, placement.column),
        new vscode.SnippetString(finalValue),
      ),
    ]);
    dropEdit.additionalEdit = edit;

    return dropEdit;
  }
}

/**
 * Consumes a drop we won't turn into an import, without inserting anything.
 *
 * Returning `null` only tells VS Code we decline the drop — it then falls back to
 * its built-in "insert relative path" edit, which is the stray path that showed up
 * on unsupported drops. Returning an empty edit that out-ranks that default resolves
 * the drop to a no-op instead, so nothing lands in the document. The
 * `'not-supported'` / `'same-file-path'` toast still fires at the call site.
 */
function suppressDrop(): vscode.DocumentDropEdit {
  return new vscode.DocumentDropEdit(new vscode.SnippetString(''), EDIT_TITLE, EDIT_KIND);
}

function resolveSourcePath(dataTransfer: vscode.DataTransfer): string | null {
  const uriItem = dataTransfer.get('text/uri-list');
  if (uriItem) {
    const raw = String(uriItem.value).split('\n')[0].trim();
    if (raw) {
      return vscode.Uri.parse(raw).fsPath;
    }
  }

  const textItem = dataTransfer.get('text/plain');
  if (textItem) {
    const value = String(textItem.value).trim();
    if (path.isAbsolute(value)) {
      return value;
    }
  }

  return null;
}
