# Runbook — `.astro` workspace + propagation (Phases B + C)

> **CRITICAL — Two-tier checkbox rule.**
> The `[ ]` boxes in THIS file are for the agent to tick as it completes
> workspace/propagation tasks. The `[ ]` boxes inside
> `qa.new/checklists/astro.md` are for the HUMAN running QA in the
> Extension Development Host. **NEVER tick boxes in
> `qa.new/checklists/astro.md` during generation.**

> **Handshake prerequisite.** `qa.new/checklists/astro.md` MUST already exist
> on disk (from the prior checklist session). If it does not, stop and report — do
> not proceed. — **Verified present on disk (642 lines, ~84 cases). The session-14a
> artifacts (`astro.md` + `runbook-astro-checklist.md`) are currently untracked; per the
> approved plan this session takes the SPLIT path (mirroring the vue 12b precedent): 14a
> commits separately first (`astro.md` + `runbook-astro-checklist.md`), then this session
> commits ONLY the Phase B + C deliverables (`workspace/astro/*` + the propagated sync docs
> + this runbook) — NOT a fold. The on-disk `astro.md` is the source of truth for fixture
> extraction.**

Drives **session 14b** (`generate-astro-workspace`, Phases B + C) per
`qa-pipeline/QA-PIPELINE-SPEC.md` §6 (Template B) + §10/§11. Output of this runbook:
`qa.new/workspace/astro/*` + the updated `qa.new/` inventory/sync docs, committed together
with this runbook in one commit (the session-14a checklist lands separately, so this session
does **not** fold — it ships Phase B + C only). **This is the final session of the migration.**

## Workspace notes (approved for `.astro`)

`.astro` is the **third and final framework-trio destination** (`.vue` done in 12b; `.svelte` in
13b) — `.vue`/`.svelte`/`.astro` share one builder, `src/snippets/languages/framework-component.ts`.
Phase B is mechanical: `astro.md` already inlines the exact content for every fixture, so this is
faithful transcription, not design. The checklist drives the workspace 1:1. The structural template
is the already-committed `workspace/svelte/` + `workspace/vue/` (same builder); stub conventions mirror
them byte-for-byte.

- **Allow-list, but rejects live in `assets/` — NO `rejected/` dir.** `.astro` is allow-list
  (`ASTRO_SUPPORTED_EXTENSIONS`), like `javascript/`/`css/`/`scss/`/`html/`/`markdown/` — but the 14a
  checklist **co-locates** the gated-out reject fixtures inside `astro/assets/` (e.g.
  `astro/assets/global.css`) rather than a separate `rejected/` subtree. Honor the checklist 1:1: the
  tree is **`src/` + `assets/` + `destinations/`**, and `assets/` holds **both** accepted and gated-out
  fixtures.
- **One script table, two arms.** All **four** script exts (`.ts`/`.tsx`/`.js`/`.jsx`) → the **7
  TypeScript** styles (`typescriptImportStyle`); a non-script source → one **fixed asset shape**.
  `.js`/`.jsx` route to the **TypeScript** builder (the headline divergence from `.tsx`/`.mdx`, where
  they take the JS fallback) → there is **no JS-fallback arm and no empty-snippet case**. `.astro` has
  **no** `astroImportStyle` — it reuses `typescriptImportStyle`.
- **Angular-only smart identifiers**, firing for **all four** script exts (incl. `.js` — §5.8). The
  builder is called **one-arg** (no `detectedImportName`) → `readExportedClassName` is **never** called
  → **no exported-class fill**. Hence `src/angular/*` must contain **NO `export class`** (suffix →
  PascalCase from the filename), and `src/classes/event-bus.ts` **MUST** contain `export class EventBus`
  (the no-fill counter-case, §5.7).
- **`.astro` → `.astro` self-import is a named ASSET import** (§10.3): a `.astro` source is **not** in
  the builder's `SCRIPT_SOURCE_EXTENSIONS`, so it falls through to `buildAssetImportStatement` →
  `assets/Card.astro` exists for this quirk.
