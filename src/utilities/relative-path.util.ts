import * as path from 'path';
import { getFileExtension } from './file-extension.util';

/**
 * Computes the relative path from the source file to the target file,
 * removing the file extension and adding a './' prefix if the files share the same directory.
 *
 * @param sourceFilePath - The full path of the dragged (source) file.
 * @param targetFilePath - The full path of the active editor (target) file.
 * @returns The computed relative path without the file extension.
 */
export function computeRelativePath(sourceFilePath: string, targetFilePath: string): string {
  const prefix = areFilesInSameDirectory(sourceFilePath, targetFilePath) ? './' : '';
  const relativePath = toUnixPath(getRelativePath(sourceFilePath, targetFilePath));
  return prefix + removeFileExtension(relativePath);
}

/**
 * Computes the relative path between two files.
 *
 * @param sourceFilePath - The full path of the source file.
 * @param targetFilePath - The full path of the target file.
 * @returns The relative path.
 */
function getRelativePath(sourceFilePath: string, targetFilePath: string): string {
  return path.relative(path.dirname(sourceFilePath), targetFilePath);
}

/**
 * Converts a file path to Unix-style (forward slashes).
 *
 * @param filePath - The file path to convert.
 * @returns The file path with forward slashes.
 */
function toUnixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Removes the file extension from the given path.
 *
 * @param filePath - The file path from which to remove the extension.
 * @returns The file path without its extension.
 */
function removeFileExtension(filePath: string): string {
  const ext = getFileExtension(filePath);
  return filePath.slice(0, -ext.length);
}

/**
 * Checks if the source and target files are in the same directory.
 *
 * @param sourceFilePath - The full path of the source file.
 * @param targetFilePath - The full path of the target file.
 * @returns True if both files reside in the same directory; otherwise, false.
 */
function areFilesInSameDirectory(sourceFilePath: string, targetFilePath: string): boolean {
  const sourceDir = path.parse(sourceFilePath).dir.toLowerCase().trim();
  const targetDir = path.parse(targetFilePath).dir.toLowerCase().trim();
  return sourceDir === targetDir;
}
