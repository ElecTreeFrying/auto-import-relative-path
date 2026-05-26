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
      return null;
    }

    const destinationFilePath = document.uri.fsPath;

    if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
      showNotification('same-file-path');
      return null;
    }

    const info = getFilePathInfoFromPaths(sourceFilePath, destinationFilePath);

    if (!isPairSupported(info)) {
      showNotification('not-supported', { sourceExt: info.sourceFileExt, destinationExt: info.destinationFileExt });
      return null;
    }

    const snippet = await buildImportSnippet(info);

    if (snippet.value === '' || snippet.value === '\n') {
      showNotification('not-supported', { sourceExt: info.sourceFileExt, destinationExt: info.destinationFileExt });
      return null;
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
