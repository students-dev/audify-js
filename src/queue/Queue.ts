import { Track } from './Track';
import { EventBus } from '../events/EventBus';
import { EVENTS } from '../constants';
import { ITrack } from '../interfaces';

/**
 * Audio queue management
 */
export class Queue {
  private tracks: Track[];
  private currentIndex: number;
  public eventBus: EventBus;

  constructor() {
    this.tracks = [];
    this.currentIndex = -1;
    this.eventBus = new EventBus();
  }

  /**
   * Add track(s) to queue
   * @param tracks - Track(s) to add
   * @param position - Position to insert (optional)
   */
  add(tracks: Track | ITrack | (Track | ITrack)[] | string | string[], position?: number): void {
    const trackArray = Array.isArray(tracks) ? tracks : [tracks];

    const processedTracks = trackArray.map(track => {
      if (typeof track === 'string') {
        return new Track(track);
      }
      if (track instanceof Track) {
        return track;
      }
      // It's ITrack or similar object
      return new Track(track.url, track);
    });

    if (position !== undefined && position >= 0 && position <= this.tracks.length) {
      this.tracks.splice(position, 0, ...processedTracks);
    } else {
      this.tracks.push(...processedTracks);
    }

    processedTracks.forEach(track => {
      this.eventBus.emit(EVENTS.TRACK_ADD, track);
    });
    this.eventBus.emit(EVENTS.QUEUE_UPDATE, this.tracks);
  }

  /**
   * Remove track from queue
   * @param identifier - Track index or ID
   * @returns Removed track
   */
  remove(identifier: number | string): Track | null {
    let index: number;
    if (typeof identifier === 'number') {
      index = identifier;
    } else {
      index = this.tracks.findIndex(track => track.id === identifier);
    }

    if (index < 0 || index >= this.tracks.length) return null;

    const removed = this.tracks.splice(index, 1)[0];

    if (this.currentIndex > index) {
      this.currentIndex--;
    } else if (this.currentIndex === index) {
      this.currentIndex = -1;
    }

    this.eventBus.emit(EVENTS.TRACK_REMOVE, removed);
    this.eventBus.emit(EVENTS.QUEUE_UPDATE, this.tracks);
    return removed;
  }

  /**
   * Shuffle the queue
   */
  shuffle(): void {
    if (this.tracks.length <= 1) return;

    let currentTrack: Track | null = null;
    if (this.currentIndex >= 0) {
      currentTrack = this.tracks[this.currentIndex];
    }

    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }

    if (currentTrack) {
      this.currentIndex = this.tracks.indexOf(currentTrack);
    } else {
      this.currentIndex = -1;
    }

    this.eventBus.emit(EVENTS.QUEUE_UPDATE, this.tracks);
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.tracks = [];
    this.currentIndex = -1;
    this.eventBus.emit(EVENTS.QUEUE_UPDATE, this.tracks);
  }

  /**
   * Jump to specific track
   * @param index - Track index
   * @returns Track at index
   */
  jump(index: number): Track | null {
    if (index < 0 || index >= this.tracks.length) return null;
    this.currentIndex = index;
    return this.tracks[index];
  }

  /**
   * Get current track
   * @returns Current track
   */
  getCurrent(): Track | null {
    return this.currentIndex >= 0 ? this.tracks[this.currentIndex] : null;
  }

  /**
   * Get next track
   * Moves cursor forward
   * @param loop - Whether to loop back to start
   * @returns Next track
   */
  next(loop: boolean = false): Track | null {
    if (this.tracks.length === 0) return null;
    
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.tracks.length) {
      if (loop) {
        nextIndex = 0;
      } else {
        return null;
      }
    }
    
    this.currentIndex = nextIndex;
    return this.tracks[this.currentIndex];
  }

  /**
   * Get previous track
   * Moves cursor backward
   * @param loop - Whether to loop to end
   * @returns Previous track
   */
  previous(loop: boolean = false): Track | null {
    if (this.tracks.length === 0) return null;

    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      if (loop) {
        prevIndex = this.tracks.length - 1;
      } else {
        return null;
      }
    }

    this.currentIndex = prevIndex;
    return this.tracks[this.currentIndex];
  }

  /**
   * Get all tracks
   * @returns Array of tracks
   */
  getTracks(): Track[] {
    return [...this.tracks];
  }

  /**
   * Get queue size
   * @returns Number of tracks
   */
  size(): number {
    return this.tracks.length;
  }

  /**
   * Check if queue is empty
   * @returns Is empty
   */
  isEmpty(): boolean {
    return this.tracks.length === 0;
  }

  /**
   * Get track at index
   * @param index - Track index
   * @returns Track at index
   */
  getTrack(index: number): Track | null {
    return index >= 0 && index < this.tracks.length ? this.tracks[index] : null;
  }
}