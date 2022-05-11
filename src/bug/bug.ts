export class Bug {
	constructor(
		public readonly severity: string,
		public readonly name: string,
		public readonly message: string,
		public readonly line: number,
		public readonly column:	number,
		public readonly file: string,
		public readonly src_line: number = 0,
		public readonly src_column: number = 0,
		public readonly sink_line: number = 0,
		public readonly sink_column: number = 0
	) {}
}

export class SaverBug {
	constructor(
		public readonly kind: string,
		public readonly bug_type: string,
		public readonly qualifier: string,
		public readonly line: number,
		public readonly column:	number,
		public readonly file: string
	) {}

	public static toBug(saverBug: SaverBug): Bug {
		// if name == MEMORY_LEAK
		// get src, sink
		


		return new Bug(saverBug.kind, saverBug.bug_type, saverBug.qualifier, saverBug.line, saverBug.column, saverBug.file);
	}
}