import * as vscode from 'vscode';
import { Config } from './config-retrival';

export class ImportPosition {

  private editor: vscode.TextEditor;
  private importText: string;
  private param: Config;

  constructor(editor: vscode.TextEditor, importText: string, param: Config) {
    this.editor = editor;
    this.importText = importText;
    this.param = param;
  }

  private importToTop() {

    this.editor.edit((active) => {
  		const position = new vscode.Position(0, 0);
  		active.insert(position, this.importText);
  	});
  }

  private importToBottom() {

    const indicators = [
  		'import  from ', 'import { ', 'import {  as  } from ', 'import {  as name } from ',
  		'import * as  from ', 'import * as name from ', 'import * as ', 'import \'', 'import \"',
  		'var  = require(', 'const  = require(', 'var name = require(', 'const name = require(',
  		'var  = import(', 'const  = import(', 'var name = import(', 'const name = import(',
  		'@import \'', '@import \"', '@import url(', '@import () ', '@use \'', '@use \"'
  	];

  	let documentText: any = this.editor.document.getText();
      	documentText      = documentText.split('\n');

  	let lastLine = 0;
  	(<string[]>documentText).forEach((context, line) => {
  		const count = indicators.some((e) => context.includes(e));
  		count ? (lastLine = ++line) : 0;
  	});

  	this.editor.edit((active) => {
  		const position = new vscode.Position(lastLine, 0);
  		active.insert(position, this.importText);
  	});
  }

  private importToCursor() {

    this.editor.edit((active) => {
      const selection = this.editor.selection.anchor.line;
      const position = new vscode.Position(selection, 0);
      active.insert(position, this.importText);
  	});
  }

  pasteImport() {
    this.param.importType === 0   ? this.importToTop()
    : this.param.importType === 1 ? this.importToBottom()
    : this.param.importType === 2 ? this.importToCursor() : 0;
  }

}
