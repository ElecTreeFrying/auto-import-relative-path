# Runbook — `.tsx` checklist generation (Phase A)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> generation tasks. The `[ ]` boxes inside the generated
> `qa.new/checklists/tsx.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/tsx.md` during generation.**

Drives **session 10a** (`generate-tsx-checklist`, Phase A) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template A) + §10/§11. Output of this runbook:
`qa.new/checklists/tsx.md`. Committed together with this runbook in one commit.

## Generation notes (approved for `.tsx`)

`.tsx` is the pipeline's **second React-family destination** (after `.jsx`) and the first to
exercise the `_react.ts` **primary + fallback** script dispatch. `jsx.md` is the structural
template (same accept-all §1, same React-family item-4 two-arm, same `generic` placement); the
quality/shape bar is `typescript.md`. Every `.tsx` delta flows from one fact: **`tsx.ts` hands
`buildReactImport` BOTH a TS `primarySnippet` (`.ts`/`.tsx` sources) AND a JS `fallbackSnippet`
(`.js`/`.jsx` sources)** — where `jsx.ts` passes neither a TS primary nor any fallback. Approved
structural decisions, to apply when writing the checklist:

- **`gating: accept-all` → §1 is an ALL-ACCEPT matrix, no source-ext reject rows.**
  `.tsx ∈ CROSS_IMPORT_DESTINATIONS`, so `isPairSupported` returns `true` for *every* source
  (`gating.ts`: first clause short-circuits; no per-destination clause matches `.tsx`). §1 lists
  one accepted row per `SOURCE_UNIVERSE` category → its default-style shape (it doubles as a
  coverage map into §2/§4). The only universal rejection is same-file, owned by `general.md` —
  cross-reference, never re-test.
- **Unlike `.jsx`, there is NO empty-snippet case.** Because `.tsx` has a JS **fallback**, every
  script source renders: `.ts`/`.tsx` → TS named import (primary), `.js`/`.jsx` → JS default
  import (fallback), non-script → a fixed asset shape. Every `SOURCE_UNIVERSE` member is covered
  by `buildAssetImportStatement` or the primary/fallback paths — `_react.ts`'s `default: null`
  (empty) is never reached for a gated-in source. So §1 has **zero empty rows**, §4 has **no
  empty-snippet sub-case** (the `.jsx`-only `4C`), and §9 has **no raw-text-fallback drop** (the
  `.jsx`-only `§9.3`). This absence is the central `.tsx` ≠ `.jsx` signal.
- **§2 happy path = THREE branches** (one per `profile.styles` branch): TS-script
  (`import { $1 } from './Widget';`), JS-script **via fallback** (`import $1 from './helper';` —
  the JS default shape, **not** the TS named shape), and asset
  (`import ${1:name} from '../assets/logo.png';`, full ext kept).
