# 20 — Paste into MDX

Validates the `.mdx` destination via the React import algorithm shared with TSX. MDX falls through to `tsx.buildSnippet(info)` in `src/snippets/dispatch.ts:24-25`, which calls `_react.ts:buildReactImport` with the same primary/fallback configuration as TSX.

**Sources:**
- `src/snippets/dispatch.ts:24-25` — `.mdx` case falls through to `tsx.buildSnippet`
- `src/snippets/languages/tsx.ts` — `buildReactImport({ primaryExtensions: ['.ts', '.tsx'], fallbackExtensions: ['.js', '.jsx'] })`
- `src/snippets/_react.ts` — `buildReactImport`: primary/fallback routing + hardcoded non-script switch
- `src/constants/extensions.ts` — `.mdx` in `CROSS_IMPORT_DESTINATIONS` (no per-destination gating clause)
- `src/config/settings.ts` — `preserveScriptFileExtension`, `typescriptImportStyle`, `javascriptImportStyle`

## Prerequisites

- `00-setup.md` complete
- `01-sanity-and-keybindings.md` passed

## Setup

- Extension Development Host with `qa/workspace/` open
- Open `docs/example.mdx` as the destination (active editor)
- Default settings (`typescriptImportStyle = import { name } from '…';`, `javascriptImportStyle = import name from '…';`, `preserveScriptFileExtension = false`)
- `placement = Cursor` for predictability

## Gating — MDX accepts everything via CROSS_IMPORT_DESTINATIONS

`.mdx` is in `CROSS_IMPORT_DESTINATIONS` and has no per-destination gating clause (unlike HTML, MD, CSS, SCSS, Vue, Svelte, Astro). So EVERY extension that doesn't produce an empty snippet is accepted. The only rejections come from the snippet builder's `default:` branch returning empty.

- [ ] **Negative case — unsupported source.** Copy `unsupported/texture.bmp`. Paste into `docs/example.mdx`.
  **Expect:** `Auto Import: Cannot import .bmp into .mdx files.` (`.bmp` not in any `_react.ts` switch case → empty snippet → clause 11.)

## Primary script sources — TypeScript import style

`.ts` and `.tsx` sources route through `buildTypeScriptImportSnippet`. The configurable `typescriptImportStyle` setting applies. Extension stripping respects `preserveScriptFileExtension`.

- [ ] **`.ts` source (default TS style).** Copy `src/foo.ts` → paste.
  **Expect:** `import { $1 } from './foo';` (extension stripped, TS named import).

- [ ] **`.tsx` source.** Copy `src/widget.tsx` → paste.
  **Expect:** `import { $1 } from './widget';` (extension stripped).

- [ ] **TS style override.** Set `typescriptImportStyle` to `import name from '_relativePath_';`. Copy `src/foo.ts` → paste.
  **Expect:** `import $1 from './foo';` (default import shape, extension stripped).

- [ ] **`preserveScriptFileExtension = true` for TS source.** Enable. Copy `src/foo.ts` → paste.
  **Expect:** `import { $1 } from './foo.ts';` (extension preserved). Reset setting.

## Fallback script sources — JavaScript import style

`.js` and `.jsx` sources route through `buildJavaScriptImportSnippet`. The configurable `javascriptImportStyle` setting applies.

- [ ] **`.js` source.** Copy `src/sibling.js` → paste.
  **Expect:** `import $1 from './sibling';` (default JS style = default import, extension stripped).

- [ ] **`.jsx` source (JS fallback).** Copy `src/badge.jsx` → paste.
  **Expect:** `import $1 from './badge';` (JS style, extension stripped). `.jsx` is in TSX/MDX fallback list.

- [ ] **JS style override.** Set `javascriptImportStyle` to `import { name } from '_relativePath_';`. Copy `src/sibling.js` → paste.
  **Expect:** `import { $1 } from './sibling';` (named import shape). Reset setting.

- [ ] **`preserveScriptFileExtension = true` for JS source.** Enable. Copy `src/sibling.js` → paste.
  **Expect:** `import $1 from './sibling.js';` (extension preserved). Reset setting.

## Non-script sources — hardcoded React-style imports

