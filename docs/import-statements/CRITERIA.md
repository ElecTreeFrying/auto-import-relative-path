# Import Statements — Inclusion Criteria

> **Status: LIVING — the rubric.** Update when the rubric itself shifts (a new criterion, a new tiebreaker, a ceiling adjustment), not for per-shape decisions. This is the finalized official version of the strategy/working corpus.

The rubric for deciding which import-statement shapes ship in the picker for any language/destination this extension supports. Use this doc when:

- Proposing a new shape (PR review).
- Triaging an upstream change (TC39 stage promotion, Sass deprecation, framework default flip).
- Deciding whether to prune an existing legacy entry.

[`spec/statements.md`](spec/statements.md) is the shipped picker snapshot (the picker contents as shipped); [`decisions/statements.md`](decisions/statements.md) is the durable *application* of these criteria — why each shape is in or out. **This doc is the long-lived rubric**; the spec is the authoritative shipped snapshot and the decisions ledger is the rationale.

---

## Inclusion criteria

A shape qualifies if it hits **at least one** of the following — ideally multiple. Single-hit shapes need a high-confidence signal; multi-hit shapes are easy yeses.

> **Criterion weighting (not all six are equal).** **C1 (Frequency)** and **C3 (Framework-portable)** are the *dispositive* admission gates; C2 (Standards-current), C4 (Single-path-paste fit), and C6 (Modern best practice) mostly corroborate multi-hits. A shape that passes 4 or 5 of the six still dies on a single failed C1 or C3 — e.g. Sass `@use … with` (fails C1: niche import-form), `fetchpriority` (fails C1), `.wasm` (fails C1/C3). Read the six as one gate (C1∧C3) plus four corroborators, not as six equal votes.

### 1. Frequency

Used in 30%+ of modern codebases in the target language **as a paste-import shape**. Indicators:

- Searchable in popular open-source repos (Vite/Next/Remix React apps, Node services, modern Sass codebases).
- Listed as the "common pattern" in framework docs.
- *Negative* signal: ESLint defaults / `@typescript-eslint/recommended` flag it.

**Feature vs. import-form:** A feature can be mainstream while its specific paste-import form is not. CSS cascade layers ship Baseline 2022 and are increasingly common as **block declarations** (`@layer name { ... }` inside own CSS) — but the cross-file **import-with-layer** form (`@import url('foo') layer(name);`) remains niche even in cascade-layer-heavy codebases. Track Frequency on the import form, not the underlying feature. See the worked example below.

**Use-case-exists vs. paste-frequency:** A real use case in some workflow doesn't pass Frequency on its own. Set-once destinations (`index.html` is configured at project init, rarely re-edited later), dev-server-only behaviors (Vite transforms `.tsx` from `<script src>` but production references `.js`), and niche toolchain combinations produce real-but-low-frequency situations. Ask "how often do users paste *this source extension* into *this destination*?", not "does this combination work somewhere?". See the worked example below.

**Example:** `import React, { useState } from 'react'` — universal in modern React. Pass.
**Counter:** `import { default as Name } from '...'` — almost never written as an *import* (its real use case is re-export). Fail.

### 2. Standards-current

In the current language/framework spec or stable-stage proposal. Indicators:

- TC39 Stage 3+ shipping in V8 / SpiderMonkey / JavaScriptCore.
- TypeScript ≥ 3.8 for `import type`, ≥ 4.5 for inline `type` modifier.
- Sass team marks it recommended in the module-system docs.
- W3C spec or browser-vendor MDN baseline.

**Example:** `import type { Foo } from '...'` (TS 3.8+) — spec-current, broadly shipped. Pass.
**Counter:** `import x from '...' assert { type: 'json' }` — Stage 3 form superseded by `with` syntax. Fail.

### 3. Framework-portable

Works in every major toolchain for that language:

- JS: Node, Bun, Deno, Vite, Webpack, esbuild, Parcel.
- TS: `tsc`, `tsx`, Vite, Next.js, Remix.
- CSS-in-JSX: CRA, Vite, Next.js, Remix, Webpack asset modules.
- SCSS: `dart-sass` (the only actively maintained impl).

