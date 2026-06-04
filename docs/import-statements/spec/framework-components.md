# Framework Components — Specification (v1)

> **Status:** Shipped. **Code:** `src/snippets/languages/framework-component.ts`, `src/snippets/dispatch.ts`, `src/snippets/_react.ts`, `src/gating.ts`, `src/editor/placement.ts`, `src/editor/insert-snippet.ts`.
> **Why these shapes:** [../decisions/framework-components.md](../decisions/framework-components.md) · **Rubric:** [../CRITERIA.md](../CRITERIA.md) · **Not yet built:** [../future/framework-roadmap.md](../future/framework-roadmap.md)

## Overview

Vue (`.vue`), Svelte (`.svelte`), and Astro (`.astro`) single-file components (SFCs) are import destinations. Each ecosystem's dominant pattern is **default-import-as-component**:

```typescript
import MyComp from './MyComp.vue';     // Vue 3 SFC
import MyComp from './MyComp.svelte';  // Svelte 5 SFC
import MyComp from './MyComp.astro';   // Astro component
```

…then `<MyComp />` in the template / JSX / Astro markup; the ecosystem-specific compiler handles parsing. The import shape is identical across all three.

Because the three destinations share identical default-import-as-component semantics, they collapse into a **single shared builder, `src/snippets/languages/framework-component.ts`** — one `buildSnippet` handles `.vue`, `.svelte`, and `.astro`. `src/snippets/dispatch.ts` routes all three (their `case` arms fall through together to `frameworkComponent.buildSnippet(info)`). `.mdx` is *not* part of this group — it is a React-family extension and falls through to `tsx.ts` in `dispatch.ts`.

All three destinations reuse the **TypeScript picker** (`TYPESCRIPT_IMPORT_OPTIONS`). There is no `script.vueImportStyle` / `script.svelteImportStyle` / `script.astroImportStyle` setting — no new `package.json` ↔ `_styles.ts` ↔ per-language `switch` three-site sync surface. For script sources, the builder defers to `typescript.ts:buildTypeScriptImportSnippet`; for non-script asset sources, it defers to `_react.ts:buildAssetImportStatement` (the single canonical asset switch). Default imports emit `$1` for the placeholder name — no default-import auto-naming exists.

**Scope.** These are the SFC ecosystems that introduce a *new file extension* needing its own gating + dispatch + types. React (`.jsx`/`.tsx`) and Angular (`.ts`) piggyback on existing pickers and are out of scope here. Runtimes that reuse `.tsx`/`.ts` (Solid, Lit, Qwik, Stencil) are out of scope — see the rejection ledger. LSP / tooling integration (Volar, Vetur, Svelte-LSP, Astro-LSP) is also out of scope: this extension generates import statements, not type-checked refactors.

## Vue (`.vue`)

**Accepted sources** (`VUE_SUPPORTED_EXTENSIONS`, gated in `gating.ts:isPairSupported`): `.vue`, `.ts`, `.js`, `.jsx`, `.tsx`, `.json`, `.yml`, `.yaml`, plus `...IMAGE_FILE_EXTENSIONS`, `...MEDIA_FILE_EXTENSIONS`, and `...TEXT_TRACK_FILE_EXTENSIONS` (image / video / audio / text-track spread in lockstep with the React surface). `.md` and `.mdx` are **not** accepted into `.vue` destinations (see decisions). `.vue` is in `CROSS_IMPORT_DESTINATIONS` (so it may import a *different* extension) and in `SCRIPT_FILE_EXTENSIONS` (so insertion forces column 0, matching `.ts`/`.js`).

**Emitted snippet — `.vue` source → `.vue` destination (and any `.ts`/`.tsx` source → `.vue` destination):** the picked TS style applies directly with `${path}` substitution. The TS picker's seven shapes flow through unchanged:

| Resolved TS style | Final `SnippetString` |
|-------------------|----------------------|
| `import name from '_relativePath_';` | `` `import ${1:name} from '${path}';` `` |
| `import { name } from '_relativePath_';` | `` `import { ${1:name} } from '${path}';` `` |
| `const name = await import('_relativePath_');` | `` `const ${1:name} = await import('${path}');` `` |
| `import * as name from '_relativePath_';` | `` `import * as ${1:name} from '${path}';` `` |
| `import '_relativePath_';` | `` `import '${path}';` `` |
| `import type { name } from '_relativePath_';` | `` `import type { ${1:name} } from '${path}';` `` |
| `import { name, type Type } from '_relativePath_';` | `` `import { ${1:name}, type ${2:Type} } from '${path}';` `` |

