# Manual QA Suite — Auto Import Relative Path

A complete, sequential manual-QA pass for every code path in the extension. Walk the checklists in order, tick the boxes, sign off at the end.

## Why this exists

Four real bugs were fixed in `src/snippets/scss.ts`, `src/snippets/typescript.ts`, `src/snippets/javascript.ts`, and `src/commands/copy-file-path.ts`. Before shipping, every code path is verified end-to-end — both the four fixes and every adjacent behavior they could have touched.

0.7.0 also replaced the two generic warning toasts (`Same file path.`, `Not supported.`) with **seven specific, parameterized notifications** (six warning + one info) — see `src/editor/notification.ts` for the canonical text. Every test below quotes the *exact* expected toast string; testers should compare strings byte-for-byte, not just toast presence.

## How to run this

1. **Install:** `npm install` (root of the project).
2. **Compile:** `npm run compile` (must succeed before testing).
3. **Launch the Extension Development Host:** press **F5** in the main project's VS Code window. A second VS Code window opens with the extension loaded from `dist/extension.js`.
4. **Open the fixture workspace:** in the EDH window, **File → Open Folder…** → `<this-repo>/src/test/manual-qa-workspace/`. (Step-by-step in `00-setup.md`.) The fixtures are pre-built — you don't construct anything.
5. **Walk files `01-…` → `17-…` in order.** Each file is self-contained: setup, tests, expected outcomes, optional "known limitations" callouts, and a per-file sign-off. Every path quoted in a checklist is **relative to the workspace root** (`src/foo.ts` means `manual-qa-workspace/src/foo.ts`).
6. **Sign off** in the master matrix at the bottom of this README.

If a checkbox fails, do not proceed past that file. Reproduce the failure, capture the steps, then triage.

## Run order

| # | File | Why |
|---|------|-----|
| — | `00-setup.md` | Open the pre-built fixture workspace in the EDH |
| 01 | `01-sanity-and-keybindings.md` | If activation/keybindings are broken, nothing downstream is meaningful |
| 02 | `02-bug-fix-verification.md` | Priority 1 — verify the 4 fixes from this session |
| 03 | `03-copy-command.md` | Copy is the prerequisite for every Paste test |
| 04 | `04-paste-into-javascript.md` | Each destination type, full source matrix |
| 05 | `05-paste-into-typescript.md` | TS + Angular naming suite |
| 06 | `06-paste-into-jsx.md` | React algorithm, primary-only |
| 07 | `07-paste-into-tsx.md` | React algorithm with `.js` fallback |
| 08 | `08-paste-into-css.md` | CSS @import + image url() |
| 09 | `09-paste-into-scss.md` | SCSS partial + `.css` preserve asymmetry |
| 10 | `10-paste-into-html.md` | `<script>` / `<img>` / `<link>` |
| 11 | `11-paste-into-markdown.md` | Markdown link + image (inline & reference) |
| 12 | `12-auto-command.md` | Sequential copy+paste; verifies Bug #4 fix |
| 13 | `13-settings-placement.md` | Top/Bottom/Cursor + 3 overrides + insertion column |
| 14 | `14-settings-preserve-extension.md` | Both preserve flags + SCSS `.css` asymmetry |
| 15 | `15-gating-and-rejection.md` | All 8 gating clauses isolated |
| 16 | `16-path-computation.md` | `./`, `../`, partials, spaces/unicode |
| 17 | `17-edge-cases-and-regression.md` | Empty file, untitled, multi-root, stress, 0.6.1 regression |
| 18 | `18-style-pickers.md` | `pasteImportWithStyle` + `setDefaultImportStyle` — picker UX, persistence, hardcoded-destination rejection |

## Fixtures

Live in [`../manual-qa-workspace/`](../manual-qa-workspace/) — see that folder's `README.md` for the full layout (158 files across `src/`, `styles/`, `pages/`, `docs/`, `assets/`, `data/`, plus edge-case roots `empty-file.ts`, `whitespace-only.ts`, `single-char.ts`, `comments-only.ts`, `with-imports.ts`, `with-requires.js`, `my files/spaced.ts`, `unicode-paths/`, `deeply/...`, `very-deep/...`, `unsupported/`).

