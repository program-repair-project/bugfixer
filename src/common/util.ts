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