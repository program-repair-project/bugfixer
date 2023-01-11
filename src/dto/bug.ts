export class Bug {
	constructor(
		public readonly severity: string,
		public readonly name: string,
		public readonly message: string,
		public readonly line: number,
		public readonly column:	number,
		public readonly file: string,
		public readonly procedure: string,
		public readonly src_line: number = 0,
		public readonly sink_line: number = 0,
	) {}
}


export class SaverBug {
	constructor(
		public readonly kind: string,
		public readonly bug_type: string,
		public readonly qualifier: string,
		public readonly line: number,
		public readonly column:	number,
		public readonly file: string,
		public readonly procedure: string
	) {}

	public static toBug(saverBug: SaverBug): Bug {
		var arr = saverBug.qualifier.match(/.*at line (\d+).*line (\d+).*/);

		var src = 0;
		var sink = 0;

		if (arr?.length === 3) {
			src = +arr[1];
        	sink = +arr[2];
		} 

		return new Bug(saverBug.kind, saverBug.bug_type, saverBug.qualifier, saverBug.line, saverBug.column, saverBug.file, saverBug.procedure, src, sink);
	}
}

export class NPEXBug {
	// npe.json
	constructor(
		public readonly filepath: string,
		public readonly line: number,
		public readonly npe_class: string,
		public readonly npe_method: string,
		public readonly deref_field: string
	) {}

	public static toBug(bug: NPEXBug): Bug {
		return new Bug("error", "Null Pointer Exception", "널 포인터 예외가 발생했습니다.", bug.line, 1, bug.filepath, bug.npe_method, bug.line, bug.line);
	}
}

export class MosesBug {
	constructor(
		public readonly file: string,
		public readonly procedure: string,
		public readonly method: string,
		public readonly contents: string,
		public readonly line: number,
		public readonly column: number,
		
	) {}

	public static toBug(bug: MosesBug): Bug {
		return new Bug("error", "Patch Found", "패치를 찾았습니다.", bug.line, 1, bug.file, bug.procedure, bug.line, bug.line);
	}
}

export class PyterBug {
	constructor(
		public readonly info: PyterPatchInfo		
	) {}

	public static toBug(bug: PyterBug): Bug {
		return new Bug("error", "Type Error", "타입 오류가 있습니다..", bug.info.line, 1, bug.info.filename.replaceAll("/pyter/benchmark", ""), bug.info.funcname, bug.info.line, bug.info.line);
	}
}

export class PyterPatchInfo {
	constructor(
		public readonly filename: string,
		public readonly funcname: string,
		public readonly line: number,
		public readonly classname: number
	) {}
}