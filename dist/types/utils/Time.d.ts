/**
 * Time formatting utilities
 */
export class TimeUtils {
    /**
     * Format seconds to MM:SS or HH:MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    static format(seconds: number): string;
    /**
     * Parse time string to seconds
     * @param {string} timeStr - Time string like "1:23" or "01:23:45"
     * @returns {number} Time in seconds
     */
    static parse(timeStr: string): number;
    /**
     * Get current timestamp in milliseconds
     * @returns {number} Current time
     */
    static now(): number;
    /**
     * Calculate duration between two timestamps
     * @param {number} start - Start time
     * @param {number} end - End time
     * @returns {number} Duration in milliseconds
     */
    static duration(start: number, end: number): number;
}
