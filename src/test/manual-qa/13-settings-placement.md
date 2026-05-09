# 13 — Placement settings

Validates `auto-import.preferences.importStatementPlacement`, the three forced-cursor overrides, the insertion-column rule, and the 10-marker Bottom heuristic.

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

## Bottom-placement marker detection — all 10 indicators

The `importIndicators` array in `insertSnippetAtBottom`:

```
'import ', 'var name = require(', 'const name = require(', 'require(',
"@import '", '@import "', '@import url(', '@import (', "@use '", '@use "'
```

Set `placement = Bottom`. For each indicator, prepare a destination file containing that line, then paste a new import. Verify it lands AFTER the existing line.

### Script indicators

Create test fixtures or reuse existing files. Insert these as the first line of `src/bar.ts` (overwriting), then paste `src/foo.ts`:

- [ ] `import foo from './foo';` → new import at line 1 ✓
- [ ] `var name = require('./x');` → new import at line 1 ✓
- [ ] `const name = require('./x');` → new import at line 1 ✓
- [ ] `require('./side-effect');` → new import at line 1 ✓

### Stylesheet indicators

In `styles/main.scss`, place each as line 0:

- [ ] `@import 'foo';` (single quotes) → new import at line 1 ✓
- [ ] `@import "foo";` (double quotes) → at line 1 ✓
- [ ] `@import url(foo);` → at line 1 ✓
- [ ] `@import (reference) "foo";` → at line 1 ✓ (matches `@import (` prefix)
- [ ] `@use 'foo';` (single) → at line 1 ✓
- [ ] `@use "foo";` (double) → at line 1 ✓

### Multiple existing imports — picks the LAST

- [ ] `bar.ts` content:
  ```ts
  import a from './a';
  import b from './b';
  // some other code
  import c from './c';
  ```
  Paste a new import.
  **Expect:** lands AFTER line 3 (the `import c` line, which is the last `import ` match), at line 4.

### No markers → line 0

- [ ] Empty `bar.ts`. Paste. **Expect:** line 0.
- [ ] `bar.ts` with only non-import code (`const x = 1;`). Paste. **Expect:** line 0.

### Documented heuristic false-positive

- [ ] `bar.ts` content:
  ```ts
  // I want to import bar later
  const x = 1;
  ```
  Paste. **Expect:** new import lands AFTER the comment line (matches the substring `import `). This is **documented heuristic limitation, not a bug** — see `src/editor/insert-snippet.ts` module header.

- [ ] `bar.ts` with: `const msg = "please import this";` Paste. **Expect:** import lands after the string-literal line. Same heuristic limitation.

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
- [ ] All 10 Bottom-marker indicators
- [ ] Multiple imports → picks last
- [ ] No markers → line 0 (2 cases)
- [ ] Heuristic false-positives documented (2 cases)
- [ ] Mid-flight setting change

Tester / date: ___________________
