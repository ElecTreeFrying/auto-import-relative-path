import {
  quoteStyleEnum,
  javascriptEnum, javascriptXEnum,
  typescriptEnum, typescriptXEnum,
  cssEnum, scssSassEnum, lessEnum
} from './config-enum';

export interface Config {
  quoteStyle:     boolean;
  addSemicolon:   boolean;
  disableNotifs:  boolean;
  closeAllNotif:  boolean;
  jsSupport:      number;
  jsxSupport:     number;
  withExtnameJS:  boolean;
  tsSupport:      number;
  tsxSupport:     number;
  withExtnameTS:  boolean;
  addExportName:  boolean;
  cssSupport:     number;
  scssSupport:    number;
  lessSupport:    number;
  withExtnameCSS: boolean;
}

export const configEnum = {
  QUOTESTYLE:     'quoteStyle',
  ADDSEMICOLON:   'addSemicolon',
  DISABLENOTIFS:  'disableNotifs',
  CLOSEALLNOTIF:  'closeAllNotif',
  JSSUPPORT:      'importStatements.javascript.jsSupport',
  JSXSUPPORT:     'importStatements.javascript.jsxSupport',
  WITHEXTNAMEJS:  'importStatements.javascript.withExtnameJS',
  TSSUPPORT:      'importStatements.typescript.tsSupport',
  TSXSUPPORT:     'importStatements.typescript.tsxSupport',
  WITHEXTNAMETS:  'importStatements.typescript.withExtnameTS',
  ADDEXPORTNAME:  'importStatements.typescript.addExportName',
  CSSSUPPORT:     'importStatements.stylesheet.cssSupport',
  SCSSSUPPORT:    'importStatements.stylesheet.scssSupport',
  LESSSUPPORT:    'importStatements.stylesheet.lessSupport',
  WITHEXTNAMECSS: 'importStatements.stylesheet.withExtnameCSS'
}

export class ConfigRetrival {

  private workspace: any = null;

  constructor(workspace: any) {

    this.workspace = workspace;
  }

  get param() {
    return {
      quoteStyle:     this.quoteStyle,
      // importPosition: this.importPosition,
      // importCursor:   this.importCursor,
      addSemicolon:   this.addSemicolon,
      disableNotifs:  this.disableNotifs,
      closeAllNotif:  this.closeAllNotif,
      jsSupport:      this.jsSupport,
      jsxSupport:     this.jsxSupport,
      withExtnameJS:  this.withExtnameJS,
      tsSupport:      this.tsSupport,
      tsxSupport:     this.tsxSupport,
      withExtnameTS:  this.withExtnameTS,
      addExportName:  this.addExportName,
      cssSupport:     this.cssSupport,
      scssSupport:    this.scssSupport,
      lessSupport:    this.lessSupport,
      withExtnameCSS: this.withExtnameCSS,
    }
  }

  // Preferences

  get quoteStyle(): boolean {
    const configValue = this.workspace.getConfiguration().get('quoteStyle');
    return quoteStyleEnum.find(e => e.description === configValue).value;
  }

  // get importPosition(): boolean { return this.workspace.getConfiguration().get('importPosition'); }
  // get importCursor(): boolean { return this.workspace.getConfiguration().get('importCursor'); }
  get addSemicolon(): boolean { return this.workspace.getConfiguration().get('addSemicolon'); }
  get disableNotifs(): boolean { return this.workspace.getConfiguration().get('disableNotifs'); }
  get closeAllNotif(): boolean { return this.workspace.getConfiguration().get('closeAllNotif'); }

  get quoteStyleDefaultValue(): boolean { return this.workspace.getConfiguration().inspect('quoteStyle').defaultValue; }
  // get importPositionDefaultValue(): boolean { return this.workspace.getConfiguration().inspect('importPosition').defaultValue; }
  // get importCursorDefaultValue(): boolean { return this.workspace.getConfiguration().inspect('importCursor').defaultValue; }
  get addSemicolonDefaultValue(): boolean { return this.workspace.getConfiguration().inspect('addSemicolon').defaultValue; }
  get disableNotifsDefaultValue(): boolean { return this.workspace.getConfiguration().inspect('disableNotifs').defaultValue; }
  get closeAllNotifDefaultValue(): boolean { return this.workspace.getConfiguration().inspect('closeAllNotif').defaultValue; }

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

  get jsSupportDefaultValue(): number { return this.workspace.getConfiguration('importStatements.javascript').inspect('jsSupport').defaultValue; }
  get jsxSupportDefaultValue(): number { return this.workspace.getConfiguration('importStatements.javascript').inspect('jsxSupport').defaultValue; }
  get withExtnameJSDefaultValue(): boolean { return this.workspace.getConfiguration('importStatements.javascript').inspect('withExtnameJS').defaultValue; }

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

  get tsSupportDefaultValue(): number { return this.workspace.getConfiguration('importStatements.typescript').inspect('tsSupport').defaultValue; }
  get tsxSupportDefaultValue(): number { return this.workspace.getConfiguration('importStatements.typescript').inspect('tsxSupport').defaultValue; }
  get withExtnameTSDefaultValue(): boolean { return this.workspace.getConfiguration('importStatements.typescript').inspect('withExtnameTS').defaultValue; }
  get addExportNameDefaultValue(): boolean { return this.workspace.getConfiguration('importStatements.typescript').inspect('addExportName').defaultValue; }

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

  get cssSupportDefaultValue(): number { return this.workspace.getConfiguration('importStatements.stylesheet').inspect('cssSupport').defaultValue; }
  get scssSupportDefaultValue(): number { return this.workspace.getConfiguration('importStatements.stylesheet').inspect('scssSupport').defaultValue; }
  get lessSupportDefaultValue(): number { return this.workspace.getConfiguration('importStatements.stylesheet').inspect('lessSupport').defaultValue; }
  get withExtnameCSSDefaultValue(): boolean { return this.workspace.getConfiguration('importStatements.stylesheet').inspect('withExtnameCSS').defaultValue; }

}
