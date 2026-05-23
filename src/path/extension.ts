import * as path from 'path';

import { FileExtension } from '../types/file-extension';

export function extractFileExtension(filePath: string): FileExtension {
  return path.parse(filePath).ext as FileExtension;
}

export function removeFileExtension(filePath: string): string {
  const ext = extractFileExtension(filePath);
  return filePath.slice(0, -ext.length);
}
