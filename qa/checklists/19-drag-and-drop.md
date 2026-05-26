# 19 — Drag & drop

Validates the `DocumentDropEditProvider` registered in `src/extension.ts`. Drag a file from the Explorer sidebar into an open editor — the extension generates the same import snippet as the paste commands and inserts it at the computed placement position.

**Sources:**
- `src/drop/provider.ts` — `AutoImportOnDropProvider`: source resolution from `DataTransfer`, same-file check, gating, snippet build, placement computation, `additionalEdit` insertion
- `src/drop/selector.ts` — `DROP_LANGUAGE_SELECTORS` (12 destination languages, all `scheme: 'file'`)
- `src/gating.ts` — `isPairSupported(info)` (shared with commands; same 11-clause logic tested exhaustively in [`15-gating-and-rejection.md`](15-gating-and-rejection.md))
- `src/editor/placement.ts` — `computeImportPlacement()` (shared placement logic tested exhaustively in [`13-settings-placement.md`](13-settings-placement.md))
- `src/snippets/dispatch.ts` — `buildImportSnippet(info)` (shared snippet builder)
- `src/editor/notification.ts` — `'same-file-path'` and `'not-supported'` toast variants

## Prerequisites

- [`00-setup.md`](00-setup.md) complete
- [`01-sanity-and-keybindings.md`](01-sanity-and-keybindings.md) passed (extension activated, drop provider registered)

## Setup

- Default settings (`placement = Bottom`, default styles for all languages)
- Extension Development Host with `qa/workspace/` open
- Note: DnD is available immediately once the EDH opens any supported file — no command invocation needed

## Provider registration

- [ ] **DnD widget in TS editor.** Open `src/bar.ts`. Drag `src/foo.ts` from Explorer into the editor. VS Code's drop-edit widget appears and lists an "Auto Import" entry.
- [ ] **DnD widget in CSS editor.** Open `styles/global.css`. Drag `styles/reset.css` from Explorer into the editor. Same drop-edit widget offers "Auto Import".

## Happy-path insertion

- [ ] **Script → script.** Drag `src/foo.ts` → drop into `src/bar.ts`. Accept the drop edit.
  **Expect:** TS import snippet inserted at the computed Bottom placement (after existing imports, or at line 0 if none). No text at the literal drop position.

- [ ] **Stylesheet → stylesheet.** Drag `styles/global.css` → drop into `styles/main.scss`.
  **Expect:** `@import '…'` snippet inserted (`.css` always preserved in SCSS). Placement respects the Bottom setting.

- [ ] **Image → HTML.** Drag `assets/logo.png` → drop into `pages/index.html`.
  **Expect:** `<img>` tag inserted at the drop line (HTML forces cursor placement). Snippet shape matches the `htmlImageImportStyle` setting.

- [ ] **Image → Markdown.** Drag `assets/logo.png` → drop into `docs/README.md`.
  **Expect:** Markdown image syntax at the drop line (MD forces cursor placement). Snippet shape matches the `markdownImageImportStyle` setting.

## Same-file rejection

- [ ] **Drag file onto itself.** Open `src/foo.ts`. Drag `src/foo.ts` from Explorer → drop into the same editor.
  **Expect:** warning toast `Auto Import: A file cannot import itself.` No text inserted anywhere.

- [ ] **No additionalEdit residue.** After the rejection above, verify the editor content is unchanged (no empty line, no extra whitespace).

## Unsupported-pair rejection

Each produces a `'not-supported'` toast and returns `null` (no text inserted). The toast is parameterized:
`Auto Import: Cannot import ${sourceExt} into ${destinationExt} files.`

- [ ] **Arbitrary unsupported source.** Drag `unsupported/Main.java` → drop into `src/foo.ts`.
  **Expect:** `Auto Import: Cannot import .java into .ts files.` No text inserted.

- [ ] **Cross-extension non-cross-import.** Drag `src/foo.ts` → drop into `src/sibling.js`.
  **Expect:** `Auto Import: Cannot import .ts into .js files.` No text inserted.

- [ ] **Unsupported image format in JSX.** Drag `unsupported/texture.bmp` → drop into `src/badge.jsx`.
  **Expect:** `Auto Import: Cannot import .bmp into .jsx files.` No text inserted.

## Empty/newline snippet rejection

- [ ] **Unsupported source in TSX.** Drag `unsupported/texture.bmp` → drop into `src/widget.tsx`.
  **Expect:** `Auto Import: Cannot import .bmp into .tsx files.` No text inserted. (`.bmp` not in any `_react.ts` switch case → empty snippet.)

## Placement — Top / Bottom / Cursor

- [ ] **Top.** Set `placement = Top`. Drag `src/foo.ts` → drop into `src/bar.ts`.
  **Expect:** import at line 0 regardless of drop position.

- [ ] **Bottom with existing imports.** Set `placement = Bottom`. Drag `src/foo.ts` → drop into `with-imports.ts`.
  **Expect:** import after the last existing `import` line.

- [ ] **Bottom with empty file.** Set `placement = Bottom`. Drag `src/foo.ts` → drop into `empty-file.ts`.
  **Expect:** import at line 0 (no markers found).

