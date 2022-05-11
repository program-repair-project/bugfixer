import { Engine } from "./engine";
import { SaverEngine } from "./saver";

export class EngineFactory {
  public get_engine(): Engine {
    return new SaverEngine("Saver", "infer", "infer-out");
  }
}