**Mixed-stack — `.vue` source → `.jsx`/`.tsx`/`.mdx` destination:** falls into the default-import group of `buildAssetImportStatement` (`src/snippets/_react.ts:71`).

| Group | `SnippetString` shape |
|--------|----------------------|
| Default-import-as-component (default-import group) | `` `import ${1:name} from '${path}';` `` |

**Default:** the TS picker default applies (no Vue-specific default).

## Svelte (`.svelte`)

**Accepted sources** (`SVELTE_SUPPORTED_EXTENSIONS`): `.svelte`, `.ts`, `.js`, `.jsx`, `.tsx`, `.json`, `.yml`, `.yaml`, plus `...IMAGE_FILE_EXTENSIONS`, `...MEDIA_FILE_EXTENSIONS`, `...TEXT_TRACK_FILE_EXTENSIONS`. `.md` and `.mdx` are **not** accepted (see decisions). `.svelte` is in `CROSS_IMPORT_DESTINATIONS` and `SCRIPT_FILE_EXTENSIONS`.

`.svelte.ts` / `.svelte.js` companion files (Svelte 5 rune-eligible plain modules) need **no special handling** — `path.parse('foo.svelte.ts').ext` returns `.ts`, so they flow through the existing TS source path *and* TS destination path. There is deliberately no `.svelte.ts` gating entry (one would shadow the natural `.ts` dispatch); a one-line note to that effect lives in the shared `framework-component.ts`.

**Emitted snippet — `.svelte` source → `.svelte` destination (and any `.ts`/`.tsx` source → `.svelte` destination):** the picked TS style applies directly with `${path}` substitution — the same seven shapes as Vue:

| Resolved TS style | Final `SnippetString` |
|-------------------|----------------------|
| `import name from '_relativePath_';` | `` `import ${1:name} from '${path}';` `` |
| `import { name } from '_relativePath_';` | `` `import { ${1:name} } from '${path}';` `` |
| `const name = await import('_relativePath_');` | `` `const ${1:name} = await import('${path}');` `` |
| `import * as name from '_relativePath_';` | `` `import * as ${1:name} from '${path}';` `` |
| `import '_relativePath_';` | `` `import '${path}';` `` |
| `import type { name } from '_relativePath_';` | `` `import type { ${1:name} } from '${path}';` `` |
| `import { name, type Type } from '_relativePath_';` | `` `import { ${1:name}, type ${2:Type} } from '${path}';` `` |

**Mixed-stack — `.svelte` source → `.jsx`/`.tsx`/`.mdx` destination:** falls into the default-import group of `buildAssetImportStatement` (`src/snippets/_react.ts:72`).

| Group | `SnippetString` shape |
|--------|----------------------|
| Default-import-as-component (default-import group) | `` `import ${1:name} from '${path}';` `` |

`.svelte` source → `.vue` destination is not accepted (`.vue` ↔ `.svelte` cross-framework gating is off — see decisions).

**Default:** the TS picker default applies (no Svelte-specific default).

## Astro (`.astro`)

**Accepted sources** (`ASTRO_SUPPORTED_EXTENSIONS`): `.astro`, `.ts`, `.js`, `.jsx`, `.tsx`, **`.vue`**, **`.svelte`**, `.json`, `.yml`, `.yaml`, **`.md`**, **`.mdx`**, plus `...IMAGE_FILE_EXTENSIONS`, `...MEDIA_FILE_EXTENSIONS`, `...TEXT_TRACK_FILE_EXTENSIONS`. `.vue` and `.svelte` are accepted because Astro Islands consume framework-island components; `.md`/`.mdx` are Astro-native (the `astro:content` collections API requires no plugin). `.astro` is in `CROSS_IMPORT_DESTINATIONS` and `SCRIPT_FILE_EXTENSIONS`.

