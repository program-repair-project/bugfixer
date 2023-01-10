import * as vscode from 'vscode';
import { workspace } from 'vscode';
import { Engine } from "./engine";
import { SaverEngine } from "./saver";
import { NPEXEngine } from "./npex";
import * as constans from "../common/constants";


export class EngineEnv {
  private static instance: EngineEnv;
  private analyzer: Engine;
  private patch_maker: Engine;
  private validator: Engine;
  private analyze_output_path: String;

  private constructor () {
    this.analyzer = new NPEXEngine();
    this.patch_maker = new NPEXEngine();
    this.validator = new NPEXEngine();
    this.analyze_output_path = workspace.getConfiguration().get("bugfixer.infer_out_path", "./output");

    vscode.commands.registerCommand(constans.APPLY_PATCH_COMMAND, (src, patched) => this.patch_maker.apply_patch(src, patched));
  }
  
  public static getInstance () { 
    if(this.instance)
      return this.instance;

    this.instance = new EngineEnv();
    return this.instance; 
  }

  public get_analyzer(): Engine {
    return this.analyzer;
  }

  public get_patch_maker(): Engine {
    return this.patch_maker;
  }

  public get_validator(): Engine {
    return this.validator;
  }
  
  public get_analyze_output_path():String {
    return this.analyze_output_path;
  }
}