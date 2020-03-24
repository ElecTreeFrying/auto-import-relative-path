import * as vscode from 'vscode';
import * as path from 'path';

import { ImportText } from './import-text';
import { ImportPosition } from './import-position';
import { ConfigRetrival, Config, configEnum } from './config-retrival';

let param: Config;

interface Notif {
	editor: vscode.TextEditor;
	isNotSamePath?: boolean;
	activeTEIsValid?: boolean;
	clipboardIsValid?: boolean;
}

interface ImportOption { 
  copy?: boolean, 
  paste?: boolean, 
  import?: boolean 
}

function configObserve(context: vscode.ExtensionContext, retrival = new ConfigRetrival(vscode.workspace)) {

	param = retrival.param;

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {

		param.quoteStyle            = e.affectsConfiguration(configEnum.QUOTESTYLE) 		       ? retrival.quoteStyle 		        : param.quoteStyle;
		param.importType            = e.affectsConfiguration(configEnum.IMPORTTYPE) 		       ? retrival.importType 		        : param.importType;
		param.addSemicolon          = e.affectsConfiguration(configEnum.ADDSEMICOLON)          ? retrival.addSemicolon          : param.addSemicolon;
		param.disableNotifs         = e.affectsConfiguration(configEnum.DISABLENOTIFS)         ? retrival.disableNotifs         : param.disableNotifs;
		param.jsSupport 		        = e.affectsConfiguration(configEnum.JSSUPPORT) 		         ? retrival.jsSupport 		        : param.jsSupport;
		param.jsxSupport  	        = e.affectsConfiguration(configEnum.JSXSUPPORT) 		       ? retrival.jsxSupport 		        : param.jsxSupport;
		param.withExtnameJS         = e.affectsConfiguration(configEnum.WITHEXTNAMEJS)         ? retrival.withExtnameJS         : param.withExtnameJS;
		param.tsSupport 		        = e.affectsConfiguration(configEnum.TSSUPPORT) 		         ? retrival.tsSupport 		        : param.tsSupport;
		param.tsxSupport 		        = e.affectsConfiguration(configEnum.TSXSUPPORT) 		       ? retrival.tsxSupport 		        : param.tsxSupport;
		param.withExtnameTS         = e.affectsConfiguration(configEnum.WITHEXTNAMETS)         ? retrival.withExtnameTS         : param.withExtnameTS;
		param.addExportName         = e.affectsConfiguration(configEnum.ADDEXPORTNAME)         ? retrival.addExportName         : param.addExportName;
		param.cssSupport 		        = e.affectsConfiguration(configEnum.CSSSUPPORT) 		       ? retrival.cssSupport 		        : param.cssSupport;
		param.scssSupport 	        = e.affectsConfiguration(configEnum.SCSSSUPPORT) 	         ? retrival.scssSupport 	        : param.scssSupport;
		param.lessSupport 	        = e.affectsConfiguration(configEnum.LESSSUPPORT) 	         ? retrival.lessSupport           : param.lessSupport;
		param.withExtnameCSS        = e.affectsConfiguration(configEnum.WITHEXTNAMECSS)        ? retrival.withExtnameCSS        : param.withExtnameCSS;
		param.markdownSupport       = e.affectsConfiguration(configEnum.MARKDOWNSUPPORT)       ? retrival.markdownSupport       : param.markdownSupport;
		param.markdownImageSupport  = e.affectsConfiguration(configEnum.MARKDOWNIMAGESUPPORT)  ? retrival.markdownImageSupport  : param.markdownImageSupport;
		param.htmlScriptSupport     = e.affectsConfiguration(configEnum.HTMLSCRIPTSUPPORT)     ? retrival.htmlScriptSupport     : param.htmlScriptSupport;
		param.htmlStylesheetSupport = e.affectsConfiguration(configEnum.HTMLSTYLESHEETSUPPORT) ? retrival.htmlStylesheetSupport : param.htmlStylesheetSupport;
	}));
}

async function setup(editor: vscode.TextEditor, activeTE: string, clipboard: string) {

	await vscode.commands.executeCommand('notifications.clearAll');
	
	const fromClass   = new ImportText(param, activeTE, clipboard);
  const importText  = <string>fromClass.convertedImportText;

	(new ImportPosition(editor, importText, param)).pasteImport();
}

function notify(option: Notif) {

	const toNotValid = !option.activeTEIsValid;
	const fromNotValid = !option.clipboardIsValid;
	const both = (toNotValid && fromNotValid);
	const either = (toNotValid || fromNotValid);

	!option.editor 	        ? vscode.window.showErrorMessage(`No active pane.`)
	: !option.isNotSamePath ? vscode.window.showWarningMessage(`Same file path.`)
	: both || either        ? vscode.window.showErrorMessage(`Invalid import.`) : 0;
}

async function autoImport(option: ImportOption = { copy: false, paste: false, import: false }) {

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
		const editor      		 = vscode.window.activeTextEditor;
		if (!editor) { return notify({ editor }); }

		const activeTE 				 = editor.document.uri.fsPath;
    const clipboard 			 = await vscode.env.clipboard.readText();

		const activeExtname    = path.extname(activeTE);
		const activeIsValid    = validTypes.some((e) => activeExtname.includes(e));
		const clipboardExtname = path.extname(clipboard);
    const clipboardIsValid = validTypes.some((e) => clipboardExtname.includes(e));

    const isMarkdownActive = markup.includes(activeExtname);
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

		if (isValid) { setup(editor, activeTE, clipboard); }
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

	configObserve(context);
	const autoImportPaste = vscode.commands.registerCommand('extension.autoImportPaste', () => autoImport({ paste: true }));
	const autoImportCopy = vscode.commands.registerCommand('extension.autoImportCopy', () => autoImport({ copy: true }));
	const autoImportRelative = vscode.commands.registerCommand('extension.autoImportRelative', () => autoImport({ import: true }));

	context.subscriptions.push(autoImportPaste, autoImportCopy, autoImportRelative);
}

export function deactivate() {}
