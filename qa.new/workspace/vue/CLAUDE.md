# qa.new/workspace/vue/CLAUDE.md

Fixtures for `checklists/vue.md` — the `.vue` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `vue.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `vue.md`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Script sources to copy/drag FROM + the primary paste/drop destination (`App.vue`). **All four** script exts route to the TypeScript arm: `model.ts`/`Widget.tsx` (`.ts`/`.tsx`) **and** `helper.js`/`Card.jsx` (`.js`/`.jsx`) all render the TS named shape — there is **no** JS arm for `.vue`. `components/Widget.tsx` is the nested §7.2 source. `.vue` has Angular-only smart-id, so `src/angular/` (suffix → PascalCase, fires for all four exts) and `src/classes/` (the no-fill counter-case) exist. |
| `assets/` | Non-script sources. **`.vue` is allow-list**, so this dir holds **both** the 8 *accepted* non-script sources (each a fixed shape) **and** the 9 *gated-out reject* fixtures (`page.mdx`, `Widget.svelte`, `Layout.astro`, `global.css`, `theme.scss`, `page.html`, `notes.md`, `font.woff2`, `manual.pdf`). `vue.md` co-locates the rejects here, so there is **no `rejected/` dir** (the divergence from `javascript/`/`css/`/`scss/`/`html/`/`markdown/`). |
| `destinations/` | Pre-filled `.vue` files for SFC `<script>`-block placement tests. Each has specific content (script blocks, imports, comments) that the checklist expects, with exact insertion line numbers. **Undo after each paste** so the file returns to its expected state. |

## Fixture content expectations

- **`src/angular/*`** — content **matters**: these files must **NOT** contain `export class`. They exercise the Angular-suffix path (style-0 `generateAngularLegacyImportName`), which derives the identifier from the **filename suffix**, not the file body. Each carries a non-class `export const …`. `widget.component.js` is the `.js`-source case (Angular suffix on a `.js` source → **still** PascalCase, because all four script exts route to the TS builder — the `.vue` ≠ `.tsx`/`.mdx` distinction, §5.8). `2fa.service.ts` derives an illegal identifier (leading digit) → bare `$1` (§5.10).
- **`src/classes/event-bus.ts`** — content **matters**: it must contain `export class EventBus`. This proves the `.vue` builder **never** calls `readExportedClassName` — the import is still a bare `$1`, the signature `.vue` ≠ `.ts` case (§5.7). The builder is invoked one-arg (no `detectedImportName`), so no exported-class fill ever happens.
- **Other `src/*`** — content is irrelevant. The TS arm emits a bare `$1` for any non-Angular source regardless of bytes; these are minimal valid stubs.
- **`assets/*`** — content is irrelevant; the import shape (or the reject) keys on the file **extension**, not the bytes. Binary-type files (`logo.png`, `clip.mp4`, `theme.mp3`, `font.woff2`, `manual.pdf`) are empty placeholders; the text assets carry a one-line stub for readability only. `BaseButton.vue` is a `.vue` source that is **asset-routed** (named-default `${1:name}`), not script-routed — the `.vue`→`.vue` quirk (§10.3).
- **`destinations/*`** — content matters and is **byte-verbatim from `vue.md`** (§6 + §10). The checklist specifies exact file contents and expected insertion line numbers; do not change these files without updating the checklist. The `import { Header } from '../src/Header';` / `Footer` lines are inert textual scan-bait for the Bottom-placement scan — they need not resolve, so there is **no** `src/Header.*` or `src/Footer.*`.
