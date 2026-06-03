# Runbook — `.vue` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/vue.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/vue.md` during generation.**

Drives **session 12a** (`generate-vue-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/vue.md`. Committed together with this runbook in one commit.

## Generation notes (approved for `.vue`)

`.vue` is the pipeline's **first framework-trio destination** (then `.svelte`, `.astro` — all three
share `framework-component.ts`). It is a **hybrid**: allow-list `§1` gating (like `.html`/`.md`), a
React-family **two-arm `§4`** (like `.tsx`), but a **unique `sfc-script` `§6`** placement and a
**single** script table (`.tsx` had two). The quality/shape bar is `typescript.md`. Every `.vue`
delta flows from one fact: **`framework-component.ts` branches on its OWN local
`SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]` and routes ALL four to
`buildTypeScriptImportSnippet`; everything else gated-in goes to `buildAssetImportStatement`. It
never calls `determineImportType`.** Approved structural decisions, to apply when writing the checklist:

- **`gating: allow-list` → §1 is an ACCEPT-vs-REJECT matrix** (not accept-all). `.vue ∈
  CROSS_IMPORT_DESTINATIONS` (first `gating.ts` clause passes), then the
  `destinationFileExt === '.vue' && !VUE_SUPPORTED_EXTENSIONS.includes(sourceFileExt)` clause rejects
  non-members. **Accept** (literal `VUE_SUPPORTED_EXTENSIONS`): `.vue` · `.ts` `.tsx` `.js` `.jsx` ·
  `.json` `.yml` `.yaml` · image (`.gif .jpeg .jpg .png .svg .avif .webp`) · media (`.mp4 .webm .mov
  .mp3 .ogg .wav .m4a`) · `.vtt` — each row paired with its default-style inserted shape (doubles as
  a coverage map into §2/§4). **Reject** = `SOURCE_UNIVERSE − accept`, sampling ≥1 per category
  present: `.mdx` (a script ext that is **rejected** — `.vue` accepts `.ts/.tsx/.js/.jsx` but NOT
  `.mdx`), `.svelte`, `.astro` (other frameworks), `.css`, `.scss` (stylesheet), `.html`, `.md`,
  `.woff2` (font — always), `.pdf` (document — always) → toast `Cannot import .{src} into .vue
  files.` (wording general.md-owned; the row asserts the `.vue` string). The universal same-file
  rejection is general.md-owned — cross-reference, never re-test. **`.vue` is also the only-trio dest
  that ACCEPTS data** (`.json/.yml/.yaml`) → these are accept rows, not reject rows.

- **All four script exts route to the *TypeScript* table — NOT the JS table.** Unlike `.tsx`/`.jsx`
  (where `.js`/`.jsx` sources hit `JAVASCRIPT_IMPORT_OPTIONS`), `framework-component.ts` sends
  `.ts`/`.tsx`/`.js`/`.jsx` **all** to `buildTypeScriptImportSnippet`. So a `.js`→`.vue` happy path is
  `import { $1 } from './bar';` (TS **named**, index 0), **not** `import $1 from …`. There is **one**
  script table (7 TS styles), not two.

- **Non-script catalogue = the asset switch intersected with framework gating → only TWO arms
  reachable.** `buildAssetImportStatement` is shared with the React trio, but for `.vue` only the
  **named-default** arm (`import ${1:name} from '<path>';` — image / data / doc / component, **incl.
  `.vue` self**) and the **url-default** arm (`import ${1:url} from '<path>';` — av / text-track) are
  reachable. **NO** CSS-module arm, **NO** side-effect arm, **NO** empty-snippet case: stylesheet
  (`.css`/`.scss`) and font sources are **gate-rejected** (so the `.module.css`-beats-side-effect and
  side-effect arms can never fire), and `.ts/.tsx/.js/.jsx` are **accepted but script-routed** (so —
  unlike `.jsx` — there is no empty-snippet case). Full source extension **always** kept (asset paths
  built from `fullPath`; the `preserveScriptFileExtension` toggle is script-namespace and does not
  touch the asset arm).

- **§2 happy path = THREE branches** (one per `profile.styles` branch): script
  (`import { $1 } from './foo';` — TS named, index 0) · non-script named-default
  (`import ${1:name} from './logo.png';`, full ext kept) · non-script url-default
  (`import ${1:url} from './intro.mp4';`, full ext kept). Each: literal inserted string + tab-stop
  layout verbatim (the `typescript.md` §4 bar).

