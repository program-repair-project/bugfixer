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

export class EngineController {
  private _commandForRunSaver: Disposable;
  private _commandForRunNPEX: Disposable;
  private logger: log_util.Logger;

  public constructor(private context: vscode.ExtensionContext) {
    this._commandForRunSaver = this.registerRunCommand("bugfixer.run_saver", "saver");
    this._commandForRunNPEX  = this.registerRunCommand("bugfixer.run_npex", "npex");

    vscode.commands.registerCommand(constants.MAKE_PATCH_COMMAND, (key) => this.make_patch(key))
    this.logger = new log_util.Logger("BugfixerController");
  }

  public dispose() {
    this._commandForRunSaver.dispose();
    this._commandForRunNPEX.dispose();
  }

  private registerRunCommand(cmd: string, name: string) {
    return commands.registerCommand(cmd,
      (uri: vscode.Uri) => {
        EngineEnv.getInstance().setEngineEnv(name);
        this.analyze_all(uri);
      }
    );
  }

  protected analyze_all(uri: vscode.Uri) {
    const analyzer: Engine = EngineEnv.getInstance().get_analyzer();
    console.log(util.getCwd());
    let args: string[] = analyzer.get_analysis_cmd();

    const output_path = path.join(util.getCwd(), analyzer.output_path);
    if (util.pathExists(output_path)) {
      fs.rmdirSync(output_path, { recursive: true });
    }

    this.analyze(uri, analyzer, args);
  }

  protected analyze(uri: vscode.Uri, analyzer: Engine, args: string[]) {
    const output_path = path.join(util.getCwd(), analyzer.output_path);

    vscode.window.showInformationMessage(`${analyzer.analyze_cmd} ${args.join(" ")}`);
    this.logger.info(`${analyzer.analyze_cmd} ${args.join(" ")}`);

    //Create output channel
    let bugfixerChannel = vscode.window.createOutputChannel("Bugfixer");

    const stderrHandler = (data:any) => {
      const progress = data.progress;
      const log = data.log;

      if (log.includes("Starting Process...")) {
        progress.report({ message: `${analyzer.name} 실행 중` });
      }

      //Write to output.
      bugfixerChannel.appendLine(log);
    }
    
    const stdoutHandler = (data:any) => {
      //Write to output.
      bugfixerChannel.appendLine(data.toString());
    }
    const exitHandler = (data:any) => { 
      vscode.commands.executeCommand('bugfixer.refreshBugs'); 
    }

    const windowController = new wc.WindowController(this.logger, "");
    
    // remove previous restuls
    const reportFile = path.join(util.getCwd(), analyzer.output_path, analyzer.report_file);
    if(util.pathExists(reportFile))
      fs.unlinkSync(reportFile);

    vscode.commands.executeCommand("bugfixer.clearDiag");
    vscode.commands.executeCommand('bugfixer.refreshBugs'); 
    windowController.runWithProgress(`${analyzer.name} 실행`, analyzer.name, analyzer.analyze_cmd, args, stdoutHandler, stderrHandler, exitHandler);
  }

  protected make_patch(key: string) {
    
    const patch_maker: Engine = EngineEnv.getInstance().get_patch_maker();

    let patch_maker_result = "";

    //Create output channel
    let bugfixerChannel = vscode.window.createOutputChannel("Bugfixer");

    const stdoutHandler = (data:any) => {
      patch_maker_result += data.toString();
      //Write to output.
      bugfixerChannel.appendLine(data.toString());

    }
    const stderrHandler = (data:any) => {
      patch_maker_result += data.log;
      bugfixerChannel.appendLine(data.log);
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