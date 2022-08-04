import * as fs from 'fs';
import {workspace, window} from 'vscode';
import * as path from 'path';
import * as util from './util';
import * as winston from 'winston';

import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;

export class Logger {
  private logPath: string = util.getCwd() +  "/bugfixer.log";
  private ts: number = 0;
  private logger: winston.Logger;
  private log_level: string;

  constructor(private name: string) {
    const myFormat = printf(({ level, message, label, timestamp }) => {
      return `[${level.toUpperCase().padEnd(5, ' ')}][${timestamp}][${this.name.padEnd(20, ' ')}] ${message}`;
    });

    this.log_level = workspace.getConfiguration().get("bugfixer.log_level", "info");
    
    this.logger = createLogger({
      level: this.log_level,
      format: combine(
        label({ label: name }),
        timestamp(),
        myFormat
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: this.logPath })
      ]
    });
  }

  public info(m: string) {
    this.logger.info(this.getTabString() + m);
  }

  public debug(m: string) {
    this.logger.debug(this.getTabString() + m);
  }

  public error(m: string) {
    this.logger.error(this.getTabString() + m);
  }

  public trace(m: string) {
    this.logger.verbose(this.getTabString() + m);
  }

  public increaseTab() {
    this.ts += 1;
  }

  public decreaseTab() {
    if(this.ts > 0) {
      this.ts -= 1;
    } else {
      this.ts = 0;
    }
  }

  public start(m: string) {
    this.trace("");
    this.trace(`[ Start ${m} ]`);
    this.increaseTab();
  }

  public end(m: string) {
    this.decreaseTab();
    this.trace(`[ End ${m} ]`);
    this.trace("");
  }

  private getTabString() {
    return "|    ".repeat(this.ts);
  }
}