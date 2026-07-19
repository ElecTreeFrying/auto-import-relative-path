# src/drop/CLAUDE.md

Drag-and-drop import provider registered via the VS Code `DocumentDropEditProvider` API. A second entry point for import generation alongside the clipboard-based commands in `src/commands/`. A single drag can carry **several** files (a newline-separated `text/uri-list`); the provider fans out over every file and stacks one import statement per file.

## Files

- `provider.ts` — `AutoImportOnDropProvider` class implementing `DocumentDropEditProvider`.
- `selector.ts` — `DROP_LANGUAGE_SELECTORS` constant: `DocumentSelector` covering every supported destination language (`scheme: 'file'` only).

Multi-file stacking (`joinImportStatements` / `shiftTabStops`) lives in [`snippets/compose.ts`](../snippets/CLAUDE.md) — shared, not drop-owned.

## `provider.ts` — `AutoImportOnDropProvider`

### Source resolution

`resolveSourcePaths(dataTransfer)` extracts **every** dragged file path from the `DataTransfer` object, returning a `string[]`:

1. Tries `text/uri-list` first — splits on `/\r?\n/` (a multi-file drag is newline-separated, `\r\n` or `\n`), trims each line, drops blank and `#`-comment lines (RFC 2483), and parses each survivor via `Uri.parse(raw).fsPath`. Returns the array if non-empty.
2. Would fall back to `text/plain` — returns `[value]` only if it's an absolute path (`path.isAbsolute`). Unreachable in practice: the provider is registered with `dropMimeTypes: [ 'text/uri-list' ]` (see Architectural position), so VS Code never populates `text/plain` in the `DataTransfer`. Kept as a defensive branch for a single absolute path.
3. Returns `[]` if neither item yields a usable path → provider returns `null` (no drop edit offered).

### Flow

