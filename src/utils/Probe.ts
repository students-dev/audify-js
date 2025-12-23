/**
 * Audio probing utilities
 */
export class ProbeUtils {
  /**
   * Probe audio file/stream for basic info
   * @param source - Audio source
   * @returns Probe result
   */
  static async probe(source: string | Buffer | ReadableStream): Promise<any> {
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
   * @param url - URL to check
   * @returns Is valid audio URL
   */
  static isValidAudioUrl(url: string): boolean {
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
   * @param source - Audio source
   * @returns Audio format
   */
  static getFormat(source: string | Buffer): string | null {
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
