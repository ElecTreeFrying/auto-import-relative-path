# src/commands/CLAUDE.md

The commands registered in `src/extension.ts`. The clipboard is the data channel between copy and paste; the settings commands are the exception — they read/write configuration only and have no source/destination pair (see [Settings commands](#settings-commands)).

## Files

- `copy-file-path.ts` — `executeCopyFilePath`
- `paste-import.ts` — `executePasteImport`
- `copy-paste.ts` — `executeCopyPaste`
- `paste-import-with-style.ts` — `executePasteImportWithStyle`
- `set-default-import-style.ts` — `executeSetDefaultImportStyle`
- `set-import-placement.ts` — `executeSetImportPlacement`
- `toggle-preserve-script-extension.ts` — `executeTogglePreserveScriptExtension`
- `reset-import-styles.ts` — `executeResetImportStyles` (+ `restoreImportStyles`, the Undo helper)
- `index.ts` — barrel re-export (the project's deliberate lone barrel)

## Conventions

- One file per command; one exported `executeX` per file (no `Command` suffix — the parent directory carries the kind signal).
- All commands are `async`, return `Promise<void>` except `executeCopyFilePath` which returns `Promise<boolean>` to signal success/failure to `copy-paste.ts`.
- Every failure path returns void; **nothing throws**. User-visible signals are toasts (warning or info) via `editor/notification.ts:showNotification`. Commands never call `vscode.window.show*Message` or `vscode.commands.executeCommand('notifications.*')` directly — those go through `showNotification` / `clearNotifications`.

## `copy-file-path.ts` — clipboard round-trip

Delegates to VS Code's built-in `copyFilePath` — which newline-joins an Explorer multi-selection — then reads the clipboard back, validates, and re-writes it. The round-trip is deliberate twice over: the built-in command's clipboard write is timing/focus-sensitive, and for a multi-selection the re-write holds exactly the validated members (newline-joined, the built-in's own wire format) — so the next paste-import sees precisely what the toast announced.

Calls `clearNotifications()` first. The clipboard is split into lines via `editor/file-path-info.ts:parseClipboardPaths`. A single-line clipboard keeps the single-path outcomes: `showNotification('copy-success', { basenames })` on success — **including an extensionless file** (`Makefile`, `Dockerfile`, `LICENSE`): copy is destination-agnostic, so it no longer rejects a missing extension; the paste-time gate (which knows the destination) decides. `showNotification('no-file-to-copy')` fires only when the clipboard is empty or not an absolute path. A multi-line clipboard (Explorer multi-selection) instead filters to the copyable members via `filterCopyablePaths` — the **absolute-path** validation (no longer extension-gated), applied member by member: the survivors are re-written to the clipboard and announced in one plural `copy-success` toast; a selection with no absolute member fails with `no-file-to-copy`. All helpers live in `editor/notification.ts`.

On success, the `copy-success` toast carries two action buttons — **Paste with Style** and **Paste Now** (in that render order, leftmost first) — and the post-toast handler (`dispatchPasteAction`) dispatches `extension.pasteImportWithStyle` / `extension.pasteImport` based on which the user clicked. **Two-site byte-exact contract**: the button label strings in `editor/notification.ts` (the `copy-success` action buttons) and the `switch` cases in this file (`dispatchPasteAction`) must match character-for-character — `showInformationMessage` resolves with the literal clicked label, so any drift silently no-ops.

## `paste-import.ts` — the heart of the gating logic

- Aborts if there's no `activeTextEditor`.
- **Sequential fetch.** `getFilePathInfo()` runs first (reads clipboard + active editor), then `buildImportSnippet(info)` runs with the resulting `FilePathInfo`. The snippet builder receives all path data through the `info` parameter — it performs no clipboard or editor reads of its own.
- **Clipboard validation** rejects with `'empty-clipboard'` when empty or not absolute; rejects with `'no-extension'` when the source path has no file extension **and the destination is not `.md`** (e.g. `Makefile` → `.ts`). An extensionless source into a `.md` destination is admitted and emits a `[text](path)` link — `.md` is the only destination that accepts it (`gating.ts` first clause).
- **Same-file rejection** runs before gating: `sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()` → `'same-file-path'` toast.
- **File-existence check:** verifies the source file exists via `vscode.workspace.fs.stat()`; aborts with `'source-not-found'` notification if the file is not found.
- **Gating disjunction** rejects with `'not-supported'` toast if any clause matches — the shared `src/gating.ts:isPairSupported(info)` clauses (`CROSS_IMPORT_DESTINATIONS`, `.html → .html`, and the destination-specific supported-extension checks, including the `.tex` LaTeX check; see [`src/constants/CLAUDE.md`](../constants/CLAUDE.md) for the gating tables) plus the inline empty-snippet checks: `snippet.value === '\n'` (no language module handled this destination) and `snippet.value === ''` (same).
- **SFC `<style>`-block context.** For a framework destination (`.vue`/`.svelte`/`.astro`), `editor/placement.ts:isStyleBlockContext` decides — from the active editor's text + cursor line and the source extension — whether the gesture is a stylesheet source strictly inside a `<style>` block. The resulting `insideStyleBlock` flag threads into `buildImportSnippet(info, insideStyleBlock)` and `insertImportSnippet(snippet, info, insideStyleBlock)`, selecting the `@import`/`@use` dialect + style-block placement over the script-block side-effect import. Every non-framework destination ignores it.
- See [`src/snippets/CLAUDE.md`](../snippets/CLAUDE.md) for what builds the snippet.

The sequence above is the **single-path flow**. Before it runs, the clipboard is split via `editor/file-path-info.ts:parseClipboardPaths`; more than one line routes to the multi-path fork below instead.

### Multi-path clipboard (`pasteMultipleImports`)

A multi-line clipboard — an Explorer multi-selection copied by `copy-file-path.ts`, or any hand-assembled newline-joined list — fans out per member, mirroring `drop/provider.ts`'s skip semantics on top of this command's clipboard checks. `pasteMultipleImports` receives the active editor (not just the destination path) so it can compute the SFC `<style>`-block context. Per member, in order: non-absolute line → skipped; extensionless → skipped (basename remembered) **unless the destination is `.md`, where it proceeds to the same-file / stat / gating pipeline as a link**; same-file (case-insensitive) → skipped (counted); `fs.stat` miss → skipped (basename remembered); gating / empty-snippet rejection → skipped (pair remembered). Survivors build one stacked block via `snippets/compose.ts:joinImportStatements` (tab stops renumbered so each import's placeholder stays independent) inserted **once** through `insertImportSnippet` with the first surviving member's `FilePathInfo` — non-inline placement is destination-driven, so the first candidate positions the whole block. The composed trailing newline is stripped before insertion because `insertImportSnippet` appends its own; indentation is joined empty because `editor.insertSnippet` re-indents interior lines to the insertion column.

- **Style-block context is one flag for the whole gesture.** `isStyleBlockContext` is computed once — true only when *every* member is a stylesheet (`.css`/`.scss`) and the cursor sits in a `<style>` block — and threaded into every member's `buildImportSnippet` and the single `insertImportSnippet`. A mixed selection (any non-stylesheet member) stays script-dialect, so the whole stacked block lands in the `<script>`/frontmatter region — preserving the one-position invariant.

- **Inline members can't stack.** `url()` snippets are CSS values, not statements: an all-inline set inserts the first member only; a mixed set keeps the statement-style members and drops the inline ones (the drop provider's policy).
- **Partial pastes are silent.** Skips produce no toast while at least one member inserts. When nothing survives, one aggregate toast fires, most informative first: `not-supported` > `source-not-found` > `same-file-path` > `no-extension` > `empty-clipboard`.

## `copy-paste.ts` — sequential composition with gating

Gates paste on copy success: `const ok = await executeCopyFilePath(); if (!ok) { return; } await executePasteImport();`. Copy failures abort silently (copy's notification already informed the user); only successful copies proceed to paste. **Must remain sequential** — paste reads what copy wrote.

## `paste-import-with-style.ts` — pick-style variant of paste-import

Mirrors `paste-import.ts`'s single-path sequence step-by-step (clearNotifications → null-check editor → the multi-path primary-member reduction → sequential fetch → clipboard sanity → same-file check → file-exists stat → the gating disjunction), but swaps `buildImportSnippet()` for `snippets/variants.ts:buildImportSnippetVariants()`. **Multi-path reduction, not fan-out:** the picker flows are single-pair by design, so a multi-line clipboard reduces to one member via the module-private `selectPrimaryClipboardPath` — the first copyable member (`filterCopyablePaths`) that isn't the destination itself, else the first copyable member, else the first line (so the single-path failure toasts stay specific) — and `getFilePathInfoFromPaths` builds the info from it. Stacking belongs to `paste-import.ts` and the drop provider only. After gating it computes `isEmptyVariantSet` — `variants.length === 0` **OR** `variants[0].snippetText` is `''` **OR** `'\n'` (any one suffices; a non-empty array can still be "empty" when its first snippet is blank) — and branches:

- **`!isPairSupported(info) || isEmptyVariantSet`** → `'not-supported'` toast. A single OR guard: the gating check and the empty-variant check share one rejection (the `isEmptyVariantSet` half is defensive — gating already catches these).
- otherwise **`variants.length === 1`** → insert directly via `insertImportSnippet(new vscode.SnippetString(variants[0].snippetText), info)`. Single-shape destinations (HTML, Markdown text, CSS image, SCSS image, JSX/TSX/MDX non-script source) take this path so the user gets the same silent-insert UX as `cmd+i`.
- otherwise (**≥2**) → `vscode.window.showQuickPick` with `{ placeHolder: 'Select an import style', matchOnDescription: true }`. Cancellation (Esc) returns silently — no toast.

The gating mirrors `paste-import.ts` via the shared `src/gating.ts:isPairSupported(info)` clauses (`CROSS_IMPORT_DESTINATIONS`, `.html → .html`, the markup/stylesheet supported-extension checks, the framework-component checks for Vue/Svelte/Astro, the LaTeX `.tex` check, and the script-destination checks for `.ts`/`.js` (own extension plus the framework-component sources)). The inline empty-snippet checks (the `snippet.value === ''` / `'\n'` checks) collapse into the `isEmptyVariantSet` disjunction above. **Persisted style settings are not consulted**; the picker is a one-shot override.

**SFC `<style>`-block context.** Like `paste-import.ts`, it computes `editor/placement.ts:isStyleBlockContext` from the (reduced) primary member and threads `insideStyleBlock` into `buildImportSnippetVariants(info, insideStyleBlock)` **and** the direct-insert `insertImportSnippet`. A stylesheet source inside a `<style>` block therefore enumerates the CSS/SCSS styles (≥2 → picker) instead of the single hardcoded side-effect variant shown in the script region.

## `set-default-import-style.ts` — picker that persists instead of pasting

Mirrors `paste-import-with-style.ts` step-by-step through gating, clipboard checks, sequential fetch, same-file rejection, file-existence stat, and the gating `'not-supported'` rejection — including the multi-path primary-member reduction (its own copy of `selectPrimaryClipboardPath`). Diverges after gating into two sequential guards (not three alternative branches):

- **The not-supported guard:** if `!isPairSupported(info) || isEmptyVariantSet`, return `'not-supported'` toast — a single OR guard, not two separate checks.
- **`isEmptyVariantSet`:** computed just above the guard: `variants.length === 0` or `variants[0].snippetText` is `''` or `'\n'`. It feeds that disjunction, so an empty variant set also yields the `'not-supported'` toast.
- **The no-configurable-style guard:** only after passing the first guard, if `variants.length === 1 || variants[0].setting === undefined`, return `'no-configurable-style'` toast. The second condition rejects hardcoded destinations (HTML, Markdown text, CSS/SCSS images, JSX/TSX/MDX non-script source, framework-component sources into `.ts`/`.js`) which have no configurable `ImportStyle` setting. The matching `*ImportStyle` settings exist in `package.json` for UI parity only and are flagged parity-only in [`snippets/CLAUDE.md`](../snippets/CLAUDE.md); persisting one would be misleading.
- **The picker:** else (≥2 variants with defined settings and supported pair), show `vscode.window.showQuickPick`. On pick, calls `setAutoImportSetting(namespace, key, value)` (writer in `config/settings.ts`, mirror of `getAutoImportSetting`) with `vscode.ConfigurationTarget.Global` and emits `'default-style-saved'` info toast.

The `(namespace, key, value)` triple comes from the new `setting?` field on `ImportSnippetVariant` (see [`snippets/CLAUDE.md`](../snippets/CLAUDE.md)). All styled variants in a single picker invocation share one `(namespace, key)` because the destination switch in `snippets/variants.ts` enumerates from one table per branch — the pair varies between picker runs but never within one. Cancellation (Esc) returns silently — no toast.

**Current-default indicator.** Before opening the picker, the command reads the persisted value via `getAutoImportSetting(namespace, key)` (`vscode.workspace.getConfiguration().get(...)` falls back to the `package.json` default when no user override exists). The variant whose `setting.value` matches the result is moved to position 0 and its `description` is **replaced** with `$(check) Current default` (rendered as a checkmark icon by VS Code's QuickPick) — the per-style description text is dropped on that one row, leaving just the checkmark annotation. If no variant matches — e.g. the user typed a custom value into `settings.json` that isn't in `_styles.ts` — the picker renders in natural order with no indicator. Byte-exact comparison is safe because `ImportStyle.description` strings are byte-exact contracts with `package.json:enum` per [`config/CLAUDE.md`](../config/CLAUDE.md).

The same picker items appear in both `pasteImportWithStyle` and `setDefaultImportStyle` for the same source/destination pair — `buildImportSnippetVariants` is the shared aggregator.

**SFC `<style>`-block context.** Threads `insideStyleBlock` (computed from the primary member via `isStyleBlockContext`) into `buildImportSnippetVariants` the same way as the pick-style command. In a `<style>` block a stylesheet source exposes the configurable CSS/SCSS styles (the picker persists `cssImportStyle` / `scssImportStyle` — the same `stylesheet` settings the plain `.css`/`.scss` destinations use); in the script region it is a fixed side-effect shape → the `no-configurable-style` guard.

## Settings commands

`set-import-placement.ts`, `toggle-preserve-script-extension.ts`, and `reset-import-styles.ts` are **settings commands**: they act on global configuration, not on a source→destination pair. Unlike the five copy/paste commands above, they run **none** of the gating preamble — no `activeTextEditor` requirement, no clipboard read, no `getFilePathInfo`, no `fs.stat`, no `isPairSupported`, no `buildImportSnippetVariants`. Each reads/writes configuration via `getAutoImportSetting` / `setAutoImportSetting` (defaulting to `ConfigurationTarget.Global`, like `set-default-import-style.ts`); `reset-import-styles.ts` additionally calls `inspectAutoImportSetting` to find user overrides. Each emits an info toast through `showNotification`, and all work with no editor open.

- `set-import-placement.ts` — QuickPick over `Top` / `Bottom` / `Cursor` for `auto-import.preferences.importStatementPlacement` (`preferences` / `placement`). Reuses the `$(check)`-current + splice-to-position-0 shape of `set-default-import-style.ts` (the current-default indicator), minus the variant/pair logic. The option list and `detail` strings are local to the file — the placement enum is **not** in `_styles.ts` (it is matched literally in `editor/placement.ts` + `editor/insert-snippet.ts`), so adding this command introduces no new enum value and does not touch those switches. Persists the pick and emits `'placement-saved'`. Esc cancels silently.
- `toggle-preserve-script-extension.ts` — flips the `auto-import.importStatement.script.preserveScriptFileExtension` boolean (`script` / `preserve`, `?? false` when unset) and emits `'preserve-script-extension-toggled'` (`On` / `Off`). No QuickPick. **Living-gate note:** if the deferred tri-state enum documented in the local design library (`docs/import-statements/future/auto-detect-extensions.md`) ever replaces the boolean, this 2-state toggle must be reconciled (3-way picker or removal).
- `reset-import-styles.ts` — clears the user's Global override on the configurable import-style settings (`RESETTABLE_STYLES`: `script.javascript`/`typescript`, `stylesheet.css`/`scss`, `markup.htmlScript`/`htmlImage`/`htmlVideo`/`htmlAudio`/`markdownImage`, `latex.graphics`/`input`/`bibliography`), restoring each to its `package.json` default. Excludes the `preserve…FileExtension` booleans (`script`, `stylesheet`, `latex` graphics), `importStatementPlacement`, and the dormant single-shape keys (`cssImage`, `scssImage`, `htmlStyleSheet`, `markdown`) — resetting a one-value setting is meaningless. Counts only settings with an actual Global override via `inspectAutoImportSetting(...).globalValue`: none customized → `'no-styles-to-reset'` and return; otherwise clears them and emits `'styles-reset'` (`{ count }`) carrying an **Undo** action that re-writes the captured prior values through the exported `restoreImportStyles` (which then emits `'styles-restored'`). The **Undo** label is also bound by the two-site button-label contract — `editor/notification.ts` ↔ this file's `switch`. Workspace-level overrides are left untouched; the extension writes only to Global.

## Adding a new command

1. New file here, kebab-case noun (no `.command.ts` suffix).
2. Export `executeX: () => Promise<void>` (no `Command` suffix; exception: `executeCopyFilePath` returns `Promise<boolean>`).
3. Re-export from `index.ts`.
4. Register in `src/extension.ts:activate`.
5. Add to `package.json:contributes.commands` (and optionally `contributes.keybindings`).
