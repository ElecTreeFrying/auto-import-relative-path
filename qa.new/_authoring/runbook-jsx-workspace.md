# Runbook — `.jsx` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/jsx.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/jsx.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/jsx.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present on disk and committed (session 9a output,
> 554 lines, committed this session as the retroactive Phase-A commit `089a8e7`
> — it had been generated but left uncommitted; see commit body).**

Drives **session 9b** (`generate-jsx-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/jsx/*` + the updated `qa.new/` inventory/sync docs. Committed together
with this runbook in one commit.

## Workspace notes (approved for `.jsx`)

`.jsx` is the **first cross-import script destination** (`.jsx ∈ CROSS_IMPORT_DESTINATIONS` →
**accept-all**) — it dispatches the import shape on the **source extension** (`_react.ts`). Phase B
is mechanical: `jsx.md` already inlines the exact content for every fixture, so this is faithful
transcription, not design. The checklist drives the workspace 1:1.

- **Accept-all → `assets/`, not `rejected/`.** Unlike the `javascript/` sibling (`.js` is
  allow-list, so non-script sources go in `rejected/`), **every** non-script source is *accepted*
  by `.jsx` with a fixed shape. So jsx's tree is **`src/` + `assets/` + `destinations/`** — there
  is **no `rejected/` dir**. jsx is the first of the three cross-import script destinations
  (jsx → tsx → mdx); this layout is the template the next two follow.
- **Two-arm style model via source-extension dispatch.** A `.js`/`.jsx` source → 7 configurable
  `javascriptImportStyle` styles (always bare `$1`, no smart-id). A non-script asset → one of 4
  fixed shapes (`${1:styles}` / `${1:name}` / `${1:url}` / side-effect). A `.ts`/`.tsx` source →
  **empty snippet** (`not-supported` toast). `.jsx` has **no** `jsxImportStyle` — it reuses
  `javascriptImportStyle`.
- **30 fixtures total:** `src/` (6) + `assets/` (13) + `destinations/` (11). Checklist↔workspace
  1:1 with **zero orphans** (grep-verified against `jsx.md`: 30 distinct referenced paths).
- **`src/` + `assets/` content is irrelevant** — `.jsx` has no smart-identifier detection (script
  imports are always a bare `$1`) and the asset shape keys on the **extension**, not bytes (per
  `workspace/CLAUDE.md`). Script stubs are minimal valid modules; `.ts`/`.tsx` stubs feed the
  empty-snippet case.
- **11 `destinations/*.jsx` bodies are byte-verbatim from `jsx.md`** (§6 + §10 code blocks). The
  `import { Header } from '../src/Header';` / `Footer` lines are **inert textual scan-bait** — the
  Bottom scan is textual, so `Header.jsx`/`Footer.jsx` are **NOT** created.
- **5 empty 0-byte binaries:** `assets/{logo.png, manual.pdf, font.woff2, clip.mp4, theme.mp3}`.
  The 8 text assets get tiny realistic stubs (markdown 8b precedent).
- **`./` vs `../` is load-bearing.** §2 pastes src→src (`./App`); src→assets is `../assets/…`;
  §6 pastes destinations→src (`../src/…`). The flat sibling layout under `jsx/` makes every
  expected path resolve.
- **Phase C is alphabetical insertion** of the `jsx` row between `javascript` and `markdown` into
  4 sync docs; the 2 `CLAUDE.md` mapping files (top-level + `workspace/`) are verify-only
  (illustrative 2-example mappings), per the css 5b / scss 6b / html 7b / markdown 8b precedent.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/jsx.md` exists on disk (handshake) — committed `089a8e7`
- [x] Re-confirm the extracted fixture inventory (30 paths) + inline content specs — grep-verified 30 distinct paths
- [x] Create `qa.new/workspace/jsx/src/` — 6 stubs: `App.jsx`, `Panel.jsx` (primary paste/drop
      target), `helper.js`, `components/Card.jsx` (nested), `model.ts`, `Widget.tsx` (the two
      `.ts`/`.tsx` empty-snippet sources)
- [x] Create `qa.new/workspace/jsx/assets/` — 13 fixtures: 5 binary 0-byte
      (`logo.png`, `manual.pdf`, `font.woff2`, `clip.mp4`, `theme.mp3`) + 8 text stubs
      (`Hero.vue`, `page.html`, `notes.md`, `data.json`, `config.yaml`, `styles.module.css`,
      `global.css`, `subs.vtt`)
- [x] Create `qa.new/workspace/jsx/destinations/` — 11 byte-exact targets: `empty.jsx` (0 B),
      `with-imports.jsx`, `with-require.jsx`, `commented-imports.jsx`, `comments-only.jsx`,
      `multiline-comment.jsx`, `comment-group.jsx`, `single-comment.jsx`, `leading-star.jsx`
      (JSDoc 2nd-line-`*`), `string-with-import.jsx`, `mixed-imports.jsx`
- [x] Verify the 11 `destinations/*.jsx` bodies match the `jsx.md` §6/§10 code blocks verbatim — confirmed via `cat -vet`
- [x] Write `qa.new/workspace/jsx/README.md` (layout tree + fixture-to-checklist mapping +
      file-count table, Total 30)
- [x] Write `qa.new/workspace/jsx/CLAUDE.md` (sync rule + subdirectories + content expectations;
      note accept-all → no `rejected/`)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `~70` + workspace-counterpart line)
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row)
- [x] Update `qa.new/README.md` (Layout tree — checklists + workspace blocks — + Current-inventory row)
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping; no edit needed (CSS/SCSS/HTML/MD precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 30)
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping; no edit needed
- [x] Validate: every path referenced in `jsx.md` exists in `workspace/jsx/` — 30 referenced, 30 present, 0 missing
- [x] Validate: no orphan fixtures in `workspace/jsx/` — 30 fixtures, 0 orphans
