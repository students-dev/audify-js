/**
 * Logger utility with different levels
 */
export class Logger {
    constructor(level?: string);
    levels: {
        debug: number;
        info: number;
        warn: number;
        error: number;
    };
    currentLevel: any;
    /**
     * Set log level
     * @param {string} level - Log level (debug, info, warn, error)
     */
    setLevel(level: string): void;
    /**
     * Debug log
     * @param {...*} args - Arguments to log
     */
    debug(...args: any[]): void;
    /**
     * Info log
     * @param {...*} args - Arguments to log
     */
    info(...args: any[]): void;
    /**
     * Warning log
     * @param {...*} args - Arguments to log
     */
    warn(...args: any[]): void;
    /**
     * Error log
     * @param {...*} args - Arguments to log
     */
    error(...args: any[]): void;
}
export const logger: Logger;
