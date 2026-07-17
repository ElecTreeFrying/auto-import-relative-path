# src/config/CLAUDE.md

Workspace-config access for the extension.

## Files

- `settings.ts` — the only file; `getAutoImportSetting(namespaceKey, settingKey)` reads, `setAutoImportSetting(namespaceKey, settingKey, value, target?)` writes, and `inspectAutoImportSetting(namespaceKey, settingKey)` returns the full `WorkspaceConfiguration.inspect` record (declared default vs. per-target overrides) so a caller can tell a user override from the `package.json` default — the distinction `getAutoImportSetting` collapses (used by `commands/reset-import-styles.ts` to read each setting's `globalValue`). All three consult the same `AUTO_IMPORT_CONFIG` alias map; the writer defaults to `vscode.ConfigurationTarget.Global` because no `package.json` setting declares a `scope` field. These three helpers and the `AutoImportConfigNamespace` / `AutoImportSettingKey` type aliases are the only exports.

## The frozen `AUTO_IMPORT_CONFIG` map

Top-level group → `{ namespace, settings }`. `namespace` is the fully qualified VS Code config path; `settings` is a sub-object that maps short aliases ↔ property names. Splitting metadata (`namespace`) out of the alias space means an alias can never collide with a metadata key.

Namespaces:

| `namespaceKey` | `vscode.workspace.getConfiguration(...)` namespace |
|----------------|-----------------------------------------------------|
| `preferences` | `auto-import.preferences` |
| `script` | `auto-import.importStatement.script` |
| `stylesheet` | `auto-import.importStatement.styleSheet` |
| `markup` | `auto-import.importStatement.markup` |
| `latex` | `auto-import.importStatement.latex` |

The `Object.freeze` is intentional — mutations throw at runtime. Treat the map as a configuration constant.

The **dormant** setting keys are `cssImage`, `scssImage`, `htmlStyleSheet`, and `markdown`. They exist in the map and in `package.json` for backward compatibility (single-shape settings with only one enum value — users may have them in their `settings.json` from prior versions), but no code path reads them via `getAutoImportSetting` or writes them via `setAutoImportSetting`. They must not be removed from `package.json` without migration tooling to clean up existing user configurations. Both `cssImage` and `scssImage` resolve to the same single-entry `CSS_IMAGE_IMPORT_OPTIONS` table in `src/snippets/_styles.ts`; `htmlStyleSheet` → `HTML_STYLESHEET_IMPORT_OPTIONS` and `markdown` → `MARKDOWN_IMPORT_OPTIONS` — all dead exports. There is no `SCSS_IMAGE_IMPORT_OPTIONS`: `scss.ts` reuses `buildCssImageImportSnippet` from `languages/css.ts` for image imports, the same builder `css.ts` calls. Either way the snippet builders hardcode the single shape directly and never call `resolveStyleIndex` (see [`src/snippets/CLAUDE.md`](../snippets/CLAUDE.md) → "Parity-only tables", and the SCSS note below it).

## Three-site byte-exact sync rule

Adding or renaming a setting requires changes in three places that must stay byte-identical:

1. `package.json:contributes.configuration.properties` — the VS Code-visible setting + its `enum` strings.
2. `src/snippets/_styles.ts` — an `ImportStyle[]` whose `description` strings match the `package.json` `enum` byte-for-byte (lookup is by string equality via `resolveStyleIndex`).
3. The relevant per-language module under `src/snippets/` — a `switch` on the resolved numeric `value` to emit the snippet.

**Drift consequences:**

- A typo or trailing-space drift causes `vscode.workspace.getConfiguration().get(...)` to return `undefined`.
- The snippet builder silently falls through to its `default:` branch.
- No error, no warning — the user just gets the default style instead of the chosen one.

## Adding a new setting key

1. New entry in the relevant `AUTO_IMPORT_CONFIG[namespaceKey].settings` object.
2. Add the alias as a literal to the matching property in the `SettingsKeyMap` type (e.g. `SettingsKeyMap['stylesheet']`); `AutoImportSettingKey` is derived from it automatically.
3. Then complete the three-site sync above.

If you forget step 2, the call site won't type-check.
