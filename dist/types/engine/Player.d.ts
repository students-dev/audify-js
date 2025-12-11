/**
 * Audio player with playback controls
 */
export class Player {
    constructor(audioEngine: any);
    audioEngine: any;
    audioContext: any;
    source: any;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    loopMode: string;
    eventBus: EventBus;
    /**
     * Play audio
     * @param {Track} track - Track to play
     */
    play(track: Track): Promise<void>;
    /**
     * Pause playback
     */
    pause(): void;
    /**
     * Resume playback
     */
    resume(): void;
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
     * Set loop mode
     * @param {string} mode - Loop mode
     */
    setLoopMode(mode: string): void;
    /**
     * Load track into player
     * @param {Track} track - Track to load
     */
    loadTrack(track: Track): Promise<void>;
    /**
     * Handle track end based on loop mode
     */
    handleTrackEnd(): void;
    /**
     * Get current playback state
     * @returns {Object} State object
     */
    getState(): any;
}
import { EventBus } from '../events/EventBus.js';
