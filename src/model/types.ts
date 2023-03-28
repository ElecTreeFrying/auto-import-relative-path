export type HTMLFileExtension = '.html';

export type YAMLFileExtension = '.yaml' | '.yml';

export type MarkdownFileExtension = '.md';

export type StylesheetFileExtension = '.css' | '.scss';

export type ScriptFileExtension = '.ts' | '.tsx' | '.js' | '.jsx';

export type ImageFileExtension = '.gif' | '.jpeg' | '.jpg' | '.png' | '.webp';

export type FontFileExtension = '.woff' | '.woff2' | '.ttf' | '.eot';

export type WebFileExtension = HTMLFileExtension | StylesheetFileExtension | YAMLFileExtension | MarkdownFileExtension | ImageFileExtension | FontFileExtension;

export type DataFileExtension = '.json';

export type JSX_SupportedFileExtension = '.js' | '.jsx' | WebFileExtension | DataFileExtension;

export type TSX_SupportedFileExtension = '.js' | '.ts' | '.tsx' | WebFileExtension | DataFileExtension;

export type FileExtension = WebFileExtension | ScriptFileExtension | DataFileExtension;

export type ImportType = 'script' | 'stylesheet' | 'markdown' | 'image';
