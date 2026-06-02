# Runbook — `.scss` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/scss.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/scss.md` during generation.**

Drives **session 6a** (`generate-scss-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/scss.md`. Committed together with this runbook in one commit.

## Generation notes (approved for `.scss`)

`.scss` is the second **stylesheet** destination (after `.css`, 5a) and the suite's richest
`pathQuirks` row. Like `.css` it is **source-type-dispatched** (`scss.ts:buildSnippet` switches on
`determineImportType`), so every applicable section splits into two branches. Approved structural
decisions, to apply when writing the checklist:

- **Two source-type branches, both covered everywhere.** A **stylesheet** source (`.scss` *and*
  `.css` — `determineImportType('.scss')→null`, `('.css')→'stylesheet'`, both fall to `scss.ts`'s
  `default:`) → `@use` (`SCSS_IMPORT_OPTIONS`, 5 styles); an **image** source → fixed `url('<path>')`
  (single shape, via `buildCssImageImportSnippet` reused from `css.ts`). §2, §4, §6, §7, §8, §9 each
  carry both arms — never orphan the image `url()` shape.
- **5 styles; tab stops only on styles 1 & 2.** `@use '<path>' as ${1:*};` (style 1, lands on `*`)
  and `@use '<path>' as $1;` (style 2, lands after `as `) carry a placeholder; styles 0
  (`@use '<path>';`), 3 (`@forward '<path>';`), and 4 (`@import '<path>';`) insert with **no** cursor
  stop. The §2/§4 "tab-stop layout" assertion for 0/3/4 is "the cursor does not land in a
  placeholder" — a real delta from the JS/TS script destinations.
- **`smartId: none` → §5 (Smart identifier) is OMITTED.** Keep canonical RECIPE section numbers
  (§1–§4, then §6–§11) and drop a one-line marker where §5 would sit: *"§5 (Smart identifier) — N/A
  for `.scss`: no exported-class detection, no Angular PascalCase."* The visible gap is the intended
  signal, not a defect. No exported-class or Angular language appears anywhere in the checklist.
- **Default style is `@use '<path>';`** (`scssImportStyle` index 0). Drives the §2 stylesheet
  happy-path and the §4 "(default)" row.
- **`pathQuirks` — all three present (the RECIPE `.scss` per-quirk slots):**
  - **`partial-filename-normalization`** → §4 subsection: `_variables.scss` source →
    `@use './abstracts/variables';` (leading `_` of the **last** path segment stripped by
    `normalizePartialFilename`).
  - **`stylesheet-preserve-toggle`** → §4 subsection testing **`preserveStylesheetFileExtension`**
    (setting label *"Preserve stylesheet file extension in imports"*,
    `auto-import.importStatement.styleSheet.preserveStylesheetFileExtension`, default `false`):
    OFF → `@use './abstracts/variables';`, ON → `@use './abstracts/variables.scss';` (fixture
    `_variables.scss`), with a restore step. This is the stylesheet analogue of the script
    `preserveScriptFileExtension` test (`typescript.md §7.6`); it uses a **different** setting label
    (stylesheet namespace, not the script key) and **must NOT** be suppressed by the always-preserve
    rule. The `.html`/`.md`/`.css` toggle-suppression does **not** bleed into `.scss`.
  - **`always-preserve-css`** → §4 note: a `.css` source keeps `.css` regardless of either toggle
    (`scss.ts:48-54` short-circuits before the preserve read). Quote `package.json`'s own rationale:
    ".css extensions are always preserved inside .scss imports — Sass requires the extension to
    recognise a foreign-language import, and this setting has no effect there."
  - The **image branch does neither** (full extension, no `_`-strip) — surfaced as a §10 edge case.
- **`always-preserve-css` ≠ the `.css`-destination suppression.** `.scss` DOES get a preserve-toggle
  test (against the stylesheet key); only `.css`/`.html`/`.md` omit the toggle test entirely.
- **One-way `.css ↔ .scss`.** `SCSS_SUPPORTED_EXTENSIONS` includes `.css`, so `.css → .scss` is
  **accepted** (renders `@use './x.css';`); the reverse `.scss → .css` is rejected (that was
  `css.md`'s §1). §1 carries `.css → .scss` as an accept row with the one-directional note.
- **Set-Default toast ≠ Pick-Style description.** Pick Style shows the variant **description = tag**
  (`Modern @use — Sass module system (recommended)`, etc.); Set Default's saved toast shows the
  **enum value string** (`Auto Import: Default style saved — @use '_relativePath_';`, via
  `set-default-import-style.ts` passing `picked.setting.value` = `opt.description`). Same style, two
  surfaced strings — do not conflate. The image source has no configurable setting → Set Default
  returns `Auto Import: .png → .scss imports use a fixed style.`
- **DELTA-only §7/§8/§9, cross-referencing `general.md`.** §7 → `general.md §9` (Pick Style universal
  mechanics), §8 → `general.md §10` (Set Default universal mechanics), §9 → `general.md §8`
  (Drag-and-drop universal mechanics). `general.md` is assumed passed; re-test only the `.scss` DELTA.
- **DnD untitled-buffer no-op precondition is emitted once, not here** — `typescript.md §9.10` carries
  the canonical "tested once for all 12" instance; §9 gets a one-line pointer to it rather than
  re-testing.
- **No per-language `edge-cases/` dir.** Unicode-filename / spaces-in-path cases are general-owned
  (`general/edge-cases/`); `.scss` adds only the destination-specific §10 cases under `scss/`.
- **Shape/quality bar per RECIPE** (executable steps naming file + gesture + verbatim result;
  fixture-content inlining; `typescript.md` is the reference shape). **Generation reads RECIPE + the
  `.scss` PROFILE row + the named source-of-truth files only — never the design spec, never another
  language's checklist** (incl. `css.md`) (RECIPE boundary).

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.scss` (gating · styles · smartId ·
      defaultStyle · placement · pathQuirks)
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail, per-quirk slots,
      authoring rules)
- [x] Read source-of-truth files for `.scss`:
      - `src/snippets/languages/scss.ts` — per `dispatch.ts`, `.scss` → `scss.ts`: the `buildSnippet`
        source-type switch (`image` → `buildCssImageImportSnippet`; `default` → the stylesheet path:
        `prepareScssImportPath` + `resolveStyleIndex(SCSS_IMPORT_OPTIONS, …)` →
        `buildScssImportSnippetByStyle`), the **5-case** style switch + `default:` (style-0) arm, and
        the quirk helpers: `prepareScssImportPath = normalizePartialFilename(relativePath +
        determineScssExtension(...))`; `determineScssExtension` (`.css` source → always `.css`;
        else respect `preserve`); `normalizePartialFilename` (strip leading `_` of the **last**
        segment only).
      - `src/snippets/languages/css.ts` — `buildCssImageImportSnippet` (fixed `url('<path>')`, no tab
        stop), reused for `.scss` image sources; confirm no SCSS-specific image variant exists.
      - `src/snippets/_styles.ts` — `SCSS_IMPORT_OPTIONS` (5 entries: literal description strings +
        tags). Confirm tab stops appear **only** on style 1 (`${1:*}`) and style 2 (`$1`); styles
        0/3/4 are literal with no placeholder. (`scssImage` table absent — image reuses CSS.)
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — `buildScssVariants` (image → 1
        hardcoded variant, no `setting`; stylesheet → 5 styled variants carrying
        `setting { namespace: 'stylesheet', key: 'scss', value: opt.description }`, each built twice:
        full `scssPath` for `snippetText` vs `path.basename(scssPath)` for `label` — and `scssPath`
        is `prepareScssImportPath`, so partial-normalization + extension handling apply to the picker
        **label** too), the `.scss` destination dispatch, and `description = opt.tag ?? opt.description`.
      - `src/path/import-type.ts` — `determineImportType`: `.scss` → `null`, `.css` → `stylesheet`,
        images (`default`) → `image`; this resolves which `case` of the `scss.ts` source-type switch
        each source lands in (the `scss.ts` labels are buckets, not extensions). Both `.scss` (null)
        and `.css` (stylesheet) land in `scss.ts`'s `default:` (the `@use` arm); only `image` diverts.
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the two `.scss` modes:
        **`stylesheet`** (column 0 via `STYLESHEET_FILE_EXTENSIONS`; Top/Bottom/Cursor; Bottom scans
        `IMPORT_INDICATORS` incl. `@use '`/`@use "`/`@forward '`/`@forward "`/`@import '`/`@import "`/
        `@import url(`; `adjustForCommentBlock` Cursor adjustment, `//` and `/* */` both adjust above)
        and **`inline-url`** (`isInlineSnippet` true only for a **non-stylesheet** source into a
        stylesheet dest → image only; exact cursor line **+ column**, no `\n`, setting ignored). Note
        a `.css` source is a stylesheet source → NOT inline (placed as a normal `@use` statement).
      - `src/gating.ts` — the `.scss` allow-list clause (`:32-34`): accepts `SCSS_SUPPORTED_EXTENSIONS`
        (`.scss` + `.css` + image), rejects the rest; reject toast
        `Auto Import: Cannot import .X into .scss files.`. The first clause also makes any
        non-supported source fall through; note the one-way asymmetry (`.css → .scss` accepted,
        `.scss → .css` rejected).
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — `SCSS_SUPPORTED_EXTENSIONS`
        literal members (`.scss .css` + `IMAGE_FILE_EXTENSIONS`) + the closed `SOURCE_UNIVERSE` for
        the §1 reject complement; `STYLESHEET_FILE_EXTENSIONS` (`.scss .css`) drives column-0 + inline
        gating.
      - `package.json` (`contributes.configuration` enums + `default`) — `scssImportStyle` default
        `@use '_relativePath_';` (index 0) + 5-entry enum/enumDescriptions (byte-exact with
        `SCSS_IMPORT_OPTIONS`); `scssImageImportStyle` single-entry `url('_relativePath_')` (dormant);
        `preserveStylesheetFileExtension` (title "Preserve stylesheet file extension in imports",
        default `false`); `importStatementPlacement` enum Top/Bottom/Cursor (default Bottom).
      - `src/config/settings.ts` — setting-key → VS Code label mapping for executable steps:
        `('stylesheet','scss')` → `auto-import.importStatement.styleSheet.scssImportStyle`;
        `('stylesheet','preserve')` → `…styleSheet.preserveStylesheetFileExtension`;
        `('preferences','placement')` → `auto-import.preferences.importStatementPlacement`.
      - **N/A for `.scss` (do NOT read — conditional files for other destinations):**
        `src/snippets/_class-name.ts` (smart-ID destinations only: `.ts`) ·
        `src/snippets/_react.ts` (React-family only: `.jsx`/`.tsx`/`.mdx`).
- [x] Write `qa.new/checklists/scss.md` per RECIPE + the `.scss` PROFILE row + the generation notes
      above, with expected fixture content inlined for every referenced path. Sections:
      §1 gating matrix (`.scss` + `.css` + image accepts incl. the one-way `.css → .scss` note;
      categorised reject rows: script/framework/markdown/media/text-track/data/font/document/html) ·
      §2 happy path — two branches (`@use './theme';` · `url('./logo.png')`) · §3 Insert from Selected
      File (`Alt+D`) · §4 all 5 stylesheet styles (tab-stop note per style) + image fixed-shape arm +
      partial-normalization subsection + `preserveStylesheetFileExtension` toggle subsection +
      always-keep-`.css` note + style-name drift · **(§5 omitted — marker)** · §6 placement —
      stylesheet (Top/Bottom/Cursor, col 0, `@use`/`@forward`/`@import`-anchored Bottom, comment-Cursor
      adjustment) + inline-url (image exact line+column, no newline, setting-ignored) · §7 Pick Style
      (DELTA, xref §9) · §8 Set Default (DELTA, xref §10) · §9 Drag-and-drop (DELTA, xref §8) · §10
      edge cases (last-segment-only `_`-strip; image leading-`_` not normalized; commented-out `@use`
      skipped by Bottom) · §11 sign-off
- [x] Self-verify: every RECIPE section the `.scss` profile marks **required** is present
      (§1, §2, §3, §4, §6, §7, §8, §9, §10, §11)
- [x] Self-verify: **no excluded section was emitted** — §5 (Smart identifier) is ABSENT
      (smartId: none) and replaced by the one-line N/A marker; no exported-class or Angular language
      appears anywhere in the checklist
- [x] Self-verify: section 4 enumerates **exactly 5** stylesheet styles (N = `SCSS_IMPORT_OPTIONS`
      count), each with its literal inserted string + tab-stop layout (placeholder on styles 1 & 2;
      "no placeholder" on 0/3/4), plus the image fixed-shape arm (single `url('<path>')`, not
      configurable), the three `pathQuirks` subsections (partial-normalization,
      `preserveStylesheetFileExtension` toggle, always-keep-`.css`), and the style-name-drift sub-item
      resolving to the style-0 shape `@use '<path>';`
- [x] Self-verify: every fixture path referenced has its expected content inlined
      (fixture-content-inlining rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file, the exact
      gesture (keybinding / Command Palette entry / drag-drop), and the exact expected result
      (literal inserted string or verbatim toast); no step requires the tester to guess
- [x] Self-verify: every section that has universal mechanics carries the one-line `general.md`
      cross-reference (§7→§9, §8→§10, §9→§8) and re-tests only the DELTA
- [x] Self-verify (`.scss`-specific): the **`preserveStylesheetFileExtension`** toggle test IS present
      (off → `@use './x';`, on → `@use './x.scss';`, with restore) and is NOT suppressed; the
      always-keep-`.css` note is present (a `.css` source keeps `.css` under both toggle states);
      **both** source-type branches (stylesheet + image) appear in §2/§4/§6/§7/§8/§9; §1 carries the
      one-way `.css → .scss` accept row with the `.scss → .css` reject note
