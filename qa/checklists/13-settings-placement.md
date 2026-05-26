# 13 — Placement settings

Validates `auto-import.preferences.importStatementPlacement`, the inline-snippet override, the two forced-cursor overrides, Astro frontmatter placement, Vue/Svelte `<script>` block placement, the insertion-column rule, and the 9-marker Bottom heuristic.

**Sources:**
- `src/editor/placement.ts` — `computeImportPlacement`, `isInlineSnippet`, `shouldRepositionCursor`, `findAstroFrontmatterBounds`, `findSfcScriptBounds`, `findBottomLineInRange`, `IMPORT_INDICATORS`, `adjustForCommentBlock`
- `src/editor/insert-snippet.ts` — `insertImportSnippet` (delegates to `placement.ts` for position computation)
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
  **Expect:** code path goes to `default:` branch in `insertImportSnippet`'s switch → Bottom placement (aligned with the `package.json` default).

## Inline snippet override — CSS/SCSS image imports

`isInlineSnippet` returns `true` when source is not a stylesheet but destination is `.css` or `.scss` (image → stylesheet). The snippet is inserted at the **exact cursor position** (line AND column from `editor.selection.anchor`) with **no trailing newline**.

- [ ] Set `placement = Top`. Cursor at line 5, column 14 of `styles/main.scss` (inside a property value). Copy `assets/logo.png` → paste.
  **Expect:** `url('./assets/logo.png')` at line 5 column 14 (not line 0, not column 0). No trailing newline splitting the line.

- [ ] Set `placement = Top`. Cursor at line 5, column 14 of `styles/global.css`. Copy `assets/logo.png` → paste.
  **Expect:** `url('./assets/logo.png')` at line 5 column 14. Same inline behavior.

- [ ] Set `placement = Top`. Cursor at line 5 of `styles/main.scss`. Copy `styles/global.css` → paste.
  **Expect:** `@use` at line 0 (NOT inline — `.css` IS a stylesheet, so `isInlineSnippet` is false; normal Top applies).

- [ ] Set `placement = Top`. Cursor at line 5 of `styles/main.scss`. Copy `styles/_partial.scss` → paste.
  **Expect:** `@use` at line 0 (NOT inline — `.scss` IS a stylesheet).

- [ ] Set `placement = Top`. Cursor at line 5 of `styles/global.css`. Copy `styles/reset.css` → paste.
  **Expect:** `@import` at line 0 (NOT inline — `.css = .css`).

## Forced-cursor overrides — HTML and Markdown

`shouldRepositionCursor` returns `true` (overriding any user setting) when destination is `.html` or `.md`. These destinations have no canonical import location — always inserts at the cursor line.

### Override #1 — HTML destination

- [ ] Set `placement = Top`. Cursor at line 5 of `pages/index.html`. Copy `src/sibling.js` → paste.
  **Expect:** `<script>` at line 5 (cursor), NOT line 0 (Top).
- [ ] Same with `placement = Bottom` → still cursor.

### Override #2 — Markdown destination

- [ ] Set `placement = Top`. Cursor at line 5 of `docs/README.md`. Copy `assets/logo.png` → paste.
  **Expect:** image snippet at line 5.

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

## Bottom-placement marker detection — all 9 indicators

The `IMPORT_INDICATORS` array in `insertSnippetAtBottom`:

```
'import ', 'require(',
"@import '", '@import "', '@import url(', "@use '", '@use "',
"@forward '", '@forward "'
```

Set `placement = Bottom`. The workspace ships purpose-built fixtures whose first lines exercise every indicator — no editing needed.

### Script indicators — `with-imports.ts` and `with-requires.js`

`with-imports.ts` contains existing `import …` lines; `with-requires.js` contains `require(…)` calls in several shapes — both indicators covered across the two files.

- [ ] **`with-imports.ts` (covers `import `).** Open `with-imports.ts`. Copy `src/foo.ts` from Explorer. Paste.
  **Expect:** new import lands AFTER the file's last `import …` line.
- [ ] **`with-requires.js` (covers `require(`).** Open `with-requires.js`. Copy `src/sibling.js`. Paste.
  **Expect:** new import lands AFTER the file's last require-style line (whichever comes last — Bottom picks the LAST match).

### Stylesheet indicators — `styles/with-imports.css` and `styles/with-uses.scss`

`with-imports.css` covers all three `@import …` shapes. `with-uses.scss` covers both `@use '…'` and `@use "…"` plus `@import` for completeness.

- [ ] **`styles/with-imports.css` (covers `@import '`, `@import "`, `@import url(`).** Open it. Copy `styles/reset.css`. Paste.
  **Expect:** new `@import` lands AFTER the file's last `@import …` line.
- [ ] **`styles/with-uses.scss` (covers `@use '`, `@use "`, `@forward '`, `@forward "`, plus existing `@import`).** Open it. Copy `styles/_partial.scss`. Paste.
  **Expect:** new `@use`/`@import` lands AFTER the file's last `@import` line (Bottom picks the LAST indicator match across all types).

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

### Comment-line filtering

Comment lines (starting with `//`, `/*`, or `*`) are now skipped by the indicator scan. `comments-only.ts` is purpose-built for this: it contains a comment with the substring `import ` inside, plus pure block comments.

- [ ] **`comments-only.ts` Bottom landing.** Open it. Paste any valid TS source. **Expect:** new import lands at **line 0** (not after the comment containing `import `). Comments are no longer matched by the indicator scan.

## Per-language snippet column behavior

When inserting at line N (any placement), the column is computed once for the whole snippet.

