# Runbook — `.html` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/html.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/html.md` during generation.**

Drives **session 7a** (`generate-html-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/html.md`. Committed together with this runbook in one commit.

## Generation notes (approved for `.html`)

`.html` is the most complex destination on the **styles** axis — a **6-way source-type
dispatch** — and the **first `forced-cursor` placement** destination. Approved structural
decisions, to apply when writing the checklist:

- **Six source-type branches** (`html.ts:buildSnippet` switches on `determineImportType`):
  **script** (`.js`) → `<script>` (`HTML_SCRIPT_IMPORT_OPTIONS`, 5 styles); **image** →
  `<img>` (3); **video** → `<video>` (4); **audio** → `<audio>` (2); **stylesheet** (`.css`)
  → fixed `<link>`; **text-track** (`.vtt`) → fixed `<track>`. §1/§2/§4/§7/§8/§9 cover the
  applicable branches — never orphan a bucket. Only **`.js`** reaches the script branch
  through gating (`.ts/.tsx/.jsx/.mdx` are rejected before dispatch).
- **`smartId: none` → §5 (Smart identifier) is OMITTED.** Keep canonical RECIPE numbers
  (§1–§4, then §6–§11) and drop a one-line marker where §5 would sit: *"§5 (Smart identifier)
  — N/A for `.html`: no exported-class detection, no Angular PascalCase."* The visible gap is
  the signal. No exported-class or Angular language appears anywhere.
- **Default styles are all index 0** (`html.ts` `default:` arms return style 0): script
  `<script src="<path>"></script>`, image `<img src="<path>" alt="sample">`, video
  `<video src="<path>" controls></video>`, audio `<audio src="<path>" controls></audio>`.
  Drives §2 happy-path + the §4 "(default)" rows.
- **Tab stops only in the text-track shape.** Script style 0 and image/video/audio **style 0**
  are literal strings with no `$n`. Tab stops appear in: image 1–2 (`alt="$1"`, `width="$2"`,
  `height="$3"`), video 2 (`poster="$1"`), and the fixed **`<track>`** (`srclang="${1:en}"`
  `label="${2:English}"`) — the only happy-path (§2) shape with placeholders. Each §2/§4 case
  states its tab-stop layout (or "no tab stop") verbatim.
- **3 tagless style-0 picker descriptions.** In `_styles.ts`, the first entry of
  `HTML_IMAGE_IMPORT_OPTIONS` / `HTML_VIDEO_IMPORT_OPTIONS` / `HTML_AUDIO_IMPORT_OPTIONS` has
  **no `tag`**, so `variants.ts:346` (`opt.tag ?? opt.description`) falls back to the **full
  template description** (e.g. `<img src="_relativePath_" alt="sample">`). §7 must show these
  three as DESCRIPTION = the full template string, not a human tag — the key `.html` §7 delta.
  (Distinct from the VS Code Settings-UI `enumDescriptions`, which the picker never shows.)
- **`always-preserve-extension` → NO preserve-toggle test.** `html.ts:17` builds `fullPath`
  and reads no preserve setting, so the path always keeps the full source extension
  (`<script src="./app.js">`, `<link href="./styles.css" …>`). §4 carries the
  always-keep-extension note and emits **no** `preserveScriptFileExtension` case. (RECIPE
  `.html`/`.md`/`.css` slot — must NOT bleed into `.scss`.)
- **`forced-cursor` placement** (`shouldRepositionCursor('.html')` true): Top/Bottom/Cursor
  all insert at the **cursor line** (setting has **no effect**); the column **follows the
  cursor** (`.html` is neither script nor stylesheet, so `determineInsertionColumn` returns
  the cursor column, NOT 0 — the distinctive trait); `\n` appended (standalone statement).
  §6 emits these two facts; the generic Bottom/Top/Cursor section is NOT emitted.
- **Comment-marker mismatch (→ §10 edge).** `isCommentLine` matches `//`/`/*`/`*` (JS/CSS),
  **not** HTML's `<!-- -->`. So `adjustForCommentBlock` (which still runs for `.html`,
  `isMarkdown=false`) does **not** adjust on an HTML `<!-- -->` line (import lands at it), but
  **does** push above a JS-comment run inside an embedded `<script>`. §10 carries this
  contrast; §9(c) re-confirms on drop.
- **Gating: allow-list** (`gating.ts:23-25`): accepts `HTML_SUPPORTED_EXTENSIONS` =
  `.js` `.css` + image + media (video+audio) + `.vtt`. **`.html`→`.html` is a dedicated
  rejection** (`gating.ts:20-22`; the table omits `.html`) — §1 carries an explicit
  `.html`→`.html` reject row. §1 reject column = `SOURCE_UNIVERSE − accept`, sampling each
  category **present**; image/media/text-track are **accepted** → they have **no** reject rows.
