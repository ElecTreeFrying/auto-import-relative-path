
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
  | '.webp';

type FontFileExtension =
  | '.woff'
  | '.woff2'
  | '.ttf'
  | '.eot';

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
  | '.js'
  | '.jsx';

type DataFileExtension = '.json';

export type FileExtension = WebFileExtension | ScriptFileExtension | DataFileExtension;
