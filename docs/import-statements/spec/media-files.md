# Media Files — Specification (v1)

> **Status:** Shipped. **Code:** `src/types/file-extension.ts`, `src/constants/extensions.ts`, `src/path/import-type.ts`, `src/snippets/_react.ts`, `src/snippets/languages/html.ts`, `src/snippets/_styles.ts`.
> **Why these shapes:** [decisions/media-files.md](../decisions/media-files.md) · **Rubric:** [../CRITERIA.md](../CRITERIA.md)

## Overview

Video, audio, and text-track source files paste as relative URL imports. The default-import-as-URL shape — `import url from './foo.mp4';` — is universally supported in Vite, Next.js, CRA, and webpack asset modules, the same pattern that already serves images and `.svg`. Media (`.mp4` / `.webm` / `.mov` / `.mp3` / `.ogg` / `.wav` / `.m4a`) and text-track (`.vtt`) sources land in JSX/TSX/MDX as URL imports, in HTML as `<video>` / `<audio>` / `<track>` markup, and — via the framework trio's destination lists — in `.vue` / `.svelte` / `.astro` as URL imports too. CSS, SCSS, and Markdown destinations do **not** accept media or text tracks; that asymmetry is intentional (see [decisions/media-files.md](../decisions/media-files.md)).

## File-extension union

The media aliases live in `src/types/file-extension.ts` and join into `FileExtension`:

```typescript
type VideoFileExtension = '.mp4' | '.webm' | '.mov';
type AudioFileExtension = '.mp3' | '.ogg' | '.wav' | '.m4a';
type TextTrackFileExtension = '.vtt';
type MediaFileExtension = VideoFileExtension | AudioFileExtension | TextTrackFileExtension;
```

`.mov` (Apple's QuickTime container) and `.m4a` (Apple's audio container) are included for parity with the macOS export defaults users encounter. `.flac` and `.aac` are not included (niche on web). `.vtt` (W3C WebVTT) is the only text-track format with universal browser support and is accessibility-critical (WCAG 2.1 captions requirement); it is grouped under `TextTrackFileExtension`, kept distinct from the audio/video binary containers.

## Gating

The gating arrays live in `src/constants/extensions.ts`:

```typescript
export const MEDIA_FILE_EXTENSIONS: FileExtension[] = ['.mp4', '.webm', '.mov', '.mp3', '.ogg', '.wav', '.m4a'];
export const TEXT_TRACK_FILE_EXTENSIONS: FileExtension[] = ['.vtt'];
```

`MEDIA_FILE_EXTENSIONS` holds video + audio only; `.vtt` lives in its own `TEXT_TRACK_FILE_EXTENSIONS`. Both arrays are spread together into the destination lists:

- `HTML_SUPPORTED_EXTENSIONS` carries `...MEDIA_FILE_EXTENSIONS, ...TEXT_TRACK_FILE_EXTENSIONS` — HTML accepts media for `<video>` / `<audio>` embeds and `.vtt` for `<track>` children.
- The framework trio — `VUE_SUPPORTED_EXTENSIONS`, `SVELTE_SUPPORTED_EXTENSIONS`, `ASTRO_SUPPORTED_EXTENSIONS` — also spread both arrays, so media / text-track sources paste into `.vue` / `.svelte` / `.astro` destinations (default-import-as-URL via the shared `framework-component.ts` builder).
- JSX/TSX/MDX accept both via `CROSS_IMPORT_DESTINATIONS` (no spread needed — those destinations carry no per-destination source allow-list clause in gating).
- CSS / SCSS / MD do **not** gain media or text tracks — out of scope.

## Source classification

`determineImportType` in `src/path/import-type.ts` returns `'video'`, `'audio'`, and `'text-track'` (the media-related returns), with the matching union in `src/types/import-type.ts`. `languages/html.ts:buildSnippet` routes those returns to the `byStyle` functions for video / audio and to the hardcoded emit for text tracks.

## JSX/TSX/MDX — URL import

Media and text-track sources land in the URL-import group of the canonical asset switch, `buildAssetImportStatement` in `src/snippets/_react.ts`, emitting `` `import ${1:url} from '${path}';` `` (placeholder `url` instead of `name` to signal URL-ness). `.vtt` joins the same group — the URL-import shape applies identically (consumers pass the imported URL to a `<track src>` JSX attribute). There is no picker setting: URL-import is the only shape that applies to every media source here.

`buildAssetImportStatement` is the single canonical asset switch — a `.module.css` / `.module.scss` basename **guard before the switch**, then three switch groups (default-import → `${1:name}`; media + text-track → `${1:url}`; side-effect → bare `import '<path>';`) and a `null` `default:`. The media + text-track group sits between the default-import and side-effect groups. The switch is shared by `buildReactImport`, `languages/framework-component.ts`, and `variants.ts:buildReactNonScriptVariant` (one switch, shared by all its callers).

| Source-extension bucket | `SnippetString` shape |
|-------------------------|----------------------|
| `.mp4` / `.webm` / `.mov` / `.mp3` / `.ogg` / `.wav` / `.m4a` / `.vtt` (media + text-track group) | `` `import ${1:url} from '${path}';` `` |

## HTML — `<video>` / `<audio>` / `<track>`

HTML carries two picker settings plus one hardcoded text-track shape.

### Video — `auto-import.importStatement.markup.htmlVideoImportStyle`