- **§4 has TWO ARMS, and arm 1 has TWO script tables** (React-family rule, doubled because `.tsx`
  dispatches to both builders):
  - *Arm 1A — `.ts`/`.tsx` source* → the **7 TS styles** (`TYPESCRIPT_IMPORT_OPTIONS`), each with
    literal inserted string + tab-stop layout, backed by the `typescriptImportStyle` setting.
    Style-0 = named `import { $1 } from '<path>';` (+ Angular PascalCase on a suffix match, §5).
    Style 5 (`import { $1, type $2 }`) has **two** tab stops.
  - *Arm 1B — `.js`/`.jsx` source* → the **7 JS styles** (`JAVASCRIPT_IMPORT_OPTIONS`), backed by
    the `javascriptImportStyle` setting. Style-0 = default `import $1 from '<path>';`. Style 2
    (`import $1, { $2 }`) has **two** tab stops.
  - *Arm 2 — non-script asset source* → the **4 fixed shapes**, each a SINGLE variant. Pick Style
    **direct-inserts** (length-1 path, no picker); Set Default rejects with `no-configurable-style`
    (`Auto Import: .{src} → .tsx imports use a fixed style.`). **Full source extension always
    kept.** Shapes: `*.module.css`/`*.module.scss` → `import ${1:styles} from '<path>';` (checked
    FIRST — beats the side-effect shape) · image/doc/component → `import ${1:name} from '<path>';` ·
    av/text-track → `import ${1:url} from '<path>';` · font/stylesheet → `import '<path>';`
    (side-effect, no tab stop). MUST include the `.module.css`-beats-side-effect proof (a plain
    `.css` → side-effect, contrast) + the **assets-keep-full-ext-with-preserve-OFF** note (the
    toggle is script-namespace; `_react.ts` builds asset paths from `fullPath`).
  - *Style-name-drift sub-item* → set `typescriptImportStyle` to a string matching no enum (config
    drift / hand-typed in settings.json), paste a `.ts` source → the import STILL inserts using the
    **style-0 shape** `import { $1 } from '<path>';` (`resolveStyleIndex` → undefined → builder
    `default:` arm), **never nothing**. Note the `.tsx` precision: the `default:` arm pre-fills
    **neither** a class **nor** Angular (no `detectedImportName` is ever passed to `.tsx`, and
    Angular naming lives only in `case 0`) → a bare `$1`. Mirror with a `javascriptImportStyle`
    drift → `import $1 from '<path>';`.
- **`.tsx` has NO `tsxImportStyle` setting — it reuses BOTH `typescriptImportStyle` AND
  `javascriptImportStyle`, keyed on the SOURCE extension.** `variants.ts:buildTsxVariants` backs
  `.ts`/`.tsx` variants with `('script','typescript')` and `.js`/`.jsx` variants with
  `('script','javascript')`; the `package.json` settings are titled *"TypeScript / TSX import
  style"* and *"JavaScript / JSX import style"*, and both descriptions name `.tsx` explicitly. §8
  notes BOTH cross-effects (these keys also govern `.ts`/`.js` destinations and `.tsx`/`.mdx`).
- **§5 (Smart identifier) is PRESENT — Angular-PascalCase only** [PROFILE Delta #2; do NOT mark
  N/A]. `.tsx` routes `.ts`/`.tsx` sources through the TS builder, whose style-0 calls
  `generateAngularLegacyImportName`. But `buildTypeScriptImportSnippet`/`…ByStyle` is invoked
  **without** a `detectedImportName` (`tsx.ts` → `_react.ts` primary = one-arg; `variants.ts`
  `buildTsxVariants` passes no third arg), so `readExportedClassName` is **never called** → **no
  exported-class fill**. Emit, scoped to `.ts`/`.tsx` sources only:
  - one case per Angular suffix (5) → its PascalCase identifier on style 0
    (`user.component.ts` → `import { ${1:UserComponent} } from './user.component';`);
  - a non-Angular `.ts` path → bare `$1`;
  - **the signature counter-case to `.ts` §5.A** — a `.ts`/`.tsx` source containing `export class
    Foo` → **still `import { $1 } from './…';`** (NOT `${1:Foo}`); this is what distinguishes
    `.tsx` smart-ID from `.ts`;
  - **Angular is TS-source-only** — a `.component.js`/`.jsx` source → JS fallback → bare
    `import $1 from './…';` (no PascalCase), contrasting with the `.ts` suffix case;
  - **preserve-ext stability** — `user.component.ts` yields `UserComponent` whether the path is
    `./user.component` (off) or `./user.component.ts` (on), never `UserComponentTsx`.
  Emit **no** exported-class detection case (that is `.ts`-destination-only, owned by
  `typescript.md` §5.A).
- **Preserve-extension (script, paste) path mechanic is `general.md §7.5/§7.6`-owned** — not
  re-tested as a standalone case. `.tsx` re-tests preserve only where it interacts with
  destination-specific behavior: the Angular-stable-across-preserve pair (§5) and the drop-time
  preserve case (§9). §4 arm 2 adds the asset delta (assets keep full ext with the toggle OFF).
