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
      return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" type="text/css" href="${webveiwCss}">
          <link href="https://fonts.googleapis.com/css?family=Raleway:300,600" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css">
          <title>Cat Coding</title>

          <script>
            window.console = window.console || function(t) {};
          </script>
          <script>
            if (document.location.search.match(/type=embed/gi)) {
              window.parent.postMessage("resize", "*");
            }
          </script>
        </head>
        <body>
          <section id="timeline">
            <div class="section-wrapper">
              <div class="line">
                <div data-mobiletext="Quarter 4" data-index="1" class="quarter q4 y2016 dot complete"></div>
                <div data-mobiletext="2017" data-timelinelabel="Open store" data-index="2" class="year y2017 dot complete"></div>
                <div data-mobiletext="Quarter 1" data-index="2" class="quarter q1 y2017 dot complete js-mobile-default"></div>		
                <div data-mobiletext="Quarter 2" data-index="3" class="quarter q2 y2017 dot"></div>
                <div data-mobiletext="Quarter 3" data-index="4" class="quarter q3 y2017 dot"></div>
                <div data-mobiletext="Quarter 4" data-index="5" class="quarter q4 y2017 dot"></div>
                <div data-mobiletext="2018" data-timelinelabel="Hire first staff" data-index="6" class="year y2018 dot"></div>
                <div data-mobiletext="Quarter 1" data-index="6" class="quarter q1 y2018 dot"></div>			
                <div data-mobiletext="Quarter 2" data-index="7" class="quarter q2 y2018 dot"></div>
                <div data-mobiletext="Quarter 3" data-index="8" class="quarter q3 y2018 dot"></div>
                <div data-mobiletext="Quarter 4" data-index="9" class="quarter q4 y2018 dot"></div>
                <div data-mobiletext="2019" data-timelinelabel="Expand product offerings" data-index="10" class="year y2019 dot"></div>
                <div data-mobiletext="Quarter 1" data-index="10" class="quarter q1 y2019 dot"></div>			
                <div data-mobiletext="Quarter 2" data-index="11" class="quarter q2 y2019 dot"></div>
                <div data-mobiletext="Quarter 3" data-index="12" class="quarter q3 y2019 dot"></div>
                <div data-mobiletext="Quarter 4" data-index="13" class="quarter q4 y2019 dot"></div>
                <div data-mobiletext="2020" data-timelinelabel="Open second store" data-index="14" class="year y2020 dot"></div>
                <div data-mobiletext="Quarter 1" data-index="14" class="quarter q1 y2020 dot"></div>
                <div data-mobiletext="Quarter 2" data-index="15" class="quarter q2 y2020 dot"></div>
                <div data-mobiletext="Quarter 3" data-index="16" class="quarter q3 y2020 dot"></div>
                <div data-mobiletext="Quarter 4" data-index="17" class="quarter q4 y2020 dot"></div>
              </div>
            </div>
          </section>
          <section id="description">
            <div class="section-wrapper">
              <h3>GOALS AND OBJECTIVES</h3>
              <div data-index="1">
                <p>Year 2016, Quarter 4</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur, alias. Magni harum, earum fugit, officia eveniet minima, expedita accusantium, esse aspernatur omnis neque. Soluta, consequatur adipisci non molestiae omnis odit.</p>
              </div>
              <div data-index="2" class="text-default">
                <p>Year 2017, Quarter 1</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae, consequuntur.</p>
              </div>
              <div data-index="3">
                <p>Year 2017, Quarter 2</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officiis assumenda ipsa maiores sunt fugiat deserunt pariatur est incidunt, enim quis.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus facere necessitatibus illum debitis minus amet recusandae optio fugit tempora veritatis.</p>
              </div>
              <div data-index="4">
                <p>Year 2017, Quarter 3</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et, nihil. Ea nesciunt sed, quidem sapiente dolorem voluptatum, adipisci recusandae ducimus amet sequi atque ipsa officiis pariatur consectetur velit alias. Officiis, at illo aperiam ex accusamus, vel ab obcaecati doloribus numquam fugiat unde, error. Atque iusto nulla porro, ducimus ex vel.</p>
              </div>
              <div data-index="5">
                <p>Year 2017, Quarter 4</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Libero laudantium repudiandae quos magni iste cum, a quisquam eligendi quasi, at animi autem necessitatibus, cumque rem optio maiores. Placeat inventore repellat voluptate reprehenderit adipisci aperiam tempore?</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio, aut illum repellat, itaque ducimus eius.</p>
              </div>
              <div data-index="6">
                <p>Year 2018, Quarter 1</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod, vel atque molestiae dolorum soluta magni, dolores a maxime iure illo.</p>
              </div>
              <div data-index="7">
                <p>Year 2018, Quarter 2</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt dicta non quam quae consectetur laborum eveniet, similique placeat illo velit enim eligendi facilis deleniti laboriosam iure natus totam! Nostrum ipsa debitis iste eum laborum odio, aliquam dolor fuga hic unde.</p>
              </div>
              <div data-index="8">
                <p>Year 2018, Quarter 3</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, eveniet?</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto officia, quam iste tempore eos, vel quis nulla, aliquid pariatur deleniti libero nesciunt dicta minus reiciendis.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ex dolor, atque repellat nulla doloribus nostrum.</p>
              </div>
              <div data-index="9">
                <p>Year 2018, Quarter 4</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptates similique expedita cumque alias facilis commodi vitae recusandae, quisquam officia officiis autem distinctio quis consequuntur velit deleniti iusto illo accusantium earum, delectus blanditiis minima. Enim fugit totam, esse cumque consequatur dignissimos.</p>
              </div>
              <div data-index="10">
                <p>Year 2019, Quarter 1</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad, laboriosam!</p>
              </div>
              <div data-index="11">
                <p>Year 2019, Quarter 2</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed odio iste harum quia facilis, omnis autem non, corporis ullam perspiciatis earum voluptas facere accusantium itaque asperiores, illo debitis ducimus. Facere nobis ipsam beatae voluptatum nisi possimus aliquam eum excepturi, quisquam odit, alias dolores enim, soluta nulla. Ratione quam architecto dolore.</p>
              </div>
              <div data-index="12">
                <p>Year 2019, Quarter 3</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est consequuntur unde laborum officiis minus, impedit voluptates. Fugiat perspiciatis nesciunt itaque!</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt doloribus eaque id in cumque aliquam voluptatem, officia unde assumenda corrupti!</p>
              </div>
              <div data-index="13">
                <p>Year 2019, Quarter 4</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae officia quas aut autem a quibusdam quam voluptas, optio iure recusandae eum, similique voluptate excepturi nobis suscipit, laboriosam laborum veniam mollitia!</p>
              </div>
              <div data-index="14">
                <p>Year 2020, Quarter 1</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus quod adipisci dolores, consectetur aperiam aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rerum ipsum vitae, consequuntur quidem, quasi quaerat.</p>
              </div>
              <div data-index="15">
                <p>Year 2020, Quarter 2</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem, perferendis facilis neque vero nostrum asperiores aperiam tenetur debitis sunt labore magnam ipsum nesciunt quo inventore explicabo hic at. Sed minus optio est illum, placeat, corporis necessitatibus fuga aperiam et officia, nobis nihil quas! Quasi temporibus corrupti consectetur, id natus nobis commodi quis. Inventore voluptate porro, excepturi dicta quasi consequuntur beatae.</p>
              </div>
              <div data-index="16">
                <p>Year 2020, Quarter 3</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, veritatis.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis ratione consequatur fugiat vero, dolor modi qui, libero rem repellat accusantium.</p>
              </div>
              <div data-index="17">
                <p>Year 2020, Quarter 4</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non quam aliquam aperiam consectetur sequi libero laborum.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </div>
            </div>
          </section>
          <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script>
          <script src='https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'></script>
          <script src='${webviewJs}'></script>
        <body>        
        </html>`;
    }
}