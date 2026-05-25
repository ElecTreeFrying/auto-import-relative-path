# 18 — Style pickers (`extension.pasteImportWithStyle` + `extension.setDefaultImportStyle`)

Validates the two QuickPick-driven commands. Both share the gating in 15 and the variant aggregator in `src/snippets/variants.ts`; each shows the **same picker items** for the same source/destination pair. They differ only in the post-pick action: `pasteImportWithStyle` inserts a one-shot snippet without touching settings; `setDefaultImportStyle` persists the choice to user settings (`vscode.ConfigurationTarget.Global`) and inserts nothing.

**Sources:**
- `src/commands/paste-import-with-style.ts` — pick → insert
- `src/commands/set-default-import-style.ts` — pick → persist
- `src/snippets/variants.ts` — `buildImportSnippetVariants` (the shared aggregator) and the `setting?` metadata on each styled variant
- `src/config/settings.ts` — `setAutoImportSetting`
- `src/editor/notification.ts` — `'no-configurable-style'`, `'default-style-saved'`

## Setup

- 00-setup.md complete; 01-sanity passed; 03-copy passed (copy is the prerequisite)
- `placement = Bottom` (default)
- `javascriptImportStyle = import name from '_relativePath_';` (the JS default)
- `typescriptImportStyle = import { name } from '_relativePath_';` (the TS default)
- `cssImportStyle = @import '_relativePath_';`
- `scssImportStyle = @import '_relativePath_';`
- `markdownImageImportStyle = ![alt-text](_relativePath_ "Hover text")`
- `preserveScriptFileExtension = false`
- `preserveStylesheetFileExtension = false`

Reset all five styled settings to their defaults before this file. Tests below mutate `*ImportStyle` settings — restore defaults at the end so 19-… (if any) starts clean.

### Label vs insertion convention

The picker shows the path as a **basename** (`'foo'`, `'widget'`, `'logo.png'`) — never the full relative path — to keep labels short and width-stable across nesting depth. The actual *inserted* snippet uses the real relative path (`'./foo'`, `'../components/widget'`, `'../assets/logo.png'`), regardless of what the label showed. So when a test below says "pick `import name from 'foo';`", the user sees that label in the picker but `import { name } from './foo';` (or whatever the real path is) gets inserted. The persisted-setting value (used by `setDefaultImportStyle`) is the byte-exact template from `package.json:enum` — `import name from '_relativePath_';` etc. — independent of label rendering.

## Discovery

- [ ] **Command Palette — `pasteImportWithStyle`.** Open `src/bar.ts`. Copy `src/foo.ts`. `Cmd/Ctrl+Shift+P` → type `Auto Import` → confirm `Auto Import: Paste as Import (Pick Style)` is listed. Run it. **Expect:** QuickPick opens.
- [ ] **Command Palette — `setDefaultImportStyle`.** Same setup. `Cmd/Ctrl+Shift+P` → confirm `Auto Import: Set Default Import Style` is listed. Run it. **Expect:** QuickPick opens with the **same items** as the previous step.
- [ ] **Toast button — `Paste with Style`.** Copy `src/foo.ts`. The info toast `Auto Import: Copied path — foo.ts` shows two buttons: **Paste with Style** and **Paste Now**. With `src/bar.ts` open, click **Paste with Style**. **Expect:** picker opens (same as Palette flow). `setDefaultImportStyle` has **no** toast button — Palette only.

## Picker items match across the two commands

For each pair below, run **both** commands back-to-back without changing the source/destination, and confirm the QuickPick lists are identical (same labels, same `description` tags, same order). Cancel with Esc each time so settings don't drift.

