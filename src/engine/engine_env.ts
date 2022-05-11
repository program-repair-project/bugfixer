import { inherits } from "util";
import { Engine } from "./engine";
import { SaverEngine } from "./saver";

export class EngineEnv {
  private static instance: EngineEnv;
  private analyzer: Engine;
  private patch_maker: Engine;
  private validator: Engine;
  
  private constructor () {
    this.analyzer = new SaverEngine();
    this.patch_maker = new SaverEngine();
    this.validator = new SaverEngine();
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