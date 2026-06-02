# Runbook — `.md` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/markdown.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/markdown.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/markdown.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present on disk and committed (session 8a output,
> 24,845 bytes, commit `c0f39fd`).**

Drives **session 8b** (`generate-markdown-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/markdown/*` + the updated `qa.new/` inventory/sync docs. Committed
together with this runbook in one commit.

## Workspace notes (approved for `.md`)

`.md` is the **simpler 2-type cousin of `.html`** on the styles axis — a **2-way
source-type dispatch** — and a **`forced-cursor` placement** destination. Phase B is
mechanical: `markdown.md` already inlines the exact content for every fixture, so this is
faithful transcription, not design. The checklist drives the workspace 1:1.

- **Two source-type branches.** markdown source (`src/docs/intro.md`, `.md`) → a **fixed**
  `[${1:text}](…)` link (hardcoded; reads no style setting). image source
  (`src/images/logo.png`, `.png`) → 3 configurable `markdownImageImportStyle` styles.
  `.md` accepts its **own** extension — there is **no `.md`→`.md` rejection** (the
  counter-case to `.html`).
- **`markdown.md`'s own `## Fixtures` layout.** Same shape as the `.html` workspace —
  **root `notes.md` + `src/` + `destinations/` + `rejected/`** — because the checklist
  dictates it. `notes.md` sits at the root (primary paste/Alt+D/picker/set-default/drop
  target); the two import **sources** live under `src/{docs,images}/`; the four placement
  **targets** under `destinations/`; the ten gating **stubs** under `rejected/`.
- **`./` vs `../` is load-bearing.** §2 inserts `./src/images/logo.png` (paste into root
  `notes.md`); §6/§9 insert `../src/images/logo.png` (paste into `destinations/*.md`, one
  level deeper). The nesting must match exactly or a documented expected-result breaks.
- **The `.tsx` contrast is the point, not a mistake.** `destinations/with-comments.tsx` is
  **byte-identical** to `with-comments.md` (same markdown-looking text, `.tsx` extension).
  It proves the `isMarkdown` flag flips leading-`*` classification (§10): `.md` treats `*`
  as content (import lands AT the line); `.tsx` treats it as a comment continuation (import
  pushed above). **Do not "fix" the `.tsx` to be valid TSX** — that would destroy the test.
- **17 fixtures total:** root (1) + `src/` (2) + `destinations/` (4) + `rejected/` (10).
  Checklist↔workspace 1:1 with **zero orphans**.
- **12 content-bearing fixture bodies are verbatim from `markdown.md`** — Phase A
  (session 8a) already inlined them: `notes.md`, `src/docs/intro.md`,
  `destinations/{blank,indented,with-comments}.md`, `destinations/with-comments.tsx`, and
  the six text `rejected/*` stubs (`widget.ts`, `App.vue`, `theme.css`, `page.html`,
  `captions.vtt`, `data.json`).
- **5 empty 0-byte placeholders:** the image source (`src/images/logo.png`) + the 4 binary
  rejects (`rejected/intro.mp4`, `rejected/theme.mp3`, `rejected/font.woff2`,
  `rejected/doc.pdf`) — gating and the snippet shape key on the **extension** alone, not
  bytes (per `workspace/CLAUDE.md`).
- **`destinations/indented.md` is precision-critical** — line 2 must be **exactly six
  spaces** (the §6 column-6 / §9 c-ii tests depend on it). Author deliberately and verify
  with `cat -e` + `awk`. The empty paste-target line in `notes.md` must be kept verbatim too.
- **Phase C is alphabetical insertion** of the `markdown` row between `javascript` and
  `scss` into 4 sync docs; the 2 top-level `CLAUDE.md`s are verify-only (illustrative
  2-example mappings), per the css 5b / scss 6b / html 7b precedent.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/markdown.md` exists on disk (handshake) — committed `c0f39fd`
- [x] Re-read it; confirm the extracted fixture inventory (17 paths) + inline content specs
- [x] Create `qa.new/workspace/markdown/notes.md` (`# Notes` + `<!-- paste / drop on the
      empty line below -->` + empty target line) — 56 B
- [x] Create `qa.new/workspace/markdown/src/docs/intro.md` (`# Intro` / `Sample Markdown source.`) — 33 B
- [x] Create `qa.new/workspace/markdown/src/images/logo.png` — empty 0-byte image source
- [x] Create `qa.new/workspace/markdown/destinations/` — 4 targets: `blank.md`
      (`# Blank doc` / empty line 2 / `Body text.`), `indented.md` (`# Indented` /
      six-space line 2 / `End.`), `with-comments.md` (`*` bullet run + `//` run + `/*` run),
      `with-comments.tsx` (byte-identical to `with-comments.md`)
- [x] Create `qa.new/workspace/markdown/rejected/` — 10 stubs: `widget.ts`
      (`export const widget = {};`), `App.vue` (`<template><div /></template>`), `theme.css`
      (`:root { --brand: #0077aa; }`), `page.html` (`<!DOCTYPE html><html></html>`),
      `captions.vtt` (`WEBVTT`), `data.json` (`{ "ok": true }`), and `intro.mp4`,
      `theme.mp3`, `font.woff2`, `doc.pdf` (empty 0-byte binaries)
- [x] Verify `destinations/indented.md` line 2 is exactly six spaces (BSD `cat -e` + `awk` length=6) — confirmed `      $`, length 6
- [x] Write `qa.new/workspace/markdown/README.md` (layout tree + fixture-to-checklist
      mapping + file-count table, Total 17)
- [x] Write `qa.new/workspace/markdown/CLAUDE.md` (sync rule + subdirectories + content
      expectations)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `44` + workspace-counterpart line)
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row)
- [x] Update `qa.new/README.md` (Layout tree — checklists + workspace blocks — + Current-inventory row)
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping; no edit needed (per the CSS/SCSS/HTML precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 17)
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping; no edit needed
- [x] Validate: every path referenced in `markdown.md` exists in `workspace/markdown/` — 17 referenced, 17 present, 0 missing
- [x] Validate: no orphan fixtures in `workspace/markdown/` — 17 fixtures, 0 orphans
