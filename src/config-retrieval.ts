import * as vscode from 'vscode';
import {
  quoteStyle, importType,
  javascript, javascriptX,
  typescript, typescriptX,
  css, scssSass, less,
  markdown, markdownImage,
  HTMLScript, HTMLStylesheet
} from './config-enum';

export interface Config {
  // General
  quoteStyle:      boolean; importType:           number;
  addSemicolon:    boolean; disableNotifs:        boolean;
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

export const section = {
  // General
  QUOTESTYLE:            'general.quoteStyle',       
  IMPORTTYPE:            'general.importType',
  ADDSEMICOLON:          'general.addSemicolon',     
  DISABLENOTIFS:         'general.disableNotifs',
  // Javascript
  JSSUPPORT:             'importStatements.javascript.jsSupport',
  JSXSUPPORT:            'importStatements.javascript.jsxSupport',
  WITHEXTNAMEJS:         'importStatements.javascript.withExtnameJS',
  // Typescript
  TSSUPPORT:             'importStatements.typescript.tsSupport',
  TSXSUPPORT:            'importStatements.typescript.tsxSupport',
  WITHEXTNAMETS:         'importStatements.typescript.withExtnameTS',
  ADDEXPORTNAME:         'importStatements.typescript.addExportName',
  // Stylesheet
  CSSSUPPORT:            'importStatements.stylesheet.cssSupport',
  SCSSSUPPORT:           'importStatements.stylesheet.scssSupport',
  LESSSUPPORT:           'importStatements.stylesheet.lessSupport',
  WITHEXTNAMECSS:        'importStatements.stylesheet.withExtnameCSS',
  // Markdown
  MARKDOWNIMAGESUPPORT:  'importStatements.markdown.markdownImageSupport',
  MARKDOWNSUPPORT:       'importStatements.markdown.markdownSupport',
  // HTML
  HTMLSCRIPTSUPPORT:     'importStatements.markdown.htmlScriptSupport',
  HTMLSTYLESHEETSUPPORT: 'importStatements.markdown.htmlStylesheetSupport'
};

export class ConfigRetrieval {

  constructor(private workspace: any = vscode.workspace) { }

  get param() {
    return {
      // General
      quoteStyle:      this.quoteStyle,      importType:     this.importType,
      addSemicolon:    this.addSemicolon,    disableNotifs:  this.disableNotifs,
      // Javascript
      jsSupport:       this.jsSupport,       jsxSupport:     this.jsxSupport,
      withExtnameJS:   this.withExtnameJS,
      // Typescript
      tsSupport:       this.tsSupport,       tsxSupport:     this.tsxSupport,
      withExtnameTS:   this.withExtnameTS,   addExportName:  this.addExportName,
      // Stylesheet
      cssSupport:      this.cssSupport,      scssSupport:    this.scssSupport,
      lessSupport:     this.lessSupport,     withExtnameCSS: this.withExtnameCSS,
      // Markdown
      markdownSupport: this.markdownSupport, markdownImageSupport: this.markdownImageSupport,
      // HTML
      htmlScriptSupport: this.htmlScriptSupport, htmlStylesheetSupport: this.htmlStylesheetSupport
    };
  }

  // General

  get quoteStyle(): boolean {
    const configValue = this.workspace.getConfiguration('general').get('quoteStyle');
    return quoteStyle.find(e => e.description === configValue).value;
  }

  get importType(): number {
    const configValue = this.workspace.getConfiguration('general').get('importType');
    return importType.find(e => e.description === configValue).value;
  }

  get addSemicolon(): boolean { return this.workspace.getConfiguration('general').get('addSemicolon'); }
  get disableNotifs(): boolean { return this.workspace.getConfiguration('general').get('disableNotifs'); }

  // Javascript

  get jsSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.javascript').get('jsSupport');
    return javascript.find(e => e.description === configValue).value;
  }

  get jsxSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.javascript').get('jsxSupport');
    return javascriptX.find(e => e.description === configValue).value;
  }

  get withExtnameJS(): boolean { return this.workspace.getConfiguration('importStatements.javascript').get('withExtnameJS'); }

  // Typescript

  get tsSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.typescript').get('tsSupport');
    return typescript.find(e => e.description === configValue).value;
  }

  get tsxSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.typescript').get('tsxSupport');
    return typescriptX.find(e => e.description === configValue).value;
  }

  get withExtnameTS(): boolean { return this.workspace.getConfiguration('importStatements.typescript').get('withExtnameTS'); }
  get addExportName(): boolean { return this.workspace.getConfiguration('importStatements.typescript').get('addExportName'); }

  // Stylesheet

  get cssSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('cssSupport');
    return css.find(e => e.description === configValue).value;
  }

  get scssSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('scssSupport');
    return scssSass.find(e => e.description === configValue).value;
  }

  get lessSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('lessSupport');
    return less.find(e => e.description === configValue).value;
  }

  get withExtnameCSS(): boolean { return this.workspace.getConfiguration('importStatements.stylesheet').get('withExtnameCSS'); }

  // Markdown Support

  get markdownSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.markdown').get('markdownSupport');
    return markdown.find(e => e.description === configValue).value;
  }

  get markdownImageSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.markdown').get('markdownImageSupport');
    return markdownImage.find(e => e.description === configValue).value;
  }

  // HTML Support

  get htmlScriptSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.html').get('htmlScriptSupport');
    return HTMLScript.find(e => e.description === configValue).value;
  }
  
  get htmlStylesheetSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.html').get('htmlStylesheetSupport');
    return HTMLStylesheet.find(e => e.description === configValue).value;
  }

}
