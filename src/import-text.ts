import { Config } from './config-retrival';
import * as camelcase from 'camelcase';

const SINGLE_QUOTES = "\'";
const DOUBLE_QUOTES = "\"";

export class ImportText {

  quote: any;
  importNameText: string;
  relativePath: string;
  isSemicolon: string;
  extname: string;
  param: Config;

  constructor(relativePath: string, extname: string, param: Config) {

    const cleanPath = this.removeExtname(relativePath, extname);

    let  importName = cleanPath.split('/').reverse()[0];
         importName = camelcase(importName, { pascalCase: true });

    this.quote          = param.quoteStyle ? SINGLE_QUOTES : DOUBLE_QUOTES;
    this.importNameText = param.addExportName ? importName : '';
    this.isSemicolon    = param.addSemicolon ? ';' : '';
    this.relativePath   = cleanPath;
    this.extname        = extname;
    this.param          = param;
  }

  removeExtname(relativePath: string, extname: string) {
    const  normalizeLinux   =   relativePath.split('\\').join('/');
    const  normalizeWindows = normalizeLinux.split('//').join('/');
    return normalizeWindows.split(extname)[0];
  }

  get extTS() {
    const quote = this.quote;
    const path = this.relativePath;
    const isSemicolon = this.isSemicolon;
    const importNameText = this.importNameText;
    const isExtname = this.param.withExtnameTS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.tsSupport === 0 ? `import  from ${relativePath}${isSemicolon}\n`
      : this.param.tsSupport === 1    ? `import { ${importNameText} } from ${relativePath}${isSemicolon}\n`
      : this.param.tsSupport === 2    ? `import { ${importNameText} as  } from ${relativePath}${isSemicolon}\n`
      : this.param.tsSupport === 3    ? `import * as ${importNameText} from ${relativePath}${isSemicolon}\n`
      : this.param.tsSupport === 4    ? `import ${relativePath}${isSemicolon}\n` : 0;
  }

  get extJS() {
    const quote = this.quote;
    const path = this.relativePath;
    const isSemicolon = this.isSemicolon;
    const isExtname = this.param.withExtnameJS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.jsSupport === 0 ? `import  from ${relativePath}${isSemicolon}\n`
      : this.param.jsSupport === 1    ? `import {  } from ${relativePath}${isSemicolon}\n`
      : this.param.jsSupport === 2    ? `import {  as  } from ${relativePath}${isSemicolon}\n`
      : this.param.jsSupport === 3    ? `import {  as name } from ${relativePath}${isSemicolon}\n`
      : this.param.jsSupport === 4    ? `import * as  from ${relativePath}${isSemicolon}\n`
      : this.param.jsSupport === 5    ? `import * as name from ${relativePath}${isSemicolon}\n`
      : this.param.jsSupport === 6    ? `import ${relativePath}${isSemicolon}\n`
      : this.param.jsSupport === 7    ? `var  = require(${relativePath})${isSemicolon}\n`
      : this.param.jsSupport === 8    ? `const  = require(${relativePath})${isSemicolon}\n`
      : this.param.jsSupport === 9    ? `var name = require(${relativePath})${isSemicolon}\n`
      : this.param.jsSupport === 10   ? `const name = require(${relativePath})${isSemicolon}\n`
      : this.param.jsSupport === 11   ? `var  = import(${relativePath})${isSemicolon}\n`
      : this.param.jsSupport === 12   ? `const  = import(${relativePath})${isSemicolon}\n`
      : this.param.jsSupport === 13   ? `var name = import(${relativePath})${isSemicolon}\n`
      : this.param.jsSupport === 14   ? `const name = import(${relativePath})${isSemicolon}\n` : 0;
  }

  get extTSX() {
    const quote = this.quote;
    const path = this.relativePath;
    const isSemicolon = this.isSemicolon;
    const importNameText = this.importNameText;
    const isExtname = this.param.withExtnameTS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.tsxSupport === 0 ? `import  from ${relativePath}${isSemicolon}\n`
      : this.param.tsxSupport === 1    ? `import { ${importNameText} } from ${relativePath}${isSemicolon}\n`
      : this.param.tsxSupport === 2    ? `import { ${importNameText} as  } from ${relativePath}${isSemicolon}\n`
      : this.param.tsxSupport === 3    ? `import * as ${importNameText} from ${relativePath}${isSemicolon}\n`
      : this.param.tsxSupport === 4    ? `import ${relativePath}${isSemicolon}\n` : 0;
  }

