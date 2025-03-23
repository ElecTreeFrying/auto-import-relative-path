import { ImportType } from '../../model';
import { extractFileExtension } from '.';

/**
 * Determines the import type based on the file extension.
 *
 * @param filePath - The file path (absolute or relative) of the dragged file.
 * @returns The corresponding ImportType if recognized; otherwise, returns null.
 */
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
