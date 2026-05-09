/**
 * Pure relative-path computation between an absolute source and destination.
 * Returns a Unix-style path (forward slashes) with the file extension
 * stripped, suitable for use inside a JS/CSS/HTML import statement.
 *
 * @remarks
 * **The `./` prefix rule** (regression-tested per CHANGELOG 0.6.1):
 * a leading `./` is added when the two files are in the *same* directory
 * **or** when `path.relative` produced a result that doesn't already start
 * with `.`. The second condition catches edge cases on absolute → relative
 * computations that would otherwise emit `'foo'` instead of `'./foo'`.
 *
 * **Cross-platform.** {@link toUnixPath} converts Windows backslashes to
 * forward slashes — mandatory because import statements are Unix-style on
 * every JS runtime, including on Windows.
 *
 * **Same-directory check is case-insensitive.** macOS and Windows
 * filesystems are case-insensitive by default; comparing the parsed
 * directory paths case-sensitively would treat `/Foo/bar` and `/foo/bar`
 * as different directories on those platforms.
 */
import * as path from 'path';

import { removeFileExtension } from './extension';

/**
 * Returns a Unix-style, extension-stripped relative path from destination to
 * source, with a `./` prefix when the two are in the same directory.
 *
 * @param sourceFilePath - Absolute path of the file being imported.
 * @param destinationFilePath - Absolute path of the file receiving the import.
 * @returns The relative import path (forward slashes, no extension).
 */
export function computeRelative(sourceFilePath: string, destinationFilePath: string): string {
  const relativePath = toUnixPath(path.relative(path.dirname(destinationFilePath), sourceFilePath));

  const shouldAddPrefix =
    areFilesInSameDirectory(sourceFilePath, destinationFilePath) || !relativePath.startsWith('.');
  const prefix = shouldAddPrefix ? './' : '';

  return prefix + removeFileExtension(relativePath);
}

/**
 * Replaces every backslash with a forward slash.
 *
 * @param filePath - Path that may contain Windows-style separators.
 * @returns The same path with backslashes replaced.
 */
function toUnixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Case-insensitive comparison of the two files' directory components.
 *
 * @param sourceFilePath - Absolute path of one file.
 * @param destinationFilePath - Absolute path of the other.
 * @returns `true` when both files live in the same directory.
 */
function areFilesInSameDirectory(sourceFilePath: string, destinationFilePath: string): boolean {
  const sourceDir = path.parse(sourceFilePath).dir.toLowerCase().trim();
  const targetDir = path.parse(destinationFilePath).dir.toLowerCase().trim();
  return sourceDir === targetDir;
}