  get extJSX() {
    const quote = this.quote;
    const path = this.relativePath;
    const isSemicolon = this.isSemicolon;
    const isExtname = this.param.withExtnameJS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.jsxSupport === 0 ? `import  from ${relativePath}${isSemicolon}\n`
      : this.param.jsxSupport === 1    ? `import {  } from ${relativePath}${isSemicolon}\n`
      : this.param.jsxSupport === 2    ? `import {  as  } from ${relativePath}${isSemicolon}\n`
      : this.param.jsxSupport === 3    ? `import {  as name } from ${relativePath}${isSemicolon}\n`
      : this.param.jsxSupport === 4    ? `import * as  from ${relativePath}${isSemicolon}\n`
      : this.param.jsxSupport === 5    ? `import * as name from ${relativePath}${isSemicolon}\n`
      : this.param.jsxSupport === 6    ? `import ${relativePath}${isSemicolon}\n`
      : this.param.jsxSupport === 7    ? `var  = require(${relativePath})${isSemicolon}\n`
      : this.param.jsxSupport === 8    ? `const  = require(${relativePath})${isSemicolon}\n`
      : this.param.jsxSupport === 9    ? `var name = require(${relativePath})${isSemicolon}\n`
      : this.param.jsxSupport === 10   ? `const name = require(${relativePath})${isSemicolon}\n`
      : this.param.jsxSupport === 11   ? `var  = import(${relativePath})${isSemicolon}\n`
      : this.param.jsxSupport === 12   ? `const  = import(${relativePath})${isSemicolon}\n`
      : this.param.jsxSupport === 13   ? `var name = import(${relativePath})${isSemicolon}\n`
      : this.param.jsxSupport === 14   ? `const name = import(${relativePath})${isSemicolon}\n` : 0;
  }


  get extCSS() {
    const quote = this.quote;
    const path = this.relativePath;
    const isSemicolon = this.isSemicolon;
    const isExtname = this.param.withExtnameCSS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.cssSupport === 0 ? `@import ${relativePath}${isSemicolon}\n`
      : this.param.cssSupport === 1    ? `@import url(${relativePath})${isSemicolon}\n` : 0;
  }

  get extSCSS() {
    const quote = this.quote;
    const path = this.relativePath;
    const isSemicolon = this.isSemicolon;
    const isExtname = this.param.withExtnameCSS ? this.extname : '';
    let relativePath = `${quote}${path}${isExtname}${quote}`;
    relativePath = relativePath.replace(/_/gi, '');
    return this.param.scssSupport === 0 ? `@import ${relativePath}${isSemicolon}\n`
      : this.param.scssSupport === 1    ? `@import url(${relativePath})${isSemicolon}\n`
      : this.param.scssSupport === 2    ? `@use ${relativePath}${isSemicolon}\n` : 0;
  }

  get extLESS() {
    const quote = this.quote;
    const path = this.relativePath;
    const isSemicolon = this.isSemicolon;
    const isExtname = this.param.withExtnameCSS ? this.extname : '';
    const relativePath = `${quote}${path}${isExtname}${quote}`;
    return this.param.lessSupport === 0 ? `@import ${relativePath}${isSemicolon}\n`
      : this.param.lessSupport === 1    ? `@import () ${relativePath}${isSemicolon}\n` : 0;
  }

  get convertedImportText() {
    if (this.extname === '.js')        { return this.extJS; }
    else if (this.extname === '.jsx')  { return this.extJSX; }
    else if (this.extname === '.ts')   { return this.extTS; }
    else if (this.extname === '.tsx')  { return this.extTSX; }
    else if (this.extname === '.css')  { return this.extCSS; }
    else if (this.extname === '.scss') { return this.extSCSS; }
    else if (this.extname === '.sass') { return this.extSCSS; }
    else if (this.extname === '.less') { return this.extLESS; }
  }
}
