# Runbook — `.css` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/css.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/css.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/css.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present (session 5a output).**

Drives **session 5b** (`generate-css-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/css/*` + the updated `qa.new/` inventory/sync docs. Committed
together with this runbook in one commit.

## Workspace notes (approved for `.css`)

`.css` is the first **stylesheet** destination and the first **source-type-dispatched**
destination, and it is `smartId: none`. The workspace follows `css.md`'s **own** fixture
tree (root + `vendor/` + `placement/` + `rejects/`) — not the `.js`/`.ts`
`src/`+`destinations/`+`rejected/` shape — because the checklist drives the workspace 1:1.

- **Two source branches.** A stylesheet source (`theme.css`, `vendor/normalize.css`,
  `placement/widget.css`) → `@import './…';`; an image source (`logo.png`) → inline
  `url('./logo.png')`. Both are exercised by the fixtures.
- **No smart-ID subtrees.** No `src/classes/` or `src/angular/` — `.css` has no
  exported-class detection or Angular PascalCase, and every snippet is a literal string
  with no tab stop. (`general.md`-owned edge cases are not duplicated here either.)
- **20 fixtures total:** root (3) + `vendor/` (1) + `placement/` (4) + `rejects/` (12).
  Checklist↔workspace 1:1 with **zero orphans**.
- **All fixture content is verbatim from `css.md`** — Phase A (session 5a) already inlined it.
- **`logo.png` is an empty 0-byte placeholder** (repo convention for binary fixtures;
  `.css` keys on the `.png` extension, not bytes). The `rejects/*` files are 12 empty
  stubs (gating keys on the extension); `rejects/styles.scss` is the **mandatory** one-way
  `.scss → .css` reject.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/css.md` exists on disk (handshake)
- [x] Re-read it; confirm the extracted fixture inventory (20 paths) + inline content specs
- [x] Create `qa.new/workspace/css/` root — `app.css` (`.hero` rule with the empty
      `background-image: ;` slot), `theme.css` (`:root { --brand: #4f46e5; }`), and
      `logo.png` (empty 0-byte placeholder)
- [x] Create `qa.new/workspace/css/vendor/normalize.css` (`html { line-height: 1.15; }`)
- [x] Create `qa.new/workspace/css/placement/` — 4 fixtures with the exact content `css.md`
      specifies: `with-imports.css` (one quoted `@import` + one `@import url()` + blank line
      + `body` rule), `with-comment-block.css` (multi-line `/* */` block + `.button` rule),
      `widget.css` (`.widget { display: grid; }`), `with-use.css` (`@use './tokens.css';` +
      `.card` rule)
- [x] Create `qa.new/workspace/css/rejects/` — 12 empty stubs: `styles.scss`, `util.ts`,
      `widget.vue`, `page.html`, `notes.md`, `data.json`, `config.yaml`, `clip.mp4`,
      `chime.mp3`, `captions.vtt`, `body.woff2`, `manual.pdf`
- [x] Write `qa.new/workspace/css/README.md` (layout tree + fixture-to-checklist mapping +
      file-count table, Total 20)
- [x] Write `qa.new/workspace/css/CLAUDE.md` (sync rule + subdirectories + content expectations)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (inventory row `30` + workspace-counterpart line)
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row)
- [x] Update `qa.new/README.md` (Layout tree + Current-inventory row)
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping; no edit needed (per the JS
      4b precedent). Top-level-mapping task satisfied by verification.
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 20)
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping; no edit needed.
- [x] Validate: every path referenced in `css.md` exists in `workspace/css/`
      — 20 referenced, 20 present, 0 missing
- [x] Validate: no orphan fixtures in `workspace/css/` — 20 fixtures, 0 orphans
