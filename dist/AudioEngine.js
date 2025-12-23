import { Player } from './engine/Player';
import { Filters } from './engine/Filters';
import { Queue } from './queue/Queue';
import { Track } from './queue/Track';
import { EventBus } from './events/EventBus';
import { ProviderRegistry } from './providers/ProviderRegistry';
import { LocalProvider } from './providers/LocalProvider';
import { YouTubeProvider } from './providers/YouTubeProvider';
import { SpotifyProvider } from './providers/SpotifyProvider';
import { LavalinkProvider } from './providers/LavalinkProvider';
import { PluginManager } from './plugins/PluginManager';
import { EVENTS } from './constants';
/**
 * Main audio engine class
 */
export class AudioEngine {
    constructor(options = {}) {
        this.options = options;
        this.queue = new Queue();
        this.eventBus = new EventBus();
        this.providers = new ProviderRegistry();
        this.isReady = false;
        this.player = new Player(this);
        // @ts-ignore - Accessing private audioContext from player for filters
        this.filters = new Filters(this.player.audioContext);
        this.plugins = new PluginManager(this);
        this.initialize();
    }
    /**
     * Initialize the audio engine
     */
    async initialize() {
        try {
            // Connect event buses
            this.queue.eventBus.on(EVENTS.TRACK_ADD, (track) => this.eventBus.emit(EVENTS.TRACK_ADD, track));
            this.queue.eventBus.on(EVENTS.TRACK_REMOVE, (track) => this.eventBus.emit(EVENTS.TRACK_REMOVE, track));
            this.queue.eventBus.on(EVENTS.QUEUE_UPDATE, (tracks) => {
                this.eventBus.emit(EVENTS.QUEUE_UPDATE, tracks);
                this.plugins.callHook('queueUpdate', this.queue);
            });
            this.player.eventBus.on(EVENTS.PLAY, (data) => this.eventBus.emit(EVENTS.PLAY, data));
            this.player.eventBus.on(EVENTS.PAUSE, () => this.eventBus.emit(EVENTS.PAUSE));
            this.player.eventBus.on(EVENTS.STOP, () => this.eventBus.emit(EVENTS.STOP));
            this.player.eventBus.on(EVENTS.ERROR, (error) => this.eventBus.emit(EVENTS.ERROR, error));
            this.player.eventBus.on(EVENTS.TRACK_START, (track) => {
                this.eventBus.emit(EVENTS.TRACK_START, track);
                this.plugins.callHook('afterPlay', track); // afterPlay usually means playback started
            });
            this.player.eventBus.on(EVENTS.TRACK_END, (track) => {
                this.eventBus.emit(EVENTS.TRACK_END, track);
                this.plugins.callHook('trackEnd', track);
            });
            // Register default providers
            await this.registerProvider(new LocalProvider());
            await this.registerProvider(new YouTubeProvider());
            if (this.options.spotify) {
                await this.registerProvider(new SpotifyProvider(this.options.spotify));
            }
            if (this.options.lavalink) {
                await this.registerProvider(new LavalinkProvider(this.options.lavalink));
            }
            this.isReady = true;
            this.eventBus.emit(EVENTS.READY);
        }
        catch (error) {
            this.eventBus.emit(EVENTS.ERROR, error);
        }
    }
    async registerProvider(provider) {
        await provider.initialize(this);
        this.providers.register(provider);
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    /**
     * Play track or resume playback
     * @param track - Track to play or track identifier
     */
    async play(track) {
        if (!this.isReady)
            return;
        if (track) {
            let trackObj = null;
            if (typeof track === 'string') {
                trackObj = new Track(track);
                this.queue.add(trackObj);
            }
            else {
                trackObj = track;
            }
            this.plugins.callHook('beforePlay', trackObj);
            await this.player.play(trackObj);
        }
        else {
            this.player.resume();
        }
    }
    /**
     * Pause playback
     */
    pause() {
        this.player.pause();
    }
    /**
     * Stop playback
     */
    stop() {
        this.player.stop();
    }
    /**
     * Seek to position
     * @param time - Time in seconds
     */
    seek(time) {
        this.player.seek(time);
    }
    /**
     * Set volume
     * @param volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.player.setVolume(volume);
    }
    /**
     * Add track(s) to queue
     * @param tracks - Track(s) to add
     */
    add(tracks) {
        this.queue.add(tracks);
    }
    /**
     * Remove track from queue
     * @param identifier - Track index or ID
     */
    remove(identifier) {
        return this.queue.remove(identifier);
    }
    /**
     * Skip to next track
     */
    next() {
        const nextTrack = this.queue.next(false);
        if (nextTrack) {
            this.play(nextTrack);
        }
        else {
            this.stop();
        }
    }
    /**
     * Go to previous track
     */
    previous() {
        const prevTrack = this.queue.previous(false);
        if (prevTrack) {
            this.play(prevTrack);
        }
    }
    /**
     * Shuffle queue
     */
    shuffle() {
        this.queue.shuffle();
    }
    /**
     * Clear queue
     */
    clear() {
        this.queue.clear();
    }
    /**
     * Jump to track in queue
     * @param index - Track index
     */
    jump(index) {
        const track = this.queue.jump(index);
        if (track) {
            this.play(track);
        }
    }
    /**
     * Apply audio filter
     * @param type - Filter type
     * @param options - Filter options
     */
    applyFilter(type, options) {
        this.filters.apply(type, options);
        this.eventBus.emit(EVENTS.FILTER_APPLIED, { type, options });
    }
    /**
     * Remove audio filter
     * @param type - Filter type
     */
    removeFilter(type) {
        this.filters.remove(type);
    }
    /**
     * Set loop mode
     * @param mode - Loop mode
     */
    setLoopMode(mode) {
        this.player.setLoopMode(mode);
    }
    /**
     * Get current state
     * @returns Engine state
     */
    getState() {
        return {
            isReady: this.isReady,
            ...this.player.getState(),
            currentTrack: this.queue.getCurrent(),
            queue: this.queue.getTracks(),
            filters: this.filters.getEnabled()
        };
    }
    /**
     * Destroy the engine
     */
    destroy() {
        this.filters.clear();
        this.player.stop();
        this.providers.getAll().forEach(p => p.destroy());
        this.plugins.getAll().forEach(p => p.onUnload());
        // @ts-ignore
        if (this.player.audioContext && this.player.audioContext.state !== 'closed') {
            // @ts-ignore
            this.player.audioContext.close();
        }
    }
}