Extension is ALWAYS preserved for non-script sources (regardless of `preserveScriptFileExtension`).

### CSS Modules — `import styles from '…'`

CSS Module detection is path-based (`.module.css` or `.module.scss` suffix), checked before the `switch`.

- [ ] **CSS Module.** Copy `styles/theme.module.css` → paste.
  **Expect:** `import ${1:styles} from './styles/theme.module.css';` (cursor on `styles` placeholder).

### Images, data, markup, components — `import name from '…'`

- [ ] **Image (`.png`).** Copy `assets/logo.png` → paste.
  **Expect:** `import ${1:name} from './assets/logo.png';`

- [ ] **JSON data.** Copy `data/config.json` → paste.
  **Expect:** `import ${1:name} from './data/config.json';`

- [ ] **YAML data.** Copy `data/config.yaml` → paste.
  **Expect:** `import ${1:name} from './data/config.yaml';`

- [ ] **HTML source.** Copy `pages/index.html` → paste.
  **Expect:** `import ${1:name} from './pages/index.html';`

- [ ] **Markdown source.** Copy `docs/README.md` → paste.
  **Expect:** `import ${1:name} from './docs/README.md';`

- [ ] **MDX source (self-type).** Copy a different `.mdx` file → paste.
  **Expect:** `import ${1:name} from './<other>.mdx';`

- [ ] **PDF document.** Copy `docs/report.pdf` → paste (if fixture exists).
  **Expect:** `import ${1:name} from './<path>.pdf';`

- [ ] **Vue component.** Copy `src/App.vue` → paste.
  **Expect:** `import ${1:name} from './src/App.vue';`

- [ ] **Svelte component.** Copy `src/App.svelte` → paste.
  **Expect:** `import ${1:name} from './src/App.svelte';`

- [ ] **Astro component.** Copy `src/App.astro` → paste.
  **Expect:** `import ${1:name} from './src/App.astro';`

### Media and text-track — `import url from '…'`

- [ ] **Video (`.mp4`).** Copy `assets/clip.mp4` → paste.
  **Expect:** `import ${1:url} from './assets/clip.mp4';`

- [ ] **Audio (`.mp3`).** Copy `assets/sound.mp3` → paste.
  **Expect:** `import ${1:url} from './assets/sound.mp3';`

- [ ] **Text track (`.vtt`).** Copy `assets/subtitles.vtt` → paste.
  **Expect:** `import ${1:url} from './assets/subtitles.vtt';`

### Fonts and non-module stylesheets — `import '…'` (side-effect)

- [ ] **Font (`.woff2`).** Copy `assets/font.woff2` → paste.
  **Expect:** `import './assets/font.woff2';` (no binding, side-effect only).

- [ ] **Stylesheet (`.css`, non-module).** Copy `styles/global.css` → paste.
  **Expect:** `import './styles/global.css';` (side-effect — non-module CSS/SCSS uses bare import).

- [ ] **SCSS (non-module).** Copy `styles/main.scss` → paste.
  **Expect:** `import './styles/main.scss';` (side-effect).

## Same-file rejection

- [ ] **MDX into itself.** Copy `docs/example.mdx`. Paste into `docs/example.mdx`.
  **Expect:** `Auto Import: A file cannot import itself.`

## Known limitations / not bugs

- MDX and TSX share identical import behavior. Any difference observed between them is a bug.
- No class-name detection for MDX destinations (only `.ts` destinations get class detection per `dispatch.ts`).
- No Angular legacy auto-fill for MDX (only `.ts` destinations per SPEC).

## Sign-off

- [ ] Primary TS sources (`.ts`, `.tsx`) use TS import style (3 cases)
- [ ] Fallback JS sources (`.js`, `.jsx`) use JS import style (2 cases)
- [ ] Style overrides work for both TS and JS (2 cases)
- [ ] `preserveScriptFileExtension` works for script sources (2 cases)
- [ ] Non-script hardcoded imports: CSS Modules, images, data, markup, media, fonts, stylesheets (12+ cases)
- [ ] Unsupported source rejected (1 case)
- [ ] Same-file rejection (1 case)

Tester / date: ___________________
