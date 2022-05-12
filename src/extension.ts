// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { BugfixerController } from './engine_controller';
import { subscribeToDocumentChanges } from './results/diagnostics';
import { Patcher, registerCommand } from './results/codeActions';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
		
	let bugfixer = new BugfixerController(context);
	context.subscriptions.push(bugfixer);

	const bugfixerDiagnostics = vscode.languages.createDiagnosticCollection("bugfixer");
	context.subscriptions.push(bugfixerDiagnostics);

	subscribeToDocumentChanges(context, bugfixerDiagnostics);

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('c', new Patcher(), {
			providedCodeActionKinds: Patcher.providedCodeActionKinds
		})
	);
	registerCommand(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
