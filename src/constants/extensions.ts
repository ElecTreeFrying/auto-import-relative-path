/**
 * Runtime gating tables. These are the *runtime* counterpart to the
 * compile-time `FileExtension` union in `types/file-extension.ts` — together
 * they define which source/destination pairs the extension accepts.
 *
 * @remarks
 * **Why both a type union and runtime arrays?** The type union narrows
 * `switch` dispatch at compile time. The runtime arrays are checked by
 * `commands/paste-import.ts` because the cast `as FileExtension` at
 * boundaries is erased — without these tables, an unsupported source
 * would produce a silent fall-through instead of a user-facing
 * `'not-supported'` toast.
 *
 * **Sync requirements:**
 *
 * - {@link IMAGE_FILE_EXTENSIONS} is the runtime mirror of
 *   `types/file-extension.ts:ImageFileExtension`. Keep the two identical;
 *   drift means a typed extension that's not gated, or vice versa.
 * - The four `*_SUPPORTED_EXTENSIONS` tables are consumed clause-by-clause
 *   in `commands/paste-import.ts`. Adding an entry there is half the work
 *   — the corresponding snippet handler in `snippets/{html,markdown,css,
 *   scss}.ts` must also know how to produce a snippet for that source.
 * - {@link CROSS_IMPORT_EXTENSIONS} lists destinations that may import a
 *   *different* extension. Destinations *not* in this list (currently
 *   `.js`, `.ts`) require source extension to equal destination extension.
 * - {@link SCRIPT_EXTENSIONS} and {@link STYLESHEET_EXTENSIONS} are
 *   consumed only by `editor/insert-snippet.ts:determineInsertionColumn`,
 *   which forces column-0 insertion for these destination types. Hidden
 *   coupling — touch with care.
 */
import { FileExtension } from '../types/file-extension';

/** Raster image extensions. Runtime mirror of `types/file-extension.ts:ImageFileExtension`. */
export const IMAGE_FILE_EXTENSIONS: FileExtension[] = [
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
];

/** Source extensions accepted when the destination is `.html`. Consumed by `commands/paste-import.ts`. */
export const HTML_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.js',
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
];

/** Source extensions accepted when the destination is `.md`. Consumed by `commands/paste-import.ts`. */
export const MARKDOWN_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.md',
  ...IMAGE_FILE_EXTENSIONS,
];

/** Source extensions accepted when the destination is `.css`. Consumed by `commands/paste-import.ts`. */
export const CSS_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
];

/** Source extensions accepted when the destination is `.scss`. Consumed by `commands/paste-import.ts`. */
export const SCSS_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.scss',
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
];

/** Destinations whose insertion column is forced to 0. Consumed only by `editor/insert-snippet.ts:determineInsertionColumn`. */
export const SCRIPT_EXTENSIONS: string[] = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
];

/** Destinations whose insertion column is forced to 0. Consumed only by `editor/insert-snippet.ts:determineInsertionColumn`. */
export const STYLESHEET_EXTENSIONS: string[] = [
  '.scss',
  '.css',
];

/** Destinations allowed to import a *different* extension. Destinations not listed here require source extension to equal destination extension. */
export const CROSS_IMPORT_EXTENSIONS: FileExtension[] = [
  '.html',
  '.md',
  '.css',
  '.scss',
  '.tsx',
  '.jsx',
];
