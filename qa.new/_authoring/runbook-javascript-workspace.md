# Runbook — `.js` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/javascript.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/javascript.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/javascript.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present (session 4a output).**

Drives **session 4b** (`generate-javascript-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/javascript/*` + the updated `qa.new/` inventory/sync docs. Committed
together with this runbook in one commit.

## Workspace notes (approved for `.js`)

`.js` is `smartId: none`, so the workspace is the `typescript/` shape **minus** the
smart-ID subtrees and the `general.md`-owned extras:

- **No `src/classes/` or `src/angular/`** — no exported-class detection, no Angular
  PascalCase. `src/` holds only `foo.js` (plain source) + `bar.js` (paste destination).
- **No `edge-cases/`, no root `Makefile`** — unicode/space filenames and the no-extension
  case are owned by `general.md`; `javascript.md` references neither, so they are not
  duplicated here. The result is checklist↔workspace 1:1 with **zero orphans**.
- **34 fixtures total:** `src/` (2) + `destinations/` (12) + `rejected/` (20).
- **All fixture content is verbatim from `javascript.md`** — Phase A already inlined it.
- **`large-file.js` mirrors `typescript/destinations/large-file.ts`**: 3 imports
  (`foo`, `bar`, `helpers`) + a blank line + `export const lineN = N;` through line 520.
  The `../src/helpers` import is **inert scan-bait** (the Bottom scan is textual; placement
  fixtures' import lines need not resolve, and `.js` has no `helpers.js`).

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/javascript.md` exists on disk (handshake)
- [x] Re-read it; confirm the extracted fixture inventory (34 paths) + inline content specs
- [x] Create `qa.new/workspace/javascript/src/` — `foo.js` (`export const foo = 'foo';`) and
      `bar.js` (`export const bar = 'bar';`)
- [x] Create `qa.new/workspace/javascript/destinations/` — 12 placement fixtures with the
      exact content `javascript.md` specifies: `empty.js` (0 bytes), `whitespace-only.js`,
      `with-imports.js`, `with-require.js`, `commented-imports.js`, `comments-only.js`,
      `multiline-comment.js`, `comment-group.js`, `single-comment.js`, `string-with-import.js`,
      `mixed-imports.js`, `large-file.js` (520 lines)
- [x] Create `qa.new/workspace/javascript/rejected/` — 20 empty stubs: `helper.ts`,
      `widget.tsx`, `badge.jsx`, `page.mdx`, `global.css`, `main.scss`, `index.html`,
      `notes.md`, `logo.png`, `icon.svg`, `config.json`, `config.yaml`, `font.woff2`,
      `video.mp4`, `audio.mp3`, `subs.vtt`, `doc.pdf`, `App.vue`, `App.svelte`, `App.astro`
- [x] Write `qa.new/workspace/javascript/README.md` (layout tree + fixture-to-checklist
      mapping + file-count table, Total 34)
- [x] Write `qa.new/workspace/javascript/CLAUDE.md` (sync rule + subdirectories + content
      expectations)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (inventory row `~65` + workspace-counterpart line)
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row)
- [x] Update `qa.new/README.md` (Layout tree + Current-inventory row)
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping; no edit needed (per the TS
      migration precedent). Top-level-mapping task satisfied by verification.
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 34)
- [x] Validate: every path referenced in `javascript.md` exists in `workspace/javascript/`
      — 34 referenced, 34 present, 0 missing
- [x] Validate: no orphan fixtures in `workspace/javascript/` — 34 fixtures, 0 orphans
