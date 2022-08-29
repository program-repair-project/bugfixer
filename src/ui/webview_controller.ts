import {
    commands,
    Disposable,
} from "vscode";

import * as vscode from "vscode";

export class WebviewController {
    private _commandForProgressDetail: Disposable;
  
    public constructor(private context: vscode.ExtensionContext) {
      this._commandForProgressDetail = commands.registerCommand("bugfixer.progress_detail",
        (uri: vscode.Uri) => {
          this.progress_detail(uri);
        });
    }
  
    public dispose() {
      this._commandForProgressDetail.dispose();
    }

    protected progress_detail(uri: vscode.Uri) {
        // create and show panel
        const panel = vscode.window.createWebviewPanel(
            'progressDetail',
            'Progress Detail',
            vscode.ViewColumn.One,
            {}
        );
        
        // set panel html content
        panel.webview.html = this.getWebviewContent();
    }

    private getWebviewContent() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cat Coding</title>
        </head>
        <body>
            <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
        </body>
        </html>`;
    }
}