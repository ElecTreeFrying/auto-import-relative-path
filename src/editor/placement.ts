import { getAutoImportSetting } from '../config/settings';
import { SCRIPT_FILE_EXTENSIONS, STYLESHEET_FILE_EXTENSIONS } from '../constants/extensions';
import { FileExtension } from '../types/file-extension';

/** Markers used by Bottom placement to find the last import line. */
export const IMPORT_INDICATORS = [
  'import ', 'require(',
  "@import '", '@import "', '@import url(', "@use '", '@use "',
  "@forward '", '@forward "'
];

/**
 * Returns `true` when `line` bears an import marker in a *code* position — the
 * predicate Bottom placement uses to find the last import line.
 *
 * Line-leading markers (`import`, `@import`, `@use`, `@forward`) must start the
 * trimmed line, so an `import ` substring inside a string literal
 * (`const msg = "you should import this"`) is correctly NOT counted. `require(`
 * is a call expression, not a line-leading keyword (`const fs = require('fs')`),
 * so it is matched anywhere on the line. A `require(` substring inside a string
 * literal stays a residual false positive — far rarer than the prose-`import`
 * case and not removable without full string-literal parsing.
 */
export function isImportLine(line: string): boolean {
  const trimmed = line.trimStart();
  return IMPORT_INDICATORS.some(indicator =>
    indicator === 'require('
      ? line.includes(indicator)
      : trimmed.startsWith(indicator),
  );
}

/**
 * Returns `true` when the line starts with `//`, `/*`, or `*` (after leading whitespace).
 * For Markdown destinations (`isMarkdown`), a leading `*` is treated as content — bullets,
 * `*italic*`, `**bold**`, `***` — not a block-comment continuation.
 */
export function isCommentLine(line: string, isMarkdown = false): boolean {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
    return true;
  }
  return !isMarkdown && trimmed.startsWith('*');
}

/** Extracts leading whitespace (spaces or tabs) from a line. */
export function getLineIndentation(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

/** Returns the indentation of the first non-empty content line within a bounded block. */
export function detectBlockIndentation(lines: string[], openingLine: number, closingLine: number): string {
  for (let i = openingLine + 1; i < closingLine; i++) {
    if (lines[i].trim().length > 0) {
      return getLineIndentation(lines[i]);
    }
  }
  return '';
}

/** Finds the opening and closing `---` fence lines. Returns `null` if fewer than two fences exist. */
export function findAstroFrontmatterBounds(lines: string[]): { openingLine: number; closingLine: number } | null {
  let openingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (openingLine === -1) {
        openingLine = i;
      } else {
        return { openingLine, closingLine: i };
      }
    }
  }
  return null;
}

/**
 * Finds a `<script...>` / `</script>` pair.
 * Preference: `<script setup` > instance `<script` (no `context=`) > any `<script`.
 */
export function findSfcScriptBounds(lines: string[]): { openingLine: number; closingLine: number } | null {
  return findScriptBlock(lines, '<script setup')
    ?? findScriptBlock(lines, '<script', 'context=')
    ?? findScriptBlock(lines, '<script');
}

function findScriptBlock(
  lines: string[],
  openingTag: string,
  excludePattern?: string,
): { openingLine: number; closingLine: number } | null {
  let openingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (openingLine === -1) {
      if (trimmed.startsWith(openingTag) && (!excludePattern || !trimmed.includes(excludePattern))) {
        openingLine = i;
      }
    } else if (trimmed === '</script>') {
      return { openingLine, closingLine: i };
    }
  }
  return null;
}

/** Finds the insertion line for Bottom placement within a bounded region (Astro frontmatter or SFC script block). */
export function findBottomLineInRange(
  lines: string[],
  openingLine: number,
  closingLine: number,
): { line: number; indentation: string } {
  let insertionLine = openingLine + 1;
  let lastImportIndentation = '';
  for (let i = openingLine + 1; i < closingLine; i++) {
    if (!isCommentLine(lines[i]) && isImportLine(lines[i])) {
      insertionLine = i + 1;
      lastImportIndentation = getLineIndentation(lines[i]);
    }
  }
  const indentation = lastImportIndentation || detectBlockIndentation(lines, openingLine, closingLine);
  return { line: insertionLine, indentation };
}

/** Non-stylesheet source into a stylesheet destination produces an inline `url()` snippet. */
export function isInlineSnippet(sourceFileExt: FileExtension, destinationFileExt: FileExtension): boolean {
  return (
    !STYLESHEET_FILE_EXTENSIONS.includes(sourceFileExt) && STYLESHEET_FILE_EXTENSIONS.includes(destinationFileExt)
  );
}

/** Returns `true` for destinations (`.html`, `.md`) where imports insert at the cursor line. */
export function shouldRepositionCursor(destinationFileExt: FileExtension): boolean {
  return destinationFileExt === '.html' || destinationFileExt === '.md';
}

