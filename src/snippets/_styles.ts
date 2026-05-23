export interface ImportStyle {
  value: number;
  description: string;
  tag?: string;
}

export function resolveStyleIndex(table: ImportStyle[], configValue: string | undefined): number | undefined {
  return table.find(option => option.description === configValue)?.value;
}

export const JAVASCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "import name from '_relativePath_';", tag: 'ES module: default import' },
  { value: 1, description: "import { name } from '_relativePath_';", tag: 'ES module: named import (destructured)' },
  { value: 2, description: "import { default as name } from '_relativePath_';", tag: 'ES module: aliased default import' },
  { value: 3, description: "import * as name from '_relativePath_';", tag: 'ES module: namespace import (every export bound under one name)' },
  { value: 4, description: "import '_relativePath_';", tag: 'ES module: side-effect import (no binding)' },
  { value: 5, description: "var name = require('_relativePath_');", tag: 'CommonJS: var require()' },
  { value: 6, description: "const name = require('_relativePath_');", tag: 'CommonJS: const require()' },
  { value: 7, description: "var name = import('_relativePath_');", tag: 'Dynamic import(): var' },
  { value: 8, description: "const name = import('_relativePath_');", tag: 'Dynamic import(): const' },
];

export const TYPESCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "import name from '_relativePath_';", tag: 'ES module: default import' },
  { value: 1, description: "import { name } from '_relativePath_';", tag: 'ES module: named import — legacy Angular files (.component / .directive / .pipe / .service / .module) auto-fill PascalCase identifiers (back-compat)' },
  { value: 2, description: "import { default as name } from '_relativePath_';", tag: 'ES module: aliased default import' },
  { value: 3, description: "import * as name from '_relativePath_';", tag: 'ES module: namespace import (every export bound under one name)' },
  { value: 4, description: "import '_relativePath_';", tag: 'ES module: side-effect import (no binding)' },
];

export const CSS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "@import '_relativePath_';", tag: '@import with quoted path' },
  { value: 1, description: "@import url('_relativePath_');", tag: '@import with url() function' },
];

export const CSS_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "url('_relativePath_')" },
];

export const SCSS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "@import '_relativePath_';", tag: 'Legacy @import — quoted path' },
  { value: 1, description: "@import url('_relativePath_');", tag: 'Legacy @import — url() function' },
  { value: 2, description: "@use '_relativePath_';", tag: 'Modern @use — Sass module system (recommended)' },
  { value: 3, description: "@use '_relativePath_' as *;", tag: 'Modern @use with wildcard alias — no namespace prefix required' },
];

export const HTML_SCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<script type="text/javascript" src="_relativePath_"></script>' },
];

export const HTML_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<img src="_relativePath_" alt="sample">' },
];

export const HTML_STYLESHEET_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<link href="_relativePath_" rel="stylesheet">' },
];

export const MARKDOWN_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '[text](_relativePath_)' },
];

export const MARKDOWN_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '![alt-text](_relativePath_ "Hover text")', tag: 'Inline image syntax with hover-text title' },
  { value: 1, description: '![alt-text][image] / [image]: _relativePath_ "Hover text"', tag: 'Reference-style — define [ref] once, reuse it elsewhere in the document' },
];
