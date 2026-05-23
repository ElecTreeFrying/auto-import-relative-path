import { FileExtension } from '../types/file-extension';

export const IMAGE_FILE_EXTENSIONS: FileExtension[] = [
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
];

export const HTML_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.js',
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
];

export const MARKDOWN_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.md',
  ...IMAGE_FILE_EXTENSIONS,
];

export const CSS_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
];

export const SCSS_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.scss',
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
];

export const SCRIPT_FILE_EXTENSIONS: FileExtension[] = [
  '.ts',
  '.tsx',
  '.mdx',
  '.js',
  '.jsx',
];

export const STYLESHEET_FILE_EXTENSIONS: FileExtension[] = [
  '.scss',
  '.css',
];

export const CROSS_IMPORT_DESTINATIONS: FileExtension[] = [
  '.html',
  '.md',
  '.css',
  '.scss',
  '.tsx',
  '.mdx',
  '.jsx',
];
