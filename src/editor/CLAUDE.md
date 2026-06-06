# src/editor/CLAUDE.md

Helpers that touch the `vscode` API on behalf of `commands/` and `snippets/`. This is the **only** layer outside `commands/` and `extension.ts` that imports `vscode` for clipboard/snippet/notification.

## Files

- `file-path-info.ts` — single source of truth for `{ relativePath, sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt }`.
- `placement.ts` — placement-rule helpers, consumed two distinct ways. **Low-level helpers** (`isInlineSnippet`, `shouldRepositionCursor`, `isCommentLine`, `getLineIndentation`, `detectBlockIndentation`, `isMarkdownDestination`, `adjustForCommentBlock`, `findAstroFrontmatterBounds`, `findSfcScriptBounds`, `findBottomLineInRange`, `isImportLine`, `IMPORT_INDICATORS`) are imported by `insert-snippet.ts`, which composes them with its own editor-side insertion logic. **High-level `computeImportPlacement`** (plus the `ComputedPlacement` interface) is used only by `drop/provider.ts`, which delegates the whole placement decision to it. See the placement-rules section below.
- `insert-snippet.ts` — snippet-insertion orchestrator. Delegates to `placement.ts` for placement decisions, then calls `editor.insertSnippet` at the computed position.
- `notification.ts` — single switch on `NotificationType` plus a `clearNotifications()` helper.

## `file-path-info.ts:getFilePathInfo()`

- Reads source from clipboard, destination from `vscode.window.activeTextEditor.document.uri.fsPath`.
- **Caller is responsible for the active-editor null check** — this function dereferences `editor.document.uri.fsPath` unconditionally and will raise a `TypeError` otherwise. Every command that starts the calling chain (`commands/paste-import.ts`, `commands/paste-import-with-style.ts`, `commands/set-default-import-style.ts`) does this check.
- **Async variant re-reads the clipboard on every call.** `getFilePathInfoFromPaths` (sync) is called by `drop/provider.ts` with explicit paths — no clipboard read.
- Called from: `commands/{paste-import,paste-import-with-style,set-default-import-style}.ts` (async variant `getFilePathInfo`) and `drop/provider.ts` (sync variant `getFilePathInfoFromPaths`, called directly — never the async variant). Language modules, `dispatch.ts`, `variants.ts`, and `insert-snippet.ts` all receive `FilePathInfo` as a parameter — they do not call this function themselves.

## `placement.ts` and `insert-snippet.ts` — placement rules

`insertImportSnippet(snippet, info)` receives a pre-computed `FilePathInfo` from the calling command — it does not call `getFilePathInfo()` itself. The low-level placement-rule helpers live in `placement.ts`; `insert-snippet.ts` orchestrates the insertion by calling those helpers and then `editor.insertSnippet`.

**Two placement strategies share these precedence rules.** The order below applies to the **command flow** via `insertImportSnippet`, which reads from the active editor and ends in `editor.insertSnippet`. The **drop flow** (`drop/provider.ts`) instead calls `computeImportPlacement(documentText, destinationFileExt, sourceFileExt, dropLine, dropColumn)` — a pure function in `placement.ts` that applies the *same* precedence but returns a `ComputedPlacement` (`{ line, column, indentation, isInline, wrapperPrefix?, wrapperSuffix? }`) for a `WorkspaceEdit`, never touching the editor. The two implementations duplicate the precedence (`insert-snippet.ts`'s `insertSnippetAt{Top,Bottom,Cursor,AstroFrontmatter,SfcScript}` vs. `placement.ts`'s `computeImportPlacement` / `computeAstroPlacement` / `computeSfcPlacement`) and must be kept in sync when placement logic changes. See `src/test/editor/placement-parity.test.ts` — a comprehensive parity test that validates the two flows produce identical line/column placement across all three user settings and all destination block types (Astro frontmatter, SFC script, and flat files).

Order of precedence:

