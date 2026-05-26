import * as vscode from 'vscode';

/** All 12 destination languages the drop provider registers for (`scheme: 'file'` only). */
export const DROP_LANGUAGE_SELECTORS: vscode.DocumentSelector = [
  { language: 'javascript', scheme: 'file' },
  { language: 'javascriptreact', scheme: 'file' },
  { language: 'typescript', scheme: 'file' },
  { language: 'typescriptreact', scheme: 'file' },
  { language: 'css', scheme: 'file' },
  { language: 'scss', scheme: 'file' },
  { language: 'html', scheme: 'file' },
  { language: 'markdown', scheme: 'file' },
  { language: 'vue', scheme: 'file' },
  { language: 'svelte', scheme: 'file' },
  { language: 'astro', scheme: 'file' },
  { language: 'mdx', scheme: 'file' },
];
