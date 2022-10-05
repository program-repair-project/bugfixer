// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { EngineController } from './engine_controller';
import { WebviewController } from './ui/webview_controller';
import { CodelensProvider } from './results/codelensProvider';
import { DiagnosticsProvider } from './results/diagnostics';
import { Patcher, registerCommand } from './results/codeActions';


var disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
	let bugfixerController = new EngineController(context);
	context.subscriptions.push(bugfixerController);

	let bugfixerWebviewController = new WebviewController(context);
	context.subscriptions.push(bugfixerWebviewController);
	
	const diagnostics = new DiagnosticsProvider(context);

	diagnostics.subscribeToDocumentChanges(context);

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
