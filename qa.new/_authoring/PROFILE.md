# PROFILE.md — destination profile table (the IR)

> **Status: skeleton.** The structure below is laid down; the per-destination
> **values are empty**. Session 2 (`populate-profile`) fills every field by reading
> the extension source, after which the IR is frozen and reviewable. Do **not**
> generate any checklist against this file until Session 2 has landed.

The intermediate representation the whole pipeline compiles from:

```
source code  →  PROFILE.md (IR)  →  ../checklists/{lang}.md (output)
                     ↑
              human-reviewed, frozen
```

One row per destination — **12 destinations**: `.ts` `.js` `.jsx` `.tsx` `.mdx`
`.css` `.scss` `.html` `.md` `.vue` `.svelte` `.astro`. (`.tsx` and `.mdx` are
separate rows even though `.mdx` is byte-identical to `.tsx`.) Each row carries
**six fields**. Everything a generator needs must be derivable from these fields: if
a checklist behavior has no home in a field below, the field is incomplete.

## Field index

| Field | What it encodes |
|-------|-----------------|
| `gating` | Same-extension-only, allow-list cross-import, or accept-all? Which `*_SUPPORTED_EXTENSIONS` table (if any) applies? |
| `styles` | Single style table, source-type dispatch, or source-extension dispatch — and the branch→shape map, including fixed/hardcoded shapes that live in no options table |
| `smartId` | Exported-class detection and/or Angular legacy PascalCase — and which styles they affect |
| `defaultStyle` | The default style index **and** its rendered output string |
| `placement` | How the Top/Bottom/Cursor setting is honored, the insertion column, and any container the import is clamped inside |
| `pathQuirks` | Extension-preservation namespace + special path normalization |

## Populated by reading the extension source code

Session 2 fills each field from these source-of-truth files:

| Field | Source files |
|-------|--------------|
| `gating` + `SOURCE_UNIVERSE` | `src/gating.ts`, `src/constants/extensions.ts`, `src/types/file-extension.ts` |
| `styles` + fixed asset shapes | `src/snippets/variants.ts`, `src/snippets/dispatch.ts`, `src/snippets/_styles.ts`, `src/snippets/_react.ts`; source-ext→branch map from `src/path/import-type.ts` |
| `smartId` | `src/snippets/languages/typescript.ts`, `src/snippets/_class-name.ts`, `src/snippets/variants.ts` |
| `defaultStyle` | `package.json` (`contributes.configuration` enums + `default`) |
| `placement` | `src/editor/placement.ts`, `src/editor/insert-snippet.ts` |
| `pathQuirks` | `src/snippets/languages/{scss,css,html,markdown}.ts` |

---

## Source universe (shared, frozen)

The closed `FileExtension` set every destination's `gating` reject column
complements, grouped with literal members (script / framework / stylesheet / html /
markdown / image / media / text-track / data / fonts / document).

**_Empty — populated in Session 2 from `src/types/file-extension.ts` +
`src/constants/extensions.ts`._**

## `gating` per destination

Three kinds: same-only · allow-list cross-import · accept-all.

**_Empty — populated in Session 2._**

## `styles` per destination

Dispatch structure (single table / source-type / source-extension) + the
fixed/hardcoded asset shapes that live in no options table.

**_Empty — populated in Session 2._**

## `smartId` per destination

Exported-class detection and/or Angular legacy PascalCase, and which styles each
affects.

**_Empty — populated in Session 2._**

## `placement` per destination

Mode (generic / stylesheet / inline-url / forced-cursor / astro-frontmatter /
sfc-script), insertion column, container, comment adjustment.

**_Empty — populated in Session 2._**

## `pathQuirks` per destination

Extension-preservation namespace(s) + special path normalization.

**_Empty — populated in Session 2._**

## `defaultStyle` per destination

Default style index + its rendered output string.

**_Empty — populated in Session 2._**
