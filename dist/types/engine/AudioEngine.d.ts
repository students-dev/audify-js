/**
 * Main audio engine class
 */
export class AudioEngine {
    constructor(options?: {});
    options: {};
    audioContext: any;
    player: Player;
    filters: Filters;
    queue: Queue;
    eventBus: EventBus;
    isReady: boolean;
    /**
     * Initialize the audio engine
     */
    initialize(): Promise<void>;
    /**
     * Play track or resume playback
     * @param {Track|string} track - Track to play or track identifier
     */
    play(track: Track | string): Promise<void>;
    /**
     * Pause playback
     */
    pause(): void;
    /**
     * Stop playback
     */
    stop(): void;
    /**
     * Seek to position
     * @param {number} time - Time in seconds
     */
    seek(time: number): void;
    /**
     * Set volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume: number): void;
    /**
     * Add track(s) to queue
     * @param {Track|Track[]|string|string[]} tracks - Track(s) to add
     */
    add(tracks: Track | Track[] | string | string[]): void;
    /**
     * Remove track from queue
     * @param {number|string} identifier - Track index or ID
     */
    remove(identifier: number | string): import("../index.js").Track;
    /**
     * Skip to next track
     */
    next(): void;
    /**
     * Go to previous track
     */
    previous(): void;
    /**
     * Shuffle queue
     */
    shuffle(): void;
    /**
     * Clear queue
     */
    clear(): void;
    /**
     * Jump to track in queue
     * @param {number} index - Track index
     */
    jump(index: number): void;
    /**
     * Apply audio filter
     * @param {string} type - Filter type
     * @param {Object} options - Filter options
     */
    applyFilter(type: string, options: any): void;
    /**
     * Remove audio filter
     * @param {string} type - Filter type
     */
    removeFilter(type: string): void;
    /**
     * Set loop mode
     * @param {string} mode - Loop mode
     */
    setLoopMode(mode: string): void;
    /**
     * Get current state
     * @returns {Object} Engine state
     */
    getState(): any;
    /**
     * Destroy the engine
     */
    destroy(): void;
}
import { Player } from './Player.js';
import { Filters } from './Filters.js';
import { Queue } from '../queue/Queue.js';
import { EventBus } from '../events/EventBus.js';
