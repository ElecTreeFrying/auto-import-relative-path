import * as vscode from 'vscode';
import * as path from 'path';
import * as relative from 'relative';

import { ImportText } from './import-text';
import { ConfigRetrival, Config, configEnum } from './config-retrival';

let param: Config;

interface Notif {
	editor: vscode.TextEditor;
	isNotSamePath?: boolean;
	activeTEIsValid?: boolean;
	clipboardIsValid?: boolean;
}

function configObserve(context: vscode.ExtensionContext, retrival = new ConfigRetrival(vscode.workspace)) {

	param = retrival.param;

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {

		param.quoteStyle     = e.affectsConfiguration(configEnum.QUOTESTYLE) 		 ? retrival.quoteStyle 		 : param.quoteStyle;
		param.addSemicolon   = e.affectsConfiguration(configEnum.ADDSEMICOLON)   ? retrival.addSemicolon   : param.addSemicolon;
		param.disableNotifs  = e.affectsConfiguration(configEnum.DISABLENOTIFS)  ? retrival.disableNotifs  : param.disableNotifs;
		param.closeAllNotif  = e.affectsConfiguration(configEnum.CLOSEALLNOTIF)  ? retrival.closeAllNotif  : param.closeAllNotif;
		param.jsSupport 		 = e.affectsConfiguration(configEnum.JSSUPPORT) 		 ? retrival.jsSupport 		 : param.jsSupport;
		param.jsxSupport  	 = e.affectsConfiguration(configEnum.JSXSUPPORT) 		 ? retrival.jsxSupport 		 : param.jsxSupport;
		param.withExtnameJS  = e.affectsConfiguration(configEnum.WITHEXTNAMEJS)  ? retrival.withExtnameJS  : param.withExtnameJS;
		param.tsSupport 		 = e.affectsConfiguration(configEnum.TSSUPPORT) 		 ? retrival.tsSupport 		 : param.tsSupport;
		param.tsxSupport 		 = e.affectsConfiguration(configEnum.TSXSUPPORT) 		 ? retrival.tsxSupport 		 : param.tsxSupport;
		param.withExtnameTS  = e.affectsConfiguration(configEnum.WITHEXTNAMETS)  ? retrival.withExtnameTS  : param.withExtnameTS;
		param.addExportName  = e.affectsConfiguration(configEnum.ADDEXPORTNAME)  ? retrival.addExportName  : param.addExportName;
		param.cssSupport 		 = e.affectsConfiguration(configEnum.CSSSUPPORT) 		 ? retrival.cssSupport 		 : param.cssSupport;
		param.scssSupport 	 = e.affectsConfiguration(configEnum.SCSSSUPPORT) 	 ? retrival.scssSupport 	 : param.scssSupport;
		param.lessSupport 	 = e.affectsConfiguration(configEnum.LESSSUPPORT) 	 ? retrival.lessSupport    : param.lessSupport;
		param.withExtnameCSS = e.affectsConfiguration(configEnum.WITHEXTNAMECSS) ? retrival.withExtnameCSS : param.withExtnameCSS;
	}));
}

async function setup(editor: vscode.TextEditor, clipboard: string) {

	const toPath      = editor.document.uri.fsPath;
	const fromPath    = clipboard;
	let relativePath  = <string>relative(toPath, fromPath);
			relativePath  = relativePath.split('\\').join('/');

	const isSameDir   = relativePath[0] !== '.';
			relativePath  = isSameDir ? './'.concat(relativePath) : relativePath;

	const pathExtname = path.extname(relativePath);
	const fromClass   = new ImportText(relativePath, pathExtname, param);
  const importText  = <string>fromClass.convertedImportText;

	const doc = await vscode.window.showTextDocument(editor.document);
	doc.edit((value) => value.insert(new vscode.Position(0,0), importText));
}

function notify(option: Notif) {

	const editor 		= !option.editor;
	const toNotValid 	= !option.activeTEIsValid;
	const fromNotValid = !option.clipboardIsValid;
	const isSame 	  = !option.isNotSamePath;
	const notValid 		= toNotValid || fromNotValid;

	editor 	   ? vscode.window.showErrorMessage(`No active pane.`)
	: isSame   ? vscode.window.showWarningMessage(`Same file path.`)
	: notValid ? vscode.window.showErrorMessage(`Invalid import.`) : 0;
}

export function activate(context: vscode.ExtensionContext) {

	configObserve(context);
	const scripts    = [ '.js', '.jsx', '.ts', '.tsx' ];
	const styles     = [ '.css', '.scss', '.sass', '.less' ];
	const validTypes = [ ...scripts, ...styles ];

	const autoImportCommand = vscode.commands.registerCommand('extension.autoImport', async () => {

		const editor      		 = vscode.window.activeTextEditor;
		if (!editor) { return notify({ editor }) }

		const activeTE 				 = editor.document.uri.fsPath;
		const clipboard 			 = await vscode.env.clipboard.readText();

		const activeTEExtname  = path.extname(activeTE);
		const activeTEIsValid  = validTypes.some((e) => activeTEExtname.includes(e));

		const clipboardExtname = path.extname(clipboard);
		const clipboardIsValid = validTypes.some((e) => clipboardExtname.includes(e));

		const isNotSamePath		 = activeTE.toLowerCase() !== clipboard.toLowerCase();
		const isSameExtname 	 = activeTEExtname === clipboardExtname;
		const isBothValid 		 = activeTEIsValid && clipboardIsValid;


		const isValid 				 = isBothValid && isNotSamePath && isSameExtname;
		const option           = { editor, isNotSamePath, activeTEIsValid, clipboardIsValid };

		if (isValid) { setup(editor, clipboard); }
		else 				 { notify(option); }
	});

	context.subscriptions.push(autoImportCommand);
}

export function deactivate() {}
