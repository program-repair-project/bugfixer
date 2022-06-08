// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { BugfixerController } from './engine_controller';
import { CodelensProvider } from './results/codelensProvider';
import { subscribeToDocumentChanges } from './results/diagnostics';
import { Patcher, registerCommand } from './results/codeActions';


var disposables: vscode.Disposable[] = [];

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

	let codelensProvider = new CodelensProvider(context);

  vscode.languages.registerCodeLensProvider("*", codelensProvider);
}

// this method is called when your extension is deactivated
export function deactivate() { 
	if (disposables) {
		disposables.forEach(item => item.dispose());
	}
	disposables = [];
}
