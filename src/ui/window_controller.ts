import {
  window,
  ProgressLocation
} from "vscode";

import * as vscode from "vscode";
import * as child_process from "child_process";

import * as util from "../common/util";
import * as log_util from "../common/logger";

export class WindowController {
  public result = "";
  public errMsg = "";
  
  public constructor(private logger: log_util.Logger, public prop: any) {
  }
    
  public runWithProgress(
    title: string, 
    name: string,
    cmd: string,
    args: string[],
    stdoutHandler: (chunk: any) => void,
    stderrHandler: (chunk: any) => void,
    exitHandler: (chunk: any) => void ) {

      window.withProgress({
        location: ProgressLocation.Notification,
        title: title,
        cancellable: true
      },
      async (progress) => {
        let canceled = false;

        const p = new Promise(resolve => {
          this.logger.debug("run from: " + util.getCwd());
          this.logger.debug(`running cmd: ${cmd} ${args.join(' ')}`);

          let process = child_process.spawn(
            cmd, 
            args,
            { cwd: util.getCwd() }
          );

          process.stderr.on("data", data => {
            let log: string = data.toString();
            this.logger.debug(log);

            stderrHandler({log: log, progress: progress});
          });

          process.stdout.on("data", data => {
            let log: string = data.toString();
            this.logger.debug(log);
            progress.report({ message: log });
            stdoutHandler(log);
          });

          process.on("exit", (code, signal) => {
            if (code === 0  || this.prop.success) {
              progress.report({ increment: 100, message: "실행 완료" });
              vscode.window.showInformationMessage(`${name} 실행이 완료되었습니다.`);
              this.logger.info("Done.");
              exitHandler(code);
            }
            else if (canceled) {
              vscode.window.showInformationMessage(`${name} 실행이 취소되었습니다.`);
              this.logger.error("Canceled.");
              process.kill();
            }
            else {
              this.logger.info(`Failed. Exitcode: ${code?.toString() ?? ""}`);
              progress.report({ increment: 100, message: "실행 실패" });
              vscode.window.showErrorMessage(`${name} 실행에 실패했습니다.`);
            }

            resolve(0);
          });
        });;

        return p;
      });
    }
}