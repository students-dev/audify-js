/**
 * Base plugin class
 */
export class Plugin {
    constructor(name: any, version?: string);
    name: any;
    version: string;
    enabled: boolean;
    loaded: boolean;
    /**
     * Called when plugin is loaded
     * @param {AudioEngine} engine - Audio engine instance
     */
    onLoad(engine: AudioEngine): void;
    engine: AudioEngine;
    /**
     * Called when plugin is enabled
     */
    onEnable(): void;
    /**
     * Called when plugin is disabled
     */
    onDisable(): void;
    /**
     * Hook called before play
     * @param {Track} track - Track being played
     */
    beforePlay(track: Track): void;
    /**
     * Hook called after play
     * @param {Track} track - Track being played
     */
    afterPlay(track: Track): void;
    /**
     * Hook called when track ends
     * @param {Track} track - Track that ended
     */
    trackEnd(track: Track): void;
    /**
     * Hook called when queue updates
     * @param {Queue} queue - Updated queue
     */
    queueUpdate(queue: Queue): void;
    /**
     * Get plugin info
     * @returns {Object} Plugin information
     */
    getInfo(): any;
}
