# src/snippets/languages/CLAUDE.md

The nine leaf snippet builders — one per destination language. Each takes an already-classified source and returns a `vscode.SnippetString`; none switch on the *destination* (that is `dispatch.ts`). This file covers the rules for editing a builder. The cross-cutting behavior these builders implement — the legacy-Angular fallback, the SCSS partial/`.css` quirks, the HTML/Markdown shape catalogues, the JSX/TSX/MDX shared `../_react.ts` algorithm, and the `../_styles.ts` ↔ `package.json` byte-equality contract — is documented once in the parent [`../CLAUDE.md`](../CLAUDE.md). Read that first; this is the local layer on top.

## Files

The full inventory with one-line purposes is in [`README.md`](README.md). For editing, the modules fall into three contract shapes:

- **Styled languages** (`javascript.ts`, `typescript.ts`, `css.ts`, `scss.ts`, `html.ts`, `markdown.ts`) — each exposes a pure `buildXImportSnippetByStyle(styleIndex, relativePath)` switch, with the config lookup sitting above it. See the config/pure split below.
- **React entries** (`jsx.ts`, `tsx.ts`) — thin; each only exports `buildSnippet` and delegates the algorithm to `../_react.ts`. The `.mdx` destination reuses `tsx.ts`.
- **Component frameworks** (`framework-component.ts`) — only exports `buildSnippet`; defers to `typescript.ts` for Vue/Svelte/Astro alike.

## The config/pure split

Every styled language separates *resolving which style* from *rendering that style*:

- **Pure renderer** — `buildXImportSnippetByStyle(styleIndex, relativePath, …)` takes an explicit index, reads no config, and `switch`es to the matching shape. `variants.ts` calls these directly — twice per `*_IMPORT_OPTIONS` entry (full path for the insertion payload, basename for the picker label) — to enumerate every style without touching config.
- **Config lookup** — the `getAutoImportSetting` + `resolveStyleIndex` pair that picks the index. It sits *above* the renderer: in a `buildXImportSnippet` wrapper (`buildJavaScriptImportSnippet`, `buildTypeScriptImportSnippet`, `buildCssImportSnippet`; a private wrapper in `markdown.ts`) or inline in `buildSnippet` (`scss.ts`, `html.ts`, which resolve per source-type and call the renderer directly). `dispatch.ts` always reaches a renderer through this lookup; `variants.ts` bypasses it.

**Keep the `…ByStyle` renderers config-free.** That purity is the whole point — it lets `variants.ts` enumerate styles independently. A config read inside a renderer breaks the pick-style and set-default commands. Config belongs above the renderer, never inside it.

**Keep each `switch` aligned with `../_styles.ts`.** A renderer's `case` indices must correspond to the `value`s in that language's `*_IMPORT_OPTIONS` table, and the `default:` arm must emit a sensible shape (it fires when `resolveStyleIndex` returns `undefined` on config drift). The `description` strings — not the indices — are the byte-exact contract with `package.json`; that contract is owned by the parent [`../CLAUDE.md`](../CLAUDE.md).

## Intra-directory delegation

Builders reuse each other rather than duplicating a shape. These are the *only* imports between `languages/` modules — keep the graph this shallow:

- `jsx.ts` → `javascript.ts`; `tsx.ts` → `javascript.ts` + `typescript.ts` (the script builders handed to `../_react.ts` as primary/fallback).
- `scss.ts` → `css.ts:buildCssImageImportSnippet` (image `url('…')` is identical across CSS/SCSS, so no SCSS-specific image variant exists).
- `framework-component.ts` → `typescript.ts:buildTypeScriptImportSnippet` (Vue/Svelte/Astro all import like TS).

Editing a shared builder (`buildJavaScriptImportSnippet`, `buildTypeScriptImportSnippet`, `buildCssImageImportSnippet`) changes every caller above. Grep before you touch one.

## Source classification — who branches on what

Three strategies decide which shape a source gets. Know which one a file uses before editing it:

- **`determineImportType(sourceFilePath)`** (from `../../path/`) — `css.ts`, `scss.ts`, `html.ts`, `markdown.ts` branch on the seven-way classifier (`image` / `video` / `audio` / `text-track` / `script` / `stylesheet` / `markdown`). It returns `null` for `.scss` and `.html`, which is why `scss.ts` falls to its own `default:` for stylesheet sources. See [`../../path/CLAUDE.md`](../../path/CLAUDE.md).
- **Raw source extension** — `jsx.ts` / `tsx.ts` (via `../_react.ts`) branch on the literal `.ts`/`.tsx`/`.js`/`.jsx` extension for the script path, then fall to a hardcoded asset `switch`. `framework-component.ts` branches on its `SCRIPT_SOURCE_EXTENSIONS` set.
- **No classification** — `javascript.ts` and `typescript.ts` always emit a script import; the destination already implies a scripty source (gating guaranteed it upstream).

## `buildSnippet` entry contract

`dispatch.ts` calls `buildSnippet(info: FilePathInfo)` on exactly one module per destination. When adding or editing one:

- **`typescript.ts:buildSnippet` is the only `async` builder** — it awaits `readExportedClassName(sourceFilePath)` for class-name pre-fill. `dispatch.ts:buildImportSnippet` is already `async` and returns `Promise<vscode.SnippetString>`, so a new async `buildSnippet` is fine; just type it that way.
- **Two kinds of `default:` arm — don't confuse them.** A `…ByStyle` *style-index* switch ends in a `default:` that returns a real shape (style 0); it fires when `resolveStyleIndex` returns `undefined` on config drift, so the user still gets a sensible import. The *source-type* switch in `html.ts` and `markdown.ts` instead ends in `default: new vscode.SnippetString('')` — an empty result that surfaces as "nothing inserted" and means a pair `isPairSupported` (`src/gating.ts`) should have rejected slipped through. Empty output → fix the gate, not the builder.

## Adding a builder

In this directory you add the file and uphold the contracts above:

1. New `<language>.ts` exporting `buildSnippet(info): vscode.SnippetString` (or `Promise<…>` if it must read the source file).
2. If it has user-selectable styles, add the pure `buildXImportSnippetByStyle` renderer plus its config lookup, and a `*_IMPORT_OPTIONS` table in `../_styles.ts`.

Everything outside this directory — the `dispatch.ts`/`variants.ts` cases, the four-site extension sync, gating, and the drop selector — is the eight-step checklist in the parent [`../CLAUDE.md`](../CLAUDE.md). Do all of it: a builder wired into `dispatch.ts` but not `variants.ts` silently breaks the pick-style command.
