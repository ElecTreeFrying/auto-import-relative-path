import { FileExtension } from "../model";

/**
 * A list of commonly supported image file extensions.
 */
const IMAGE_FILE_EXTENSIONS: FileExtension[] = [
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
];

/**
 * Supported file extensions when importing into an HTML file.
 */
export const HTML_SUPPORTED_EXTENSIONS: FileExtension[] = [
  ".js",
  ".css",
  ...IMAGE_FILE_EXTENSIONS,
];

/**
 * Supported file extensions when importing into a Markdown file.
 */
export const MARKDOWN_SUPPORTED_EXTENSIONS: FileExtension[] = [
  ".md",
  ...IMAGE_FILE_EXTENSIONS,
];

/**
 * Supported file extensions when importing into a CSS file.
 */
export const CSS_SUPPORTED_EXTENSIONS: FileExtension[] = [
  ".css",
  ...IMAGE_FILE_EXTENSIONS,
];

/**
 * Supported file extensions when importing into a SCSS file.
 */
export const SCSS_SUPPORTED_EXTENSIONS: FileExtension[] = [
  ".scss",
  ".css",
  ...IMAGE_FILE_EXTENSIONS,
];

/**
 * List of script file extensions.
 */
export const SCRIPT_EXTENSIONS: string[] = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx"
];

/**
 * List of stylesheet file extensions.
 */
export const STYLESHEET_EXTENSIONS: string[] = [
  ".scss",
  ".css"
];

/**
 * A collection of permissible file extensions across various contexts.
 */
export const PERMITTED_FILE_EXTENSIONS: FileExtension[] = [
  ".html",
  ".md",
  ".css",
  ".scss",
  ".tsx",
  ".jsx",
];
