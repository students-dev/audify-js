export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger utility with different levels
 */
export class Logger {
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  private currentLevel: number;

  constructor(level: LogLevel = 'info') {
    this.currentLevel = this.levels[level];
  }

  /**
   * Set log level
   * @param level - Log level (debug, info, warn, error)
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = this.levels[level] || this.levels.info;
  }

  /**
   * Debug log
   * @param args - Arguments to log
   */
  debug(...args: any[]): void {
    if (this.currentLevel <= this.levels.debug) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Info log
   * @param args - Arguments to log
   */
  info(...args: any[]): void {
    if (this.currentLevel <= this.levels.info) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Warning log
   * @param args - Arguments to log
   */
  warn(...args: any[]): void {
    if (this.currentLevel <= this.levels.warn) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Error log
   * @param args - Arguments to log
   */
  error(...args: any[]): void {
    if (this.currentLevel <= this.levels.error) {
      console.error('[ERROR]', ...args);
    }
  }
}

// Default logger instance
export const logger = new Logger();
