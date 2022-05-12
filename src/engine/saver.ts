import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from "child_process";

import { Engine } from "./engine";
import { Bug, SaverBug } from "../dto/bug";
import * as util from '../common/util';
import { maxHeaderSize } from 'http';

export class SaverEngine extends Engine {
    protected _report_file: string = "report.json";
    protected _patch_input_path: string = "patch_inputs";
    protected _patch_input_file: string = "patch_input.json";

    constructor() {
        super("Saver", "infer", "infer-out");
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
        const reportPath = path.join(cwd, this.output_path, this._report_file);

        const fileBugMap = new Map<string, Bug[]>();

        if (!util.pathExists(reportPath)) return fileBugMap;

        const jsonString = fs.readFileSync(reportPath, 'utf-8');
        const data: SaverBug[] = JSON.parse(jsonString);

        // get file, severity, code, message, line, column
        const bugs: Bug[] = data.filter(d => d.kind === "ERROR").map(d => SaverBug.toBug(d));
        const files = Array.from(new Set(bugs.map(b => b.file)));

        const patch_input_path = path.join(cwd, this._patch_input_path);
        
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
                fs.mkdirSync(errorDataPath);
            }

            fs.writeFileSync(errorDataFile, JSON.stringify(errorDataJson, null, 2), 'utf8');
        } catch (error) {
            console.log('An error has occurred ', error);
        }
    }

    public make_patch(errorKey: string): void {
        let result = "";
        const cwd = util.getCwd();

        let saver = child_process.spawn(
            this.analyze_cmd,
            this.get_patch_cmd(errorKey),
            { cwd: cwd }
        );

        saver.stderr.on("data", data => {
            let log: string = data.toString();
            result += log;
        });

        saver.on("exit", (code) => {
            const patchPath = path.join(cwd, "patches");
            
            if(!util.pathExists(patchPath))
                fs.mkdirSync(patchPath);

            const patchFile = path.join(patchPath, `${errorKey}.json`);
            fs.writeFileSync(patchFile, result, 'utf8');

            vscode.window.showInformationMessage("패치 생성이 완료되었습니다.");
        });
    }

    public get_error_key(bug: Bug): string {
        return `${bug.file}_${bug.src_line}_${bug.sink_line}`;
    }

    private get_errorData_path_by_key(errorKey: string): string {
        return path.join(util.getCwd(), this._patch_input_path, `${errorKey}.json`);
    }

    private get_errorData_path(bug: Bug): string {
        return path.join(util.getCwd(), this._patch_input_path, `${this.get_error_key(bug)}.json`);
    }

    public set_build_cmd(build_cmd: string): void {
        this.build_cmd = build_cmd;
    }
}