# Manual QA Suite — Auto Import Relative Path

A complete, sequential manual-QA pass for every code path in the extension. Walk the checklists in order, tick the boxes, sign off at the end.

## Why this exists

Three real bugs were fixed in `src/snippets/languages/scss.ts`, `src/snippets/languages/typescript.ts`, and `src/commands/copy-file-path.ts`. Before shipping, every code path is verified end-to-end — both the three fixes and every adjacent behavior they could have touched.

0.7.0 also replaced the two generic warning toasts (`Same file path.`, `Not supported.`) with **ten specific, parameterized notifications** (eight warning + two info) — see `src/editor/notification.ts` for the canonical text. Every test below quotes the *exact* expected toast string; testers should compare strings byte-for-byte, not just toast presence.

## How to run this

### What you need

- **Visual Studio Code** — download from [code.visualstudio.com](https://code.visualstudio.com/) if you don't have it.
- **The `.vsix` file** — the developer will send you a file like `auto-import-relative-path-0.7.0.vsix`. This is the extension package.
- **The test workspace** — the developer will also share the `qa/workspace/` folder (a set of ~174 pre-built fixture files the checklists test against).

### Install the extension

1. Open VS Code.
2. Press **Cmd+Shift+P** (macOS) or **Ctrl+Shift+P** (Windows / Linux) to open the Command Palette.
3. Type **Extensions: Install from VSIX…** and select it.
4. Browse to the `.vsix` file and click **Install**.
5. Click **Reload** when VS Code prompts you.

### Open the test workspace and start testing

1. **File → Open Folder…** → select the `qa/workspace/` folder you received. (Step-by-step in [`00-setup.md`](00-setup.md).)
2. Verify the extension is active: **Cmd/Ctrl+Shift+P** → type `Auto Import` — you should see three commands (`Copy File Path`, `Paste as Import`, `Insert Import from Selected File`).
3. **Walk files `01-…` → `21-…` in order.** Each file is self-contained: setup, tests, expected outcomes, optional "known limitations" callouts, and a per-file sign-off. Every path quoted in a checklist is **relative to the workspace root** (`src/foo.ts` means the `src/foo.ts` inside the workspace folder).
4. **Sign off** in the master matrix at the bottom of this README.

If a checkbox fails, do not proceed past that file. Reproduce the failure, capture the steps, then triage.

## Run order

| # | File | Why |
|---|------|-----|
| — | [`00-setup.md`](00-setup.md) | Open the pre-built fixture workspace in the EDH |
| 01 | [`01-sanity-and-keybindings.md`](01-sanity-and-keybindings.md) | If activation/keybindings are broken, nothing downstream is meaningful |
| 02 | [`02-bug-fix-verification.md`](02-bug-fix-verification.md) | Priority 1 — verify the 3 fixes from this session |
| 03 | [`03-copy-command.md`](03-copy-command.md) | Copy is the prerequisite for every Paste test |
| 04 | [`04-paste-into-javascript.md`](04-paste-into-javascript.md) | Each destination type, full source matrix |
| 05 | [`05-paste-into-typescript.md`](05-paste-into-typescript.md) | TS + Angular naming suite |
| 06 | [`06-paste-into-jsx.md`](06-paste-into-jsx.md) | React algorithm, primary-only |
| 07 | [`07-paste-into-tsx.md`](07-paste-into-tsx.md) | React algorithm with `.js` fallback |
| 08 | [`08-paste-into-css.md`](08-paste-into-css.md) | CSS @import + image url() |
| 09 | [`09-paste-into-scss.md`](09-paste-into-scss.md) | SCSS partial + `.css` preserve asymmetry |
| 10 | [`10-paste-into-html.md`](10-paste-into-html.md) | `<script>` / `<img>` / `<link>` |
| 11 | [`11-paste-into-markdown.md`](11-paste-into-markdown.md) | Markdown link + image (inline & reference) |
| 12 | [`12-auto-command.md`](12-auto-command.md) | Sequential copy+paste; verifies Bug #3 fix |
| 13 | [`13-settings-placement.md`](13-settings-placement.md) | Top/Bottom/Cursor + 2 forced-cursor overrides + Astro frontmatter + SFC script block + insertion column |
| 14 | [`14-settings-preserve-extension.md`](14-settings-preserve-extension.md) | Both preserve flags + SCSS `.css` asymmetry |
| 15 | [`15-gating-and-rejection.md`](15-gating-and-rejection.md) | All 11 gating clauses isolated |
| 16 | [`16-path-computation.md`](16-path-computation.md) | `./`, `../`, partials, spaces/unicode |
| 17 | [`17-edge-cases-and-regression.md`](17-edge-cases-and-regression.md) | Empty file, untitled, multi-root, stress, 0.6.1 regression |
| 18 | [`18-style-pickers.md`](18-style-pickers.md) | `pasteImportWithStyle` + `setDefaultImportStyle` — picker UX, persistence, hardcoded-destination rejection |
| 19 | [`19-drag-and-drop.md`](19-drag-and-drop.md) | DnD import via `DocumentDropEditProvider`; shared gating + placement |
| 20 | [`20-paste-into-mdx.md`](20-paste-into-mdx.md) | MDX destination — React algorithm (same as TSX) with full source matrix |
| 21 | [`21-paste-into-framework-components.md`](21-paste-into-framework-components.md) | Vue, Svelte, Astro destinations — framework-component algorithm |

## Fixtures

Live in [`../workspace/`](../workspace/) — see that folder's [`README.md`](../workspace/README.md) for the full layout (~174 files across `src/`, `styles/`, `pages/`, `docs/`, `assets/`, `data/`, plus edge-case roots `empty-file.ts`, `whitespace-only.ts`, `single-char.ts`, `comments-only.ts`, `with-imports.ts`, `with-requires.js`, `my files/spaced.ts`, `unicode-paths/`, `deeply/...`, `very-deep/...`, `unsupported/`).

The checklists below name files relative to that workspace root: when 04 says "copy `src/foo.ts`", it means `qa/workspace/src/foo.ts`. The 37 *baseline* filenames the checklists rely on are listed in the workspace README's "Maintenance notes" section — renaming any of those breaks a test.

### Files purpose-built for specific tests

| Fixture | Used by | What it tests |
|---------|---------|---------------|
| `with-imports.ts` | 13 | Bottom-placement landing after `import …` (script indicator) |
| `with-requires.js` | 13 | Bottom-placement landing after the three `require(…)` shapes |
| `styles/with-imports.css` | 13 | Bottom-placement landing after `@import '…'` (all 4 SCSS/CSS forms) |
| `styles/with-uses.scss` | 13 | Bottom-placement landing after `@use '…'` |
| `pages/with-resources.html` | 13 | Bottom-placement landing after existing `<script>`/`<link>`/`<img>` |
| `unsupported/Main.java` | 15 | Clause 1 — arbitrary unsupported-extension source |
| `unsupported/styles.less` | 15 | Clause 6 — close-to-supported but not in `SCSS_SUPPORTED_EXTENSIONS` |
| `unsupported/render.avi`, `archive.zip` | 15 | Binary unsupported sources |
| `unsupported/texture.bmp` | 06, 07, 15, 18 | Unsupported in JSX/TSX/MDX `_react.ts:default:` branch |
| `whitespace-only.ts`, `single-char.ts` | 17 | Degenerate file destinations |
| `empty-file.ts`, `comments-only.ts` | 13, 17 | Bottom-placement edge cases |
| `unicode-paths/日本語.ts`, `unicode-paths/café-menu.tsx` | 16 | Unicode in path computation |
| `deeply/nested/components/widgets/{deep-widget.tsx, deep-styles.scss}` | 16 | 4-level relative-path traversal |
| `very-deep/level-01/.../level-09/extreme-leaf.ts` | 17 | 9-level path stress |
| `my files/spaced.ts` | 03, 16 | Path containing a literal space |

## Settings under test (set/unset in the Extension Development Host)

All under `auto-import.*` (per `package.json:contributes.configuration`):

- `preferences.importStatementPlacement` — `Top` / `Bottom` / `Cursor`
- `importStatement.script.preserveScriptFileExtension` — bool
- `importStatement.script.javascriptImportStyle` — 7 enum values
- `importStatement.script.typescriptImportStyle` — 7 enum values
- `importStatement.styleSheet.preserveStylesheetFileExtension` — bool
- `importStatement.styleSheet.cssImportStyle` — 2 enum values
- `importStatement.styleSheet.cssImageImportStyle` — 1 (UI parity only — single shape)
- `importStatement.styleSheet.scssImportStyle` — 5 enum values
- `importStatement.styleSheet.scssImageImportStyle` — 1 (UI parity only)
- `importStatement.markup.htmlScriptImportStyle` — 5 enum values
- `importStatement.markup.htmlImageImportStyle` — 3 enum values
- `importStatement.markup.htmlVideoImportStyle` — 4 enum values
- `importStatement.markup.htmlAudioImportStyle` — 2 enum values
- `importStatement.markup.htmlStyleSheetImportStyle` — 1 (UI parity only)
- `importStatement.markup.markdownImportStyle` — 1 (UI parity only)
- `importStatement.markup.markdownImageImportStyle` — 3 enum values

## Skip these — confirmed design decisions, not bugs

These appear suspicious during testing but are documented intentional behaviour. Do not file them.

- **`.htm` extensions** are unsupported — only `.html`. (`src/types/file-extension.ts:HtmlFileExtension`)
- **Same-file rejection is case-insensitive on Linux.** Aligns with macOS/Windows behavior. (`src/commands/paste-import.ts:35`)
- **`removeFileExtension('foo')` returns `''`** (no-extension input). Unreachable in production; the `./` prefix regression test (CHANGELOG 0.6.1) was written against this behavior.
- **Empty/garbage clipboards fire `'empty-clipboard'` or `'no-extension'`** — `paste-import.ts` has two sequential guards: (1) empty/non-absolute → `'empty-clipboard'`; (2) absolute but no file extension → `'no-extension'`. Plain text, URLs, and numeric strings fire `'empty-clipboard'`; absolute paths without extensions (e.g. `/Users/me/Makefile`) fire `'no-extension'`.
- **`.jsx` → TSX/MDX uses the JavaScript fallback** — `.jsx` IS in the TSX/MDX fallback extension list (`_react.ts`); it produces a JS-style import, not a rejection. Only `.tsx → .jsx` is rejected (JSX has no fallback).

## Master sign-off

Tick when each file is fully passed.

- [ ] [01](01-sanity-and-keybindings.md) — Sanity & keybindings
- [ ] [02](02-bug-fix-verification.md) — Bug-fix verification (3 bugs)
- [ ] [03](03-copy-command.md) — Copy command
- [ ] [04](04-paste-into-javascript.md) — Paste into JavaScript
- [ ] [05](05-paste-into-typescript.md) — Paste into TypeScript (+ Angular)
- [ ] [06](06-paste-into-jsx.md) — Paste into JSX
- [ ] [07](07-paste-into-tsx.md) — Paste into TSX
- [ ] [08](08-paste-into-css.md) — Paste into CSS
- [ ] [09](09-paste-into-scss.md) — Paste into SCSS
- [ ] [10](10-paste-into-html.md) — Paste into HTML
- [ ] [11](11-paste-into-markdown.md) — Paste into Markdown
- [ ] [12](12-auto-command.md) — Auto command
- [ ] [13](13-settings-placement.md) — Placement settings
- [ ] [14](14-settings-preserve-extension.md) — Preserve-extension settings
- [ ] [15](15-gating-and-rejection.md) — Gating & rejection
- [ ] [16](16-path-computation.md) — Path computation
- [ ] [17](17-edge-cases-and-regression.md) — Edge cases & regression
- [ ] [18](18-style-pickers.md) — Style pickers (paste-with-style + set-default-style)
- [ ] [19](19-drag-and-drop.md) — Drag & drop
- [ ] [20](20-paste-into-mdx.md) — Paste into MDX
- [ ] [21](21-paste-into-framework-components.md) — Paste into framework components (Vue / Svelte / Astro)
