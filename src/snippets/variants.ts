import * as vscode from 'vscode';
import * as path from 'path';

import { FileExtension } from '../types/file-extension';
import { AutoImportConfigNamespace, AutoImportSettingKey, getAutoImportSetting } from '../config/settings';
import { determineImportType } from '../path/import-type';
import { getFilePathInfo } from '../editor/file-path-info';

import {
  ImportStyle,
  JAVASCRIPT_IMPORT_OPTIONS,
  TYPESCRIPT_IMPORT_OPTIONS,
  CSS_IMPORT_OPTIONS,
  SCSS_IMPORT_OPTIONS,
  HTML_IMAGE_IMPORT_OPTIONS,
  HTML_SCRIPT_IMPORT_OPTIONS,
  MARKDOWN_IMAGE_IMPORT_OPTIONS,
} from './_styles';
import { buildJavaScriptImportSnippetByStyle } from './javascript';
import { buildTypeScriptImportSnippetByStyle } from './typescript';
import { buildCssImportSnippetByStyle, buildCssImageImportSnippet } from './css';
import { buildScssImportSnippetByStyle, prepareScssImportPath } from './scss';
import {
  buildHtmlScriptImportSnippetByStyle,
  buildHtmlImageImportSnippetByStyle,
  buildHtmlStylesheetImportSnippet,
} from './html';
import { buildMarkdownImportSnippet, buildMarkdownImageImportSnippetByStyle } from './markdown';

export interface ImportSnippetVariant {
  label: string;
  description: string;
  snippetText: string;
  setting?: {
    namespace: AutoImportConfigNamespace;
    key: AutoImportSettingKey;
    value: string;
  };
}

export async function buildImportSnippetVariants(): Promise<ImportSnippetVariant[]> {
  const { sourceFilePath, sourceFileExt, destinationFileExt, relativePath } = await getFilePathInfo();

  const shouldPreserveScriptExtension = getAutoImportSetting<boolean>('script', 'preserve');
  const scriptPath = relativePath + (shouldPreserveScriptExtension ? sourceFileExt : '');
  const fullPath = relativePath + sourceFileExt;
  const labelScriptPath = path.basename(scriptPath);
  const labelFullPath = path.basename(fullPath);

  switch (destinationFileExt) {
    case '.js':
      return JAVASCRIPT_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildJavaScriptImportSnippetByStyle(opt.value, scriptPath),
          buildJavaScriptImportSnippetByStyle(opt.value, labelScriptPath),
          'script', 'javascript',
        ));
    case '.ts':
      return TYPESCRIPT_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildTypeScriptImportSnippetByStyle(opt.value, scriptPath),
          buildTypeScriptImportSnippetByStyle(opt.value, labelScriptPath),
          'script', 'typescript',
        ));
    case '.jsx':
      return buildJsxVariants(sourceFileExt, scriptPath, labelScriptPath, fullPath, labelFullPath);
    case '.tsx':
    case '.mdx':
      return buildTsxVariants(sourceFileExt, scriptPath, labelScriptPath, fullPath, labelFullPath);
    case '.css':
      return buildCssVariants(sourceFilePath, fullPath, labelFullPath);
    case '.scss':
      return buildScssVariants(sourceFilePath, relativePath, fullPath, labelFullPath);
    case '.html':
      return buildHtmlVariants(sourceFilePath, fullPath, labelFullPath);
    case '.md':
      return buildMarkdownVariants(sourceFilePath, fullPath, labelFullPath);
    default:
      return [];
  }
}

function buildJsxVariants(
  sourceFileExt: FileExtension,
  scriptPath: string,
  labelScriptPath: string,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant[] {
  if (sourceFileExt === '.js' || sourceFileExt === '.jsx') {
    return JAVASCRIPT_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildJavaScriptImportSnippetByStyle(opt.value, scriptPath),
        buildJavaScriptImportSnippetByStyle(opt.value, labelScriptPath),
        'script', 'javascript',
      ));
  }
  const variant = buildReactNonScriptVariant(sourceFileExt, fullPath, labelFullPath);
  return variant ? [variant] : [];
}

function buildTsxVariants(
  sourceFileExt: FileExtension,
  scriptPath: string,
  labelScriptPath: string,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant[] {
  if (sourceFileExt === '.ts' || sourceFileExt === '.tsx') {
    return TYPESCRIPT_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildTypeScriptImportSnippetByStyle(opt.value, scriptPath),
        buildTypeScriptImportSnippetByStyle(opt.value, labelScriptPath),
        'script', 'typescript',
      ));
  }
  if (sourceFileExt === '.js') {
    return JAVASCRIPT_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildJavaScriptImportSnippetByStyle(opt.value, scriptPath),
        buildJavaScriptImportSnippetByStyle(opt.value, labelScriptPath),
        'script', 'javascript',
      ));
  }
  const variant = buildReactNonScriptVariant(sourceFileExt, fullPath, labelFullPath);
  return variant ? [variant] : [];
}

