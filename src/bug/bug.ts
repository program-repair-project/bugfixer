export class Bug {
	constructor(
		public readonly severity: string,
		public readonly name: string,
		public readonly message: string,
		public readonly line: number,
		public readonly column:	number,
		public readonly file: string
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
		return new Bug(saverBug.kind, saverBug.bug_type, saverBug.qualifier, saverBug.line, saverBug.column, saverBug.file);
	}
}