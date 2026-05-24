import * as vscode from 'vscode';

import { FileExtension } from '../types/file-extension';
import { extractFileExtension } from '../path/extension';
import { getFilePathInfo } from '../editor/file-path-info';
import { getAutoImportSetting } from '../config/settings';

export type BuildScriptSnippet = (relativePath: string) => vscode.SnippetString;

export interface ReactImportOptions {
  primaryExtensions: ReadonlyArray<FileExtension>;
  primarySnippet: BuildScriptSnippet;
  fallbackExtensions?: ReadonlyArray<FileExtension>;
  fallbackSnippet?: BuildScriptSnippet;
}

export async function buildReactImport(opts: ReactImportOptions): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
  const fileExtension = shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';
  const sourceFileExt = extractFileExtension(sourceFilePath) as FileExtension;

  if (opts.primaryExtensions.includes(sourceFileExt)) {
    return opts.primarySnippet(relativePath + fileExtension);
  }
  if (opts.fallbackSnippet && opts.fallbackExtensions?.includes(sourceFileExt)) {
    return opts.fallbackSnippet(relativePath + fileExtension);
  }

  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  if (sourceFilePath.endsWith('.module.css') || sourceFilePath.endsWith('.module.scss')) {
    return new vscode.SnippetString(`import \${1:styles} from '${fullPath}';`);
  }

  switch (sourceFileExt) {
    case '.gif':
    case '.jpeg':
    case '.jpg':
    case '.png':
    case '.svg':
    case '.avif':
    case '.webp':
    case '.json':
    case '.html':
    case '.yml':
    case '.yaml':
    case '.md':
    case '.mdx':
    case '.pdf':
      return new vscode.SnippetString(`import \${1:name} from '${fullPath}';`);
    case '.mp4':
    case '.webm':
    case '.mov':
    case '.mp3':
    case '.ogg':
    case '.wav':
    case '.m4a':
    case '.vtt':
      return new vscode.SnippetString(`import \${1:url} from '${fullPath}';`);
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.eot':
    case '.css':
    case '.scss':
      return new vscode.SnippetString(`import '${fullPath}';`);
    default:
      return new vscode.SnippetString('');
  }
}
