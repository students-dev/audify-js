'use strict';

var fs = require('fs');
var path = require('path');
var SpotifyWebApi = require('spotify-web-api-node');
var lavalinkClient = require('lavalink-client');

const EVENTS = {
    READY: 'ready',
    ERROR: 'error',
    PLAY: 'play',
    PAUSE: 'pause',
    STOP: 'stop',
    TRACK_START: 'trackStart',
    TRACK_END: 'trackEnd',
    TRACK_ADD: 'trackAdd',
    TRACK_REMOVE: 'trackRemove',
    QUEUE_UPDATE: 'queueUpdate',
    FILTER_APPLIED: 'filterApplied',
    VOLUME_CHANGE: 'volumeChange',
    SEEK: 'seek'
};
const LOOP_MODES = {
    OFF: 'off',
    TRACK: 'track',
    QUEUE: 'queue'
};
const PLAYER_STATES = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    BUFFERING: 'buffering'
};
const FILTER_TYPES = {
    BASSBOOST: 'bassboost',
    NIGHTCORE: 'nightcore',
    VAPORWAVE: 'vaporwave',
    ROTATE_8D: '8d',
    PITCH: 'pitch',
    SPEED: 'speed',
    REVERB: 'reverb'
};

/**
 * Simple event emitter for handling events
 */
