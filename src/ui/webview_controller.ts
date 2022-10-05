import {
    commands,
    Disposable,
} from "vscode";

import * as vscode from "vscode";
import * as path from 'path';

export class WebviewController {
    private _commandForProgressDetail: Disposable;
  
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
        panel.webview.html = this.getProgressDetail(ProgressDetailCss, ProgressDetailJs);
    }

    private getProgressDetail(webveiwCss: vscode.Uri, webviewJs: vscode.Uri) {
      // TODO 
      // html 리소스 파일로 분리
      // 동적으로 html 변경
      return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" type="text/css" href="${webveiwCss}">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
          <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.bundle.min.js"></script>
        </head>
        <body>
            <div class="container-fluid">
            <div class="row">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title mb-5">Horizontal Timeline</h4>
            
                            <div class="hori-timeline" dir="ltr">
                                <ul class="list-inline events">
                                    <li class="list-inline-item event-list">
                                        <div class="px-4">
                                            <div class="event-date bg-soft-primary text-primary">1단계</div>
                                            <h5 class="font-size-16">빌드</h5>
                                            <p class="text-muted">It will be as simple as occidental in fact it will be Occidental Cambridge friend</p>
                                            <div>
                                                <a class="btn btn-primary btn-sm" data-toggle="collapse" href="#buildReadMore" role="button" aria-expanded="false" aria-controls="buildReadMore">Read more</a>
                                            </div>
                                            <div id="buildReadMore" class="collapse vertical-timeline vertical-timeline--animate vertical-timeline--one-column" >
                                                <div class="vertical-timeline-item vertical-timeline-element">
                                                    <div>
                                                        <span class="vertical-timeline-element-icon bounce-in">
                                                            <i class="badge badge-dot badge-dot-xl badge-success"> </i>
                                                        </span>
                                                        <div class="vertical-timeline-element-content bounce-in">
                                                            <h4 class="timeline-title">Purchase new hosting plan</h4>
                                                            <p>Purchase new hosting plan as discussed with development team, today at <a href="javascript:void(0);" data-abc="true">10:00 AM</a></p>
                                                            <span class="vertical-timeline-element-date">10:30 PM</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vertical-timeline-item vertical-timeline-element">
                                                    <div>
                                                        <span class="vertical-timeline-element-icon bounce-in">
                                                            <i class="badge badge-dot badge-dot-xl badge-success"> </i>
                                                        </span>
                                                        <div class="vertical-timeline-element-content bounce-in">
                                                            <h4 class="timeline-title">Purchase new hosting plan</h4>
                                                            <p>Purchase new hosting plan as discussed with development team, today at <a href="javascript:void(0);" data-abc="true">10:00 AM</a></p>
                                                            <span class="vertical-timeline-element-date">10:30 PM</span>
                                                        </div>
                                                    </div>
                                                </div>  
                                            </div>
                                        </div>
                                    </li>
                                    <li class="list-inline-item event-list">
                                        <div class="px-4">
                                            <div class="event-date bg-soft-success text-success">2단계</div>
                                            <h5 class="font-size-16">오류 식별</h5>
                                            <p class="text-muted">Everyone realizes why a new common language one could refuse translators.</p>
                                            <div>
                                                <a class="btn btn-primary btn-sm" data-toggle="collapse" href="#errorReadMore" role="button" aria-expanded="false" aria-controls="errorReadMore">Read more</a>
                                            </div>
                                            <div id="errorReadMore" class="collapse vertical-timeline vertical-timeline--animate vertical-timeline--one-column">
                                                <div class="vertical-timeline-item vertical-timeline-element">
                                                    <div>
                                                        <span class="vertical-timeline-element-icon bounce-in">
                                                            <i class="badge badge-dot badge-dot-xl badge-success"> </i>
                                                        </span>
                                                        <div class="vertical-timeline-element-content bounce-in">
                                                            <h4 class="timeline-title">Purchase new hosting plan</h4>
                                                            <p>Purchase new hosting plan as discussed with development team, today at <a href="javascript:void(0);" data-abc="true">10:00 AM</a></p>
                                                            <span class="vertical-timeline-element-date">10:30 PM</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vertical-timeline-item vertical-timeline-element">
                                                    <div>
                                                        <span class="vertical-timeline-element-icon bounce-in">
                                                            <i class="badge badge-dot badge-dot-xl badge-success"> </i>
                                                        </span>
                                                        <div class="vertical-timeline-element-content bounce-in">
                                                            <h4 class="timeline-title">Purchase new hosting plan</h4>
                                                            <p>Purchase new hosting plan as discussed with development team, today at <a href="javascript:void(0);" data-abc="true">10:00 AM</a></p>
                                                            <span class="vertical-timeline-element-date">10:30 PM</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vertical-timeline-item vertical-timeline-element">
                                                    <div>
                                                        <span class="vertical-timeline-element-icon bounce-in">
                                                            <i class="badge badge-dot badge-dot-xl badge-success"> </i>
                                                        </span>
                                                        <div class="vertical-timeline-element-content bounce-in">
                                                            <h4 class="timeline-title">Purchase new hosting plan</h4>
                                                            <p>Purchase new hosting plan as discussed with development team, today at <a href="javascript:void(0);" data-abc="true">10:00 AM</a></p>
                                                            <span class="vertical-timeline-element-date">10:30 PM</span>
                                                        </div>
                                                    </div>
                                                </div>  
                                            </div>  
                                        </div>
                                    </li>
                                    <li class="list-inline-item event-list">
                                        <div class="px-4">
                                            <div class="event-date bg-soft-danger text-danger">3단계</div>
                                            <h5 class="font-size-16">패치 생성</h5>
                                            <p class="text-muted">If several languages coalesce the grammar of the resulting simple and regular</p>
                                            <div>
                                                <a class="btn btn-primary btn-sm" data-toggle="collapse" href="#patchReadMore" role="button" aria-expanded="false" aria-controls="patchReadMore">Read more</a>
                                            </div>
                                            <div id="patchReadMore"class="collapse vertical-timeline vertical-timeline--animate vertical-timeline--one-column">
                                                <div class="vertical-timeline-item vertical-timeline-element">
                                                    <div>
                                                        <span class="vertical-timeline-element-icon bounce-in">
                                                            <i class="badge badge-dot badge-dot-xl badge-success"> </i>
                                                        </span>
                                                        <div class="vertical-timeline-element-content bounce-in">
                                                            <h4 class="timeline-title">Purchase new hosting plan</h4>
                                                            <p>Purchase new hosting plan as discussed with development team, today at <a href="javascript:void(0);" data-abc="true">10:00 AM</a></p>
                                                            <span class="vertical-timeline-element-date">10:30 PM</span>
                                                        </div>
                                                    </div>
                                                </div>  
                                            </div>
                                        </div>
                                    </li>
                                    <li class="list-inline-item event-list">
                                        <div class="px-4">
                                            <div class="event-date bg-soft-warning text-warning">4단계</div>
                                            <h5 class="font-size-16">패치 검증</h5>
                                            <p class="text-muted">Languages only differ in their pronunciation and their most common words.</p>
                                            <div>
                                                <a class="btn btn-primary btn-sm" data-toggle="collapse" href="#confirmReadMore" role="button" aria-expanded="false" aria-controls="confirmReadMore">Read more</a>
                                            </div>
                                            <div id="confirmReadMore"class="collapse vertical-timeline vertical-timeline--animate vertical-timeline--one-column">
                                                <div class="vertical-timeline-item vertical-timeline-element">
                                                    <div>
                                                        <span class="vertical-timeline-element-icon bounce-in">
                                                            <i class="badge badge-dot badge-dot-xl badge-success"> </i>
                                                        </span>
                                                        <div class="vertical-timeline-element-content bounce-in">
                                                            <h4 class="timeline-title">Purchase new hosting plan</h4>
                                                            <p>Purchase new hosting plan as discussed with development team, today at <a href="javascript:void(0);" data-abc="true">10:00 AM</a></p>
                                                            <span class="vertical-timeline-element-date">10:30 PM</span>
                                                        </div>
                                                    </div>
                                                </div>  
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <!-- end card -->
                </div>
            </div>
        <body>        
    </html>`;
    }
}