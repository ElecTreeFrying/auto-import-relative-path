/**
 * TypeScript import-snippet generator. Five styles selectable via
 * `auto-import.importStatement.script.typescriptImportStyle`.
 *
 * @remarks
 * **Angular special case at index 1.** Style 1 (`import { name } from '…';`)
 * runs the path through {@link generateImportName}: when the path contains
 * `.component`, `.directive`, `.pipe`, `.service`, or `.module` (Angular
 * filename conventions), the placeholder is replaced with a PascalCase
 * identifier derived from the basename — e.g. `app-root.component` becomes
 * `AppRootComponent`. Other paths still emit a plain `$1` placeholder. The
 * special case is **only active for index 1**; every other index uses
 * `$1` unconditionally. Don't break this when refactoring
 * {@link buildTypeScriptImportSnippet}.
 *
 * **`buildTypeScriptImportSnippet` is exported.** `snippets/_shared.ts`
 * imports it on behalf of `tsx.ts` (TSX uses TypeScript snippets for
 * `.ts`/`.tsx` sources).
 */
import * as vscode from 'vscode';
import * as path from 'path';

import { getAutoImportSetting } from '../config/settings';
import { extractFileExtension } from '../path/extension';
import { getFilePathInfo } from '../editor/file-path-info';
import { TYPESCRIPT_IMPORT_OPTIONS, resolveStyleIndex } from './_styles';

/**
 * Builds the relative path (optionally extension-suffixed per the user's
 * `preserveScriptFileExtension` setting) and emits the TypeScript snippet.
 *
 * @returns The TypeScript import `SnippetString` for the current source.
 */
export async function buildSnippet(): Promise<vscode.SnippetString> {
  const { sourceFilePath, relativePath } = await getFilePathInfo();

  const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
  const fileExtension = shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';

  return buildTypeScriptImportSnippet(relativePath + fileExtension);
}

/**
 * Returns one of five TypeScript import shapes selected by the user's
 * `typescriptImportStyle` setting. Thin wrapper over
 * {@link buildTypeScriptImportSnippetByStyle} that reads the user's setting
 * and delegates.
 *
 * @param relativePath - The already-computed import path (with or without extension).
 * @returns The `SnippetString` for the matched style, or the named-import shape.
 */
export function buildTypeScriptImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(TYPESCRIPT_IMPORT_OPTIONS, getAutoImportSetting<string>('script', 'typescript'));
  return buildTypeScriptImportSnippetByStyle(styleIndex, relativePath);
}

/**
 * Pure switch on `styleIndex` that emits the matching TypeScript import
 * `SnippetString`. Reused by the QuickPick aggregator (`snippets/variants.ts`)
 * to render every variant for a given paste without consulting the user's
 * setting.
 *
 * Index 1 routes through {@link generateImportName} for the Angular
 * PascalCase substitution — keep the call inside the index-1 branch when
 * editing this function (see module header).
 *
 * @param styleIndex - The style key (matches `TYPESCRIPT_IMPORT_OPTIONS[i].value`).
 *   `undefined` falls through to the named-import shape, mirroring the
 *   existing `default:` branch when `resolveStyleIndex` doesn't match.
 * @param relativePath - The already-computed import path (with or without extension).
 * @returns The `SnippetString` for the matched style.
 */
export function buildTypeScriptImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`import { ${generateImportName(relativePath)} } from '${relativePath}';`);
    case 2:
      return new vscode.SnippetString(`import { default as $1 } from '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`import '${relativePath}';`);
    default:
      return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
  }
}

/**
 * Returns a PascalCase identifier derived from the basename when the path
 * matches an Angular filename convention (`.component`, `.directive`,
 * `.pipe`, `.service`, `.module`); returns `'$1'` otherwise.
 *
 * @remarks
 * Strips a trailing script extension (`.ts`/`.tsx`/`.js`/`.jsx`) first so
 * that `preserveScriptFileExtension: true` doesn't fold the extension into
 * the identifier (otherwise `app-root.component.ts` → `AppRootComponentTs`).
 * Then replaces every `.` with `-`, splits on `-`, capitalises each segment,
 * and joins. So `app-root.component` → `AppRootComponent`.
 *
 * @param relativePath - The import path being inserted into the snippet.
 * @returns The PascalCase identifier, or `'$1'` placeholder for non-Angular paths.
 */
function generateImportName(relativePath: string): string {
  if (
    relativePath.includes('.component') ||
    relativePath.includes('.directive') ||
    relativePath.includes('.pipe') ||
    relativePath.includes('.service') ||
    relativePath.includes('.module')
  ) {
    const ext = extractFileExtension(relativePath);
    const withoutExt = (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx')
      ? relativePath.slice(0, -ext.length)
      : relativePath;
    const baseName = path.basename(withoutExt).replace(/\./g, '-');
    return baseName
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }
  return '$1';
}
