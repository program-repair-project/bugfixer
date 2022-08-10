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
import * as constants from "./common/constants";

export class BugfixerController {
  private _commandForAnalysis: Disposable;
  private logger: log_util.Logger;

  public constructor(private context: vscode.ExtensionContext) {
    this._commandForAnalysis = commands.registerCommand("bugfixer.analyze_all",
      (uri: vscode.Uri) => {
        this.analyse(uri);
      });

    vscode.commands.registerCommand(constants.MAKE_PATCH_COMMAND, (key) => this.make_patch(key))
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

    let args: string[] = analyzer.get_analysis_cmd();

    vscode.window.showInformationMessage(`${analyzer.analyze_cmd} ${args.join(" ")}`);
    this.logger.info(`${analyzer.analyze_cmd} ${args.join(" ")}`);

    const stderrHandler = (data:any) => {
      const progress = data.progress;
      const log = data.log;

      if (log.includes("Starting Process...")) {
        progress.report({ message: `${analyzer.name} 실행 중` });
      }
    }
    
    const stdoutHandler = (data:any) => {}
    const exitHandler = (data:any) => { 
      vscode.commands.executeCommand('bugfixer.refreshBugs'); 
    }

    const windowController = new wc.WindowController(this.logger, "");
    windowController.runWithProgress(`${analyzer.name} 실행`, analyzer.name, analyzer.analyze_cmd, args, stdoutHandler, stderrHandler, exitHandler);
  }

  protected make_patch(key: string) {
    
    const patch_maker: Engine = EngineEnv.getInstance().get_patch_maker();

    let patch_maker_result = "";

    const stdoutHandler = (data:any) => {
      patch_maker_result += data.toString();
    }
    const stderrHandler = (data:any) => {
      patch_maker_result += data.log;
    }
    const exitHandler = (data:any) => { 
      const cwd = util.getCwd();
      const patchDataPath = path.join(cwd, patch_maker.patch_data_path);
        
      if(!util.pathExists(patchDataPath))
          fs.mkdirSync(patchDataPath, {recursive: true});

      const patchFile = path.join(patchDataPath, `${key}.log`);
      fs.writeFileSync(patchFile, patch_maker_result, 'utf8');
      
      patch_maker.make_patch(key);
    }

    const windowController = new wc.WindowController(this.logger, "");
    windowController.runWithProgress('패치 생성', patch_maker.name, patch_maker.analyze_cmd, patch_maker.get_patch_cmd(key), stdoutHandler, stderrHandler, exitHandler);
  }
  
}