1. **Inline snippet** (`isInlineSnippet` returns true) — non-stylesheet source into a stylesheet destination (e.g. image → `.css`/`.scss`). Inserts the `url('...')` snippet at the exact cursor position (line *and* column from `editor.selection.anchor`) with **no trailing newline**. Bypasses `determineInsertionColumn` and the `\n` append entirely, since `url()` is an inline CSS value, not a standalone statement.
2. **Forced cursor** (`shouldRepositionCursor` returns true) — destination is `.html` or `.md`. Appends `\n` and inserts at the cursor line via `insertSnippetAtCursor` (column decided by `determineInsertionColumn` — returns cursor column for these non-script/non-stylesheet destinations). Note: `.mdx` is *not* forced-cursor — `shouldRepositionCursor` checks only `.html`/`.md`, so `.mdx` follows the user's Top/Bottom/Cursor setting. It is still treated as Markdown for comment-line handling (`isMarkdownDestination` returns true for `.md` *and* `.mdx`), so a leading `*` counts as content, not a comment.
3. **Astro frontmatter** (destination is `.astro`) — reads the user's placement setting and constrains insertion to within the `---` frontmatter fences via `insertSnippetAtAstroFrontmatter`. `findAstroFrontmatterBounds` locates both fences (returns `null` if fewer than two exist). If no frontmatter exists, all three modes converge: wraps the import in a new `---` block at line 0. Within an existing frontmatter block: **Top** inserts after the opening `---`; **Bottom** scans the frontmatter region for import lines via `isImportLine` and inserts after the last match (falls back to after the opening `---`); **Cursor** inserts at the cursor line if it's inside the fences, otherwise falls back to Bottom.
4. **SFC script block** (destination is `.vue` or `.svelte`) — constrains insertion to within a `<script...>` / `</script>` pair via `insertSnippetAtSfcScript`. `findSfcScriptBounds` prefers `<script setup` (Vue composition API) over bare `<script`; falls back to the first `<script` block found. Placement logic mirrors Astro: **Top** inserts after the opening tag; **Bottom** scans the block for import lines via `isImportLine` (falls back to after the opening tag); **Cursor** inserts at the cursor line if inside the block, otherwise falls back to Bottom. If no script block exists, wraps the import in a new `<script>` / `</script>` pair at line 0.
5. **User setting** `auto-import.preferences.importStatementPlacement` — `'Top'` / `'Bottom'` / `'Cursor'` matched **literally** as strings. Adding a new placement requires the `enum` in `package.json` plus **six** `switch` statements kept in sync: in `insert-snippet.ts`, `insertImportSnippet`, `insertSnippetAtAstroFrontmatter`, and `insertSnippetAtSfcScript`; in `placement.ts`, `computeImportPlacement`, `computeAstroPlacement`, and `computeSfcPlacement`. (Each file has one general switch plus the Astro-frontmatter and SFC-script variants.) Any value other than these three strings falls through to the default case and receives Bottom placement.

### "Bottom" insertion

Walks `document.getText().split('\n')` and inserts after the last line that satisfies `isImportLine` — the predicate that tests each line against the **nine** `IMPORT_INDICATORS` markers:

```
'import ', 'require(',
"@import '", '@import "', '@import url(', "@use '", '@use "',
"@forward '", '@forward "'
```

`isImportLine` matches the eight *line-leading* markers (`import `, the `@import` family, `@use`, `@forward`) only when they start the trimmed line, so an `import ` substring inside a string literal (`const msg = "you should import this"`) is **not** counted. `require(` is a call expression rather than a line-leading keyword, so it is matched anywhere on the line — a `require(` substring inside a string literal stays a residual false positive (far rarer, and not removable without full string-literal parsing). Comment lines (starting with `//`, `/*`, or `*` after whitespace) are additionally skipped via `isCommentLine`. Falls through to line 0 when nothing matches. **New import-syntax markers must be added to `IMPORT_INDICATORS`** or "Bottom" placement will silently land at line 0 instead of after the existing imports.

### Insertion column

`determineInsertionColumn(editor)` in `insert-snippet.ts` returns `0` for destinations whose extension is in `constants/extensions.ts:SCRIPT_FILE_EXTENSIONS` or `STYLESHEET_FILE_EXTENSIONS`; otherwise the cursor's column (important for HTML/Markdown where the user is typing inline). `placement.ts` carries a parallel internal `determineInsertionColumn(ext, col)` (not exported) used only by `computeImportPlacement` for the drop flow — same rule, but the extension and column are passed in rather than read from an editor.

## `notification.ts:showNotification(type, payload?)` and `clearNotifications()`

### `showNotification(type, payload?)`

