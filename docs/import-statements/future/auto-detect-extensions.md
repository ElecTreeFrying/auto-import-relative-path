# Script Import Extension — Auto-Detect (Future)

> **Status:** DEFERRED — revisit December 2026. **NOT shipped.** Designed but not implemented; nothing here exists in `src/`.
>
> Captures the design space for a future feature that auto-detects whether to preserve (and rewrite) the file extension on script imports based on the destination project's runtime context. The criteria rubric in [`../CRITERIA.md`](../CRITERIA.md) applies to anything this feature adds to a picker; otherwise this is a behavior-detection feature, not a registry entry. The per-language picker spec is [`../spec/statements.md`](../spec/statements.md).

> **NOT shipped — the only deferred design in the docs tree carrying a hard calendar date** (the framework sub-roadmap in [`framework-roadmap.md`](framework-roadmap.md) is also deferred, but trigger-only with no date). Nothing designed here exists in `src/`. `preserveScriptFileExtension` is still a plain **boolean, default `false`** in `package.json` (`auto-import.importStatement.script.preserveScriptFileExtension` — `"type": "boolean"`, `"default": false`). There is no detection module, no `.ts → .js` rewriting, no tri-state migration, no `package.json` schema change, and no code presence in `src/` (`src/commands/CLAUDE.md` cross-references this doc beside the shipped boolean toggle). Revisit December 2026 per [Implementation status](#implementation-status).

> The current shipped boolean behavior — which shapes never regress with `false`, and which mechanisms are setting-controlled vs hardcoded — is documented in the spec layer at [`../spec/CLAUDE.md`](../spec/CLAUDE.md) (Extension preservation). This doc covers only the unbuilt auto-detect design.

## Implementation status

**DEFERRED — revisit December 2026; NOT shipped (`preserveScriptFileExtension` is still a boolean, default `false`).** Design captured and locked in via the living gate ([Design decisions](#design-decisions) below). Implementation parked per a 2026-05-22 maintainer decision after an honest audience/dogfooding/maintenance-cost evaluation. Default stays `preserveScriptFileExtension: false` (current boolean type).

### Why deferral makes sense for this extension

- **Audience composition.** The extension's user base is overwhelmingly bundler-context (Vite / Webpack / Next / CRA / etc.) — workflows where `preserveScriptFileExtension: false` is already correct. NodeNext / Deno / Browser ESM / Node ESM users exist but are a minority, and most who use those runtimes already lean on the TypeScript Language Server's built-in import quick-fixes rather than a paste-import extension.
- **Maintainer dogfooding gap.** The maintainer does not personally use NodeNext / Deno / Browser ESM. Shipping detection / rewriting logic without daily-use validation is a real bug-source risk.
- **Maintenance tax is real but bounded.** Detection edge cases (monorepos with mixed `tsconfig`s, the `allowImportingTsExtensions: true` interaction below, Windows filesystem-watcher quirks, future TypeScript / Node spec changes) will accumulate bug reports if shipped. For a minority-audience feature, the cost is hard to justify without a concrete trigger.
- **No concrete user signal.** No GitHub issues, no feature requests demanding the feature as of 2026-05-22.

The design work isn't wasted — capturing the criteria-application, the detection-signal priority, and the rejection ledger is the high-leverage thinking. The cold-start implementation estimate (Phase 1+2: ~3 days) means the design can be picked up rapidly when a trigger arrives.

### Per-runtime behaviour (what auto-detect would produce, if implemented)

Reference matrix for the eventual implementation — what each runtime expects per source extension on relative imports:

| Runtime | Detection signal | `.ts` source | `.tsx` source | `.mts` source | `.cts` source | `.js` source |
|---------|------------------|--------------|----------------|----------------|----------------|---------------|
| **Bundler** | None of the below (fallback signal #5) | `'./foo'` | `'./foo'` | `'./foo'` | `'./foo'` | `'./foo'` |
| **TS NodeNext / Node16** | `tsconfig.json` `moduleResolution: "NodeNext" \| "Node16"` | `'./foo.js'` | `'./foo.js'` | `'./foo.mjs'` | `'./foo.cjs'` | `'./foo.js'` |
| **Deno** | `deno.json[c]` present in workspace | `'./foo.ts'` | `'./foo.tsx'` | `'./foo.mts'` | `'./foo.cts'` | `'./foo.js'` |
| **Node ESM** (plain JS) | `package.json` `"type": "module"` | n/a | n/a | `'./foo.mjs'` | `'./foo.cjs'` | `'./foo.js'` |
| **Browser ESM** | Destination is `.html` with `<script type="module">` | `'./foo.js'` | `'./foo.js'` | `'./foo.mjs'` | `'./foo.cjs'` | `'./foo.js'` |

Source-extension columns are the file the user is pasting; cell content is the path the snippet should emit for that runtime.

### Revisit triggers

Any one of these warrants opening this doc and implementing Phase 1+2 from the locked-in design:

- A GitHub issue specifically about NodeNext / Deno / Browser ESM / Node ESM correctness on relative imports.
- Maintainer starts a personal project using one of these runtimes (real dogfooding signal).
- TypeScript / Node / Deno ships a change affecting the locked-in detection signals (`deno.json`, `tsconfig.json moduleResolution`, `package.json type`).
- Two or more independent users request the feature.

### Calendar checkpoint

**December 2026.** Re-read this doc + the [rejection ledger](#things-considered-and-rejected). If none of the triggers fired, defer another 6 months without guilt. Implementation cold-start estimate from the locked-in design: **~3 days** for Phase 1+2 (enum + opt-in `"auto"`, default stays `"never"`).

### Phase 1+2+3 staging (when implementation does happen)

The locked-in design supports a phased rollout that contains risk:

| Phase | What ships | Risk profile |
|-------|------------|--------------|
| **Phase 1+2 combined** | Boolean → tri-state enum (`"never"` / `"always"` / `"auto"`) **with default `"never"`**; full detection module + rewriting table; resolver helper centralising the script-to-script call sites; migration logic (boolean `true` → `"always"`, `false` → `"never"`, unset → `"never"`) | Zero behaviour change for existing users (default unchanged); `"auto"` available as opt-in for adventurous users and maintainer dogfooding |
| **Phase 3 — Default flip to `"auto"`** | Migration default flips: unset → `"auto"` | Behaviour change for users with unset setting. Requires Phase 1+2 in the wild ≥1–2 minor releases with positive feedback and zero schema-migration bug reports |
| **Phase 4 — Filesystem watcher / cache invalidation** | `vscode.workspace.onDidChangeWorkspaceFolders` + filesystem watcher on `deno.json` / `tsconfig.json` / `package.json` | Defer indefinitely; only ship if cache-staleness bug reports surface |

> **Migration-default resolution (was an open contradiction; stated explicitly here).** The "at a glance" proposal below names `"auto"` as the *recommended new default*, while this staging table ships unset → `"never"`. These are not in conflict — they describe two different things:
>
> - **At-a-glance = the END state.** Once the feature is mature (post Phase 3), an unset `preserveScriptFileExtension` resolves to `"auto"`. That is the product's intended long-run default.
> - **Staging table = SHIP ORDER.** During Phase 1+2, unset migrates to `"never"` (a true no-behaviour-change ship). Phase 3 is the dedicated step that flips the unset-default from `"never"` to `"auto"`, gated on real-world soak time.
>
> So: implement Phase 1+2 with unset → `"never"`; do not let the at-a-glance "recommended new default" tempt an earlier flip. The `"auto"` default is the destination, the `"never"` default is the runway.

## Context

The current setting `auto-import.importStatement.script.preserveScriptFileExtension` is a global boolean that ships defaulted to `false`. That assumption matches the bundler-era convention (webpack, Vite, etc., resolve extensions for you) — but the assumption is shrinking:

- **Node ESM** (`"type": "module"`) — requires extensions on relative imports.
- **TypeScript NodeNext / node16** — requires extensions, AND the extension must be the post-compile name (`.js`, not `.ts`).
- **Deno** — requires extensions; supports `.ts` directly (no rewriting needed).
- **Browser-native ESM** (`<script type="module">`) — requires extensions; runs compiled output.

Two failure modes today:

1. **No extension when one is needed.** User on a Node ESM project pastes `foo.ts` → gets `'./foo'` → import fails at runtime.
2. **Wrong extension preserved.** User flips the setting to `true` in a NodeNext project, pastes `foo.ts` → gets `'./foo.ts'` → TypeScript rejects (NodeNext expects `'./foo.js'`).

The shipped registry defers the simple flip-to-`true` decision *and* explicitly flags the NodeNext rewriting gap (see [`../decisions/statements.md`](../decisions/statements.md)). This doc designs a fuller solution.

## Goals

- Correct behavior out of the box for the four modern runtimes above.
- Preserve back-compat for bundler users — never produce a worse result than today.
- Be observable when needed: when auto-detect signals fire, the choice should be explainable (in tooltip, settings UI, or a one-time toast — TBD).
- Stay non-disruptive: existing users with explicit settings keep them; auto-detect is opt-in via a new value rather than a forced upgrade.

## Non-goals

- **Stylesheet extension auto-detect.** `preserveStylesheetFileExtension` has a narrower use case; the existing asymmetric SCSS `.css`-always-preserved rule already handles the critical case. Defer to a separate doc if ever revisited.
- **Bundler-config parsing** (`webpack.config.js`, `vite.config.ts`, `tsconfig` `paths`, etc.). Too many edge cases (custom resolvers, virtual modules, monorepo aliases). Detection should rely on signals that are stable across the ecosystem.
- **Per-file granular control.** Detection is per-destination-workspace (or per-monorepo-package), not per-paste — the cost/benefit doesn't justify per-paste UI.

## Proposal — at a glance

**Replace the current boolean** `preserveScriptFileExtension: boolean` **with a tri-state enum**:

| Value | Behavior |
|-------|----------|
| `"never"` | Never preserve the extension. (Today's `false`.) Bundler default. |
| `"always"` | Preserve the source extension verbatim. (Today's `true`.) No rewriting. |
| `"auto"` (recommended new default — END state, see migration-default resolution above) | Detect the destination project's runtime; emit the right extension (preserved + rewritten as needed). |

Migration: persisted `true` → `"always"`, persisted `false` → `"never"`. Persisted-`undefined` → `"auto"` is the **eventual** (post Phase 3) resolution; during Phase 1+2 ship it as unset → `"never"` per the staging table. The setting name (`preserveScriptFileExtension`) stays for back-compat with anyone reading the docs; only the *type* changes from boolean to enum. (Alternatively, a clean-break rename to `scriptExtensionMode` — open question; see below.)

**Detection signals**, read in order from the destination file's nearest workspace ancestor; first match wins:

1. **Destination is `.html` with a nearby `<script type="module">`.** Browser ESM → preserve + rewrite TS → JS.
2. **Workspace has `deno.json` or `deno.jsonc`.** Deno → preserve, no rewrite (Deno supports `.ts` directly).
3. **Destination's nearest `tsconfig.json` has `"moduleResolution": "NodeNext"` or `"node16"`.** NodeNext → preserve + rewrite TS → JS.
4. **Destination's nearest `package.json` has `"type": "module"`.** Node ESM → preserve, no rewrite (transpilation assumed if source is TS).
5. **None of the above.** Bundler era → behave like `"never"` (no preservation).

**Extension rewriting (TS → JS):** When the detected runtime requires JS-named imports (browser ESM, TS NodeNext), rewrite the emitted extension:

- `.ts` → `.js`
- `.tsx` → `.js`
- `.mts` → `.mjs`
- `.cts` → `.cjs`

The source file on disk is unchanged; only the path emitted into the snippet is rewritten.

> **P1 design task — Bun `package.json type: "module"` wrong-extension-preservation (latent bug in signal #4).** Promoted from an open-question footnote to a first-class Phase-1 task for whoever un-defers this. Bun resolves extensionless relative imports (`.js` / `.ts` / `.tsx` / `.jsx`) and expects no extension — exactly what the bundler-fallback (signal #5) emits, so the **common** Bun case is accidentally correct via fallback. But a Bun project that also declares `"type": "module"` in its `package.json` will match **signal #4** *before* reaching the fallback, get classified as Node ESM, and have its extensions preserved/rewritten — wrong for Bun. This is the one realistic way Bun "ends up matching a different signal." Phase 1 must decide how signal #4 disambiguates Bun from Node ESM (e.g. a `bunfig.toml` / `bun.lock` presence check that suppresses preservation, or a documented `"always"`/`"never"` override) before signal #4 ships. See the matching latent-bug flag in [Design decisions](#-latent-bug-to-resolve-before-un-deferring-p1) below.

## Implementation sketch (non-binding)

Four places this would touch (subject to refinement during the actual implementation audit):

- `src/config/settings.ts` — `AUTO_IMPORT_CONFIG` `script.preserve` alias resolves to the new enum-typed setting; consumers cast from `boolean | string` to the new enum. Migration logic on first read.
- `src/snippets/languages/javascript.ts` + `src/snippets/languages/typescript.ts` — replace the `getAutoImportSetting('script', 'preserve')` boolean read with a helper `resolveScriptExtension(sourceFilePath, destinationFilePath)` that returns the **final extension string to append** (possibly empty, possibly rewritten). All extension logic centralizes there. (`src/snippets/variants.ts`, `src/snippets/_react.ts:buildReactImport`, and `src/snippets/languages/framework-component.ts` would route through the same resolver for their script buckets.)
- New helper module `src/path/extension-detect.ts` — pure detection logic (reads `package.json` / `tsconfig.json` / `deno.json` via `vscode.workspace.fs` or `fs.promises`; caches per-workspace). Stays in `path/` if we can keep it `vscode`-free; otherwise lives in `editor/` since `vscode.workspace.fs` is needed.
- `src/commands/toggle-preserve-script-extension.ts` — *(shipped after this design was captured)* a Command-Palette toggle that flips the **boolean** `preserveScriptFileExtension` on/off. A 2-state toggle cannot represent the `"never"` / `"always"` / `"auto"` tri-state, so when this design is un-deferred, replace the toggle with a 3-way QuickPick (mirror `src/commands/set-import-placement.ts`) or remove the command. The boolean→enum migration (`true` → `"always"`, `false` → `"never"`) migrates the persisted value cleanly; only the command UI needs reconciling.

`package.json` setting type changes from `"type": "boolean"` to `"type": "string"` with `enum: ["never", "always", "auto"]`. Settings migration runs once per user on first activation that sees the boolean value.

## Design decisions

> Per-decision criteria evaluation and rejection ledger for this design. Applies the rubric in [`../CRITERIA.md`](../CRITERIA.md).
>
> **Status: LIVING / DEFERRED — revisit December 2026; NOT shipped.** `script.preserveScriptFileExtension` is still a plain boolean (`default false`) in `package.json`; the tri-state enum below has not been implemented (no code presence in `src/`; `src/commands/CLAUDE.md` cross-references this doc). This is a **living gate** for the design's locked-in decisions: each major choice recorded against the rubric, stays open for future amendments when the feature is un-deferred.
>
> This feature is **behavior-detection**, not a picker-registry entry — most of the rubric governs per-shape inclusion and applies indirectly.

### Criteria application

#### Criteria that apply directly

- **Criterion 6 — Modern best practice.** Node ESM, TS NodeNext, Deno, and browser ESM all *require* extensions on relative imports. Producing the wrong extension breaks the user's runtime. TS team / Node docs / Deno docs converge on the same direction.
- **Tiebreaker 5 — Correctness beats picker bloat.** NodeNext's `.ts` → `.js` rewriting is a *correctness* issue today: the current boolean produces broken imports for NodeNext users. The rubric explicitly allows promote-to-dispatch when correctness is at stake — same pattern as the existing CSS Modules basename-check in `_react.ts` (`buildAssetImportStatement`, the basename guard before the asset switch).
- **Criterion 5 — Promotion-to-dispatch exception.** The rubric's exception for source-type-conditional shapes that hit Correctness generalises to *destination-runtime-conditional* here. Identical principle; the signal source is project config rather than source filename.

#### Criteria that don't apply (and why)

- **Criteria 1–4** and the **picker-bloat ceiling** govern picker entries (does this *shape* belong in the picker?). Auto-detect doesn't add a shape; it changes how existing shapes resolve the extension token. The `script` picker's entry count is unaffected.

### Locked-in design decisions

| Decision | Rubric anchor |
|----------|--------------|
| Tri-state enum (`"never"` / `"always"` / `"auto"`) replacing the boolean | Tiebreaker 5 — correctness need (NodeNext rewriting) drives the expansion; existing boolean-equivalent values stay reachable as explicit overrides. |
| Default = `"auto"` | Criterion 6 — modern best practice matches what every modern runtime actually expects. |
| Detection-signal priority: browser-ESM (`.html` + `<script type="module">`) → `deno.json` → `tsconfig.json moduleResolution` → `package.json type` → bundler-fallback | Criterion 2 (standards-current) — each signal is the canonical place the runtime / module-system is declared. Order reflects specificity: the destination-context browser-ESM check fires first (the destination itself pins the runtime), then Deno's marker (the most diagnostic config file), NodeNext's `moduleResolution` (more specific than the generic `type: "module"`), with bundler-era as the fallback. |
| TS → JS rewriting (`.ts` / `.tsx` → `.js`; `.mts` / `.cts` → `.mjs` / `.cjs`) | Tiebreaker 5 — correctness for NodeNext + browser ESM (both expect compiled-name imports). |
| Setting name kept (`preserveScriptFileExtension`) rather than renamed to `scriptExtensionMode` | Back-compat — migration cost outweighs marginal naming clarity. Revisit if user feedback says the name is confusing. |
| Silent emission on auto-branch (no toast on every paste) | Criterion 6 (correct-by-default — the snippet *is* the right output; explaining doesn't change correctness). Observability TBD on user feedback. |

### ⚠️ Latent bug to resolve before un-deferring (P1)

**Bun + `package.json type: "module"` mis-preserves the extension.** Bun resolves extensionless relative imports (`.js` / `.ts` / `.tsx` / `.jsx` all resolve without an extension), so the desired output for a Bun project is *no extension*. The intended path to that output is the bundler-fallback signal (#5 — "none of the above" emits no extension), and a plain Bun project hits it correctly. But a Bun project that *also* sets `package.json type: "module"` matches signal #4 (`package.json type`) first, which preserves the extension — the wrong output for Bun. This is a known signal-priority collision, promoted here from the "Explicit Bun runtime detection" rejection note (below) to a **first-class P1 design task** for whoever un-defers this feature: decide whether to add an explicit Bun marker check (`bunfig.toml` / `bun.lock` / Bun-specific `package.json` fields) ahead of signal #4, or to otherwise disambiguate the `type: "module"` signal so Bun projects fall through to the extensionless output. Do not ship the tri-state enum without resolving it.

### Things considered and rejected

Criterion-tagged rejections. New rejections must cite either an Inclusion criterion (1–6) the shape fails or a Rejection criterion (A–F) from [`../CRITERIA.md`](../CRITERIA.md). Doc-local notes are acceptable when no criterion is a clean fit; flag them explicitly.

- **Parsing `webpack` / `vite` / `esbuild` config files** — *(Fails Rejection Criterion B — bundler/framework-specific.)* Too many edge cases (custom resolvers, virtual modules, alias plugins, monorepo overrides). Static config detection (`tsconfig` / `package.json` / `deno.json`) is the bounded, portable subset.
- **Per-file pragma comments** (`// @auto-import-preserve: true`) — *(Fails Criterion 1: Frequency — well below the 30% threshold.)* Too much surface area; virtually no codebases write pragma-style import directives. Skip.
- **Auto-rewriting existing imports on save** — *(Fails Rejection Criterion C — different feature wearing similar surface: a file-modification command, not a paste-import.)* This feature only governs initial paste output. A separate "fix-up imports" command could exist someday; out of scope here.
- **Detecting via active VS Code TypeScript language server hints** — *(Fails Criterion 3: Framework-portable — TS LSP coupling can't serve Deno / JS users equally.)* Authoritative when available, but tightly couples this extension to TS server internals and breaks for non-TS workflows (Deno, vanilla JS). Static config detection stays portable.
- **Reading lockfiles** (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) — *(Doc-local rejection — wrong signal-content: lockfiles describe the dependency tree, not the runtime expectations of the consuming project.)* No rubric criterion is a clean fit, but the signal-content mismatch is decisive: lockfiles tell you what was installed, not how the consumer imports it. Skip.
- **Import maps** (`<script type="importmap">` JSON, handwritten) — *(Fails Rejection Criterion B — framework-specific tooling, for the handwritten case.)* Browser-feature spec, but rarely written by hand correctly for this purpose; framework tooling (Vite's import resolution, Deno's `imports` field in `deno.json`) layers on top. Deno's `imports` is already covered by signal #2 in the detection priority. Skip.
- **Explicit Bun runtime detection** (`bunfig.toml`, `bun.lock`, `package.json` Bun-specific fields) — *(Doc-local rejection — redundant with the bundler-fallback for the common case, but see the P1 latent bug above.)* Bun supports extensionless relative imports (`.js` / `.ts` / `.tsx` / `.jsx` all resolve without extension). Explicit detection was not added because the bundler-fallback signal (#5 — "none of the above") already emits no extension, which is what Bun expects. Accidentally correct via fallback; explicit detection is redundant for the common Bun case. **However:** a Bun project with `package.json type: "module"` falls to signal #4 and incorrectly preserves extensions — that collision is now tracked as the **P1 latent bug** above and must be resolved before the tri-state enum ships.
- **Explicit legacy TypeScript `moduleResolution: "node"` detection** (the pre-NodeNext default still common in older codebases) — *(Doc-local rejection — redundant with the bundler-fallback; accidentally correct via fallback.)* Allows extensionless imports just like bundler resolution. Explicit detection was not added because signal #3 only matches `"NodeNext"` / `"Node16"`; legacy `"node"` falls through to signal #5 (bundler-fallback) and correctly emits no extension. Explicit detection is redundant.

## Open questions

- **Default value.** `"auto"` as the new default is the right product call (the feature works out of the box), but it's behavior-affecting for users in mixed bundler/Node projects. The staging resolution above settles the *sequencing* (Phase 1+2 ships unset → `"never"`; Phase 3 flips unset → `"auto"`); what remains open is whether the Phase-3 flip ever clears its soak-time bar.
- **Setting rename.** Keeping `preserveScriptFileExtension` for the new enum is back-compat-friendly but semantically odd (`"never"` "preserves" nothing). A rename to `scriptExtensionMode` is cleaner; needs a migration path for the old key. Lean toward keep-the-name for now.
- **Monorepo / nested workspaces.** Should detection walk up to the nearest `package.json` from the *destination* file (stopping at `node_modules`/`.git`)? Or stop at the VS Code workspace root? Likely the former.
- **`.ts` source pasted into a `.js` destination in a NodeNext project.** Still rewrite to `.js`? Probably yes (the destination is JS but the project pipeline expects compiled names). Worth a manual-QA case.
- **Cache invalidation.** Detection reads filesystem state. When `package.json` / `tsconfig.json` changes mid-session, do we re-detect? A `vscode.workspace.onDidChangeWorkspaceFolders` listener + filesystem watcher would handle it. Performance impact likely negligible.
- **Visibility / observability.** When `"auto"` picks a non-default branch, should the snippet output be silently right, or should a one-time toast explain why? Lean silent (the snippet *is* correct — that's the value); revisit if support questions surface.
- **Interaction with the Pick-Style QuickPick.** The `"auto"` value affects what extension lands on the path, but the picker enumerates *style* variants (`import name from ...`, `import { name } from ...`, etc.). The path-with-or-without-extension is orthogonal — both render whichever the resolver returns. No QuickPick changes needed.
- **`allowImportingTsExtensions: true` interaction with NodeNext detection.** TypeScript 5.0+ flag that allows `.ts` extensions on imports even with `moduleResolution: NodeNext`. Common with Bun / tsx / modern Deno workflows that keep a NodeNext-style `tsconfig` for type-checking. **Current design misfires:** signal #3 catches NodeNext and rewrites `.ts` → `.js`, but the user actually wants `.ts` preserved. **Mitigation options:** (a) honour the flag by adding a one-clause check inside signal #3 — if `moduleResolution: NodeNext` AND `allowImportingTsExtensions: true`, return Deno-style semantics (preserve, no rewrite). (b) leave to explicit `"always"` override — zero implementation cost. Lean toward (a) when implementing Phase 1+2; the check is cheap (file already being read) and prevents the edge-case misfire.

## See also

- [`../CRITERIA.md`](../CRITERIA.md) — long-lived rubric; this feature is behavior-detection rather than a picker-registry entry, so most criteria don't directly apply. Criterion 6 (Modern best practice) supports the direction.
- [`../spec/statements.md`](../spec/statements.md) — the shipped per-language picker spec; the current boolean `preserveScriptFileExtension` is documented as shipped behavior there.
- [`../spec/CLAUDE.md`](../spec/CLAUDE.md) — the cross-cutting shipped-behavior model, including which shapes never regress with `false` and the setting-controlled-vs-hardcoded distinction.
- [`../decisions/statements.md`](../decisions/statements.md) — defers the flip-to-`true` decision and flags the NodeNext rewriting gap.
- `src/config/settings.ts` — current `AUTO_IMPORT_CONFIG` map. The `'script' / 'preserve'` alias would gain a tri-state value.
- `src/snippets/languages/javascript.ts`, `src/snippets/languages/typescript.ts` — current consumers of `preserveScriptFileExtension` via `getAutoImportSetting('script', 'preserve')`. Both call sites would route through the new resolver. (`src/snippets/variants.ts`, `src/snippets/_react.ts`, and `src/snippets/languages/framework-component.ts` read the same boolean for their asset/script buckets.)
- `src/path/extension.ts` — current pure path-extension helpers. New detection module would live alongside these (or in `editor/` if `vscode.workspace.fs` is required).
