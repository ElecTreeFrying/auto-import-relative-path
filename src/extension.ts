import * as vscode from 'vscode';
import * as path from 'path';

import { ImportText } from './import-text';
import { ImportPosition } from './import-position';
import { ConfigRetrieval } from './config-retrieval';

import { section } from './data/extension-settings';
import { Notification, ImportOption, Config } from './interfaces/auto-import.interface';

let param: Config;

function configObserve(retrieval = new ConfigRetrieval(vscode.workspace)) {

	param = retrieval.param;

  return vscode.workspace.onDidChangeConfiguration((config: vscode.ConfigurationChangeEvent) => {
		param.quoteStyle            = config.affectsConfiguration(section.quoteStyle) 		       ? retrieval.quoteStyle 		       : param.quoteStyle;
		param.importType            = config.affectsConfiguration(section.importType) 		       ? retrieval.importType 		       : param.importType;
		param.addSemicolon          = config.affectsConfiguration(section.addSemicolon)          ? retrieval.addSemicolon          : param.addSemicolon;
		param.disableNotifications  = config.affectsConfiguration(section.disableNotifications)  ? retrieval.disableNotifications  : param.disableNotifications;
		param.jsSupport 		        = config.affectsConfiguration(section.jsSupport) 		         ? retrieval.jsSupport 		         : param.jsSupport;
		param.jsxSupport  	        = config.affectsConfiguration(section.jsxSupport) 		       ? retrieval.jsxSupport 		       : param.jsxSupport;
		param.withExtnameJS         = config.affectsConfiguration(section.withExtNameJs)         ? retrieval.withExtnameJS         : param.withExtnameJS;
		param.tsSupport 		        = config.affectsConfiguration(section.tsSupport) 		         ? retrieval.tsSupport 		         : param.tsSupport;
		param.tsxSupport 		        = config.affectsConfiguration(section.tsxSupport) 		       ? retrieval.tsxSupport 		       : param.tsxSupport;
		param.withExtnameTS         = config.affectsConfiguration(section.withExtNameTs)         ? retrieval.withExtnameTS         : param.withExtnameTS;
		param.addExportName         = config.affectsConfiguration(section.addExportName)         ? retrieval.addExportName         : param.addExportName;
		param.cssSupport 		        = config.affectsConfiguration(section.cssSupport) 		       ? retrieval.cssSupport 		       : param.cssSupport;
		param.scssSupport 	        = config.affectsConfiguration(section.scssSupport) 	         ? retrieval.scssSupport 	         : param.scssSupport;
		param.lessSupport 	        = config.affectsConfiguration(section.lessSupport) 	         ? retrieval.lessSupport           : param.lessSupport;
		param.withExtnameCSS        = config.affectsConfiguration(section.withExtNameCSS)        ? retrieval.withExtnameCSS        : param.withExtnameCSS;
		param.markdownSupport       = config.affectsConfiguration(section.markdownSupport)       ? retrieval.markdownSupport       : param.markdownSupport;
		param.markdownImageSupport  = config.affectsConfiguration(section.markdownImageSupport)  ? retrieval.markdownImageSupport  : param.markdownImageSupport;
		param.htmlScriptSupport     = config.affectsConfiguration(section.htmlScriptSupport)     ? retrieval.htmlScriptSupport     : param.htmlScriptSupport;
		param.htmlStylesheetSupport = config.affectsConfiguration(section.htmlStylesheetSupport) ? retrieval.htmlStylesheetSupport : param.htmlStylesheetSupport;
	});
}

async function process(editor: vscode.TextEditor, activeTE: string, clipboard: string) {

	await vscode.commands.executeCommand('notifications.clearAll');
	
	const fromClass   = new ImportText(param, activeTE, clipboard);
  const importText  = <string>fromClass.convertedImportText;

	(new ImportPosition(editor, importText, param)).pasteImport();
}

function notify(option: Notification) {

	const toNotValid = !option.activeEditorIsValid;
	const fromNotValid = !option.clipboardIsValid;
	const both = (toNotValid && fromNotValid);
	const either = (toNotValid || fromNotValid);

	!option.editor 	        ? vscode.window.showErrorMessage(`No active pane.`)
	: !option.isNotSamePath ? vscode.window.showWarningMessage(`Same file path.`)
	: both || either        ? vscode.window.showErrorMessage(`Invalid import.`) : 0;
}

async function setup(option: ImportOption = { copy: false, paste: false, import: false }) {

  const scripts    = [ '.js', '.jsx', '.ts', '.tsx' ];
	const styles     = [ '.css', '.scss', '.sass', '.less' ];
	const images     = [ '.gif', '.jpeg', '.jpg', '.png' ];
	const markup     = [ '.md', '.html' ];
	const validTypes = [ ...scripts, ...styles, ...images, ...markup ];
  const html       = [ '.js', '.css' ];

  const copy = async () => {
    await vscode.commands.executeCommand('notifications.clearAll');
		await vscode.commands.executeCommand('copyFilePath');

		const active = await vscode.env.clipboard.readText();
		const extname = path.extname(active);
		const isValid = validTypes.some((e) => extname.includes(e));
		const file = path.basename(active);

		if (isValid) {
			vscode.env.clipboard.writeText(active);
			vscode.window.showInformationMessage(`Auto Import: Copied: ${file}`);
		}
  };

  const paste = async () => {

    await vscode.commands.executeCommand('notifications.clearAll');

		const editor      		 = <vscode.TextEditor>vscode.window.activeTextEditor;
    
    if (!editor) { return notify({ editor }); }

		const activeTE 				 = editor.document.uri.fsPath;
    const clipboard 			 = await vscode.env.clipboard.readText();

		const activeExtname    = path.extname(activeTE);
		const clipboardExtname = path.extname(clipboard);
		const activeIsValid    = validTypes.some((e) => activeExtname.includes(e));
    const clipboardIsValid = validTypes.some((e) => clipboardExtname.includes(e));

    const isMarkdownActive = activeExtname === '.md';
    const isImageClipboard = images.includes(clipboardExtname);
    const imageMDSupport   = isMarkdownActive && isImageClipboard;

    const isHTMLActive     = activeExtname === '.html';
    const isValidClipboard = html.some((e) => clipboardExtname.includes(e));
    const htmlSupport      = isHTMLActive && isValidClipboard;

		const isNotSamePath		 = activeTE.toLowerCase() !== clipboard.toLowerCase();
		const isSameExtname 	 = activeExtname === clipboardExtname;
		const isBothValid 		 = activeIsValid && clipboardIsValid;

    const isValid 				 = (isBothValid && isNotSamePath && isSameExtname) || imageMDSupport || htmlSupport;
    const option           = { editor, isNotSamePath, activeIsValid, clipboardIsValid };

		if (isValid) { process(editor, activeTE, clipboard); }
		else 				 { notify(option); }
  };

  if (option.copy) {
    await copy();
  } else if (option.paste) {
    await paste();
  } else if (option.import) {
    await copy();
    await paste();
  }
}

export function activate(context: vscode.ExtensionContext) {

	const autoImportPaste = vscode.commands.registerCommand('extension.autoImportPaste', () => setup({ paste: true }));
	const autoImportCopy = vscode.commands.registerCommand('extension.autoImportCopy', () => setup({ copy: true }));
	const autoImportRelative = vscode.commands.registerCommand('extension.autoImportRelative', () => setup({ import: true }));

	context.subscriptions.push(configObserve(), autoImportPaste, autoImportCopy, autoImportRelative);
}

export function deactivate() {}
