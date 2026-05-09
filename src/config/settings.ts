/**
 * Workspace-configuration access for the extension. `getAutoImportSetting`
 * is the only public surface; the `AUTO_IMPORT_CONFIG` map is its
 * private translation table from short aliases (`'javascript'`) to fully
 * qualified VS Code setting paths (`auto-import.importStatement.script
 * .javascriptImportStyle`).
 *
 * @remarks
 * **Three sites must stay byte-exact in sync:**
 *
 * 1. This `AUTO_IMPORT_CONFIG` map — the namespace and property strings
 *    below.
 * 2. `package.json` → `contributes.configuration.properties` — the
 *    user-visible settings keyed off the same fully qualified paths
 *    (`auto-import.preferences.importStatementPlacement`, etc.).
 * 3. `snippets/_styles.ts` — each `*_IMPORT_OPTIONS` table's `description`
 *    strings must match the package.json `enum` entries verbatim, because
 *    `resolveStyleIndex` looks up the user's selection by string equality.
 *
 * Drift between (1) and (2) means `vscode.workspace.getConfiguration(ns)
 * .get(key)` returns `undefined` and the snippet builder silently falls
 * through to its default branch. There is no warning — the user just
 * gets the default style instead of their chosen one. Keep the strings
 * identical.
 */
import * as vscode from 'vscode';

const { freeze } = Object;

/**
 * Two-level alias map: top-level group (`preferences` / `script` /
 * `stylesheet` / `markup`) → property aliases ↔ fully qualified VS Code
 * setting paths. Frozen so mutations throw at runtime; consumed only by
 * {@link getAutoImportSetting}. See the file header for the three-site
 * sync requirement with `package.json` and `snippets/_styles.ts`.
 */
const AUTO_IMPORT_CONFIG = freeze({
  preferences: freeze({
    namespace: 'auto-import.preferences',
    placement: 'importStatementPlacement',
  }),
  script: freeze({
    namespace: 'auto-import.importStatement.script',
    preserve: 'preserveScriptFileExtension',
    javascript: 'javascriptImportStyle',
    typescript: 'typescriptImportStyle',
  }),
  stylesheet: freeze({
    namespace: 'auto-import.importStatement.styleSheet',
    preserve: 'preserveStylesheetFileExtension',
    css: 'cssImportStyle',
    cssImage: 'cssImageImportStyle',
    scss: 'scssImportStyle',
    scssImage: 'scssImageImportStyle',
  }),
  markup: freeze({
    namespace: 'auto-import.importStatement.markup',
    htmlScript: 'htmlScriptImportStyle',
    htmlImage: 'htmlImageImportStyle',
    htmlStylesheet: 'htmlStyleSheetImportStyle',
    markdown: 'markdownImportStyle',
    markdownImage: 'markdownImageImportStyle',
  }),
});

/** Top-level keys of {@link AUTO_IMPORT_CONFIG}. */
type AutoImportConfigNamespace =
  /** UX-level settings (e.g. `importStatementPlacement`). Maps to `auto-import.preferences.*`. */
  | 'preferences'
  /** JS/TS import-shape settings. Maps to `auto-import.importStatement.script.*`. */
  | 'script'
  /** CSS/SCSS import-shape settings. Maps to `auto-import.importStatement.styleSheet.*`. */
  | 'stylesheet'
  /** HTML/Markdown import-shape settings. Maps to `auto-import.importStatement.markup.*`. */
  | 'markup';

/**
 * Union of every short setting alias across all four namespaces.
 *
 * @remarks
 * The same alias may appear under multiple namespaces (e.g. `preserve`-like
 * aliases). The pair `(namespaceKey, settingKey)` is what disambiguates a
 * lookup in {@link getAutoImportSetting}; this type doesn't enforce that
 * the pair is valid — it just constrains the second argument to a known
 * alias. An invalid pair returns `undefined` at runtime via
 * `vscode.workspace.getConfiguration().get(...)`.
 */
type AutoImportSettingKey =
  /** Top/Bottom/Cursor placement of the inserted import. Pair with namespace `'preferences'`. */
  | 'placement'
  /** Whether `.ts`/`.js`/etc. is preserved in the JS-style import path. Pair with `'script'`. */
  | 'preserveScriptFileExtension'
  /** Selected JavaScript import shape (one of nine entries in `JAVASCRIPT_IMPORT_OPTIONS`). Pair with `'script'`. */
  | 'javascript'
  /** Selected TypeScript import shape (one of five entries in `TYPESCRIPT_IMPORT_OPTIONS`). Pair with `'script'`. */
  | 'typescript'
  /** Whether `.css`/`.scss` is preserved in stylesheet import paths. Pair with `'stylesheet'`. */
  | 'preserveStylesheetFileExtension'
  /** Selected CSS import shape. Pair with `'stylesheet'`. */
  | 'css'
  /** Selected CSS image-reference shape (currently unused; see `_styles.ts:CSS_IMAGE_IMPORT_OPTIONS`). Pair with `'stylesheet'`. */
  | 'cssImage'
  /** Selected SCSS import shape. Pair with `'stylesheet'`. */
  | 'scss'
  /** Selected SCSS image-reference shape (currently unused). Pair with `'stylesheet'`. */
  | 'scssImage'
  /** Selected HTML `<script>` shape (currently unused; fixed shape). Pair with `'markup'`. */
  | 'htmlScript'
  /** Selected HTML `<img>` shape (currently unused; fixed shape). Pair with `'markup'`. */
  | 'htmlImage'
  /** Selected HTML `<link>` shape (currently unused; fixed shape). Pair with `'markup'`. */
  | 'htmlStylesheet'
  /** Selected Markdown inline-link shape (currently unused; fixed shape). Pair with `'markup'`. */
  | 'markdown'
  /** Selected Markdown image shape (one of two entries in `MARKDOWN_IMAGE_IMPORT_OPTIONS`). Pair with `'markup'`. */
  | 'markdownImage';

/**
 * Reads one extension setting from the workspace configuration via the
 * `AUTO_IMPORT_CONFIG` alias map.
 *
 * @param namespaceKey - Top-level config group (`'preferences'`, `'script'`,
 *   `'stylesheet'`, or `'markup'`).
 * @param settingKey - Short alias for the setting within the namespace.
 * @returns The configured value, or `undefined` if the setting is unset.
 */
export function getAutoImportSetting<T = unknown>(
  namespaceKey: AutoImportConfigNamespace,
  settingKey: AutoImportSettingKey
): T | undefined {
  const configuration = vscode.workspace.getConfiguration(AUTO_IMPORT_CONFIG[namespaceKey].namespace);
  const settingProperty = AUTO_IMPORT_CONFIG[namespaceKey][settingKey];
  return configuration.get<T>(settingProperty);
}
