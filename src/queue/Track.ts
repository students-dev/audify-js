import { MetadataUtils } from '../utils/Metadata';
import { ITrack } from '../interfaces';

/**
 * Represents an audio track
 */
export class Track implements ITrack {
  public id: string;
  public url: string;
  public title: string;
  public artist?: string;
  public duration?: number;
  public thumbnail?: string;
  public source?: string;
  public metadata: Record<string, any>;

  /**
   * @param url - Track URL or file path
   * @param options - Additional options
   */
  constructor(url: string, options: Partial<ITrack> = {}) {
    const extracted = MetadataUtils.extract(url);
    
    this.url = url;
    this.title = options.title || extracted.title || 'Unknown Title';
    this.artist = options.artist || extracted.artist;
    this.duration = options.duration || extracted.duration;
    this.thumbnail = options.thumbnail || extracted.thumbnail;
    this.source = options.source || extracted.source || 'unknown';
    this.metadata = options.metadata || {};
    this.id = options.id || Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get track info
   * @returns Track information
   */
  getInfo(): ITrack {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      artist: this.artist,
      duration: this.duration,
      thumbnail: this.thumbnail,
      source: this.source,
      metadata: this.metadata
    };
  }

  /**
   * Update track metadata
   * @param metadata - New metadata
   */
  updateMetadata(metadata: Partial<ITrack>): void {
    Object.assign(this, metadata);
    if (metadata.metadata) {
      Object.assign(this.metadata, metadata.metadata);
    }
  }

  /**
   * Check if track is valid
   * @returns Is valid
   */
  isValid(): boolean {
    return !!(this.url && this.title);
  }
}
