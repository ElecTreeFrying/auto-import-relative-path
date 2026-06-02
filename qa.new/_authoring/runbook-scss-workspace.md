# Runbook — `.scss` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/scss.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/scss.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/scss.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present (session 6a output, 27,538 bytes).**

Drives **session 6b** (`generate-scss-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/scss/*` + the updated `qa.new/` inventory/sync docs. Committed
together with this runbook in one commit.

## Workspace notes (approved for `.scss`)

`.scss` is a **stylesheet** destination and **source-type-dispatched** (stylesheet → `@use`,
image → inline `url()`), `smartId: none`. Unlike the `.css` workspace
(`root + vendor/ + placement/ + rejects/`), the `.scss` workspace follows `scss.md`'s **own**
prerequisites table — a `src/`-based tree — because the checklist drives the workspace 1:1.

- **`src/`-based layout.** `src/` holds the primary sources + the `main.scss` paste target;
  `src/abstracts/` and `src/_partials/` exercise partial-`_` normalization (last-segment strip,
  directory `_` preserved); `src/images/` holds the inline-`url()` image sources; `destinations/`
  holds the placement targets; `rejected/` holds the gating stubs.
- **Two source branches.** Stylesheet (`theme.scss`, `reset.css`, `abstracts/_variables.scss`,
  `_partials/_colors.scss`) → `@use './…';`; image (`images/logo.png`, `icon.svg`, `_icon.png`)
  → inline `url('./…')`. Both exercised.
- **One-way `.css → .scss` accept.** `reset.css` is a valid SCSS source (`@use './reset.css';`,
  extension always kept) — the reverse reject lives in `css.md`, not here.
- **33 fixtures total:** `src/` (3) + `src/abstracts/` (1) + `src/_partials/` (1) +
  `src/images/` (3) + `destinations/` (8) + `rejected/` (17). Checklist↔workspace 1:1 with
  **zero orphans**.
- **All content-bearing fixture bodies are verbatim from `scss.md`** — Phase A (session 6a)
  already inlined them. `main.scss` is the one fixture the checklist leaves unspecified (the
  tester types their own value position in §2.2); authored as a single self-documenting comment
  line (placement-neutral).
- **Empty 0-byte placeholders:** the 3 image sources + the 17 `rejected/` stubs +
  `destinations/empty.scss` (gating/snippets key on the extension or the empty-file state, not
  bytes).

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/scss.md` exists on disk (handshake)
- [x] Re-read it; confirm the extracted fixture inventory (33 paths) + inline content specs
- [x] Create `qa.new/workspace/scss/src/` — `theme.scss` (`$primary: #3366ff; body { color: $primary; }`),
      `reset.css` (`*, *::before, *::after { box-sizing: border-box; }`), `main.scss` (one comment line)
- [x] Create `qa.new/workspace/scss/src/abstracts/_variables.scss` (`$spacing: 8px;`)
- [x] Create `qa.new/workspace/scss/src/_partials/_colors.scss` (`$danger: #cc0000;`)
- [x] Create `qa.new/workspace/scss/src/images/` — 3 empty image sources: `logo.png`, `icon.svg`, `_icon.png`
- [x] Create `qa.new/workspace/scss/destinations/` — 8 placement targets with the exact content
      `scss.md` specifies: `empty.scss` (empty), `with-imports.scss`, `commented-imports.scss`,
      `comments-only.scss`, `multiline-comment.scss`, `single-comment.scss`, `comment-group.scss`,
      `commented-only.scss`
- [x] Create `qa.new/workspace/scss/rejected/` — 17 empty stubs: `widget.ts`, `sibling.js`,
      `badge.jsx`, `panel.tsx`, `page.mdx`, `App.vue`, `App.svelte`, `App.astro`, `index.html`,
      `notes.md`, `clip.mp4`, `track.mp3`, `subs.vtt`, `data.json`, `config.yaml`, `font.woff2`, `doc.pdf`
- [x] Write `qa.new/workspace/scss/README.md` (layout tree + fixture-to-checklist mapping +
      file-count table, Total 33)
- [x] Write `qa.new/workspace/scss/CLAUDE.md` (sync rule + subdirectories + content expectations)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `~65` + workspace-counterpart line)
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row)
- [x] Update `qa.new/README.md` (Layout tree + Current-inventory row)
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping; no edit needed (per the CSS 5b precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 33)
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping; no edit needed
- [x] Validate: every path referenced in `scss.md` exists in `workspace/scss/` — 33 referenced, 33 present, 0 missing
- [x] Validate: no orphan fixtures in `workspace/scss/` — 33 fixtures, 0 orphans
