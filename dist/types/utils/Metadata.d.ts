import { ITrack } from '../interfaces';
/**
 * Metadata parsing utilities
 */
export declare class MetadataUtils {
    /**
     * Extract basic metadata from URL or file path
     * @param source - URL or file path
     * @returns Metadata object
     */
    static extract(source: string): Partial<ITrack>;
    /**
     * Extract title from source
     * @param source - Source string
     * @returns Extracted title
     */
    static extractTitle(source: string): string;
    /**
     * Extract YouTube metadata (basic)
     * @param url - YouTube URL
     * @returns Metadata
     */
    private static extractYouTubeMetadata;
    /**
     * Extract SoundCloud metadata (basic)
     * @param url - SoundCloud URL
     * @returns Metadata
     */
    private static extractSoundCloudMetadata;
    /**
     * Extract file metadata (basic)
     * @param path - File path
     * @returns Metadata
     */
    private static extractFileMetadata;
}
