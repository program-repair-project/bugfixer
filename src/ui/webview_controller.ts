import {
    commands,
    Disposable,
} from "vscode";

import * as vscode from "vscode";
import * as path from 'path';
import * as fs from 'fs';

export class WebviewController {
    private _commandForProgressDetail: Disposable;
    private _htmlSrc: String = "";
  
    public constructor(private context: vscode.ExtensionContext) {
      this._commandForProgressDetail = commands.registerCommand("bugfixer.progress_detail",
        (uri: vscode.Uri) => {
          this.progress_detail(uri, context);
        });
    }
  
    public dispose() {
      this._commandForProgressDetail.dispose();
    }

    protected progress_detail(uri: vscode.Uri, context: vscode.ExtensionContext) {
        // create and show panel
        const panel = vscode.window.createWebviewPanel(
            'progressDetail',
            'Progress Detail',
            vscode.ViewColumn.One,
            {
                // local Resource Path
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src/resources'))],
                // enable scripts in the webview
                enableScripts: true,
                // for chrome DevTools
                enableFindWidget: true
            }
        );

        const cssPath = path.join(context.extensionPath, 'src/resources', 'css');
        const jsPath = path.join(context.extensionPath, 'src/resources', 'js');

        const ProgressDetailCss = panel.webview.asWebviewUri(vscode.Uri.file(path.join(cssPath, 'progressDetail.css')));
        const ProgressDetailJs = panel.webview.asWebviewUri(vscode.Uri.file(path.join(jsPath, 'progressDetail.js')));

        // set panel html content
        panel.webview.html = this.getProgressDetail(context, ProgressDetailCss, ProgressDetailJs);
    }

    private getProgressDetail(context: vscode.ExtensionContext, webveiwCss: vscode.Uri, webviewJs: vscode.Uri) {
        if (!this._htmlSrc) {
            const filePath = path.join(context.extensionPath, 'src/resources/html', 'progressDetail.html');
            this._htmlSrc = fs.readFileSync(filePath, 'utf-8').toString();
        }

        const contents = this._htmlSrc.replace(/WEBVIEWCSS/g, webveiwCss.toString()).replace(/WEBVIEWJS/g, webviewJs.toString());

        return contents;
    }
}