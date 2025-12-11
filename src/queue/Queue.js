import { Track } from './Track.js';
import { EventBus } from '../events/EventBus.js';
import { EVENTS } from '../constants/Modes.js';

/**
 * Audio queue management
 */
export class Queue {
  constructor() {
    this.tracks = [];
    this.currentIndex = -1;
    this.eventBus = new EventBus();
  }

  /**
   * Add track(s) to queue
   * @param {Track|Track[]|string|string[]} tracks - Track(s) to add
   * @param {number} position - Position to insert (optional)
   */
  add(tracks, position) {
    const trackArray = Array.isArray(tracks) ? tracks : [tracks];

    const processedTracks = trackArray.map(track => {
      if (typeof track === 'string') {
        return new Track(track);
      }
      return track instanceof Track ? track : new Track(track.url, track);
    });

    if (position !== undefined && position >= 0 && position <= this.tracks.length) {
      this.tracks.splice(position, 0, ...processedTracks);
    } else {
      this.tracks.push(...processedTracks);
    }

    processedTracks.forEach(track => {
      this.eventBus.emit(EVENTS.TRACK_ADD, track);
    });
  }

  /**
   * Remove track from queue
   * @param {number|string} identifier - Track index or ID
   * @returns {Track|null} Removed track
   */
  remove(identifier) {
    let index;
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
    return removed;
  }

  /**
   * Shuffle the queue
   */
  shuffle() {
    if (this.tracks.length <= 1) return;

    // Fisher-Yates shuffle
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }

    this.currentIndex = -1;
    this.eventBus.emit(EVENTS.SHUFFLE, this.tracks);
  }

  /**
   * Clear the queue
   */
  clear() {
    this.tracks = [];
    this.currentIndex = -1;
    this.eventBus.emit(EVENTS.CLEAR);
  }

  /**
   * Jump to specific track
   * @param {number} index - Track index
   * @returns {Track|null} Track at index
   */
  jump(index) {
    if (index < 0 || index >= this.tracks.length) return null;
    this.currentIndex = index;
    return this.tracks[index];
  }

  /**
   * Get current track
   * @returns {Track|null} Current track
   */
  getCurrent() {
    return this.currentIndex >= 0 ? this.tracks[this.currentIndex] : null;
  }

  /**
   * Get next track
   * @returns {Track|null} Next track
   */
  getNext() {
    if (this.tracks.length === 0) return null;
    this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
    return this.tracks[this.currentIndex];
  }

  /**
   * Get previous track
   * @returns {Track|null} Previous track
   */
  getPrevious() {
    if (this.tracks.length === 0) return null;
    this.currentIndex = this.currentIndex <= 0 ? this.tracks.length - 1 : this.currentIndex - 1;
    return this.tracks[this.currentIndex];
  }

  /**
   * Get all tracks
   * @returns {Track[]} Array of tracks
   */
  getTracks() {
    return [...this.tracks];
  }

  /**
   * Get queue size
   * @returns {number} Number of tracks
   */
  size() {
    return this.tracks.length;
  }

  /**
   * Check if queue is empty
   * @returns {boolean} Is empty
   */
  isEmpty() {
    return this.tracks.length === 0;
  }

  /**
   * Get track at index
   * @param {number} index - Track index
   * @returns {Track|null} Track at index
   */
  getTrack(index) {
    return index >= 0 && index < this.tracks.length ? this.tracks[index] : null;
  }
}