const LOG_LEVEL = process.env.NODE_ENV === "production" ? "warn" : "log";

/** Signature of a logging function */
export interface LogFn {
  (message?: any, ...optionalParams: any[]): void;
}

/** Basic logger interface */
export interface Logger {
  log: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

/** Log levels */
export type LogLevel = "log" | "info" | "warn" | "error";

const NO_OP: LogFn = (message?: any, ...optionalParams: any[]) => {};

/** Logger which outputs to the browser console */
export class ConsoleLogger implements Logger {
  readonly log: LogFn;
  readonly info: LogFn;
  readonly warn: LogFn;
  readonly error: LogFn;

  constructor(options?: { level?: LogLevel }) {
    const { level } = options || {};

    this.error = console.error.bind(console);

    if (level === "error") {
      this.info = NO_OP;
      this.warn = NO_OP;
      this.log = NO_OP;

      return;
    }

    this.warn = console.warn.bind(console);

    if (level === "warn") {
      this.info = NO_OP;
      this.log = NO_OP;
      return;
    }

    this.info = console.info.bind(console);

    if (level === "info") {
      this.log = NO_OP;
      return;
    }

    this.log = console.log.bind(console);
  }
}

const logger = new ConsoleLogger({ level: LOG_LEVEL });
export default logger;