- **DELTA-only §7/§8/§9, cross-referencing `general.md`.** §7 → `general.md §9` (Pick Style
  mechanics), §8 → `general.md §10` (Set Default mechanics), §9 → `general.md §8` (DnD
  mechanics). `general.md` is assumed passed; re-test only the `.html` DELTA.
- **Set-Default toast ≠ Pick-Style description.** Set Default's saved toast surfaces the
  **enum value string** (`Auto Import: Default style saved — <script src="_relativePath_" defer></script>`,
  via `set-default-import-style.ts:70` passing `picked.setting.value`); §7 showed that style's
  **tag**. Same style, two surfaced strings — do not conflate. The **stylesheet** (`.css`) and
  **text-track** (`.vtt`) branches are fixed single-variant → Set Default returns
  `Auto Import: .css → .html imports use a fixed style.` / `… .vtt → .html …`, and Pick Style
  silent-inserts (no picker).
- **DnD untitled-buffer no-op precondition is emitted once, not here** — `typescript.md §9.10`
  carries the canonical "tested once for all 12" instance; §9 gets a one-line pointer to it.
- **Shape/quality bar per RECIPE** (executable steps naming file + gesture + verbatim result;
  fixture-content inlining; consolidated `## Fixtures` section since `.html` references the
  most fixtures). Structural model = `css.md` (closest source-type-dispatch sibling); heading
  glyph = `## N — Title` (matching `typescript.md`/`scss.md`). **Generation reads RECIPE + the
  `.html` PROFILE row + the named source-of-truth files only — never the design spec, never
  another language's checklist** (RECIPE boundary).

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.html` (gating · styles · smartId ·
      defaultStyle · placement · pathQuirks)
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail, per-quirk slots,
      authoring rules)
- [x] Read source-of-truth files for `.html`:
      - `src/snippets/languages/html.ts` — per `dispatch.ts`, `.html` → `html.ts`: the
        `buildSnippet` 6-branch source-type switch (`:19-42`), the four styled
        `buildHtml{Script,Image,Video,Audio}ImportSnippetByStyle` switches (each with a
        `default:` style-0 arm) and the two fixed builders `buildHtmlStylesheetImportSnippet`
        (`<link>`) / `buildHtmlTextTrackImportSnippet` (`<track>`, `${1:en}`/`${2:English}`).
        Note `fullPath` (`:17`) always appends the source extension — no preserve read.
      - `src/snippets/_styles.ts` — `HTML_SCRIPT_IMPORT_OPTIONS` (5), `HTML_IMAGE_IMPORT_OPTIONS`
        (3), `HTML_VIDEO_IMPORT_OPTIONS` (4), `HTML_AUDIO_IMPORT_OPTIONS` (2): literal
        descriptions + tags. Confirm the **3 tagless style-0 entries** (image/video/audio first
        entries carry no `tag`). `HTML_STYLESHEET_IMPORT_OPTIONS` is single-entry/dormant.
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — `buildHtmlVariants`
        (`:268-315`): script/image/video/audio → styled variants carrying
        `setting { namespace: 'markup', key: 'html{Script,Image,Video,Audio}', value: opt.description }`;
        text-track + stylesheet → 1 hardcoded variant each (no `setting`). `description = opt.tag
        ?? opt.description` (`:346`); `renderLabel` (`:363-367`) maps `${1:x}`→`x`, `$1`→`name`;
        label uses `path.basename`, insertion uses the full path. The `.html` destination dispatch.
      - `src/path/import-type.ts` — `determineImportType`: `.js`→`script`, `.css`→`stylesheet`,
        `.mp4/.webm/.mov`→`video`, `.mp3/.ogg/.wav/.m4a`→`audio`, `.vtt`→`text-track`, image
        (`default`)→`image`, `.html`→`null`. Resolves which `case` of the `html.ts` switch each
        source lands in (the `html.ts` labels are buckets, not extensions).
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the `.html`
        **`forced-cursor`** mode: `shouldRepositionCursor('.html')` true → insert at the cursor
        line; `determineInsertionColumn` returns the **cursor column** (`.html` ∉
        `SCRIPT_FILE_EXTENSIONS`/`STYLESHEET_FILE_EXTENSIONS`, so NOT 0); `\n` appended;
        `adjustForCommentBlock(…, isMarkdown=false)` still runs (`//`/`/*`/`*` markers only). The
        placement **setting is ignored**.
      - `src/gating.ts` — the `.html` clauses: `:20-22` `.html`→`.html` rejection; `:23-25`
        allow-list (`HTML_SUPPORTED_EXTENSIONS`), reject toast `Cannot import .X into .html files.`
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` —
        `HTML_SUPPORTED_EXTENSIONS` (`.js` `.css` + `IMAGE` + `MEDIA` + `TEXT_TRACK`) literal
        members + the closed `SOURCE_UNIVERSE` for the §1 reject complement.
      - `package.json` (`contributes.configuration` enums + `default`) — `markup.htmlScriptImportStyle`
        (5; default `<script src="_relativePath_"></script>`), `htmlImageImportStyle` (3; default
        `… alt="sample">`), `htmlVideoImportStyle` (4; default `… controls></video>`),
        `htmlAudioImportStyle` (2; default `… controls></audio>`), `htmlStyleSheetImportStyle`
        (single-entry, dormant); `importStatementPlacement` Top/Bottom/Cursor (ignored by `.html`).
        Note the `enumDescriptions` for video/audio/image style-0 differ from the picker's tagless
        fallback — the byte-exact contract is the enum **value** ↔ `_styles.ts` description.
      - **N/A for `.html` (do NOT read — conditional files for other destinations):**
        `src/snippets/_class-name.ts` (smart-ID destinations only: `.ts`) ·
        `src/snippets/_react.ts` (React-family only: `.jsx`/`.tsx`/`.mdx`)
- [x] Write `qa.new/checklists/html.md` per RECIPE + the `.html` PROFILE row + the generation
      notes above, with expected fixture content inlined for every referenced path. Front matter:
      title · human checkbox-tier note · "assumes general.md passed" DELTA boundary · `## .html at
      a glance` · `## Gestures` · `## Fixtures — qa.new/workspace/html/`. Sections: §1 gating matrix
      (6 accept branches; categorised reject rows incl. the mandatory `.html`→`.html` row) · §2
      happy path — 6 source-type branches at default style · §3 Insert from Selected File (`Alt+D`)
      · §4 all styles per arm (script 5 · image 3 · video 4 · audio 2 · stylesheet fixed · text-track
      fixed) + always-keep-extension note + style-name drift (script arm) · **(§5 omitted — marker)**
      · §6 placement — `forced-cursor` (setting ignored · column follows cursor) · §7 Pick Style
      (DELTA, xref §9; the 3 tagless style-0 descriptions; single-variant stylesheet/text-track) ·
      §8 Set Default (DELTA, xref §10; 4 configurable settings; fixed-shape `no-configurable-style`)
      · §9 Drag-and-drop (DELTA, xref §8) · §10 edge cases (comment-marker mismatch) · §11 sign-off