- [ ] `.ts → .ts`: copy `src/foo.ts`, focus `src/bar.ts`. **Expect:** 5 items, top entry `import name from 'foo';` (TS default-import shape — note basename, not `'./foo'`).
- [ ] `.js → .js`: copy `src/sibling.js`, focus a `.js` file (`with-requires.js`). **Expect:** 9 items, top entry `import name from 'sibling';` (basename only).
- [ ] `.css → .css`: copy `styles/global.css`, focus `styles/main.css` (or another `.css`). **Expect:** 2 items: `@import 'global.css';` and `@import url('global.css');` (basename includes `.css` since stylesheets always preserve the extension on the path).
- [ ] `.scss → .scss`: copy `styles/_partial.scss`, focus `styles/main.scss`. **Expect:** 4 items, all rendering the partial as `'partial'` (leading `_` stripped *and* basename collapsed): `@import 'partial';`, `@import url('partial');`, `@use 'partial';`, `@use 'partial' as *;`.
- [ ] `.png → .md`: copy `assets/logo.png`, focus `docs/README.md` (Markdown image branch). **Expect:** 2 items — inline `![alt-text](logo.png "Hover text")` and reference-style `![alt-text][image] / [image]: logo.png "Hover text"`.
- [ ] **Same picker, same items.** For one of the pairs above, run `pasteImportWithStyle`, scroll the items, then Esc. Immediately run `setDefaultImportStyle`. **Expect:** the lists scroll identically.

## `setDefaultImportStyle` — current-default indicator

The `setDefaultImportStyle` picker reorders the variant matching the persisted setting to position 0 and appends `$(check) Current default` to its description (VS Code renders `$(check)` as a checkmark icon). `pasteImportWithStyle` does **not** reorder or mark — it always renders variants in their natural table order.

- [ ] **Default TS shape is first and marked.** Reset `typescriptImportStyle` to `import { name } from '_relativePath_';` (the package.json default). `.ts → .ts` setup (copy `src/foo.ts`, focus `src/bar.ts`). Run `setDefaultImportStyle`. **Expect:**
  - Top item (position 0) has label `import { name } from 'foo';` (basename).
  - Top item's description ends with a checkmark icon and the text `Current default`.
  - The other 4 TS variants follow in their natural `_styles.ts` order.
  - Esc to close — no setting change.
- [ ] **Default JS shape is first and marked.** Reset `javascriptImportStyle` to `import name from '_relativePath_';`. `.js → .js` setup. Run. **Expect:** top item label `import name from 'sibling';` (basename) with the checkmark indicator on its description; remaining 8 JS variants follow.
- [ ] **Indicator follows the persisted value.** With `.ts → .ts` setup, run `setDefaultImportStyle`, pick the entry labeled `import * as name from 'foo';` (namespace import). The toast confirms save with `import * as name from '_relativePath_';` (the *template*, not the basename). Run `setDefaultImportStyle` again. **Expect:** the namespace shape (`import * as name from 'foo';`) is now at position 0 with the `$(check) Current default` indicator. The previous default (`import { name } from 'foo';`) drops back into its natural-order slot without an indicator. Esc to close.
- [ ] **`pasteImportWithStyle` does NOT reorder.** With the namespace shape persisted (from the previous test), `.ts → .ts` setup. Run `pasteImportWithStyle`. **Expect:** items render in their natural order — top item is the default-import shape (`import name from 'foo';`), not the namespace shape. **No** `$(check) Current default` indicator on any item. The pick-style command is style-agnostic about the persisted setting.
- [ ] **Indicator survives across destination kinds.** With CSS default `@import '_relativePath_';` set, `.css → .css` setup. Run `setDefaultImportStyle`. **Expect:** top item is the quoted-path `@import 'global.css';` with the indicator; the `url()` variant `@import url('global.css');` is second without indicator.
- [ ] **No-match graceful fallback.** Open `settings.json` directly and set `auto-import.importStatement.script.typescriptImportStyle` to a typo'd value (e.g. `import name from'_relativePath_'` — missing space). `.ts → .ts` setup. Run `setDefaultImportStyle`. **Expect:** picker opens in natural order, no `$(check) Current default` indicator on any item. Picking any valid entry restores the setting to a known shape. Restore the default after.

After this section: restore `typescriptImportStyle`, `javascriptImportStyle`, `cssImportStyle` to their package.json defaults before continuing.

## `pasteImportWithStyle` — one-shot insert