class EventBus {
    constructor() {
        this.events = {};
    }
    /**
     * Register an event listener
     * @param event - Event name
     * @param callback - Callback function
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    /**
     * Remove an event listener
     * @param event - Event name
     * @param callback - Callback function
     */
    off(event, callback) {
        if (!this.events[event])
            return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    /**
     * Emit an event
     * @param event - Event name
     * @param data - Data to pass to listeners
     */
    emit(event, data) {
        if (!this.events[event])
            return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
    /**
     * Remove all listeners for an event
     * @param event - Event name
     */
    removeAllListeners(event) {
        delete this.events[event];
    }
    /**
     * Get all listeners for an event
     * @param event - Event name
     * @returns Array of listeners
     */
    listeners(event) {
        return this.events[event] || [];
    }
}

class MockAudioContext {
    constructor() {
        this.state = 'running';
        this.currentTime = 0;
        this.startTime = Date.now();
        this.updateTime();
    }
    updateTime() {
        if (this.state === 'running') {
            const diff = (Date.now() - this.startTime) / 1000;
            this.currentTime = diff;
        }
        // Simulate clock
        if (typeof setTimeout !== 'undefined') {
            setTimeout(() => this.updateTime(), 100);
        }
    }
    createGain() { return { connect: () => { }, gain: { value: 0 } }; }
    createBiquadFilter() { return { connect: () => { }, frequency: { value: 0 }, gain: { value: 0 } }; }
    createPanner() { return { connect: () => { } }; }
    createConvolver() { return { connect: () => { } }; }
    createBufferSource() {
        return new MockAudioBufferSource(this);
    }
    async decodeAudioData(buffer) {
        return { duration: 5 }; // Mock 5 seconds duration
    }
    suspend() { this.state = 'suspended'; }
    resume() { this.state = 'running'; this.startTime = Date.now() - (this.currentTime * 1000); }
    close() { this.state = 'closed'; }
}
class MockAudioBufferSource {
    constructor(context) {
        this.buffer = null;
        this.onended = null;
        this.context = context;
    }
    connect() { }
    start(when = 0, offset = 0) {
        // Simulate playback duration
        const duration = this.buffer ? this.buffer.duration : 0;
        setTimeout(() => {
            if (this.onended)
                this.onended();
        }, duration * 1000); // Speed up for tests? No, keep real time or fast? 
        // 5 seconds mock duration might be too long for quick examples.
        // Let's make it 1 second for examples unless buffer says otherwise.
    }
    stop() {
        if (this.onended)
            this.onended();
    }
}

/**
 * Audio player with playback controls
 */
class Player {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        let AudioContextClass;
        if (typeof window !== 'undefined') {
            AudioContextClass = window.AudioContext || window.webkitAudioContext;
        }
        else {
            AudioContextClass = global.AudioContext;
        }
        if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
        }
        else {
            this.audioContext = new MockAudioContext();
        }
        this.source = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 1;
        this.loopMode = LOOP_MODES.OFF;
        this.eventBus = new EventBus();
    }
    /**
     * Play audio track
     * @param track - Track to play
     */
    async play(track) {
        if (!track)
            return;
        // Reset state
        this.stop();
        try {
            this.eventBus.emit(EVENTS.PLAY, track);
            // Check providers via registry
            const provider = this.audioEngine.getProvider(track.source || 'local');
            if (provider) {
                await provider.play(track);
            }
            else {
                // Fallback to direct URL playback if no specific provider found
                await this.playStream(track);
            }
            this.eventBus.emit(EVENTS.TRACK_START, track);
        }
        catch (error) {
            console.error(error);
            this.eventBus.emit(EVENTS.ERROR, error);
        }
    }
    /**
     * Play audio from URL/Stream directly
     * This is called by Providers or as fallback
     * @param track - Track object with URL
     */
    async playStream(track) {
        if (!this.audioContext)
            throw new Error('AudioContext not available');
        // If already playing, stop
        if (this.source) {
            this.source.stop();
        }
        try {
            // Fetch audio data
            // For Node.js (Mock), we might fail to fetch if it's a real URL
            // If MockAudioContext is used, we probably want to skip fetch?
            // Or Mock fetch? 
            // In Node environment, fetch is global in recent versions (v18+)
            // But if we are mocking, we can't really "decode" the buffer from a remote stream easily without logic.
            // My MockAudioContext.decodeAudioData returns a mock buffer.
            let audioBuffer;
            // Check if real fetch is feasible
            if (this.audioContext instanceof MockAudioContext) {
                // Mock fetch behavior if needed or just create dummy buffer
                audioBuffer = await this.audioContext.decodeAudioData(new ArrayBuffer(0));
            }
            else {
                const response = await fetch(track.url);
                const arrayBuffer = await response.arrayBuffer();
                audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            }
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = audioBuffer;
            this.duration = audioBuffer.duration;
            // Connect through filters
            this.audioEngine.filters.connect(this.source, this.audioContext.destination);
            // Handle end of track
            this.source.onended = () => {
                this.isPlaying = false;
                this.eventBus.emit(EVENTS.TRACK_END, track);
                this.handleTrackEnd();
            };
            this.source.start(0);
            this.isPlaying = true;
        }
        catch (error) {
            throw new Error(`Failed to play stream: ${error}`);
        }
    }
    /**
     * Pause playback
     */
    pause() {
        if (this.audioContext.state === 'running') {
            this.audioContext.suspend();
            this.isPlaying = false;
            this.eventBus.emit(EVENTS.PAUSE);
        }
    }
    /**
     * Resume playback
     */
    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            this.isPlaying = true;
            this.eventBus.emit(EVENTS.PLAY);
        }
    }
    /**
     * Stop playback
     */
    stop() {
        if (this.source) {
            try {
                this.source.stop();
            }
            catch (e) {
                // Ignore if already stopped
            }
            this.source = null;
        }
        this.isPlaying = false;
        this.currentTime = 0;
        this.eventBus.emit(EVENTS.STOP);
    }
    /**
     * Seek to position
     * @param time - Time in seconds
     */
    seek(time) {
        if (this.source && this.isPlaying) {
            // TODO: Implement proper seek
            console.warn('Seek not fully implemented for Web Audio BufferSource');
        }
        this.currentTime = Math.max(0, Math.min(time, this.duration));
    }
    /**
     * Set volume
     * @param volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    /**
     * Set loop mode
     * @param mode - Loop mode
     */
    setLoopMode(mode) {
        this.loopMode = mode;
    }
    /**
     * Handle track end based on loop mode
     */
    handleTrackEnd() {
        if (this.loopMode === LOOP_MODES.TRACK) {
            // Replay current track
            const current = this.audioEngine.queue.getCurrent();
            if (current)
                this.play(current);
        }
        else if (this.loopMode === LOOP_MODES.QUEUE) {
            // Play next in queue
            const next = this.audioEngine.queue.next(true);
            if (next)
                this.play(next);
        }
        else {
            // Loop OFF: Play next or stop
            const next = this.audioEngine.queue.next(false);
            if (next) {
                this.play(next);
            }
            else {
                this.stop();
            }
        }
    }
    /**
     * Get current playback state
     * @returns State object
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.audioContext.currentTime,
            duration: this.duration,
            volume: this.volume,
            loopMode: this.loopMode
        };
    }
}

/**
 * Audio filters and effects
 */