- **§6 placement is plain `generic`, column 0** (Top/Bottom/Cursor honored). `.tsx ∈
  SCRIPT_FILE_EXTENSIONS` → column 0; not inline, not forced-cursor, not astro/sfc. Cursor
  `adjustForCommentBlock`: a lone `//` inserts AT the line; a `/* */` block, grouped-`//` run,
  **or leading-`*` line** pushes the import ABOVE — `.tsx` is **NOT** markdown
  (`isMarkdownDestination('.tsx')` is false), the explicit counter-case to `.md`/`.mdx` and the
  basis for the §10 `.mdx` ≠ `.tsx` proof. Mirror `jsx.md` §6 sub-cases.
- **§7 Pick Style (DELTA, xref `general.md §9`):** TS source → 7 TS items; JS source → 7 JS items;
  asset → a single variant → **direct-insert** (no picker, empty description). Each item LABEL =
  the `path.basename` snippet preview, INSERTED text = the FULL relative path — assert **both**.
  Style-0 TS label is **Angular-prefilled** for a suffixed path
  (`import { UserComponent } from 'user.component';`). **No 0-variant case** (every script source
  produces variants — the contrast to `jsx.md` §7.4).
- **§9 Drag-and-drop (DELTA, xref `general.md §8`):** a drop reuses the same `buildImportSnippet` +
  `computeImportPlacement` pipeline → byte-identical to §2. Cases: happy TS drop / happy JS drop /
  happy asset drop / placement (Bottom / Top / Cursor incl. lone-`//` at line + `/* */` block
  above) / column-0 / **Angular naming on drop** (`user.component.ts` → `{ UserComponent }`) /
  drop-time `preserveScriptFileExtension` (script → `./Widget.tsx`; asset still keeps its ext).
  **No unsupported-pair raw-text-fallback case** — `.tsx` accepts every source and renders all of
  them, so there is no null-resolving drop; emit a one-line note of the contrast to `jsx.md` §9.3.
  The untitled-buffer DnD precondition is cross-referenced to its canonical instance
  (`typescript.md §9.10`), not re-emitted.
- **§10 edge cases:** (a) the **markdown-star Cursor case as the `.mdx` ≠ `.tsx` proof** — a cursor
  on a leading-`*` line lands AT the line in `.md`/`.mdx` but jumps ABOVE in the byte-identical
  `.tsx` buffer (same `tsx.ts` builder, opposite comment handling via `isMarkdownDestination`);
  (b) `import ` inside a string literal + a `require(` line as Bottom false-positive markers;
  (c) optional: JS-fallback recap (a `.js`/`.jsx` source → a JS-shaped import, not TS).
- **Emit only the destination DELTA**, cross-referencing `general.md §8` (DnD), `§9` (Pick Style),
  `§10` (Set Default) for universal mechanics — the convention `typescript.md`/`jsx.md` use.
  `general.md` is assumed passed; never re-test what it owns.
- **Shape/quality bar = `typescript.md`; structure mirrors `jsx.md`.** Match the section layout,
  executable-step style, and fixture-inlining; substitute the `.tsx` values.

## Phase A — Build checklist

- [x] Read `qa.new/_authoring/PROFILE.md` row for `.tsx` (gating · styles · smartId ·
      defaultStyle · placement · pathQuirks), incl. Delta #2 (`.tsx` smartId = Angular-only)
- [x] Read `qa.new/_authoring/RECIPE.md` (section skeleton, item detail — esp. the React-family
      item-4 two-arm + accept-all item-1 + item-5 Angular-only variant — and authoring rules)
