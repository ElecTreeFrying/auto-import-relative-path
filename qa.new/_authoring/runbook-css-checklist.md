# Runbook — `.css` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/css.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/css.md` during generation.**

Drives **session 5a** (`generate-css-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/css.md`. Committed together with this runbook in one commit.

## Generation notes (approved for `.css`)

`.css` is the first **stylesheet** destination and the first **source-type-dispatched**
destination — it splits every applicable section into two branches. Approved structural
decisions, to apply when writing the checklist:

- **Two source-type branches, both covered everywhere.** `css.ts:buildSnippet` switches
  on `determineImportType`: a **stylesheet** source (`.css`) → `@import` (`CSS_IMPORT_OPTIONS`,
  2 styles); an **image** source → fixed `url('<path>')` (single shape). §2, §4, §6, §7, §8,
  §9 each carry both arms — never orphan the image `url()` shape.
- **`smartId: none` → §5 (Smart identifier) is OMITTED.** Keep canonical RECIPE section
  numbers (§1–§4, then §6–§11) and drop a one-line marker where §5 would sit:
  *"§5 (Smart identifier) — N/A for `.css`: no exported-class detection, no Angular
  PascalCase."* The visible gap is the intended signal, not a defect. No exported-class or
  Angular language appears anywhere in the checklist.
- **Default style is `@import '<path>';`** (`cssImportStyle` index 0). Drives the §2
  stylesheet happy-path and the §4 "(default)" row. Style 1 is `@import url('<path>');`.
- **No tab stops in any `.css` snippet.** `@import '<path>';`, `@import url('<path>');`, and
  `url('<path>')` are literal strings — no `$1` / `${1:…}`. The §2/§4 "tab-stop layout"
  assertion for `.css` is "the cursor does not land in a placeholder" — a real delta from the
  JS/TS script destinations.
- **`always-preserve-css` → NO preserve-toggle test.** `css.ts:11` builds `fullPath` and never
  reads a preserve setting, so the `@import`/`url()` path always keeps the full source extension
  (`@import './theme.css';`, not `@import './theme';`). §4 carries the always-keep-extension
  note and emits **no** `preserveScriptFileExtension` / `preserveStylesheetFileExtension` case.
  (This is the RECIPE `.css` slot — the suppression is `.html`/`.md`/`.css` only and must not be
  confused with `.scss`, which DOES get a toggle test.)
- **Two placement modes.** stylesheet source → `stylesheet` mode (honors Top/Bottom/Cursor,
  **column 0**, Bottom anchors after the last `@import`/`@use`/`@forward` line — observably
  different from script Bottom; `/* */` comment-block Cursor adjustment). image source →
  `inline-url` mode (`isInlineSnippet` true → `url('<path>')` at the **exact cursor line AND
  column, no trailing newline**, placement setting **ignored**). §6 emits both arms; the generic
  script-side section is NOT emitted.
- **One-way `.scss → .css` rejection.** `CSS_SUPPORTED_EXTENSIONS` omits `.scss`, so `.css`
  imports `.scss`? No — CSS rejects `.scss` even though SCSS imports CSS. §1 carries this as a
  mandatory reject row (toast `Cannot import .scss into .css files.`) and §9(b) re-exercises it
  on drop.
- **DELTA-only §7/§8/§9, cross-referencing `general.md`.** §7 → `general.md §9` (Pick Style
  universal mechanics), §8 → `general.md §10` (Set Default universal mechanics), §9 →
  `general.md §8` (Drag-and-drop universal mechanics). `general.md` is assumed passed; re-test
  only the `.css` DELTA.
- **Set-Default toast ≠ Pick-Style description.** Pick Style shows the variant **description =
  tag** (`@import with quoted path` / `@import with url() function`); Set Default's saved toast
  shows the **enum value string** (`Auto Import: Default style saved — @import '_relativePath_';`,
  via `set-default-import-style.ts:70` passing `picked.setting.value`). Same style, two surfaced
  strings — do not conflate. The image source has no configurable setting → Set Default returns
  `Auto Import: .png → .css imports use a fixed style.`
- **DnD untitled-buffer no-op precondition is emitted once, not here** — `typescript.md §9.10`
  carries the canonical "tested once for all 12" instance; §9 gets a one-line pointer to it
  rather than re-testing.
- **Shape/quality bar per RECIPE** (executable steps naming file + gesture + verbatim result;
  fixture-content inlining). **Generation reads RECIPE + the `.css` PROFILE row + the named
  source-of-truth files only — never the design spec, never another language's checklist**
  (RECIPE boundary).

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.css` (gating · styles · smartId ·
      defaultStyle · placement · pathQuirks)
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail, per-quirk slots,
      authoring rules)
- [x] Read source-of-truth files for `.css`:
      - `src/snippets/languages/css.ts` — per `dispatch.ts`, `.css` → `css.ts`: the
        `buildSnippet` source-type switch (`image` → `buildCssImageImportSnippet`; `default` →
        `buildCssImportSnippet`), the `buildCssImportSnippetByStyle` 2-case switch + `default:`
        (style-0) arm, and `buildCssImageImportSnippet` (fixed `url('<path>')`). Note `fullPath`
        (`:11`) always appends the source extension — no preserve read.
      - `src/snippets/_styles.ts` — `CSS_IMPORT_OPTIONS` (2 entries: literal descriptions +
        tags) and `CSS_IMAGE_IMPORT_OPTIONS` (1 entry, dormant). Confirm **no tab stops** in any
        rendered shape.
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — `buildCssVariants`
        (image → 1 hardcoded variant, no `setting`; stylesheet → 2 styled variants carrying
        `setting { namespace: 'stylesheet', key: 'css', value: opt.description }`), the `.css`
        destination dispatch, the basename-label vs full-path-insertion split, and
        `description = opt.tag ?? opt.description`.
      - `src/path/import-type.ts` — `determineImportType`: `.css` → `stylesheet`, images
        (`default`) → `image`; this resolves which `case` of the `css.ts` source-type switch each
        source lands in (the `css.ts` labels are buckets, not extensions).
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the two `.css` modes:
        **`stylesheet`** (column 0 via `STYLESHEET_FILE_EXTENSIONS`; Top/Bottom/Cursor; Bottom
        scans `IMPORT_INDICATORS` incl. `@import '`/`@use '`/`@forward '`; `adjustForCommentBlock`
        Cursor adjustment) and **`inline-url`** (`isInlineSnippet` true for non-stylesheet →
        stylesheet → exact cursor line+column, no `\n`, setting ignored).
      - `src/gating.ts` — the `.css` allow-list clause (`:29-31`): accepts
        `CSS_SUPPORTED_EXTENSIONS` (`.css` + image), rejects the rest; reject toast
        `Cannot import .X into .css files.`. Note the one-way asymmetry: `.scss → .css` rejected.
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — `CSS_SUPPORTED_EXTENSIONS`
        literal members + the closed `SOURCE_UNIVERSE` for the §1 reject complement;
        `STYLESHEET_FILE_EXTENSIONS` (`.scss .css`) drives column-0 + inline gating.
      - `package.json` (`contributes.configuration` enums + `default`) — `cssImportStyle`
        default `@import '_relativePath_';` (index 0) + enum [quoted, url()]; `cssImageImportStyle`
        single-entry `url('_relativePath_')` (dormant); `importStatementPlacement` enum
        Top/Bottom/Cursor; `preserveStylesheetFileExtension` — NOT consulted by `.css`.
      - **N/A for `.css` (do NOT read — conditional files for other destinations):**
        `src/snippets/_class-name.ts` (smart-ID destinations only: `.ts`) ·
        `src/snippets/_react.ts` (React-family only: `.jsx`/`.tsx`/`.mdx`)
