/**
 * SoundCloud provider for basic info fetching
 */
export class SoundCloudProvider {
    /**
     * Check if URL is a valid SoundCloud URL
     * @param {string} url - URL to check
     * @returns {boolean} Is valid SoundCloud URL
     */
    static isValidUrl(url: string): boolean;
    /**
     * Get basic track info from SoundCloud URL
     * @param {string} url - SoundCloud URL
     * @returns {Promise<Object>} Track info
     */
    static getInfo(url: string): Promise<any>;
    /**
     * Get stream URL (not implemented without dependencies)
     * @param {string} url - SoundCloud URL
     * @returns {Promise<string>} Stream URL
     */
    static getStreamUrl(url: string): Promise<string>;
}
