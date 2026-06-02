# qa.new/checklists/

Manual QA checklists for the extension. One general checklist for shared behavior, plus one per destination language.

## Execution order

1. **`general.md`** — always run first. Covers cross-destination shared behavior.
2. Per-destination checklists — run after general passes. Each assumes general's items are already verified.

## Inventory

| Checklist | Cases | Scope |
|-----------|-------|-------|
| [`general.md`](general.md) | 55 | Copy File Path, clipboard validation, same-file rejection, Alt+D failure paths, all notification toasts + buttons, edge cases (rapid pastes, many files, unicode, spaces), path computation, extension stripping, DnD universal behaviors, Pick Style QuickPick mechanics, Set Default QuickPick mechanics, settings mid-session |
| [`css.md`](css.md) | 30 | Allow-list gating (`.css` + 7 image exts), 2 `@import` styles + fixed image `url()` arm + style-name drift, no smart identifiers (§5 N/A), Top/Bottom/Cursor placement + inline-`url()` (placement-ignored), Pick Style, Set Default, drag-and-drop, shared `@use`/`@forward` marker edges |
| [`html.md`](html.md) | 75 | Allow-list gating (`.js` `.css` + image/video/audio/`.vtt`; `.html`→`.html` rejected), 6-way source-type dispatch (`<script>`/`<img>`/`<video>`/`<audio>`/`<link>`/`<track>`), no smart identifiers (§5 N/A), `forced-cursor` placement (setting ignored, column follows cursor), always-keep-extension, Pick Style (3 tagless style-0 descriptions), Set Default, drag-and-drop, comment-marker mismatch edges |
| [`javascript.md`](javascript.md) | ~65 | Gating matrix (21 pairs), 7 import styles + style-name drift, no smart identifiers (§5 N/A for `.js`), Bottom/Top/Cursor placement, Pick Style, Set Default, drag-and-drop, edge cases |
| [`jsx.md`](jsx.md) | ~70 | Accept-all gating (17-row matrix, 0 source rejections; same-file owned by general.md), two-arm style model via source-extension dispatch (7 JavaScript styles **or** 4 fixed asset shapes) + style-name drift, no smart identifiers (§5 N/A), Bottom/Top/Cursor placement incl. leading-`*`-is-comment, `.ts`/`.tsx`→empty-snippet, Pick Style, Set Default (shared `javascriptImportStyle`), drag-and-drop incl. raw-text fallback |
| [`markdown.md`](markdown.md) | 44 | Allow-list gating (`.md` + 7 image; **`.md`→`.md` accepted**, media/`.vtt`/data/stylesheets rejected), 2-way source-type dispatch (fixed `[text](…)` link + 3 `markdownImageImportStyle` image styles) + style-name drift, no smart identifiers (§5 N/A), `forced-cursor` placement (setting ignored, column follows cursor, markdown-star quirk), always-keep-extension, Pick Style, Set Default, drag-and-drop, markdown-star vs `.tsx` edge |
| [`scss.md`](scss.md) | ~65 | Allow-list gating (21 pairs: `.scss` + `.css` + 7 image), 5 `@use`/`@forward`/`@import` styles + fixed image `url()` arm + style-name drift, no smart identifiers (§5 N/A), Bottom/Top/Cursor placement + inline-`url()`, partial-`_` normalization, `preserveStylesheetFileExtension` toggle, Pick Style, Set Default, drag-and-drop, edge cases |
| [`tsx.md`](tsx.md) | ~89 | Accept-all gating (18-row matrix, 0 source rejections; same-file owned by general.md), two-script-arm + asset style model (7 TypeScript styles for `.ts`/`.tsx` **or** 7 JavaScript styles for `.js`/`.jsx` via fallback **or** 4 fixed asset shapes; every source non-empty — no empty-snippet case) + style-name drift, Angular-only smart identifiers (style 0; no exported-class fill), Bottom/Top/Cursor placement incl. leading-`*`-is-comment, shared `typescriptImportStyle`/`javascriptImportStyle`, Pick Style, Set Default, drag-and-drop (no raw-text fallback), markdown-star `.mdx`≠`.tsx` edge |
| [`typescript.md`](typescript.md) | ~88 | Gating matrix (21 pairs), 7 import styles + style-name drift, smart identifiers (exported-class detection + Angular PascalCase), Bottom/Top/Cursor placement, Pick Style (TS-specific), Set Default (TS-specific), drag-and-drop (TS-specific), edge cases |

## Workspace counterparts

Every checklist has a matching fixture directory under `workspace/`:

```
checklists/general.md      →  workspace/general/
checklists/css.md          →  workspace/css/
checklists/html.md         →  workspace/html/
checklists/javascript.md   →  workspace/javascript/
checklists/jsx.md          →  workspace/jsx/
checklists/markdown.md     →  workspace/markdown/
checklists/scss.md         →  workspace/scss/
checklists/tsx.md          →  workspace/tsx/
checklists/typescript.md   →  workspace/typescript/
```

When a checklist is updated, ensure the workspace counterpart has every fixture file the checklist references.
