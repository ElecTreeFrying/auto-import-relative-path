# qa.new/workspace/mdx/CLAUDE.md

Fixtures for `checklists/mdx.md` — the `.mdx` destination checklist.

## Sync rule

- **Checklist is the source of truth.** If `mdx.md` references a fixture path, that file must exist here. After editing the checklist, verify this directory has every referenced path.
- **Workspace changes don't update the checklist.** Extra files can exist here without appearing in `mdx.md`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Script sources to copy/drag FROM + the primary paste/drop destination (`Page.mdx`). `Widget.tsx`/`model.ts` are `.ts`/`.tsx` sources → the TS **primary** arm; `helper.js`/`Card.jsx` are `.js`/`.jsx` sources → the JS **fallback** arm; `components/Card.tsx` is the nested §7.3 source. Like `tsx/` (and unlike `jsx/`), `.mdx` has Angular-only smart-id, so `src/angular/` (suffix → PascalCase) and `src/classes/` (the no-fill counter-case) **do** exist here. |
| `assets/` | One non-script source per `SOURCE_UNIVERSE` category (image, document, framework, html, `.mdx`, markdown, data, CSS-module, stylesheet, font, video, audio, text-track). **`.mdx` is accept-all**, so every one is *accepted* with a fixed shape — there is **no `rejected/` dir**. |
| `destinations/` | Pre-filled `.mdx` (+ one `.tsx`) files for placement tests. Each has specific content (imports, comments, Markdown body) that the checklist expects, with exact insertion line numbers. **Undo after each paste** so the file returns to its expected state. |

## Fixture content expectations

- **`src/angular/*`** — content **matters**: these files must **NOT** contain `export class`. They exercise the Angular-suffix path (style-0 `generateAngularLegacyImportName`), which derives the identifier from the **filename suffix**, not the file body. Each carries a non-class `export const …`. `widget.component.js` is the `.js`-source counter-case (Angular suffix, but JS-fallback → no PascalCase).
- **`src/classes/event-bus.ts`** — content **matters**: it must contain `export class EventBus`. This proves the `.mdx` builder **never** calls `readExportedClassName` — the import is still a bare `$1`, the signature `.mdx` ≠ `.ts` case (§5.7). Mirrors the `workspace/typescript/src/classes/` precedent.
- **Other `src/*`** — content is irrelevant. The TS-primary / JS-fallback arms emit a bare `$1` for any non-Angular source regardless of bytes; these are minimal valid stubs. `Page.mdx` (the paste destination) is a free `# Page` stub.
- **`assets/*`** — content is irrelevant; the import shape keys on the file **extension**, not the bytes. Binary-type files (`logo.png`, `manual.pdf`, `font.woff2`, `clip.mp4`, `theme.mp3`) are empty placeholders; the text assets carry a one-line stub for readability only.
- **`destinations/*`** — content matters and is **byte-verbatim from `mdx.md`** (§6 + §10). The checklist specifies exact file contents and expected insertion line numbers; do not change these files without updating the checklist. Note these bodies are **NOT** copied from `tsx/`: `.mdx` fixtures use a Markdown `# Page` body where `.tsx` used `export const Page = () => null;`. `leading-star.mdx` is **byte-identical** to `leading-star.tsx` — the only-difference-is-`isMarkdownDestination` proof (§10.1); keep them in lockstep. The `import { Header } from '../src/Header';` / `Footer` lines are inert textual scan-bait for the Bottom-placement scan — they need not resolve, so there is no `src/Header.*` or `src/Footer.*`.
