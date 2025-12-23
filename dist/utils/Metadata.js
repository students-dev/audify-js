/**
 * Metadata parsing utilities
 */
export class MetadataUtils {
    /**
     * Extract basic metadata from URL or file path
     * @param source - URL or file path
     * @returns Metadata object
     */
    static extract(source) {
        if (!source)
            return {};
        const metadata = {
            title: this.extractTitle(source),
            artist: undefined,
            duration: undefined,
            thumbnail: undefined
        };
        // For YouTube URLs
        if (source.includes('youtube.com') || source.includes('youtu.be')) {
            return this.extractYouTubeMetadata(source);
        }
        // For SoundCloud URLs
        if (source.includes('soundcloud.com')) {
            return this.extractSoundCloudMetadata(source);
        }
        // For local files
        if (!source.startsWith('http')) {
            return this.extractFileMetadata(source);
        }
        return metadata;
    }
    /**
     * Extract title from source
     * @param source - Source string
     * @returns Extracted title
     */
    static extractTitle(source) {
        if (!source)
            return 'Unknown Track';
        // Try to extract from URL query params
        try {
            const url = new URL(source);
            const title = url.searchParams.get('title') || url.searchParams.get('name');
            if (title)
                return decodeURIComponent(title);
        }
        catch { } // eslint-disable-line no-empty
        // Extract from file path
        const parts = source.split('/').pop()?.split('\\').pop();
        if (parts) {
            return parts.replace(/\.[^/.]+$/, ''); // Remove extension
        }
        return 'Unknown Track';
    }
    /**
     * Extract YouTube metadata (basic)
     * @param url - YouTube URL
     * @returns Metadata
     */
    static extractYouTubeMetadata(url) {
        return {
            title: 'YouTube Track',
            source: 'youtube'
        };
    }
    /**
     * Extract SoundCloud metadata (basic)
     * @param url - SoundCloud URL
     * @returns Metadata
     */
    static extractSoundCloudMetadata(url) {
        return {
            title: 'SoundCloud Track',
            source: 'soundcloud'
        };
    }
    /**
     * Extract file metadata (basic)
     * @param path - File path
     * @returns Metadata
     */
    static extractFileMetadata(path) {
        const title = this.extractTitle(path);
        return {
            title,
            source: 'local'
        };
    }
}
