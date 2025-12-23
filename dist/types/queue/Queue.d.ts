import { Track } from './Track';
import { EventBus } from '../events/EventBus';
import { ITrack } from '../interfaces';
/**
 * Audio queue management
 */
export declare class Queue {
    private tracks;
    private currentIndex;
    eventBus: EventBus;
    constructor();
    /**
     * Add track(s) to queue
     * @param tracks - Track(s) to add
     * @param position - Position to insert (optional)
     */
    add(tracks: Track | ITrack | (Track | ITrack)[] | string | string[], position?: number): void;
    /**
     * Remove track from queue
     * @param identifier - Track index or ID
     * @returns Removed track
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
     * @param index - Track index
     * @returns Track at index
     */
    jump(index: number): Track | null;
    /**
     * Get current track
     * @returns Current track
     */
    getCurrent(): Track | null;
    /**
     * Get next track
     * Moves cursor forward
     * @param loop - Whether to loop back to start
     * @returns Next track
     */
    next(loop?: boolean): Track | null;
    /**
     * Get previous track
     * Moves cursor backward
     * @param loop - Whether to loop to end
     * @returns Previous track
     */
    previous(loop?: boolean): Track | null;
    /**
     * Get all tracks
     * @returns Array of tracks
     */
    getTracks(): Track[];
    /**
     * Get queue size
     * @returns Number of tracks
     */
    size(): number;
    /**
     * Check if queue is empty
     * @returns Is empty
     */
    isEmpty(): boolean;
    /**
     * Get track at index
     * @param index - Track index
     * @returns Track at index
     */
    getTrack(index: number): Track | null;
}
