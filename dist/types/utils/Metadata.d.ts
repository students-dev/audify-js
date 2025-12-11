/**
 * Metadata parsing utilities
 */
export class MetadataUtils {
    /**
     * Extract basic metadata from URL or file path
     * @param {string} source - URL or file path
     * @returns {Object} Metadata object
     */
    static extract(source: string): any;
    /**
     * Extract title from source
     * @param {string} source - Source string
     * @returns {string} Extracted title
     */
    static extractTitle(source: string): string;
    /**
     * Extract YouTube metadata (basic)
     * @param {string} url - YouTube URL
     * @returns {Object} Metadata
     */
    static extractYouTubeMetadata(url: string): any;
    /**
     * Extract SoundCloud metadata (basic)
     * @param {string} url - SoundCloud URL
     * @returns {Object} Metadata
     */
    static extractSoundCloudMetadata(url: string): any;
    /**
     * Extract file metadata (basic)
     * @param {string} path - File path
     * @returns {Object} Metadata
     */
    static extractFileMetadata(path: string): any;
}
