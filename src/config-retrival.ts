import {
  quoteStyleEnum, importTypeEnum,
  javascriptEnum, javascriptXEnum,
  typescriptEnum, typescriptXEnum,
  cssEnum, scssSassEnum, lessEnum,
  markdownEnum, markdownImageEnum,
  HTMLScriptEnum, HTMLStylesheetEnum
} from './config-enum';

export interface Config {
  quoteStyle:      boolean; importType:           number;
  addSemicolon:    boolean; disableNotifs:        boolean;
  jsSupport:       number;  jsxSupport:           number;
  withExtnameJS:   boolean;
  tsSupport:       number;  tsxSupport:           number;
  withExtnameTS:   boolean; addExportName:        boolean;
  cssSupport:      number;  scssSupport:          number;
  lessSupport:     number;  withExtnameCSS:       boolean;
  markdownSupport: number;  markdownImageSupport: number;
  htmlScriptSupport: number, htmlStylesheetSupport: number;
}

export const configEnum = {
  QUOTESTYLE:      'quoteStyle',       IMPORTTYPE:     'importType',
  ADDSEMICOLON:    'addSemicolon',     DISABLENOTIFS:  'disableNotifs',
  JSSUPPORT:       'importStatements.javascript.jsSupport',
  JSXSUPPORT:      'importStatements.javascript.jsxSupport',
  WITHEXTNAMEJS:   'importStatements.javascript.withExtnameJS',
  TSSUPPORT:       'importStatements.typescript.tsSupport',
  TSXSUPPORT:      'importStatements.typescript.tsxSupport',
  WITHEXTNAMETS:   'importStatements.typescript.withExtnameTS',
  ADDEXPORTNAME:   'importStatements.typescript.addExportName',
  CSSSUPPORT:      'importStatements.stylesheet.cssSupport',
  SCSSSUPPORT:     'importStatements.stylesheet.scssSupport',
  LESSSUPPORT:     'importStatements.stylesheet.lessSupport',
  WITHEXTNAMECSS:  'importStatements.stylesheet.withExtnameCSS',
  MARKDOWNIMAGESUPPORT:  'importStatements.markdown.markdownImageSupport',
  MARKDOWNSUPPORT:       'importStatements.markdown.markdownSupport',
  HTMLSCRIPTSUPPORT:     'importStatements.markdown.htmlScriptSupport',
  HTMLSTYLESHEETSUPPORT: 'importStatements.markdown.htmlStylesheetSupport'
};

export class ConfigRetrival {

  private workspace: any = null;

  constructor(workspace: any) {

    this.workspace = workspace;
  }

  get param() {
    return {
      quoteStyle:      this.quoteStyle,      importType:     this.importType,
      addSemicolon:    this.addSemicolon,    disableNotifs:  this.disableNotifs,
      jsSupport:       this.jsSupport,       jsxSupport:     this.jsxSupport,
      withExtnameJS:   this.withExtnameJS,
      tsSupport:       this.tsSupport,       tsxSupport:     this.tsxSupport,
      withExtnameTS:   this.withExtnameTS,   addExportName:  this.addExportName,
      cssSupport:      this.cssSupport,      scssSupport:    this.scssSupport,
      lessSupport:     this.lessSupport,     withExtnameCSS: this.withExtnameCSS,
      markdownSupport: this.markdownSupport, markdownImageSupport: this.markdownImageSupport,
      htmlScriptSupport: this.htmlScriptSupport, htmlStylesheetSupport: this.htmlStylesheetSupport
    };
  }

  // Preferences

  get quoteStyle(): boolean {
    const configValue = this.workspace.getConfiguration().get('quoteStyle');
    return quoteStyleEnum.find(e => e.description === configValue).value;
  }

  get importType(): number {
    const configValue = this.workspace.getConfiguration().get('importType');
    return importTypeEnum.find(e => e.description === configValue).value;
  }

  get addSemicolon(): boolean { return this.workspace.getConfiguration().get('addSemicolon'); }
  get disableNotifs(): boolean { return this.workspace.getConfiguration().get('disableNotifs'); }

  // Javascript

  get jsSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.javascript').get('jsSupport');
    return javascriptEnum.find(e => e.description === configValue).value;
  }

  get jsxSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.javascript').get('jsxSupport');
    return javascriptXEnum.find(e => e.description === configValue).value;
  }

  get withExtnameJS(): boolean { return this.workspace.getConfiguration('importStatements.javascript').get('withExtnameJS'); }

  // Typescript

  get tsSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.typescript').get('tsSupport');
    return typescriptEnum.find(e => e.description === configValue).value;
  }

  get tsxSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.typescript').get('tsxSupport');
    return typescriptXEnum.find(e => e.description === configValue).value;
  }

  get withExtnameTS(): boolean { return this.workspace.getConfiguration('importStatements.typescript').get('withExtnameTS'); }
  get addExportName(): boolean { return this.workspace.getConfiguration('importStatements.typescript').get('addExportName'); }

  // Stylesheet

  get cssSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('cssSupport');
    return cssEnum.find(e => e.description === configValue).value;
  }

  get scssSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('scssSupport');
    return scssSassEnum.find(e => e.description === configValue).value;
  }

  get lessSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('lessSupport');
    return lessEnum.find(e => e.description === configValue).value;
  }

  get withExtnameCSS(): boolean { return this.workspace.getConfiguration('importStatements.stylesheet').get('withExtnameCSS'); }

  // Markdown Support

  get markdownSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.markdown').get('markdownSupport');
    return markdownEnum.find(e => e.description === configValue).value;
  }

  get markdownImageSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.markdown').get('markdownImageSupport');
    return markdownImageEnum.find(e => e.description === configValue).value;
  }

  // HTML Support

  get htmlScriptSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.html').get('htmlScriptSupport');
    return HTMLScriptEnum.find(e => e.description === configValue).value;
  }
  
  get htmlStylesheetSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.html').get('htmlStylesheetSupport');
    return HTMLStylesheetEnum.find(e => e.description === configValue).value;
  }

}
