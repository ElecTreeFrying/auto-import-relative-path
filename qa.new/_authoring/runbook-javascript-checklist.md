# Runbook — `.js` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/javascript.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/javascript.md` during generation.**

Drives **session 4a** (`generate-javascript-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/javascript.md`. Committed together with this runbook in one commit.

## Generation notes (approved for `.js`)

`.js` is the simplest comparison to `.ts`: same **same-only** gating model, but
**`smartId: none`**. The point of this session is to prove the RECIPE conditional
suppresses §5. Approved structural decisions, to apply when writing the checklist:

- **`smartId: none` → §5 (Smart identifier) is OMITTED.** Keep canonical RECIPE
  section numbers (§1–§4, then §6–§11) and drop a one-line marker where §5 would sit:
  *"§5 (Smart identifier) — N/A for `.js`: no exported-class detection, no Angular
  PascalCase."* The visible gap is the intended signal, not a defect.
- **Default style is the default-import shape** `import $1 from '<path>';` (index 0) —
  NOT TS's named `import { $1 }`. This drives §2 happy-path and the §4 "(default)" row.
- **Preserve-extension (paste) is NOT re-tested** — `general.md §7.5/§7.6` owns the
  universal `preserveScriptFileExtension` path mechanic and `.js` adds no
  identifier-stability angle. Only the **drop-time** preserve case appears (§9, the
  analogue of `typescript.md` §9.9).
- **DnD universal precondition (untitled-buffer no-op) is emitted once, not here** —
  `typescript.md §9.10` carries the canonical "tested once for all 12" instance; §9
  gets a one-line pointer to it rather than re-testing.
- **Emit only the destination DELTA**, cross-referencing `general.md §8` (DnD), `§9`
  (Pick Style), `§10` (Set Default) for the universal mechanics — the convention
  `typescript.md` already uses. `general.md` is assumed passed; never re-test what it owns.
- **Shape/quality bar = `typescript.md`.** Match its section layout, executable-step
  style, and fixture-inlining; substitute the `.js` values.

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.js` (gating · styles · smartId ·
      defaultStyle · placement · pathQuirks)
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail, authoring rules)
- [x] Read source-of-truth files for `.js`:
      - `src/snippets/languages/javascript.ts` — per `dispatch.ts`, `.js` → `javascript.ts`:
        the `buildJavaScriptImportSnippetByStyle` 7-case switch + the `default:` (style-0) arm
      - `src/snippets/_styles.ts` — `JAVASCRIPT_IMPORT_OPTIONS` (7 entries): literal
        description strings + tab-stop layout per style
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — the `.js` variant
        case (basename label vs full-path insertion; all 7 carry a `setting` triple →
        all configurable) and the destination dispatch
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the `generic`
        placement mode (Top/Bottom/Cursor; column 0 via `SCRIPT_FILE_EXTENSIONS`;
        `IMPORT_INDICATORS` Bottom scan; `adjustForCommentBlock` Cursor adjustment)
      - `src/gating.ts` — same-only: `.js` is not in `CROSS_IMPORT_DESTINATIONS`, so any
        source ≠ `.js` is rejected by the first clause; reject toast `Cannot import .X into .js files.`
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — the closed
        `SOURCE_UNIVERSE` for the §1 reject complement
      - `package.json` (`contributes.configuration` enums + `default`) — the `defaultStyle`
        field: `javascriptImportStyle` default = `import name from '_relativePath_';` (index 0)
      - **N/A for `.js` (do NOT read — conditional files for other destinations):**
        `src/snippets/_class-name.ts` (smart-ID destinations only: `.ts`) ·
        `src/snippets/_react.ts` (React-family only: `.jsx`/`.tsx`/`.mdx`) ·
        `src/path/import-type.ts` (source-type-dispatch only: `.html`/`.css`/`.scss`/`.md`)
- [x] Write `qa.new/checklists/javascript.md` per RECIPE + the `.js` PROFILE row +
      the generation notes above, with expected fixture content inlined for every
      referenced path. Sections: §1 gating matrix (`.js`→`.js` accept + 20 categorised
      reject rows) · §2 happy path (`import $1 from './foo';`) · §3 Insert from Selected
      File (`Alt+D`) · §4 all 7 styles + style-name drift · **(§5 omitted — marker)** ·
      §6 placement (full generic Bottom/Top/Cursor) · §7 Pick Style (DELTA, xref §9) ·
      §8 Set Default (DELTA, xref §10) · §9 Drag-and-drop (DELTA, xref §8) · §10 edge
      cases · §11 sign-off
- [x] Self-verify: every RECIPE section the `.js` profile marks **required** is present
      (§1, §2, §3, §4, §6, §7, §8, §9, §10, §11)
- [x] Self-verify: **no excluded section was emitted** — §5 (Smart identifier) is
      ABSENT (smartId: none) and replaced by the one-line N/A marker; no exported-class
      or Angular language appears anywhere in the checklist
- [x] Self-verify: section 4 enumerates **exactly 7** styles (N = `JAVASCRIPT_IMPORT_OPTIONS`
      count), each with its literal inserted string + tab-stop layout, plus the
      style-name-drift sub-item resolving to the style-0 shape
- [x] Self-verify: every fixture path referenced has its expected content inlined
      (fixture-content-inlining rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file,
      the exact gesture (keybinding / Command Palette entry / drag-drop), and the exact
      expected result (literal inserted string or verbatim toast); no step requires the
      tester to guess
- [x] Self-verify: every section that has universal mechanics carries the one-line
      `general.md` cross-reference (§7→§9, §8→§10, §9→§8) and re-tests only the DELTA