- [ ] **Cursor.** Set `placement = Cursor`. Drag `src/foo.ts` → drop at line 5 of `src/bar.ts`.
  **Expect:** import at line 5 (or adjusted if line 5 is inside a comment block).

- [ ] **HTML forces cursor placement.** Set `placement = Top`. Drag `src/sibling.js` → drop at line 4 of `pages/index.html`.
  **Expect:** `<script>` tag at line 4 (the drop line), NOT line 0. HTML overrides the user's placement setting.

- [ ] **Markdown forces cursor placement.** Set `placement = Top`. Drag `assets/logo.png` → drop at line 3 of `docs/README.md`.
  **Expect:** image syntax at line 3, NOT line 0.

## Comment-block adjustment

- [ ] **Drop inside multi-line comment.** Set `placement = Cursor`. Open a `.ts` file with a multi-line comment block (e.g., lines 3–6 are `/* ... */`). Drag `src/foo.ts` → drop at line 4 (inside the comment).
  **Expect:** import placed ABOVE the comment block (line 3 or earlier), not merged into the comment.

## Astro frontmatter awareness

- [ ] **Top within frontmatter.** Set `placement = Top`. Drag `src/foo.ts` → drop into `src/App.astro`.
  **Expect:** import inside the frontmatter, after the opening `---` line.

- [ ] **Bottom within frontmatter.** Set `placement = Bottom`. Drag `src/foo.ts` → drop into `src/App.astro` (with existing imports inside frontmatter).
  **Expect:** import after the last import line within the `---` fences.

- [ ] **Drop outside frontmatter (Cursor mode).** Set `placement = Cursor`. Drag `src/foo.ts` → drop below the closing `---` in `src/App.astro`.
  **Expect:** falls back to Bottom within the frontmatter (import does NOT appear in the HTML body below the fences).

## Vue/Svelte `<script>` block awareness

- [ ] **Vue.** Drag `src/foo.ts` → drop into `src/App.vue` (has `<script setup>`). Accept the drop edit.
  **Expect:** import inside the `<script setup>` block.

- [ ] **Svelte.** Drag `src/foo.ts` → drop into `src/App.svelte` (has `<script>`). Accept the drop edit.
  **Expect:** import inside the `<script>` block.

## Inline snippet — image into CSS/SCSS

- [ ] **Image into SCSS.** Set any placement. Drag `assets/logo.png` → drop at a specific position inside `styles/main.scss` (e.g., inside a `background:` value).
  **Expect:** `url(...)` inserted at the exact drop position (line and column). No `additionalEdit` — the `DocumentDropEdit` carries the snippet directly.

- [ ] **Image into CSS.** Drag `assets/logo.png` → drop into `styles/global.css` at an arbitrary position.
  **Expect:** same inline insertion at the drop coordinates.

## Non-inline uses `additionalEdit`

- [ ] **Script import placement.** Drag `src/foo.ts` → drop at line 10 of `src/bar.ts` (with `placement = Bottom` and existing imports at lines 0–3).
  **Expect:** no text appears at line 10 (the drop position). Import appears after line 3 (the computed Bottom position). The drop edit uses `additionalEdit` with empty `insertText`.

## Differences from paste — no clipboard/stat checks

- [ ] **No `'empty-clipboard'` toast.** The DnD source comes from `DataTransfer`, not the clipboard. Regardless of clipboard contents, DnD works normally. Copy garbage text to clipboard → drag a valid file → import inserts correctly.

- [ ] **No `'source-not-found'` toast.** Dragged files exist by definition (they're in the Explorer). The `fs.stat` check from the paste command is skipped entirely.

- [ ] **No `clearNotifications`.** Trigger a warning toast via paste (e.g., paste into self for `'same-file-path'`). Without dismissing it, drag a valid file and drop. **Expect:** the prior toast is NOT dismissed; the new import is inserted alongside the lingering toast.

## Known limitations

- **Drop-edit widget acceptance varies by VS Code version.** Some versions require holding Shift during drop; others show a dropdown widget. This is standard `DocumentDropEditProvider` behavior, not an extension bug.
- **Multi-file drag not supported.** Only the first `text/uri-list` entry is resolved. Selecting multiple files and dragging inserts an import only for the first file.
- **`text/plain` fallback only for absolute paths.** If `text/uri-list` is absent and `text/plain` contains a relative path, the provider returns `null` and VS Code handles the drop with its default behavior.
- **No `'no-active-editor'` scenario.** The `DocumentDropEditProvider` is only called when an editor is already the drop target — VS Code guarantees the document exists.

## Sign-off

- [ ] Provider registered and discoverable (2 cases)
- [ ] Happy-path insertion (4 destination types)
- [ ] Same-file rejection (2 cases)
- [ ] Unsupported-pair rejection (3 cases)
- [ ] Empty/newline snippet rejection (1 case)
- [ ] Placement settings respected (6 cases)
- [ ] Comment-block adjustment (1 case)
- [ ] Astro frontmatter (3 cases)
- [ ] Vue/Svelte script block (2 cases)
- [ ] Inline snippet at drop position (2 cases)
- [ ] Non-inline uses additionalEdit (1 case)
- [ ] Differences from paste verified (3 cases)

Tester / date: ___________________