- [ ] **Pick the destructured shape.** `.ts → .ts` setup (copy `src/foo.ts`, focus `src/bar.ts`). Run `pasteImportWithStyle`, pick the entry labeled `import { name } from 'foo';`. **Expect:** `import { name } from './foo';` inserted (full relative path, not basename). **The persisted `typescriptImportStyle` setting is unchanged** (verify via `Cmd/Ctrl+,` → search `typescriptImportStyle` → still default).
- [ ] **Pick the namespace shape.** Same setup. Run again, pick the entry labeled `import * as name from 'foo';`. **Expect:** `import * as name from './foo';` inserted. Setting still unchanged.
- [ ] **Pick a CommonJS shape (JS).** `.js → .js` setup. Run, pick the entry labeled `const name = require('sibling');`. **Expect:** `const name = require('./sibling');` inserted; `javascriptImportStyle` setting still the default.
- [ ] **Deeply nested source.** Open `src/widget.tsx`, copy `deeply/nested/components/widgets/deep-widget.tsx`. Run `pasteImportWithStyle`. **Expect:** picker labels read `import name from 'deep-widget';` (basename, not `'../../deeply/nested/components/widgets/deep-widget'`) — confirms width stays bounded. Pick any shape; the inserted snippet uses the full relative path.
- [ ] **Cancel with Esc.** Run, scroll a couple of items, press Esc. **Expect:** no insertion, no toast, settings unchanged.

### Single-variant fast path (no picker shown)

For these source/destination pairs, the picker short-circuits and inserts directly — same UX as `Cmd/Ctrl+I`.

- [ ] **HTML destination.** Copy `src/foo.ts`, focus `pages/index.html` (cursor on a blank line inside `<body>`). Run `pasteImportWithStyle`. **Expect:** `<script type="text/javascript" src="../src/foo.ts"></script>` inserted; **no picker shown**.
- [ ] **HTML image destination.** Copy `assets/logo.png`, focus `pages/index.html`. Run. **Expect:** `<img src="../assets/logo.png" alt="sample">` inserted; no picker.
- [ ] **CSS image (url).** Copy `assets/logo.png`, focus `styles/main.css` (cursor on a blank line). Run. **Expect:** `url('../assets/logo.png')` inserted; no picker.
- [ ] **SCSS image (reuses CSS url).** Copy `assets/logo.png`, focus `styles/main.scss`. Run. **Expect:** `url('../assets/logo.png')` inserted; no picker.
- [ ] **JSX non-script (image).** Copy `assets/logo.png`, focus `src/badge.jsx`. Run. **Expect:** `import ${1:name} from '../assets/logo.png';` inserted; no picker.
- [ ] **TSX non-script (font).** Copy any `.woff`/`.woff2`/`.ttf`/`.eot` fixture if available, focus `src/widget.tsx`. Run. **Expect:** `import '<path>';` (side-effect) inserted; no picker.
- [ ] **Markdown text source.** Copy `docs/README.md`, focus another `.md`. Run. **Expect:** `[text](<path>)` inserted; no picker.

## `setDefaultImportStyle` — persists, never inserts

For each test, **verify the editor body is unchanged** and the persisted setting at `Cmd/Ctrl+,` matches the picked entry's `description` byte-for-byte. The command **never inserts a snippet** — only updates settings.

### Styled — happy paths (each updates exactly one setting)

- [ ] **TypeScript default-import.** Copy `src/foo.ts`, focus `src/bar.ts`. Run `setDefaultImportStyle`, pick `import name from '_relativePath_';`. **Expect:**
  - Info toast `Auto Import: Default style saved — import name from '_relativePath_';`
  - `bar.ts` body unchanged (no insertion).
  - Settings → search `typescriptImportStyle` → globally set to `import name from '_relativePath_';`.
  - **Round-trip:** Now press `Cmd/Ctrl+I` (the default `pasteImport`). **Expect:** `import name from './foo';` inserted, using the freshly persisted shape.
