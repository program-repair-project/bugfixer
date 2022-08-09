import {
  commands,
  Disposable,
} from "vscode";

import * as vscode from "vscode";
import * as path from 'path';
import * as fs from 'fs';

import { Engine } from "./engine/engine";
import { EngineEnv } from "./engine/engine_env";
import * as util from "./common/util";
import * as log_util from "./common/logger";
import * as wc from "./ui/window_controller";

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

    const stderrHandler = (data:any) => {
      const progress = data.progressv;
      const log = data.log;

      if (log.includes("Starting Process...")) {
        progress.report({ message: `${analyzer.name} 실행 중` });
      }
    }
    
    const stdoutHandler = (data:any) => {}
    const exitHandler = (data:any) => { 
      vscode.commands.executeCommand('bugfixer.refreshBugs'); 
    }

    const windowsController = new wc.WindowController(this.logger, "");
    windowsController.runWithProgress(`${analyzer.name} 실행`, analyzer.name, analyzer.analyze_cmd, args, stdoutHandler, stderrHandler, exitHandler);

  }
}