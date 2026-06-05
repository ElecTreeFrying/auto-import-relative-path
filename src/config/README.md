# src/config/

Reads and writes user settings in VS Code's workspace configuration.

## Files

| File | Public functions | Purpose |
|------|------------------|---------|
| `settings.ts` | `getAutoImportSetting<T>(namespaceKey, settingKey): T \| undefined`, `setAutoImportSetting<T>(namespaceKey, settingKey, value, target: ConfigurationTarget = ConfigurationTarget.Global): Thenable<void>` | Reader/writer pair over the frozen `AUTO_IMPORT_CONFIG` map. Writer defaults to `ConfigurationTarget.Global` (no `scope` field on any `package.json` setting). |

Also exported: the type aliases `AutoImportConfigNamespace` (the four namespace keys) and `AutoImportSettingKey` (all valid setting keys, derived from the internal `SettingsKeyMap`).

## Namespaces

The map has four top-level groups:

- `preferences` — UX-level settings (e.g. import-statement placement).
- `script` — JS/TS import-shape settings.
- `stylesheet` — CSS/SCSS import-shape settings.
- `markup` — HTML/Markdown import-shape settings.

Each maps to a `vscode.workspace.getConfiguration(...)` namespace and a set of property aliases (e.g. `'javascript'` → `'javascriptImportStyle'`).

## Where to add a new setting

See the three-site sync rule in [`CLAUDE.md`](CLAUDE.md) (this directory) — adding a setting requires synchronised changes in `package.json`, `src/snippets/_styles.ts`, and the relevant per-language module under `src/snippets/`.