1. Resolve **all** source paths from `DataTransfer` via `resolveSourcePaths`. Return `null` if none (cedes to VS Code's default drop).
2. Read destination from `document.uri.fsPath` (passed by the API — no active-editor lookup) and `document.getText()` once. Compute the SFC `<style>`-block context **once for the whole drag** via `editor/placement.ts:isStyleBlockContext(documentText, destExt, allSourceExts, position.line)` — true only when the destination is a framework SFC, *every* dragged file is a stylesheet (`.css`/`.scss`), and the drop lands strictly inside a `<style>` block. A mixed drag (any non-stylesheet member) stays script-dialect.
3. **Fan out** over every source path, collecting `DropCandidate`s (`{ value, placement }`). Per source, in order: **same-file check** (case-insensitive) → skipped, counted; **extensionless-into-non-`.md` check** → skipped, basename remembered for a `no-extension` toast (so gating's `Cannot import  into .X` with an empty source extension never fires; an extensionless source into a `.md` destination is *not* skipped here — it flows on and imports as a link); **gating** via `isPairSupported(info)` (shared with `commands/`) → skipped, the offending pair remembered for the toast; async `buildImportSnippet(info, insideStyleBlock)`, empty/newline-only value → skipped; otherwise **placement** via `computeImportPlacement(..., insideStyleBlock)` (same inline/style-block/Astro/SFC/Top/Bottom/Cursor logic as the command flow, parameterised with the drop position) is computed and the candidate kept. The drop **line** drives every branch, but the drop **column** is used only by the inline `url()` branch — every statement-style import inserts at column 0, so it lands on its own line rather than splicing into the line it was dropped on (see [`editor/CLAUDE.md`](../editor/CLAUDE.md) precedence rule 2 for the paste/drop column split). The `insideStyleBlock` flag is uniform across the gesture, so every block candidate still shares one position.
4. **No surviving candidate** → mirror the single-file toast priority (`'not-supported'` if any pair was unsupported, else `'same-file-path'`, else `'no-extension'` for an extensionless-into-non-`.md` drop) and return `suppressDrop()`.
5. **All candidates inline** (`url()` into a stylesheet — image → `.css`/`.scss`) → return the first as an inline `DocumentDropEdit(snippet)`. Stacking inline CSS values is invalid, so only the first is taken; only stylesheet destinations ever produce inline candidates.
6. **Otherwise** stack the non-inline (statement-style) candidates into one block via `snippets/compose.ts:joinImportStatements` (renumbers each statement's tab stops past the previous so they stay independent), then insert it with one `SnippetTextEdit.insert` at the destination-driven, shared placement, attached as `dropEdit.additionalEdit`. Any inline candidates in a mixed drop are dropped.

A **single-file drag** walks this exact path with one source — one candidate, and `joinImportStatements([value], indentation)` renders `indentation + value + '\n'` byte-identical to the single-source output — so one-file drop behaviour is unchanged.

**`null` vs. `suppressDrop()`.** The provider returns a real `null` in exactly one place — step 1, when **no** dragged file can be identified at all — which *cedes* the drop to VS Code's built-in handling. When sources resolve but **none survive** the fan-out (step 4), it instead returns `suppressDrop()`: an **empty** `DocumentDropEdit` (empty `SnippetString`, tagged with the module constants `EDIT_KIND` = `DocumentDropOrPasteEditKind.TextUpdateImports.append('autoImport')` and `EDIT_TITLE` = `'Auto Import'`). Returning `null` there would let VS Code fall back to its default *insert-relative-path* edit — the stray raw path that used to land on unsupported drops; the empty edit **out-ranks** that default, resolving the drop to a no-op so **nothing is inserted**. The `'same-file-path'` / `'not-supported'` toast still fires at the call site.

> **Partial drops are silent.** When *some* sources import and others are skipped (unsupported / same-file), the survivors are inserted and the skips produce no toast. A drop where *every* source is skipped still toasts (step 4).

### What the drop flow does NOT do (vs. the command flow)

| Concern | Command flow | Drop flow |
|---------|-------------|-----------|
| Source | Clipboard (`env.clipboard.readText`) | `DataTransfer` (`text/uri-list` / `text/plain`) |
| Destination | `activeTextEditor.document.uri.fsPath` | `document.uri.fsPath` (provider parameter) |
| FilePathInfo | Async `getFilePathInfo()` (single-path) / sync `getFilePathInfoFromPaths()` (multi-path fork) | Sync `getFilePathInfoFromPaths()` |
| Clipboard validation | `'empty-clipboard'`, `'no-extension'` | `'empty-clipboard'` skipped (DataTransfer items are file-backed); `'no-extension'` **is** checked — an extensionless source into a non-`.md` destination is skipped with a `no-extension` toast (into `.md` it imports as a link) |
| File-exists stat | `vscode.workspace.fs.stat` → `'source-not-found'` | Skipped — dragged file exists by definition |
| Unsupported pair | `'not-supported'` toast, return void | `'not-supported'` toast, return `suppressDrop()` — an empty edit that out-ranks VS Code's default, so nothing is inserted |
| Placement | `insertImportSnippet` orchestrator | `computeImportPlacement` + `WorkspaceEdit` |
| `clearNotifications` | Called at entry | Not called — the provider only *proposes* an edit it doesn't own, and `clearNotifications` is the window-global `notifications.clearAll`; too blunt to fire off a drag |

## `selector.ts` — `DROP_LANGUAGE_SELECTORS`

Entries covering every supported destination language: matched by VS Code language ID (`javascript`, `javascriptreact`, `typescript`, `typescriptreact`, `css`, `scss`, `html`, `markdown`, `vue`, `svelte`, `astro`), plus `.mdx` and `.tex` matched by **file pattern** (`**/*.mdx`, `**/*.tex`) — neither has a guaranteed VS Code language ID (VS Code ships no LaTeX language; a `.tex` file opens as plaintext without a LaTeX extension). All entries use `scheme: 'file'`.

These are VS Code language IDs, whereas the four-site sync and `dispatch.ts` are keyed on file extension — so the two move independently:

- **New language ID for an existing file extension** → add a `{ language, scheme: 'file' }` entry here only. The extension already flows through the four-site sync, so it needs no change.
- **New file extension** → run the four-site sync described in [`src/types/CLAUDE.md`](../types/CLAUDE.md), then register it here too: add `{ language, scheme: 'file' }` if the extension has a guaranteed VS Code language ID (skip if already listed above), otherwise add `{ pattern: '**/*.ext', scheme: 'file' }` as done for `.mdx`/`.tex`.

## Architectural position

Same layer as `commands/` — imports from `editor/`, `snippets/`, and `gating.ts`. Registered in `src/extension.ts:activate` via `vscode.languages.registerDocumentDropEditProvider(DROP_LANGUAGE_SELECTORS, new AutoImportOnDropProvider(), { dropMimeTypes: [ 'text/uri-list' ] })`.