- [x] Self-verify: every RECIPE section the `.html` profile marks **required** is present
      (§1, §2, §3, §4, §6, §7, §8, §9, §10, §11)
- [x] Self-verify: **no excluded section was emitted** — §5 (Smart identifier) is ABSENT
      (smartId: none) and replaced by the one-line N/A marker; no exported-class or Angular
      language appears anywhere in the checklist
- [x] Self-verify: section 4 enumerates **exactly** the per-arm style counts — script **5**,
      image **3**, video **4**, audio **2** (N = each `HTML_*_IMPORT_OPTIONS` count) — each with
      its literal inserted string + tab-stop layout (or "no tab stop"), plus the two fixed arms
      (`<link>`, `<track>`, not configurable) and the style-name-drift sub-item resolving to the
      script style-0 shape `<script src="<path>"></script>`
- [x] Self-verify: every fixture path referenced has its expected content inlined
      (fixture-content-inlining rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file, the exact
      gesture (keybinding / Command Palette entry / drag-drop), and the exact expected result
      (literal inserted string or verbatim toast); no step requires the tester to guess
- [x] Self-verify: every section that has universal mechanics carries the one-line `general.md`
      cross-reference (§7→§9, §8→§10, §9→§8) and re-tests only the DELTA
- [x] Self-verify (`.html`-specific): **no** `preserveScriptFileExtension` toggle test is emitted
      (always-preserve-extension); the always-keep-extension note is present in §4; **all six**
      source-type branches appear across §1/§2/§4/§7/§8/§9; §1 carries the mandatory `.html`→`.html`
      reject row; §6 asserts `forced-cursor` (setting ignored + column follows cursor, NOT 0); §7
      shows the **3 tagless style-0** descriptions as the full template string; the `<track>` shape
      is the only §2 happy-path case with tab stops
