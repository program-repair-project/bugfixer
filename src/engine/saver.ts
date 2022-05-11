import * as vscode from 'vscode';
import * as path from 'path';
import { readFileSync} from 'fs';

import { Engine } from "./engine";
import { Bug, SaverBug } from "../dto/bug";
import * as util from '../common/util';

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

    public get_patch_cmd():string[] {
        const cmd: string[] = ["saver", "--error_report", this._report_file];
        return cmd;
    }

    public get_file_bugs_map(): Map<string, Bug[]> {
        const cwd = util.getCwd();
        const reportPath = path.join(cwd, this.output_path, this._report_file);

        const fileBugMap = new Map<string, Bug[]>();

        if(!util.pathExists(reportPath)) return fileBugMap;
            
        const jsonString = readFileSync(reportPath, 'utf-8');
        const data: SaverBug[] = JSON.parse(jsonString);
        
        // get file, severity, code, message, line, column
        const bugs: Bug[] = data.filter(d => d.kind === "ERROR").map(d => SaverBug.toBug(d));
        const files = Array.from(new Set(bugs.map(b => b.file)));

        files.map(f => {
            const file_bugs = bugs.filter(b => (b.file === f));
            fileBugMap.set(f, file_bugs);
        });

        return fileBugMap;
    }

    // private create_patch(bug: Bug): Patch {
    //     const message = bug.message;
    //     // capture from regex
    //     // generate json item
    // }

    public set_build_cmd(build_cmd: string): void {
        this.build_cmd = build_cmd;
    }
}