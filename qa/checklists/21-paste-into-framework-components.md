# 21 — Paste into framework components (Vue / Svelte / Astro)

Validates the `.vue`, `.svelte`, and `.astro` destinations, which share `src/snippets/languages/framework-component.ts`. All script sources (`.ts`, `.tsx`, `.js`, `.jsx`) route through `buildTypeScriptImportSnippet`; all non-script sources also use the TypeScript import builder but with the full source extension always preserved.

**Sources:**
- `src/snippets/dispatch.ts:34-37` — `.vue`, `.svelte`, `.astro` all call `frameworkComponent.buildSnippet`
- `src/snippets/languages/framework-component.ts` — `SCRIPT_SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']`; non-script sources use `buildTypeScriptImportSnippet(relativePath + sourceFileExt)`
- `src/constants/extensions.ts` — `VUE_SUPPORTED_EXTENSIONS`, `SVELTE_SUPPORTED_EXTENSIONS`, `ASTRO_SUPPORTED_EXTENSIONS`
- `src/gating.ts` — clauses 7, 8, 9 (per-destination gating)
- `src/config/settings.ts` — `preserveScriptFileExtension`, `typescriptImportStyle`

## Prerequisites

- [`00-setup.md`](00-setup.md) complete
- [`01-sanity-and-keybindings.md`](01-sanity-and-keybindings.md) passed

## Setup

- Extension Development Host with `qa/workspace/` open
- Default settings (`typescriptImportStyle = import { name } from '…';`, `preserveScriptFileExtension = false`)
- `placement = Cursor` for predictability (avoids Astro frontmatter / Vue+Svelte script block placement rules — those are tested in [`13-settings-placement.md`](13-settings-placement.md))

---

## Vue destination (`.vue`)

Active editor: `src/App.vue`

### Gating — `VUE_SUPPORTED_EXTENSIONS`

Accepts: `.vue`, `.ts`, `.js`, `.jsx`, `.tsx`, `.json`, `.yml`, `.yaml`, 7 images, 7 media, `.vtt`.
Rejects: `.scss`, `.css`, `.html`, `.md`, `.mdx`, `.astro`, `.svelte`, fonts, documents.

- [ ] **Rejected: `.scss`** → Copy `styles/main.scss`. Paste.
  **Expect:** `Auto Import: Cannot import .scss into .vue files.`
- [ ] **Rejected: `.html`** → Copy `pages/index.html`. Paste.
  **Expect:** `Auto Import: Cannot import .html into .vue files.`
- [ ] **Rejected: `.css`** → Copy `styles/global.css`. Paste.
  **Expect:** `Auto Import: Cannot import .css into .vue files.`
- [ ] **Rejected: `.md`** → Copy `docs/README.md`. Paste.
  **Expect:** `Auto Import: Cannot import .md into .vue files.`

### Script sources — TypeScript import style

- [ ] **`.ts` source.** Copy `src/foo.ts` → paste.
  **Expect:** `import { $1 } from './foo';` (extension stripped, TS named import).
- [ ] **`.tsx` source.** Copy `src/widget.tsx` → paste.
  **Expect:** `import { $1 } from './widget';`
- [ ] **`.js` source.** Copy `src/sibling.js` → paste.
  **Expect:** `import { $1 } from './sibling';` (TS style, NOT JS style).
- [ ] **`.jsx` source.** Copy `src/badge.jsx` → paste.
  **Expect:** `import { $1 } from './badge';` (TS style).
- [ ] **`.vue` source (self-type, different file).** Copy a different `.vue` file → paste.
  **Expect:** `import { $1 } from './<other>.vue';` (extension preserved — `.vue` is not a script extension).

### Non-script sources — TypeScript import with extension preserved

- [ ] **Image.** Copy `assets/logo.png` → paste.
  **Expect:** `import { $1 } from './assets/logo.png';` (TS named import, extension preserved).
- [ ] **JSON data.** Copy `data/config.json` → paste.
  **Expect:** `import { $1 } from './data/config.json';`
- [ ] **YAML data.** Copy `data/config.yaml` → paste.
  **Expect:** `import { $1 } from './data/config.yaml';`
- [ ] **Video.** Copy `assets/clip.mp4` → paste.
  **Expect:** `import { $1 } from './assets/clip.mp4';`
- [ ] **Audio.** Copy `assets/sound.mp3` → paste.
  **Expect:** `import { $1 } from './assets/sound.mp3';`
- [ ] **Text track.** Copy `assets/subtitles.vtt` → paste.
  **Expect:** `import { $1 } from './assets/subtitles.vtt';`

### Settings interaction

- [ ] **TS style override.** Set `typescriptImportStyle` to `import name from '_relativePath_';`. Copy `src/foo.ts` → paste.
  **Expect:** `import $1 from './foo';` (default import shape). Reset setting.
- [ ] **`preserveScriptFileExtension = true`.** Enable. Copy `src/foo.ts` → paste.
  **Expect:** `import { $1 } from './foo.ts';` (extension preserved for script). Reset setting.
- [ ] **`preserveScriptFileExtension` does NOT affect non-script.** Enable. Copy `assets/logo.png` → paste.
  **Expect:** `import { $1 } from './assets/logo.png';` (extension always preserved for non-script regardless). Reset setting.

---

## Svelte destination (`.svelte`)

Active editor: `src/App.svelte`

### Gating — `SVELTE_SUPPORTED_EXTENSIONS`

