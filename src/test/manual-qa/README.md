# Manual QA Suite — Auto Import Relative Path

A complete, sequential manual-QA pass for every code path in the extension. Walk the checklists in order, tick the boxes, sign off at the end.

## Why this exists

Four real bugs were fixed in `src/snippets/scss.ts`, `src/snippets/typescript.ts`, `src/snippets/javascript.ts`, and `src/commands/copy-file-path.ts`. Before shipping, every code path is verified end-to-end — both the four fixes and every adjacent behavior they could have touched.

## How to run this

1. **Install:** `npm install` (root of the project).
2. **Compile:** `npm run compile` (must succeed before testing).
3. **Build the fixture workspace:** follow `00-setup.md` exactly.
4. **Launch the Extension Development Host:** press **F5** in the main project's VS Code window. A second VS Code window opens with the extension loaded from `dist/extension.js`.
5. **Open the fixture workspace** in the Extension Development Host.
6. **Walk files `01-…` → `17-…` in order.** Each file is self-contained: setup, tests, expected outcomes, optional "known limitations" callouts, and a per-file sign-off.
7. **Sign off** in the master matrix at the bottom of this README.

If a checkbox fails, do not proceed past that file. Reproduce the failure, capture the steps, then triage.

## Run order

| # | File | Why |
|---|------|-----|
| — | `00-setup.md` | Build the fixture workspace once before anything else |
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

## Fixture map (built in `00-setup.md`)

```
test-workspace/
├── src/
│   ├── foo.ts, bar.ts, helpers.ts
│   ├── sibling.js, other.js
│   ├── widget.tsx, badge.jsx
│   └── components/
│       ├── app-root.component.ts
│       ├── auth.module.ts
│       ├── highlight.directive.ts
│       ├── trim.pipe.ts
│       └── user.service.ts
├── styles/
│   ├── main.scss, secondary.scss
│   ├── _partial.scss, _variables.scss
│   ├── global.css, reset.css
│   └── _partials/
│       └── _nested.scss
├── pages/
│   ├── index.html, about.html
├── docs/
│   ├── README.md, guide.md
├── assets/
│   ├── logo.png, icon.gif, photo.jpeg, photo.jpg, thumb.webp
│   └── font.woff2, regular.ttf
├── data/
│   ├── config.json, config.yaml, locale.yml
├── empty-file.ts                (0 bytes)
├── comments-only.ts             (only `//` and `/* */`)
└── my files/                    (directory with a space)
    └── spaced.ts
```

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
- **Empty clipboard reads as `''` and matches `''`** in same-file check → "Same file path." toast. The catch-all is acceptable.
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

**Tester:** ____________________
**Date:** ____________________
**Build:** `dist/extension.js` from commit ____________________
**Result:** ☐ PASS · ☐ FAIL (notes below)

### Failure notes
