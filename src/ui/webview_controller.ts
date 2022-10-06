import {
    commands,
    Disposable,
} from "vscode";

import * as vscode from "vscode";
import * as path from 'path';
import * as fs from 'fs';

export class WebviewController {
    private _commandForProgressDetail: Disposable;

    // Only allow a single progress view
    private currentPanel: vscode.WebviewPanel | undefined = undefined;
    private _htmlSrc: string = "";
    
    // 임시로 build 로 설정  (다른 값으로 변경하면 추가되는 열 바뀜)
    private progressStatus: string = "Build";
  
    public constructor(private context: vscode.ExtensionContext) {
      this._commandForProgressDetail = commands.registerCommand("bugfixer.progress_detail",
        (uri: vscode.Uri) => {
          this.progress_detail(uri, context);
        });

        // 메시지 전송 테스트를 위해 임시로 생성한 명령어
        context.subscriptions.push(commands.registerCommand("print_progress_test", () => {
            // 엔진 로그 찍을 때 이와 같은 형태로 사용
            this.printProgress("TESTING PRINT LOG FUNCTION", "01:47 PM", "test test message message extension extension");
        }));
    }
  
    public dispose() {
        this._commandForProgressDetail.dispose();
    }

    protected progress_detail(uri: vscode.Uri, context: vscode.ExtensionContext) {
        if (this.currentPanel) {
            this.currentPanel.reveal(vscode.ViewColumn.One);
        } else {
            // create and show panel
            this.currentPanel = vscode.window.createWebviewPanel(
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

            const ProgressDetailCss = this.currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(cssPath, 'progressDetail.css')));
            const ProgressDetailJs = this.currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(jsPath, 'progressDetail.js')));

            // set panel html content
            this.currentPanel.webview.html = this.getProgressDetail(context, ProgressDetailCss, ProgressDetailJs);

            this.currentPanel.onDidDispose(
                () => {
                    this.currentPanel = undefined;
                }
            );
        }
    }

    private getProgressDetail(context: vscode.ExtensionContext, webveiwCss: vscode.Uri, webviewJs: vscode.Uri) {
        if (!this._htmlSrc) {
            const filePath = path.join(context.extensionPath, 'src/resources/html', 'progressDetail.html');
            this._htmlSrc = fs.readFileSync(filePath, 'utf-8').toString();
        }

        const contents = this._htmlSrc.replace(/WEBVIEWCSS/g, webveiwCss.toString()).replace(/WEBVIEWJS/g, webviewJs.toString());

        return contents;
    }

    public setProgressStatus(status: string) {
        // 엔진 상태에 따라 상태값 변경 (Build, Analyze, Patch, Validate)
        this.progressStatus = status;
    }

    private getProgressStatus() {
        return this.progressStatus;
    }

    public printProgress(title: string, time: string, message: string) {
        // html 로 메시지 전송
        if (!this.currentPanel) {
            return;
        }

        var jsonData = { status : this.getProgressStatus(), title: title, time : time, message : message}

        this.currentPanel.webview.postMessage(jsonData);
    }
}