- [ ] `Cursor` placement, multi-line snippet (none of ours are multi-line, but verify via SCSS @use): snippet is single-line, no issue.

## Edge cases

- [ ] **Setting changed mid-flight.** Open `bar.ts`. Run Paste with `placement = Top`. Now change to `Bottom`. Run Paste again.
  **Expect:** second insert at Bottom. No reload required.

- [ ] **Different destinations have different rules.** Test in same session: paste into `.ts` (column 0) then paste into `.html` (cursor column). Both behave correctly without restart.

## Astro `---` frontmatter awareness

`insertSnippetAtAstroFrontmatter` constrains placement to within the `---` frontmatter fences. `findAstroFrontmatterBounds` locates both fences (returns `null` if fewer than two exist).

### Astro — frontmatter with existing imports

Temporarily add an import to `src/App.astro` so the frontmatter looks like:

```astro
---
import { foo } from './foo';
---
```

- [ ] **Top.** Set `placement = Top`. Copy a `.ts` file → paste into the Astro file.
  **Expect:** new import at the line AFTER the opening `---` (inside the fences), NOT at line 0.
- [ ] **Bottom.** Set `placement = Bottom`. Same paste.
  **Expect:** new import AFTER the existing `import { foo }` line (indicator scan within frontmatter).
- [ ] **Cursor inside frontmatter.** Set `placement = Cursor`. Place cursor between the `---` fences. Paste.
  **Expect:** import at cursor line.
- [ ] **Cursor outside frontmatter.** Set `placement = Cursor`. Place cursor below the closing `---` (in the HTML body). Paste.
  **Expect:** falls back to Bottom within the frontmatter (not at cursor in the body).

Undo the temporary edit after testing.

### Astro — empty frontmatter (no existing imports)

Restore `src/App.astro` to its original state (empty `---` / `---` fences).

- [ ] **Top into empty frontmatter.** Set `placement = Top`. Copy a `.ts` file → paste.
  **Expect:** import lands after the opening `---`.
- [ ] **Bottom into empty frontmatter.** Set `placement = Bottom`. Same paste.
  **Expect:** same landing as Top (no markers to find, falls back to after the opening `---`).

### Astro — no frontmatter

Temporarily remove the `---` fences from `src/App.astro` so only the HTML body remains.

- [ ] Copy a `.ts` file → paste into the fenceless Astro file.
  **Expect:** a new `---` block is created at line 0, wrapping the import.

Restore the fences after testing.

## Vue/Svelte `<script>` block awareness

`insertSnippetAtSfcScript` constrains placement to within a `<script...>` / `</script>` pair. `findSfcScriptBounds` prefers `<script setup` over bare `<script`.

### Vue — template-first with `<script setup>`

Use a Vue file with `<template>` before `<script setup>` (the standard Vue 3 layout):

```vue
<template>
  <div>Hello</div>
</template>
<script setup>
import { ref } from 'vue';
</script>
```

- [ ] **Top.** Set `placement = Top`. Copy a `.ts` file → paste into the Vue file.
  **Expect:** new import at the line AFTER `<script setup>` (inside the block), NOT at line 0.
- [ ] **Bottom.** Set `placement = Bottom`. Same paste.
  **Expect:** new import AFTER the existing `import { ref }` line (indicator scan within script block).
- [ ] **Cursor inside script.** Set `placement = Cursor`. Place cursor inside the `<script setup>` block. Paste.
  **Expect:** import at cursor line.
- [ ] **Cursor outside script.** Set `placement = Cursor`. Place cursor inside `<template>`. Paste.
  **Expect:** falls back to Bottom within the script block (not at cursor in template).

### Vue — no script block

- [ ] Use a Vue file with only `<template>` (no `<script>`). Copy a `.ts` file → paste.
  **Expect:** a `<script>...</script>` pair is created at line 0, wrapping the import.

### Svelte

- [ ] Repeat Top/Bottom tests with a `.svelte` file that has `<script>` at the top.
  **Expect:** same constrained behavior as Vue.

## Sign-off

- [ ] Three placement values + default + invalid enum
- [ ] Inline snippet override (CSS/SCSS image — 5 cases)
- [ ] Override #1 (HTML)
- [ ] Override #2 (Markdown)
- [ ] Insertion column for 4 script types + 2 stylesheet types
- [ ] Insertion column for HTML + MD
- [ ] All 9 Bottom-marker indicators (verified via `with-imports.ts`, `with-requires.js`, `styles/with-imports.css`, `styles/with-uses.scss`)
- [ ] HTML cursor override around existing resources (`pages/with-resources.html`)
- [ ] Multiple imports → picks last
- [ ] No markers → line 0 (2 cases via `empty-file.ts`, `single-char.ts`)
- [ ] Comment-line filtering (`comments-only.ts` → line 0)
- [ ] Astro frontmatter awareness (Top, Bottom, Cursor inside, Cursor outside, empty frontmatter, no frontmatter)
- [ ] Vue/Svelte script block awareness (Top, Bottom, Cursor inside, Cursor outside, no block)
- [ ] Mid-flight setting change

## Cross-reference: Drag & drop uses `computeImportPlacement()`

The `AutoImportOnDropProvider` (`src/drop/provider.ts`) uses the same placement logic extracted to `src/editor/placement.ts`. The function `computeImportPlacement()` implements all the rules tested above — Top/Bottom/Cursor, inline override, forced-cursor for HTML/MD, Astro frontmatter, SFC script block, comment-block adjustment, Bottom-marker detection. DnD-specific placement tests live in `19-drag-and-drop.md`.

Tester / date: ___________________