class Filters {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.filters = new Map();
        this.enabled = new Set();
    }
    /**
     * Apply filter
     * @param type - Filter type
     * @param options - Filter options
     */
    apply(type, options = {}) {
        if (!this.audioContext)
            return;
        switch (type) {
            case FILTER_TYPES.BASSBOOST:
                this.applyBassBoost(options);
                break;
            case FILTER_TYPES.NIGHTCORE:
                this.applyNightcore(options);
                break;
            case FILTER_TYPES.VAPORWAVE:
                this.applyVaporwave(options);
                break;
            case FILTER_TYPES.ROTATE_8D:
                this.apply8DRotate(options);
                break;
            case FILTER_TYPES.PITCH:
                this.applyPitch(options);
                break;
            case FILTER_TYPES.SPEED:
                this.applySpeed(options);
                break;
            case FILTER_TYPES.REVERB:
                this.applyReverb(options);
                break;
        }
        this.enabled.add(type);
    }
    /**
     * Remove filter
     * @param type - Filter type
     */
    remove(type) {
        if (this.filters.has(type)) {
            const filter = this.filters.get(type);
            filter?.disconnect();
            this.filters.delete(type);
            this.enabled.delete(type);
        }
    }
    /**
     * Clear all filters
     */
    clear() {
        this.filters.forEach(filter => filter.disconnect());
        this.filters.clear();
        this.enabled.clear();
    }
    /**
     * Check if filter is enabled
     * @param type - Filter type
     * @returns Is enabled
     */
    isEnabled(type) {
        return this.enabled.has(type);
    }
    /**
     * Get enabled filters
     * @returns Enabled filter types
     */
    getEnabled() {
        return new Set(this.enabled);
    }
    // Filter implementations
    applyBassBoost(options = {}) {
        const gain = options.gain || 1.5;
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = 200;
        filter.gain.value = gain * 10;
        this.filters.set(FILTER_TYPES.BASSBOOST, filter);
    }
    applyNightcore(options = {}) {
        const rate = options.rate || 1.2;
        // Nightcore is pitch + speed up
        this.applyPitch({ pitch: rate });
        this.applySpeed({ speed: rate });
    }
    applyVaporwave(options = {}) {
        const rate = options.rate || 0.8;
        this.applyPitch({ pitch: rate });
        this.applySpeed({ speed: rate });
    }
    apply8DRotate(options = {}) {
        // 8D audio effect using panner
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        // Would need to animate the position for rotation
        this.filters.set(FILTER_TYPES.ROTATE_8D, panner);
    }
    applyPitch(options = {}) {
        options.pitch || 1;
        // In Web Audio API, pitch shifting requires AudioWorklet or external library
        // For simplicity, we'll use a basic implementation or just log it
        // console.warn('Pitch shifting requires AudioWorklet in modern browsers');
    }
    applySpeed(options = {}) {
        options.speed || 1;
        // Speed change affects playback rate
        // This would be handled in the player
        // console.log(`Speed filter applied: ${speed}x`);
    }
    applyReverb(options = {}) {
        const convolver = this.audioContext.createConvolver();
        // Would need an impulse response for reverb
        // For simplicity, create a basic reverb
        this.filters.set(FILTER_TYPES.REVERB, convolver);
    }
    /**
     * Connect filters to audio node
     * @param input - Input node
     * @param output - Output node
     */
    connect(input, output) {
        let currentNode = input;
        this.filters.forEach(filter => {
            currentNode.connect(filter);
            currentNode = filter;
        });
        currentNode.connect(output);
    }
}

/**
 * Metadata parsing utilities
 */
