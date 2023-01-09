export class SaverPatch {
  constructor(
      public readonly method: string,
      public readonly line: number,
      public readonly column: number,
      public readonly contents: string
  ) {}
}