/** Returns `true` for Markdown destinations (`.md`, `.mdx`) where a leading `*` is content, not a comment. */
export function isMarkdownDestination(destinationFileExt: FileExtension): boolean {
  return destinationFileExt === '.md' || destinationFileExt === '.mdx';
}

/**
 * Scans upward from a line inside a comment block to find the first line above the block.
 * Returns the original line if it is not a comment. Pass `isMarkdown` so Markdown `*` lines
 * (bullets / emphasis) are not mistaken for comment continuations.
 */
export function adjustForCommentBlock(lines: string[], line: number, isMarkdown = false): number {
  if (line >= lines.length || !isCommentLine(lines[line], isMarkdown)) {
    return line;
  }
  let start = line;
  while (start > 0 && isCommentLine(lines[start - 1], isMarkdown)) {
    start--;
  }
  return start;
}

function computeBottomLine(lines: string[]): number {
  let insertionLine = 0;
  lines.forEach((lineContent, index) => {
    if (!isCommentLine(lineContent) && isImportLine(lineContent)) {
      insertionLine = index + 1;
    }
  });
  return insertionLine;
}

function determineInsertionColumn(destinationFileExt: FileExtension, dropColumn: number): number {
  const isScriptOrStylesheet =
    SCRIPT_FILE_EXTENSIONS.includes(destinationFileExt) || STYLESHEET_FILE_EXTENSIONS.includes(destinationFileExt);
  return isScriptOrStylesheet ? 0 : dropColumn;
}

export interface ComputedPlacement {
  line: number;
  column: number;
  indentation: string;
  isInline: boolean;
  wrapperPrefix?: string;
  wrapperSuffix?: string;
}

/** Computes the proper insertion position for an import without touching the editor. */
export function computeImportPlacement(
  documentText: string,
  destinationFileExt: FileExtension,
  sourceFileExt: FileExtension,
  dropLine: number,
  dropColumn: number,
): ComputedPlacement {
  const lines = documentText.split('\n');

  if (isInlineSnippet(sourceFileExt, destinationFileExt)) {
    return { line: dropLine, column: dropColumn, indentation: '', isInline: true };
  }

  if (shouldRepositionCursor(destinationFileExt)) {
    const adjustedLine = adjustForCommentBlock(lines, dropLine, isMarkdownDestination(destinationFileExt));
    const column = determineInsertionColumn(destinationFileExt, dropColumn);
    return { line: adjustedLine, column, indentation: '', isInline: false };
  }

  if (destinationFileExt === '.astro') {
    return computeAstroPlacement(lines, dropLine);
  }

  if (destinationFileExt === '.vue' || destinationFileExt === '.svelte') {
    return computeSfcPlacement(lines, dropLine);
  }

  const placement = getAutoImportSetting<string>('preferences', 'placement');

  switch (placement) {
    case 'Top':
      return { line: 0, column: 0, indentation: '', isInline: false };
    case 'Cursor': {
      const adjustedLine = adjustForCommentBlock(lines, dropLine, isMarkdownDestination(destinationFileExt));
      return { line: adjustedLine, column: 0, indentation: '', isInline: false };
    }
    case 'Bottom':
    default: {
      const line = computeBottomLine(lines);
      return { line, column: 0, indentation: '', isInline: false };
    }
  }
}

function computeAstroPlacement(lines: string[], dropLine: number): ComputedPlacement {
  const bounds = findAstroFrontmatterBounds(lines);

  if (!bounds) {
    return { line: 0, column: 0, indentation: '', isInline: false, wrapperPrefix: '---\n', wrapperSuffix: '---\n' };
  }

  const { openingLine, closingLine } = bounds;
  const placement = getAutoImportSetting<string>('preferences', 'placement');

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      return { line: openingLine + 1, column: 0, indentation, isInline: false };
    }
    case 'Cursor': {
      if (dropLine > openingLine && dropLine < closingLine) {
        const adjustedLine = adjustForCommentBlock(lines, dropLine);
        const indentation = getLineIndentation(lines[adjustedLine] || '') || detectBlockIndentation(lines, openingLine, closingLine);
        return { line: adjustedLine, column: 0, indentation, isInline: false };
      }
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
  }
}

function computeSfcPlacement(lines: string[], dropLine: number): ComputedPlacement {
  const bounds = findSfcScriptBounds(lines);

  if (!bounds) {
    return { line: 0, column: 0, indentation: '', isInline: false, wrapperPrefix: '<script>\n', wrapperSuffix: '</script>\n' };
  }

  const { openingLine, closingLine } = bounds;
  const placement = getAutoImportSetting<string>('preferences', 'placement');

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      return { line: openingLine + 1, column: 0, indentation, isInline: false };
    }
    case 'Cursor': {
      if (dropLine > openingLine && dropLine < closingLine) {
        const adjustedLine = adjustForCommentBlock(lines, dropLine);
        const indentation = getLineIndentation(lines[adjustedLine] || '') || detectBlockIndentation(lines, openingLine, closingLine);
        return { line: adjustedLine, column: 0, indentation, isInline: false };
      }
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
  }
}
