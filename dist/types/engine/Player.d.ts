import { LoopMode } from '../constants';
import { EventBus } from '../events/EventBus';
import { ITrack } from '../interfaces';
import { AudioEngine } from '../AudioEngine';
/**
 * Audio player with playback controls
 */
export declare class Player {
    private audioEngine;
    audioContext: AudioContext;
    private source;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    loopMode: LoopMode;
    eventBus: EventBus;
    constructor(audioEngine: AudioEngine);
    /**
     * Play audio track
     * @param track - Track to play
     */
    play(track: ITrack): Promise<void>;
    /**
     * Play audio from URL/Stream directly
     * This is called by Providers or as fallback
     * @param track - Track object with URL
     */
    playStream(track: ITrack): Promise<void>;
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
     * @param time - Time in seconds
     */
    seek(time: number): void;
    /**
     * Set volume
     * @param volume - Volume level (0-1)
     */
    setVolume(volume: number): void;
    /**
     * Set loop mode
     * @param mode - Loop mode
     */
    setLoopMode(mode: LoopMode): void;
    /**
     * Handle track end based on loop mode
     */
    private handleTrackEnd;
    /**
     * Get current playback state
     * @returns State object
     */
    getState(): any;
}