- **§3 Insert from Selected File** — one `Alt+D` case on the Explorer selection inserting the §2
  script happy-path string into the active `.vue` editor.

- **§4 has TWO ARMS:**
  - *Arm 1 — script source (`.ts`/`.tsx`/`.js`/`.jsx`)* → the **7 TS styles**
    (`TYPESCRIPT_IMPORT_OPTIONS`), each with literal inserted string + tab-stop layout, backed by the
    **`typescriptImportStyle`** setting. Style-0 = named `import { $1 } from '<path>';` (+ Angular
    PascalCase on a suffix match, §5). Style 3 (`import '<path>';`) has **0** tab stops; style 5
    (`import { $1, type $2 }`) has **2** tab stops; style 6 = `const $1 = await import('<path>');`.
  - *Arm 2 — non-script asset source* → the **2 reachable** single-variant shapes (named-default,
    url-default). Pick Style **direct-inserts** (length-1 path, no picker); Set Default rejects with
    `no-configurable-style` (`Auto Import: .{src} → .vue imports use a fixed style.`). Full extension
    kept. **No** `.module.css` proof, **no** side-effect case, **no** empty-snippet case (all gated
    out — the React-trio-only sub-cases do NOT apply here).
  - *Style-name-drift sub-item* → set `typescriptImportStyle` to a string matching no enum (config
    drift / hand-typed in settings.json), paste a script source → the import STILL inserts using the
    **style-0 shape** `import { $1 } from '<path>';` (`resolveStyleIndex` → undefined → builder
    `default:` arm), **never nothing**. `.vue` precision: the `default:` arm passes no
    `detectedImportName` **and** runs **no** Angular naming (`generateAngularLegacyImportName` is invoked
    only in `case 0`), so **every** script source drifts to a bare `$1` — even an Angular-suffixed path:
    `user.component.ts` → `import { $1 } from './…/user.component';` (NOT `import { UserComponent }`),
    matching `mdx.md §4D.1`. Restore the setting after.

- **`.vue` has NO `vueImportStyle` setting — the script arm reuses `typescriptImportStyle`** (the
  SAME setting `.ts`/`.tsx`/`.mdx` use). `variants.ts:buildFrameworkComponentVariants` backs every
  script variant with `('script','typescript')`; `config/settings.ts` has no `vue` key; and
  `package.json`'s *"TypeScript / TSX import style"* description explicitly says *"…and for all
  script sources imported into .vue, .svelte, or .astro files."* §8 must call out this cross-effect
  (changing the default while QA-ing `.vue` also moves `.ts`/`.tsx`/`.mdx`) and restore after.

- **§5 (Smart identifier) is PRESENT — Angular-PascalCase only** [smartId ≠ none; do NOT mark N/A].
  `framework-component.ts` calls `buildTypeScriptImportSnippet` **without** a `detectedImportName`, so
  `readExportedClassName` is **never called** → **no exported-class fill**; but style-0 still runs
  `generateAngularLegacyImportName`. Emit:
  - one case per Angular suffix (5) → its PascalCase identifier on style 0
    (`user.component.ts` → `import { UserComponent } from './user.component';`; `.directive` →
    `UserDirective`; `.pipe` → `UserPipe`; `.service` → `UserService`; `.module` → `UserModule`);
  - a non-Angular path → bare `$1`;
  - **the signature counter-case to `.ts` §5** — a source containing `export class EventBus` at a
    non-Angular path → **still `import { $1 } from './event-bus';`** (NOT `${1:EventBus}`); this is
    what distinguishes `.vue` smart-ID from `.ts`;
  - **the `.vue`-vs-`.tsx` distinction** — Angular fires for **all four** script exts here, so a `.js`
    Angular source (`widget.component.js`) → `import { WidgetComponent } from './widget.component';`
    (in `.tsx`/`.mdx` the same `.js` source hits the JS builder → no PascalCase). Emit one such case.
  - **Angular identifier guard** (`typescript.ts:75`) — `2fa.service.ts` → derived `2faService` fails
    `/^[A-Za-z_$][\w$]*$/` (leading digit) → bare `$1` (`import { $1 } from './2fa.service';`), even
    though a suffix matched.
  Emit **no** exported-class detection case (that is `.ts`-destination-only, owned by
  `typescript.md` §5).