- [ ] **TypeScript namespace.** Repeat with `import * as name from '_relativePath_';`. **Expect:** setting flips; round-trip emits namespace shape.
- [ ] **JavaScript const-require.** `.js → .js` setup. Pick `const name = require('_relativePath_');`. **Expect:** `javascriptImportStyle` set globally; round-trip with `Cmd/Ctrl+I` emits `const name = require('<path>');`.
- [ ] **JSX uses JS table.** Copy `src/sibling.js`, focus `src/badge.jsx`. Run, pick any JS shape. **Expect:** `javascriptImportStyle` (not TS) is updated. JSX always reads JS table for `.js`/`.jsx` sources.
- [ ] **TSX `.js` source falls back to JS.** Copy `src/sibling.js`, focus `src/widget.tsx`. Run, pick `import { name } from '_relativePath_';`. **Expect:** `javascriptImportStyle` is updated (not TS) — TSX falls back to JS for `.js` sources per `buildTsxVariants`.
- [ ] **TSX `.ts` source uses TS.** Copy `src/foo.ts`, focus `src/widget.tsx`. Run, pick any TS shape. **Expect:** `typescriptImportStyle` updated.
- [ ] **CSS `@import url(`.** Copy `styles/global.css`, focus another `.css` file. Pick `@import url('_relativePath_');`. **Expect:** `cssImportStyle` set globally.
- [ ] **SCSS `@use as *`.** Copy `styles/_partial.scss`, focus `styles/main.scss`. Pick `@use '_relativePath_' as *;`. **Expect:** `scssImportStyle` set globally.
- [ ] **Markdown image reference style.** Copy `assets/logo.png`, focus `docs/README.md`. Pick `![alt-text][image] / [image]: _relativePath_ "Hover text"`. **Expect:** `markdownImageImportStyle` set globally.

### Esc cancels — settings untouched

- [ ] **Cancel mid-pick.** `.ts → .ts` setup. Run `setDefaultImportStyle`, scroll, press Esc. **Expect:** no toast, no setting change, no insertion.

### Hardcoded destinations — `'no-configurable-style'` rejection

These hit the `variants[0].setting === undefined` branch in `set-default-import-style.ts:99`. The matching `*ImportStyle` settings exist in `package.json` for UI parity only and are never read at runtime. **No setting is mutated**, no snippet is inserted.

- [ ] **HTML destination, script source.** Copy `src/foo.ts`, focus `pages/index.html`. Run `setDefaultImportStyle`. **Expect:** warning toast `Auto Import: No configurable style for .ts → .html files.` Settings unchanged. Editor unchanged.
- [ ] **HTML, image source.** Copy `assets/logo.png`, focus `pages/index.html`. Run. **Expect:** `Auto Import: No configurable style for .png → .html files.`
- [ ] **HTML, stylesheet source.** Copy `styles/global.css`, focus `pages/index.html`. **Expect:** `Auto Import: No configurable style for .css → .html files.`
- [ ] **Markdown text.** Copy `docs/README.md`, focus another `.md`. **Expect:** `Auto Import: No configurable style for .md → .md files.`
- [ ] **CSS image.** Copy `assets/logo.png`, focus `styles/main.css`. **Expect:** `Auto Import: No configurable style for .png → .css files.`
- [ ] **SCSS image.** Copy `assets/logo.png`, focus `styles/main.scss`. **Expect:** `Auto Import: No configurable style for .png → .scss files.`
- [ ] **JSX non-script (image).** Copy `assets/logo.png`, focus `src/badge.jsx`. **Expect:** `Auto Import: No configurable style for .png → .jsx files.`
- [ ] **TSX non-script (json).** Copy `data/config.json`, focus `src/widget.tsx`. **Expect:** `Auto Import: No configurable style for .json → .tsx files.`

## Gating mirrors `paste-import.ts` (both commands)

Same checks file 15 covers, re-applied here against the picker commands. Both should reject identically.