- Overloaded function dispatching on `NotificationType` (string-literal union from `types/notification.ts`).
- Fifteen variants. Six are payload-less; nine interpolate values into the message:
  - `'not-supported'` takes `{ sourceExt, destinationExt }` — emits `Auto Import: Cannot import .X into .Y files.`
  - `'no-extension'` takes `{ basename }` — emits `Auto Import: <basename> has no file extension.`
  - `'source-not-found'` takes `{ basename }` — emits `Auto Import: Source file no longer exists: <basename>.`
  - `'copy-success'` takes `{ basename }` — emits `Auto Import: Copied path — <basename>` (info toast, not warning)
  - `'no-configurable-style'` takes `{ sourceExt, destinationExt }` — emits `Auto Import: .X → .Y imports use a fixed style.`
  - `'default-style-saved'` takes `{ description }` — emits `Auto Import: Default style saved — <description>` (info toast, not warning)
  - `'placement-saved'` takes `{ placement }` — emits `Auto Import: Import placement saved — <placement>` (info toast, not warning)
  - `'preserve-script-extension-toggled'` takes `{ enabled }` — emits `Auto Import: Preserve script file extension — On`/`Off` (info toast, not warning)
  - `'styles-reset'` takes `{ count }` — emits `Auto Import: Reset 1 import style to defaults` (when `count === 1`) / `Auto Import: Reset <count> import styles to defaults` (info toast, carries an **Undo** button, returns `Thenable<string | undefined>`)
- TypeScript overload resolution enforces the right payload (or no payload) at every call site. The implementation signature uses a wide payload type and `!` non-null assertions because the overloads are the type-safety boundary.
- Eight variants render via `showWarningMessage`; the seven info variants (`'copy-success'`, `'default-style-saved'`, `'placement-saved'`, `'preserve-script-extension-toggled'`, `'styles-reset'`, `'no-styles-to-reset'`, `'styles-restored'`) render via `showInformationMessage`. The level is hardcoded per-variant inside the `switch`.
- Three variants surface action buttons:
  - `'not-supported'` adds **View Supported Files** — click handler is self-contained (`vscode.env.openExternal` to the README's supported-pairs anchor). The `showWarningMessage(...).then(...)` chain is prefixed with the `void` operator to discard its promise on the spot, so the overload returns `void`.
  - `'copy-success'` adds **Paste with Style** (style-picker variant) and **Paste Now** (default paste-import), in that render order (leftmost first). The overload returns `Thenable<string | undefined>` so `commands/copy-file-path.ts` can dispatch on the chosen action — keeps `editor/` from reaching into `commands/`.
  - `'styles-reset'` adds **Undo** — the overload returns `Thenable<string | undefined>` so `commands/reset-import-styles.ts` can restore the captured prior values via `restoreImportStyles` when clicked. Same byte-exact button-label contract as `'copy-success'`, paired with `reset-import-styles.ts`.
- Producers: `commands/paste-import.ts` raises six (`'same-file-path'`, `'not-supported'`, `'no-active-editor'`, `'no-extension'`, `'empty-clipboard'`, `'source-not-found'`); `commands/paste-import-with-style.ts` raises the same six plus its branch on `variants.length`; `commands/copy-file-path.ts` raises three (`'no-file-to-copy'`, `'no-extension'`, `'copy-success'`); `commands/set-default-import-style.ts` raises eight — the same six rejection variants plus `'no-configurable-style'` and `'default-style-saved'`; `drop/provider.ts` raises two (`'same-file-path'`, `'not-supported'`); the three settings commands raise their own info toasts — `'placement-saved'` from `commands/set-import-placement.ts`, `'preserve-script-extension-toggled'` from `commands/toggle-preserve-script-extension.ts`, and `'no-styles-to-reset'` / `'styles-reset'` / `'styles-restored'` from `commands/reset-import-styles.ts`.
- All messages share the `Auto Import:` prefix — matches the command titles in `package.json`.

### `clearNotifications()`

- Wraps `vscode.commands.executeCommand('notifications.clearAll')` so commands don't reach into the VS Code command palette directly for notification-system side effects.
- Fire-and-forget — the underlying `executeCommand` returns a Thenable that's deliberately not awaited.
- Producers: every copy/paste command (`commands/paste-import.ts`, `commands/copy-file-path.ts`, `commands/paste-import-with-style.ts`, `commands/set-default-import-style.ts`) calls this at the top of its execution to dismiss any lingering toasts before a fresh one fires. `copy-paste.ts` inherits via the two it composes. The three settings commands (`set-import-placement.ts`, `toggle-preserve-script-extension.ts`, `reset-import-styles.ts`) do **not** call it — they emit info toasts and never run the gating preamble.
- This is the **only** allowed entry point for `notifications.clearAll` outside of `notification.ts`. Commands must not inline the `executeCommand('notifications.clearAll')` call.
