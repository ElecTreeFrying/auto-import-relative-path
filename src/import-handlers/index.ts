import * as JavaScriptSnippets from './scripts/javascript-import';
import * as JsxSnippets from './scripts/jsx-import';
import * as TypeScriptSnippets from './scripts/typescript-import';
import * as TsxSnippets from './scripts/tsx-import';
import * as ScssSnippets from './styles/scss-import';
import * as CssSnippets from './styles/css-import';
import * as HtmlSnippets from './markup/html-import';
import * as MarkdownSnippets from './markup/markdown-import';

/**
 * Aggregates all snippet-generating functions for various file types
 * into a single export for convenient usage across the extension.
 */
export {
  JavaScriptSnippets,
  JsxSnippets,
  TypeScriptSnippets,
  TsxSnippets,
  ScssSnippets,
  CssSnippets,
  HtmlSnippets,
  MarkdownSnippets,
};
