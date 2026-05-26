import * as vscode from 'vscode';

import { FileExtension } from '../types/file-extension';
import { extractFileExtension } from '../path/extension';
import { computeRelative } from '../path/relative';

export interface FilePathInfo {
  relativePath: string;
  sourceFilePath: string;
  destinationFilePath: string;
  destinationFileExt: FileExtension;
  sourceFileExt: FileExtension;
}

export function getFilePathInfoFromPaths(sourceFilePath: string, destinationFilePath: string): FilePathInfo {
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

export async function getFilePathInfo(): Promise<FilePathInfo> {
  const editor = vscode.window.activeTextEditor;

  const sourceFilePath = await vscode.env.clipboard.readText();
  const destinationFilePath = editor.document.uri.fsPath;

  return getFilePathInfoFromPaths(sourceFilePath, destinationFilePath);
}