- [x] Write `qa.new/checklists/css.md` per RECIPE + the `.css` PROFILE row + the generation
      notes above, with expected fixture content inlined for every referenced path. Sections:
      §1 gating matrix (`.css` + image accepts; categorised reject rows incl. the mandatory
      `.scss → .css` row) · §2 happy path — two branches (`@import './theme.css';` ·
      `url('./logo.png')`) · §3 Insert from Selected File (`Alt+D`) · §4 all 2 stylesheet styles
      + image fixed-shape arm + always-keep-extension note + style-name drift · **(§5 omitted —
      marker)** · §6 placement — stylesheet (Top/Bottom/Cursor, col 0, `@import`-anchored Bottom)
      + inline-url (image exact-position, no newline, setting-ignored) · §7 Pick Style (DELTA,
      xref §9) · §8 Set Default (DELTA, xref §10) · §9 Drag-and-drop (DELTA, xref §8) · §10 edge
      cases · §11 sign-off
- [x] Self-verify: every RECIPE section the `.css` profile marks **required** is present
      (§1, §2, §3, §4, §6, §7, §8, §9, §10, §11)
- [x] Self-verify: **no excluded section was emitted** — §5 (Smart identifier) is ABSENT
      (smartId: none) and replaced by the one-line N/A marker; no exported-class or Angular
      language appears anywhere in the checklist
- [x] Self-verify: section 4 enumerates **exactly 2** stylesheet styles (N = `CSS_IMPORT_OPTIONS`
      count), each with its literal inserted string + the "no tab stop" note, plus the image
      fixed-shape arm (single `url('<path>')`, not configurable) and the style-name-drift
      sub-item resolving to the style-0 shape `@import '<path>';`
- [x] Self-verify: every fixture path referenced has its expected content inlined
      (fixture-content-inlining rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file, the exact
      gesture (keybinding / Command Palette entry / drag-drop), and the exact expected result
      (literal inserted string or verbatim toast); no step requires the tester to guess
- [x] Self-verify: every section that has universal mechanics carries the one-line `general.md`
      cross-reference (§7→§9, §8→§10, §9→§8) and re-tests only the DELTA
- [x] Self-verify (`.css`-specific): **no** `preserve*FileExtension` toggle test is emitted
      (always-preserve-css); the always-keep-extension note is present in §4; **both** source-type
      branches (stylesheet + image) appear in §2/§4/§6/§7/§8/§9; §1 carries the `.scss → .css`
      rejection row
