# Runbook — `.md` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/markdown.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/markdown.md` during generation.**

Drives **session 8a** (`generate-markdown-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/markdown.md`. Committed together with this runbook in one commit.

## Generation notes (approved for `.md`)

`.md` is the **simpler 2-type cousin of `.html`** on the styles axis — a source-type
dispatch with only **two** branches — and a **`forced-cursor`** placement destination.
Approved structural decisions, to apply when writing the checklist:

- **Two source-type branches** (`markdown.ts:buildSnippet` switches on
  `determineImportType`, `:13-20`): **markdown** (`.md`) → fixed `[${1:text}](<path>)`
  (`:23-25`, hardcoded — `markdownImportStyle` / `MARKDOWN_IMPORT_OPTIONS` is a dormant
  single-entry table, **not** counted as an image style); **image** (the 7 image exts —
  the `determineImportType` `default`) → `MARKDOWN_IMAGE_IMPORT_OPTIONS` (3 styles,
  `:32-46`). These are the **only** two buckets reachable through gating — every other
  source is rejected before dispatch. §1/§2/§4/§7/§8/§9 must cover both — never orphan one.
- **Gating: allow-list** (`gating.ts:26-28`): accepts `MARKDOWN_SUPPORTED_EXTENSIONS` =
  `.md` + image (`constants/extensions.ts:35-38`). **`.md` accepts its OWN extension** —
  there is **NO `.md`→`.md` reject row** (the counter-case to `.html`, which rejects
  itself at `gating.ts:20-22`). §1 reject column = `SOURCE_UNIVERSE − accept`, sampling
  each category **present**: script / stylesheet / html / framework / video / audio /
  text-track / data / fonts / document. Key signal rows: **media + `.vtt` are rejected**
  (unlike `.html`), and **data (`.json`/`.yaml`/`.yml`) is rejected** (unlike
  `.vue`/`.svelte`/`.astro`). Reject toast `Cannot import .X into .md files.`
- **`smartId: none` → §5 (Smart identifier) is OMITTED.** Keep canonical RECIPE numbers
  (§1–§4, then §6–§11) and drop a one-line marker where §5 would sit: *"§5 (Smart
  identifier) — N/A for `.md`: no exported-class detection, no Angular PascalCase."* The
  visible gap is the signal. No exported-class or Angular language appears anywhere.
- **Default styles.** markdown → the fixed link `[${1:text}](<path>)`; image → index 0
  `![${1:alt-text}](<path>)` (`package.json` default `![alt-text](_relativePath_)`;
  `markdown.ts:43-44` `default:` arm returns style 0). Drives §2 happy-path + the §4
  "(default)" row.
- **Tab-stop layout per shape** (state verbatim in §2/§4): link `[${1:text}](…)` — **1**
  tab stop; image 0 `![${1:alt-text}](…)` — **1**; image 1 `![${1:alt-text}](… "${2:Hover
  text}")` — **2**; image 2 `<img src="…" alt="$1" width="$2" height="$3">` — **3**.
- **`always-preserve-extension` → NO preserve-toggle test.** `markdown.ts:11` builds
  `fullPath = relativePath + extractFileExtension(...)` and reads no preserve setting, so
  the path always keeps the full source extension (`[text](./notes.md)`,
  `![alt-text](./logo.png)`). §4 carries the always-keep-extension note and emits **no**
  `preserveScriptFileExtension` case. (RECIPE `.html`/`.md`/`.css` slot — must NOT bleed
  into `.scss`.)
- **`forced-cursor` placement** (`shouldRepositionCursor('.md')` true,
  `insert-snippet.ts:31-33`): `insertImportSnippet` **returns at `insertSnippetAtCursor`
  before reading the placement setting**, so Top/Bottom/Cursor all insert at the **cursor
  line** (setting has **no effect**); the column **follows the cursor**
  (`determineInsertionColumn` — `.md ∉ SCRIPT_FILE_EXTENSIONS`/`STYLESHEET_FILE_EXTENSIONS`
  → returns the cursor column, NOT 0 — the distinctive trait); `\n` appended (standalone
  statement). §6 emits these facts; the generic Bottom/Top/Cursor marker-scan section is
  NOT emitted.
- **Markdown-star quirk (signature edge).** `isCommentLine(line, isMarkdown=true)`
  (`placement.ts:17-23`) treats a leading `*` as **content** (bullet / `*italic*` /
  `**bold**` / `***`), so `adjustForCommentBlock(…, isMarkdown=true)` lets a Cursor
  insertion land **AT** a leading-`*` line — while `//` and `/*` STILL push above (only
  `*` is reclassified). §6 tests both; §10 recaps with the `.tsx`/`.mdx` contrast (the
  same `*` line in a byte-identical `.tsx` buffer pushes ABOVE — proving the `isMarkdown`
  flag; the `.mdx ≠ .tsx` story). `.md` never uses Bottom, so the string-literal /
  `require(` false-positive marker edges are **N/A** (note in §10).
