import * as path from 'path';
import relative from 'relative';
import camelcase from 'camelcase';

import { Config } from './interfaces/auto-import.interface';

const SINGLE_QUOTES = "\'";
const DOUBLE_QUOTES = "\"";

export class ImportText {

  quote: any;
  isSemicolon: string;
  importNameText: string;
  relativePath: string;
  extname: string;

  activeExtname: string;

  validImagesFormats = [ '.gif', '.jpeg', '.jpg', '.png' ];

  constructor(private param: Config, toPath: string, fromPath: string) {

      let relativePath = relative(toPath, fromPath);
  			  relativePath = relativePath.split('\\').join('/');
  	const isSameDir    = relativePath[0] !== '.';
  		   	relativePath = isSameDir ? './'.concat(relativePath) : relativePath;

  	const extname    = path.extname(relativePath);
    const cleanPath  = this.removeExtname(relativePath, extname);
     let  importName = cleanPath.split('/').reverse()[0];
          importName = camelcase(importName, { pascalCase: true });

    this.quote          = param.quoteStyle ? SINGLE_QUOTES : DOUBLE_QUOTES;
    this.importNameText = param.addExportName ? importName : '';
    this.isSemicolon    = param.addSemicolon ? ';' : '';
    this.relativePath   = cleanPath;
    this.extname        = extname;
    this.param          = param;

    this.activeExtname = path.extname(toPath);
  }

  removeExtname(relativePath: string, extname: string) {
    const  normalizeLinux   =   relativePath.split('\\').join('/');
    const  normalizeWindows = normalizeLinux.split('//').join('/');
    return normalizeWindows.split(extname)[0];
  }

  private get extTS() {
    const quote          = this.quote;
    const path           = this.relativePath;
    const isSemicolon    = this.isSemicolon;
    const importNameText = this.importNameText;
    const isExtname      = this.param.withExtnameTS ? this.extname : '';
    const relativePath   = `${quote}${path}${isExtname}${quote}`;
    return this.param.tsSupport === 0 ? `import  from ${relativePath}${isSemicolon}\n`
         : this.param.tsSupport === 1 ? `import { ${importNameText} } from ${relativePath}${isSemicolon}\n`
         : this.param.tsSupport === 2 ? `import { ${importNameText} as  } from ${relativePath}${isSemicolon}\n`
         : this.param.tsSupport === 3 ? `import * as ${importNameText} from ${relativePath}${isSemicolon}\n`
         : this.param.tsSupport === 4 ? `import ${relativePath}${isSemicolon}\n` : 0;
  }

  private get extJS() {
    const quote        = this.quote;
    const path         = this.relativePath;
    const isSemicolon  = this.isSemicolon;
    const isExtname    = this.param.withExtnameJS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.jsSupport === 0 ? `import  from ${relativePath}${isSemicolon}\n`
         : this.param.jsSupport === 1 ? `import {  } from ${relativePath}${isSemicolon}\n`
         : this.param.jsSupport === 2 ? `import {  as  } from ${relativePath}${isSemicolon}\n`
         : this.param.jsSupport === 3 ? `import {  as name } from ${relativePath}${isSemicolon}\n`
         : this.param.jsSupport === 4 ? `import * as  from ${relativePath}${isSemicolon}\n`
         : this.param.jsSupport === 5 ? `import * as name from ${relativePath}${isSemicolon}\n`
         : this.param.jsSupport === 6 ? `import ${relativePath}${isSemicolon}\n`
         : this.param.jsSupport === 7 ? `var  = require(${relativePath})${isSemicolon}\n`
         : this.param.jsSupport === 8 ? `const  = require(${relativePath})${isSemicolon}\n`
         : this.param.jsSupport === 9 ? `var name = require(${relativePath})${isSemicolon}\n`
        : this.param.jsSupport === 10 ? `const name = require(${relativePath})${isSemicolon}\n`
        : this.param.jsSupport === 11 ? `var  = import(${relativePath})${isSemicolon}\n`
        : this.param.jsSupport === 12 ? `const  = import(${relativePath})${isSemicolon}\n`
        : this.param.jsSupport === 13 ? `var name = import(${relativePath})${isSemicolon}\n`
        : this.param.jsSupport === 14 ? `const name = import(${relativePath})${isSemicolon}\n` : 0;
  }

  private get extTSX() {
    const quote          = this.quote;
    const path           = this.relativePath;
    const isSemicolon    = this.isSemicolon;
    const importNameText = this.importNameText;
    const isExtname      = this.param.withExtnameTS ? this.extname : '';
    const relativePath   = `${quote}${path}${isExtname}${quote}`;
    return this.param.tsxSupport === 0 ? `import  from ${relativePath}${isSemicolon}\n`
         : this.param.tsxSupport === 1 ? `import { ${importNameText} } from ${relativePath}${isSemicolon}\n`
         : this.param.tsxSupport === 2 ? `import { ${importNameText} as  } from ${relativePath}${isSemicolon}\n`
         : this.param.tsxSupport === 3 ? `import * as ${importNameText} from ${relativePath}${isSemicolon}\n`
         : this.param.tsxSupport === 4 ? `import ${relativePath}${isSemicolon}\n` : 0;
  }

