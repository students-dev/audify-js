/**
 * Represents an audio track
 */
export class Track {
    /**
     * @param {string} url - Track URL or file path
     * @param {Object} options - Additional options
     */
    constructor(url: string, options?: any);
    url: string;
    title: any;
    artist: any;
    duration: any;
    thumbnail: any;
    metadata: any;
    id: any;
    /**
     * Get track info
     * @returns {Object} Track information
     */
    getInfo(): any;
    /**
     * Update track metadata
     * @param {Object} metadata - New metadata
     */
    updateMetadata(metadata: any): void;
    /**
     * Check if track is valid
     * @returns {boolean} Is valid
     */
    isValid(): boolean;
}
