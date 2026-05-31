# src/config/CLAUDE.md

Workspace-config access for the extension.

## Files

- `settings.ts` — the only file; `getAutoImportSetting(namespaceKey, settingKey)` reads, `setAutoImportSetting(namespaceKey, settingKey, value, target?)` writes. Both consult the same `AUTO_IMPORT_CONFIG` alias map; the writer defaults to `vscode.ConfigurationTarget.Global` because no `package.json` setting declares a `scope` field. The two helpers and the `AutoImportConfigNamespace` / `AutoImportSettingKey` type aliases are the only exports.

## The frozen `AUTO_IMPORT_CONFIG` map

Top-level group → `{ namespace, settings }`. `namespace` is the fully qualified VS Code config path; `settings` is a sub-object that maps short aliases ↔ property names. Splitting metadata (`namespace`) out of the alias space means an alias can never collide with a metadata key.

Four namespaces:

| `namespaceKey` | `vscode.workspace.getConfiguration(...)` namespace |
|----------------|-----------------------------------------------------|
| `preferences` | `auto-import.preferences` |
| `script` | `auto-import.importStatement.script` |
| `stylesheet` | `auto-import.importStatement.styleSheet` |
| `markup` | `auto-import.importStatement.markup` |

The `Object.freeze` is intentional — mutations throw at runtime. Treat the map as a configuration constant.

Four setting keys are **dormant** — they exist in the map and in `package.json` for UI parity (single-shape settings with only one enum value) but no code path reads them via `getAutoImportSetting` or writes them via `setAutoImportSetting`: `cssImage`, `scssImage`, `htmlStyleSheet`, and `markdown`. Three of these back a single-entry `*_IMPORT_OPTIONS` table in `src/snippets/_styles.ts` that is a dead export: `cssImage` → `CSS_IMAGE_IMPORT_OPTIONS`, `htmlStyleSheet` → `HTML_STYLESHEET_IMPORT_OPTIONS`, `markdown` → `MARKDOWN_IMPORT_OPTIONS`. `scssImage` has no dedicated table — SCSS image sources reuse `buildCssImageImportSnippet` from `languages/css.ts`. Either way the snippet builders hardcode the single shape directly and never call `resolveStyleIndex` (see [`src/snippets/CLAUDE.md`](../snippets/CLAUDE.md) → "Currently unused" tables, and the SCSS note below it).

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
2. Add the alias as a literal in the `AutoImportSettingKey` union type.
3. Then complete the three-site sync above.

If you forget step 2, the call site won't type-check.
