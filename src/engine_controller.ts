import {
    commands,
    window,
    Disposable,
    ProgressLocation   } from "vscode";
  
  import * as child_process from "child_process";
  import * as vscode from "vscode";

  import { SaverEngine } from "./engine/saver";
  import { Engine } from "./engine/engine";

  import * as util from "./common/util";
  
  export class BugfixerController {
    private _commandForAnalysis: Disposable;
  
    public constructor(private context: vscode.ExtensionContext) {
      this._commandForAnalysis = commands.registerCommand("bugfixer.analyze_all", 
      (uri:vscode.Uri) => {
        this.analyse(uri);
      });
    }
  
    public dispose() {
      this._commandForAnalysis.dispose();
    }
  
    protected analyse(uri: vscode.Uri) {    
      const engine: Engine = new SaverEngine("Saver", "infer", "infer-out");
      engine.build_cmd = "make release";
      engine.clean_build_cmd = "make clean release"

      let args: string[] = engine.get_analysis_cmd();
      
      vscode.window.showInformationMessage(`${engine.analyze_cmd} ${args.join(" ")}`);
  
      window.withProgress({
        location: ProgressLocation.Notification,
        title: `${engine.name} 실행`,
        cancellable: true
      }, 
      async (progress, token) => {
        let canceled = false;
  
        const p = new Promise(resolve => {
          let result = "";
          let errmsg = "";
  
          let bugfixer = child_process.spawn(
            engine.analyze_cmd,
            args,
            {cwd: util.getCwd()}
          );
          
          bugfixer.stderr.on("data", data => {
            let log: string = data.toString();
            errmsg += log;

            if(log.includes("Starting analysis..."))
            {
              progress.report({ message: `${engine.name} 분석 중`});
            }
          });

          bugfixer.stdout.on("data", data => {
            let log: string = data.toString();
            result += data.toString();

            progress.report({ message: log});
          });
  
          bugfixer.on("exit", (code) => {
            if(code === 0) {
              progress.report({ increment: 100, message: "실행 완료" });
              vscode.window.showInformationMessage(`${engine.name} 실행이 완료되었습니다.`);
              vscode.commands.executeCommand('bugfixer.refreshBugs');
            } else if (canceled) {
              vscode.window.showInformationMessage(`${engine.name} 실행이 취소되었습니다.`);
              bugfixer.kill();
            }
            else {
              progress.report({ increment: 100, message: "실행 실패" });
              vscode.window.showErrorMessage(`${engine.name} 실행이 실패했습니다.\n${errmsg}`);
            }
  
            resolve(0);
          });
        });;  
        
        return p;
      });
    }
  
    private pushLog(log: string) {
      //this.logger.info("!! " + log + " !!");
  
      //vscode.commands.executeCommand('bugfixer.pushLog', log);
    }
  }