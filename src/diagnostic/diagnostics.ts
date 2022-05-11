

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

/** To demonstrate code actions associated with Diagnostics problems, this file provides a mock diagnostics entries. */

import * as vscode from 'vscode';
import * as path from 'path';
import * as util from '../common/util';
import { Bug } from '../dto/bug';
import { EngineEnv } from '../engine/engine_env';

/**
 * Analyzes the text document for problems. 
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param bugfixerDiagnostics diagnostic collection
 */
export function refreshDiagnostics(bugfixerDiagnostics: vscode.DiagnosticCollection): void {
	// read from infer-out/bugs.txt
	const patch_maker = EngineEnv.getInstance().get_patch_maker();

	const results = patch_maker.get_file_bugs_map();

	if(results.size === 0) return;

	const cwd = util.getCwd();

	results.forEach((bugs, file) => {
		const diagnostics: vscode.Diagnostic[] = [];

		const uri = vscode.Uri.file(path.join(cwd, file));
		bugfixerDiagnostics.delete(uri);

		bugs.map(bug => diagnostics.push(createDiagnostic(bug)));
		
		bugfixerDiagnostics.set(uri, diagnostics);
	});
}

function createDiagnostic(bug:Bug): vscode.Diagnostic {
	// create range that represents, where in the document the word is
	const range = new vscode.Range(bug.line - 1, bug.column - 1, bug.line - 1, 999);

	const diagnostic = new vscode.Diagnostic(range, bug.message,
		vscode.DiagnosticSeverity.Warning);
	diagnostic.code = bug.name;
	return diagnostic;
}

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, bugfixerDiagnostics: vscode.DiagnosticCollection): void {
  vscode.commands.registerCommand("bugfixer.refreshBugs", () => {refreshDiagnostics(bugfixerDiagnostics);});
  
  if (vscode.window.activeTextEditor) {
		refreshDiagnostics(bugfixerDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(bugfixerDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(bugfixerDiagnostics))
	);
}