class MetadataUtils {
    /**
     * Extract basic metadata from URL or file path
     * @param source - URL or file path
     * @returns Metadata object
     */
    static extract(source) {
        if (!source)
            return {};
        const metadata = {
            title: this.extractTitle(source),
            artist: undefined,
            duration: undefined,
            thumbnail: undefined
        };
        // For YouTube URLs
        if (source.includes('youtube.com') || source.includes('youtu.be')) {
            return this.extractYouTubeMetadata(source);
        }
        // For SoundCloud URLs
        if (source.includes('soundcloud.com')) {
            return this.extractSoundCloudMetadata(source);
        }
        // For local files
        if (!source.startsWith('http')) {
            return this.extractFileMetadata(source);
        }
        return metadata;
    }
    /**
     * Extract title from source
     * @param source - Source string
     * @returns Extracted title
     */
    static extractTitle(source) {
        if (!source)
            return 'Unknown Track';
        // Try to extract from URL query params
        try {
            const url = new URL(source);
            const title = url.searchParams.get('title') || url.searchParams.get('name');
            if (title)
                return decodeURIComponent(title);
        }
        catch { } // eslint-disable-line no-empty
        // Extract from file path
        const parts = source.split('/').pop()?.split('\\').pop();
        if (parts) {
            return parts.replace(/\.[^/.]+$/, ''); // Remove extension
        }
        return 'Unknown Track';
    }
    /**
     * Extract YouTube metadata (basic)
     * @param url - YouTube URL
     * @returns Metadata
     */
    static extractYouTubeMetadata(url) {
        return {
            title: 'YouTube Track',
            source: 'youtube'
        };
    }
    /**
     * Extract SoundCloud metadata (basic)
     * @param url - SoundCloud URL
     * @returns Metadata
     */
    static extractSoundCloudMetadata(url) {
        return {
            title: 'SoundCloud Track',
            source: 'soundcloud'
        };
    }
    /**
     * Extract file metadata (basic)
     * @param path - File path
     * @returns Metadata
     */
    static extractFileMetadata(path) {
        const title = this.extractTitle(path);
        return {
            title,
            source: 'local'
        };
    }
}

/**
 * Represents an audio track
 */
class Track {
    /**
     * @param url - Track URL or file path
     * @param options - Additional options
     */
    constructor(url, options = {}) {
        const extracted = MetadataUtils.extract(url);
        this.url = url;
        this.title = options.title || extracted.title || 'Unknown Title';
        this.artist = options.artist || extracted.artist;
        this.duration = options.duration || extracted.duration;
        this.thumbnail = options.thumbnail || extracted.thumbnail;
        this.source = options.source || extracted.source || 'unknown';
        this.metadata = options.metadata || {};
        this.id = options.id || Math.random().toString(36).substr(2, 9);
    }
    /**
     * Get track info
     * @returns Track information
     */
    getInfo() {
        return {
            id: this.id,
            url: this.url,
            title: this.title,
            artist: this.artist,
            duration: this.duration,
            thumbnail: this.thumbnail,
            source: this.source,
            metadata: this.metadata
        };
    }
    /**
     * Update track metadata
     * @param metadata - New metadata
     */
    updateMetadata(metadata) {
        Object.assign(this, metadata);
        if (metadata.metadata) {
            Object.assign(this.metadata, metadata.metadata);
        }
    }
    /**
     * Check if track is valid
     * @returns Is valid
     */
    isValid() {
        return !!(this.url && this.title);
    }
}

/**
 * Audio queue management
 */
