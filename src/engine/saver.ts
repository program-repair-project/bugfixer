import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from "child_process";

import { Engine } from "./engine";
import { Bug, SaverBug } from "../dto/bug";
import { SaverPatch} from '../dto/saverPatch';
import * as util from '../common/util';
import * as log_util from "../common/logger";

export class SaverEngine extends Engine {
    private logger: log_util.Logger;

    constructor() {
        super("Saver", "infer", "infer-out");
        this.report_file = "report.json";
        this.logger = new log_util.Logger("Saver");
    }

    public get_incremental_cmd(): string[] {
        const cmd: string[] = ["run", "-g", "--reactive", "--continue", "--"];
        return cmd.concat(this.build_cmd.split(" "));
    }

    public get_analysis_cmd(): string[] {
        const cmd: string[] = ["run", "-g", "--reactive", "--"];
        return cmd.concat(this.clean_build_cmd.split(" "));
    }

    public get_patch_cmd(errorKey: string): string[] {
        const cmd: string[] = ["saver", "--error-report", this.get_errorData_path_by_key(errorKey)];
        return cmd;
    }

    public get_file_bugs_map(): Map<string, Bug[]> {
        const cwd = util.getCwd();
        const reportPath = path.join(cwd, this.output_path, this.report_file);

        const fileBugMap = new Map<string, Bug[]>();

        if (!util.pathExists(reportPath)) return fileBugMap;

        const jsonString = fs.readFileSync(reportPath, 'utf-8');
        const data: SaverBug[] = JSON.parse(jsonString);

        // get file, severity, code, message, line, column
        const bugs: Bug[] = data.filter(d => d.kind === "ERROR").map(d => SaverBug.toBug(d));
        const files = Array.from(new Set(bugs.map(b => b.file)));

        const patch_input_path = path.join(cwd, this.patch_input_path);
        
        if(util.pathExists(patch_input_path))
            fs.rmdirSync(patch_input_path, { recursive: true });

        files.map(f => {
            const file_bugs = bugs.filter(b => (b.file === f));
            fileBugMap.set(f, file_bugs);
            file_bugs.forEach(bug => {
                if (bug.name === "MEMORY_LEAK")
                    this.prepare_patch(bug)
            });
        });

        return fileBugMap;
    }

    private prepare_patch(bug: Bug): void {
        const message = bug.message;
        var arr = message.match(/.*at line (\d+).*line (\d+).*/);

        if (arr?.length != 3) return;

        const src = +arr[1];
        const sink = +arr[2];

        // generate json item
        const errorDataJson = {
            "err_type": bug.name,
            "source": { "node": { "filename": bug.file, "procedure": bug.procedure, "line": src }, "exp": null },
            "sink": { "node": { "filename": bug.file, "procedure": bug.procedure, "line": sink }, "exp": null }
        }

        const errorDataFile = this.get_errorData_path(bug);
        const errorDataPath = path.dirname(errorDataFile);

        try {
            if (!util.pathExists(errorDataPath)) {
                fs.mkdirSync(errorDataPath, { recursive: true });
            }

            fs.writeFileSync(errorDataFile, JSON.stringify(errorDataJson, null, 2), 'utf8');

            this.logger.debug(`패치 생성 준비: ${errorDataFile}`);

        } catch (error) {
            this.logger.error('An error has occurred: ' + error);
        }
    }

    public make_patch(errorKey: string): void {
        let patch = "";
        const cwd = util.getCwd();

        const patch_data_file = path.join(cwd, this.patch_data_path, `${errorKey}.log`);

        if(!util.pathExists(patch_data_file)) {
            this.logger.error(`파일이 없습니다: ${patch_data_file}`);
            return;
        }

        fs.readFileSync(patch_data_file).toString().split("\n").forEach((log) => {
            var arr = log.match(/- \[[+-]\] { (.*): (.*)\*\(.*:([_a-zA-Z][_a-zA-Z0-9->]*)\)(.*) at [\d]* \(line ([\d]*), column ([\d]*)\)/);
            if (arr?.length == 7) {
                const method = arr[1];
                const contents = (arr[2] + arr[3] + arr[4]).replace("true", "TRUE") + ";";
                const line = +arr[5] + 1;
                const column = +arr[6];

                // generate json item
                const patchDataJson = {
                    "method": method,
                    "contents": contents,
                    "line": line,
                    "column": column
                }
                
                patch += JSON.stringify(patchDataJson);
            }
        });

        try {
            const patchPath = path.join(cwd, this.patch_path);
        
            if(!util.pathExists(patchPath))
                fs.mkdirSync(patchPath);

            const patchFile = path.join(patchPath, `${errorKey}.json`);
            fs.writeFileSync(patchFile, patch, 'utf8');

            this.generate_patched_file(errorKey);
        } catch (e: any) {
            this.logger.error(e);
            vscode.window.showErrorMessage(e);
        }
    }

    public generate_patched_file(key: string) {
        const file = key.split("___")[1].replaceAll("__", "/");
        const cwd = util.getCwd();

        const patchedPath = path.join(cwd, this.patched_path);
        
        if(!util.pathExists(patchedPath))
            fs.mkdirSync(patchedPath);

        const patchPath = path.join(cwd, this.patch_path);
        const patchFile = path.join(patchPath, `${key}.json`);

        const jsonString = fs.readFileSync(patchFile, 'utf-8');
        this.logger.error(jsonString);
        const data: SaverPatch = JSON.parse(jsonString);

        const src = path.join(cwd, file);
        const dst = path.join(patchedPath, key);
        const contents = `${" ".repeat(data.column)}${data.contents}`;
        
        switch (data.method) {
            case "Insert":
                util.insertFromFile(src, dst, data.line, contents);
                break;
            case "Replace":
                util.replaceFromFile(src, dst, data.line, contents);
                break;
            case "Delete":
                util.deleteFromFile(src, dst, data.line, "");
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

    private get_errorData_path_by_key(errorKey: string): string {
        return path.join(util.getCwd(), this.patch_input_path, `${errorKey}.json`);
    }

    private get_errorData_path(bug: Bug): string {
        return path.join(util.getCwd(), this.patch_input_path, `${this.get_error_key(bug)}.json`);
    }

    public set_build_cmd(build_cmd: string): void {
        this.build_cmd = build_cmd;
    }
}