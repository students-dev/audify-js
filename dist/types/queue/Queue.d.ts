/**
 * Audio queue management
 */
export class Queue {
    tracks: any[];
    currentIndex: number;
    eventBus: EventBus;
    /**
     * Add track(s) to queue
     * @param {Track|Track[]|string|string[]} tracks - Track(s) to add
     * @param {number} position - Position to insert (optional)
     */
    add(tracks: Track | Track[] | string | string[], position: number): void;
    /**
     * Remove track from queue
     * @param {number|string} identifier - Track index or ID
     * @returns {Track|null} Removed track
     */
    remove(identifier: number | string): Track | null;
    /**
     * Shuffle the queue
     */
    shuffle(): void;
    /**
     * Clear the queue
     */
    clear(): void;
    /**
     * Jump to specific track
     * @param {number} index - Track index
     * @returns {Track|null} Track at index
     */
    jump(index: number): Track | null;
    /**
     * Get current track
     * @returns {Track|null} Current track
     */
    getCurrent(): Track | null;
    /**
     * Get next track
     * @returns {Track|null} Next track
     */
    getNext(): Track | null;
    /**
     * Get previous track
     * @returns {Track|null} Previous track
     */
    getPrevious(): Track | null;
    /**
     * Get all tracks
     * @returns {Track[]} Array of tracks
     */
    getTracks(): Track[];
    /**
     * Get queue size
     * @returns {number} Number of tracks
     */
    size(): number;
    /**
     * Check if queue is empty
     * @returns {boolean} Is empty
     */
    isEmpty(): boolean;
    /**
     * Get track at index
     * @param {number} index - Track index
     * @returns {Track|null} Track at index
     */
    getTrack(index: number): Track | null;
}
import { EventBus } from '../events/EventBus.js';
import { Track } from './Track.js';
