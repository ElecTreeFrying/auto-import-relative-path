
type HtmlFileExtension = '.html';

type YamlFileExtension =
  | '.yaml'
  | '.yml';

type MarkdownFileExtension = '.md';

type StylesheetFileExtension =
  | '.css'
  | '.scss';

type ImageFileExtension =
  | '.gif'
  | '.jpeg'
  | '.jpg'
  | '.png'
  | '.svg'
  | '.avif'
  | '.webp';

type FontFileExtension =
  | '.woff'
  | '.woff2'
  | '.ttf'
  | '.eot';

type DocumentFileExtension = '.pdf';

type WebFileExtension =
  | HtmlFileExtension
  | YamlFileExtension
  | MarkdownFileExtension
  | StylesheetFileExtension
  | ImageFileExtension
  | FontFileExtension;

type ScriptFileExtension =
  | '.ts'
  | '.tsx'
  | '.mdx'
  | '.js'
  | '.jsx';

type DataFileExtension = '.json';

export type FileExtension = WebFileExtension | ScriptFileExtension | DataFileExtension | DocumentFileExtension;
