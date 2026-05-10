/**
 * QuickPick aggregator — enumerates every import-style variant available
 * for the current source/destination paste. Consumed by
 * `commands/paste-import-with-style.ts` to render a `vscode.window
 * .showQuickPick` of style choices in lieu of reading the persisted setting.
 *
 * @remarks
 * **Why this is its own module instead of a parameter on `dispatch.ts`.**
 * The override is per-table-index, but the table itself depends on source
 * classification several levels deep (`_shared.ts`'s primary/fallback,
 * `scss.ts`'s `.css`-preserving extension rule, `markdown.ts`'s text-vs-image
 * branch). Threading a `styleOverride` through `buildImportSnippet` would
 * either be meaningless for hardcoded branches or force a second pass to
 * enumerate variants. A standalone aggregator that mirrors `dispatch.ts`'s
 * destination switch is cleaner.
 *
 * **Clipboard-race avoidance.** {@link buildImportSnippetVariants} calls
 * {@link getFilePathInfo} *exactly once* and threads the resulting paths
 * into each by-style call. Do NOT have it invoke any per-language
 * `buildSnippet()` — each does its own clipboard read, fanning N reads per
 * invocation.
 *
 * **`SnippetString` mutation.** `editor/insert-snippet.ts` mutates the
 * snippet via `appendText('\n')`. Variants store `snippetText` as a plain
 * string; the consuming command reconstructs `new vscode.SnippetString
 * (picked.snippetText)` at insertion time so the mutation never leaks back
 * into a QuickPick label.
 *
 * **Dual render — full path for insertion, basename for label.** Each
 * variant carries two strings: `snippetText` is the snippet that gets
 * inserted (full relative path: `'./foo'`, `'../utils/widget'`), and
 * `label` is the picker preview built from the same snippet shape but with
 * the path collapsed to its basename (`'foo'`, `'widget'`). This keeps the
 * picker labels short and width-stable regardless of source nesting depth.
 * Mechanically, every per-language `buildXImportSnippetByStyle` is called
 * twice per variant — once with the full path, once with the basename. The
 * basename is computed with Node `path.basename` (Unix-style separators
 * per `computeRelative`'s contract).
 */
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
  MARKDOWN_IMAGE_IMPORT_OPTIONS,
} from './_styles';
import { buildJavaScriptImportSnippetByStyle } from './javascript';
import { buildTypeScriptImportSnippetByStyle } from './typescript';
import { buildCssImportSnippetByStyle, buildCssImageImportSnippet } from './css';
import { buildScssImportSnippetByStyle, prepareScssImportPath } from './scss';
import {
  buildHtmlScriptImportSnippet,
  buildHtmlImageImportSnippet,
  buildHtmlStylesheetImportSnippet,
} from './html';
import { buildMarkdownImportSnippet, buildMarkdownImageImportSnippetByStyle } from './markdown';

/**
 * One pickable item in the `vscode.window.showQuickPick` rendered by
 * `commands/paste-import-with-style.ts` and
 * `commands/set-default-import-style.ts`.
 */
export interface ImportSnippetVariant {
  /** Primary text shown in the QuickPick (rendered snippet with `$1`/`${1:x}` placeholders substituted to plain words for readability). */
  label: string;
  /** Secondary text shown next to `label`. The `tag` from `_styles.ts` for styled options; empty string for single-shape hardcoded variants (which short-circuit past the picker anyway). */
  description: string;
  /** The raw snippet text — used to reconstruct `new vscode.SnippetString(snippetText)` immediately before insertion. Stored as string to avoid leaking `appendText('\n')` mutations across renders. */
  snippetText: string;
  /**
   * Identifies the `package.json` setting that backs this variant. Populated
   * only on **styled** variants (those derived from a `*_IMPORT_OPTIONS`
   * table); `undefined` on hardcoded single-shape variants
   * (HTML/Markdown-text/CSS-image/SCSS-image/JSX-non-script/TSX-non-script),
   * which have no user-configurable style. Consumed by
   * `commands/set-default-import-style.ts` to call `setAutoImportSetting`.
   * `value` is byte-exact against the matching `package.json:enum` entry.
   */
  setting?: {
    namespace: AutoImportConfigNamespace;
    key: AutoImportSettingKey;
    value: string;
  };
}

