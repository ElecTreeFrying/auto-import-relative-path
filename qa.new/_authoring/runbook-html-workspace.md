# Runbook — `.html` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/html.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/html.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/html.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present on disk (session 7a output, 26,945 bytes).**

Drives **session 7b** (`generate-html-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/html/*` + the updated `qa.new/` inventory/sync docs. Committed
together with this runbook in one commit.

## Workspace notes (approved for `.html`)

`.html` is the most complex destination on the **styles** axis — a **6-way source-type
dispatch** — and the **first `forced-cursor` placement** destination. But Phase B is
mechanical: `html.md` already inlines the exact content for every fixture, so this is
faithful transcription, not design. The checklist drives the workspace 1:1.

- **`html.md`'s own `## Fixtures` layout.** Unlike the `.css` workspace
  (`root + vendor/ + placement/ + rejects/`) or the `.scss` workspace
  (`src/ + destinations/ + rejected/`), `.html` uses a **root `index.html` + `src/` +
  `destinations/` + `rejected/`** tree — because the checklist's prerequisites table
  dictates it. `index.html` sits at the root (the primary paste/drop/picker/set-default/DnD
  target); the six import **sources** live under `src/{scripts,images,media,styles}/`; the
  three placement **targets** under `destinations/`; the eight gating **stubs** under
  `rejected/`.
- **Six source-type branches, all exercised.** script (`src/scripts/app.js`, `.js`) →
  `<script>`; image (`src/images/logo.png`) → `<img>`; video (`src/media/intro.mp4`) →
  `<video>`; audio (`src/media/theme.mp3`) → `<audio>`; stylesheet (`src/styles/theme.css`,
  `.css`) → fixed `<link>`; text-track (`src/media/captions.vtt`, `.vtt`) → fixed `<track>`.
- **`./` vs `../` is load-bearing.** §2 inserts `./src/scripts/app.js` (paste into root
  `index.html`); §6/§9 insert `../src/scripts/app.js` (paste into `destinations/*.html`, one
  level deeper). The nesting must match exactly or a documented expected-result breaks.
- **18 fixtures total:** root (1) + `src/` (6) + `destinations/` (3) + `rejected/` (8).
  Checklist↔workspace 1:1 with **zero orphans**.
- **13 content-bearing fixture bodies are verbatim from `html.md`** — Phase A (session 7a)
  already inlined them: `index.html`, `src/scripts/app.js`, `src/styles/theme.css`,
  `src/media/captions.vtt`, `destinations/{blank,indented,with-comments}.html`, and the six
  text `rejected/*` stubs (`widget.ts`, `App.vue`, `theme.scss`, `notes.md`, `data.json`,
  `page.html`).
- **5 empty 0-byte placeholders:** the 3 binary image/media sources (`src/images/logo.png`,
  `src/media/intro.mp4`, `src/media/theme.mp3`) + the 2 binary rejects
  (`rejected/font.woff2`, `rejected/doc.pdf`) — gating and the snippet shape key on the
  **extension** alone, not bytes.
- **`destinations/indented.html` is precision-critical** — line 2 must be **exactly six
  spaces** (the §6 column-6 / §9 c-ii tests depend on it). Author deliberately and verify
  with `cat -A`. The empty paste-target lines in `index.html`/`blank.html` must be kept
  verbatim too.
- **Phase C is alphabetical insertion** of the `html` row between `css` and `javascript`
  into 4 sync docs; the 2 top-level `CLAUDE.md`s are verify-only (illustrative 2-example
  mappings), per the css 5b / scss 6b precedent.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/html.md` exists on disk (handshake)
- [x] Re-read it; confirm the extracted fixture inventory (18 paths) + inline content specs
- [x] Create `qa.new/workspace/html/index.html` (full doc; `<!-- paste / drop on the empty
      line below -->` + empty target line inside `<body>`)
- [x] Create `qa.new/workspace/html/src/scripts/app.js` (`export function init() { … }`)
- [x] Create `qa.new/workspace/html/src/styles/theme.css` (`:root { --brand: #0077aa; }`)
- [x] Create `qa.new/workspace/html/src/media/captions.vtt` (`WEBVTT` cue block)
- [x] Create `qa.new/workspace/html/src/images/logo.png`, `src/media/intro.mp4`,
      `src/media/theme.mp3` — 3 empty 0-byte binary sources
- [x] Create `qa.new/workspace/html/destinations/` — 3 placement targets:
      `blank.html` (DOCTYPE + `<body>` + one empty line), `indented.html`
      (`<body>` / six-space line 2 / `</body>`), `with-comments.html`
      (`<!-- section marker -->` + embedded `<script>` with `//` run)
- [x] Create `qa.new/workspace/html/rejected/` — 8 stubs: `widget.ts`
      (`export const widget = {};`), `App.vue` (`<template><div /></template>`),
      `theme.scss` (`$brand: #0077aa;`), `notes.md` (`# Notes`), `data.json`
      (`{ "ok": true }`), `page.html` (`<!DOCTYPE html><html></html>`),
      `font.woff2` + `doc.pdf` (empty 0-byte binaries)
- [x] Verify `destinations/indented.html` line 2 is exactly six spaces (BSD `cat -e` + `awk` length=6)
- [x] Write `qa.new/workspace/html/README.md` (layout tree + fixture-to-checklist mapping +
      file-count table, Total 18)
- [x] Write `qa.new/workspace/html/CLAUDE.md` (sync rule + subdirectories + content
      expectations)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `75` + workspace-counterpart line)
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row)
- [x] Update `qa.new/README.md` (Layout tree — checklists + workspace blocks — + Current-inventory row)
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping; no edit needed (per the CSS/SCSS precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 18)
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping; no edit needed
- [x] Validate: every path referenced in `html.md` exists in `workspace/html/` — 18 referenced, 18 present, 0 missing
- [x] Validate: no orphan fixtures in `workspace/html/` — 18 fixtures, 0 orphans
