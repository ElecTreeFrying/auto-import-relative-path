# Framework Components — Sub-Roadmap (Deferred)

> **Status: DEFERRED — revisit on trigger (no date).** These items were filed as follow-ups during the phased Vue / Svelte / Astro design and remain **unbuilt**. None of them exists in `/src`; the shipped framework surface is specified in [`../spec/framework-components.md`](../spec/framework-components.md). Each item below carries its own revisit trigger.
>
> **future/ vs decisions/.** This file holds designed-but-unbuilt work with implementation intent (it would ship if its trigger fires). Shapes that were *evaluated and declined* — Ember, Marko, Riot, Vue 2, the combined picker, framework auto-detection, the dedicated `*ImportStyle` settings, and the rest — are not here; they live in the rejection ledger at [`../decisions/framework-components.md`](../decisions/framework-components.md) with their own "revisit on demand" triggers.

## Overview

The Vue (Phase 1), Svelte (Phase 2), and Astro (Phase 3) destinations all shipped, collapsed into a single shared `src/snippets/languages/framework-component.ts` builder. The phased design filed follow-up classes that did **not** ship and are still open:

1. **PascalCase auto-naming for default imports** — P1.5 (Vue) / P2.5 (Svelte) / P3.5 (Astro).
2. **Joint SFC concerns** — `.css`/`.scss` sources into framework destinations; `.ts`/`.js` destinations accepting framework sources; `.md`/`.mdx` as sources for Vue/Svelte.

## PascalCase auto-naming for default imports — P1.5 / P2.5 / P3.5

**What it is.** Frameworks recommend PascalCase component identifiers regardless of the on-disk filename: `my-button.vue` → `import MyButton from './my-button.vue';`. PascalCase auto-naming would derive the import identifier from the basename so the user does not have to retype it. This is the framework analogue of the existing Angular auto-naming (`generateAngularLegacyImportName` in `src/snippets/languages/typescript.ts`), which fires on `.component.ts` / `.directive.ts` / `.pipe.ts` / `.service.ts` / `.module.ts` basenames.

**Why deferred — it needs a new index-1 default-import pathway, not the Angular index-0 mechanism.** All three frameworks export components as **defaults**, so the auto-name must land in a *default* import (`import MyButton from '…'`). The existing `generateAngularLegacyImportName` fires only at index 0 — the *named* import shape `import { name } from '…'`. Extending the Angular trigger list to include `.vue` / `.svelte` / `.astro` basenames would produce the wrong shape (a named import where a default import is required). PascalCase auto-naming therefore needs a **new default-import auto-naming pathway** that the index-0 Angular mechanism cannot be reused for. As built, `framework-component.ts` delegates straight to `buildTypeScriptImportSnippet`, which emits `$1` for default imports — no default-import auto-naming exists. (See `src/snippets/CLAUDE.md` and the TypeScript section of [`../decisions/statements.md`](../decisions/statements.md) for the index-0 vs. default-import distinction.)

**Per-ecosystem ROI — Vue > Svelte > Astro.**

- **Vue (P1.5)** — highest ROI. PascalCase is the Vue style guide's strong recommendation, and Vue's on-disk convention is frequently kebab-case (`my-button.vue`), so the auto-name saves real keystrokes.
- **Svelte (P2.5)** — lower ROI. Svelte's on-disk convention is already PascalCase, so the auto-name is a no-op for the majority; the kebab-case minority still benefits. Designed to ship alongside Vue P1.5 on the shared new default-import pathway.
- **Astro (P3.5)** — lower ROI. Astro's on-disk convention is PascalCase, like Svelte. Designed to ship alongside Vue P1.5 / Svelte P2.5.

**Revisit trigger.** Build the shared default-import auto-naming pathway and light up all three ecosystems together; revisit if demand surfaces (a user request, or the default-import pathway being built for another reason).

## Joint SFC concerns

These span all of Vue / Svelte / Astro and were each filed as joint cross-framework concerns.

### `.css` / `.scss` sources into `.vue` / `.svelte` / `.astro` destinations

**What it is.** Pasting a stylesheet source into a framework SFC destination — e.g. `.css` → `.vue`.

**Why deferred — the correct shape is cursor-context-dependent.** The right import shape depends on *where* in the SFC the cursor sits: a side-effect `import '...'` belongs in the `<script>` / frontmatter block, but `@import` / `@use` belongs in a `<style>` block. Without cursor-context shape detection, the framework builder would emit the wrong shape in the `<style>` case. This is a joint concern across all three ecosystems — the framework builder is shared, so any fix lands once for all three.

**Revisit trigger.** Revisit if `<style>`-block pastes surface as a user request.

### `.ts` / `.js` destinations accepting `.vue` / `.svelte` / `.astro` sources

**What it is.** Importing a framework component into a plain `.ts` or `.js` destination — common in framework test files (Vitest, Vue Test Utils) and `customElement` setup code, uncommon elsewhere.

**Why deferred — it's a cross-cutting gating change.** Enabling this requires adding `.ts` / `.js` to `CROSS_IMPORT_DESTINATIONS`, which affects **all** source types, not just framework sources — broader than any single phase's scope. Borderline Criterion 1 (frequency): common in framework test files, uncommon elsewhere.

**Revisit trigger.** Revisit as a cross-cutting concern if demand surfaces.

### `.md` / `.mdx` as sources for `.vue` / `.svelte` destinations

**What it is.** Importing Markdown or MDX into a Vue or Svelte destination (`import Doc from './intro.md';`).

**Why deferred — fails framework-portability without an opinionated plugin choice.** Native Vue and Svelte have no `.md` import semantics: Vue needs `vite-plugin-md` / `unplugin-vue-markdown` and Svelte needs `mdsvex`. Gating Markdown into these destinations without a plugin choice fails Criterion 3 (framework-portable). Astro is the exception — it gets `.md` / `.mdx` natively (`astro:content`), which is why `ASTRO_SUPPORTED_EXTENSIONS` already lists them and only Vue/Svelte are deferred here. `.mdx` for Vue/Svelte additionally carries a Criterion 1 (frequency) penalty — mixed Vue+MDX and Svelte+MDX codebases are rare.

**Revisit trigger.** Revisit per ecosystem on explicit demand. The registry's "Promote to dispatch" exception (basename-based detection) could fire, but only on explicit demand.

## See also

- [`../spec/framework-components.md`](../spec/framework-components.md) — what the framework surface does as shipped (Vue / Svelte / Astro destinations, the shared builder, the placement overrides).
- [`../decisions/framework-components.md`](../decisions/framework-components.md) — the rejection ledger (shapes evaluated and declined) and the locked-in v1 decisions.
- [`../CRITERIA.md`](../CRITERIA.md) — the rubric. Criterion 1 (Frequency) and Criterion 3 (Framework-portable) gate every deferred item above.
- `src/snippets/languages/typescript.ts:generateAngularLegacyImportName` — the index-0 / named-import Angular auto-naming pattern that PascalCase auto-naming **cannot** reuse (it needs a separate default-import pathway).
- `src/snippets/languages/framework-component.ts` — the shared Vue/Svelte/Astro builder that today delegates to `buildTypeScriptImportSnippet` (emits `$1` for default imports).
- `src/constants/extensions.ts` — `CROSS_IMPORT_DESTINATIONS` (the gate the `.ts`/`.js`-accepting-framework-sources concern would have to widen) and the `*_SUPPORTED_EXTENSIONS` tables.
