# src/path/CLAUDE.md

Pure path math. **No `vscode` import** — every file here is Node-testable. Don't introduce one.

## Files

- `relative.ts` — `computeRelative(sourceFilePath, destinationFilePath)` returns the import-ready relative path.
- `extension.ts` — `extractFileExtension` is a thin wrapper over `path.parse`; `removeFileExtension` strips the extension via string slicing (guarded for the extensionless case — see below).
- `import-type.ts` — `determineImportType(filePath)` maps file extensions to the `ImportType` values (explicit cases plus the `default:` `'image'` catch-all), or `null` (`.html` and `.scss`).
- `import-name.ts` — `deriveImportName(filePath)` (camelCase) and `deriveComponentName(filePath)` (PascalCase, for framework SFCs) derive an import identifier from the source basename, or `null` when no legal identifier forms. Pure string/path math; consumed by `snippets/` for default-import auto-naming (see the `## import-name.ts` section below).

## `computeRelative` — the `./` prefix rule

Returns a Unix-style path (`toUnixPath` replaces `\` with `/`) with the file extension stripped, suitable for use inside an `import` statement.

**The `./` prefix is added when** `path.relative` produced a result that doesn't already start with `.` (a bare `'foo'` / `'utils/helper'`). Genuine same-directory imports are the common case — `path.relative` returns a bare filename, so they receive the `./` prefix here. Paths that already begin with `../` are left untouched (adding `./` would emit a redundant `./../…`).

**Regression test.** This rule is regression-tested in `src/test/path/relative.test.ts` (the `computeRelative` `./`-prefix cases for same-directory and child-directory imports). Don't simplify the prefix logic without re-running the test.

## `extension.ts` — extensionless paths keep their whole name

- `extractFileExtension(filePath)` returns the trailing extension (e.g. `'.ts'`) or `''` when there is none. Thin wrapper over `path.parse(filePath).ext`.
- `removeFileExtension(filePath)` returns `ext ? filePath.slice(0, -ext.length) : filePath`. The `ext ? … : filePath` guard is **load-bearing**: without it, `slice(0, -0)` is `slice(0, 0)` === `''` (a zero-width slice), which would erase an extensionless path (`LICENSE` → `''`) and collapse its `computeRelative` result to `''` / `'./'`. The guard keeps extensionless sources whole (`../LICENSE`).

This is regression-tested with extensionless paths (`Makefile` → `'Makefile'`, `/repo/LICENSE` → `/repo/LICENSE` in `test/path/extension.test.ts`; `./LICENSE` / `../LICENSE` via `computeRelative` in `test/path/relative.test.ts`). **Don't re-introduce the zero-slice** — extensionless-source support (the `gating.ts` first clause admitting an extensionless source into `.md` as a link) depends on the whole name surviving.

## `import-name.ts` — basename → import identifier

Two sibling derivers turn a source basename into an import binding. Both strip the extension, split the remainder on `-` / `_` / `.` / whitespace (via the shared `basenameSegments` helper), and validate against `/^[A-Za-z_$][\w$]*$/` — a leading-digit or non-ASCII basename (`404.png`, `café-menu.png`) yields `null`, so callers keep their generic placeholder. They differ only in first-segment case:

- `deriveImportName(filePath)` — **camelCase**, for plain default imports. **Preserves the first segment's original case**: a lowercase filename stays camelCase (`logo.svg` → `logo`, `my-logo.v2.svg` → `myLogoV2`), a PascalCase filename keeps its case (`App.jsx` → `App`, the React component convention) rather than being lowercased to `app`. It never *transforms* case (kebab → Pascal) — that is `deriveComponentName`'s job.
- `deriveComponentName(filePath)` — **PascalCase**, for framework SFC default imports. Capitalizes *every* segment, so `my-button.vue` → `MyButton` (the Vue/Svelte/Astro convention regardless of the on-disk filename); an already-PascalCase name is idempotent (`BaseCard.vue` → `BaseCard`).

Only the basename is used, so `deriveImportName('./a/b/logo.png')` === `deriveImportName('logo.png')` — the label-vs-payload double-render in `variants.ts` derives the same name from either.

Consumers: `deriveImportName` — the default-import positions of `snippets/languages/{javascript,typescript}.ts` and the plain-asset / media groups of `snippets/_react.ts:buildAssetImportStatement`; `deriveComponentName` — the framework-SFC group of that same asset switch. No `vscode` import — Node-testable, regression-tested in `test/path/import-name.test.ts`.

## `determineImportType` — `ImportType | null`, not just `ImportType`

Maps file extension to buckets — explicit cases plus the `default:` `'image'` catch-all — with two `null` returns:

| Source extension | Returns |
|------------------|---------|
| `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.astro` | `'script'` |
| `.css` | `'stylesheet'` |
| `.md` | `'markdown'` |
| `.mp4`, `.webm`, `.mov` | `'video'` |
| `.mp3`, `.ogg`, `.wav`, `.m4a` | `'audio'` |
| `.vtt` | `'text-track'` |
| `.html` | `null` (defensive — gating already rejects HTML→HTML upstream) |
| `.scss` | `null` (so `snippets/languages/scss.ts` falls through its `switch` to its SCSS-specific default that handles `@use`/partial filenames) |
| anything else | `'image'` (`default:` catch-all) |

The `'image'` branch is **not** a guarantee that the source is image-like — it's a default. The runtime gating in `src/gating.ts:isPairSupported` is what makes that safe.

Consumers: `snippets/languages/{css,scss,html,markdown}.ts` and `snippets/variants.ts`. JSX/TSX/MDX (via `_react.ts`) and `.tex` destinations (via `languages/latex.ts`) don't consult this — they branch on the raw source extension.
