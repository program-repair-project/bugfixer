import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from "child_process";

import { Engine } from "./engine";
import { Bug, MosesBug } from "../dto/bug";
import { Patch, MosesPatch } from "../dto/patch";

import * as util from '../common/util';
import * as log_util from "../common/logger";
import { PatchLineInfo } from '../results/diagnostics';

export class MosesEngine extends Engine {
  private logger: log_util.Logger;

  private patched: string;

  constructor() {
      super("Moses", "docker", "repair-out");
      this.report_file = "result.json";
      this.logger = new log_util.Logger("Moses");
      this.build_cmd = "";
      this.clean_build_cmd = "";
      this.patched = "";
  }

  public get_incremental_cmd(): string[] {
      return [];
  }

  public get_analysis_cmd(): string[] {
      const cmd: string[] = ["run", "-w", "/experiment", "-v", `${util.getCwd()}/repair-out:/experiment/535-A-bug-13831501-13831529/repair-out`, "huna3869/codeflaws:test","/bin/bash", "-c"];
      cmd.push("cp codeflaws/535-A-bug-13831501-13831529 ./ -r; cd 535-A-bug-13831501-13831529; ../transform.sh 535-A-13831501.c; ../repair.native -print_v -timeout_test 30 -timeout_sygus 180 -debug -sygus ../synth.sh -notempl -susloc 100 -loop_limit 0 -range 1000 -origdir ./backup -pos 5 -neg 1 535-A-13831501.c ./test-genprog.sh; cd repair-out/; cat result.json");
      return cmd;
  }

  public get_patch_cmd(errorKey: string): string[] {
      return [];
  }

  public get_file_bugs_map(): Map<string, Bug[]> {
    const cwd = util.getCwd();
    const reportPath = path.join(cwd, this.output_path, this.report_file);

    const fileBugMap = new Map<string, Bug[]>();

    if (!util.pathExists(reportPath)) return fileBugMap;

    // 파일에서 버그 정보 얻기
    const jsonString = fs.readFileSync(reportPath, 'utf-8');
    const data: MosesBug = JSON.parse(jsonString);

    // get file, severity, code, message, line, column
    const bug: Bug = MosesBug.toBug(data);
    fileBugMap.set(bug.file, [bug]);
    
    return fileBugMap;
  }

  public make_patch(errorKey: string): void {
    this.generate_patched_file();
      
  }

  public generate_patched_file() {
      const cwd = util.getCwd();

      const patchFile = path.join(cwd, this.output_path, this.report_file);
      const patchedPath = path.join(cwd, this.output_path);

      const jsonString = fs.readFileSync(patchFile, 'utf-8');
      this.logger.error(jsonString);
      const data: MosesPatch = JSON.parse(jsonString);

      const file = data.file;
      const src = path.join(cwd, file);
      const dst = path.join(patchedPath, file);
      this.patched = dst;
      const contents = `${" ".repeat(data.column)}${data.contents}`;
      
      switch (data.method) {
          case "Insert":
              util.insertFromFile(src, dst, data.line - 1, contents);
              break;
          case "Replace":
              util.replaceFromFile(src, dst, data.line - 1, contents);
              break;
          case "Delete":
              util.deleteFromFile(src, dst, data.line - 1, "");
              break;
      }
  }

  public apply_patch(src: string, patched: string): void {
      // 패치된 파일을 원본 파일에 덮어 쓴다.
      fs.copyFileSync(patched, src);
  }

  public get_error_key(bug: Bug): string {
      return `${bug.src_line}_${bug.sink_line}___${bug.file.replaceAll('/', '__')}`;
  }

  public set_build_cmd(build_cmd: string): void {
      this.build_cmd = build_cmd;
  }

  public get_patches(): PatchLineInfo[] {
    const cwd = util.getCwd();

    const patchFile = path.join(cwd, this.output_path, this.report_file);
    const patchedPath = path.join(cwd, this.output_path);

    const jsonString = fs.readFileSync(patchFile, 'utf-8');
    this.logger.error(jsonString);
    const data: MosesPatch = JSON.parse(jsonString);

    const file = data.file;
    const dst = path.join(patchedPath, file);
    
      return [new PatchLineInfo(dst, [data.line])];
  }
}