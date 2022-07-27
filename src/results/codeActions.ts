import * as vscode from 'vscode';
import * as path from 'path';
import { EngineEnv } from '../engine/engine_env';
import { getCwd } from '../common/util';

const GEN_PATCH_COMMAND = 'bugfixer.genPatch';
const DIFF_PATCH_COMMAND = 'bugfixer.diffPatch';
const APPLY_PATCH_COMMAND = 'bugfixer.applyPatch';

export function registerCommand(context: vscode.ExtensionContext) {
	context.subscriptions.push(
			vscode.commands.registerCommand(GEN_PATCH_COMMAND, (key) => generatePatch(key))
	);
	context.subscriptions.push(
		vscode.commands.registerCommand(APPLY_PATCH_COMMAND, (key) => applyPatch(key))
	);
}

export function generatePatch(key: string): void {
	EngineEnv.getInstance().get_patch_maker().make_patch(key);
}

export function applyPatch(key: string): void {
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
		const errorKey = `${src}_${sink}___${path.relative(getCwd(), document.fileName).replaceAll('/', '__')}`;
		const action = new vscode.CodeAction(`${patch_maker.name}: 패치 만들기 ${src}`, vscode.CodeActionKind.QuickFix);

		action.command = { command: GEN_PATCH_COMMAND, arguments: [errorKey], title: `패치 생성`, tooltip: '현재 오류에 대한 패치를 생성합니다.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}
}