import { Engine } from "./engine";

export class SaverEngine extends Engine {

    constructor(name:string, analyze_cmd:string, output_path:string) {
        super(name, analyze_cmd, output_path);
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
        const cmd: string[] = ["saver", "--error_report", "report.json"];
        return cmd;
    }

    public get_result(): void {
        
    }

    public set_build_cmd(build_cmd: string): void {
        this.build_cmd = build_cmd;
    }
}