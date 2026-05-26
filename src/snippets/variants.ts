import * as vscode from 'vscode';
import * as path from 'path';

import { FileExtension } from '../types/file-extension';
import { AutoImportConfigNamespace, AutoImportSettingKey, getAutoImportSetting } from '../config/settings';
import { determineImportType } from '../path/import-type';
import { FilePathInfo } from '../editor/file-path-info';

import {
  ImportStyle,
  JAVASCRIPT_IMPORT_OPTIONS,
  TYPESCRIPT_IMPORT_OPTIONS,
  CSS_IMPORT_OPTIONS,
  SCSS_IMPORT_OPTIONS,
  HTML_AUDIO_IMPORT_OPTIONS,
  HTML_IMAGE_IMPORT_OPTIONS,
  HTML_SCRIPT_IMPORT_OPTIONS,
  HTML_VIDEO_IMPORT_OPTIONS,
  MARKDOWN_IMAGE_IMPORT_OPTIONS,
} from './_styles';
import { readExportedClassName } from './_class-name';
import { buildJavaScriptImportSnippetByStyle } from './languages/javascript';
import { buildTypeScriptImportSnippetByStyle } from './languages/typescript';
import { buildCssImportSnippetByStyle, buildCssImageImportSnippet } from './languages/css';
import { buildScssImportSnippetByStyle, prepareScssImportPath } from './languages/scss';
import {
  buildHtmlScriptImportSnippetByStyle,
  buildHtmlImageImportSnippetByStyle,
  buildHtmlVideoImportSnippetByStyle,
  buildHtmlAudioImportSnippetByStyle,
  buildHtmlTextTrackImportSnippet,
  buildHtmlStylesheetImportSnippet,
} from './languages/html';
import { buildMarkdownImportSnippet, buildMarkdownImageImportSnippetByStyle } from './languages/markdown';

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

export async function buildImportSnippetVariants(info: FilePathInfo): Promise<ImportSnippetVariant[]> {
  const { sourceFilePath, sourceFileExt, destinationFileExt, relativePath } = info;

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
    case '.ts': {
      const className = await readExportedClassName(sourceFilePath);
      const resolved = className ?? undefined;
      return TYPESCRIPT_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildTypeScriptImportSnippetByStyle(opt.value, scriptPath, resolved),
          buildTypeScriptImportSnippetByStyle(opt.value, labelScriptPath, resolved),
          'script', 'typescript',
        ));
    }
    case '.jsx':
      return buildJsxVariants(sourceFileExt, scriptPath, labelScriptPath, fullPath, labelFullPath);
    case '.tsx':
    case '.mdx':
      return buildTsxVariants(sourceFileExt, scriptPath, labelScriptPath, fullPath, labelFullPath);
    case '.vue':
    case '.svelte':
    case '.astro':
      return buildFrameworkComponentVariants(sourceFileExt, scriptPath, labelScriptPath, fullPath, labelFullPath);
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

function buildFrameworkComponentVariants(
  sourceFileExt: FileExtension,
  scriptPath: string,
  labelScriptPath: string,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant[] {
  const isScript = sourceFileExt === '.ts' || sourceFileExt === '.tsx'
    || sourceFileExt === '.js' || sourceFileExt === '.jsx';
  const importPath = isScript ? scriptPath : fullPath;
  const labelPath = isScript ? labelScriptPath : labelFullPath;

  return TYPESCRIPT_IMPORT_OPTIONS.map(opt =>
    toStyledVariant(
      opt,
      buildTypeScriptImportSnippetByStyle(opt.value, importPath),
      buildTypeScriptImportSnippetByStyle(opt.value, labelPath),
      'script', 'typescript',
    ));
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
    case '.vue':
    case '.svelte':
    case '.astro':
      return toHardcodedVariant(
        new vscode.SnippetString(`import \${1:name} from '${fullPath}';`),
        new vscode.SnippetString(`import \${1:name} from '${labelFullPath}';`),
      );
    case '.mp4':
    case '.webm':
    case '.mov':
    case '.mp3':
    case '.ogg':
    case '.wav':
    case '.m4a':
    case '.vtt':
      return toHardcodedVariant(
        new vscode.SnippetString(`import \${1:url} from '${fullPath}';`),
        new vscode.SnippetString(`import \${1:url} from '${labelFullPath}';`),
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
    case 'video':
      return HTML_VIDEO_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildHtmlVideoImportSnippetByStyle(opt.value, fullPath),
          buildHtmlVideoImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'htmlVideo',
        ));
    case 'audio':
      return HTML_AUDIO_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildHtmlAudioImportSnippetByStyle(opt.value, fullPath),
          buildHtmlAudioImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'htmlAudio',
        ));
    case 'text-track':
      return [toHardcodedVariant(
        buildHtmlTextTrackImportSnippet(fullPath),
        buildHtmlTextTrackImportSnippet(labelFullPath),
      )];
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
    .replace(/\$\{\d+:([^}]+)\}/g, '$1')
    .replace(/\$\d+/g, 'name');
}
