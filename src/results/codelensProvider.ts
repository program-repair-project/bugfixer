import * as vscode from 'vscode';
import * as util from '../common/util';
import * as path from 'path';

import { Engine } from "../engine/engine";
import { EngineEnv } from "../engine/engine_env";

import * as constants from "../common/constants";

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    
    constructor(private context: vscode.ExtensionContext) {
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
      this.codeLenses = [];
      const cwd = util.getCwd();

      const patch_maker: Engine = EngineEnv.getInstance().get_patch_maker();

      const diagnostics = vscode.languages.getDiagnostics().filter(d => d[0].path === document.uri.path).map(d => d[1]).reduce((acc, d) => acc.concat(d));
            
			const leaks = diagnostics.filter(diagnostic => diagnostic.code === "MEMORY_LEAK");
			leaks.map(diagnostic => {
        const range = diagnostic.range;
        
        var arr = diagnostic.message.match(/.*at line (\d+).*line (\d+).*/);

        if (arr?.length != 3) return;

        const src = +arr[1];
        const sink = +arr[2];
        const file = document.fileName;

        const errorKey = `${src}_${sink}___${path.relative(cwd, document.fileName).replaceAll('/', '__')}`;
        const patched = path.join(cwd, patch_maker.patched_path, errorKey);

        if(!util.pathExists(patched))
          return;

        if (range) {
          const patchDiff = new vscode.CodeLens(range);
          patchDiff.command = {
            title: `패치 미리보기 (${src} 라인에서 할당됨)`,
            tooltip: `패치 미리보기: ${diagnostic.message}`,
            command: "vscode.diff",
            arguments: [vscode.Uri.file(patched), vscode.Uri.file(file), `패치 미리보기: ${path.basename(file)}}`, {viewColumn: 2, preview: true, preserveFocus: true}]
          };
          this.codeLenses.push(patchDiff);

          const applyPatch = new vscode.CodeLens(range);
          applyPatch.command = {
            title: `패치 적용하기 (${src} 라인에서 할당됨)`,
            tooltip: `패치 적용하기`,
            command: constants.APPLY_PATCH_COMMAND,
            arguments: [file, patched]
          };
          this.codeLenses.push(applyPatch);
        }
      });
      //     
      // }
      return this.codeLenses;
    }
}

