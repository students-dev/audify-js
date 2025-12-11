/**
 * YouTube provider for basic info fetching
 */
export class YouTubeProvider {
    /**
     * Check if URL is a valid YouTube URL
     * @param {string} url - URL to check
     * @returns {boolean} Is valid YouTube URL
     */
    static isValidUrl(url: string): boolean;
    /**
     * Extract video ID from YouTube URL
     * @param {string} url - YouTube URL
     * @returns {string|null} Video ID
     */
    static extractVideoId(url: string): string | null;
    /**
     * Get basic track info from YouTube URL
     * @param {string} url - YouTube URL
     * @returns {Promise<Object>} Track info
     */
    static getInfo(url: string): Promise<any>;
    /**
     * Get stream URL (not implemented without dependencies)
     * @param {string} url - YouTube URL
     * @returns {Promise<string>} Stream URL
     */
    static getStreamUrl(url: string): Promise<string>;
}