**Example:** `import logo from './logo.svg'` (default-import-as-URL) — works in CRA, Vite, Next, Webpack asset modules. Pass.
**Counter:** `import { ReactComponent as Logo } from './logo.svg'` — CRA-only, deprecated 2023. Fail.

### 4. Single-path-paste fit

Exactly one path in, exactly one snippet out. The extension's whole model is "paste this file".

**Example:** `<img src="..." width="" height="">` — one path, three placeholders for user input. Pass.
**Counter:** `<picture><source srcset="path1, path2"/></picture>` — needs multiple paths. Fail.

### 5. User-picks-a-style fit

The shape applies to *every* source type in the picker for that destination — not just one source extension. The user shouldn't have to know "this shape only works if I'm pasting a `.json`".

**Example:** `import name from '_relativePath_';` — applies to any source type a JS destination supports. Pass.
**Counter:** `import json from '...' with { type: 'json' }` — applies only to `.json` sources. Fail (source-type-conditional).

**Exception — promotion to dispatch.** Source-type-conditional shapes that hit Correctness (see Tiebreakers) get promoted to the per-language dispatch (e.g. the hardcoded asset switch `buildAssetImportStatement` in `src/snippets/_react.ts` for JSX/TSX/MDX) instead of the picker. That's not "picker bloat", it's "smarter default". CSS Modules detection is the canonical case. See the named pattern **Promote-to-dispatch (Criterion 5 exception)** below.

### 6. Modern best practice

A standards body, browser vendor, accessibility authority, or platform team recommends it:

- web.dev / Lighthouse audit (Core Web Vitals).
- ESLint default / `@typescript-eslint/recommended`.
- TypeScript team / Sass team / V8 blog.
- W3C ARIA / accessibility guidelines.

**Example:** `<img width="" height="">` — prevents CLS, a Core Web Vital. Pass.
**Counter:** `<script type="text/javascript">` — redundant in HTML5; kept only as legacy back-compat.

---

## Rejection criteria

A shape is rejected if **any one** applies. Override only with explicit reasoning in the decisions ledger.

### A. Deprecated by the spec owner

- Sass `@import` (deprecated 2022) — demoted, not removed (back-compat).
- `assert { type: 'json' }` (TC39, superseded by `with`) — never added.
- `<script type="text/javascript">` (HTML5 redundant) — kept legacy; default flipped.

### B. Bundler/framework-specific

- CRA's `?react`-style SVG import.
- Vite's `?raw` raw-loader import.
- Webpack's `!loader!path` syntax.

A shape that needs a specific bundler config belongs in that bundler's own snippet pack, not this picker.

### C. Different feature wearing the same syntax

- `<link rel="preload">` / `<link rel="modulepreload">` — resource hints, not imports.
- `import.meta.url` — runtime URL, not a static import.
- Deprecated HTML imports — not a relative-path import.

If the syntax happens to fit but the semantics are unrelated, reject.

> **Named sub-rule — "a parser accepting a token ≠ a feature backs it."** That a CSS parser swallows a `url()` pointing at a video, or that Markdown lets you drop a media reference inline, does not mean the language *supports* importing that asset there. The relevant question is whether the destination language has a first-class consumption story for the source, not whether the syntax round-trips through the parser. (Worked instances: CSS `background: url(video)`, Markdown-native media embeds — both rejected under this sub-rule, see [decisions/media-files.md](decisions/media-files.md).)

> **Named sub-rule — "wrong signal-content."** Some files near the source tree describe *the dependency graph*, not *how a consumer imports a file*. Lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `bun.lock`) and Bun/tool config describe what's installed and how it resolves — they're never the thing a user pastes to author an import statement. A shape derived from that signal is reading the wrong content. (See [future/auto-detect-extensions.md](future/auto-detect-extensions.md).)

### D. Source-type-conditional (without dispatch promotion)

See criterion 5's exception. If the shape can't be promoted to dispatch (no detectable signal in the source path or extension), reject.

### E. Misleading default

The shape compiles and runs but does something users don't expect.