- [x] Read source-of-truth files for `.tsx`:
      - `src/snippets/languages/tsx.ts` — per `dispatch.ts`, `.tsx` → `tsx.ts`: delegates to
        `buildReactImport` with `primaryExtensions: ['.ts','.tsx']`,
        `primarySnippet: buildTypeScriptImportSnippet`, `fallbackExtensions: ['.js','.jsx']`,
        `fallbackSnippet: buildJavaScriptImportSnippet`
      - `src/snippets/_react.ts` — `buildReactImport`: primary (TS) + fallback (JS) script paths
        (both honor `preserveScriptFileExtension`), the `.module.css/.module.scss` check (FIRST),
        the non-script asset `switch` in `buildAssetImportStatement` (4 groups, full ext via
        `fullPath`), and `default: null` (empty — **never reached for a gated-in source**, since
        primary/fallback/asset cover every `SOURCE_UNIVERSE` member; this is why `.tsx` has no
        empty-snippet case)
      - `src/snippets/languages/typescript.ts` and `src/snippets/languages/javascript.ts` — the
        primary/fallback builders: `buildTypeScriptImportSnippetByStyle` (7-case switch + Angular
        `generateAngularLegacyImportName` on style 0, called **without** `detectedImportName` for
        `.tsx` → no exported-class fill) and `buildJavaScriptImportSnippetByStyle` (7-case switch);
        both `default:` arms emit the style-0 shape
      - `src/snippets/_styles.ts` — **BOTH** `TYPESCRIPT_IMPORT_OPTIONS` (7) **and**
        `JAVASCRIPT_IMPORT_OPTIONS` (7): literal `description` strings + `tag` labels + tab-stop
        layout per style
      - `src/snippets/variants.ts` and `src/snippets/dispatch.ts` — `buildTsxVariants`
        (`.ts`/`.tsx` → 7 TS styled variants backed by `('script','typescript')`; `.js`/`.jsx` → 7
        JS styled variants backed by `('script','javascript')`; non-script → a single hardcoded
        variant via `buildReactNonScriptVariant`) and the `.tsx`/`.mdx` destination dispatch case
      - `src/editor/placement.ts` and `src/editor/insert-snippet.ts` — the `generic` placement mode
        (Top/Bottom/Cursor; column 0 via `SCRIPT_FILE_EXTENSIONS`; `IMPORT_INDICATORS` Bottom scan;
        `adjustForCommentBlock` Cursor adjustment; `isMarkdownDestination('.tsx')` is **false** →
        leading `*` is a comment continuation)
      - `src/gating.ts` — accept-all: `.tsx ∈ CROSS_IMPORT_DESTINATIONS` short-circuits the first
        clause; no per-destination clause matches `.tsx` → every source accepted (and, unlike
        `.jsx`, every source also renders a non-empty snippet)
      - `src/constants/extensions.ts` and `src/types/file-extension.ts` — the closed
        `SOURCE_UNIVERSE` for the §1 all-accept category rows; `.tsx ∈ CROSS_IMPORT_DESTINATIONS`
        + `SCRIPT_FILE_EXTENSIONS`
      - `package.json` (`contributes.configuration` enums + `default`) — the `defaultStyle` field:
        `typescriptImportStyle` (titled *"TypeScript / TSX import style"*) default =
        `import { name } from '_relativePath_';` (index 0) for `.ts`/`.tsx` sources;
        `javascriptImportStyle` (titled *"JavaScript / JSX import style"*) default =
        `import name from '_relativePath_';` (index 0) for `.js`/`.jsx` sources; enum strings
        byte-match `_styles.ts`
      - **N/A for `.tsx` (do NOT read — conditional files for other destinations):**
        `src/snippets/_class-name.ts` (exported-class detection is `.ts`-destination-only; `.tsx`
        never calls `readExportedClassName`) · `src/path/import-type.ts` (source-**type**-dispatch
        destinations `.html`/`.css`/`.scss`/`.md`; `.tsx` branches on the **raw source extension**
        via `_react.ts`/`variants.ts`, never `determineImportType`)
