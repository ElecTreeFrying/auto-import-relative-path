# src/

Source root for the Auto Import Relative Path VS Code extension.

## Layout

| Path | Purpose |
|------|---------|
| `extension.ts` | Entry point. `activate` registers the five commands and the document drop edit provider; `deactivate` is a no-op. |
| `gating.ts` | Shared `isPairSupported()` — nine-clause source/destination extension-pair check. |
| `commands/` | Public command surface — one file per command (copy / paste / auto / paste-with-style / set-default-style). |
| `drop/` | Drag-and-drop import provider — `DocumentDropEditProvider` for all 12 supported destination languages. |
| `editor/` | VS Code-API helpers (clipboard, snippet insertion, notifications, placement). |
| `snippets/` | Per-language snippet builders + dispatch. |
| `path/` | Pure path math. No `vscode` import — Node-testable. |
| `config/` | Workspace-config access. |
| `constants/` | Runtime gating tables for source/destination pairs. |
| `types/` | Cross-cutting type unions (no enums). |
| `test/` | Mocha BDD tests. |

## Where to add new code

| What | Where |
|------|-------|
| New command | `commands/` (new file + register in `extension.ts` + `package.json`) |
| New destination language | 8-site change — follow the [checklist in `snippets/CLAUDE.md`](snippets/CLAUDE.md#adding-a-new-destination-language) (file in `languages/`, `dispatch.ts`, `variants.ts`, `types/file-extension.ts`, `constants/extensions.ts`, `_styles.ts` + `package.json`, `gating.ts` *(only if the destination restricts its sources; script-like all-accepting destinations need only the `CROSS_IMPORT_DESTINATIONS` entry)*, `drop/selector.ts`) |
| New pure helper | `path/` |
| New `vscode` API helper | `editor/` |
| New cross-cutting type | `types/` |
| New gating table | `constants/` |
| New user setting | `config/` (settings.ts) + `package.json` + `_styles.ts` |

Match the layered dependency direction: `commands → editor, snippets → path → types`. Lower layers never import from higher layers.

## See also

- Project root [`README.md`](../README.md) and [`CLAUDE.md`](../CLAUDE.md) for cross-cutting docs (commands, build, test, publish).
- Each subdirectory has its own `README.md` (overview + file map) and `CLAUDE.md` (invariants and gotchas).
