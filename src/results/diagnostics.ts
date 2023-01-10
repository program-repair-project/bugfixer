/*---------------------------------------------------------
 * Copyright (C) Sparrow Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import * as util from '../common/util';
import { Bug } from '../dto/bug';
import { EngineEnv } from '../engine/engine_env';


export class PatchLineInfo {
	public constructor(
        public readonly uri: string,
        public readonly lines: number[]
    ) {}
}

export class DiagnosticsProvider {
	
	private bugfixerDiagnostics: vscode.DiagnosticCollection;

	public constructor(context: vscode.ExtensionContext) {
		this.bugfixerDiagnostics = vscode.languages.createDiagnosticCollection("bugfixer");
		context.subscriptions.push(this.bugfixerDiagnostics);

		vscode.commands.registerCommand("bugfixer.clearDiag", () => this.clearDiagnostics());
		vscode.commands.registerCommand("bugfixer.refreshBugs", () => this.refreshDiagnostics());
	}

	private clearDiagnostics() {
		this.bugfixerDiagnostics.clear();
	}

	public refreshDiagnostics(): void {
		// create saver diags
		// read from infer-out/report.json
		const patch_maker = EngineEnv.getInstance().get_patch_maker();

		let originals: string[] = []
		const results = patch_maker.get_file_bugs_map();
		
		if(results.size === 0) return;

		const cwd = util.getCwd();

		results.forEach((bugs, file) => {
			const diagnostics: vscode.Diagnostic[] = [];
			const uri = vscode.Uri.file(path.join(cwd, file));
			
			this.bugfixerDiagnostics.delete(uri);

			bugs.map(bug => {
					if(EngineEnv.getInstance().get_currnet_engine() === "saver" && bug.name === "MEMORY_LEAK")
						diagnostics.push(this.createDiagnostic(uri, bug));
				});
			this.bugfixerDiagnostics.set(uri, diagnostics);
		});

	}

	private createDiagnostic(uri: vscode.Uri, bug:Bug): vscode.Diagnostic {
		// create range that represents, where in the document the word is
		const range = new vscode.Range(bug.line - 1, bug.column - 1, bug.line - 1, 999);

		const diagnostic = new vscode.Diagnostic(range, bug.message,
			vscode.DiagnosticSeverity.Error);

		diagnostic.code = bug.name;
		diagnostic.tags = [bug.src_line, bug.sink_line];
		
		if(bug.name == 'MEMORY_LEAK') {
			const navigationList = [{line: bug.src_line, msg: "에서 할당 됨"}, {line: bug.sink_line, msg: "에서 오류 발생"}];
			
			diagnostic.relatedInformation = navigationList.map((navi) => {
				// line이 0보다 작아지지 않도록 함
				if(navi.line <= 0) navi.line = 1;
				
				return new vscode.DiagnosticRelatedInformation(
					new vscode.Location(uri,
							new vscode.Range(new vscode.Position(navi.line - 1, 0), new vscode.Position(navi.line - 1, 999))),
					navi.msg);
			});
		}

		return diagnostic;
	}
	
	public subscribeToDocumentChanges(context: vscode.ExtensionContext): void {
		if (vscode.window.activeTextEditor) {
			this.refreshDiagnostics();
		}
		context.subscriptions.push(
			vscode.window.onDidChangeActiveTextEditor(editor => {
				if (editor) {
					this.bugfixerDiagnostics.clear();
					this.refreshDiagnostics();
				}
			})
		);

		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument(e => this.refreshDiagnostics())
		);
	}

}