- **§6 placement is `sfc-script` (container-confined) — the generic Top/Bottom/Cursor section is NOT
  emitted.** `.vue` → `computeSfcPlacement` / `insertSnippetAtSfcScript`, bounded by the `<script>`
  block. Emit:
  - **block selection preference** `<script setup>` > instance `<script>` (one without `context=`) >
    any `<script>` (`findSfcScriptBounds`);
  - **Top** = just after the opening `<script>` line; **Bottom** = after the last `IMPORT_INDICATORS`
    line within the block (fallback: just after the opening tag); **Cursor** = the cursor line only
    when strictly between the bounds, else Bottom-within-block; `adjustForCommentBlock` applies;
  - **create-if-missing** — a `.vue` with no `<script>` → a new `<script>\n<import>\n</script>\n`
    block is created at line 0, and all three modes converge there;
  - inserted lines adopt the block's **detected indentation**; `.vue ∈ SCRIPT_FILE_EXTENSIONS` →
    insertion column 0.
  Not inline, not forced-cursor, not astro-frontmatter.

- **§7 Pick Style (DELTA, xref `general.md §9`):** placeholder verbatim `Select an import style`.
  Script source → **7 TS items**; non-script source → a **single** variant → **direct-insert** (no
  picker, empty description). Each item LABEL = the `path.basename` snippet preview (nested
  `../../components/Widget` collapses to `Widget`), INSERTED text = the FULL relative path — assert
  **both**. Style-0 TS label is **Angular-prefilled** for a suffixed path
  (`import { UserComponent } from 'user.component';`). DESCRIPTION = each style's `tag`. Universal
  QuickPick mechanics (escape, filter-by-description, clipboard validation, one-shot no-default-write,
  single-variant silent insert) → `general.md §9`, do NOT duplicate.

- **§8 Set Default (DELTA, xref `general.md §10`):** on selecting a configurable script style, info
  toast verbatim `Auto Import: Default style saved — {style description}` and
  **`auto-import.importStatement.script.typescriptImportStyle`** now holds that value — **call out
  that this is the SAME setting as `.ts`/`.tsx`/`.mdx`** (no `vueImportStyle`), and restore after. For
  a non-script source (asset arm carries no `setting`) → `no-configurable-style`:
  `Auto Import: .{src} → .vue imports use a fixed style.` Universal mechanics (placeholder `Set
  default import style`, current default spliced to position 0 with `$(check) Current default`,
  escape, filter, clipboard validation, **never inserts**) → `general.md §10`, do NOT duplicate.

- **§9 Drag-and-drop (DELTA, xref `general.md §8`):** a drop reuses the same `buildImportSnippet` +
  `computeImportPlacement` pipeline → byte-identical to §2. Cases:
  - (a) happy-path script drop = §2 string; happy-path asset drop = §2 asset string;
  - (b) **unsupported-pair drop** (e.g. `.css` / `.svelte` / `.mdx` → `.vue`) → the not-supported
    reject toast **AND no import inserted** — the drop edit resolves to `null`, so VS Code falls back
    to its default text-drop and the **raw path text** lands (`.vue` is allow-list, so this case
    **applies** — the contrast to accept-all `.tsx`, which has no null-resolving drop);
  - (c) placement modes + comment-Cursor sub-cases at the drop line **within the `<script>` block**;
  - (d) Angular naming on drop (`user.component.ts` → `{ UserComponent }`) and drop-time
    `preserveScriptFileExtension` (script → `./Widget.vue`-style ext on; asset always keeps its ext).
  - **Framework drop slots:** (i) a **script** drop into a `.vue` lacking `<script>` **creates** the
    `<script>\n…\n</script>\n` wrapper, else constrains within it; (ii) a **non-script** asset drop
    emits the same single-variant asset shape as the item-2/item-4 non-script arm, placed inside the
    (created-if-missing) wrapper.
  - **Untitled-buffer DnD precondition** is the cross-cutting "emit once" rule — cross-reference its
    canonical instance (`typescript.md §9.10`), do NOT re-emit it here.

- **§10 edge cases:** (a) `require( … )` line / an `import ` substring **inside a string literal**
  **within the `<script>` block** act as Bottom false-positive markers (the `IMPORT_INDICATORS`
  scan, scoped to the block by `findBottomLineInRange`); (b) the **`.vue`→`.vue` self-import is a
  NAMED ASSET import** (`import ${1:name} from './BaseButton.vue';`), **not** a script import —
  proving the source is asset-routed despite `determineImportType('.vue')` being `'script'` (the
  framework builder ignores `determineImportType`).