- [x] Write `qa.new/checklists/tsx.md` per RECIPE + the `.tsx` PROFILE row + the generation notes
      above, with expected fixture content inlined for every referenced path. Sections: §1 gating
      matrix (**all-accept**: one row per `SOURCE_UNIVERSE` category → its default shape; **no empty
      rows** — `.ts`/`.tsx`→TS named, `.js`/`.jsx`→JS default, `.mdx`/framework/html/md/image/data/
      pdf→named asset, module-css→`${1:styles}`, stylesheet/font→side-effect, av/vtt→`${1:url}`) ·
      §2 happy path (3 branches: TS-script / JS-script-fallback / asset) · §3 Insert from Selected
      File (`Alt+D`) · §4 **two arms** (arm 1A: 7 TS styles; arm 1B: 7 JS styles; arm 2: 4 fixed
      asset shapes + module-css proof + assets-keep-ext note; + style-name drift; **no empty-snippet
      case**) · §5 **Smart identifier — Angular-PascalCase only** (5 suffixes scoped to `.ts`/`.tsx`
      sources; non-Angular→`$1`; no-exported-class-fill counter-case to `.ts`; Angular-is-TS-source-
      only; preserve-stable identifier) · §6 placement (full generic Bottom/Top/Cursor, col 0,
      leading-`*`-is-comment contrast) · §7 Pick Style (DELTA, xref §9; label-vs-inserted assertion;
      7 TS items / 7 JS items / 1 direct-insert for asset; style-0 Angular prefill; **no 0-variant
      case**) · §8 Set Default (DELTA, xref §10; `typescriptImportStyle` for `.ts`/`.tsx` +
      `javascriptImportStyle` for `.js`/`.jsx` + no-`tsxImportStyle` shared-setting note /
      `no-configurable-style` for asset) · §9 Drag-and-drop (DELTA, xref §8; happy TS/JS/asset drop /
      placement / Angular-on-drop / drop-time preserve; **no raw-text-fallback drop** — note the
      contrast to `jsx.md §9.3`; untitled-buffer → `typescript.md §9.10`) · §10 edge cases
      (markdown-star `.mdx`≠`.tsx` proof, string-literal + `require(` Bottom false-positives,
      optional JS-fallback recap) · §11 sign-off (case-count summary)
- [x] Self-verify: every RECIPE section the `.tsx` profile marks **required** is present
      (§1, §2, §3, §4, §5, §6, §7, §8, §9, §10, §11) — note §5 **is** required here (smartId ≠ none)
- [x] Self-verify: **no excluded content was emitted** — no exported-class detection case appears
      (that is `.ts`-destination-only); no empty-snippet case and no raw-text-fallback drop appear
      (those are `.jsx`-only); no source-extension rejection rows in §1 (accept-all)
- [x] Self-verify: section 4 **arm 1A** enumerates **exactly 7** TS styles (N =
      `TYPESCRIPT_IMPORT_OPTIONS` count) and **arm 1B** enumerates **exactly 7** JS styles (N =
      `JAVASCRIPT_IMPORT_OPTIONS` count), each with its literal inserted string + tab-stop layout;
      **arm 2** enumerates the **4** fixed asset shapes + the `.module.css`-beats-side-effect proof;
      plus the style-name-drift sub-item resolving to the style-0 shape (bare `$1`, no smart-ID)
- [x] Self-verify: every fixture path referenced has its expected content inlined
      (fixture-content-inlining rule) — Phase A creates NO fixture files
- [x] Self-verify: every actionable step is executable — names the exact fixture file, the exact
      gesture (keybinding / Command Palette entry / drag-drop), and the exact expected result
      (literal inserted string or verbatim toast); no step requires the tester to guess
- [x] Self-verify: every section with universal mechanics carries the one-line `general.md`
      cross-reference (§1→same-file, §7→§9, §8→§10, §9→§8) and re-tests only the DELTA; the
      untitled-buffer DnD precondition points to `typescript.md §9.10`