/**
 * Returns every import-style variant the current source/destination pair
 * can produce. The returned array is:
 *
 * - empty when the destination is unsupported or the source/destination
 *   pair has no valid snippet (consuming command toasts `'not-supported'`),
 * - length 1 when the matching branch is hardcoded (HTML, Markdown text,
 *   CSS/SCSS image, JSX/TSX non-script source) — consuming command inserts
 *   directly without showing the picker,
 * - length ≥ 2 when the matching branch consults a styled
 *   `*_IMPORT_OPTIONS` table.
 *
 * @returns Array of pickable variants ready for QuickPick rendering.
 */
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

/**
 * JSX destination — primary `.js`/`.jsx` script source iterates JS options;
 * any other source falls through to the hardcoded React non-script switch.
 */
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

/**
 * TSX destination — primary `.ts`/`.tsx` script source iterates TS options;
 * `.js` source falls back to JS options (a `.js` dropped into TSX should
 * still emit a JS-shaped import); any other source uses the React
 * non-script switch.
 */
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

/**
 * Replicates the hardcoded source-extension switch in
 * `_shared.ts:buildReactImport`. Returns `null` when the source extension
 * isn't one the JSX/TSX non-script branch handles — gating in
 * `commands/paste-import.ts` will toast `'not-supported'`.
 */
function buildReactNonScriptVariant(
  sourceFileExt: FileExtension,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant | null {
  switch (sourceFileExt) {
    case '.gif':
    case '.jpeg':
    case '.jpg':
    case '.png':
    case '.webp':
    case '.json':
    case '.html':
    case '.yml':
    case '.yaml':
    case '.md':
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

/** CSS destination — image source is hardcoded `url(...)`; everything else iterates CSS options. */
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

/**
 * SCSS destination — image source reuses the CSS `url(...)` snippet; every
 * other source uses {@link prepareScssImportPath} to apply the `.css`-always-
 * preserved + partial-filename rules before iterating SCSS options.
 */
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

/** HTML destination — every branch is hardcoded; classification picks `<script>`/`<img>`/`<link>`. */
function buildHtmlVariants(sourceFilePath: string, fullPath: string, labelFullPath: string): ImportSnippetVariant[] {
  switch (determineImportType(sourceFilePath)) {
    case 'script':
      return [toHardcodedVariant(
        buildHtmlScriptImportSnippet(fullPath),
        buildHtmlScriptImportSnippet(labelFullPath),
      )];
    case 'image':
      return [toHardcodedVariant(
        buildHtmlImageImportSnippet(fullPath),
        buildHtmlImageImportSnippet(labelFullPath),
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

/** Markdown destination — text source is the hardcoded inline-link shape; image source iterates the two image options. */
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

/** Wraps a styled (table-driven) snippet result with its `tag` (or `description` fallback) and the `(namespace, key)` of the backing `package.json` setting. The `insertSnippet` carries the full relative path; `labelSnippet` carries the basename-only path used for the picker preview. */
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

/** Wraps a hardcoded single-shape snippet — `description` is empty since the picker short-circuits at length === 1. The `insertSnippet` carries the full relative path; `labelSnippet` is the basename-only preview (only relevant if the variant ever reaches the picker, which today it doesn't — kept symmetric with `toStyledVariant`). */
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

/**
 * Substitutes snippet placeholders (`$1`, `${1:default}`) with the literal
 * default text (or `name` if no default), so QuickPick labels read
 * naturally instead of showing `$1`. Affects display only — the raw
 * `snippetText` carrying the placeholders is preserved on the variant for
 * insertion.
 */
function renderLabel(snippetText: string): string {
  return snippetText
    .replace(/\$\{1:([^}]+)\}/g, '$1')
    .replace(/\$1/g, 'name');
}
