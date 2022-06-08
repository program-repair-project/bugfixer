import * as vscode from 'vscode';
import * as util from '../common/util';
import * as path from 'path';

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

      const diagnostics = vscode.languages.getDiagnostics().filter(d => d[0].path === document.uri.path).map(d => d[1]).reduce((acc, d) => acc.concat(d));
            
			const leaks = diagnostics.filter(diagnostic => diagnostic.code === "MEMORY_LEAK");
			leaks.map(diagnostic => {
        const range = diagnostic.range;
        
        var arr = diagnostic.message.match(/.*at line (\d+).*line (\d+).*/);

        if (arr?.length != 3) return;

        const src = +arr[1];
        const sink = +arr[2];
        const file = document.fileName;

        const errorKey = `${src}_${sink}___${path.basename(document.fileName)}`;
        const patched = path.join(cwd, "patched", errorKey);

        if(!util.pathExists(patched))
          return;

        if (range) {
          const lens = new vscode.CodeLens(range);
          lens.command = {
            title: `패치 미리보기 (${src})`,
            tooltip: `패치 미리보기: ${diagnostic.message}`,
            command: "vscode.diff",
            arguments: [vscode.Uri.file(file), vscode.Uri.file(patched)]
          };
          this.codeLenses.push(lens);
        }
      });
      //     
      // }
      return this.codeLenses;
    }
}

