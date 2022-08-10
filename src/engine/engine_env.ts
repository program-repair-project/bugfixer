import * as vscode from 'vscode';
import { Engine } from "./engine";
import { SaverEngine } from "./saver";
import * as constans from "../common/constants";


export class EngineEnv {
  private static instance: EngineEnv;
  private analyzer: Engine;
  private patch_maker: Engine;
  private validator: Engine;
  
  private constructor () {
    this.analyzer = new SaverEngine();
    this.patch_maker = new SaverEngine();
    this.validator = new SaverEngine();

    vscode.commands.registerCommand(constans.APPLY_PATCH_COMMAND, (src, patched) => this.patch_maker.apply_patch(src, patched));
    vscode.commands.registerCommand(constans.GEN_PATCH_COMMAND, (key) => this.patch_maker.make_patch(key));
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
}