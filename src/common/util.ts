import * as fs from 'fs';
import * as vscode from 'vscode';

export function pathExists(p: string): boolean {
	try {
	  fs.accessSync(p);
	} catch (err) {
	  return false;
	}
  
	return true;
}

export function getCwd(): string {
	if(vscode.workspace.workspaceFolders === undefined) return "";

  return vscode.workspace.workspaceFolders[0].uri.path;
} 

function insertLine(data: Array<string>, line:number, contents: string): Array<string> {
	return data.splice(line, 0, contents);
}

function replaceLine(data: Array<string>, line:number, contents: string): Array<string> {
	return data.splice(line, 1, contents);
}

function deleteLine(data: Array<string>, line:number, contents: string): Array<string> {
	return data.splice(line, 1);
}

export function manipulateFile(src: string, dst: string, line: number, contents: string, func: Function) {
	var data = fs.readFileSync(src).toString().split("\n");
	func(data, line, contents)
	var text = data.join("\n");

	fs.writeFile(dst, text, function (err) {
		if (err) return console.log(err);
	});
}

export function insertFromFile(src: string, dst:string, line: number, contents: string) {
	return manipulateFile(src, dst, line, contents, insertLine);
} 

export function replaceFromFile(src: string, dst:string, line: number, contents: string) {
	return manipulateFile(src, dst, line, contents, replaceLine);
} 

export function deleteFromFile(src: string, dst:string, line: number, contents: string) {
	return manipulateFile(src, dst, line, contents, deleteLine);
} 

