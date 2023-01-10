import * as path from 'path';
import * as fs from 'fs';

import { Engine } from "./engine";
import { Bug, NPEXBug } from "../dto/bug";
import { NPEXPatch, NPEXResult } from '../dto/patch';
import * as util from '../common/util';
import * as log_util from "../common/logger";

import { PatchLineInfo } from '../results/diagnostics';

export class NPEXEngine extends Engine {
  private logger: log_util.Logger;

  constructor() {
    super("NPEX", "docker", "");
    this.report_file = "report.json";
    this.logger = new log_util.Logger("NPEX");
    this.output_path = "npex-bugfixer-output"
  }

  // error input
  private _npe_file: string = "npe.json";
    
  // 결과 파일
  private _result_file: string = "result.json";
  
  
  public get_incremental_cmd(): string[] {
    return this.get_analysis_cmd();
  }

  public get_analysis_cmd(): string[] {
    const cwd = util.getCwd();
    const cmd: string[] = ["run", "-w", "/home/NPEX/examples/aries-jpa-example", "-v", `${cwd}\\${this.output_path}:/home/NPEX/examples/bugfixer_tmp`, "jeminya/npex:1.1", "/bin/bash", "-c", "pwd; /home/NPEX/npex prepare --build; /home/NPEX/npex run --localize; /home/NPEX/npex run --enumerate; /home/NPEX/npex run --predict; /home/NPEX/npex run --validate; cp -r ./patches ./*.json /home/NPEX/examples/bugfixer_tmp"];
    return cmd;
  }

  public get_file_bugs_map(): Map<string, Bug[]> {
    const cwd = util.getCwd();
    const reportPath = path.join(cwd, this.output_path, this._npe_file);

    const fileBugMap = new Map<string, Bug[]>();

    if (!util.pathExists(reportPath)) return fileBugMap;

    // 파일에서 버그 정보 얻기
    const jsonString = fs.readFileSync(reportPath, 'utf-8');
    const data: NPEXBug = JSON.parse(jsonString);

    // get file, severity, code, message, line, column
    const bug: Bug = NPEXBug.toBug(data);
    fileBugMap.set(bug.file, [bug]);
    
    return fileBugMap;
  }

  public get_patches(): PatchLineInfo[] {
    // read result.json
    const cwd = util.getCwd();
    const resultFilePath = path.join(cwd, this.output_path, this._result_file);

    if (!util.pathExists(resultFilePath)) return [];

    // 파일에서 패치 정보 얻기
    const data: NPEXResult = util.readJSON<NPEXResult>(resultFilePath);
    
    var lineInfos :PatchLineInfo[] = []
    
    data.verified_patches.forEach(d => { 
        const patchPath = path.join(cwd, this.output_path, "patches", d);
        const patchJavaPath = path.join(patchPath, "patch.java");
        const patchJsonPath = path.join(patchPath, "patch.json");
        if(util.pathExists(patchJavaPath) && util.pathExists(patchJsonPath)) {
            const patchData: NPEXPatch =  util.readJSON<NPEXPatch>(patchJsonPath);
            // 패치 라인 정보 수집
            lineInfos.push(new PatchLineInfo(patchJavaPath,  patchData.patched_lines))
        }
    })
    
    return lineInfos;
  }
    
  public make_patch(key: string): void {
  }

  public get_error_key(bug: Bug): string {
      return "";
  }

  public apply_patch(src: string, patched: string): void {
    // 패치된 파일을 원본 파일에 덮어 쓴다.
    fs.copyFileSync(patched, src);
  }

  public set_build_cmd(build_cmd: string): void {
      this.build_cmd = build_cmd;
  }

  public get_patch_cmd(errorKey: string): string[] {
    return [];
  }
}