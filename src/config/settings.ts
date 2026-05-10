/**
 * Workspace-configuration access for the extension. `getAutoImportSetting` and
 * `setAutoImportSetting` are the public surface; the `AUTO_IMPORT_CONFIG` map
 * is their private translation table from short aliases (`'javascript'`) to
 * fully qualified VS Code setting paths (`auto-import.importStatement.script
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
 *
 * **Writer target.** `setAutoImportSetting` defaults to
 * `vscode.ConfigurationTarget.Global` because no `package.json` setting
 * declares a `scope` field — the user-visible defaults are global for every
 * setting in this extension.
 */
import * as vscode from 'vscode';

const { freeze } = Object;

/**
 * Top-level group (`preferences` / `script` / `stylesheet` / `markup`) →
 * `{ namespace, settings }`, where `namespace` is the fully qualified VS
 * Code config path and `settings` maps short aliases ↔ property names.
 * The two-slot shape keeps group metadata (`namespace`) out of the alias
 * space so an alias can never collide with a metadata key. Frozen so
 * mutations throw at runtime; consumed only by {@link getAutoImportSetting}.
 * See the file header for the three-site sync requirement with
 * `package.json` and `snippets/_styles.ts`.
 */
const AUTO_IMPORT_CONFIG = freeze({
  preferences: freeze({
    namespace: 'auto-import.preferences',
    settings: freeze({
      placement: 'importStatementPlacement',
    }),
  }),
  script: freeze({
    namespace: 'auto-import.importStatement.script',
    settings: freeze({
      preserve: 'preserveScriptFileExtension',
      javascript: 'javascriptImportStyle',
      typescript: 'typescriptImportStyle',
    }),
  }),
  stylesheet: freeze({
    namespace: 'auto-import.importStatement.styleSheet',
    settings: freeze({
      preserve: 'preserveStylesheetFileExtension',
      css: 'cssImportStyle',
      cssImage: 'cssImageImportStyle',
      scss: 'scssImportStyle',
      scssImage: 'scssImageImportStyle',
    }),
  }),
  markup: freeze({
    namespace: 'auto-import.importStatement.markup',
    settings: freeze({
      htmlScript: 'htmlScriptImportStyle',
      htmlImage: 'htmlImageImportStyle',
      htmlStyleSheet: 'htmlStyleSheetImportStyle',
      markdown: 'markdownImportStyle',
      markdownImage: 'markdownImageImportStyle',
    }),
  }),
});

/** Top-level keys of {@link AUTO_IMPORT_CONFIG}. */
export type AutoImportConfigNamespace =
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
export type AutoImportSettingKey =
  /** Top/Bottom/Cursor placement of the inserted import. Pair with namespace `'preferences'`. */
  | 'placement'
  /**
   * Whether the source file extension is preserved on the import path.
   * Pair with `'script'` (resolves to `preserveScriptFileExtension`) or
   * `'stylesheet'` (resolves to `preserveStylesheetFileExtension`); the
   * namespace disambiguates which package.json setting is read.
   */
  | 'preserve'
  /** Selected JavaScript import shape (one of nine entries in `JAVASCRIPT_IMPORT_OPTIONS`). Pair with `'script'`. */
  | 'javascript'
  /** Selected TypeScript import shape (one of five entries in `TYPESCRIPT_IMPORT_OPTIONS`). Pair with `'script'`. */
  | 'typescript'
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
  | 'htmlStyleSheet'
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
  const { namespace, settings } = AUTO_IMPORT_CONFIG[namespaceKey];
  const configuration = vscode.workspace.getConfiguration(namespace);
  const settingProperty = (settings as Record<AutoImportSettingKey, string>)[settingKey];
  return configuration.get<T>(settingProperty);
}

/**
 * Persists one extension setting to the workspace configuration via the
 * `AUTO_IMPORT_CONFIG` alias map. The mirror of {@link getAutoImportSetting}.
 *
 * @param namespaceKey - Top-level config group (`'preferences'`, `'script'`,
 *   `'stylesheet'`, or `'markup'`).
 * @param settingKey - Short alias for the setting within the namespace.
 * @param value - The value to persist. For style settings, must be byte-exact
 *   against the matching `package.json:enum` entry — drift causes the next
 *   `getAutoImportSetting` read to fall through to the default style.
 * @param target - Configuration scope. Defaults to `Global` because no
 *   `package.json` setting declares a `scope` field.
 * @returns A `Thenable<void>` that resolves once VS Code has written the
 *   value to disk.
 */
export function setAutoImportSetting<T = unknown>(
  namespaceKey: AutoImportConfigNamespace,
  settingKey: AutoImportSettingKey,
  value: T,
  target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global,
): Thenable<void> {
  const { namespace, settings } = AUTO_IMPORT_CONFIG[namespaceKey];
  const configuration = vscode.workspace.getConfiguration(namespace);
  const settingProperty = (settings as Record<AutoImportSettingKey, string>)[settingKey];
  return configuration.update(settingProperty, value, target);
}
