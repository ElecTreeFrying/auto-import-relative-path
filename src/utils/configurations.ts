import * as vscode from 'vscode';

const { freeze } = Object;

/**
 * Configuration constants for the auto-import extension.
 * Each group is frozen to prevent accidental runtime modifications.
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

/**
 * Represents the top-level configuration groups for the auto-import extension.
 */
type AutoImportConfigNamespace = 'preferences' | 'script' | 'stylesheet' | 'markup';

/**
 * Represents the specific setting keys available within each configuration namespace.
 */
type AutoImportSettingKey =
  | 'placement' // Used in 'preferences'
  | 'preserveScriptFileExtension'
  | 'javascript'
  | 'typescript'
  | 'preserveStylesheetFileExtension'
  | 'css'
  | 'cssImage'
  | 'scss'
  | 'scssImage'
  | 'htmlScript'
  | 'htmlImage'
  | 'htmlStylesheet'
  | 'markdown'
  | 'markdownImage';

/**
 * Retrieves a specific auto-import configuration setting from the VSCode workspace settings.
 *
 * This function uses a two-level key system:
 * 1. The configuration namespace determines which group of settings to target.
 * 2. The setting key selects the specific configuration within that group.
 *
 * @param namespaceKey - The configuration group (namespace).
 * @param settingKey - The specific setting key within the namespace.
 * @returns The configuration value of type T, or undefined if the setting is not defined.
 */
export function getAutoImportSetting<T = unknown>(
  namespaceKey: AutoImportConfigNamespace,
  settingKey: AutoImportSettingKey
): T | undefined {
  // Retrieve the configuration for the given namespace.
  const configuration = vscode.workspace.getConfiguration(AUTO_IMPORT_CONFIG[namespaceKey].namespace);

  // Map the setting key to the actual property name stored in our config constant.
  const settingProperty = AUTO_IMPORT_CONFIG[namespaceKey][settingKey];

  // Return the requested setting, optionally typed.
  return configuration.get<T>(settingProperty);
}
