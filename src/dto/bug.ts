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