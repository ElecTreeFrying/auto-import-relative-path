import { FileExtension } from '../types/file-extension';

export const IMAGE_FILE_EXTENSIONS: FileExtension[] = [
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.avif',
  '.webp',
];

export const MEDIA_FILE_EXTENSIONS: FileExtension[] = [
  '.mp4',
  '.webm',
  '.mov',
  '.mp3',
  '.ogg',
  '.wav',
  '.m4a',
];

export const TEXT_TRACK_FILE_EXTENSIONS: FileExtension[] = [
  '.vtt',
];

export const HTML_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.js',
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
  ...MEDIA_FILE_EXTENSIONS,
  ...TEXT_TRACK_FILE_EXTENSIONS,
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
