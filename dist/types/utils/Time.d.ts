/**
 * Time formatting utilities
 */
export declare class TimeUtils {
    /**
     * Format seconds to MM:SS or HH:MM:SS
     * @param seconds - Time in seconds
     * @returns Formatted time string
     */
    static format(seconds: number): string;
    /**
     * Parse time string to seconds
     * @param timeStr - Time string like "1:23" or "01:23:45"
     * @returns Time in seconds
     */
    static parse(timeStr: string): number;
    /**
     * Get current timestamp in milliseconds
     * @returns Current time
     */
    static now(): number;
    /**
     * Calculate duration between two timestamps
     * @param start - Start time
     * @param end - End time
     * @returns Duration in milliseconds
     */
    static duration(start: number, end: number): number;
}
