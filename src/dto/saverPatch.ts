import * as vscode from 'vscode'

export class SaverPatch {
  constructor(
      public readonly method: string,
      public readonly line: number,
      public readonly contents: string
  ) {}
}