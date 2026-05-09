# 16 — Path computation

Validates the pure path-math layer: `./` prefix rule (CHANGELOG 0.6.1 regression), `../` traversal, SCSS partial filename stripping, special-character paths, cross-platform output.

**Sources:**
- `src/path/relative.ts` — `computeRelative`, `toUnixPath`, `areFilesInSameDirectory`
- `src/path/extension.ts` — `extractFileExtension`, `removeFileExtension`
- `src/snippets/scss.ts:normalizePartialFilename` — partial `_` stripping
- `src/editor/file-path-info.ts` — single source of truth

## Setup

- 00-setup.md complete
- `placement = Cursor`, `preserveScriptFileExtension = false`
- `typescriptImportStyle = import { name } from '_relativePath_';`

## `./` prefix rule (CHANGELOG 0.6.1 regression)

The `./` prefix is added when:
1. Files are in the same directory (case-insensitive comparison), OR
2. `path.relative` produced a result that doesn't start with `.`

### Same-directory cases (rule 1)

- [ ] `src/foo.ts` → `src/bar.ts`: path is `'./foo'` (with `./`)
- [ ] `styles/_partial.scss` → `styles/main.scss`: `'./partial'` (`./` + underscore stripped)
- [ ] `assets/logo.png` → `assets/icon.gif` (paste-into-image — won't actually do anything; test the path computation only via `.css` destination): `cp assets/logo.png styles/local.png; copy styles/local.png; paste into styles/global.css` → `'./local.png'`. Cleanup.
- [ ] `pages/index.html` → `pages/about.html`: rejected by clause 2, but the path that WOULD be computed is `'./index.html'`. Verify via a non-rejected pair (e.g. add `cp src/sibling.js pages/local.js; copy local.js; paste into pages/index.html` → `<script src="./local.js">`. Cleanup.)

### Cross-directory cases (rule 2)

- [ ] `src/components/app-root.component.ts` → `src/bar.ts`:
  - `path.relative('src', 'src/components/app-root.component.ts')` ≈ `'components/app-root.component.ts'` (doesn't start with `.`)
  - **Expect:** path is `'./components/app-root.component'` (`./` prepended by rule 2)

- [ ] `src/foo.ts` → `src/components/app-root.component.ts`:
  - `path.relative('src/components', 'src/foo.ts')` ≈ `'../foo.ts'` (starts with `..`)
  - **Expect:** path is `'../foo'` (no `./` prepended — already starts with `.`)

### Multi-level traversal

- [ ] `assets/logo.png` → `src/components/app-root.component.ts`:
  - **Expect:** `'../../assets/logo.png'`

- [ ] `assets/logo.png` → `styles/_partials/_nested.scss` (paste an image into a deeply nested SCSS partial):
  - **Expect:** `'../../assets/logo.png'`

- [ ] `data/config.json` → `src/badge.jsx`:
  - **Expect:** `'../data/config.json'`

### Edge cases for the prefix rule

- [ ] **Single-level same-dir.** `src/foo.ts` → `src/bar.ts` → `'./foo'`. Both files have `path.parse(...).dir = '<...>/src'` (case-insensitive equal). ✓

- [ ] **Same-dir case difference (macOS/Windows).** Rename `src/Foo.ts` (uppercase) and paste into `src/bar.ts` while clipboard holds the lowercased version. Same-file check fires first — verify behavior, then rename back.

## SCSS partial filename normalization

`normalizePartialFilename` strips a leading `_` from the **last** path segment only.

- [ ] `styles/_partial.scss` → `styles/main.scss`: `'./partial'` (last segment `_partial` → `partial`)
- [ ] `styles/_variables.scss` → `styles/main.scss`: `'./variables'`
- [ ] `styles/secondary.scss` → `styles/main.scss`: `'./secondary'` (no underscore — unchanged)
- [ ] `styles/_partials/_nested.scss` → `styles/main.scss`: `'./_partials/nested'`
  - **Directory `_partials/` keeps its underscore** (only filename `_nested` stripped)

- [ ] **Filename without underscore in underscore-dir.** Create `echo "" > styles/_partials/foo.scss`. Copy → paste into `styles/main.scss`: `'./_partials/foo'`. Cleanup.

- [ ] **Multi-segment underscore.** Create `mkdir -p styles/_dir/_subdir; echo "" > styles/_dir/_subdir/_leaf.scss`. Copy → paste into `styles/main.scss`: `'./_dir/_subdir/leaf'` (only `_leaf` stripped, both directories keep `_`). Cleanup.

## Special characters in paths

### Spaces

- [ ] `my files/spaced.ts` → `src/bar.ts`:
  - **Expect:** `'../my files/spaced'` — space preserved literally.
  - Open the resulting file with the import inserted and verify VS Code resolves it (Cmd+Click on the path).

### Unicode

- [ ] Create `mkdir -p '日本'; echo "" > 日本/foo.ts`. Copy → paste into `src/bar.ts`:
  - **Expect:** `'../日本/foo'` — unicode preserved.
- [ ] Cleanup: `rm -rf 日本`.

### Special filename characters

- [ ] Test file with hyphen: `src/components/app-root.component.ts` (already exists). Path uses literal `-`: `'./components/app-root.component'`.
- [ ] Test file with double extension: `src/components/auth.module.ts`. Path: `'./components/auth.module'` (no extension preservation OFF).

## Cross-platform — Unix-style paths only

`toUnixPath` replaces `\` with `/`. On Windows, this matters; on macOS/Linux, paths are already `/`-separated.

- [ ] (macOS/Linux) verify every output path uses `/`, never `\`. Spot-check by reading the inserted import line.
- [ ] (Windows, if available) confirm same behavior — paths like `..\foo\bar` should NEVER appear in output.

## Same-directory comparison is case-insensitive

`areFilesInSameDirectory` compares `path.parse(...).dir.toLowerCase().trim()`.

On macOS (case-insensitive HFS/APFS): create `mkdir -p Src; echo "" > Src/upper.ts`. Both `src/foo.ts` and `Src/upper.ts` resolve to the same physical directory.
- [ ] Copy `Src/upper.ts` → paste into `src/foo.ts`. Path should be `'./upper'` (same-directory rule fires due to case-insensitive comparison).
- [ ] Cleanup: `rm -rf Src`.

(On Linux case-sensitive ext4: `Src/` and `src/` are genuinely different directories. The case-insensitive comparison there gives a false-positive — the path becomes `'./upper'` even though paths are different. This is documented intentional behavior aligned with macOS/Windows.)

## Path is always extension-stripped at this layer

`computeRelative` always strips the source extension. Per-language modules re-add it if needed (`preserveScriptFileExtension`, etc.).

- [ ] `src/foo.ts` → `src/bar.ts` (TS, preserve OFF): `'./foo'`
- [ ] Same with preserve ON: `'./foo.ts'` (re-added in `typescript.ts:buildSnippet`)
- [ ] `assets/logo.png` → `styles/main.scss` (image — `extractFileExtension` re-added in `scss.ts`): `'../assets/logo.png'`

## `removeFileExtension` quirk (documented unreachable)

- [ ] **Cannot reproduce in production.** This branch is gated by `extractFileExtension(filePath) === ''` returning empty `slice(0, -0)` = empty string. Only triggered if a path has no extension, which `computeRelative`'s caller never produces. Verify by skipping — documented.

## Sign-off

- [ ] Same-directory `./` (4 cases)
- [ ] Cross-directory `./` (2 cases)
- [ ] Multi-level traversal (3 cases)
- [ ] Edge cases for prefix (2 cases)
- [ ] SCSS partial normalization (6 cases)
- [ ] Spaces in paths
- [ ] Unicode in paths
- [ ] Special filename chars (2 cases)
- [ ] Forward slashes only
- [ ] Case-insensitive same-directory (1 case)
- [ ] Extension stripping at `computeRelative` layer (3 cases)

Tester / date: ___________________
