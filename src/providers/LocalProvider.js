import { promises as fs } from 'fs';
import { extname } from 'path';

/**
 * Local file provider for Node.js
 */
export class LocalProvider {
  /**
   * Check if path is a valid local audio file
   * @param {string} path - File path
   * @returns {boolean} Is valid audio file
   */
  static isValidPath(path) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
    return audioExtensions.includes(extname(path).toLowerCase());
  }

  /**
   * Get track info from local file
   * @param {string} path - File path
   * @returns {Promise<Object>} Track info
   */
  static async getInfo(path) {
    try {
      const stats = await fs.stat(path);
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }

      return {
        title: path.split('/').pop().replace(extname(path), ''),
        artist: null,
        duration: null, // Would need audio parsing library
        thumbnail: null,
        url: `file://${path}`,
        source: 'local',
        size: stats.size,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @param {string} path - File path
   * @returns {Promise<boolean>} File exists
   */
  static async exists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}