| # | Shape | Status |
|---|-------|--------|
| 1 | `<video src="_relativePath_" controls></video>` | ← **default** — accessibility-by-default |
| 2 | `<video src="_relativePath_" autoplay muted loop playsinline></video>` | silent autoplay (background video pattern) |
| 3 | `<video src="_relativePath_" controls poster=""></video>` | controls + poster image placeholder |
| 4 | `<video src="_relativePath_" controls preload="metadata"></video>` | long-form video; avoids pre-buffering (Core Web Vitals) |

### Audio — `auto-import.importStatement.markup.htmlAudioImportStyle`

| # | Shape | Status |
|---|-------|--------|
| 1 | `<audio src="_relativePath_" controls></audio>` | ← **default** |
| 2 | `<audio src="_relativePath_" controls preload="metadata"></audio>` | network-friendly preload |

### Text track — `<track>` (single hardcoded shape, no picker)

`.vtt` sources emit `` `<track src="${path}" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>` ``. There is no picker setting — `<track>` has only two practically-useful `kind` values (`subtitles` vs `captions`), so the user edits the one literal token rather than choosing from a picker. This keeps the three-site sync surface minimal.

## Snippet placeholder spec

**JSX/TSX/MDX (hardcoded `buildAssetImportStatement` switch in `_react.ts`):**

| Source-extension bucket | `SnippetString` shape |
|-------------------------|----------------------|
| `.mp4` / `.webm` / `.mov` / `.mp3` / `.ogg` / `.wav` / `.m4a` / `.vtt` (media + text-track group) | `` `import ${1:url} from '${path}';` `` |

**HTML video (`buildHtmlVideoImportSnippetByStyle`):**

| Enum description | `SnippetString` shape |
|------------------|----------------------|
| `<video src="_relativePath_" controls></video>` (default) | `` `<video src="${path}" controls></video>` `` |
| `<video src="_relativePath_" autoplay muted loop playsinline></video>` | `` `<video src="${path}" autoplay muted loop playsinline></video>` `` (no user placeholder) |
| `<video src="_relativePath_" controls poster=""></video>` | `` `<video src="${path}" controls poster="$1"></video>` `` (placeholder for poster path) |
| `<video src="_relativePath_" controls preload="metadata"></video>` | `` `<video src="${path}" controls preload="metadata"></video>` `` (no user placeholder) |

**HTML audio (`buildHtmlAudioImportSnippetByStyle`):**

| Enum description | `SnippetString` shape |
|------------------|----------------------|
| `<audio src="_relativePath_" controls></audio>` (default) | `` `<audio src="${path}" controls></audio>` `` |
| `<audio src="_relativePath_" controls preload="metadata"></audio>` | `` `<audio src="${path}" controls preload="metadata"></audio>` `` |

**HTML text track (`buildHtmlTextTrackImportSnippet` — hardcoded, no `byStyle` dispatch):**

| Source-extension bucket | `SnippetString` shape |
|-------------------------|----------------------|
| `.vtt` | `` `<track src="${path}" kind="subtitles" srclang="${1:en}" label="${2:English}"></track>` `` |

The HTML option tables live in `src/snippets/_styles.ts` — `HTML_VIDEO_IMPORT_OPTIONS` and `HTML_AUDIO_IMPORT_OPTIONS`, each with `tag` fields (the first entry of each has no `tag` and falls back to the full description in the QuickPick). There is no text-track options table — the single hardcoded shape needs none. The two settings (`markup.htmlVideoImportStyle`, `markup.htmlAudioImportStyle`) are declared in `package.json` with `enum` + `enumDescriptions`, and aliased (`htmlVideo`, `htmlAudio`) in `AUTO_IMPORT_CONFIG.markup.settings` with matching `AutoImportSettingKey` literals in `src/config/settings.ts`.

## Code map

- `src/types/file-extension.ts` — `VideoFileExtension` / `AudioFileExtension` / `TextTrackFileExtension` / `MediaFileExtension` aliases joined into `FileExtension`.
- `src/constants/extensions.ts` — `MEDIA_FILE_EXTENSIONS` (video+audio, 7) and `TEXT_TRACK_FILE_EXTENSIONS` (`.vtt`); both spread into `HTML_SUPPORTED_EXTENSIONS` and the `VUE_` / `SVELTE_` / `ASTRO_` destination lists.
- `src/path/import-type.ts` — `determineImportType` returns `'video'` / `'audio'` / `'text-track'` (the media-related returns); matching union in `src/types/import-type.ts`.
- `src/snippets/_react.ts` — `buildAssetImportStatement` non-script switch carries the media + text-track URL-import group (shared by `buildReactImport`, `languages/framework-component.ts`, and `variants.ts:buildReactNonScriptVariant`).
- `src/snippets/languages/html.ts` — `buildHtmlVideoImportSnippetByStyle` + `buildHtmlAudioImportSnippetByStyle` styled builders; hardcoded `buildHtmlTextTrackImportSnippet`; `buildSnippet` routes the three `determineImportType` returns.
- `src/snippets/_styles.ts` — `HTML_VIDEO_IMPORT_OPTIONS` + `HTML_AUDIO_IMPORT_OPTIONS` tables.

## See also

- [decisions/media-files.md](../decisions/media-files.md) — why these shapes: per-shape criteria application, cross-cutting choices, and the rejection ledger (CSS background-video, Markdown-native media, multi-source `<source>` siblings, streaming manifests, and the rest).
- [../CRITERIA.md](../CRITERIA.md) — the rubric. Criteria 1, 3, 4, 6 all apply.
