/**
 * Spotify provider for client-side API integration
 */
export class SpotifyProvider {
    constructor(options?: {});
    spotifyApi: any;
    /**
     * Set access token
     * @param {string} token - OAuth access token
     */
    setAccessToken(token: string): void;
    /**
     * Set refresh token
     * @param {string} token - OAuth refresh token
     */
    setRefreshToken(token: string): void;
    /**
     * Refresh access token
     * @returns {Promise<Object>} Token response
     */
    refreshAccessToken(): Promise<any>;
    /**
     * Search tracks
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Array of track objects
     */
    searchTracks(query: string, options?: any): Promise<any[]>;
    /**
     * Get track by ID
     * @param {string} trackId - Spotify track ID
     * @returns {Promise<Object>} Track object
     */
    getTrack(trackId: string): Promise<any>;
    /**
     * Get tracks by IDs
     * @param {Array<string>} trackIds - Array of Spotify track IDs
     * @returns {Promise<Array>} Array of track objects
     */
    getTracks(trackIds: Array<string>): Promise<any[]>;
    /**
     * Get audio features for track
     * @param {string} trackId - Spotify track ID
     * @returns {Promise<Object>} Audio features
     */
    getAudioFeatures(trackId: string): Promise<any>;
    /**
     * Format Spotify track to internal format
     * @param {Object} spotifyTrack - Spotify track object
     * @returns {Object} Formatted track
     * @private
     */
    private _formatTrack;
}
