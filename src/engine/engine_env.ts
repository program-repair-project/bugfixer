import * as vscode from 'vscode';
import { workspace } from 'vscode';
import { Engine } from "./engine";
import { SaverEngine } from "./saver";
import { NPEXEngine } from "./npex";
import * as constans from "../common/constants";
import * as log_util from "../common/logger";

export class EngineEnv {
  private static instance: EngineEnv;
  private analyzer: Engine;
  private patch_maker: Engine;
  private validator: Engine;
  private analyze_output_path: string;
  private engineMap: Map<string, Engine>;
  private current_preset: string;

  private logger: log_util.Logger;

  private constructor () {
    this.engineMap = new Map();
    this.engineMap.set("saver", new SaverEngine());
    this.engineMap.set("npex", new NPEXEngine());
      
    this.current_preset = "saver";
    this.analyzer = this.engineFactory(this.current_preset);
    this.patch_maker = this.engineFactory(this.current_preset);
    this.validator = this.engineFactory(this.current_preset);
    this.analyze_output_path = workspace.getConfiguration().get("bugfixer.infer_out_path", "./output");

    this.logger = new log_util.Logger("EngineEnv");
    
    vscode.commands.registerCommand(constans.APPLY_PATCH_COMMAND, (src, patched) => this.patch_maker.apply_patch(src, patched));
  }
  
  public static getInstance () { 
    if(this.instance)
      return this.instance;

    this.instance = new EngineEnv();
    return this.instance; 
  }

  private engineFactory(name: string): Engine {
    const engine = this.engineMap.get(name);
    if(engine === undefined) {
      this.logger.error("Engine not found: " + name);
      this.logger.error("set engine to saver");
      return new SaverEngine();
    }

    return engine;
  }

  public setEngineEnv(name: string) {
    this.current_preset = name;
    this.analyzer = this.engineFactory(name);
    this.patch_maker = this.engineFactory(name);
    this.validator = this.engineFactory(name);
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
  
  public get_analyze_output_path():string {
    return this.analyze_output_path;
  }

  public get_currnet_engine(): string {
    return this.current_preset;
  }
}