  private get extJSX() {
    const quote        = this.quote;
    const path         = this.relativePath;
    const isSemicolon  = this.isSemicolon;
    const isExtname    = this.param.withExtnameJS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.jsxSupport === 0 ? `import  from ${relativePath}${isSemicolon}\n`
         : this.param.jsxSupport === 1 ? `import {  } from ${relativePath}${isSemicolon}\n`
         : this.param.jsxSupport === 2 ? `import {  as  } from ${relativePath}${isSemicolon}\n`
         : this.param.jsxSupport === 3 ? `import {  as name } from ${relativePath}${isSemicolon}\n`
         : this.param.jsxSupport === 4 ? `import * as  from ${relativePath}${isSemicolon}\n`
         : this.param.jsxSupport === 5 ? `import * as name from ${relativePath}${isSemicolon}\n`
         : this.param.jsxSupport === 6 ? `import ${relativePath}${isSemicolon}\n`
         : this.param.jsxSupport === 7 ? `var  = require(${relativePath})${isSemicolon}\n`
         : this.param.jsxSupport === 8 ? `const  = require(${relativePath})${isSemicolon}\n`
         : this.param.jsxSupport === 9 ? `var name = require(${relativePath})${isSemicolon}\n`
        : this.param.jsxSupport === 10 ? `const name = require(${relativePath})${isSemicolon}\n`
        : this.param.jsxSupport === 11 ? `var  = import(${relativePath})${isSemicolon}\n`
        : this.param.jsxSupport === 12 ? `const  = import(${relativePath})${isSemicolon}\n`
        : this.param.jsxSupport === 13 ? `var name = import(${relativePath})${isSemicolon}\n`
        : this.param.jsxSupport === 14 ? `const name = import(${relativePath})${isSemicolon}\n` : 0;
  }

  private get extCSS() {
    const quote        = this.quote;
    const path         = this.relativePath;
    const isSemicolon  = this.isSemicolon;
    const isExtname    = this.param.withExtnameCSS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.cssSupport === 0 ? `@import ${relativePath}${isSemicolon}\n`
         : this.param.cssSupport === 1 ? `@import url(${relativePath})${isSemicolon}\n` : 0;
  }

  private get extSCSS() {
    const quote        = this.quote;
    const path         = this.relativePath;
    const isSemicolon  = this.isSemicolon;
    const isExtname    = this.param.withExtnameCSS ? this.extname : '';
      let relativePath = `${quote}${path}${isExtname}${quote}`;
          relativePath = relativePath.replace(/_/gi, '');
          
    return this.param.scssSupport === 0 ? `@import ${relativePath}${isSemicolon}\n`
         : this.param.scssSupport === 1 ? `@import url(${relativePath})${isSemicolon}\n`
         : this.param.scssSupport === 2 ? `@use ${relativePath}${isSemicolon}\n` : 0;
  }

  private get extLESS() {
    const quote        = this.quote;
    const path         = this.relativePath;
    const isSemicolon  = this.isSemicolon;
    const isExtname    = this.param.withExtnameCSS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.lessSupport === 0 ? `@import ${relativePath}${isSemicolon}\n`
         : this.param.lessSupport === 1 ? `@import () ${relativePath}${isSemicolon}\n` : 0;
  }

  private get extMD() {
      let path         = this.relativePath;
          path         = path.startsWith('./') ? path.slice(2) : path; 
    const relativePath = `${path}${this.extname}`;
    return this.param.markdownSupport === 0 ? `![text](${relativePath})\n`: 0;
  }

  private get extImgMD() {
      let path         =  this.relativePath;
          path         = path.startsWith('./') ? path.slice(2) : path; 
    const relativePath = `${path}${this.extname}`;
    return this.param.markdownImageSupport === 0 ? `markdown![alt-text](${relativePath} \"Hover text\")\n`
         : this.param.markdownImageSupport === 1 ? `markdown![alt text][logo]\n\n[logo]: ${relativePath}  "Hover text"\n` : 0;
  }

  private get extHTMLScriptSupport() {
      let path         = this.relativePath;
    const relativePath = `${path}${this.extname}`;
    return this.param.htmlScriptSupport === 0 ? `markdown<script type="text/javascript" src="${relativePath}"></script>\n`: 0;
  }
  
  private get extHTMLStylesheetSupport() {
      let path         = this.relativePath;
    const relativePath = `${path}${this.extname}`;
    return this.param.htmlStylesheetSupport === 0 ? `markdown<link href="${relativePath}" rel="stylesheet">`: 0;
  }

  get convertedImportText() {
     if (this.extname === '.js' && this.activeExtname === '.html') { 
      return this.extHTMLScriptSupport; 
    } else if (this.extname === '.css' && this.activeExtname === '.html') { 
      return this.extHTMLStylesheetSupport; 
    } else if (this.validImagesFormats.includes(this.extname) && this.activeExtname !== '.html') { 
      return this.extImgMD; 
    }
    else if (this.extname === '.js'   && this.activeExtname !== '.html') { return this.extJS;   }
    else if (this.extname === '.jsx'  && this.activeExtname !== '.html') { return this.extJSX;  } 
    else if (this.extname === '.ts'   && this.activeExtname !== '.html') { return this.extTS;   }
    else if (this.extname === '.tsx'  && this.activeExtname !== '.html') { return this.extTSX;  }
    else if (this.extname === '.css'  && this.activeExtname !== '.html') { return this.extCSS;  }
    else if (this.extname === '.scss' && this.activeExtname !== '.html') { return this.extSCSS; }
    else if (this.extname === '.sass' && this.activeExtname !== '.html') { return this.extSCSS; }
    else if (this.extname === '.less' && this.activeExtname !== '.html') { return this.extLESS; }
    else if (this.extname === '.md'   && this.activeExtname !== '.html') { return this.extMD;   }
  }
}
