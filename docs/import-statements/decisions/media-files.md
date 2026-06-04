# Media Files — Design Decisions

> These are the design decisions taken while specifying v1 (the criteria applied, the shapes locked in, and the alternatives rejected); living gate, it stays open for new rows.
>
> Per-shape criteria evaluation and rejection ledger for [`../spec/media-files.md`](../spec/media-files.md). Applies the rubric in [`../CRITERIA.md`](../CRITERIA.md).
>
> **Status: LIVING gate** — video/audio/text-track support shipped, but new shapes can be evaluated and added at any time. Each must pass the rubric and get its own row. Decisions get locked in (recorded) per shape; the file stays open for the next evaluation.

## Criteria application

Each proposed shape maps to the rubric in [`../CRITERIA.md`](../CRITERIA.md). Multi-hit shapes are easy adds; single-hit shapes are flagged explicitly.

### Source-extension inclusion

| Extension(s) | Criteria hit | Notes |
|--------------|--------------|-------|
| `.mp4` / `.webm` (video core) | 1, 2, 3, 4 | Universal in Vite / Next / CRA / webpack asset modules; W3C HTML5 baseline for `<video>`. Multi-hit. |
| `.mp3` / `.ogg` / `.wav` (audio core) | 1, 2, 3, 4 | Same hit profile as video core; W3C HTML5 baseline for `<audio>`. Multi-hit. |
| `.mov` | 3 (with weak 1) | macOS export default (QuickTime container). Portable as a URL import; Frequency moderate (Apple-user subset). Included for macOS parity; revisit if user feedback contradicts. |
| `.m4a` | 3 (with weak 1) | Apple audio container; common in podcast workflows. Same profile as `.mov`. Included for macOS/podcast parity; revisit on feedback. |
| `.vtt` | 1, 2, 3, 6 | W3C WebVTT (only universally-supported text-track format); WCAG 2.1 Level A captions requirement (Criterion 6). Multi-hit. |

### JSX/TSX/MDX shape (dispatch bucket, no picker setting)