- **DELTA #1 vs `vue.md`/`svelte.md` (the WIDEST accept-list).** `.astro` additionally **accepts**
  `.vue`, `.svelte`, `.md`, **and** `.mdx` — the four sources that `.vue`/`.svelte` *reject*. All four
  route to the **named-asset** arm. So the `assets/` named-asset family is **all ACCEPT** here:
  `Card.astro` (self) + `Demo.vue` + `Widget.svelte` + `notes.md` + `post.mdx` (5). The reject set
  shrinks to the mechanical complement — just **5**: `global.css`, `theme.scss`, `page.html`,
  `font.woff2`, `manual.pdf`. → **`assets/` splits 12 accept / 5 reject** (vs svelte's & vue's 8/9). In
  §1 matrix terms that is **16 accept / 5 reject** rows (12 asset accepts + 4 script accepts).
- **DELTA #2 vs `vue.md`/`svelte.md` (frontmatter `---` fences; NO block tiers; −2 destinations vs
  svelte).** `.astro` has **no** `<script setup>` (a Vue construct) and **no** `<script context="module">`
  (a Svelte construct) — placement is confined to a flat `---` frontmatter fence pair
  (`computeAstroPlacement`). There is **no** instance-vs-module tier and **no** block-selection-preference
  sub-case, so the `module-and-instance` / `instance-only` / `module-only` / `setup-and-instance`
  fixtures collapse. In their place astro adds **`empty-frontmatter.astro`** (§6.1.2 — fences exist but
  hold no `IMPORT_INDICATORS` line; Bottom falls back to just-after-the-opening-fence). → **7
  `destinations/*` fixtures** (vs svelte's 9, vue's 8). The primary destination `src/App.astro` has an
  **empty `---` frontmatter** (two bare fences), not a `<script>` block.
- **38 fixtures total:** `src/` (14, incl. `angular/` 7 + `classes/` 1 + `components/` 1 + primary
  `App.astro`) + `assets/` (17: 12 accept + 5 reject) + `destinations/` (7). Checklist↔workspace 1:1
  with **zero orphans** (grep-verified against `astro.md`: 38 distinct paths).
- **Content rules.** Script bytes matter **only** for §5: `src/angular/*` must **NOT** contain
  `export class`, and `src/classes/event-bus.ts` **must** contain `export class EventBus`. All other
  `src/*` + every `assets/*` are irrelevant stubs (shape keys on the extension, not bytes). Conventions
  mirror `workspace/svelte/` + `workspace/vue/`.
- **7 `destinations/*` bodies are byte-verbatim from `astro.md`** (§6 + §10). The
  `import { Header } from '../src/Header';` / `Footer` lines are **inert textual scan-bait** — so
  `src/Header.*` / `src/Footer.*` are **NOT** created.
- **5 empty 0-byte binaries:** `assets/{logo.png, clip.mp4, theme.mp3, font.woff2, manual.pdf}`. The
  other 12 `assets/*` get tiny realistic stubs (mirroring svelte/vue).
- **`./` vs `../` is load-bearing.** §1/§2 paste src→src (`./model`) and src→assets (`../assets/…`);
  §5 pastes src→src/angular (`./angular/user.component`); §6 pastes destinations→src (`../src/…`). The
  flat sibling layout under `astro/` makes every expected path resolve.
- **DELTA #3 vs the vue & svelte *runbooks* — Phase C inserts `astro` FIRST (after `general`, before
  `css`), NOT last and NOT mid-list.** All four inventory docs list per-destination languages
  **alphabetically** (general pinned first): `css`, `html`, `javascript`, `jsx`, `markdown`, `mdx`,
  `scss`, `svelte`, `tsx`, `typescript`, `vue`. Since `a < c`, `astro` slots **immediately after
  `general` and before `css`**. (Vue was appended last only because `v` sorts last; svelte slotted
  between `scss` and `tsx`.) The 2 `CLAUDE.md` mapping files (top-level + `workspace/`) are verify-only
  (illustrative 2-example mappings), per the css 5b / scss 6b / html 7b / markdown 8b / jsx 9b / tsx
  10b / mdx 11b / vue 12b / svelte 13b precedent.

