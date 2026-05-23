import * as path from 'path';

import { removeFileExtension } from './extension';

export function computeRelative(sourceFilePath: string, destinationFilePath: string): string {
  const relativePath = toUnixPath(path.relative(path.dirname(destinationFilePath), sourceFilePath));

  const shouldAddPrefix =
    areFilesInSameDirectory(sourceFilePath, destinationFilePath) || !relativePath.startsWith('.');
  const prefix = shouldAddPrefix ? './' : '';

  return prefix + removeFileExtension(relativePath);
}

function toUnixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function areFilesInSameDirectory(sourceFilePath: string, destinationFilePath: string): boolean {
  const sourceDir = path.parse(sourceFilePath).dir.toLowerCase().trim();
  const destinationDir = path.parse(destinationFilePath).dir.toLowerCase().trim();
  return sourceDir === destinationDir;
}