- [ ] **No active editor.** Close all editors. From the Palette run `pasteImportWithStyle`. **Expect:** warning toast `Auto Import: Open a file to paste an import.` Repeat with `setDefaultImportStyle` — same toast.
- [ ] **Empty clipboard.** Copy plain text (`Hello world`) externally. Open `src/bar.ts`. Run each command. **Expect:** `Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.`
- [ ] **Same source/destination.** Open `src/foo.ts`, copy `src/foo.ts` itself. Run each command. **Expect:** `Auto Import: A file cannot import itself.`
- [ ] **Source deleted between copy and run.** Copy `src/foo.ts`. Delete the file (rename works too). Run each command. **Expect:** `Auto Import: Source file no longer exists: foo.ts.`
- [ ] **Disallowed pair (`.html → .ts`).** Copy `pages/index.html`, focus `src/bar.ts`. Run each command. **Expect:** `Auto Import: Cannot import .html into .ts files.` (clause 1 — `.ts` not in `CROSS_IMPORT_DESTINATIONS` and source ≠ destination).
- [ ] **`.html → .html` (clause 2).** Copy any `.html`, focus another `.html`. **Expect:** `Auto Import: Cannot import .html into .html files.`
- [ ] **`.bmp → .jsx` (JSX `_react.ts:default:`).** Copy `unsupported/texture.bmp`, focus `src/badge.jsx`. Run each command. **Expect:** `Auto Import: Cannot import .bmp into .jsx files.` (`isEmptyVariantSet` short-circuits to `'not-supported'`).

## `clearNotifications()` runs first

- [ ] **Prior toast dismissed.** Trigger any prior warning toast (e.g. run `pasteImport` with empty clipboard). Without dismissing it, set up a valid pair and run `pasteImportWithStyle`. **Expect:** prior toast dismissed before the picker opens. Repeat with `setDefaultImportStyle`.

## Settings restore

After running this file, restore the defaults from the Setup block (TS default = `import { name } from '_relativePath_';`, JS default = `import name from '_relativePath_';`, CSS = `@import '_relativePath_';`, SCSS = `@import '_relativePath_';`, Markdown image = inline shape). The `setDefaultImportStyle` happy-path tests above leave several settings flipped.

## Known limitations / not bugs

- The `*ImportStyle` settings declared "Currently unused" in `src/snippets/_styles.ts` (`cssImageImportStyle`, three `html*ImportStyle`, `markdownImportStyle`, `scssImageImportStyle`) appear in VS Code's settings UI but are not read at runtime. `setDefaultImportStyle` never lets the user write to these — the matching destinations all hit `'no-configurable-style'` per the hardcoded section above. This is **by design**: the package.json declarations exist for UI parity only and these shapes are hardcoded in `html.ts` / `markdown.ts` / `css.ts:buildCssImageImportSnippet`.
- Cancellation (Esc) is silent for both commands — no "cancelled" toast. Matches the pattern of every other QuickPick in VS Code.
- `pasteImportWithStyle` shows no picker for single-variant destinations — it inserts directly. This matches `Cmd/Ctrl+I`'s UX so users don't see a 1-item picker that has no real choice.

## Sign-off

- [ ] Discovery (3 cases) — both commands listed; toast button only on `pasteImportWithStyle`
- [ ] Picker items match across both commands (6 source/destination pairs)
- [ ] Current-default indicator (6 cases) — `setDefaultImportStyle` reorders matching variant to top + adds `$(check) Current default` to description; `pasteImportWithStyle` does not; no-match falls back gracefully
- [ ] `pasteImportWithStyle` one-shot insert (3 styled cases + Esc + 7 single-variant fast-path destinations)
- [ ] `setDefaultImportStyle` persists styled choices (9 happy paths) — settings flip, editor unchanged, round-trip with `Cmd/Ctrl+I` confirms
- [ ] `setDefaultImportStyle` Esc cancels cleanly
- [ ] `'no-configurable-style'` toast for 8 hardcoded destinations — no setting mutated
- [ ] Gating rejection text matches paste-import for 7 cases
- [ ] `clearNotifications()` runs first for both commands
- [ ] Defaults restored before next file

Tester / date: ___________________
