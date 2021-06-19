import * as vscode from 'vscode';
import {
  quoteStyle, importType,
  javascript, javascriptX,
  typescript, typescriptX,
  css, scssSass, less,
  markdown, markdownImage,
  HTMLScript, HTMLStylesheet
} from './config-enum';

export class ConfigRetrieval {

  constructor(private workspace: any = vscode.workspace) { }

  get param() {
    return {
      // General
      quoteStyle:      this.quoteStyle,      importType:     this.importType,
      addSemicolon:    this.addSemicolon,    disableNotifications:  this.disableNotifications,
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
    return (<any>quoteStyle).find((e: any) => e.description === configValue).value;
  }

  get importType(): number {
    const configValue = this.workspace.getConfiguration('general').get('importType');
    return (<any>importType).find((e: any) => e.description === configValue).value;
  }

  get addSemicolon(): boolean { return this.workspace.getConfiguration('general').get('addSemicolon'); }
  get disableNotifications(): boolean { return this.workspace.getConfiguration('general').get('disableNotifications'); }

  // Javascript

  get jsSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.javascript').get('jsSupport');
    return (<any>javascript).find((e: any) => e.description === configValue).value;
  }

  get jsxSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.javascript').get('jsxSupport');
    return (<any>javascriptX).find((e: any) => e.description === configValue).value;
  }

  get withExtnameJS(): boolean { return this.workspace.getConfiguration('importStatements.javascript').get('withExtnameJS'); }

  // Typescript

  get tsSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.typescript').get('tsSupport');
    return (<any>typescript).find((e: any) => e.description === configValue).value;
  }

  get tsxSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.typescript').get('tsxSupport');
    return (<any>typescriptX).find((e: any) => e.description === configValue).value;
  }

  get withExtnameTS(): boolean { return this.workspace.getConfiguration('importStatements.typescript').get('withExtnameTS'); }
  get addExportName(): boolean { return this.workspace.getConfiguration('importStatements.typescript').get('addExportName'); }

  // Stylesheet

  get cssSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('cssSupport');
    return (<any>css).find((e: any) => e.description === configValue).value;
  }

  get scssSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('scssSupport');
    return (<any>scssSass).find((e: any) => e.description === configValue).value;
  }

  get lessSupport(): number {
    const configValue = this.workspace.getConfiguration('importStatements.stylesheet').get('lessSupport');
    return (<any>less).find((e: any) => e.description === configValue).value;
  }

  get withExtnameCSS(): boolean { return this.workspace.getConfiguration('importStatements.stylesheet').get('withExtnameCSS'); }

  // Markdown Support

  get markdownSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.markdown').get('markdownSupport');
    return (<any>markdown).find((e: any) => e.description === configValue).value;
  }

  get markdownImageSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.markdown').get('markdownImageSupport');
    return (<any>markdownImage).find((e: any) => e.description === configValue).value;
  }

  // HTML Support

  get htmlScriptSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.html').get('htmlScriptSupport');
    return (<any>HTMLScript).find((e: any) => e.description === configValue).value;
  }
  
  get htmlStylesheetSupport() {
    const configValue = this.workspace.getConfiguration('importStatements.html').get('htmlStylesheetSupport');
    return (<any>HTMLStylesheet).find((e: any) => e.description === configValue).value;
  }

}
