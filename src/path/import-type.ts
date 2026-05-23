import { ImportType } from '../types/import-type';
import { extractFileExtension } from './extension';

export function determineImportType(filePath: string): ImportType | null {
  switch (extractFileExtension(filePath)) {
    case '.js':
    case '.jsx':
    case '.ts':
    case '.tsx':
      return 'script';
    case '.css':
      return 'stylesheet';
    case '.md':
      return 'markdown';
    case '.html':
      return null;
    case '.scss':
      return null;
    default:
      return 'image';
  }
}
