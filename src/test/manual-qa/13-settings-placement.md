# 13 — Placement settings

Validates `auto-import.preferences.importStatementPlacement`, the three forced-cursor overrides, the insertion-column rule, and the 12-marker Bottom heuristic.

**Sources:**
- `src/editor/insert-snippet.ts` — `insertImportSnippet`, `shouldRepositionCursor`, `insertSnippetAtBottom`, `determineInsertionColumn`
- `src/constants/extensions.ts` — `SCRIPT_FILE_EXTENSIONS`, `STYLESHEET_FILE_EXTENSIONS`
- `package.json` — enum: `Top`, `Bottom`, `Cursor`

## Setup

- 00-setup.md complete
- Default: `typescriptImportStyle = import { name } from '_relativePath_';`, `preserveScriptFileExtension = false`

## Three placement values — base behavior

For all three tests, copy `src/foo.ts` → paste into `src/bar.ts`. Place cursor at line 5 of `bar.ts` first.

### `Top`
- [ ] Set `placement = Top`. Paste.
  **Expect:** snippet at **line 0**.

### `Bottom`
- [ ] Set `placement = Bottom`. Paste into a `bar.ts` that has at least one existing `import …` line.
  **Expect:** snippet on the line **after** the last import.
- [ ] Empty `bar.ts` (delete its content). Set `placement = Bottom`. Paste.
  **Expect:** snippet at line 0 (no markers found, falls through to 0).

### `Cursor`
- [ ] Set `placement = Cursor`. Cursor at line 5. Paste.
  **Expect:** snippet at **line 5**.

### Default (unset)
- [ ] In settings.json, delete `auto-import.preferences.importStatementPlacement`.
- [ ] Reload window.
  **Expect:** falls back to package.json default = `Bottom`.

### Invalid enum value
- [ ] In settings.json, set the value to `Middle` (invalid). Reload.
  **Expect:** code path goes to `default:` branch in `insertImportSnippet`'s switch → cursor placement (the `default:` falls through to `insertSnippetAtCursor`).

## Forced-cursor overrides — three paths

`shouldRepositionCursor` returns `true` (overriding any user setting) when:
1. Destination is `.html`
2. Destination is `.md`
3. Destination is `.css` and source is NOT `.css`
4. Destination is `.scss` and source is NOT `.scss`

### Override #1 — HTML destination

- [ ] Set `placement = Top`. Cursor at line 5 of `pages/index.html`. Copy `src/sibling.js` → paste.
  **Expect:** `<script>` at line 5 (cursor), NOT line 0 (Top).
- [ ] Same with `placement = Bottom` → still cursor.

### Override #2 — Markdown destination

- [ ] Set `placement = Top`. Cursor at line 5 of `docs/README.md`. Copy `assets/logo.png` → paste.
  **Expect:** image snippet at line 5.

### Override #3 — Stylesheet + non-stylesheet source

- [ ] Set `placement = Top`. Cursor at line 5 of `styles/main.scss`. Copy `assets/logo.png` → paste.
  **Expect:** `url(...)` at line 5 (override fires because `.png ≠ .scss`).

- [ ] Set `placement = Top`. Cursor at line 5 of `styles/main.scss`. Copy `styles/global.css` → paste.
  **Expect:** `@import` at line 5 (override fires because `.css ≠ .scss`).

- [ ] Set `placement = Top`. Cursor at line 5 of `styles/main.scss`. Copy `styles/_partial.scss` → paste.
  **Expect:** `@import` at line 0 (no override — `.scss = .scss`).

- [ ] Set `placement = Top`. Cursor at line 5 of `styles/global.css`. Copy `assets/logo.png` → paste.
  **Expect:** `url(...)` at line 5 (override: `.png ≠ .css`).

- [ ] Set `placement = Top`. Cursor at line 5 of `styles/global.css`. Copy `styles/reset.css` → paste.
  **Expect:** `@import` at line 0 (no override — `.css = .css`).

## Insertion column rule

`determineInsertionColumn` returns `0` for `SCRIPT_FILE_EXTENSIONS` (`.ts/.tsx/.js/.jsx`) and `STYLESHEET_FILE_EXTENSIONS` (`.css/.scss`); otherwise returns the cursor's column.

### Column 0 — script destinations

For each, set `placement = Cursor`. Place cursor at column 10 (10 leading spaces) of an empty line. Paste.

- [ ] `.ts` destination → snippet at column 0 (NOT column 10)
- [ ] `.tsx` destination → column 0
- [ ] `.js` destination → column 0
- [ ] `.jsx` destination → column 0

### Column 0 — stylesheet destinations

- [ ] `.css` destination → column 0
- [ ] `.scss` destination → column 0

### Cursor column — markup destinations

