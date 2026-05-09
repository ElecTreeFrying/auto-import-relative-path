/**
 * Pure file-extension helpers. No `vscode` import — Node-testable.
 *
 * @remarks
 * `removeFileExtension` returns `''` (empty string) if the input has no
 * extension: `'foo'.slice(0, -0)` is `''`. Preserved quirk — the only
 * caller is `path/relative.ts:computeRelative`, which always passes a
 * path produced by `path.relative()` from real files with extensions, so
 * the no-extension branch is unreachable in practice. Don't add a guard
 * without checking that the regression test for the `./` prefix
 * (CHANGELOG 0.6.1) still passes.
 */
import * as path from 'path';

import { FileExtension } from '../types/file-extension';

/**
 * Returns the file extension including the leading dot, or `''` if none.
 *
 * @param filePath - Any path string.
 * @returns The trailing extension (e.g. `'.ts'`) or `''` if absent.
 */
export function extractFileExtension(filePath: string): FileExtension {
  return path.parse(filePath).ext as FileExtension;
}

/**
 * Strips the file extension from `filePath`. See module header for the
 * empty-string-on-no-extension quirk.
 *
 * @param filePath - Any path string.
 * @returns The path without its trailing extension, or `''` if no extension was present.
 */
export function removeFileExtension(filePath: string): string {
  const ext = extractFileExtension(filePath);
  return filePath.slice(0, -ext.length);
}
