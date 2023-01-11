import * as path from 'path';
import * as fs from 'fs';

import { Engine } from "./engine";
import { Bug, PyterBug } from "../dto/bug";
import { PyterPatch } from '../dto/patch';
import * as util from '../common/util';
import * as log_util from "../common/logger";
import { PatchLineInfo } from '../results/diagnostics';

const findFiles = require("fs-readdir-recursive");

export class PyterEngine extends Engine {
  private logger: log_util.Logger;

  constructor() {
    super("Pyter", "docker", "result");
    this.report_file = "report.json";
    this.logger = new log_util.Logger("Pyter");
    this.output_path = "pyter-bugfixer-output"
  }

    // 결과 파일
  private _result_file: string = "result.json";
  
  
  public get_incremental_cmd(): string[] {
    return this.get_analysis_cmd();
  }

  public get_analysis_cmd(): string[] {
    const cwd = util.getCwd();
    const cmd: string[] = ["run", "-w", "/pyter/benchmark", "-v", `${cwd}\\${this.output_path}:/pyter/benchmark/result`, "-e", "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/wonseok/.pyenv/plugins/pyenv-virtualenv/shims:/home/wonseok/.pyenv/shims:/home/wonseok/.pyenv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/pyter/BugsInPy/framework/bin", "pyter:latest", "/bin/bash", "-c", "rm -rf requests-3390 requests-4723; /pyter/pyter_tool/dynamic.sh; python -u /pyter/pyter_tool/my_tool/test_main.py -d '/pyter/benchmark' -p 'requests' -c ''; cp -r ./requests-* result; ls result"];
    return cmd;
  }

  public get_file_bugs_map(): Map<string, Bug[]> {
    const fileBugMap = new Map<string, Bug[]>();
    
    const cwd = util.getCwd();
    const resultPath = path.join(cwd, this.output_path);
    
    if (!util.pathExists(resultPath)) return fileBugMap;

    const negFiles = findFiles(resultPath).map(f => f.toString()).filter(item => item.endsWith("neg.json"));
    const patchFiles = findFiles(resultPath).filter(item => item.endsWith(".result")).filter(item => (!item.endsWith("total.result")));

    // 파일에서 버그 정보 얻기
    negFiles.map((f) => {
      const negFile = path.join(resultPath, f);
      const jsonString = fs.readFileSync(negFile, 'utf-8');
      const data: PyterBug[] = JSON.parse(jsonString);

      // get file, severity, code, message, line, column
      const bugs: Bug[] = data.map(d => PyterBug.toBug(d));
      bugs.forEach(b => {
        const filename = path.basename(b.file, ".py");
        const requestId = b.file.split('/')[1];
        const resultFile = path.join(resultPath, `${requestId}.result`);
        fileBugMap.set(b.file, [b]);
        this.makePatch(resultPath, resultFile, requestId, path.join(cwd, b.file), b.line);
      });
    })
    
    return fileBugMap;
  }

  private makePatch(resultPath: string, patchFile: string, requestId:string, src: string, line: number) {
    const contents = util.getLine(patchFile, 3);
    const patchedFile = path.join(resultPath, `${requestId}.py`);
    const patch = new PyterPatch(patchedFile, "Replace", contents, line, 1);
    
    //write patch
    const patchDataJson = JSON.stringify(patch);
    const patchDataFile = path.join(resultPath, `${requestId}.json`);
    
    fs.writeFileSync(patchDataFile, patchDataJson, 'utf8');

    util.replaceFromFile(src, patchedFile, line - 1, contents);
  }

  public get_patches(): PatchLineInfo[] {
    const cwd = util.getCwd();
    const resultPath = path.join(cwd, this.output_path);

    const patchFiles = fs.readdirSync(resultPath).filter(item => item.endsWith(".json"));

    const lineInfos = patchFiles.map((f) => {
      const patch: PyterPatch = util.readJSON<PyterPatch>(path.join(resultPath, f));
      return new PatchLineInfo(patch.file, [patch.line]);
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