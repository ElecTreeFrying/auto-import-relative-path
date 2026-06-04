# Runbook — `.astro` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/astro.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/astro.md` during generation.**

Drives **session 14a** (`generate-astro-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/astro.md`. Committed together with this runbook in one commit. `.astro` is the
**last language** of the migration.

## Generation notes (approved for `.astro`)

`.astro` is the **third and final framework-trio destination** (`.vue` done in 12a, `.svelte` in 13a) — all
three share `src/snippets/languages/framework-component.ts`, so `.astro`'s PROFILE row is **structurally
identical to `.vue`'s/`.svelte`'s save for TWO source-level divergences** (gating accept-list + placement
mode). The quality/shape bar is `typescript.md`; the structural template is the already-committed framework
trio. Per RECIPE, every `.astro` value is **re-derived from the `.astro` PROFILE row + the source-of-truth
files** — never copied from `vue.md`/`svelte.md` (the two deltas would be wrong if blind-copied). Every
`.astro` behavior flows from the same routing fact: **`framework-component.ts` branches on its OWN local
`SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]` (`framework-component.ts:10`) and routes ALL
four to `buildTypeScriptImportSnippet` (one-arg, no `detectedImportName`, `:20`); everything else gated-in
goes to `buildAssetImportStatement` (`:23`). It never calls `determineImportType`.** Approved structural
decisions:

- **DELTA A — `gating: allow-list` → §1 is an ACCEPT-vs-REJECT matrix, with the WIDEST framework accept-list.**
  `.astro ∈ CROSS_IMPORT_DESTINATIONS` (`gating.ts:17` first clause passes), then `destinationFileExt ===
  '.astro' && !ASTRO_SUPPORTED_EXTENSIONS.includes(sourceFileExt)` (`gating.ts:41`) rejects non-members.
  **Accept** (literal `ASTRO_SUPPORTED_EXTENSIONS`, `constants/extensions.ts:79-95`): `.astro` · `.ts` `.tsx`
  `.js` `.jsx` · **`.vue` `.svelte`** · `.json` `.yml` `.yaml` · **`.md` `.mdx`** · image (`.gif .jpeg .jpg
  .png .svg .avif .webp`) · media (`.mp4 .webm .mov .mp3 .ogg .wav .m4a`) · `.vtt` — each row paired with its
  default-style inserted shape (doubles as a coverage map into §2/§4). **Reject** = `SOURCE_UNIVERSE − accept`,
  sampling ≥1 per category present: `.css` + `.scss` (stylesheet), `.html` (html), `.woff2` (font — always),
  `.pdf` (document — always) → toast `Cannot import .{src} into .astro files.` (wording general.md-owned; the
  row asserts the `.astro` string).
  - **The astro accept-list is the SUPERSET delta vs `vue.md`/`svelte.md`:** astro additionally accepts
    **`.vue`, `.svelte`, `.md`, `.mdx`** (sources vue/svelte both *reject*) plus self `.astro`. So those move
    from the reject side (svelte) to the **accept** side here, and the reject set shrinks to just `.css`
    `.scss` `.html` + fonts + `.pdf`. There are **no** image/media/`.vtt`/data reject rows (all accepted).
  - **Routing paradox to call out (§1 + §10):** `.vue` `.svelte` `.md` `.mdx` (and self `.astro`) are accepted
    but `∉ SCRIPT_SOURCE_EXTENSIONS`, so they route to the **non-script named-default** arm — a `.mdx` source
    (a *script* extension everywhere else) becomes `import \${1:name} from './post.mdx';`, the sharpest proof
    the framework builder ignores `determineImportType`.

- **All four script exts route to the *TypeScript* table — NOT the JS table.** Unlike `.tsx`/`.jsx`,
  `framework-component.ts` sends `.ts`/`.tsx`/`.js`/`.jsx` **all** to `buildTypeScriptImportSnippet`. So a
  `.js`→`.astro` happy path is `import { $1 } from './bar';` (TS **named**, index 0), **not** `import $1 from
  …`. One script table (7 TS styles), not two.

- **Non-script catalogue = the asset switch intersected with framework gating → only TWO arms reachable.**
  `buildAssetImportStatement` (`_react.ts:48-94`) is shared with the React trio, but for `.astro` only the
  **named-default** arm (`import \${1:name} from '<path>';` — image / data / doc / component, **incl. `.md`
  `.mdx` `.vue` `.svelte` and self `.astro`**, `_react.ts:56-74`) and the **url-default** arm (`import
  \${1:url} from '<path>';` — av / text-track, `_react.ts:75-83`) are reachable. **NO** CSS-module arm
  (`:52-54`), **NO** side-effect arm (`:84-90`), **NO** empty-snippet case: stylesheet (`.css`/`.scss`) and
  font sources are **gate-rejected**, and `.ts/.tsx/.js/.jsx` are **accepted but script-routed** (so — unlike
  `.jsx` — there is no empty-snippet case). Full source extension **always** kept (asset path = `relativePath
  + sourceFileExt`; the `preserveScriptFileExtension` toggle is script-namespace and does not touch the asset
  arm).

- **§2 happy path = THREE branches** (one per `profile.styles` branch): script (`import { $1 } from './foo';`
  — TS named, index 0) · non-script named-default (`import \${1:name} from './logo.png';`, full ext kept) ·
  non-script url-default (`import \${1:url} from './intro.mp4';`, full ext kept). Each: literal inserted string
  + tab-stop layout verbatim.

- **§3 Insert from Selected File** — one `Alt+D` case on the Explorer selection inserting the §2 script
  happy-path string into the active `.astro` editor.

- **§4 has TWO ARMS:**
  - *Arm 1 — script source (`.ts`/`.tsx`/`.js`/`.jsx`)* → the **7 TS styles** (`TYPESCRIPT_IMPORT_OPTIONS`),
    each with literal inserted string + tab-stop layout, backed by the **`typescriptImportStyle`** setting.
    Style-0 = named `import { $1 } from '<path>';` (+ Angular PascalCase on a suffix match, §5,
    `typescript.ts:39-44`). Style 3 (`import '<path>';`) has **0** tab stops; style 5 (`import { $1, type $2 }`)
    has **2**; style 6 = `const $1 = await import('<path>');` (re-read the literal `description` strings +
    tab-stops from `_styles.ts` / `typescript.ts:38-61`).
  - *Arm 2 — non-script asset source* → the **2 reachable** single-variant shapes (named-default, url-default).
    Pick Style **direct-inserts** (length-1 path, no picker); Set Default rejects with `no-configurable-style`
    (`Auto Import: .{src} → .astro imports use a fixed style.`). Full extension kept. **No** `.module.css`
    proof, **no** side-effect case, **no** empty-snippet case (all gated out).
  - *Style-name-drift sub-item (DELTA C — the framework gotcha)* → set `typescriptImportStyle` to a string
    matching no enum (config drift / hand-typed in settings.json), paste a script source → the import STILL
    inserts using the **style-0 shape** `import { $1 } from '<path>';` (`resolveStyleIndex` → undefined →
    builder `default:` arm, `typescript.ts:57-60`), **never nothing**. `.astro` precision: the `default:` arm
    passes no `detectedImportName` **and** runs **no** Angular naming (`generateAngularLegacyImportName` is
    invoked only in `case 0`, `:42`), so **every** script source drifts to a bare `$1` — even an
    Angular-suffixed path: `user.component.ts` → `import { $1 } from './…/user.component';` (NOT `import {
    UserComponent }`), matching `svelte.md §4C` / `mdx.md §4D.1`. Restore the setting after.

- **`.astro` has NO `astroImportStyle` setting — the script arm reuses `typescriptImportStyle`** (the SAME
  setting `.ts`/`.tsx`/`.mdx`/`.vue`/`.svelte` use). `variants.ts:buildFrameworkComponentVariants` (`:148-167`)
  backs every script variant with `('script','typescript')`; `config/settings.ts:12-19` has no `astro` key
  (only `preserve`/`javascript`/`typescript`); and `package.json:204`'s *"TypeScript / TSX import style"*
  description explicitly says *"…and for all script sources imported into .vue, .svelte, or .astro files."* §8
  must call out this cross-effect (changing the default while QA-ing `.astro` also moves `.ts`/`.tsx`/`.mdx`/
  `.vue`/`.svelte`) and restore after.

- **§5 (Smart identifier) is PRESENT — Angular-PascalCase only** [smartId ≠ none; do NOT mark N/A].
  `framework-component.ts` calls `buildTypeScriptImportSnippet` **without** a `detectedImportName` (`:20`), so
  `readExportedClassName` is **never called** → **no exported-class fill**; but style-0 still runs
  `generateAngularLegacyImportName` (`typescript.ts:42`). Emit:
  - one case per Angular suffix (5) → PascalCase on style 0 (`user.component.ts` → `UserComponent`;
    `.directive` → `UserDirective`; `.pipe` → `UserPipe`; `.service` → `UserService`; `.module` →
    `UserModule`);
  - a non-Angular path → bare `$1`;
  - **the signature counter-case to `.ts` §5** — a source containing `export class EventBus` at a non-Angular
    path → **still `import { $1 } from './event-bus';`** (NOT `\${1:EventBus}`);
  - **the framework-vs-`.tsx` distinction** — Angular fires for **all four** script exts here, so a `.js`
    Angular source (`widget.component.js`) → `import { WidgetComponent } from './widget.component';` (in
    `.tsx`/`.mdx` the same `.js` source hits the JS builder → no PascalCase). Emit one such case.
  - **Angular identifier guard** (`typescript.ts:75`) — `2fa.service.ts` → derived `2faService` fails
    `/^[A-Za-z_$][\w$]*$/` (leading digit) → bare `$1`, even though a suffix matched.
  Emit **no** exported-class detection case (that is `.ts`-destination-only, owned by `typescript.md §5`).

- **DELTA B — §6 placement is `astro-frontmatter` (container-confined within the `---` fences) — the generic
  Top/Bottom/Cursor section is NOT emitted, and there is NO block-selection-preference sub-case.** `.astro` →
  `computeAstroPlacement` (`placement.ts:206-236`, drop flow) / `insertSnippetAtAstroFrontmatter`
  (`insert-snippet.ts:108-146`, command flow — the two mirror each other). Emit:
  - **The astro-vs-vue/svelte structural difference:** `findAstroFrontmatterBounds` (`placement.ts:42-54`) is
    a **plain first-two-`---`-fence scan** (a line whose `trim() === '---'`), with **no** 3-tier preference —
    there is no `<script setup>` / `<script context="module">` analog. So **do NOT emit a "block selection
    preference" case** (that was vue/svelte §6.1); instead emit the **fence-vs-template** distinctive case:
    with the cursor in the **template body** (after the closing `---`), a **Cursor** placement falls back to
    **Bottom-within-fences**, NOT at the cursor (`rawCursorLine > openingLine && < closingLine` guard,
    `insert-snippet.ts:129` / `placement.ts:222`).
  - **Top** = just after the opening `---` line (`openingLine + 1`); **Bottom** = after the last
    `IMPORT_INDICATORS` line within the fences (`findBottomLineInRange`, `placement.ts:85-101`; fallback:
    just after the opening `---`); **Cursor** = the cursor line only when strictly between the fences, else
    Bottom-within-fences; `adjustForCommentBlock` applies (`.astro` is **not** markdown → a leading `*` IS a
    comment, pushes above);
  - **create-if-missing** — a `.astro` with no `---` frontmatter → a new `---\n<import>\n---\n` block is
    created at line 0 (`insert-snippet.ts:113-117` / `placement.ts:209-211`), and all three modes converge
    there;
  - inserted lines adopt the block's **detected indentation** (`detectBlockIndentation`, `placement.ts:32-39`);
    `.astro ∈ SCRIPT_FILE_EXTENSIONS` (`constants/extensions.ts:105`) → insertion column 0 (and
    `computeAstroPlacement` hardcodes `column: 0` in every branch).
  - Astro markup after the closing fence is **bare** (HTML-like template) — destination fixtures put real
    markup like `<h1>{title}</h1>` below the second `---`, not a `<template>`/`<script>` wrapper.
  - Not inline, not forced-cursor, not sfc-script.

- **§7 Pick Style (DELTA, xref `general.md §9`):** placeholder verbatim `Select an import style`. Script
  source → **7 TS items**; non-script source → a **single** variant → **direct-insert** (no picker, empty
  description). Each item LABEL = the `path.basename` snippet preview (nested `../../components/Widget`
  collapses to `Widget`), INSERTED text = the FULL relative path — assert **both**. Style-0 TS label is
  **Angular-prefilled** for a suffixed path. DESCRIPTION = each style's `tag`. Universal QuickPick mechanics →
  `general.md §9`, do NOT duplicate.

- **§8 Set Default (DELTA, xref `general.md §10`):** on selecting a configurable script style, info toast
  verbatim `Auto Import: Default style saved — {style description}` and
  **`auto-import.importStatement.script.typescriptImportStyle`** now holds that value — **call out that this
  is the SAME setting as `.ts`/`.tsx`/`.mdx`/`.vue`/`.svelte`** (no `astroImportStyle`), and restore after.
  For a non-script source (asset arm carries no `setting`) → `no-configurable-style`: `Auto Import: .{src} →
  .astro imports use a fixed style.` Universal mechanics → `general.md §10`, do NOT duplicate.

- **§9 Drag-and-drop (DELTA, xref `general.md §8`):** a drop reuses the same `buildImportSnippet` +
  `computeImportPlacement` pipeline → byte-identical to §2. Cases:
  - (a) happy-path script drop = §2 string; happy-path asset drop = §2 asset string;
  - (b) **unsupported-pair drop** (e.g. `.css` / `.html` / `.pdf` → `.astro`) → the not-supported reject
    toast **AND no import inserted** — the drop edit resolves to `null`, so VS Code falls back to its default
    text-drop and the **raw path text** lands (`.astro` is allow-list, so this case **applies** — the contrast
    to accept-all `.tsx`);
  - (c) placement modes + comment-Cursor sub-cases at the drop line **within the `---` fences**;
  - (d) Angular naming on drop (`user.component.ts` → `{ UserComponent }`) and drop-time
    `preserveScriptFileExtension` (script → `./Widget.astro`-style ext on; asset always keeps its ext).
  - **Framework drop slots:** (i) a **script** drop into a `.astro` lacking frontmatter **creates** the
    `---\n…\n---\n` wrapper, else constrains within it; (ii) a **non-script** asset drop emits the same
    single-variant asset shape as the item-2/item-4 non-script arm, placed inside the (created-if-missing)
    wrapper.
  - **Untitled-buffer DnD precondition** is the cross-cutting "emit once" rule — cross-reference its canonical
    instance (`typescript.md §9.10`), do NOT re-emit it here.

- **§10 edge cases:** (a) `require( … )` line / an `import ` substring **inside a string literal** **within
  the `---` fences** act as Bottom false-positive markers (the `IMPORT_INDICATORS` scan, scoped to the
  frontmatter by `findBottomLineInRange`); (b) **DELTA D — the named-asset import family** (richer than
  svelte's single self-import case): the `.astro`→`.astro` self-import is a NAMED ASSET import (`import
  \${1:name} from './Card.astro';`), **and** so are the cross-framework `.vue`→`.astro` / `.svelte`→`.astro`
  and the doc `.md`→`.astro` / `.mdx`→`.astro` — **all** named-asset imports (`_react.ts:68-73`), proving every
  non-script accepted source is asset-routed despite `.vue`/`.svelte`/`.astro`/`.mdx` being "scripty"
  elsewhere (the framework builder ignores `determineImportType`; these `∉ SCRIPT_SOURCE_EXTENSIONS` →
  `buildAssetImportStatement` named-default group). The `.mdx`→`.astro` case is the sharpest.

- **§11 sign-off** — case-count summary closing the checklist (~parity with `svelte.md`/`vue.md`, slightly
  higher from the wider §1 accept rows + the richer §10 named-asset family).

- **Emit only the destination DELTA**, cross-referencing `general.md §8` (DnD), `§9` (Pick Style), `§10`
  (Set Default) for universal mechanics, and `typescript.md §9.10` for the untitled-buffer DnD precondition.
  `general.md` is assumed passed; never re-test what it owns. **Shape/quality bar = `typescript.md`;
  structural shape = the framework trio.** Match the section layout, executable-step style, and
  fixture-inlining; substitute the `.astro` values + the four deltas (A gating · B placement · C drift gotcha ·
  D named-asset family).

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.astro` (gating · styles · smartId · defaultStyle ·
      placement · pathQuirks), incl. the smartId note that all four script exts reach Angular and the
      identifier-validity guard (`typescript.ts:75`), and the `placement` row's `astro-frontmatter` mode
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail — esp. the framework-trio item-4
      two-arm + allow-list item-1 + item-5 Angular-only variant + the framework item-9 drop slots + the
      item-6 `astro-frontmatter` slot — and authoring rules)
- [x] Read source-of-truth files for `.astro`:
      - `src/snippets/languages/framework-component.ts` — per `dispatch.ts`, `.astro` →
        `framework-component.ts`: local `SCRIPT_SOURCE_EXTENSIONS = [ '.ts', '.tsx', '.js', '.jsx' ]` (`:10`);
        script sources → `buildTypeScriptImportSnippet(relativePath + ext)` **one-arg, no `detectedImportName`**
        (`:20`); everything else → `buildAssetImportStatement(sourceExt, relativePath + ext)` (`:23`). **Never
        calls `determineImportType`.**
      - `src/snippets/languages/typescript.ts` — the delegated builder:
        `buildTypeScriptImportSnippetByStyle` (`:33-62`, 7-case switch + `generateAngularLegacyImportName` on
        style 0 at `:42`, called **without** `detectedImportName` for `.astro` → no exported-class fill; the
        `/^[A-Za-z_$][\w$]*$/` validity guard at `:75`); `default:` arm (`:57-60`) emits the style-0 shape and
        runs **no** Angular naming
      - `src/snippets/_styles.ts` — `TYPESCRIPT_IMPORT_OPTIONS` (7): literal `description` strings + `tag`
        labels + tab-stop layout per style
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — `buildFrameworkComponentVariants`
        (`variants.ts:148-167`: all four of `.ts`/`.tsx`/`.js`/`.jsx` → 7 TS styled variants backed by
        `('script','typescript')`; non-script → a single hardcoded variant via `buildReactNonScriptVariant`
        `:169-180`, no `setting`) and the `.vue`/`.svelte`/`.astro` destination dispatch case (`dispatch.ts:34-37`)
      - `src/snippets/_react.ts` — `buildAssetImportStatement` (`:48-94`): the `.module.css/.module.scss` check
        (FIRST, `:52-54`, but **unreachable for `.astro`** — stylesheets gated out) and the asset `switch`. For
        `.astro` only the **named-default** (image/data/doc/component incl. `.md`/`.mdx`/`.vue`/`.svelte`/`.astro`,
        `:56-74`) and **url-default** (av/text-track, `:75-83`) arms are reachable; font/stylesheet/module-css
        arms and `default: null` never fire for a gated-in `.astro` source
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the `astro-frontmatter` mode:
        `computeAstroPlacement` (`placement.ts:206-236`) / `insertSnippetAtAstroFrontmatter`
        (`insert-snippet.ts:108-146`, dispatched at `:37-38`); `findAstroFrontmatterBounds` first-two-`---`
        scan (`placement.ts:42-54` — **no** `<script setup>`/`context=` preference, unlike `findSfcScriptBounds`);
        no fences → create `---\n…\n---\n` at line 0; `findBottomLineInRange` Bottom-in-fences scan (`:85-101`);
        `detectBlockIndentation` (`:32-39`); `adjustForCommentBlock` Cursor adjustment (`:125-134`, `.astro` not
        markdown → `*` is a comment); `.astro ∈ SCRIPT_FILE_EXTENSIONS` → column 0
      - `src/gating.ts` — allow-list: `.astro ∈ CROSS_IMPORT_DESTINATIONS` passes the first clause (`:17`), then
        `destinationFileExt === '.astro' && !ASTRO_SUPPORTED_EXTENSIONS.includes(sourceFileExt)` (`:41`) rejects
        non-members
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — the literal
        `ASTRO_SUPPORTED_EXTENSIONS` members (`:79-95` — the **widest** framework list, incl. `.vue` `.svelte`
        `.md` `.mdx`) + the closed `SOURCE_UNIVERSE` for the §1 reject complement; `.astro ∈
        CROSS_IMPORT_DESTINATIONS` (`:123`) + `SCRIPT_FILE_EXTENSIONS` (`:105`)
      - `src/config/settings.ts` — confirms **no `astroImportStyle`** (`:12-19`); the framework script arm
        reads/writes `('script','typescript')` → `typescriptImportStyle`
      - `package.json` (`contributes.configuration` enums + `default`) — `typescriptImportStyle` (`:202-204`,
        titled *"TypeScript / TSX import style"*, default `import { name } from '_relativePath_';`, index 0; its
        description explicitly names `.vue`/`.svelte`/`.astro`); `importStatementPlacement` (`:158`, Top/Bottom/
        Cursor, default Bottom; description: *"For .astro files, placement is constrained to the frontmatter
        block"*); `preserveScriptFileExtension` (default false); enum strings byte-match `_styles.ts`
      - **N/A for `.astro` (do NOT read — conditional/unused files):** `src/snippets/_class-name.ts`
        (exported-class detection is `.ts`-destination-only; `framework-component.ts` never calls
        `readExportedClassName`) · `src/path/import-type.ts` (`framework-component.ts` branches on its own local
        `SCRIPT_SOURCE_EXTENSIONS`, never `determineImportType`) · `src/snippets/languages/javascript.ts` (the
        JS builder is **not** used by the framework arm — all four script exts route to the TS builder)
- [x] Write `qa.new/checklists/astro.md` per RECIPE + the `.astro` PROFILE row + the generation notes above,
      with expected fixture content inlined for every referenced path. Sections: §1 gating matrix
      (**allow-list**: accept rows `.astro`/script×4/`.vue`/`.svelte`/data×3/`.md`/`.mdx`/image/media/`.vtt` →
      default shape; reject rows `.css`/`.scss`/`.html`/`.woff2`/`.pdf` → `Cannot import .{src} into .astro
      files.`) · §2 happy path (3 branches: script / named-asset / url-asset) · §3 Insert from Selected File
      (`Alt+D`) · §4 **two arms** (arm 1: 7 TS styles backed by `typescriptImportStyle`; arm 2: 2 reachable
      asset shapes, single-variant; + style-name drift; **no** module-css / side-effect / empty-snippet case)
      · §5 **Smart identifier — Angular-PascalCase only** (5 suffixes; non-Angular→`$1`; no-exported-class-fill
      counter-case to `.ts`; Angular-fires-for-all-4-script-exts `.js` case; `2fa.service` validity-guard→`$1`)
      · §6 placement (**astro-frontmatter** container-confined: **first-two-`---`-fence** scan with **no**
      block-selection preference, **fence-vs-template Cursor fallback**, Top/Bottom/Cursor-within-fences,
      create-if-missing `---\n…\n---\n` wrapper, detected indentation, col 0 — **no** generic section) · §7
      Pick Style (DELTA, xref §9; label-vs-inserted assertion; 7 TS items / 1 direct-insert for asset; style-0
      Angular prefill) · §8 Set Default (DELTA, xref §10; `typescriptImportStyle` + shared-setting cross-effect
      note / `no-configurable-style` for asset) · §9 Drag-and-drop (DELTA, xref §8; happy script/asset drop /
      **unsupported-pair raw-text fallback** / placement-in-fences / Angular-on-drop / drop-time preserve /
      **wrapper-create-on-drop** + non-script-asset-in-wrapper; untitled-buffer → `typescript.md §9.10`) · §10
      edge cases (`require(`/string-literal Bottom false-positive within the `---` fences; **named-asset import
      family** — `.astro`/`.vue`/`.svelte`/`.md`/`.mdx`→`.astro`) · §11 sign-off (case-count summary)
- [x] Self-verify: every RECIPE section the `.astro` profile marks **required** is present (§1, §2, §3, §4,
      §5, §6, §7, §8, §9, §10, §11) — note §5 **is** required here (smartId ≠ none)
- [x] Self-verify: **no excluded content was emitted** — the generic Top/Bottom/Cursor placement section does
      NOT appear (`.astro` is `astro-frontmatter`); **no block-selection-preference sub-case** appears (astro's
      bounds finder has no `<script setup>`/`context=` tiers — that was vue/svelte only); no exported-class
      detection case appears (that is `.ts`-destination-only); no `.module.css`/side-effect/empty-snippet
      sub-case appears (those arms are gate-rejected or React-trio-only)
- [x] Self-verify: section 4 **arm 1** enumerates **exactly 7** TS styles (N = `TYPESCRIPT_IMPORT_OPTIONS`
      count), each with its literal inserted string + tab-stop layout; **arm 2** enumerates the **2 reachable**
      asset shapes (named-default `import \${1:name}` + url-default `import \${1:url}`), each single-variant;
      plus the style-name-drift sub-item resolving to the style-0 shape (bare `$1`; an Angular-suffixed path
      **also** drifts to bare `$1` — the `default:` arm has no Angular branch, `typescript.ts:57-60`)
- [x] Self-verify: §1 reject sample covers every reject **category present** (stylesheet `.css`/`.scss` · html
      `.html` · font `.woff2` · document `.pdf`) and emits **no** reject row for a category astro **accepts**
      (image / media / `.vtt` / data / `.vue` / `.svelte` / `.md` / `.mdx` are all ACCEPT rows)
- [x] Self-verify: §6 contains the **fence-vs-template Cursor fallback** (cursor in the markup body →
      Bottom-within-fences) and the **create-if-missing `---\n…\n---\n`** convergence case
- [x] Self-verify: every fixture path referenced has its expected content inlined (fixture-content-inlining
      rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file, the exact gesture
      (keybinding / Command Palette entry / drag-drop), and the exact expected result (literal inserted string
      or verbatim toast); no step requires the tester to guess
- [x] Self-verify: every section with universal mechanics carries the one-line `general.md` cross-reference
      (§1→same-file, §7→§9, §8→§10, §9→§8) and re-tests only the DELTA; the untitled-buffer DnD precondition
      points to `typescript.md §9.10`
