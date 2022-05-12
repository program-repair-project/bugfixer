import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
import * as vscode from 'vscode'

export enum PatchType {Insert, Delete, Replace};

export class Patch {
    public constructor(
        private readonly type: PatchType,
        private readonly range: vscode.Range,
        private readonly patch: string
    ) {}
}