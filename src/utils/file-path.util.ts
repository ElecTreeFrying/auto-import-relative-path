import * as vscode from 'vscode';
import * as path from 'path';

import { FileExtension } from '../model';
import { computeRelativePath } from './relative-path.util';

/**
 * Represents file path details for a source and destination file,
 * including relative paths and file extensions.
 */
export interface FilePathInfo {
  /** The computed relative path between the source and destination. */
  relativePath: string;
  /** The absolute path to the source file. */
  sourceFilePath: string;
  /** The absolute path to the destination file. */
  destinationFilePath: string;
  /** The file extension of the destination file. */
  destinationFileExt: FileExtension;
  /** The file extension of the source file. */
  sourceFileExt: FileExtension;
}

/**
 * Retrieves file path information for the currently active editor,
 * including a relative path, file extensions, and the source file path
 * from the system clipboard.
 *
 * @returns A Promise that resolves to a FilePathInfo object containing
 *          the relevant path and extension details.
 */
export async function getFilePathInfo(): Promise<FilePathInfo> {
  const editor = vscode.window.activeTextEditor;

  const relativePath = await computeRelativePath();
  const sourceFilePath = await vscode.env.clipboard.readText();
  const destinationFilePath = editor.document.uri.fsPath;

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

/**
 * Extracts the file extension from the given file path.
 *
 * @param {string} filePath - The file path to extract the extension from.
 * @returns {FileExtension} The extracted file extension as a FileExtension type.
 */
export function extractFileExtension(filePath: string): FileExtension {
  return path.parse(filePath).ext as FileExtension;
}
