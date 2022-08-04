import {
  commands,
  window,
  Disposable,
  ProgressLocation
} from "vscode";

import * as child_process from "child_process";
import * as vscode from "vscode";
import * as path from 'path';

import { Engine } from "./engine/engine";
import { EngineEnv } from "./engine/engine_env";

import * as util from "./common/util";
import * as log_util from "./common/logger";
import * as fs from 'fs';

export class BugfixerController {
  private _commandForAnalysis: Disposable;
  private logger: log_util.Logger;

  public constructor(private context: vscode.ExtensionContext) {
    this._commandForAnalysis = commands.registerCommand("bugfixer.analyze_all",
      (uri: vscode.Uri) => {
        this.analyse(uri);
      });

    this.logger = new log_util.Logger("BugfixerController");
  }

  public dispose() {
    this._commandForAnalysis.dispose();
  }

  protected analyse(uri: vscode.Uri) {
    const analyzer: Engine = EngineEnv.getInstance().get_analyzer();
    analyzer.build_cmd = "make";
    analyzer.clean_build_cmd = "make"

    const output_path = path.join(util.getCwd(), analyzer.output_path);

    if (util.pathExists(output_path)) {
      fs.rmdirSync(output_path, { recursive: true });
    }

    let args: string[] = analyzer.get_analysis_cmd();

    vscode.window.showInformationMessage(`${analyzer.analyze_cmd} ${args.join(" ")}`);
    this.logger.info(`${analyzer.analyze_cmd} ${args.join(" ")}`);

    window.withProgress({
      location: ProgressLocation.Notification,
      title: `${analyzer.name} 실행`,
      cancellable: true
    },
      async (progress, token) => {
        let canceled = false;

        const p = new Promise(resolve => {
          let result = "";
          let errmsg = "";

          this.logger.debug("run from: " + util.getCwd());
          this.logger.debug(`running cmd: ${analyzer.analyze_cmd} ${args.join(' ')}`);

          let bugfixer = child_process.spawn(
            analyzer.analyze_cmd,
            args,
            { cwd: util.getCwd() }
          );

          bugfixer.stderr.on("data", data => {
            let log: string = data.toString();
            errmsg += log;

            this.logger.debug(log);

            if (log.includes("Starting analysis...")) {
              progress.report({ message: `${analyzer.name} 분석 중` });
            }
          });

          bugfixer.stdout.on("data", data => {
            let log: string = data.toString();
            result += data.toString();

            this.logger.debug(log);

            progress.report({ message: log });
          });

          bugfixer.on("exit", (code, signal) => {
            if (code === 0) {
              progress.report({ increment: 100, message: "실행 완료" });
              vscode.window.showInformationMessage(`${analyzer.name} 실행이 완료되었습니다.`);
              this.logger.info("Done.");
              vscode.commands.executeCommand('bugfixer.refreshBugs');
            }
            else if (canceled) {
              vscode.window.showInformationMessage(`${analyzer.name} 실행이 취소되었습니다.`);
              this.logger.error("Canceled.");
              bugfixer.kill();
            }
            else {

              this.logger.info(`Failed. Exitcode: ${code?.toString() ?? ""}`);
              progress.report({ increment: 100, message: "실행 실패" });
              vscode.window.showErrorMessage(`${analyzer.name} 실행에 실패했습니다.`);
            }

            resolve(0);
          });
        });;

        return p;
      });
  }
}