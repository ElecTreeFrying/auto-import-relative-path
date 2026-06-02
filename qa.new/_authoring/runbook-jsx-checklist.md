# Runbook — `.jsx` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/jsx.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/jsx.md` during generation.**

Drives **session 9a** (`generate-jsx-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/jsx.md`. Committed together with this runbook in one commit.

## Generation notes (approved for `.jsx`)

`.jsx` is the pipeline's **first React-family destination** and the first to exercise
the `_react.ts` **source-extension dispatch** and the **empty-snippet** behavior. Two
RECIPE rules get their first workout: the **accept-all §1 matrix** and the **React-family
item-4 two-arm**. Approved structural decisions, to apply when writing the checklist:

- **`gating: accept-all` → §1 is an ALL-ACCEPT matrix, no source-ext reject rows.**
  `.jsx ∈ CROSS_IMPORT_DESTINATIONS`, so `isPairSupported` returns `true` for *every*
  source. §1 lists one accepted row per `SOURCE_UNIVERSE` category → its default-style
  shape (it doubles as a coverage map into §2/§4). The only universal rejection is
  same-file, owned by `general.md` — cross-reference, never re-test.
- **The `.ts`/`.tsx` → `.jsx` "pseudo-rejection" belongs to §4/§10, NOT §1.**
  `.ts`/`.tsx` sources are gating-accepted but emit an **empty snippet** (`_react.ts`
  primary is `['.js','.jsx']` with **no fallback**; `.ts`/`.tsx` miss the non-script
  switch → `default: ''`). All three commands (`paste-import.ts:41-47`,
  `paste-import-with-style.ts:45-52`, `set-default-import-style.ts:45-52`) and the drop
  provider (`provider.ts:42-45`) then fire the **`not-supported` toast**
  (`Auto Import: Cannot import .ts into .jsx files.`) via the **empty-snippet guard
  (eleven-clause gating, clauses 10/11)** — not via `isPairSupported`. §1 carries a
  one-line note pointing to §4; §4 + §10 own the actual case (nothing inserted + the
  literal toast). This keeps §1 faithful to both the code and RECIPE item 1.
- **`smartId: none` → §5 (Smart identifier) is OMITTED.** Keep canonical RECIPE section
  numbers (§1–§4, then §6–§11) and drop a one-line marker where §5 would sit: *"§5
  (Smart identifier) — N/A for `.jsx`: no exported-class detection, no Angular
  PascalCase. `.js`/`.jsx` sources route through the JS builder (no smart-ID); `.ts`/
  `.tsx` sources insert nothing."* The visible gap is the intended signal, not a defect.
- **§4 has TWO ARMS (React-family rule):**
  - *Arm 1 — script `.js`/`.jsx` source* → the **7 JS styles** (`JAVASCRIPT_IMPORT_OPTIONS`),
    each with literal inserted string + tab-stop layout. Backed by the `javascriptImportStyle`
    setting (see shared-setting note below). Style-0 = default-import `import $1 from '<path>';`.
  - *Arm 2 — non-script asset source* → the **4 fixed shapes**, each a SINGLE variant.
    Pick Style **direct-inserts** (length-1 path, no picker); Set Default rejects with
    `no-configurable-style` (`Auto Import: .{src} → .jsx imports use a fixed style.`).
    **Full source extension always kept.** Shapes:
    `*.module.css`/`*.module.scss` → `import ${1:styles} from '<path>';` (checked FIRST —
    beats the side-effect shape) · image/doc/component → `import ${1:name} from '<path>';` ·
    av/text-track → `import ${1:url} from '<path>';` · font/stylesheet → `import '<path>';`
    (side-effect, no tab stop). MUST include the `.module.css`-beats-side-effect proof
    (a plain `.css` → side-effect, contrast).
  - *Empty-snippet case (`.jsx`-only)* → a `.ts`/`.tsx` source inserts **nothing** and
    surfaces the `not-supported` toast; **zero** Pick-Style variants.
  - *Style-name-drift sub-item* → set `javascriptImportStyle` to a string matching no enum
    (config drift / hand-typed in settings.json), paste a `.js` source → the import STILL
    inserts using the **style-0 shape** `import $1 from '<path>';` (`resolveStyleIndex` →
    undefined → builder `default:` arm), **never nothing**. No smartId → bare `$1`.
- **`.jsx` has NO `jsxImportStyle` setting — it reuses `javascriptImportStyle`.**
  `variants.ts:111` backs jsx script variants with `('script','javascript')`; the
  `package.json` setting is literally titled *"JavaScript / JSX import style"*. So §8
  (Set Default) on a `.js`/`.jsx` → `.jsx` paste persists
  `auto-import.importStatement.script.javascriptImportStyle` — the **same** setting that
  governs `.js` destinations and `.js`/`.jsx` sources into `.tsx`/`.mdx`. §8 notes this
  cross-effect.
- **Preserve-extension (script, paste) is NOT re-tested** — `general.md §7.5/§7.6` owns
  the universal `preserveScriptFileExtension` path mechanic; only the **drop-time**
  preserve case appears (§9). **But §4 arm 2 adds the `.jsx`-specific delta:** non-script
  assets keep the **full extension even with the toggle OFF** (the toggle is
  script-namespace; `_react.ts` builds asset paths from `fullPath`, ignoring it).
- **§6 placement is plain `generic`, column 0** (Top/Bottom/Cursor honored). `.jsx ∈
  SCRIPT_FILE_EXTENSIONS` → column 0; not inline, not forced-cursor, not astro/sfc.
  Cursor `adjustForCommentBlock`: a lone `//` inserts AT the line; a `/* */` block,
  grouped-`//` run, **or leading-`*` line** pushes the import ABOVE — `.jsx` is **NOT**
  markdown (`isMarkdownDestination('.jsx')` is false), the explicit counter-case to
  `.md`/`.mdx`.
- **§9(b) unsupported-pair drop = `.ts`/`.tsx` → `.jsx`** — jsx's *only* null-resolving
  drop (gating accepts everything else). Empty snippet → `provider.ts` returns `null` →
  VS Code's default text-drop inserts the **raw path text** + the not-supported toast
  (distinct from paste, which inserts nothing at all). The untitled-buffer DnD
  precondition is cross-referenced to its canonical instance (`typescript.md §9.10`),
  not re-emitted.
- **Emit only the destination DELTA**, cross-referencing `general.md §8` (DnD), `§9`
  (Pick Style), `§10` (Set Default) for universal mechanics — the convention
  `typescript.md` already uses. `general.md` is assumed passed; never re-test what it owns.
- **Shape/quality bar = `typescript.md`.** Match its section layout, executable-step
  style, and fixture-inlining; substitute the `.jsx` values.

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.jsx` (gating · styles · smartId ·
      defaultStyle · placement · pathQuirks)
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail — esp. the
      React-family item-4 two-arm + accept-all item-1 — and authoring rules)
- [x] Read source-of-truth files for `.jsx`:
      - `src/snippets/languages/jsx.ts` — per `dispatch.ts`, `.jsx` → `jsx.ts`:
        delegates to `buildReactImport` with `primaryExtensions: ['.js','.jsx']`,
        `primarySnippet: buildJavaScriptImportSnippet`, **no fallback**
      - `src/snippets/_react.ts` — `buildReactImport`: script primary path (honors
        `preserveScriptFileExtension`), the `.module.css/.module.scss` check (FIRST), the
        non-script asset `switch` (4 groups, full ext via `fullPath`), and `default: ''`
        (the empty snippet for `.ts`/`.tsx`)
      - `src/snippets/_styles.ts` — `JAVASCRIPT_IMPORT_OPTIONS` (7 entries): literal
        `description` strings + `tag` labels + tab-stop layout per style
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — `buildJsxVariants`
        (`.js`/`.jsx` → 7 styled variants backed by `('script','javascript')`; non-script →
        single hardcoded variant via `buildReactNonScriptVariant`; `.ts`/`.tsx` → `[]`) and
        the destination dispatch
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the `generic`
        placement mode (Top/Bottom/Cursor; column 0 via `SCRIPT_FILE_EXTENSIONS`;
        `IMPORT_INDICATORS` Bottom scan; `adjustForCommentBlock` Cursor adjustment;
        `isMarkdownDestination('.jsx')` is false → leading `*` is a comment)
      - `src/gating.ts` — accept-all: `.jsx ∈ CROSS_IMPORT_DESTINATIONS` short-circuits the
        first clause; no per-destination clause matches `.jsx`. The `.ts`/`.tsx` empty case
        is caught downstream by the eleven-clause empty-snippet guard (clauses 10/11), not here
      - `src/drop/provider.ts` — empty snippet (`''`/`'\n'`) → `not-supported` toast +
        `return null` → VS Code's default text-drop inserts the raw path (the §9(b) basis)
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — the closed
        `SOURCE_UNIVERSE` for the §1 all-accept category rows; `.jsx ∈ CROSS_IMPORT_DESTINATIONS`
        + `SCRIPT_FILE_EXTENSIONS`
      - `package.json` (`contributes.configuration` enums + `default`) — the `defaultStyle`
        field: `javascriptImportStyle` (titled *"JavaScript / JSX import style"*) default =
        `import name from '_relativePath_';` (index 0); enum strings byte-match `_styles.ts`
      - **N/A for `.jsx` (do NOT read — conditional files for other destinations):**
        `src/snippets/_class-name.ts` (smart-ID destinations only: `.ts`) ·
        `src/path/import-type.ts` (source-**type**-dispatch destinations: `.html`/`.css`/
        `.scss`/`.md`; `.jsx` branches on the **raw source extension** via `_react.ts`, never
        `determineImportType`)
- [x] Write `qa.new/checklists/jsx.md` per RECIPE + the `.jsx` PROFILE row + the
      generation notes above, with expected fixture content inlined for every referenced
      path. Sections: §1 gating matrix (**all-accept**: one row per SOURCE_UNIVERSE
      category → its default shape; `.ts`/`.tsx` empty-snippet note → §4) · §2 happy path
      (`import $1 from './foo';` + one asset rep) · §3 Insert from Selected File (`Alt+D`) ·
      §4 **two arms** (arm 1: 7 JS styles; arm 2: 4 fixed asset shapes + module-css proof +
      non-script-ignores-preserve note; + empty-snippet case; + style-name drift) ·
      **(§5 omitted — N/A marker)** · §6 placement (full generic Bottom/Top/Cursor, col 0,
      leading-`*`-is-comment contrast) · §7 Pick Style (DELTA, xref §9; label-vs-inserted
      assertion; 7 items for script / 1 direct-insert for asset / 0 for `.ts`/`.tsx`) ·
      §8 Set Default (DELTA, xref §10; `javascriptImportStyle` + shared-setting note /
      `no-configurable-style` for asset) · §9 Drag-and-drop (DELTA, xref §8; happy drop /
      `.ts`→raw-text drop / placement / drop-time preserve) · §10 edge cases (empty-snippet
      recap, string-literal + `require(` Bottom false-positives, leading-`*` Cursor
      contrast) · §11 sign-off
- [x] Self-verify: every RECIPE section the `.jsx` profile marks **required** is present
      (§1, §2, §3, §4, §6, §7, §8, §9, §10, §11)
- [x] Self-verify: **no excluded section was emitted** — §5 (Smart identifier) is ABSENT
      (smartId: none) and replaced by the one-line N/A marker; no exported-class or Angular
      language appears anywhere in the checklist
- [x] Self-verify: section 4 **arm 1** enumerates **exactly 7** styles (N =
      `JAVASCRIPT_IMPORT_OPTIONS` count), each with its literal inserted string + tab-stop
      layout; **arm 2** enumerates the **4** fixed asset shapes + the `.module.css`-beats-
      side-effect proof + the `.ts`/`.tsx` empty-snippet case; plus the style-name-drift
      sub-item resolving to the style-0 shape
- [x] Self-verify: every fixture path referenced has its expected content inlined
      (fixture-content-inlining rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file,
      the exact gesture (keybinding / Command Palette entry / drag-drop), and the exact
      expected result (literal inserted string or verbatim toast); no step requires the
      tester to guess
- [x] Self-verify: every section that has universal mechanics carries the one-line
      `general.md` cross-reference (§1→same-file, §7→§9, §8→§10, §9→§8) and re-tests only
      the DELTA; the untitled-buffer DnD precondition points to `typescript.md §9.10`
