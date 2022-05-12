import * as vscode from 'vscode';
import * as path from 'path';
import { EngineEnv } from '../engine/engine_env';

const COMMAND = 'bugfixer.genPatch';

export function registerCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMAND, (key) => generatePatch(key))
    );
}

export function generatePatch(key: string): void {
	EngineEnv.getInstance().get_patch_maker().make_patch(key);
}

export class Patcher implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
		// for each diagnostic entry that has the matching `code`, create a code action command
		return context.diagnostics
			.filter(diagnostic => diagnostic.code === "MEMORY_LEAK")
			.map(diagnostic => this.createCommandCodeAction(document, diagnostic));
	}

	private createCommandCodeAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
	
		const patch_maker = EngineEnv.getInstance().get_patch_maker();
		var src = 0;
		var sink = 0;
		if(diagnostic.tags) {
			src = diagnostic.tags[0];
			sink = diagnostic.tags[1];
		}
		const errorKey = `${path.basename(document.fileName)}_${src}_${sink}`;
		const action = new vscode.CodeAction(`${patch_maker.name}: 패치 만들기`, vscode.CodeActionKind.QuickFix);

		action.command = { command: COMMAND, arguments: [errorKey], title: '패치 생성', tooltip: '현재 오류에 대한 패치를 생성합니다.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}

	private createPatch(document: vscode.TextDocument, range: vscode.Range, key: string) {
		// get patch from file

	}
}