/**
 * SoundCloud provider for basic info fetching
 */
export class SoundCloudProvider {
  /**
   * Check if URL is a valid SoundCloud URL
   * @param {string} url - URL to check
   * @returns {boolean} Is valid SoundCloud URL
   */
  static isValidUrl(url) {
    return url.includes('soundcloud.com/');
  }

  /**
   * Get basic track info from SoundCloud URL
   * @param {string} url - SoundCloud URL
   * @returns {Promise<Object>} Track info
   */
  static async getInfo(url) {
    // In a real implementation, this would call SoundCloud API
    // For now, return mock data
    return {
      title: 'SoundCloud Track',
      artist: null,
      duration: null,
      thumbnail: null,
      url: url,
      source: 'soundcloud'
    };
  }

  /**
   * Get stream URL (not implemented without dependencies)
   * @param {string} url - SoundCloud URL
   * @returns {Promise<string>} Stream URL
   */
  static async getStreamUrl(url) {
    // Would require soundcloud-scraper or similar
    throw new Error('Stream URL extraction requires additional dependencies');
  }
}