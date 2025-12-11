/**
 * Audio probing utilities
 */
export class ProbeUtils {
  /**
   * Probe audio file/stream for basic info
   * @param {string|Buffer|ReadableStream} source - Audio source
   * @returns {Promise<Object>} Probe result
   */
  static async probe(source) {
    // In a real implementation, this would use ffprobe or similar
    // For now, return basic mock data
    return {
      duration: null, // seconds
      format: null, // e.g., 'mp3', 'wav'
      bitrate: null, // kbps
      sampleRate: null, // Hz
      channels: null // 1 or 2
    };
  }

  /**
   * Check if source is a valid audio URL
   * @param {string} url - URL to check
   * @returns {boolean} Is valid audio URL
   */
  static isValidAudioUrl(url) {
    if (!url || typeof url !== 'string') return false;

    try {
      const parsed = new URL(url);
      const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
      const path = parsed.pathname.toLowerCase();

      return audioExtensions.some(ext => path.endsWith(ext)) ||
             url.includes('youtube.com') ||
             url.includes('youtu.be') ||
             url.includes('soundcloud.com');
    } catch {
      return false;
    }
  }

  /**
   * Get audio format from URL or buffer
   * @param {string|Buffer} source - Audio source
   * @returns {string|null} Audio format
   */
  static getFormat(source) {
    if (typeof source === 'string') {
      const extensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
      for (const ext of extensions) {
        if (source.toLowerCase().includes(`.${ext}`)) {
          return ext;
        }
      }
    }
    // For buffer, would need to check headers
    return null;
  }
}