**Emitted snippet — `.astro` source → `.astro` destination (and `.ts`/`.tsx` source → `.astro` destination):** the picked TS style applies directly with `${path}` substitution — the same seven shapes as Vue / Svelte:

| Resolved TS style | Final `SnippetString` |
|-------------------|----------------------|
| `import name from '_relativePath_';` | `` `import ${1:name} from '${path}';` `` |
| `import { name } from '_relativePath_';` | `` `import { ${1:name} } from '${path}';` `` |
| `const name = await import('_relativePath_');` | `` `const ${1:name} = await import('${path}');` `` |
| `import * as name from '_relativePath_';` | `` `import * as ${1:name} from '${path}';` `` |
| `import '_relativePath_';` | `` `import '${path}';` `` |
| `import type { name } from '_relativePath_';` | `` `import type { ${1:name} } from '${path}';` `` |
| `import { name, type Type } from '_relativePath_';` | `` `import { ${1:name}, type ${2:Type} } from '${path}';` `` |

**Astro Islands — `.vue` source → `.astro` destination and `.svelte` source → `.astro` destination:** routed through the same TS-picker dispatch as a regular default import; no new snippet shape — the seven-shape table above applies, and the user's chosen TS style controls the emitted shape.

**Mixed-stack — `.astro` source → `.jsx`/`.tsx`/`.mdx` destination:** falls into the default-import group of `buildAssetImportStatement` (`src/snippets/_react.ts:73`).

| Group | `SnippetString` shape |
|--------|----------------------|
| Default-import-as-component (default-import group) | `` `import ${1:name} from '${path}';` `` |

`.astro` source → `.vue`/`.svelte` destinations are not accepted (Vue/Svelte compilers cannot process `.astro` syntax — see decisions).

**Default:** the TS picker default applies (no Astro-specific default).

## Placement

`.vue`/`.svelte`/`.astro` destinations are in `SCRIPT_FILE_EXTENSIONS`, so insertion is forced to column 0. Two destination-driven overrides constrain *where* the import lands; both honor the user's `Top`/`Bottom`/`Cursor` setting *within* their constrained region. The two implementations duplicate the precedence — the command flow in `insert-snippet.ts` and the drop flow in `placement.ts` — and are kept in sync.

### Astro frontmatter override (`.astro`)

Astro imports must live inside the leading `---`…`---` **frontmatter fence**; outside it is template/HTML where bare `import` statements are syntax errors. For `.astro` destinations, insertion is constrained to within the fence via `insertSnippetAtAstroFrontmatter` (command flow, `insert-snippet.ts`) and `computeAstroPlacement` (drop flow, `placement.ts`). `findAstroFrontmatterBounds(lines)` locates both fences by strict trimmed equality (`line.trim() === '---'`) and returns `null` if fewer than two exist. The placement-routing predicate is `destinationFileExt === '.astro'`, checked directly in both `insertImportSnippet` and `computeImportPlacement` (after the `shouldRepositionCursor` branch).

Within an existing fence, the user's setting is honored:

- **Top** — inserts after the opening `---`.
- **Bottom** — scans the frontmatter region for `IMPORT_INDICATORS` and inserts after the last match (falls back to after the opening `---`).
- **Cursor** — inserts at the cursor line if it is inside the fences; otherwise falls back to Bottom.

If no frontmatter exists (empty `.astro` file or template-only file), all three modes converge and **synthesize the fence** — wrapping the import in a new `---`…`---` block at line 0. Column rule: column 0 (via `SCRIPT_FILE_EXTENSIONS` membership).

The Astro override and the HTML/Markdown forced-cursor override are mutually exclusive — no `.astro` overlap with the branches `shouldRepositionCursor` handles.

### Vue/Svelte SFC-script override (`.vue`/`.svelte`)

For `.vue`/`.svelte` destinations, insertion is constrained to within a `<script…>`/`</script>` pair via `insertSnippetAtSfcScript` (command flow) and `computeSfcPlacement` (drop flow). `findSfcScriptBounds` prefers `<script setup`, then the instance `<script` (no `context=`), then any `<script`; if no script block exists it synthesizes a `<script>`/`</script>` pair at line 0. Placement mirrors Astro: **Top** inserts after the opening tag; **Bottom** scans the block for `IMPORT_INDICATORS` (falls back to after the opening tag); **Cursor** inserts at the cursor line if inside the block, otherwise falls back to Bottom.

