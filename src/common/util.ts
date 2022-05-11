import * as fs from 'fs';

export function pathExists(p: string): boolean {
	try {
	  fs.accessSync(p);
	} catch (err) {
	  return false;
	}
  
	return true;
}
  