import * as vscode from 'vscode';

export interface Notification {
	editor: vscode.TextEditor;
	isNotSamePath?: boolean;
	activeEditorIsValid?: boolean;
	clipboardIsValid?: boolean;
}

export interface ImportOption { 
  copy?: boolean, 
  paste?: boolean, 
  import?: boolean 
}

export interface Config {
  // General
  quoteStyle:      boolean; importType:           number;
  addSemicolon:    boolean; disableNotifications:        boolean;
  // Javascript
  jsSupport:       number;  jsxSupport:           number;
  withExtnameJS:   boolean;
  // Typescript
  tsSupport:       number;  tsxSupport:           number;
  withExtnameTS:   boolean; addExportName:        boolean;
  // Stylesheet
  cssSupport:      number;  scssSupport:          number;
  lessSupport:     number;  withExtnameCSS:       boolean;
  // Markdown
  markdownSupport: number;  markdownImageSupport: number;
  // HTML
  htmlScriptSupport: number, htmlStylesheetSupport: number;
}