## Phase B — Build workspace

- [x] Verify `qa.new/checklists/astro.md` exists on disk (handshake) — present, 642 lines
- [x] Re-confirm the extracted fixture inventory (38 paths) + inline content specs — grep-verify 38 distinct paths
- [x] Create `qa.new/workspace/astro/src/` — 14 fixtures: top-level `App.astro` (primary paste/drop target,
      empty `---` frontmatter), `model.ts`, `Widget.tsx`, `helper.js`, `Card.jsx`; `components/Widget.tsx`
      (nested, §7.2); `angular/` 7 (`user.component.ts`, `highlight.directive.ts`, `trim.pipe.ts`,
      `user.service.ts`, `auth.module.ts` — all **no `export class`** — + `widget.component.js` (§5.8) +
      `2fa.service.ts` (§5.10 illegal-id guard)); `classes/event-bus.ts` (**`export class EventBus`**)
- [x] Create `qa.new/workspace/astro/assets/` — 17 fixtures: **12 accept** (`logo.png`, `data.json`,
      `config.yaml`, `config.yml`, `clip.mp4`, `theme.mp3`, `subs.vtt`, `Card.astro`, `Demo.vue`,
      `Widget.svelte`, `notes.md`, `post.mdx`) + **5 reject** (`global.css`, `theme.scss`, `page.html`,
      `font.woff2`, `manual.pdf`). 5 binaries 0-byte (`logo.png`, `clip.mp4`, `theme.mp3`, `font.woff2`,
      `manual.pdf`); 12 text stubs.
- [x] Create `qa.new/workspace/astro/destinations/` — 7 byte-exact targets: `with-imports.astro`,
      `empty-frontmatter.astro`, `with-require.astro`, `comment-cursor.astro`, `template-only.astro`
      (no `---` frontmatter), `indented-imports.astro` (2-space indent), `string-literal.astro`
- [x] Verify the 7 `destinations/*` bodies match the `astro.md` §6/§10 code blocks verbatim; invariants
      (angular no `export class`, event-bus has it, no `Header`/`Footer` files) pass
- [x] Write `qa.new/workspace/astro/README.md` (layout tree + fixture-to-checklist mapping + file-count table, Total 38)
- [x] Write `qa.new/workspace/astro/CLAUDE.md` (sync rule + subdirectories + content expectations; note
      allow-list but rejects co-located in `assets/` → no `rejected/`; widest accept-list → 12/5 split;
      one-table script arm; Angular-only smartId → `angular/` + `classes/` exist; frontmatter-fence
      placement → no block-tier destinations)

## Phase C — Wire & propagate

- [x] Update `qa.new/checklists/README.md` (Inventory row `~84` + Workspace-counterparts line) — astro FIRST, after general / before css
- [x] Update `qa.new/checklists/CLAUDE.md` (Files-table row) — astro after general / before css
- [x] Update `qa.new/README.md` (Layout tree — checklists + workspace blocks — + Current-inventory row) — 3 insertions, astro after general / before css
- [x] Verify `qa.new/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed (css/scss/html/md/jsx/tsx/mdx/vue/svelte precedent)
- [x] Update `qa.new/workspace/README.md` (Languages-table row, Files = 38) — astro after general / before css
- [x] Verify `qa.new/workspace/CLAUDE.md` — illustrative 2-example mapping (general + typescript); no edit needed
- [x] Validate: every path referenced in `astro.md` exists in `workspace/astro/` — expect 38 referenced, 38 present, **0 missing**
- [x] Validate: no orphan fixtures in `workspace/astro/` — expect 38 fixtures, **0 orphans**
