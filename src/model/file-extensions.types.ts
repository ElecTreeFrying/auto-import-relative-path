/**
 * File extension type definitions.
 */

/** Represents the HTML file extension. */
type HtmlFileExtension = '.html';

/** Represents the YAML file extensions. */
type YamlFileExtension = '.yaml' | '.yml';

/** Represents the Markdown file extension. */
type MarkdownFileExtension = '.md';

/** Represents the stylesheet file extensions (CSS and SCSS). */
type StylesheetFileExtension = '.css' | '.scss';

/** Represents the image file extensions. */
type ImageFileExtension = '.gif' | '.jpeg' | '.jpg' | '.png' | '.webp';

/** Represents the font file extensions. */
type FontFileExtension = '.woff' | '.woff2' | '.ttf' | '.eot';

/** Represents all web-related file extensions (HTML, stylesheets, YAML, Markdown, images, and fonts). */
type WebFileExtension =
  | HtmlFileExtension
  | YamlFileExtension
  | MarkdownFileExtension
  | StylesheetFileExtension
  | ImageFileExtension
  | FontFileExtension;

/** Represents the script file extensions (JavaScript and TypeScript). */
type ScriptFileExtension = '.ts' | '.tsx' | '.js' | '.jsx';

/** Represents the data file extension. */
type DataFileExtension = '.json';

/** A union type of all supported file extensions. */
export type FileExtension = WebFileExtension | ScriptFileExtension | DataFileExtension;

/** Represents the types of imports available. */
export type ImportType = 'script' | 'stylesheet' | 'markdown' | 'image';