### Import markers

`IMPORT_INDICATORS` (defined in `src/editor/placement.ts`) already cover Vue / Svelte `<script>` blocks and Astro frontmatter — all use bare `import ` statements. No marker additions are required for framework components.

## Naming

Default imports emit the `$1` placeholder for the component name. The legacy-Angular index-0 auto-naming in `typescript.ts:generateAngularLegacyImportName` fires only on *named* imports (index 0, `import { name } from …`) for `.component`/`.directive`/`.pipe`/`.service`/`.module` basenames — it cannot drive default imports, so it does not produce PascalCase component names for SFCs. PascalCase auto-naming for default imports is deferred (see [../future/framework-roadmap.md](../future/framework-roadmap.md)).

## Behavior

- **Extension handling.** Script sources respect the `script.preserveScriptFileExtension` boolean (default `false`) — the shared builder appends the source extension only when the flag is set. Non-script asset sources always carry their full extension on the path (the asset switch keys on it).
- **Gating.** `gating.ts:isPairSupported` is nine-clause; the `.vue`/`.svelte`/`.astro` per-destination allow-list checks are the seventh, eighth, and ninth clauses (`gating.ts:35`/`38`/`41`), each rejecting a source not in the matching `*_SUPPORTED_EXTENSIONS` table. `.jsx`/`.tsx`/`.mdx` destinations have no per-destination filter, which is why they accept `.vue`/`.svelte`/`.astro` sources with no gating change.
- **Media lockstep.** `VUE_/SVELTE_/ASTRO_SUPPORTED_EXTENSIONS` spread `...MEDIA_FILE_EXTENSIONS` and `...TEXT_TRACK_FILE_EXTENSIONS`; media/text-track sources emit the `${1:url}` shape via the asset switch. See [media-files.md](media-files.md).

## Code map

- `src/gating.ts:35`/`38`/`41` — the `.vue`/`.svelte`/`.astro` per-destination gating clauses in `isPairSupported`.
- `src/snippets/dispatch.ts` — `.vue`/`.svelte`/`.astro` `case` arms fall through together to `frameworkComponent.buildSnippet(info)`; `.mdx` → `tsx.ts`.
- `src/snippets/languages/framework-component.ts` — the single shared builder for all three destinations; script sources → `typescript.ts:buildTypeScriptImportSnippet`, non-script sources → `_react.ts:buildAssetImportStatement`.
- `src/snippets/_react.ts:71-73` — `.vue`/`.svelte`/`.astro` `case`s in the default-import group of `buildAssetImportStatement` (mixed-stack into `.jsx`/`.tsx`/`.mdx`).
- `src/constants/extensions.ts` — `VUE_/SVELTE_/ASTRO_SUPPORTED_EXTENSIONS`, plus `.vue`/`.svelte`/`.astro` membership in `CROSS_IMPORT_DESTINATIONS` and `SCRIPT_FILE_EXTENSIONS`.
- `src/editor/placement.ts` — `findAstroFrontmatterBounds`, `computeAstroPlacement`, `findSfcScriptBounds`, `computeSfcPlacement`, `IMPORT_INDICATORS`.
- `src/editor/insert-snippet.ts` — `insertSnippetAtAstroFrontmatter`, `insertSnippetAtSfcScript`.
- `src/types/file-extension.ts` — `FrameworkComponentFileExtension` umbrella (`VueFileExtension | SvelteFileExtension | AstroFileExtension`).
- `src/path/import-type.ts` — `determineImportType` returns `'script'` for `.vue`/`.svelte`/`.astro`.

## See also

- [../decisions/framework-components.md](../decisions/framework-components.md) — why these shapes (Criterion-3 tension, TS-picker reuse, the rejection ledger).
- [../future/framework-roadmap.md](../future/framework-roadmap.md) — designed-but-unbuilt: PascalCase auto-naming and the joint SFC concerns.
- [media-files.md](media-files.md) — media / text-track sources flowing into the framework destination lists in lockstep.
- [../CRITERIA.md](../CRITERIA.md) — the inclusion/rejection rubric.
