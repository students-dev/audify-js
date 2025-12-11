/**
 * Metadata parsing utilities
 */
export class MetadataUtils {
  /**
   * Extract basic metadata from URL or file path
   * @param {string} source - URL or file path
   * @returns {Object} Metadata object
   */
  static extract(source) {
    if (!source) return {};

    const metadata = {
      title: this.extractTitle(source),
      artist: null,
      duration: null,
      thumbnail: null
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
   * @param {string} source - Source string
   * @returns {string} Extracted title
   */
  static extractTitle(source) {
    if (!source) return 'Unknown Track';

    // Try to extract from URL query params
    try {
      const url = new URL(source);
      const title = url.searchParams.get('title') || url.searchParams.get('name');
      if (title) return decodeURIComponent(title);
    } catch {}

    // Extract from file path
    const parts = source.split('/').pop().split('\\').pop();
    if (parts) {
      return parts.replace(/\.[^/.]+$/, ''); // Remove extension
    }

    return 'Unknown Track';
  }

  /**
   * Extract YouTube metadata (basic)
   * @param {string} url - YouTube URL
   * @returns {Object} Metadata
   */
  static extractYouTubeMetadata(url) {
    // Basic extraction, in real implementation would fetch from API
    return {
      title: 'YouTube Track',
      artist: null,
      duration: null,
      thumbnail: null,
      source: 'youtube'
    };
  }

  /**
   * Extract SoundCloud metadata (basic)
   * @param {string} url - SoundCloud URL
   * @returns {Object} Metadata
   */
  static extractSoundCloudMetadata(url) {
    // Basic extraction
    return {
      title: 'SoundCloud Track',
      artist: null,
      duration: null,
      thumbnail: null,
      source: 'soundcloud'
    };
  }

  /**
   * Extract file metadata (basic)
   * @param {string} path - File path
   * @returns {Object} Metadata
   */
  static extractFileMetadata(path) {
    const title = this.extractTitle(path);
    return {
      title,
      artist: null,
      duration: null,
      thumbnail: null,
      source: 'local'
    };
  }
}