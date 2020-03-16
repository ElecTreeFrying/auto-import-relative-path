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

function configObserve(context: vscode.ExtensionContext, retrival = new ConfigRetrival(vscode.workspace)) {

	param = retrival.param;

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {

		param.quoteStyle     = e.affectsConfiguration(configEnum.QUOTESTYLE) 		 ? retrival.quoteStyle 		 : param.quoteStyle;
		param.importType     = e.affectsConfiguration(configEnum.IMPORTTYPE) 		 ? retrival.importType 		 : param.importType;
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

export function activate(context: vscode.ExtensionContext) {

	configObserve(context);
	const scripts    = [ '.js', '.jsx', '.ts', '.tsx' ];
	const styles     = [ '.css', '.scss', '.sass', '.less' ];
	const validTypes = [ ...scripts, ...styles ];

	const autoImportPaste = vscode.commands.registerCommand('extension.autoImportPaste', async () => {

		await vscode.commands.executeCommand('notifications.clearAll');
		const editor      		 = vscode.window.activeTextEditor;
		if (!editor) { return notify({ editor }); }

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

		if (isValid) { setup(editor, activeTE, clipboard); }
		else 				 { notify(option); }
	});

	const autoImportCopy = vscode.commands.registerCommand('extension.autoImportCopy', async () => {
		
		await vscode.commands.executeCommand('notifications.clearAll');
		await vscode.commands.executeCommand('copyFilePath');

		const active = await vscode.env.clipboard.readText();
		const extname = path.extname(active);
		const isValid = validTypes.some((e) => extname.includes(e));
		const file = path.basename(active);

		if (isValid) {
			vscode.env.clipboard.writeText(active);
			vscode.window.showInformationMessage(`Copied: ${file}`);
		}
	});

	context.subscriptions.push(autoImportPaste, autoImportCopy);
}

export function deactivate() {}