function buildReactNonScriptVariant(
  sourceFileExt: FileExtension,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant | null {
  if (fullPath.endsWith('.module.css') || fullPath.endsWith('.module.scss')) {
    return toHardcodedVariant(
      new vscode.SnippetString(`import \${1:styles} from '${fullPath}';`),
      new vscode.SnippetString(`import \${1:styles} from '${labelFullPath}';`),
    );
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
      return toHardcodedVariant(
        new vscode.SnippetString(`import \${1:name} from '${fullPath}';`),
        new vscode.SnippetString(`import \${1:name} from '${labelFullPath}';`),
      );
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.eot':
    case '.css':
    case '.scss':
      return toHardcodedVariant(
        new vscode.SnippetString(`import '${fullPath}';`),
        new vscode.SnippetString(`import '${labelFullPath}';`),
      );
    default:
      return null;
  }
}

function buildCssVariants(sourceFilePath: string, fullPath: string, labelFullPath: string): ImportSnippetVariant[] {
  if (determineImportType(sourceFilePath) === 'image') {
    return [toHardcodedVariant(
      buildCssImageImportSnippet(fullPath),
      buildCssImageImportSnippet(labelFullPath),
    )];
  }
  return CSS_IMPORT_OPTIONS.map(opt =>
    toStyledVariant(
      opt,
      buildCssImportSnippetByStyle(opt.value, fullPath),
      buildCssImportSnippetByStyle(opt.value, labelFullPath),
      'stylesheet', 'css',
    ));
}

function buildScssVariants(
  sourceFilePath: string,
  relativePath: string,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant[] {
  if (determineImportType(sourceFilePath) === 'image') {
    return [toHardcodedVariant(
      buildCssImageImportSnippet(fullPath),
      buildCssImageImportSnippet(labelFullPath),
    )];
  }
  const scssPath = prepareScssImportPath(sourceFilePath, relativePath);
  const labelScssPath = path.basename(scssPath);
  return SCSS_IMPORT_OPTIONS.map(opt =>
    toStyledVariant(
      opt,
      buildScssImportSnippetByStyle(opt.value, scssPath),
      buildScssImportSnippetByStyle(opt.value, labelScssPath),
      'stylesheet', 'scss',
    ));
}

function buildHtmlVariants(sourceFilePath: string, fullPath: string, labelFullPath: string): ImportSnippetVariant[] {
  switch (determineImportType(sourceFilePath)) {
    case 'script':
      return HTML_SCRIPT_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildHtmlScriptImportSnippetByStyle(opt.value, fullPath),
          buildHtmlScriptImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'htmlScript',
        ));
    case 'image':
      return HTML_IMAGE_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildHtmlImageImportSnippetByStyle(opt.value, fullPath),
          buildHtmlImageImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'htmlImage',
        ));
    case 'stylesheet':
      return [toHardcodedVariant(
        buildHtmlStylesheetImportSnippet(fullPath),
        buildHtmlStylesheetImportSnippet(labelFullPath),
      )];
    default:
      return [];
  }
}

function buildMarkdownVariants(sourceFilePath: string, fullPath: string, labelFullPath: string): ImportSnippetVariant[] {
  switch (determineImportType(sourceFilePath)) {
    case 'markdown':
      return [toHardcodedVariant(
        buildMarkdownImportSnippet(fullPath),
        buildMarkdownImportSnippet(labelFullPath),
      )];
    case 'image':
      return MARKDOWN_IMAGE_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildMarkdownImageImportSnippetByStyle(opt.value, fullPath),
          buildMarkdownImageImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'markdownImage',
        ));
    default:
      return [];
  }
}

function toStyledVariant(
  opt: ImportStyle,
  insertSnippet: vscode.SnippetString,
  labelSnippet: vscode.SnippetString,
  namespace: AutoImportConfigNamespace,
  key: AutoImportSettingKey,
): ImportSnippetVariant {
  return {
    label: renderLabel(labelSnippet.value),
    description: opt.tag ?? opt.description,
    snippetText: insertSnippet.value,
    setting: { namespace, key, value: opt.description },
  };
}

function toHardcodedVariant(
  insertSnippet: vscode.SnippetString,
  labelSnippet: vscode.SnippetString,
): ImportSnippetVariant {
  return {
    label: renderLabel(labelSnippet.value),
    description: '',
    snippetText: insertSnippet.value,
  };
}

function renderLabel(snippetText: string): string {
  return snippetText
    .replace(/\$\{1:([^}]+)\}/g, '$1')
    .replace(/\$1/g, 'name');
}
