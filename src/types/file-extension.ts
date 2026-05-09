/**
 * File-extension literal types describing every extension this extension
 * recognises in either role: a *source* (path read from the system clipboard)
 * or a *destination* (the active editor's file).
 *
 * @remarks
 * Conventions: every value is lowercase and dot-prefixed (e.g. `.ts`),
 * matching `path.parse(filePath).ext` so a raw extension flows through the
 * codebase without normalisation. The category sub-types below are
 * intentionally not exported — consumers depend on {@link FileExtension}.
 *
 * Three sites must stay in sync when adding or removing an extension:
 *
 * 1. The relevant category type below.
 * 2. The runtime gating tables in `constants/extensions.ts`.
 * 3. The matching `case` in `snippets/dispatch.ts` (destination dispatch)
 *    or `snippets/_shared.ts` (JSX/TSX source dispatch).
 *
 * The cast `as FileExtension` at runtime boundaries is erased — a missing
 * gating entry produces a silent fall-through to a default branch, not a
 * type error. The gating tables are the runtime safety net.
 */

/**
 * `.htm` is deliberately excluded — add it explicitly here and to
 * `HTML_SUPPORTED_EXTENSIONS` if you need it.
 */
type HtmlFileExtension = '.html';

/**
 * Grouped under {@link WebFileExtension} rather than {@link DataFileExtension}
 * because YAML is treated as a web/config asset here. JSON is the only
 * structured-data extension importable as a default-export value.
 */
type YamlFileExtension =
  /** Long-form YAML extension. */
  | '.yaml'
  /** Short-form YAML extension. */
  | '.yml';

type MarkdownFileExtension = '.md';

/**
 * `.css` and `.scss` are classified asymmetrically by
 * `path/import-type.ts:determineImportType` (`.css → 'stylesheet'`,
 * `.scss → null`) so SCSS-into-SCSS routes through the SCSS-specific
 * default branch instead of a generic stylesheet bucket.
 */
type StylesheetFileExtension =
  /** Plain CSS. Classified as `'stylesheet'` by `determineImportType`. */
  | '.css'
  /** SCSS / Sass source. Classified as `null` by `determineImportType` so destination handlers can apply SCSS-specific rules (`@use`, partial filenames). */
  | '.scss';

/**
 * Runtime mirror at `constants/extensions.ts:IMAGE_FILE_EXTENSIONS` — keep
 * the two in sync.
 */
type ImageFileExtension =
  /** Animated/static GIF. */
  | '.gif'
  /** JPEG raster image (long form). */
  | '.jpeg'
  /** JPEG raster image (short form). */
  | '.jpg'
  /** PNG raster image. */
  | '.png'
  /** WebP raster image. */
  | '.webp';

/**
 * Source-only — fonts become side-effect imports
 * (`import '${path}.woff2';`) in JSX/TSX and are never destinations.
 */
type FontFileExtension =
  /** Web Open Font Format (WOFF 1.0). */
  | '.woff'
  /** Web Open Font Format 2 (Brotli-compressed). */
  | '.woff2'
  /** TrueType font. */
  | '.ttf'
  /** Embedded OpenType (legacy IE font format). */
  | '.eot';

type WebFileExtension =
  | HtmlFileExtension
  | YamlFileExtension
  | MarkdownFileExtension
  | StylesheetFileExtension
  | ImageFileExtension
  | FontFileExtension;

/**
 * The four valid *destinations* for JS-style snippet generation; each maps
 * to a dedicated module under `snippets/`.
 */
type ScriptFileExtension =
  /** TypeScript module. Dispatched to `snippets/typescript.ts`. */
  | '.ts'
  /** TypeScript + JSX. Dispatched to `snippets/tsx.ts`. */
  | '.tsx'
  /** JavaScript module. Dispatched to `snippets/javascript.ts`. */
  | '.js'
  /** JavaScript + JSX. Dispatched to `snippets/jsx.ts`. */
  | '.jsx';

/**
 * JSON only — see {@link YamlFileExtension} for why YAML lives elsewhere.
 */
type DataFileExtension = '.json';

/**
 * The closed set of file extensions the extension recognises in any role.
 * The only export from this file.
 */
export type FileExtension = WebFileExtension | ScriptFileExtension | DataFileExtension;
