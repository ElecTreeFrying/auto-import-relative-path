# Runbook — `.tsx` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/tsx.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/tsx.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/tsx.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present on disk (694 lines). NOTE: the session-10a
> commit `3a513eb` was dropped from `master` by a rebase, so `tsx.md` +
> `runbook-tsx-checklist.md` are present but untracked. Per the approved plan this
> session FOLDS 10a + 10b into one combined commit (the session-9 jsx precedent,
> `0c65290`, shipped Phases A–C in one commit). The on-disk `tsx.md` is the final
> checklist and the source of truth for fixture extraction.**

Drives **session 10b** (`generate-tsx-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/tsx/*` + the updated `qa.new/` inventory/sync docs. Committed together
with this runbook **and the untracked 10a artifacts** (`tsx.md` + `runbook-tsx-checklist.md`)
in one commit.

## Workspace notes (approved for `.tsx`)

`.tsx` is the **second React-family destination** (after `.jsx`) and the first to exercise
`_react.ts`'s **primary + fallback** dispatch: `tsx.ts` hands `buildReactImport` a TS
`primarySnippet` for `.ts`/`.tsx` sources **and** a JS `fallbackSnippet` for `.js`/`.jsx` sources.
Phase B is mechanical: `tsx.md` already inlines the exact content for every fixture, so this is
faithful transcription, not design. The checklist drives the workspace 1:1.

- **Accept-all → `assets/`, not `rejected/`.** `.tsx ∈ CROSS_IMPORT_DESTINATIONS`, so **every**
  source is accepted. Unlike `javascript/` (allow-list → `rejected/`), the tree is
  **`src/` + `assets/` + `destinations/`** — no `rejected/` dir.
- **Two-script-arm + asset model.** `.ts`/`.tsx` source → 7 configurable `typescriptImportStyle`
  styles (**primary**); `.js`/`.jsx` source → 7 `javascriptImportStyle` styles (**fallback**);
  non-script asset → one of 4 fixed shapes (`${1:styles}` / `${1:name}` / `${1:url}` /
  side-effect). **Every gated-in source renders a non-empty snippet → there is NO empty-snippet
  case and NO raw-text-fallback drop** (the central `.tsx` ≠ `.jsx` difference). `.tsx` has **no**
  `tsxImportStyle` — it reuses both script settings, keyed on the source extension.
- **Angular-only smart identifiers (the jsx contrast).** `.ts`/`.tsx` sources route through the TS
  builder whose style-0 runs `generateAngularLegacyImportName` — but `.tsx` passes **no**
  `detectedImportName`, so `readExportedClassName` is never called (**no exported-class fill**).
  This is why `.tsx` adds two subtrees jsx lacked: `src/angular/` (suffix → PascalCase) and
  `src/classes/event-bus.ts` (the no-fill counter-case, which **must** contain `export class`).
- **39 fixtures total:** `src/` (13) + `assets/` (14) + `destinations/` (12). Checklist↔workspace
  1:1 with **zero orphans** (grep-verified against `tsx.md`).
- **Content rules.** Script bytes matter **only** for §5: `src/angular/*` must **NOT** contain
  `export class` (they test the Angular-suffix path), and `src/classes/event-bus.ts` **must**
  contain `export class EventBus` (the no-fill proof). All other `src/*` + every `assets/*` are
  irrelevant stubs (shape keys on the extension, not bytes). Content mirrors the
  `workspace/typescript/src/angular|classes/` precedent.
- **12 `destinations/*` bodies are byte-verbatim from `tsx.md`** (§6 + §10 code blocks), incl.
  `leading-star.mdx` which is **byte-identical** to `leading-star.tsx` (the `.mdx`≠`.tsx` proof).
  The `import { Header } from '../src/Header';` / `Footer` lines are **inert textual scan-bait** —
  so `Header.tsx`/`Footer.tsx` are **NOT** created.
- **5 empty 0-byte binaries:** `assets/{logo.png, manual.pdf, font.woff2, clip.mp4, theme.mp3}`.
  The 9 text assets get tiny realistic stubs.
- **`./` vs `../` is load-bearing.** §2 pastes src→src (`./Widget`); src→assets is `../assets/…`;
  §6 pastes destinations→src (`../src/…`). The flat sibling layout under `tsx/` makes every
  expected path resolve.
- **Phase C is alphabetical insertion** of the `tsx` row between `scss` and `typescript` into
  4 sync docs; the 2 `CLAUDE.md` mapping files (top-level + `workspace/`) are verify-only
  (illustrative 2-example mappings), per the css 5b / scss 6b / html 7b / markdown 8b / jsx 9b
  precedent.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/tsx.md` exists on disk (handshake) — present, 694 lines (untracked; folded per plan)
- [x] Re-confirm the extracted fixture inventory (39 paths) + inline content specs — grep-verified 39 distinct paths
- [x] Create `qa.new/workspace/tsx/src/` — 13 fixtures: top-level `Panel.tsx` (primary paste/drop
      target), `model.ts`, `Widget.tsx`, `helper.js`, `Card.jsx`; `components/Card.tsx` (nested,
      §7.3); `angular/` 6 (`user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`,
      `user.service.ts`, `auth.module.ts` — all **no `export class`** — + `widget.component.js`);
      `classes/event-bus.ts` (**`export class EventBus`**)
- [x] Create `qa.new/workspace/tsx/assets/` — 14 fixtures: 5 binary 0-byte
      (`logo.png`, `manual.pdf`, `font.woff2`, `clip.mp4`, `theme.mp3`) + 9 text stubs
      (`page.mdx`, `Hero.vue`, `page.html`, `notes.md`, `data.json`, `config.yaml`,
      `styles.module.css`, `global.css`, `subs.vtt`)
- [x] Create `qa.new/workspace/tsx/destinations/` — 12 byte-exact targets: `empty.tsx` (0 B),
      `with-imports.tsx`, `with-require.tsx`, `commented-imports.tsx`, `comments-only.tsx`,
      `multiline-comment.tsx`, `comment-group.tsx`, `single-comment.tsx`, `leading-star.tsx`
      (JSDoc 2nd-line-`*`), `leading-star.mdx` (byte-identical to `leading-star.tsx`),
      `string-with-import.tsx`, `mixed-imports.tsx`
- [x] Verify the 12 `destinations/*` bodies match the `tsx.md` §6/§10 code blocks verbatim — line-counts + `cmp` checked; invariants (angular no `export class`, event-bus has it, `.mdx`≡`.tsx`) pass
- [x] Write `qa.new/workspace/tsx/README.md` (layout tree + fixture-to-checklist mapping +
      file-count table, Total 39)
- [x] Write `qa.new/workspace/tsx/CLAUDE.md` (sync rule + subdirectories + content expectations;
      note accept-all → no `rejected/`; Angular-only smartId → `angular/` + `classes/` exist)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `~89` + workspace-counterpart line) — tsx between scss/typescript
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row) — tsx between scss/typescript
- [x] Update `qa.new/README.md` (Layout tree — checklists + workspace blocks — + Current-inventory row) — 3 insertions, alphabetical
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed (CSS/SCSS/HTML/MD/jsx precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 39)
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed
- [x] Validate: every path referenced in `tsx.md` exists in `workspace/tsx/` — 39 referenced, 39 present, 0 missing
- [x] Validate: no orphan fixtures in `workspace/tsx/` — 39 fixtures, 0 orphans