- `const name = import('...')` makes `name` a `Promise` without `await`. Removed.
- `var name = require(...)` — `var` semantics + ESLint default flagging. Removed.

### F. Picker bloat with low marginal value

Each setting has a soft ceiling of ~7 enum entries before adding hurts UX more than it helps (see below). Past the ceiling, only add if the new shape covers a use case none of the existing options can express.

- `<script nomodule>` — fading legacy; `<script type="module">` covers the modern path. Skip.
- `import type * as Namespace` — real, but `import * as` covers 99% of usage. Skip unless asked.

---

## Tiebreakers

When criteria conflict, apply in this order:

1. **Frequency beats spec-recency.** CJS `require` stays even though ESM is the spec direction — still dominant in Node scripts and Electron main.
2. **Standards-current beats convention.** Flip SCSS default to `@use` even though existing codebases use `@import`. New users get the right pattern; legacy users keep theirs via persisted setting.
3. **Portability beats power.** Default-import-as-URL for SVG beats `ReactComponent` even though the latter is "more React-y" — it works everywhere.
4. **Single-path beats expressiveness.** Skip `<picture>` even though it's modern; multi-path can't model in a single-paste picker.
5. **Correctness beats picker bloat.** If a missing shape produces *wrong output* on paste (CSS Modules → side-effect bucket), add it even if the picker is near the ceiling — promote to dispatch if needed.

### Tiebreaker-1 fragility tags

Three shapes ship **only because Frequency beats spec-recency** (Tiebreaker 1). They are the rubric's most fragile entries — the first ones to re-check whenever the language's import culture or default flips. Model them on the SCSS `@import` demotion (kept for back-compat but demoted from default to legacy slot): each is a candidate for the same demotion once its Frequency falls below the threshold.

| Fragile shape | Slot | Why it's fragile / re-check trigger |
|---------------|------|-------------------------------------|
| CJS `require` (`const name = require('…')`) | JS slot 5 | Held purely on Node-scripts/Electron-main Frequency against the ESM spec direction. Re-check when CJS usage drops below 30% in Node codebases. |
| TS named-default (`import { name } from '…'` as the **TS default**, index 0) | TS slot 0 | Pinned by the legacy-Angular auto-naming back-compat anchor, not by named imports being "more correct." Re-check when pre-standalone Angular (v2–v17) usage fades. |
| `preserveScriptFileExtension` / `preserveStylesheetFileExtension` booleans | settings | Kept as plain booleans on current paste-frequency. Re-check at the auto-detect revisit (see [future/auto-detect-extensions.md](future/auto-detect-extensions.md)) — the tri-state design would promote one to a smarter default. |

---

## Worked examples

### Why we added `<script async>` but rejected `<script nomodule>`

`async` — hits: Frequency (analytics/ads/third-party), Standards-current (HTML5), Portability (universal), Single-path, User-picks-a-style, Modern best practice. 6/6. Add.

`nomodule` — hits: Standards-current only (fading as IE/legacy Edge support drops). 1/6 weakly. Picker-bloat ceiling argues against. Skip with explicit Things-considered-and-rejected entry.

### Why CSS cascade layers stay rejected even as adoption rises

Cascade Layers shipped Baseline 2022 and adoption rose sharply through 2024-25 — Tailwind v4 (Jan 2024) made `@layer` the recommended way to organize utility / component / base CSS, and shadcn/ui patterns layer-scope third-party styles.

By Criteria 2 (Standards-current), 3 (Framework-portable), and 6 (Modern best practice), the feature passes cleanly. But Criterion 1 (Frequency) asks about the **import-form** specifically. Cascade-layer codebases overwhelmingly use the **block-declaration** form in their own CSS (`@layer name { ... }`) — they very rarely use the cross-file **import-with-layer** form (`@import url('foo') layer(name);`).

