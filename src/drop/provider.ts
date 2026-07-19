import * as vscode from 'vscode';
import * as path from 'path';

import { FilePathInfo, getFilePathInfoFromPaths } from '../editor/file-path-info';
import { showNotification } from '../editor/notification';
import { ComputedPlacement, computeImportPlacement } from '../editor/placement';
import { isPairSupported } from '../gating';
import { buildImportSnippet } from '../snippets/dispatch';
import { joinImportStatements } from '../snippets/compose';

const EDIT_KIND = vscode.DocumentDropOrPasteEditKind.TextUpdateImports.append('autoImport');
const EDIT_TITLE = 'Auto Import';

/** A dragged source that cleared gating and produced a non-empty snippet, with its computed placement. */
interface DropCandidate {
  value: string;
  placement: ComputedPlacement;
}

/** Offers import snippets when one or more files are dragged from the Explorer onto a supported editor. */
export class AutoImportOnDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    dataTransfer: vscode.DataTransfer,
    _token: vscode.CancellationToken,
  ): Promise<vscode.DocumentDropEdit | null> {
    const sourceFilePaths = resolveSourcePaths(dataTransfer);
    if (sourceFilePaths.length === 0) {
      // Couldn't identify any dragged file at all — cede to VS Code's default drop
      // handling rather than swallowing an unidentified payload.
      return null;
    }

    const destinationFilePath = document.uri.fsPath;
    const documentText = document.getText();

    // Fan out over every dragged file: skip the destination itself and any unsupported pair,
    // collect the rest. A single dragged file walks this same loop once, so its behaviour is
    // unchanged (see joinImportStatements, which renders one statement byte-identically).
    const candidates: DropCandidate[] = [];
    let sameFileCount = 0;
    let rejectedInfo: FilePathInfo | undefined;

    for (const sourceFilePath of sourceFilePaths) {
      if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
        sameFileCount++;
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

      const placement = computeImportPlacement(
        documentText,
        info.destinationFileExt,
        info.sourceFileExt,
        position.line,
        position.character,
      );
      candidates.push({ value: snippet.value, placement });
    }

    if (candidates.length === 0) {
      // Nothing importable. Mirror the single-file toasts: an unsupported pair takes precedence
      // over same-file (the order the single-file path applied to its one source).
      if (rejectedInfo) {
        showNotification('not-supported', { sourceExt: rejectedInfo.sourceFileExt, destinationExt: rejectedInfo.destinationFileExt });
      } else if (sameFileCount > 0) {
        showNotification('same-file-path');
      }
      return suppressDrop();
    }

    // Inline `url()` snippets (a non-stylesheet source into a stylesheet destination) are CSS
    // values, not standalone statements — stacking them is invalid CSS. When every candidate is
    // inline, insert just the first (the single-drop behaviour); otherwise the statement-style
    // candidates are stacked and any inline ones are dropped. Only `.css`/`.scss` destinations
    // ever produce inline candidates, so this branch leaves every other destination untouched.
    const blockCandidates = candidates.filter(candidate => !candidate.placement.isInline);
    if (blockCandidates.length === 0) {
      return new vscode.DocumentDropEdit(new vscode.SnippetString(candidates[0].value), EDIT_TITLE, EDIT_KIND);
    }

    // Non-inline placement is destination-driven, so every block candidate shares one position —
    // the first candidate's placement positions the whole stacked block.
    const placement = blockCandidates[0].placement;
    const block = joinImportStatements(blockCandidates.map(candidate => candidate.value), placement.indentation);
    const finalValue = placement.wrapperPrefix
      ? placement.wrapperPrefix + block + (placement.wrapperSuffix || '')
      : block;

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

/**
 * Extracts every dragged file path from the `DataTransfer`. A multi-file drag delivers a
 * newline-separated `text/uri-list` (RFC 2483 — `\r\n` or `\n`, with `#` comment lines), so each
 * line is parsed independently; the first usable line is what a single-file drag yields.
 */
function resolveSourcePaths(dataTransfer: vscode.DataTransfer): string[] {
  const uriItem = dataTransfer.get('text/uri-list');
  if (uriItem) {
    const paths = String(uriItem.value)
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'))
      .map(raw => vscode.Uri.parse(raw).fsPath);
    if (paths.length > 0) {
      return paths;
    }
  }

  // Defensive fallback: the provider is registered with `dropMimeTypes: ['text/uri-list']`, so
  // VS Code never populates `text/plain` in practice. Kept for an absolute single path.
  const textItem = dataTransfer.get('text/plain');
  if (textItem) {
    const value = String(textItem.value).trim();
    if (path.isAbsolute(value)) {
      return [value];
    }
  }

  return [];
}
