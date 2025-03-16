import { ImportType } from '../../model';
import { getFileExtension } from '../../utils';

/**
 * Determines the import type based on the file extension.
 *
 * @param filePath - The file path (absolute or relative) of the dragged file.
 * @returns The corresponding ImportType if recognized; otherwise, returns null.
 */
export function determineImportType(filePath: string): ImportType | null {

  console.log('@@@ ', 'determineImportType.filePath', filePath);

  switch (getFileExtension(filePath)) {
    case '.js':
      return 'script';
    case '.css':
      return 'stylesheet';
    case '.scss':
      return null;
    case '.md':
      return 'markdown';
    default:
      return 'image';
  }
}