- **§11 sign-off** — case-count summary closing the checklist.

- **Emit only the destination DELTA**, cross-referencing `general.md §8` (DnD), `§9` (Pick Style),
  `§10` (Set Default) for universal mechanics, and `typescript.md §9.10` for the untitled-buffer DnD
  precondition. `general.md` is assumed passed; never re-test what it owns. **Shape/quality bar =
  `typescript.md`.** Match the section layout, executable-step style, and fixture-inlining; substitute
  the `.vue` values.

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.vue` (gating · styles · smartId · defaultStyle ·
      placement · pathQuirks), incl. the smartId note that all four script exts reach Angular and the
      identifier-validity guard (`typescript.ts:75`)
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail — esp. the framework-trio
      item-4 two-arm + allow-list item-1 + item-5 Angular-only variant + the framework item-9 drop
      slots — and authoring rules)
- [x] Read source-of-truth files for `.vue`:
      - `src/snippets/languages/framework-component.ts` — per `dispatch.ts`, `.vue` →
        `framework-component.ts`: local `SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]`;
        script sources → `buildTypeScriptImportSnippet(relativePath + ext)` **one-arg, no
        `detectedImportName`**; everything else → `buildAssetImportStatement(sourceExt, relativePath +
        ext)`. **Never calls `determineImportType`.**
      - `src/snippets/languages/typescript.ts` — the delegated builder:
        `buildTypeScriptImportSnippetByStyle` (7-case switch + `generateAngularLegacyImportName` on
        style 0, called **without** `detectedImportName` for `.vue` → no exported-class fill; the
        `/^[A-Za-z_$][\w$]*$/` validity guard at `:75`); `default:` arm emits the style-0 shape
      - `src/snippets/_styles.ts` — `TYPESCRIPT_IMPORT_OPTIONS` (7): literal `description` strings +
        `tag` labels + tab-stop layout per style
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — `buildFrameworkComponentVariants`
        (all four of `.ts`/`.tsx`/`.js`/`.jsx` → 7 TS styled variants backed by
        `('script','typescript')`; non-script → a single hardcoded variant via
        `buildReactNonScriptVariant`, no `setting`) and the `.vue`/`.svelte`/`.astro` destination
        dispatch case
      - `src/snippets/_react.ts` — `buildAssetImportStatement`: the `.module.css/.module.scss` check
        (FIRST, but **unreachable for `.vue`** — stylesheets are gated out) and the asset `switch` (4
        groups). For `.vue` only the **named-default** (image/data/doc/component incl. `.vue/.svelte/
        .astro`) and **url-default** (av/text-track) arms are reachable; font/stylesheet/module-css
        arms and `default: null` never fire for a gated-in `.vue` source
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the `sfc-script` mode:
        `computeSfcPlacement`/`insertSnippetAtSfcScript`; `findSfcScriptBounds` preference
        (`<script setup>` > instance `<script>` (no `context=`) > any `<script>`); no block → create
        `<script>\n…\n</script>\n` at line 0; `findBottomLineInRange` Bottom-in-block scan;
        `detectBlockIndentation`; `adjustForCommentBlock` Cursor adjustment; `.vue ∈
        SCRIPT_FILE_EXTENSIONS` → column 0
      - `src/gating.ts` — allow-list: `.vue ∈ CROSS_IMPORT_DESTINATIONS` passes the first clause, then
        `destinationFileExt === '.vue' && !VUE_SUPPORTED_EXTENSIONS.includes(sourceFileExt)` rejects
        non-members
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — the literal
        `VUE_SUPPORTED_EXTENSIONS` members + the closed `SOURCE_UNIVERSE` for the §1 reject complement;
        `.vue ∈ CROSS_IMPORT_DESTINATIONS` + `SCRIPT_FILE_EXTENSIONS`
      - `src/config/settings.ts` — confirms **no `vueImportStyle`**; the framework script arm
        reads/writes `('script','typescript')` → `typescriptImportStyle`
      - `package.json` (`contributes.configuration` enums + `default`) — `typescriptImportStyle`
        (titled *"TypeScript / TSX import style"*, default `import { name } from '_relativePath_';`,
        index 0; its description explicitly names `.vue`/`.svelte`/`.astro`); `importStatementPlacement`
        (Top/Bottom/Cursor, default Bottom; description notes `.vue`/`.svelte` → script block);
        `preserveScriptFileExtension` (default false); enum strings byte-match `_styles.ts`
      - **N/A for `.vue` (do NOT read — conditional/unused files):** `src/snippets/_class-name.ts`
        (exported-class detection is `.ts`-destination-only; `framework-component.ts` never calls
        `readExportedClassName`) · `src/path/import-type.ts` (`framework-component.ts` branches on its
        own local `SCRIPT_SOURCE_EXTENSIONS`, never `determineImportType`) ·
        `src/snippets/languages/javascript.ts` (the JS builder is **not** used by the framework arm —
        all four script exts route to the TS builder)
- [x] Write `qa.new/checklists/vue.md` per RECIPE + the `.vue` PROFILE row + the generation notes
      above, with expected fixture content inlined for every referenced path. Sections: §1 gating
      matrix (**allow-list**: accept rows `.vue`/script×4/data×3/image/media/`.vtt` → default shape;
      reject rows `.mdx`/`.svelte`/`.astro`/`.css`/`.scss`/`.html`/`.md`/`.woff2`/`.pdf` → `Cannot
      import .{src} into .vue files.`) · §2 happy path (3 branches: script / named-asset / url-asset) ·
      §3 Insert from Selected File (`Alt+D`) · §4 **two arms** (arm 1: 7 TS styles backed by
      `typescriptImportStyle`; arm 2: 2 reachable asset shapes, single-variant; + style-name drift;
      **no** module-css / side-effect / empty-snippet case) · §5 **Smart identifier — Angular-PascalCase
      only** (5 suffixes; non-Angular→`$1`; no-exported-class-fill counter-case to `.ts`; Angular-fires-
      for-all-4-script-exts `.js` case; `2fa.service` validity-guard→`$1`) · §6 placement (**sfc-script**
      container-confined: `<script setup>`>instance>any preference, Top/Bottom/Cursor-within-block,
      create-if-missing wrapper, detected indentation, col 0 — **no** generic section) · §7 Pick Style
      (DELTA, xref §9; label-vs-inserted assertion; 7 TS items / 1 direct-insert for asset; style-0
      Angular prefill) · §8 Set Default (DELTA, xref §10; `typescriptImportStyle` + shared-setting
      cross-effect note / `no-configurable-style` for asset) · §9 Drag-and-drop (DELTA, xref §8; happy
      script/asset drop / **unsupported-pair raw-text fallback** / placement-in-block / Angular-on-drop
      / drop-time preserve / **wrapper-create-on-drop** + non-script-asset-in-wrapper; untitled-buffer →
      `typescript.md §9.10`) · §10 edge cases (`require(`/string-literal Bottom false-positive within
      the `<script>` block; `.vue`→`.vue` named-asset-import quirk) · §11 sign-off (case-count summary)
- [x] Self-verify: every RECIPE section the `.vue` profile marks **required** is present
      (§1, §2, §3, §4, §5, §6, §7, §8, §9, §10, §11) — note §5 **is** required here (smartId ≠ none)
- [x] Self-verify: **no excluded content was emitted** — the generic Top/Bottom/Cursor placement
      section does NOT appear (`.vue` is `sfc-script`); no exported-class detection case appears (that
      is `.ts`-destination-only); no `.module.css`/side-effect/empty-snippet sub-case appears (those
      arms are gate-rejected or React-trio-only)
- [x] Self-verify: section 4 **arm 1** enumerates **exactly 7** TS styles (N =
      `TYPESCRIPT_IMPORT_OPTIONS` count), each with its literal inserted string + tab-stop layout;
      **arm 2** enumerates the **2 reachable** asset shapes (named-default `import ${1:name}` +
      url-default `import ${1:url}`), each single-variant; plus the style-name-drift sub-item resolving
      to the style-0 shape (bare `$1`; an Angular-suffixed path **also** drifts to bare `$1` — the
      `default:` arm has no Angular branch, matching `mdx.md §4D.1`)
- [x] Self-verify: every fixture path referenced has its expected content inlined
      (fixture-content-inlining rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file, the exact
      gesture (keybinding / Command Palette entry / drag-drop), and the exact expected result (literal
      inserted string or verbatim toast); no step requires the tester to guess
- [x] Self-verify: every section with universal mechanics carries the one-line `general.md`
      cross-reference (§1→same-file, §7→§9, §8→§10, §9→§8) and re-tests only the DELTA; the
      untitled-buffer DnD precondition points to `typescript.md §9.10`