| Shape | Criteria hit | Notes |
|-------|--------------|-------|
| `import ${1:url} from '${path}';` | 1, 3, 4, 5 | Standard URL-import pattern for asset modules. Applies to every media + text-track source type (Criterion 5 fit — promotion to dispatch per the rubric's exception, same pattern as the existing CSS-Modules / default-import / side-effect groups). Multi-hit. |

### HTML video shapes (new `markup.htmlVideoImportStyle` setting)

| Shape | Criteria hit | Notes |
|-------|--------------|-------|
| `<video src="…" controls></video>` ← default | 1, 2, 4, 6 | Accessibility-by-default (web.dev / ARIA keyboard-control guidance); HTML5 baseline. Multi-hit, strong default. |
| `<video src="…" autoplay muted loop playsinline></video>` | 1, 2, 6 | Background-video pattern (hero sections, landing pages); `muted` + `playsinline` required by Chrome / Safari autoplay policies (Criterion 6 — vendor recommendation). Multi-hit. |
| `<video src="…" controls poster=""></video>` | 2, 4, 6 | **C1 weak** (poster-attribute usage estimated <30% of `<video>` paste-imports); kept on Modern-best-practice grounds (Core Web Vitals — poster prevents pre-metadata flash / CLS-adjacent jank). Snippet-placeholder workflow (`poster="$1"` for user to fill in) is the real value-add. Re-evaluate if picker-bloat pressure rises. |
| `<video src="…" controls preload="metadata"></video>` | 1, 6 | Long-form video pattern; web.dev / Core Web Vitals recommends over default `preload="auto"` to avoid full-file pre-buffering. Multi-hit (mirrors the audio preload variant's profile). |

### HTML audio shapes (new `markup.htmlAudioImportStyle` setting)

| Shape | Criteria hit | Notes |
|-------|--------------|-------|
| `<audio src="…" controls></audio>` ← default | 1, 2, 4, 6 | Accessibility-by-default; HTML5 baseline. Multi-hit, strong default. |
| `<audio src="…" controls preload="metadata"></audio>` | 1, 6 | Common on podcast / long-audio pages; web.dev recommends over default `preload="auto"` to avoid network waste (Core Web Vitals). Multi-hit. |

### HTML text-track shape (hardcoded — no picker setting)

| Shape | Criteria hit | Notes |
|-------|--------------|-------|
| `<track src="…" kind="subtitles" srclang="en" label="English"></track>` | 1, 2, 4, 6 | W3C WebVTT spec; accessibility-required (WCAG 2.1); single-shape fit for the only practical `kind` use (`subtitles`/`captions` swap is a single-token edit). Multi-hit. |

### Picker-bloat ceiling check

| Setting | Proposed entries | Sweet-spot fit |
|---------|------------------|----------------|
| `markup.htmlVideoImportStyle` | 4 | One below sweet-spot floor (5). Headroom: `crossorigin` and `controlslist` variants are picker-bloat-deferred (see rejection ledger below). |
| `markup.htmlAudioImportStyle` | 2 | Below sweet-spot floor. Room to grow (preload / loop / `crossorigin` variants are candidates for a future pass). |

Both settings are well under the ~7-entry ceiling — no picker-bloat risk. With this design shipped, the "Current state per setting" table in [`../spec/statements.md`](../spec/statements.md) carries the two HTML media rows (video 4, audio 2) alongside CSS (2). That table update landed with implementation, not with the design-closure edit.

## Locked-in decisions

| Decision | Justification |
|----------|---------------|
| `controls` as universal HTML default (both video and audio) | Criterion 6 (accessibility). A `<video>` / `<audio>` without `controls` is a keyboard-trap unless explicit JS handlers are wired — the picker default cannot assume those. |
| Distinct `htmlVideoImportStyle` / `htmlAudioImportStyle` settings (not a single combined `htmlMediaImportStyle`) | Video and audio have different attribute spaces (`autoplay muted loop playsinline` is video-specific; `preload="metadata"` matters more for audio). Combining them would force every variant to apply to both — fails Criterion 5 for at least one side. |
| New JSX/TSX/MDX media group in `buildAssetImportStatement` (`src/snippets/_react.ts`, dispatch — not a `package.json` setting) | Criterion 5 exception ("promotion to dispatch"): URL-import is the only shape that applies to every media source in JSX/TSX/MDX, so a picker entry would have nothing to vary over. Same pattern the rubric already uses for CSS-Modules detection. As shipped, the media + text-track sources are the **2nd of the three switch groups** (the 3rd distinct shape overall) — after the pre-switch CSS-module basename guard and the default-import group, before the side-effect group; `buildAssetImportStatement` is shared by `buildReactImport`, `languages/framework-component.ts`, and `variants.ts:buildReactNonScriptVariant` (one switch, three callers). |

---

## Things considered and rejected

Criterion-tagged rejections. New rejections must cite either an Inclusion criterion (1–6) the shape fails or a Rejection criterion (A–F) from [`../CRITERIA.md`](../CRITERIA.md). Doc-local notes are acceptable when no criterion is a clean fit; flag them explicitly.

- **`<video><source src="…" type="video/mp4"></video>` with `<source>` siblings** (also `<picture>` for responsive video) — *(Fails Criterion 4: Single-path-paste fit — multi-path.)* Skip.
- **HLS / DASH streaming manifests** (`.m3u8`, `.mpd`) — *(Fails Rejection Criterion C: Different feature wearing the same syntax — streaming wearing import-like syntax.)* Skip.
- **`.flac`, `.aac`** (audio formats) — *(Fails Criterion 1: Frequency — well below 30% of modern codebases.)* Niche on web; sparse decoder support outside Chromium for `.flac`, `.aac` rarely shipped as a bare container. Skip unless user-requested.
- **`.mkv` / `.avi` / `.3gp`** (video containers) — *(Fails Criterion 3: Framework-portable — no browser-portable playback path.)* Not supported by mainstream browser `<video>` decoders; the URL imports compile cleanly, but the file won't play. Skip.
- **CSS `background: url('./bg.mp4')`** — *(Fails Rejection Criterion C — the import-syntax exists, but no semantic feature backs it.)* Syntactically valid — the CSS parser accepts the `url(...)` token for any file extension — but no browser plays video as a CSS background. Skip across `.css` and `.scss` destinations.
- **Markdown native media** — *(Doc-local rejection — no clean criterion fit; closest is the syntax-ceiling principle.)* Markdown has no native `<video>` / `<audio>` syntax; there is no canonical shape to emit. Users embed raw HTML when needed. (Closest criterion is the syntax-ceiling principle that bounds the `MD image` row in [`../CRITERIA.md`](../CRITERIA.md)'s picker-bloat table to 2 entries.) Skip.
- **`.opus` audio extension** — *(Fails Criterion 1: Frequency.)* Multi-hit on C2 (IETF RFC 6716 / W3C Media baseline), C3 (broad browser support), C4, C6 (modern codec recommendation), but `.opus` is growing in podcasts / WebRTC recordings while production audio remains predominantly `.mp3` / `.aac`. Low cost / low reward; revisit on user signal.
- **Audio `loop` / `autoplay muted loop` variants** — *(Fails Rejection Criterion F: picker bloat — single-hit, C2 only.)* Niche use case (ambient soundtracks); browser autoplay policies block unmuted. Skip.
- **`crossorigin="anonymous"` variants** for `<video>` / `<audio>` — *(Fails Rejection Criterion F: picker bloat with low marginal value — single-hit.)* Niche CDN / canvas-frame-reading workflows. Skip.
- **`controlslist="nodownload nofullscreen noremoteplayback"` / `disablepictureinpicture`** for `<video>` — *(Fails Rejection Criterion F: picker bloat — single-hit.)* Per-player niche customization (Netflix-style players). Skip.

## See also

- [`../spec/media-files.md`](../spec/media-files.md) — what v1 does (the shipped media/text-track spec).
- [`../CRITERIA.md`](../CRITERIA.md) — the rubric. Criteria 1, 3, 4, 6 all apply.
