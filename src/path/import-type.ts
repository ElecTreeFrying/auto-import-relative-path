/**
 * Classifies a source file by extension into one of the four
 * snippet-shape buckets ({@link ImportType}) — or `null` when the
 * destination handler is expected to special-case the source itself.
 *
 * See `types/import-type.ts` for the full classification rationale,
 * including why `.scss` and `.html` return `null` and why the `'image'`
 * default is a gating-dependent catch-all.
 */
import { ImportType } from '../types/import-type';
import { extractFileExtension } from './extension';

/**
 * Maps the file extension to one of the four `ImportType` values, or `null`
 * for `.html`/`.scss` (handled by destination-specific logic).
 *
 * @param filePath - Path of the *source* file being classified.
 * @returns The matching `ImportType`, or `null` for `.html`/`.scss`.
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
