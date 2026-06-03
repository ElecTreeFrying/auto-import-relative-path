# Runbook — `.mdx` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/mdx.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/mdx.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/mdx.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present on disk (707 lines). NOTE: the session-11a
> commit never landed, so `mdx.md` + `runbook-mdx-checklist.md` are present but
> untracked. Per the approved plan this session FOLDS 11a + 11b into one combined
> commit (the session-9 jsx precedent `0c65290`, and session-10 tsx `e978631`, each
> shipped Phases A–C in one commit). The on-disk `mdx.md` is the final checklist and
> the source of truth for fixture extraction.**

Drives **session 11b** (`generate-mdx-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/mdx/*` + the updated `qa.new/` inventory/sync docs. Committed together
with this runbook **and the untracked 11a artifacts** (`mdx.md` + `runbook-mdx-checklist.md`)
in one commit.

## Workspace notes (approved for `.mdx`)

`.mdx` shares the **exact same builder** as `.tsx` (`dispatch.ts` routes both `.tsx` and `.mdx` to
`tsx.ts:buildSnippet`), so every **import shape** is byte-identical to `.tsx` and the fixture set is
structurally identical to `workspace/tsx/` (session 10b). Phase B is mechanical: `mdx.md` already inlines the
exact content for every fixture, so this is faithful transcription, not design. The checklist drives the
workspace 1:1.

- **Accept-all → `assets/`, not `rejected/`.** `.mdx ∈ CROSS_IMPORT_DESTINATIONS`, so **every** source is
  accepted. The tree is **`src/` + `assets/` + `destinations/`** — no `rejected/` dir.
- **Two-script-arm + asset model.** `.ts`/`.tsx` source → 7 configurable `typescriptImportStyle` styles
  (**primary**); `.js`/`.jsx` source → 7 `javascriptImportStyle` styles (**fallback**); non-script asset → one of
  4 fixed shapes (`${1:styles}` / `${1:name}` / `${1:url}` / side-effect). **Every gated-in source renders a
  non-empty snippet → NO empty-snippet case and NO raw-text-fallback drop.** `.mdx` has **no** `mdxImportStyle` —
  it reuses both script settings, keyed on the source extension.
- **Angular-only smart identifiers.** `.ts`/`.tsx` sources route through the TS builder whose style-0 runs
  `generateAngularLegacyImportName` — but `.mdx` passes **no** `detectedImportName`, so `readExportedClassName` is
  never called (**no exported-class fill**). Hence `src/angular/` (suffix → PascalCase, no `export class`) and
  `src/classes/event-bus.ts` (the no-fill counter-case, which **must** contain `export class`).
- **The one `.mdx` ≠ `.tsx` divergence = the markdown-star Cursor quirk.** `isMarkdownDestination('.mdx')` is
  `true`, so a Cursor insertion on a leading-`*` line lands **AT** that line in `.mdx` (the `*` is Markdown
  content) but is pushed **ABOVE** it in the byte-identical `.tsx` buffer. Proven by the
  `destinations/leading-star.mdx` (native) + `destinations/leading-star.tsx` (cross) pair, which are
  **byte-identical** (§6.3.8, §10.1).
- **39 fixtures total:** `src/` (13) + `assets/` (14) + `destinations/` (12). Checklist↔workspace 1:1 with
  **zero orphans** (grep-verified against `mdx.md`).
- **Content rules.** Script bytes matter **only** for §5: `src/angular/*` must **NOT** contain `export class`,
  and `src/classes/event-bus.ts` **must** contain `export class EventBus`. All other `src/*` + every `assets/*`
  are irrelevant stubs (shape keys on the extension, not bytes). Conventions mirror `workspace/tsx/`.
- **12 `destinations/*` bodies are byte-verbatim from `mdx.md`** (§6 + §10). **They are NOT copied from tsx:**
  `.mdx` fixtures use Markdown `# Page` where `.tsx` used `export const Page = () => null;` (affected:
  `with-imports`, `multiline-comment`, `single-comment`, `mixed-imports`), and `string-with-import.mdx` uses
  `export const msg` (tsx: bare `const msg`). Only `leading-star.mdx` ≡ `leading-star.tsx` stay byte-identical.
  The `import { Header } from '../src/Header';` / `Footer` lines are **inert textual scan-bait** — so
  `Header.*`/`Footer.*` are **NOT** created.
- **5 empty 0-byte binaries:** `assets/{logo.png, manual.pdf, font.woff2, clip.mp4, theme.mp3}`. The 9 text
  assets get tiny realistic stubs (mirroring tsx).
- **`./` vs `../` is load-bearing.** §2 pastes src→src (`./Widget`); src→assets is `../assets/…`; §6 pastes
  destinations→src (`../src/…`). The flat sibling layout under `mdx/` makes every expected path resolve.
- **Phase C is alphabetical insertion** of the `mdx` row between `markdown` and `scss` into 4 sync docs; the 2
  `CLAUDE.md` mapping files (top-level + `workspace/`) are verify-only (illustrative 2-example mappings), per the
  css 5b / scss 6b / html 7b / markdown 8b / jsx 9b / tsx 10b precedent.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/mdx.md` exists on disk (handshake) — present, 707 lines (untracked; folded per plan)
- [x] Re-confirm the extracted fixture inventory (39 paths) + inline content specs — grep-verified 39 distinct paths
- [x] Create `qa.new/workspace/mdx/src/` — 13 fixtures: top-level `Page.mdx` (primary paste/drop target),
      `model.ts`, `Widget.tsx`, `helper.js`, `Card.jsx`; `components/Card.tsx` (nested, §7.3); `angular/` 6
      (`user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`, `user.service.ts`, `auth.module.ts` — all
      **no `export class`** — + `widget.component.js`); `classes/event-bus.ts` (**`export class EventBus`**)
- [x] Create `qa.new/workspace/mdx/assets/` — 14 fixtures: 5 binary 0-byte
      (`logo.png`, `manual.pdf`, `font.woff2`, `clip.mp4`, `theme.mp3`) + 9 text stubs
      (`page.mdx`, `Hero.vue`, `page.html`, `notes.md`, `data.json`, `config.yaml`,
      `styles.module.css`, `global.css`, `subs.vtt`)
- [x] Create `qa.new/workspace/mdx/destinations/` — 12 byte-exact targets: `empty.mdx` (0 B),
      `with-imports.mdx`, `with-require.mdx`, `commented-imports.mdx`, `comments-only.mdx`,
      `multiline-comment.mdx`, `comment-group.mdx`, `single-comment.mdx`, `leading-star.mdx`
      (JSDoc 2nd-line-`*`), `leading-star.tsx` (byte-identical to `leading-star.mdx`),
      `string-with-import.mdx`, `mixed-imports.mdx`
- [x] Verify the 12 `destinations/*` bodies match the `mdx.md` §6/§10 code blocks verbatim — line-counts + `cmp`
      checked; invariants (angular no `export class`, event-bus has it, `.mdx`≡`.tsx` leading-star) pass
- [x] Write `qa.new/workspace/mdx/README.md` (layout tree + fixture-to-checklist mapping + file-count table, Total 39)
- [x] Write `qa.new/workspace/mdx/CLAUDE.md` (sync rule + subdirectories + content expectations;
      note accept-all → no `rejected/`; Angular-only smartId → `angular/` + `classes/` exist)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `~89` + workspace-counterpart line) — mdx between markdown/scss
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row) — mdx between markdown/scss
- [x] Update `qa.new/README.md` (Layout tree — checklists + workspace blocks — + Current-inventory row) — 3 insertions, alphabetical
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed (css/scss/html/md/jsx/tsx precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 39)
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed
- [x] Validate: every path referenced in `mdx.md` exists in `workspace/mdx/` — expect 39 referenced, 39 present, 0 missing
- [x] Validate: no orphan fixtures in `workspace/mdx/` — expect 39 fixtures, 0 orphans
