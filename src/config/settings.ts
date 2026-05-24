import * as vscode from 'vscode';

const { freeze } = Object;

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
      htmlVideo: 'htmlVideoImportStyle',
      htmlAudio: 'htmlAudioImportStyle',
      htmlStyleSheet: 'htmlStyleSheetImportStyle',
      markdown: 'markdownImportStyle',
      markdownImage: 'markdownImageImportStyle',
    }),
  }),
});

export type AutoImportConfigNamespace =
  | 'preferences'
  | 'script'
  | 'stylesheet'
  | 'markup';

export type AutoImportSettingKey =
  | 'placement'
  | 'preserve'
  | 'javascript'
  | 'typescript'
  | 'css'
  | 'cssImage'
  | 'scss'
  | 'scssImage'
  | 'htmlScript'
  | 'htmlImage'
  | 'htmlVideo'
  | 'htmlAudio'
  | 'htmlStyleSheet'
  | 'markdown'
  | 'markdownImage';

export function getAutoImportSetting<T = unknown>(
  namespaceKey: AutoImportConfigNamespace,
  settingKey: AutoImportSettingKey
): T | undefined {
  const { namespace, settings } = AUTO_IMPORT_CONFIG[namespaceKey];
  const configuration = vscode.workspace.getConfiguration(namespace);
  const settingProperty = (settings as Record<AutoImportSettingKey, string>)[settingKey];
  return configuration.get<T>(settingProperty);
}

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
