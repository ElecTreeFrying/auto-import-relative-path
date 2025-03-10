import { ImportStyle } from "../model";

/**
 * Import style options for JavaScript (including React) files.
 */
export const JAVASCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "import name from '_relativePath_';" },
  { value: 1, description: "import { name } from '_relativePath_';" },
  { value: 2, description: "import { default as name } from '_relativePath_';" },
  { value: 3, description: "import * as name from '_relativePath_';" },
  { value: 4, description: "import '_relativePath_';" },
  { value: 5, description: "var name = require('_relativePath_');" },
  { value: 6, description: "const name = require('_relativePath_');" },
  { value: 7, description: "var name = import('_relativePath_');" },
  { value: 8, description: "const name = import('_relativePath_');" },
];

/**
 * Import style options for TypeScript (including React) files.
 */
export const TYPESCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "import name from '_relativePath_';" },
  { value: 1, description: "import { name } from '_relativePath_';" },
  { value: 2, description: "import { default as name } from '_relativePath_';" },
  { value: 3, description: "import * as name from '_relativePath_';" },
  { value: 4, description: "import '_relativePath_';" },
];

/**
 * Import style options for CSS files.
 */
export const CSS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import url('_relativePath_');" },
];

/**
 * Import style option for referencing images in CSS.
 */
export const CSS_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "url('_relativePath_')" },
];

/**
 * Import style options for SCSS files.
 */
export const SCSS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import url('_relativePath_');" },
  { value: 2, description: "@use '_relativePath_';" },
  { value: 3, description: "@use '_relativePath_' as *;" },
];

/**
 * Import style option for referencing images in SCSS.
 */
export const SCSS_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "url('_relativePath_')" },
];

/**
 * Import style option for embedding script tags in HTML.
 */
export const HTML_SCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "<script type=\"text/javascript\" src=\"_relativePath_\"></script>" },
];

/**
 * Import style option for embedding images in HTML.
 */
export const HTML_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "<img src=\"_relativePath_\" alt=\"sample\">" },
];

/**
 * Import style option for linking stylesheets in HTML.
 */
export const HTML_STYLESHEET_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "<link href=\"_relativePath_\" rel=\"stylesheet\">" },
];

/**
 * Import style option for embedding content in Markdown.
 */
export const MARKDOWN_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "![text](_relativePath_)" },
];

/**
 * Import style options for embedding images in Markdown.
 */
export const MARKDOWN_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "![alt-text](_relativePath_ \"Hover text\")" },
  { value: 1, description: "![alt-text][image] / [image]: _relativePath_ \"Hover text\"" },
];