- [ ] `.html` destination → snippet at column 10 (cursor's column)
- [ ] `.md` destination → snippet at column 10

## Bottom-placement marker detection — all 12 indicators

The `importIndicators` array in `insertSnippetAtBottom`:

```
'import ', 'var name = require(', 'const name = require(', 'require(',
"@import '", '@import "', '@import url(', '@import (', "@use '", '@use "',
"@forward '", '@forward "'
```

Set `placement = Bottom`. The workspace ships purpose-built fixtures whose first lines exercise every indicator — no editing needed.

### Script indicators — `with-imports.ts` and `with-requires.js`

`with-imports.ts` contains existing `import …` lines; `with-requires.js` contains `var name = require(…)`, `const name = require(…)`, and `require(…)` (side-effect) — covering all four script indicators in one file each.

- [ ] **`with-imports.ts` (covers `import `).** Open `with-imports.ts`. Copy `src/foo.ts` from Explorer. Paste.
  **Expect:** new import lands AFTER the file's last `import …` line.
- [ ] **`with-requires.js` (covers `var require(`, `const require(`, and bare `require(`).** Open `with-requires.js`. Copy `src/sibling.js`. Paste.
  **Expect:** new import lands AFTER the file's last require-style line (whichever comes last — Bottom picks the LAST match).

### Stylesheet indicators — `styles/with-imports.css` and `styles/with-uses.scss`

`with-imports.css` covers all four `@import …` shapes. `with-uses.scss` covers both `@use '…'` and `@use "…"` plus `@import` for completeness.

- [ ] **`styles/with-imports.css` (covers `@import '`, `@import "`, `@import url(`, `@import (`).** Open it. Copy `styles/reset.css`. Paste.
  **Expect:** new `@import` lands AFTER the file's last `@import …` line.
- [ ] **`styles/with-uses.scss` (covers `@use '`, `@use "`, plus existing `@import`).** Open it. Copy `styles/_partial.scss`. Paste.
  **Expect:** new `@use`/`@import` lands AFTER the file's last `@use`/`@import` line.

### HTML — Bottom is overridden to Cursor

`.html` destinations *always* force cursor placement, so Bottom is meaningless there. `pages/with-resources.html` exists for the cursor-placement-around-resources test, not Bottom:

- [ ] **Cursor lands after existing resources.** Open `pages/with-resources.html`. Place cursor on a blank line below the existing `<script>`/`<link>`/`<img>` block. Copy `src/sibling.js`. Paste.
  **Expect:** `<script type="text/javascript" src="…">` inserted at the cursor (the override fires regardless of `placement`).

### Multiple existing imports — picks the LAST

`with-imports.ts` already has multiple `import …` lines plus a non-import line between them.

- [ ] Verify the new import lands AFTER the *last* `import` line (not the first). Bottom matches the last marker, not the first.

### No markers → line 0

- [ ] Empty destination: paste into `empty-file.ts`. **Expect:** line 0.
- [ ] No-marker destination: paste into `single-char.ts` (one byte, no markers). **Expect:** line 0.

### Documented heuristic false-positive

`comments-only.ts` is purpose-built for this: it contains a comment with the substring `import ` inside, plus pure block comments.

- [ ] **`comments-only.ts` Bottom landing.** Open it. Paste any valid TS source. **Expect:** new import lands AFTER the line `// I want to import bar later` (the heuristic matches the literal substring inside the comment). **Documented heuristic limitation, not a bug** — see `src/editor/insert-snippet.ts` module header.

## Per-language snippet column behavior

When inserting at line N (any placement), the column is computed once for the whole snippet.

- [ ] `Cursor` placement, multi-line snippet (none of ours are multi-line, but verify via SCSS @use): snippet is single-line, no issue.

## Edge cases

- [ ] **Setting changed mid-flight.** Open `bar.ts`. Run Paste with `placement = Top`. Now change to `Bottom`. Run Paste again.
  **Expect:** second insert at Bottom. No reload required.

- [ ] **Different destinations have different rules.** Test in same session: paste into `.ts` (column 0) then paste into `.html` (cursor column). Both behave correctly without restart.

## Sign-off

- [ ] Three placement values + default + invalid enum
- [ ] Override #1 (HTML)
- [ ] Override #2 (Markdown)
- [ ] Override #3 (stylesheet + non-stylesheet source — 5 cases)
- [ ] Insertion column for 4 script types + 2 stylesheet types
- [ ] Insertion column for HTML + MD
- [ ] All 12 Bottom-marker indicators (verified via `with-imports.ts`, `with-requires.js`, `styles/with-imports.css`, `styles/with-uses.scss`)
- [ ] HTML cursor override around existing resources (`pages/with-resources.html`)
- [ ] Multiple imports → picks last
- [ ] No markers → line 0 (2 cases via `empty-file.ts`, `single-char.ts`)
- [ ] Heuristic false-positive documented (`comments-only.ts`)
- [ ] Mid-flight setting change

Tester / date: ___________________