- **DELTA-only §7/§8/§9, cross-referencing `general.md`.** §7 → `general.md §9` (Pick
  Style mechanics), §8 → `general.md §10` (Set Default mechanics), §9 → `general.md §8`
  (DnD mechanics). `general.md` is assumed passed; re-test only the `.md` DELTA.
- **§7 Pick Style.** The image source shows **3 items** (all 3
  `MARKDOWN_IMAGE_IMPORT_OPTIONS` entries carry a `tag`, so DESCRIPTION = the tag — **no**
  tagless fallback, unlike `.html`). LABEL = `renderLabel` of the **basename**
  (`${1:x}`→`x`, `$1`→`name`, so image-2's label renders `alt="name" width="name"
  height="name"`); INSERTED = the **full** relative path — assert **both**
  (`variants.ts:345-348,363-367`). The **markdown** source is a single hardcoded variant →
  Pick Style silent-inserts (no picker; general.md §9).
- **Set-Default toast ≠ Pick-Style description.** Set Default surfaces the **enum value
  string** (`set.value = opt.description`, `variants.ts:348`), e.g. `Auto Import: Default
  style saved — ![alt-text](_relativePath_ "Hover text")`; §7 showed that style's **tag**.
  Same style, two surfaced strings — do not conflate. The **markdown** branch is a fixed
  single-variant (no `setting`) → Set Default returns `Auto Import: .md → .md imports use
  a fixed style.` (`no-configurable-style`).
- **Style-name drift targets the image setting.** Set
  `auto-import.importStatement.markup.markdownImageImportStyle` to a string matching no
  enum description → an image paste still inserts the **style-0** shape
  `![${1:alt-text}](<path>)` (`resolveStyleIndex` → undefined → builder `default:` arm),
  **never nothing**. No detected-name honoring (smartId none). The markdown-link arm is
  hardcoded → immune to drift.
- **DnD untitled-buffer no-op precondition is emitted once, not here** — `typescript.md
  §9.10` carries the canonical "tested once for all 12" instance; §9 gets a one-line
  pointer to it.
- **Shape/quality bar per RECIPE** (executable steps naming file + gesture + verbatim
  result; fixture-content inlining; consolidated `## Fixtures` section). Heading glyph
  `## N — Title` (matching `typescript.md`). **Generation reads RECIPE + the `.md` PROFILE
  row + the named source-of-truth files only — never the design spec, never another
  language's checklist** (RECIPE boundary).

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.md` (gating · styles · smartId ·
      defaultStyle · placement · pathQuirks)
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail, per-quirk slots,
      authoring rules)
- [x] Read source-of-truth files for `.md`:
      - `src/snippets/languages/markdown.ts` — per `dispatch.ts`, `.md` → `markdown.ts`:
        the `buildSnippet` 2-branch source-type switch (`:13-20`), the fixed
        `buildMarkdownImportSnippet` link (`:23-25`), and the
        `buildMarkdownImageImportSnippetByStyle` 3-style switch with a style-0 `default:`
        arm (`:32-46`). Note `fullPath` (`:11`) always appends the source extension — no
        preserve read.
      - `src/snippets/_styles.ts` — `MARKDOWN_IMAGE_IMPORT_OPTIONS` (3 entries, **all with
        a `tag`**): literal descriptions + tags. `MARKDOWN_IMPORT_OPTIONS` is single-entry
        / dormant.
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — `buildMarkdownVariants`
        (`:317-335`): markdown → 1 hardcoded variant (no `setting`); image → 3 styled
        variants carrying `setting { namespace:'markup', key:'markdownImage',
        value:opt.description }`. `description = opt.tag ?? opt.description` (`:346`);
        `renderLabel` (`:363-367`) maps `${1:x}`→`x`, `$1`→`name`; label uses
        `path.basename`, insertion uses the full path. The `.md` destination dispatch
        (`dispatch.ts:32-33`).
      - `src/path/import-type.ts` — `determineImportType`: `.md`→`markdown`, the 7 image
        exts→`image` (`default`); every other source maps to a bucket that gating rejects
        before dispatch. Resolves which `case` of the `markdown.ts` switch each source
        lands in (the `markdown.ts` labels are buckets, not extensions).
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the `.md`
        **`forced-cursor`** mode: `shouldRepositionCursor('.md')` true → `insertImportSnippet`
        returns at `insertSnippetAtCursor` **before** reading the placement setting (setting
        ignored); `determineInsertionColumn` returns the **cursor column** (`.md` ∉
        `SCRIPT_FILE_EXTENSIONS`/`STYLESHEET_FILE_EXTENSIONS`, so NOT 0); `\n` appended;
        `adjustForCommentBlock(…, isMarkdown=true)` + the markdown-star quirk in
        `isCommentLine` (`:17-23`).
      - `src/gating.ts` — the `.md` clause (`:26-28`): allow-list
        (`MARKDOWN_SUPPORTED_EXTENSIONS`); reject toast `Cannot import .X into .md files.`
        `.md` accepts its own extension (no self-reject clause — unlike `.html` `:20-22`).
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` —
        `MARKDOWN_SUPPORTED_EXTENSIONS` = `.md` + `IMAGE_FILE_EXTENSIONS` literal members +
        the closed `SOURCE_UNIVERSE` for the §1 reject complement.
      - `package.json` (`contributes.configuration` enums + `default`) —
        `markup.markdownImageImportStyle` (3 enums; default `![alt-text](_relativePath_)`),
        `markup.markdownImportStyle` (single-entry, dormant; default `[text](_relativePath_)`),
        `preferences.importStatementPlacement` Top/Bottom/Cursor (default Bottom — **ignored**
        by `.md`). The byte-exact contract is the enum **value** ↔ `_styles.ts` description.
      - **N/A for `.md` (do NOT read — conditional files for other destinations):**
        `src/snippets/_class-name.ts` (smart-ID destinations only: `.ts`) ·
        `src/snippets/_react.ts` (React-family only: `.jsx`/`.tsx`/`.mdx`)
- [x] Write `qa.new/checklists/markdown.md` per RECIPE + the `.md` PROFILE row + the
      generation notes above, with expected fixture content inlined for every referenced
      path. Front matter: title · human checkbox-tier note · "assumes general.md passed"
      DELTA boundary · sources-under-test · `## .md at a glance` · `## Gestures` ·
      `## Fixtures — qa.new/workspace/markdown/`. Sections: §1 gating matrix (accept `.md` +
      image; categorised reject rows; **NO `.md`→`.md` reject**) · §2 happy path — both
      source-type branches at default style · §3 Insert from Selected File (`Alt+D`) · §4
      both arms (markdown fixed link · image 3 styles) + always-keep-extension note +
      style-name drift (image arm) · **(§5 omitted — marker)** · §6 placement —
      `forced-cursor` (setting ignored · column follows cursor · markdown-star vs `//`/`/*`)
      · §7 Pick Style (DELTA, xref §9; image 3 items label+desc+inserted; markdown single-
      variant silent) · §8 Set Default (DELTA, xref §10; image configurable; markdown
      `no-configurable-style`) · §9 Drag-and-drop (DELTA, xref §8; pointer to typescript.md
      §9.10) · §10 edge cases (markdown-star recap + `.tsx` contrast; Bottom-markers N/A) ·
      §11 sign-off
- [x] Self-verify: every RECIPE section the `.md` profile marks **required** is present
      (§1, §2, §3, §4, §6, §7, §8, §9, §10, §11)
- [x] Self-verify: **no excluded section was emitted** — §5 (Smart identifier) is ABSENT
      (smartId: none) and replaced by the one-line N/A marker; no exported-class or Angular
      language appears anywhere in the checklist
- [x] Self-verify: section 4 **image arm** enumerates **exactly 3** styles (N =
      `MARKDOWN_IMAGE_IMPORT_OPTIONS` count), each with its literal inserted string +
      tab-stop layout; the **markdown arm** is the single fixed link shape (NOT counted in
      the 3); the style-name-drift sub-item resolves to image style-0
      `![${1:alt-text}](<path>)`
- [x] Self-verify: every fixture path referenced has its expected content inlined
      (fixture-content-inlining rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file, the
      exact gesture (keybinding / Command Palette entry / drag-drop), and the exact expected
      result (literal inserted string or verbatim toast); no step requires the tester to guess
- [x] Self-verify: every section with universal mechanics carries the one-line `general.md`
      cross-reference (§7→§9, §8→§10, §9→§8) and re-tests only the DELTA
- [x] Self-verify (`.md`-specific): **no** `preserveScriptFileExtension` toggle test
      (always-preserve-extension; note present in §4); **no `.md`→`.md` reject row** (own ext
      accepted); §6 asserts `forced-cursor` (setting ignored + column follows cursor, NOT 0);
      the **markdown-star** case is present (lands AT a leading-`*` line; `//`/`/*` push
      above); §9 **points to `typescript.md §9.10`** for the untitled-buffer precondition
      (not duplicated); §8 Set-Default value (enum string) ≠ §7 Pick-Style description (tag)