Identical to Vue's gating table except `.svelte` replaces `.vue`.
Accepts: `.svelte`, `.ts`, `.js`, `.jsx`, `.tsx`, `.json`, `.yml`, `.yaml`, 7 images, 7 media, `.vtt`.
Rejects: `.scss`, `.css`, `.html`, `.md`, `.mdx`, `.astro`, `.vue`, fonts, documents.

- [ ] **Rejected: `.scss`** → Copy `styles/main.scss`. Paste.
  **Expect:** `Auto Import: Cannot import .scss into .svelte files.`
- [ ] **Rejected: `.vue`** → Copy `src/App.vue`. Paste.
  **Expect:** `Auto Import: Cannot import .vue into .svelte files.`

### Script sources

- [ ] **`.ts` source.** Copy `src/foo.ts` → paste.
  **Expect:** `import { $1 } from './foo';` (TS named import, extension stripped).
- [ ] **`.js` source.** Copy `src/sibling.js` → paste.
  **Expect:** `import { $1 } from './sibling';` (TS style).
- [ ] **`.svelte` source (self-type, different file).** Copy a different `.svelte` file → paste.
  **Expect:** `import { $1 } from './<other>.svelte';` (extension preserved).

### Non-script sources

- [ ] **Image.** Copy `assets/logo.png` → paste.
  **Expect:** `import { $1 } from './assets/logo.png';`
- [ ] **JSON.** Copy `data/config.json` → paste.
  **Expect:** `import { $1 } from './data/config.json';`

---

## Astro destination (`.astro`)

Active editor: `src/App.astro`

### Gating — `ASTRO_SUPPORTED_EXTENSIONS`

Broader than Vue/Svelte: also accepts `.vue`, `.svelte`, `.md`, `.mdx`.
Accepts: `.astro`, `.ts`, `.js`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.json`, `.yml`, `.yaml`, `.md`, `.mdx`, 7 images, 7 media, `.vtt`.
Rejects: `.scss`, `.css`, `.html`, fonts, documents.

- [ ] **Rejected: `.scss`** → Copy `styles/main.scss`. Paste.
  **Expect:** `Auto Import: Cannot import .scss into .astro files.`
- [ ] **Rejected: `.css`** → Copy `styles/global.css`. Paste.
  **Expect:** `Auto Import: Cannot import .css into .astro files.`
- [ ] **Rejected: `.html`** → Copy `pages/index.html`. Paste.
  **Expect:** `Auto Import: Cannot import .html into .astro files.`

### Astro-specific accepted sources (not in Vue/Svelte)

- [ ] **`.vue` source.** Copy `src/App.vue` → paste.
  **Expect:** `import { $1 } from './App.vue';` (TS style, extension preserved — `.vue` is non-script).
- [ ] **`.svelte` source.** Copy `src/App.svelte` → paste.
  **Expect:** `import { $1 } from './App.svelte';`
- [ ] **`.md` source.** Copy `docs/README.md` → paste.
  **Expect:** `import { $1 } from './docs/README.md';`
- [ ] **`.mdx` source.** Copy `docs/example.mdx` → paste.
  **Expect:** `import { $1 } from './docs/example.mdx';`
- [ ] **`.astro` source (self-type, different file).** Copy a different `.astro` file → paste.
  **Expect:** `import { $1 } from './<other>.astro';`

### Script sources

- [ ] **`.ts` source.** Copy `src/foo.ts` → paste.
  **Expect:** `import { $1 } from './foo';` (TS named import, extension stripped).
- [ ] **`.js` source.** Copy `src/sibling.js` → paste.
  **Expect:** `import { $1 } from './sibling';` (TS style).

### Non-script sources (shared with Vue/Svelte)

- [ ] **Image.** Copy `assets/logo.png` → paste.
  **Expect:** `import { $1 } from './assets/logo.png';`
- [ ] **JSON.** Copy `data/config.json` → paste.
  **Expect:** `import { $1 } from './data/config.json';`
- [ ] **YAML.** Copy `data/config.yaml` → paste.
  **Expect:** `import { $1 } from './data/config.yaml';`

---

## Same-file rejection (all three)

- [ ] **Vue.** Copy `src/App.vue`. Paste into `src/App.vue`.
  **Expect:** `Auto Import: A file cannot import itself.`
- [ ] **Svelte.** Copy `src/App.svelte`. Paste into itself.
  **Expect:** same toast.
- [ ] **Astro.** Copy `src/App.astro`. Paste into itself.
  **Expect:** same toast.

## Known limitations / not bugs

- All three destinations use the **TypeScript import style** for ALL sources (script and non-script). There is no separate JS import style for `.js`/`.jsx` sources in framework components (unlike TSX/MDX which has a JS fallback).
- Non-script sources always preserve the full extension — `preserveScriptFileExtension` only affects the 4 script extensions.
- Placement rules (Astro frontmatter, Vue/Svelte script block) are tested in [`13-settings-placement.md`](13-settings-placement.md), not here.

## Sign-off

- [ ] Vue gating — rejections (4 cases)
- [ ] Vue script sources with TS style (5 cases)
- [ ] Vue non-script sources with extension preserved (6 cases)
- [ ] Vue settings interaction (3 cases)
- [ ] Svelte gating — rejections (2 representative cases)
- [ ] Svelte script + non-script (5 cases)
- [ ] Astro gating — rejections (3 cases)
- [ ] Astro-specific accepted sources: .vue, .svelte, .md, .mdx, .astro (5 cases)
- [ ] Astro script + non-script (5 cases)
- [ ] Same-file rejection (3 cases)

Tester / date: ___________________