So even as cascade-layer adoption rises, the import-with-layer Frequency stays low. The verdict (don't add to the picker) holds. This is a clean illustration of the C1-as-dispositive-gate weighting: 3/6 corroborators pass, but the failed C1 (on the import-form) decides it.

The lesson: **Frequency tracks the import-form, not the underlying feature.** When a feature becomes mainstream, re-evaluate the import-form signal separately — only flip the verdict when the import-form itself crosses the threshold.

### Why `.ts` / `.tsx` / `.scss` aren't gated as HTML sources even though Vite dev-server works

Vite-React `index.html` literally contains `<script type="module" src="/src/main.tsx"></script>`. Vite's dev server transforms it on the fly. The pattern is canonical in 2026 React scaffolds — the use case clearly exists.

But Frequency tracks **paste-imports into HTML**, not the existence of Vite scaffolds. Two structural reasons paste-frequency stays below the 30% threshold:

- **`index.html` is set-once.** Users configure it at project init and rarely paste new script tags into it later. Set-once destinations have structurally low paste-import frequency regardless of how common the file itself is.
- **Production HTML references compiled `.js`.** Bundlers rewrite `index.html` for production output; the source-extension reference is dev-server-only behavior. The dominant paste-import pattern targets the production-reference shape, not the dev-time source.

`.scss → .html` is even rarer — canonical Vite/Webpack SCSS routes through JS imports (`import './style.scss'` from a JS module), not direct `<link href="./style.scss">` from HTML.

`HTML_SUPPORTED_EXTENSIONS` deliberately stays at `.js` + `.css` + images. Real-but-fringe patterns (dev-server-only, set-once destinations, niche toolchains) fail Criterion 1 even when the use case is technically valid.

### Why we promoted CSS Modules to dispatch instead of adding a JSX/TSX/MDX style

CSS Modules hit Frequency, Standards-current, Portability, Single-path, Correctness — but **failed criterion 5** (only applies to `.module.css` / `.module.scss` sources, not all source types in JSX/TSX/MDX).

Correctness-beats-picker-bloat tiebreaker fires: current behavior emits the wrong shape. Promote to dispatch (basename-check in `src/snippets/_react.ts:buildAssetImportStatement`, before the `switch`) rather than registry entry. Same outcome — right shape ships — without polluting the picker.

### Why we rejected JS import attributes (`with { type: 'json' }`)

Hit: Standards-current (Stage 3), Portability (Node 22+, V8, Deno), Single-path. Failed: criterion 5 (JSON-only).

No correctness tiebreaker — omitting the attribute works in non-strict mode today. Skip; revisit when Node ESM JSON imports become mandatory in mainstream toolchains.

### Why TS `import { name } from '...'` stays as default despite simpler shapes existing

Hits Frequency (named imports are equally common as default in modern TS) and Back-compat for the legacy Angular filename convention via the **legacy-Angular auto-naming** support (`app-root.component.ts` → `{ ${1:AppRootComponent} }` automatically — a pre-filled but editable tab stop). Fires only on this shape, only when the path matches one of the legacy suffixes (`.component` / `.directive` / `.pipe` / `.service` / `.module`), and only after the derived name validates against `/^[A-Za-z_$][\w$]*$/` (otherwise it falls back to `$1`).

Add criterion exception: **"Legacy back-compat support"** can pin a non-obvious default. Losing the `{ name }` default would gut legacy-Angular auto-naming for codebases following the pre-standalone (v2–v17) convention. Documented in the decisions ledger. (This is one of the three Tiebreaker-1 fragility tags above — re-check it when pre-standalone Angular usage fades.)

### Why we dropped mixed default+named (`import name, { other } from '…';`) from the TS picker but kept it in JS

`import name, { other } from '_relativePath_';` is the universally-recognized NPM-library pattern (`import React, { useState } from 'react'`), so on Frequency alone it looks like an easy add for both JS and TS. Weighed against this extension's **relative-path-only** surface plus the **modern TS named-only culture** (`verbatimModuleSyntax` in TS 5.0+, `@typescript-eslint/consistent-type-imports`, ESLint defaults, Google / Airbnb style guides), it splits:

- **JS:** kept. Local JS modules genuinely export both default + named in real codebases (`import Logger, { Level } from './logger'`); JS culture doesn't enforce named-only as strictly as modern TS.
- **TS:** dropped. Local TS modules rarely export both — modern TS conventions push named-only; the NPM-library motivation doesn't apply to relative paths.

The TS slot freed by the drop went to `const name = await import('_relativePath_');` (dynamic — sibling of JS picker's slot 6). Both pickers stay at the 7-entry sweet spot. The TS rejection is documented in the decisions ledger's "Things considered and rejected" appendix for discoverability.

**Pattern this exemplifies:** a shape can hit Criterion 1 in one language and fail it in another when the language's import culture differs (named-only TS vs. mixed-export JS). Re-apply the criteria per-language when culture asymmetries appear; don't assume symmetry. This complements Criterion 3 (Framework-portable) which addresses cross-toolchain asymmetries — this pattern addresses cross-language ones. See the named principle below.

### Why LaTeX graphics gate to `.pdf` / `.png` / `.jpg` / `.jpeg` / `.eps` and reject `.svg` / `.gif` / `.webp` / `.avif`

LaTeX (`.tex`) accepts graphics sources for `\includegraphics`, but its accepted set is **not** the web `IMAGE_FILE_EXTENSIONS` set. Read Criterion 3 (Framework-portable) as **engine-portable**: an `\includegraphics` call must compile under the mainstream engines (`pdflatex` / `xelatex` / `lualatex`).

- `.pdf` / `.png` / `.jpg` / `.jpeg` — `pdflatex`-native. Pass C3.
- `.eps` — native under `latex`+`dvips`, auto-converted under `pdflatex` (`epstopdf`). C3-borderline, but the classic LaTeX vector format; admitted for academic parity (the `.mov` / `.m4a` precedent in [decisions/media-files.md](decisions/media-files.md)).
- `.svg` — needs the `svg` package shelling out to Inkscape (`--shell-escape` + an Inkscape install). Fails C3.
- `.gif` / `.webp` / `.avif` — no LaTeX engine renders them natively. Fail C3.

This is the same gate that keeps `.mkv` / `.avi` out of HTML `<video>` (the imports compile, but nothing renders them — the "a parser accepting a token ≠ a feature backs it" sub-rule). **The lesson: when a destination has an engine/runtime with its own format support, re-derive the accepted set from that engine — never inherit a sibling destination's source list.** LaTeX's graphics set lives in its own `TEX_GRAPHICS_FILE_EXTENSIONS` constant precisely so it cannot drift into reusing `IMAGE_FILE_EXTENSIONS`. See [decisions/latex.md](decisions/latex.md).

---

## Named patterns

These promote recurring rationales — used repeatedly across the spec and decision ledgers — into first-class rubric rules.

### Promote-to-dispatch (Criterion 5 exception)

When a shape's variation is **fully determined** by something the tool can detect on its own — the source basename, the source extension, or project config — a picker has nothing for the user to vary over. Offering it as an enum row would force the user to know "this option only does something for a `.module.css`." So the shape becomes a **smarter default in code** (per-language dispatch), not a picker entry.

Three instances ship today:

| Instance | Detected signal | Where it lives |
|----------|-----------------|----------------|
| CSS-Modules basename guard | `.module.css` / `.module.scss` basename | `src/snippets/_react.ts:52-54` (guard *before* the asset switch) |
| Media / text-track URL bucket | audio-visual + `.vtt` source extension | `src/snippets/_react.ts:75-83` (the 3rd group of the asset switch) |
| Destination-runtime auto-detect (**DEFERRED**) | project runtime (Node ESM / Bun / Deno / bundler) | not shipped — generalizes source-type-conditional → destination-runtime-conditional. See [future/auto-detect-extensions.md](future/auto-detect-extensions.md). |

**Relationship to the ceiling.** Correctness (Tiebreaker 5) can override the soft picker-bloat ceiling — and dispatch-promotion is *how* it does so without bloating the picker. A correctness-critical shape that fails Criterion 5 doesn't get jammed into the enum; it ships as dispatch logic, so the picker stays at its sweet spot and the right output still ships.

### Criteria are re-applied per destination; symmetry is never assumed

A shape that qualifies for one destination is **not** automatically admitted for another. The criteria are re-run for each destination language and each direction, because import culture and native support differ. Concrete divergences that shipped:

- **Mixed default+named** — `import name, { other }` is **kept in JS, dropped in TS** (JS exports both freely; modern TS culture is named-only). A C1 divergence across two *languages*.
- **`.md` as a source** — admitted **Astro-only**. Astro natively renders Markdown as a component; Vue/Svelte need a plugin, so `.md → .vue/.svelte` fails C3 (Framework-portable). One source, opposite verdicts across destinations.
- **`.mdx`** — a **React-family destination** (imports `.tsx`/`.ts` components like TSX) but also a **valid asset source** when pasted *into* another file (`import ${1:name}` in the asset switch). Same extension, two roles depending on direction.

State the divergence explicitly in the spec/decision ledger whenever it appears; don't paper over it for the sake of a tidy symmetric table. (Item 8 of the finalization drift-fix list calls these out as *intentional* asymmetries — they are correct, not drift.)

---

## The picker-bloat ceiling

**Soft ceiling: ~7 enum entries per setting.**

Rationale: VS Code's QuickPick UX degrades past ~10 entries (vertical scroll, harder to scan, slower to read on first paste). Below ~5 the picker feels under-populated. Sweet spot is 5–7.

When pruning to stay under the ceiling:

- Drop legacy entries first (`<script type="text/javascript">`, SCSS `@import`).
- Drop entries that fail criterion 1 (Frequency).
- **Never drop the default.**
- **Never drop entries that cover a unique semantic the others don't** (e.g. CJS `require` covers the only-Node-scripts case — keep even if at ceiling).

Hard ceiling: **none** — but adding a 10th entry needs explicit reasoning in the PR description.

The current per-setting picker inventory (entries as shipped) lives in [`spec/statements.md`](spec/statements.md).

---

## Process

### When proposing a new shape

1. **Audit against criteria.** Which inclusion criteria does it hit? Which rejection criteria threaten it? Remember C1∧C3 are the dispositive gate (see the weighting note). Note in the PR description.
2. **Check the bloat ceiling.** If the target setting is at 7+, justify why this addition is worth bumping the ceiling *or* pruning a legacy entry.
3. **Update [`spec/statements.md`](spec/statements.md)** with the new shipped entry and [`decisions/statements.md`](decisions/statements.md) with its rationale (per the "Three-site sync" notes).
4. **Add a worked example here** if the decision involved a non-obvious tiebreaker.

### When proposing a removal

1. **Justify against criteria.** Which rejection criteria does the shape hit (or always hit)?
2. **Check the "Removed-value fallback policy"** in [`spec/statements.md`](spec/statements.md) — verify the `default:` branch in the per-language switch emits the post-audit default so persisted-removed-value users land softly (`resolveStyleIndex` returns `undefined` on a no-match string lookup → `default:`).
3. **Update CHANGELOG** under "Defaults updated" or "Removed entries".

### When a new upstream pattern lands (TC39 stage, W3C spec, framework default flip)

1. **Apply inclusion criteria immediately** — don't wait for user requests.
2. **Promote to dispatch** if it fails criterion 5 but hits Correctness (see the Promote-to-dispatch named pattern).
3. **Reject explicitly** with a Things-considered-and-rejected entry in [`decisions/statements.md`](decisions/statements.md) if it doesn't qualify — future reviewers should see what was considered, not derive it from scratch.

---

## See also

- [`spec/statements.md`](spec/statements.md) — the authoritative shipped picker snapshot (per-language enum, default, snippet placeholder). Read it for what's in the picker.
- [`decisions/statements.md`](decisions/statements.md) — the durable application of these criteria: why each shape is in or out, the per-language audit, and the "Things considered and rejected" appendix.
- [`src/snippets/CLAUDE.md`](../../src/snippets/CLAUDE.md) — three-site sync rules for adding/removing a shape (`package.json` ↔ `_styles.ts` ↔ per-language `switch`).
- [`src/constants/CLAUDE.md`](../../src/constants/CLAUDE.md) — runtime-mirror invariant for JSX/TSX/MDX dispatch promotion (`types/file-extension.ts` ↔ `constants/extensions.ts`; the asset switch lives in `snippets/_react.ts`).