The checklists below name files relative to that workspace root: when 04 says "copy `src/foo.ts`", it means `manual-qa-workspace/src/foo.ts`. The 36 *baseline* filenames the checklists rely on are listed in the workspace README's "Maintenance notes" section — renaming any of those breaks a test.

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
| `unsupported/animation.mov`, `archive.zip` | 15 | Binary unsupported sources |
| `assets/icon.svg` | 06, 07, 15 | Unsupported in JSX/TSX/MDX `_shared.ts:default:` branch |
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
- `importStatement.script.javascriptImportStyle` — 9 enum values
- `importStatement.script.typescriptImportStyle` — 5 enum values
- `importStatement.styleSheet.preserveStylesheetFileExtension` — bool
- `importStatement.styleSheet.cssImportStyle` — 2 enum values
- `importStatement.styleSheet.cssImageImportStyle` — 1 (UI parity only — single shape)
- `importStatement.styleSheet.scssImportStyle` — 4 enum values
- `importStatement.styleSheet.scssImageImportStyle` — 1 (UI parity only)
- `importStatement.markup.htmlScriptImportStyle` — 1 (UI parity only)
- `importStatement.markup.htmlImageImportStyle` — 1 (UI parity only)
- `importStatement.markup.htmlStyleSheetImportStyle` — 1 (UI parity only)
- `importStatement.markup.markdownImportStyle` — 1 (UI parity only)
- `importStatement.markup.markdownImageImportStyle` — 2 enum values

## Skip these — confirmed design decisions, not bugs

These appear suspicious during testing but are documented intentional behaviour. Do not file them.

- **`.htm` extensions** are unsupported — only `.html`. (`src/types/file-extension.ts:HtmlFileExtension`)
- **Comments containing `import ` cause Bottom placement to land after the comment.** Heuristic, documented in `src/editor/insert-snippet.ts` module header.
- **Same-file rejection is case-insensitive on Linux.** Aligns with macOS/Windows behavior. (`src/commands/paste-import.ts:60`)
- **`removeFileExtension('foo')` returns `''`** (no-extension input). Unreachable in production; the `./` prefix regression test (CHANGELOG 0.6.1) was written against this behavior.
- **Empty/garbage clipboards fire the dedicated `empty-clipboard` toast** (`Auto Import: Clipboard does not contain a file path. Use Auto Import: Copy File Path on a source file first.`) — short-circuits before the same-file check via the absolute-path/has-extension guard in `src/commands/paste-import.ts:62`. Plain text, URLs, and numeric strings all land here, not on `not-supported`.
- **JSX→TSX cross-import asymmetry:** `.jsx` source does NOT have a fallback in TSX (only `.js` does). This is intentional — a `.jsx` source is a JavaScript-with-JSX file, and forcing a TSX import shape would be wrong.

## Master sign-off

Tick when each file is fully passed.

- [ ] 01 — Sanity & keybindings
- [ ] 02 — Bug-fix verification (4 bugs)
- [ ] 03 — Copy command
- [ ] 04 — Paste into JavaScript
- [ ] 05 — Paste into TypeScript (+ Angular)
- [ ] 06 — Paste into JSX
- [ ] 07 — Paste into TSX
- [ ] 08 — Paste into CSS
- [ ] 09 — Paste into SCSS
- [ ] 10 — Paste into HTML
- [ ] 11 — Paste into Markdown
- [ ] 12 — Auto command
- [ ] 13 — Placement settings
- [ ] 14 — Preserve-extension settings
- [ ] 15 — Gating & rejection
- [ ] 16 — Path computation
- [ ] 17 — Edge cases & regression
- [ ] 18 — Style pickers (paste-with-style + set-default-style)

**Tester:** ____________________
**Date:** ____________________
**Build:** `dist/extension.js` from commit ____________________
**Result:** ☐ PASS · ☐ FAIL (notes below)

### Failure notes
