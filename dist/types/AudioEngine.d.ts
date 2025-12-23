import { Player } from './engine/Player';
import { Filters } from './engine/Filters';
import { Queue } from './queue/Queue';
import { EventBus } from './events/EventBus';
import { ProviderRegistry } from './providers/ProviderRegistry';
import { PluginManager } from './plugins/PluginManager';
import { LoopMode } from './constants';
import { IAudioEngine, IProvider, ITrack } from './interfaces';
/**
 * Main audio engine class
 */
export declare class AudioEngine implements IAudioEngine {
    options: any;
    player: Player;
    filters: Filters;
    queue: Queue;
    eventBus: EventBus;
    providers: ProviderRegistry;
    plugins: PluginManager;
    isReady: boolean;
    constructor(options?: any);
    /**
     * Initialize the audio engine
     */
    initialize(): Promise<void>;
    registerProvider(provider: IProvider): Promise<void>;
    getProvider(name: string): IProvider | undefined;
    /**
     * Play track or resume playback
     * @param track - Track to play or track identifier
     */
    play(track?: ITrack | string): Promise<void>;
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
     * @param time - Time in seconds
     */
    seek(time: number): void;
    /**
     * Set volume
     * @param volume - Volume level (0-1)
     */
    setVolume(volume: number): void;
    /**
     * Add track(s) to queue
     * @param tracks - Track(s) to add
     */
    add(tracks: ITrack | ITrack[] | string | string[]): void;
    /**
     * Remove track from queue
     * @param identifier - Track index or ID
     */
    remove(identifier: number | string): ITrack | null;
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
     * @param index - Track index
     */
    jump(index: number): void;
    /**
     * Apply audio filter
     * @param type - Filter type
     * @param options - Filter options
     */
    applyFilter(type: any, options: any): void;
    /**
     * Remove audio filter
     * @param type - Filter type
     */
    removeFilter(type: any): void;
    /**
     * Set loop mode
     * @param mode - Loop mode
     */
    setLoopMode(mode: LoopMode): void;
    /**
     * Get current state
     * @returns Engine state
     */
    getState(): any;
    /**
     * Destroy the engine
     */
    destroy(): void;
}
