/**
 * Aggregates import snippet functions for HTML/Markdown, CSS/SCSS, and JavaScript/TypeScript
 * into a single export for easier consumption elsewhere in the extension.
 */

import * as htmlMarkdownSnippets from './html-markdown-import-snippets';
import * as cssScssSnippets from './css-scss-import-snippets';
import * as javascriptTypescriptSnippets from './javascript-typescript-import-snippets';

export const importSnippetFunctions = {
  ...htmlMarkdownSnippets,
  ...cssScssSnippets,
  ...javascriptTypescriptSnippets
};
