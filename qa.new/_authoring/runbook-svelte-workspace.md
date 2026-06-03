# Runbook — `.svelte` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/svelte.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/svelte.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/svelte.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present on disk (664 lines, ~80 cases) AND committed: the
> session-13a artifacts (`svelte.md` + `runbook-svelte-checklist.md`) landed in commit `08ea895`.
> This is a clean SPLIT (not a fold) — this session therefore commits ONLY the Phase B + C
> deliverables (`workspace/svelte/*` + the propagated sync docs + this runbook), per the §11
> split-session model. The on-disk `svelte.md` is the source of truth for fixture extraction.**

Drives **session 13b** (`generate-svelte-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/svelte/*` + the updated `qa.new/` inventory/sync docs, committed together
with this runbook in one commit (the session-13a checklist already landed separately in
`08ea895`, so this session does **not** fold — it ships Phase B + C only).

## Workspace notes (approved for `.svelte`)

`.svelte` is the **second framework-trio destination** (`.vue` done in 12a; `.astro` follows in 14a) —
`.vue`/`.svelte`/`.astro` share one builder, `src/snippets/languages/framework-component.ts`. Phase B is
mechanical: `svelte.md` already inlines the exact content for every fixture, so this is faithful
transcription, not design. The checklist drives the workspace 1:1. The structural template is the
already-committed `workspace/vue/` (same builder); stub conventions mirror it byte-for-byte.

- **Allow-list, but rejects live in `assets/` — NO `rejected/` dir.** `.svelte` is allow-list
  (`SVELTE_SUPPORTED_EXTENSIONS`), like `javascript/`/`css/`/`scss/`/`html/`/`markdown/` — but the 13a
  checklist **co-locates** the 9 gated-out reject fixtures inside `svelte/assets/` (e.g.
  `svelte/assets/global.css`) rather than a separate `rejected/` subtree. Honor the checklist 1:1: the
  tree is **`src/` + `assets/` + `destinations/`**, and `assets/` holds **both** accepted and gated-out
  fixtures.
- **One script table, two arms.** All **four** script exts (`.ts`/`.tsx`/`.js`/`.jsx`) → the **7
  TypeScript** styles (`typescriptImportStyle`); a non-script source → one **fixed asset shape**.
  `.js`/`.jsx` route to the **TypeScript** builder (the headline divergence from `.tsx`/`.mdx`, where
  they take the JS fallback) → there is **no JS-fallback arm and no empty-snippet case**. `.svelte` has
  **no** `svelteImportStyle` — it reuses `typescriptImportStyle`.
- **Angular-only smart identifiers**, firing for **all four** script exts (incl. `.js` — §5.8). The
  builder is called **one-arg** (no `detectedImportName`) → `readExportedClassName` is **never** called
  → **no exported-class fill**. Hence `src/angular/*` must contain **NO `export class`** (suffix →
  PascalCase from the filename), and `src/classes/event-bus.ts` **MUST** contain `export class EventBus`
  (the no-fill counter-case, §5.7).
- **`.svelte` → `.svelte` self-import is a named ASSET import** (§10.3): a `.svelte` source is **not** in
  the builder's `SCRIPT_SOURCE_EXTENSIONS`, so it falls through to `buildAssetImportStatement` →
  `assets/Card.svelte` exists for this quirk.
- **DELTA #1 vs `vue.md` (self/reject swap).** `vue.md` accepts `.vue` (self → `assets/BaseButton.vue`)
  and rejects `.svelte`; `svelte.md` accepts `.svelte` (self → `assets/Card.svelte`) and **rejects
  `.vue`** (`assets/Demo.vue`). Both reject `.astro` (`assets/Layout.astro`) and `.mdx`. So the
  accept-self asset and one framework-reject asset swap names; every other asset is a rename.
- **DELTA #2 vs `vue.md` (no `<script setup>`; +1 destination).** Svelte has **no `<script setup>`**
  (a Vue construct). The block-selection-preference fixture is `destinations/module-and-instance.svelte`
  (a `<script context="module">` + a plain instance `<script>` — proving tier-2 over tier-3), and there
  is an **extra** `destinations/module-only.svelte` (tier-3 fallback, §6.2.3) that `vue/` did not need.
  → **9 `destinations/*` fixtures vs vue's 8.** The primary destination `src/App.svelte` has a plain
  **empty `<script>`** block, not `<script setup>`.
- **40 fixtures total:** `src/` (14, incl. `angular/` 7 + `classes/` 1 + `components/` 1 + primary
  `App.svelte`) + `assets/` (17: 8 accept + 9 reject) + `destinations/` (9). Checklist↔workspace 1:1
  with **zero orphans** (grep-verified against `svelte.md`: 40 distinct paths).
- **Content rules.** Script bytes matter **only** for §5: `src/angular/*` must **NOT** contain
  `export class`, and `src/classes/event-bus.ts` **must** contain `export class EventBus`. All other
  `src/*` + every `assets/*` are irrelevant stubs (shape keys on the extension, not bytes). Conventions
  mirror `workspace/vue/`.
- **9 `destinations/*` bodies are byte-verbatim from `svelte.md`** (§6 + §10). The
  `import { Header } from '../src/Header';` / `Footer` lines are **inert textual scan-bait** — so
  `src/Header.*` / `src/Footer.*` are **NOT** created.
- **5 empty 0-byte binaries:** `assets/{logo.png, clip.mp4, theme.mp3, font.woff2, manual.pdf}`. The
  other 12 `assets/*` get tiny realistic stubs (mirroring vue).
- **`./` vs `../` is load-bearing.** §1/§2 paste src→src (`./model`) and src→assets (`../assets/…`);
  §6 pastes destinations→src (`../src/…`). The flat sibling layout under `svelte/` makes every expected
  path resolve.
- **DELTA vs the vue *runbook* — Phase C inserts `svelte` ALPHABETICALLY (between `scss` and `tsx`),
  NOT last.** Vue was appended last only because `v` sorts last; all four inventory docs list languages
  alphabetically (`css`, `html`, `javascript`, `jsx`, `markdown`, `mdx`, `scss`, `tsx`, `typescript`,
  `vue`), so `svelte` slots between `scss` and `tsx`. The 2 `CLAUDE.md` mapping files (top-level +
  `workspace/`) are verify-only (illustrative 2-example mappings), per the css 5b / scss 6b / html 7b /
  markdown 8b / jsx 9b / tsx 10b / mdx 11b / vue 12b precedent.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/svelte.md` exists on disk (handshake) — committed in `08ea895`
- [x] Re-confirm the extracted fixture inventory (40 paths) + inline content specs — grep-verify 40 distinct paths
- [x] Create `qa.new/workspace/svelte/src/` — 14 fixtures: top-level `App.svelte` (primary paste/drop target,
      empty `<script>`), `model.ts`, `Widget.tsx`, `helper.js`, `Card.jsx`; `components/Widget.tsx`
      (nested, §7.2); `angular/` 7 (`user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`,
      `user.service.ts`, `auth.module.ts` — all **no `export class`** — + `widget.component.js` (§5.8) +
      `2fa.service.ts` (§5.10 illegal-id guard)); `classes/event-bus.ts` (**`export class EventBus`**)
- [x] Create `qa.new/workspace/svelte/assets/` — 17 fixtures: **8 accept** (`logo.png`, `data.json`,
      `config.yaml`, `config.yml`, `clip.mp4`, `theme.mp3`, `subs.vtt`, `Card.svelte`) + **9 reject**
      (`page.mdx`, `Demo.vue`, `Layout.astro`, `global.css`, `theme.scss`, `page.html`, `notes.md`,
      `font.woff2`, `manual.pdf`). 5 binaries 0-byte (`logo.png`, `clip.mp4`, `theme.mp3`, `font.woff2`,
      `manual.pdf`); 12 text stubs.
- [x] Create `qa.new/workspace/svelte/destinations/` — 9 byte-exact targets: `module-and-instance.svelte`,
      `instance-only.svelte`, `module-only.svelte`, `with-imports.svelte`, `with-require.svelte`,
      `comment-cursor.svelte`, `template-only.svelte` (no `<script>`), `indented-imports.svelte`
      (2-space indent), `string-literal.svelte`
- [x] Verify the 9 `destinations/*` bodies match the `svelte.md` §6/§10 code blocks verbatim; invariants
      (angular no `export class`, event-bus has it, no `Header`/`Footer` files) pass
- [x] Write `qa.new/workspace/svelte/README.md` (layout tree + fixture-to-checklist mapping + file-count table, Total 40)
- [x] Write `qa.new/workspace/svelte/CLAUDE.md` (sync rule + subdirectories + content expectations; note
      allow-list but rejects co-located in `assets/` → no `rejected/`; one-table script arm; Angular-only
      smartId → `angular/` + `classes/` exist)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `~80` + Workspace-counterparts line) — svelte ALPHABETICAL, between scss and tsx
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row) — svelte between scss and tsx
- [x] Update `qa.new/README.md` (Layout tree — checklists + workspace blocks — + Current-inventory row) — 3 insertions, svelte between scss and tsx
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed (css/scss/html/md/jsx/tsx/mdx/vue precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 40) — svelte between scss and tsx
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed
- [x] Validate: every path referenced in `svelte.md` exists in `workspace/svelte/` — 40 referenced, 40 present, **0 missing**
- [x] Validate: no orphan fixtures in `workspace/svelte/` — 40 fixtures, **0 orphans**
