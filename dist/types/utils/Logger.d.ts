export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
/**
 * Logger utility with different levels
 */
export declare class Logger {
    private levels;
    private currentLevel;
    constructor(level?: LogLevel);
    /**
     * Set log level
     * @param level - Log level (debug, info, warn, error)
     */
    setLevel(level: LogLevel): void;
    /**
     * Debug log
     * @param args - Arguments to log
     */
    debug(...args: any[]): void;
    /**
     * Info log
     * @param args - Arguments to log
     */
    info(...args: any[]): void;
    /**
     * Warning log
     * @param args - Arguments to log
     */
    warn(...args: any[]): void;
    /**
     * Error log
     * @param args - Arguments to log
     */
    error(...args: any[]): void;
}
export declare const logger: Logger;
