/**
 * Single source of truth for the source/destination path pair.
 *
 * @remarks
 * Reads the source from the system clipboard and the destination from
 * `vscode.window.activeTextEditor`; **caller is responsible for asserting
 * the active editor is non-null before calling** — `getFilePathInfo`
 * dereferences `editor.document.uri.fsPath` unconditionally and will
 * throw if there is no active editor. The check lives in
 * `commands/paste-import.ts` (the only producer of the calling chain).
 *
 * Each call re-reads the clipboard. Don't introduce code paths that
 * mutate the clipboard between calls within a single command — the
 * `Promise.all` in `commands/paste-import.ts` runs two such reads in
 * parallel and relies on both seeing the same value.
 */
import * as vscode from 'vscode';

import { FileExtension } from '../types/file-extension';
import { extractFileExtension } from '../path/extension';
import { computeRelative } from '../path/relative';

export interface FilePathInfo {
  /** Unix-style, extension-stripped path from the destination's directory to the source. Already includes any `./` prefix; ready to drop into an `import` statement. */
  relativePath: string;
  /** Absolute path of the source file (read from the system clipboard). */
  sourceFilePath: string;
  /** Absolute path of the destination file (the active editor's document). */
  destinationFilePath: string;
  /** Extension of the destination file, e.g. `'.ts'`. Drives snippet dispatch in `snippets/dispatch.ts`. */
  destinationFileExt: FileExtension;
  /** Extension of the source file, e.g. `'.png'`. Drives gating in `commands/paste-import.ts` and source-type branching in per-language snippets. */
  sourceFileExt: FileExtension;
}

/**
 * Reads source from the clipboard and destination from the active editor.
 *
 * @returns A {@link FilePathInfo} containing both absolute paths, both
 *   extensions, and the computed relative path.
 */
export async function getFilePathInfo(): Promise<FilePathInfo> {
  const editor = vscode.window.activeTextEditor;

  const sourceFilePath = await vscode.env.clipboard.readText();
  const destinationFilePath = editor.document.uri.fsPath;

  const relativePath = computeRelative(sourceFilePath, destinationFilePath);
  const sourceFileExt = extractFileExtension(sourceFilePath);
  const destinationFileExt = extractFileExtension(destinationFilePath);

  return {
    relativePath,
    sourceFilePath,
    destinationFilePath,
    destinationFileExt,
    sourceFileExt,
  };
}
