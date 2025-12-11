import { MetadataUtils } from '../utils/Metadata.js';

/**
 * Represents an audio track
 */
export class Track {
  /**
   * @param {string} url - Track URL or file path
   * @param {Object} options - Additional options
   */
  constructor(url, options = {}) {
    this.url = url;
    this.title = options.title || MetadataUtils.extract(url).title;
    this.artist = options.artist || null;
    this.duration = options.duration || null;
    this.thumbnail = options.thumbnail || null;
    this.metadata = options.metadata || {};
    this.id = options.id || Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get track info
   * @returns {Object} Track information
   */
  getInfo() {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      artist: this.artist,
      duration: this.duration,
      thumbnail: this.thumbnail,
      metadata: this.metadata
    };
  }

  /**
   * Update track metadata
   * @param {Object} metadata - New metadata
   */
  updateMetadata(metadata) {
    Object.assign(this.metadata, metadata);
  }

  /**
   * Check if track is valid
   * @returns {boolean} Is valid
   */
  isValid() {
    return !!(this.url && this.title);
  }
}