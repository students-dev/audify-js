/**
 * Time formatting utilities
 */
export class TimeUtils {
    /**
     * Format seconds to MM:SS or HH:MM:SS
     * @param seconds - Time in seconds
     * @returns Formatted time string
     */
    static format(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0)
            return '00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    /**
     * Parse time string to seconds
     * @param timeStr - Time string like "1:23" or "01:23:45"
     * @returns Time in seconds
     */
    static parse(timeStr) {
        if (!timeStr)
            return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return 0;
    }
    /**
     * Get current timestamp in milliseconds
     * @returns Current time
     */
    static now() {
        return Date.now();
    }
    /**
     * Calculate duration between two timestamps
     * @param start - Start time
     * @param end - End time
     * @returns Duration in milliseconds
     */
    static duration(start, end) {
        return end - start;
    }
}
