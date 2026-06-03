# Runbook — `.vue` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/vue.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/vue.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/vue.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present on disk (675 lines, ~80 cases) AND committed: the
> session-12a artifacts (`vue.md` + `runbook-vue-checklist.md`) landed in commit `158a634`.
> (They were briefly untracked at the very start of this session; the 12a commit was made
> separately before the workspace session proceeded — the SPLIT path, not a fold.) This
> session therefore commits ONLY the Phase B + C deliverables (`workspace/vue/*` + the
> propagated sync docs + this runbook), per the §11 split-session model. The on-disk
> `vue.md` is the source of truth for fixture extraction.**

Drives **session 12b** (`generate-vue-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/vue/*` + the updated `qa.new/` inventory/sync docs, committed together
with this runbook in one commit (the session-12a checklist already landed separately in
`158a634`, so this session does **not** fold — it ships Phase B + C only).

## Workspace notes (approved for `.vue`)

`.vue` is the **first framework-trio destination** — `.vue`/`.svelte`/`.astro` share one builder,
`src/snippets/languages/framework-component.ts`. Phase B is mechanical: `vue.md` already inlines the
exact content for every fixture, so this is faithful transcription, not design. The checklist drives
the workspace 1:1.

- **Allow-list, but rejects live in `assets/` — NO `rejected/` dir.** `.vue` is allow-list
  (`VUE_SUPPORTED_EXTENSIONS`), like `javascript/`/`css/`/`scss/`/`html/`/`markdown/` — but the 12a
  checklist **co-locates** the 9 gated-out reject fixtures inside `vue/assets/` (e.g.
  `vue/assets/global.css`) rather than a separate `rejected/` subtree. Honor the checklist 1:1: the tree
  is **`src/` + `assets/` + `destinations/`**, and `assets/` holds **both** accepted and gated-out fixtures.
- **One script table, two arms.** All **four** script exts (`.ts`/`.tsx`/`.js`/`.jsx`) → the **7
  TypeScript** styles (`typescriptImportStyle`); a non-script source → one **fixed asset shape**.
  `.js`/`.jsx` route to the **TypeScript** builder (the headline divergence from `.tsx`/`.mdx`, where
  they take the JS fallback) → there is **no JS-fallback arm and no empty-snippet case**. `.vue` has
  **no** `vueImportStyle` — it reuses `typescriptImportStyle`.
- **Angular-only smart identifiers**, firing for **all four** script exts (incl. `.js` — §5.8). The
  builder is called **one-arg** (no `detectedImportName`) → `readExportedClassName` is **never** called
  → **no exported-class fill**. Hence `src/angular/*` must contain **NO `export class`** (suffix →
  PascalCase from the filename), and `src/classes/event-bus.ts` **MUST** contain `export class EventBus`
  (the no-fill counter-case, §5.7).
- **`.vue` → `.vue` self-import is a named ASSET import** (§10.3): a `.vue` source is **not** in the
  builder's `SCRIPT_SOURCE_EXTENSIONS`, so it falls through to `buildAssetImportStatement` →
  `assets/BaseButton.vue` exists for this quirk.
- **39 fixtures total:** `src/` (14, incl. `angular/` 7 + `classes/` 1 + `components/` 1 + primary
  `App.vue`) + `assets/` (17: 8 accept + 9 reject) + `destinations/` (8). Checklist↔workspace 1:1 with
  **zero orphans** (grep-verified against `vue.md`).
- **Content rules.** Script bytes matter **only** for §5: `src/angular/*` must **NOT** contain
  `export class`, and `src/classes/event-bus.ts` **must** contain `export class EventBus`. All other
  `src/*` + every `assets/*` are irrelevant stubs (shape keys on the extension, not bytes). Conventions
  mirror `workspace/tsx/`.
- **8 `destinations/*` bodies are byte-verbatim from `vue.md`** (§6 + §10). The
  `import { Header } from '../src/Header';` / `Footer` lines are **inert textual scan-bait** — so
  `src/Header.*` / `src/Footer.*` are **NOT** created.
- **5 empty 0-byte binaries:** `assets/{logo.png, clip.mp4, theme.mp3, font.woff2, manual.pdf}`. The
  other 12 `assets/*` get tiny realistic stubs (mirroring tsx).
- **`./` vs `../` is load-bearing.** §1/§2 paste src→src (`./model`) and src→assets (`../assets/…`);
  §6 pastes destinations→src (`../src/…`). The flat sibling layout under `vue/` makes every expected
  path resolve.
- **Phase C appends the `vue` row LAST** (alphabetically after `typescript`) into 4 sync docs; the 2
  `CLAUDE.md` mapping files (top-level + `workspace/`) are verify-only (illustrative 2-example mappings),
  per the css 5b / scss 6b / html 7b / markdown 8b / jsx 9b / tsx 10b / mdx 11b precedent.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/vue.md` exists on disk (handshake) — present, 675 lines (untracked; folded per plan)
- [x] Re-confirm the extracted fixture inventory (39 paths) + inline content specs — grep-verify 39 distinct paths
- [x] Create `qa.new/workspace/vue/src/` — 14 fixtures: top-level `App.vue` (primary paste/drop target,
      empty `<script setup>`), `model.ts`, `Widget.tsx`, `helper.js`, `Card.jsx`; `components/Widget.tsx`
      (nested, §7.2); `angular/` 7 (`user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`,
      `user.service.ts`, `auth.module.ts` — all **no `export class`** — + `widget.component.js` (§5.8) +
      `2fa.service.ts` (§5.10 illegal-id guard)); `classes/event-bus.ts` (**`export class EventBus`**)
- [x] Create `qa.new/workspace/vue/assets/` — 17 fixtures: **8 accept** (`logo.png`, `data.json`,
      `config.yaml`, `config.yml`, `clip.mp4`, `theme.mp3`, `subs.vtt`, `BaseButton.vue`) + **9 reject**
      (`page.mdx`, `Widget.svelte`, `Layout.astro`, `global.css`, `theme.scss`, `page.html`, `notes.md`,
      `font.woff2`, `manual.pdf`). 5 binaries 0-byte (`logo.png`, `clip.mp4`, `theme.mp3`, `font.woff2`,
      `manual.pdf`); 12 text stubs.
- [x] Create `qa.new/workspace/vue/destinations/` — 8 byte-exact targets: `setup-and-instance.vue`,
      `with-imports.vue`, `instance-only.vue`, `with-require.vue`, `comment-cursor.vue`,
      `template-only.vue` (no `<script>`), `indented-imports.vue` (2-space indent), `string-literal.vue`
- [x] Verify the 8 `destinations/*` bodies match the `vue.md` §6/§10 code blocks verbatim; invariants
      (angular no `export class`, event-bus has it, no `Header`/`Footer` files) pass
- [x] Write `qa.new/workspace/vue/README.md` (layout tree + fixture-to-checklist mapping + file-count table, Total 39)
- [x] Write `qa.new/workspace/vue/CLAUDE.md` (sync rule + subdirectories + content expectations; note
      allow-list but rejects co-located in `assets/` → no `rejected/`; one-table script arm; Angular-only
      smartId → `angular/` + `classes/` exist)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `~80` + Workspace-counterparts line) — vue LAST, after typescript
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row) — vue LAST, after typescript
- [x] Update `qa.new/README.md` (Layout tree — checklists + workspace blocks — + Current-inventory row) — 3 insertions, vue LAST
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed (css/scss/html/md/jsx/tsx/mdx precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 39) — vue LAST
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed
- [x] Validate: every path referenced in `vue.md` exists in `workspace/vue/` — 39 referenced, 39 present, **0 missing** ✓
- [x] Validate: no orphan fixtures in `workspace/vue/` — 39 fixtures, **0 orphans** ✓