class Queue {
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
    add(tracks, position) {
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
        }
        else {
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
    remove(identifier) {
        let index;
        if (typeof identifier === 'number') {
            index = identifier;
        }
        else {
            index = this.tracks.findIndex(track => track.id === identifier);
        }
        if (index < 0 || index >= this.tracks.length)
            return null;
        const removed = this.tracks.splice(index, 1)[0];
        if (this.currentIndex > index) {
            this.currentIndex--;
        }
        else if (this.currentIndex === index) {
            this.currentIndex = -1;
        }
        this.eventBus.emit(EVENTS.TRACK_REMOVE, removed);
        this.eventBus.emit(EVENTS.QUEUE_UPDATE, this.tracks);
        return removed;
    }
    /**
     * Shuffle the queue
     */
    shuffle() {
        if (this.tracks.length <= 1)
            return;
        let currentTrack = null;
        if (this.currentIndex >= 0) {
            currentTrack = this.tracks[this.currentIndex];
        }
        for (let i = this.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
        if (currentTrack) {
            this.currentIndex = this.tracks.indexOf(currentTrack);
        }
        else {
            this.currentIndex = -1;
        }
        this.eventBus.emit(EVENTS.QUEUE_UPDATE, this.tracks);
    }
    /**
     * Clear the queue
     */
    clear() {
        this.tracks = [];
        this.currentIndex = -1;
        this.eventBus.emit(EVENTS.QUEUE_UPDATE, this.tracks);
    }
    /**
     * Jump to specific track
     * @param index - Track index
     * @returns Track at index
     */
    jump(index) {
        if (index < 0 || index >= this.tracks.length)
            return null;
        this.currentIndex = index;
        return this.tracks[index];
    }
    /**
     * Get current track
     * @returns Current track
     */
    getCurrent() {
        return this.currentIndex >= 0 ? this.tracks[this.currentIndex] : null;
    }
    /**
     * Get next track
     * Moves cursor forward
     * @param loop - Whether to loop back to start
     * @returns Next track
     */
    next(loop = false) {
        if (this.tracks.length === 0)
            return null;
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.tracks.length) {
            if (loop) {
                nextIndex = 0;
            }
            else {
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
    previous(loop = false) {
        if (this.tracks.length === 0)
            return null;
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            if (loop) {
                prevIndex = this.tracks.length - 1;
            }
            else {
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
    getTracks() {
        return [...this.tracks];
    }
    /**
     * Get queue size
     * @returns Number of tracks
     */
    size() {
        return this.tracks.length;
    }
    /**
     * Check if queue is empty
     * @returns Is empty
     */
    isEmpty() {
        return this.tracks.length === 0;
    }
    /**
     * Get track at index
     * @param index - Track index
     * @returns Track at index
     */
    getTrack(index) {
        return index >= 0 && index < this.tracks.length ? this.tracks[index] : null;
    }
}

class ProviderRegistry {
    constructor() {
        this.providers = new Map();
    }
    register(provider) {
        this.providers.set(provider.name, provider);
    }
    unregister(name) {
        this.providers.delete(name);
    }
    get(name) {
        return this.providers.get(name);
    }
    getAll() {
        return Array.from(this.providers.values());
    }
    has(name) {
        return this.providers.has(name);
    }
}

class LocalProvider {
    constructor() {
        this.name = 'local';
        this.version = '1.0.0';
        this.engine = null;
    }
    async initialize(engine) {
        this.engine = engine;
    }
    async resolve(path$1) {
        if (!await this.exists(path$1)) {
            throw new Error('File not found');
        }
        // Node.js specific checks
        const stats = await fs.promises.stat(path$1);
        if (!stats.isFile()) {
            throw new Error('Path is not a file');
        }
        const track = new Track(`file://${path$1}`, {
            title: path$1.split('/').pop()?.replace(path.extname(path$1), '') || 'Unknown',
            source: 'local',
            metadata: {
                size: stats.size,
                modified: stats.mtime
            }
        });
        return track;
    }
    async play(track) {
        if (!this.engine)
            throw new Error('Provider not initialized');
        // For local files, we assume the player can handle file:// URLs or we might need to read it into a buffer here?
        // The previous Player implementation used fetch(url). fetch supports file:// in some envs but not all.
        // However, given the hybrid nature, we'll assume the engine's player handles the URL.
        // Actually, Player.ts uses fetch(). fetch('file://...') might fail in Node if not polyfilled or configured.
        // But let's stick to the architecture: Provider calls engine.player.load(track).
        // Wait, AudioEngine.ts in JS called `player.play(track)`.
        // So the Provider.play just needs to confirm it CAN play or do setup?
        // If AudioEngine delegates to Provider, then Provider MUST do the work.
        // "AudioEngine calls provider.play(track)" -> Provider must make sound happen.
        // So LocalProvider should call this.engine.player.play(track).
        // BUT checking for infinite loop: Engine calls Provider.play -> Provider calls Engine.player.play?
        // Engine needs to know NOT to call Provider again.
        // Engine.play(track) -> check provider -> provider.play(track)
        // Provider.play(track) -> engine.player.loadSource(track.url) -> source.start()
        // We need to expose `loadSource` or similar on engine/player.
        // For now, I'll assume engine.player has low-level methods.
        // Let's assume the Player has a `playStream(url)` method.
        // I'll type cast engine.player for now.
        await this.engine.player.playStream(track);
    }
    async stop() {
        // Local provider doesn't manage state separate from engine
    }
    destroy() {
        // No cleanup needed
    }
    async exists(path) {
        try {
            await fs.promises.access(path);
            return true;
        }
        catch {
            return false;
        }
    }
}

class YouTubeProvider {
    constructor() {
        this.name = 'youtube';
        this.version = '1.0.0';
        this.engine = null;
    }
    async initialize(engine) {
        this.engine = engine;
    }
    async resolve(query) {
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            const videoId = this.extractVideoId(query);
            if (!videoId)
                throw new Error('Invalid YouTube URL');
            return new Track(query, {
                title: `YouTube Video ${videoId}`,
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                source: 'youtube',
                metadata: { videoId }
            });
        }
        // Search not implemented in this mock
        throw new Error('Search not implemented');
    }
    async play(track) {
        if (!this.engine)
            throw new Error('Provider not initialized');
        // In a real app, resolve stream URL here (e.g. ytdl-core)
        // const streamUrl = await ytdl(track.url);
        // await this.engine.player.playStream(streamUrl);
        throw new Error('Stream URL extraction requires additional dependencies (ytdl-core)');
    }
    async stop() { }
    destroy() { }
    extractVideoId(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }
            return urlObj.searchParams.get('v');
        }
        catch {
            return null;
        }
    }
}

class SpotifyProvider {
    constructor(options = {}) {
        this.name = 'spotify';
        this.version = '1.0.0';
        this.engine = null;
        this.spotifyApi = new SpotifyWebApi({
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            redirectUri: options.redirectUri,
            accessToken: options.accessToken,
            refreshToken: options.refreshToken
        });
    }
    async initialize(engine) {
        this.engine = engine;
    }
    async resolve(query) {
        // Check if query is ID or URL or Search
        if (query.includes('spotify.com/track/')) {
            const id = query.split('track/')[1].split('?')[0];
            const data = await this.spotifyApi.getTrack(id);
            return this._formatTrack(data.body);
        }
        // Default to search
        const data = await this.spotifyApi.searchTracks(query);
        return data.body.tracks?.items.map(t => this._formatTrack(t)) || [];
    }
    async play(track) {
        if (!this.engine)
            throw new Error('Provider not initialized');
        // Spotify playback usually requires Web SDK or resolving to another source
        // Here we can throw or try to resolve if Preview URL is available
        if (track.metadata.preview_url) {
            await this.engine.player.playStream({ ...track, url: track.metadata.preview_url });
        }
        else {
            throw new Error('Spotify full playback not supported in this provider version (preview only)');
        }
    }
    async stop() { }
    destroy() { }
    _formatTrack(spotifyTrack) {
        return new Track(spotifyTrack.external_urls.spotify, {
            id: spotifyTrack.id,
            title: spotifyTrack.name,
            artist: spotifyTrack.artists.map((a) => a.name).join(', '),
            duration: Math.floor(spotifyTrack.duration_ms / 1000),
            thumbnail: spotifyTrack.album.images[0]?.url,
            source: 'spotify',
            metadata: {
                spotifyId: spotifyTrack.id,
                preview_url: spotifyTrack.preview_url,
                popularity: spotifyTrack.popularity
            }
        });
    }
}

class LavalinkProvider {
    constructor(options = {}) {
        this.name = 'lavalink';
        this.version = '1.0.0';
        this.engine = null;
        this.manager = null;
        this.node = null;
        this.options = options;
    }
    async initialize(engine) {
        this.engine = engine;
        this.manager = new lavalinkClient.LavalinkManager({
            nodes: [{
                    host: this.options.host || 'localhost',
                    port: this.options.port || 2333,
                    // @ts-ignore
                    password: this.options.password || 'youshallnotpass',
                    secure: this.options.secure || false,
                    id: 'main'
                }],
            sendToShard: (guildId, payload) => {
                // Mock
            }
        });
        // @ts-ignore
        if (this.manager.connect)
            await this.manager.connect();
        // @ts-ignore
        this.node = this.manager.nodes ? this.manager.nodes.get('main') : this.manager.node;
    }
    async resolve(identifier) {
        if (!this.node)
            throw new Error('Lavalink not connected');
        const result = await this.node.rest.loadTracks(identifier);
        if (result.loadType === 'TRACK_LOADED') {
            return this._formatTrack(result.tracks[0]);
        }
        else if (result.loadType === 'PLAYLIST_LOADED' || result.loadType === 'SEARCH_RESULT') {
            return result.tracks.map((t) => this._formatTrack(t));
        }
        return [];
    }
    async play(track) {
        throw new Error('Lavalink play() requires guild/channel context. Use createPlayer() directly.');
    }
    createPlayer(guildId, channelId) {
        if (!this.manager)
            throw new Error('Not initialized');
        return this.manager.createPlayer({
            guildId,
            voiceChannelId: channelId
        });
    }
    async stop() {
        // Stop all?
    }
    destroy() {
        if (this.manager) {
            // @ts-ignore
            if (this.manager.destroy)
                this.manager.destroy();
        }
    }
    _formatTrack(lavalinkTrack) {
        const info = lavalinkTrack.info;
        return new Track(info.uri, {
            id: lavalinkTrack.track,
            title: info.title,
            artist: info.author,
            duration: Math.floor(info.length / 1000),
            thumbnail: info.artworkUrl,
            source: 'lavalink',
            metadata: {
                lavalinkTrack: lavalinkTrack.track,
                identifier: info.identifier
            }
        });
    }
}

/**
 * Plugin manager for loading and managing plugins
 */
class PluginManager {
    constructor(engine) {
        this.engine = engine;
        this.plugins = new Map();
    }
    /**
     * Load a plugin
     * @param plugin - Plugin instance
     */
    load(plugin) {
        if (!plugin || typeof plugin.onLoad !== 'function') {
            throw new Error('Invalid plugin instance');
        }
        try {
            plugin.onLoad(this.engine);
            this.plugins.set(plugin.name, plugin);
        }
        catch (error) {
            console.error(`Failed to load plugin ${plugin.name}:`, error);
        }
    }
    /**
     * Enable a plugin
     * @param name - Plugin name
     */
    enable(name) {
        const plugin = this.plugins.get(name);
        if (plugin && !plugin.onEnable)
            return; // Should have onEnable from interface
        // Check if we track enabled state in plugin interface?
        // Interface has onEnable methods.
        // Plugin implementations usually track their own state or we assume onEnable does it.
        // Check if plugin object has 'enabled' property (generic check)
        if (plugin && plugin.enabled === false) {
            plugin.onEnable();
        }
    }
    /**
     * Disable a plugin
     * @param name - Plugin name
     */
    disable(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.onDisable();
        }
    }
    /**
     * Unload a plugin
     * @param name - Plugin name
     */
    unload(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.onUnload();
            this.plugins.delete(name);
        }
    }
    /**
     * Get plugin by name
     * @param name - Plugin name
     * @returns Plugin instance
     */
    get(name) {
        return this.plugins.get(name);
    }
    /**
     * Get all plugins
     * @returns Map of plugins
     */
    getAll() {
        return new Map(this.plugins);
    }
    /**
     * Get enabled plugins
     * @returns Array of enabled plugins
     */
    getEnabled() {
        // We assume plugins that are loaded are potential candidates, 
        // but the IPlugin interface doesn't enforce an 'enabled' property reading.
        // However, the Base Plugin class does.
        // We'll filter by checking 'enabled' property if it exists, or assume true?
        // Safer to check property.
        return Array.from(this.plugins.values()).filter(plugin => plugin.enabled === true);
    }
    /**
     * Call hook on all enabled plugins
     * @param hook - Hook name
     * @param args - Arguments to pass
     */
    callHook(hook, ...args) {
        this.getEnabled().forEach(plugin => {
            if (typeof plugin[hook] === 'function') {
                try {
                    plugin[hook](...args);
                }
                catch (error) {
                    console.error(`Error in plugin ${plugin.name} hook ${hook}:`, error);
                }
            }
        });
    }
}

/**
 * Main audio engine class
 */
class AudioEngine {
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

class Plugin {
    constructor(name, version = '1.0.0') {
        this.enabled = false;
        this.loaded = false;
        this.name = name;
        this.version = version;
    }
    onLoad(engine) {
        this.engine = engine;
        this.loaded = true;
    }
    onUnload() {
        this.loaded = false;
        this.engine = undefined;
    }
    onEnable() {
        this.enabled = true;
    }
    onDisable() {
        this.enabled = false;
    }
    // Optional Hooks used by PluginManager.callHook
    beforePlay(track) { }
    afterPlay(track) { }
    trackEnd(track) { }
    queueUpdate(queue) { }
}

/**
 * Logger utility with different levels
 */
class Logger {
    constructor(level = 'info') {
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        this.currentLevel = this.levels[level];
    }
    /**
     * Set log level
     * @param level - Log level (debug, info, warn, error)
     */
    setLevel(level) {
        this.currentLevel = this.levels[level] || this.levels.info;
    }
    /**
     * Debug log
     * @param args - Arguments to log
     */
    debug(...args) {
        if (this.currentLevel <= this.levels.debug) {
            console.debug('[DEBUG]', ...args);
        }
    }
    /**
     * Info log
     * @param args - Arguments to log
     */
    info(...args) {
        if (this.currentLevel <= this.levels.info) {
            console.info('[INFO]', ...args);
        }
    }
    /**
     * Warning log
     * @param args - Arguments to log
     */
    warn(...args) {
        if (this.currentLevel <= this.levels.warn) {
            console.warn('[WARN]', ...args);
        }
    }
    /**
     * Error log
     * @param args - Arguments to log
     */
    error(...args) {
        if (this.currentLevel <= this.levels.error) {
            console.error('[ERROR]', ...args);
        }
    }
}
// Default logger instance
const logger = new Logger();

/**
 * Time formatting utilities
 */
class TimeUtils {
    /**
     * Format seconds to MM:SS or HH:MM:SS
     * @param seconds - Time in seconds
     * @returns Formatted time string
     */
    static format(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0)
            return '00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    /**
     * Parse time string to seconds
     * @param timeStr - Time string like "1:23" or "01:23:45"
     * @returns Time in seconds
     */
    static parse(timeStr) {
        if (!timeStr)
            return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return 0;
    }
    /**
     * Get current timestamp in milliseconds
     * @returns Current time
     */
    static now() {
        return Date.now();
    }
    /**
     * Calculate duration between two timestamps
     * @param start - Start time
     * @param end - End time
     * @returns Duration in milliseconds
     */
    static duration(start, end) {
        return end - start;
    }
}

exports.AudioEngine = AudioEngine;
exports.EVENTS = EVENTS;
exports.EventBus = EventBus;
exports.FILTER_TYPES = FILTER_TYPES;
exports.FilterManager = Filters;
exports.Filters = Filters;
exports.LOOP_MODES = LOOP_MODES;
exports.LavalinkProvider = LavalinkProvider;
exports.LocalProvider = LocalProvider;
exports.Logger = Logger;
exports.MetadataUtils = MetadataUtils;
exports.PLAYER_STATES = PLAYER_STATES;
exports.Plugin = Plugin;
exports.PluginManager = PluginManager;
exports.Queue = Queue;
exports.SpotifyProvider = SpotifyProvider;
exports.TimeUtils = TimeUtils;
exports.Track = Track;
exports.YouTubeProvider = YouTubeProvider;
exports.logger = logger;
//# sourceMappingURL=index.js.map
