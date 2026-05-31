import { FilePathInfo } from './editor/file-path-info';
import {
  ASTRO_SUPPORTED_EXTENSIONS,
  CROSS_IMPORT_DESTINATIONS,
  CSS_SUPPORTED_EXTENSIONS,
  HTML_SUPPORTED_EXTENSIONS,
  MARKDOWN_SUPPORTED_EXTENSIONS,
  SCSS_SUPPORTED_EXTENSIONS,
  SVELTE_SUPPORTED_EXTENSIONS,
  VUE_SUPPORTED_EXTENSIONS,
} from './constants/extensions';

/** Returns `false` when the source/destination extension pair is not supported for import generation. */
export function isPairSupported(info: FilePathInfo): boolean {
  const { sourceFileExt, destinationFileExt } = info;

  if (!CROSS_IMPORT_DESTINATIONS.includes(destinationFileExt) && sourceFileExt !== destinationFileExt) {
    return false;
  }
  if (destinationFileExt === '.html' && !HTML_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.md' && !MARKDOWN_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.css' && !CSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.scss' && !SCSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.vue' && !VUE_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.svelte' && !SVELTE_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.astro' && !ASTRO_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  return true;
}
