/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

/** To demonstrate code actions associated with Diagnostics problems, this file provides a mock diagnostics entries. */

import * as vscode from 'vscode';
import * as path from 'path';
import { readFileSync} from 'fs';
import {SaverBug, Bug} from '../bug/bug';
import * as util from '../common/util';

/** Code that is used to associate diagnostic entries with code actions. */
export const EMOJI_MENTION = 'emoji_mention';

/** String to detect in the text document. */
const EMOJI = 'emoji';

/**
 * Analyzes the text document for problems. 
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param emojiDiagnostics diagnostic collection
 */
export function refreshDiagnostics(doc: vscode.TextDocument, emojiDiagnostics: vscode.DiagnosticCollection): void {
	// read from infer-out/bugs.txt
	
  const reportPath = '/home/saver/test/sbuild/linux/sbuild2/infer-out/report.json';

  if(!util.pathExists(reportPath)) return;
    
  const jsonString = readFileSync('/home/saver/test/sbuild/linux/sbuild2/infer-out/report.json', 'utf-8');
	const data: SaverBug[] = JSON.parse(jsonString);
	
	// get file, severity, code, message, line, column
	const bugs: Bug[] = data.filter(d => d.kind === "ERROR").map(d => SaverBug.toBug(d));
	const files = Array.from(new Set(bugs.map(b => b.file)));

	// create diagnostics
	files.map(f => {
		const uri = vscode.Uri.file(path.join('/home/saver/test/sbuild/linux/sbuild2', f));
		emojiDiagnostics.delete(uri);
		const diagnostics: vscode.Diagnostic[] = [];

		const file_bugs = bugs.filter(b => (b.file === f));
		file_bugs.map(bug => diagnostics.push(createDiagnostic(bug)));
		emojiDiagnostics.set(uri, diagnostics);
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

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, emojiDiagnostics: vscode.DiagnosticCollection): void {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, emojiDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, emojiDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, emojiDiagnostics))
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => emojiDiagnostics.delete(doc.uri))
	);

}