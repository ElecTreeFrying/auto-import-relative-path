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
| [`javascript.md`](javascript.md) | ~65 | Gating matrix (21 pairs), 7 import styles + style-name drift, no smart identifiers (§5 N/A for `.js`), Bottom/Top/Cursor placement, Pick Style, Set Default, drag-and-drop, edge cases |
| [`scss.md`](scss.md) | ~65 | Allow-list gating (21 pairs: `.scss` + `.css` + 7 image), 5 `@use`/`@forward`/`@import` styles + fixed image `url()` arm + style-name drift, no smart identifiers (§5 N/A), Bottom/Top/Cursor placement + inline-`url()`, partial-`_` normalization, `preserveStylesheetFileExtension` toggle, Pick Style, Set Default, drag-and-drop, edge cases |
| [`typescript.md`](typescript.md) | ~88 | Gating matrix (21 pairs), 7 import styles + style-name drift, smart identifiers (exported-class detection + Angular PascalCase), Bottom/Top/Cursor placement, Pick Style (TS-specific), Set Default (TS-specific), drag-and-drop (TS-specific), edge cases |

## Workspace counterparts

Every checklist has a matching fixture directory under `workspace/`:

```
checklists/general.md      →  workspace/general/
checklists/css.md          →  workspace/css/
checklists/javascript.md   →  workspace/javascript/
checklists/scss.md         →  workspace/scss/
checklists/typescript.md   →  workspace/typescript/
```

When a checklist is updated, ensure the workspace counterpart has every fixture file the checklist references.
