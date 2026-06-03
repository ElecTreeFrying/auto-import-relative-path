# Runbook — `.mdx` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/mdx.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/mdx.md` during generation.**

> **Independence note.** The `.mdx` PROFILE row is byte-identical to `.tsx` in
> the PROFILE tables, but this checklist is generated **independently** from the
> `.mdx` row + RECIPE + source — never seeded from or copied out of `tsx.md`
> (or `typescript.md`). The intended divergence from `.tsx` is the
> **markdown-star Cursor quirk** (`isMarkdownDestination('.mdx') === true`):
> a Cursor insertion on a leading-`*` line lands AT the line in `.mdx` but is
> pushed ABOVE it in the byte-identical `.tsx` buffer. It must surface in §6
> (Cursor adjustment) and §10 (the explicit `.mdx` ≠ `.tsx` contrast).

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.mdx`
- [x] Read `qa.new/_authoring/RECIPE.md`
- [x] Read source-of-truth files (resolved for `.mdx` — a React-family,
      accept-all, source-extension-dispatch destination):
      - `src/snippets/dispatch.ts` — confirms `.tsx`/`.mdx` → `tsx.buildSnippet`
      - `src/snippets/languages/tsx.ts` — the `.mdx` builder (per `dispatch.ts`);
        delegates the algorithm to `../_react.ts:buildReactImport` with TS primary
        (`.ts`/`.tsx`) + JS fallback (`.js`/`.jsx`)
      - `src/snippets/languages/typescript.ts` — TS primary: the 7 TS style shapes
        + `generateAngularLegacyImportName` (style-0 only); the literal `$1`/`${1:…}`
        tab-stop forms live here, NOT in `_styles.ts`
      - `src/snippets/languages/javascript.ts` — JS fallback: the 7 JS style shapes
      - `src/snippets/_react.ts` — React-family algorithm + `buildAssetImportStatement`
        (the single canonical non-script asset switch: 4 shapes); script preserve via
        `preserveScriptFileExtension`; non-script assets always keep the full extension
      - `src/snippets/_styles.ts` — `TYPESCRIPT_IMPORT_OPTIONS` / `JAVASCRIPT_IMPORT_OPTIONS`
        descriptions + tags (the byte-exact `package.json` enum contract + the Pick-Style
        DESCRIPTION text)
      - `src/snippets/variants.ts` — `.tsx`/`.mdx` → `buildTsxVariants`; confirms
        `readExportedClassName` is **never** called for tsx/mdx (no exported-class fill)
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the `placement`
        field: `.mdx` ∉ `shouldRepositionCursor` (generic, not forced-cursor),
        `.mdx` ∈ `SCRIPT_FILE_EXTENSIONS` (column 0), `.mdx` ∈ `isMarkdownDestination`
        (the markdown-star Cursor reclassification via `isCommentLine`'s `!isMarkdown` guard)
      - `src/gating.ts` — `.mdx` ∈ `CROSS_IMPORT_DESTINATIONS` with **no** per-destination
        clause → accept-all (only the universal same-file rejection applies)
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — the closed
        `SOURCE_UNIVERSE` (`.mdx`'s §1 reject column is its mechanical complement = ∅)
      - `package.json` (`contributes.configuration` enums + `default`) — the `defaultStyle`
        field: `typescriptImportStyle`/`javascriptImportStyle` default to index 0;
        `importStatementPlacement` (Top/Bottom/Cursor, default Bottom);
        `preserveScriptFileExtension` (default false)
      - NOT applicable to `.mdx` (deliberately omitted): `src/snippets/_class-name.ts`
        (exported-class detection is `.ts`-destination-only and inert here) and
        `src/path/import-type.ts` (source-**extension** dispatch does not consult
        `determineImportType`)
- [x] Write `qa.new/checklists/mdx.md` per recipe + profile,
      with expected fixture content inlined for every referenced path
- [x] Self-verify: every recipe section the profile marks required is present
      (§1–§4, §6–§11 required; §5 present because `smartId` is Angular-only, not none)
- [x] Self-verify: no recipe section the profile excludes was emitted
      (no `.jsx`-only empty-snippet case; no fabricated `Cannot import .X` reject rows —
      `.mdx` is accept-all)
- [x] Self-verify: section 4 enumerates exactly the React-family two arms —
      7 TS styles (`.ts`/`.tsx` source) + 7 JS styles (`.js`/`.jsx` source) + the 4 fixed
      asset shapes (non-script arm), each a single variant
- [x] Self-verify: every fixture path referenced has inline content described
- [x] Self-verify: every actionable step is executable — names the exact fixture
      file, the exact gesture (keybinding / Command Palette entry / drag-drop),
      and the exact expected result; no step requires the tester to guess
