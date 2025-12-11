'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Loop modes for playback
 */
const LOOP_MODES$1 = {
  OFF: 'off',
  TRACK: 'track',
  QUEUE: 'queue'
};

/**
 * Repeat modes (alias for loop modes)
 */
const REPEAT_MODES = LOOP_MODES$1;

/**
 * Filter types
 */
const FILTER_TYPES = {
  BASSBOOST: 'bassboost',
  TREBLEBOOST: 'trebleboost',
  NIGHTCORE: 'nightcore',
  VAPORWAVE: 'vaporwave',
  ROTATE_8D: '8d',
  PITCH: 'pitch',
  SPEED: 'speed',
  REVERB: 'reverb'
};

/**
 * Event types
 */
const EVENTS = {
  READY: 'ready',
  PLAY: 'play',
  PAUSE: 'pause',
  STOP: 'stop',
  ERROR: 'error',
  QUEUE_EMPTY: 'queueEmpty',
  TRACK_START: 'trackStart',
  TRACK_END: 'trackEnd',
  FILTER_APPLIED: 'filterApplied',
  TRACK_ADD: 'trackAdd',
  TRACK_REMOVE: 'trackRemove',
  SHUFFLE: 'shuffle',
  CLEAR: 'clear'
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
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    delete this.events[event];
  }

  /**
   * Get all listeners for an event
   * @param {string} event - Event name
   * @returns {Function[]} Array of listeners
   */
  listeners(event) {
    return this.events[event] || [];
  }
}

/**
 * Audio player with playback controls
 */
class Player {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.audioContext = audioEngine.audioContext;
    this.source = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.loopMode = LOOP_MODES$1.OFF;
    this.eventBus = new EventBus();
  }

  /**
   * Play audio
   * @param {Track} track - Track to play
   */
  async play(track) {
    if (!track) return;

    try {
      await this.loadTrack(track);
      this.source.start(0);
      this.isPlaying = true;
      this.eventBus.emit(EVENTS.PLAY, track);
      this.eventBus.emit(EVENTS.TRACK_START, track);
    } catch (error) {
      this.eventBus.emit(EVENTS.ERROR, error);
    }
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.source && this.isPlaying) {
      this.source.stop();
      this.isPlaying = false;
      this.eventBus.emit(EVENTS.PAUSE);
    }
  }

  /**
   * Resume playback
   */
  resume() {
    if (!this.isPlaying && this.source) {
      // Would need to recreate source for resume
      this.eventBus.emit(EVENTS.PLAY);
    }
  }

  /**
   * Stop playback
   */
  stop() {
    if (this.source) {
      this.source.stop();
      this.source = null;
      this.isPlaying = false;
      this.currentTime = 0;
      this.eventBus.emit(EVENTS.STOP);
    }
  }

  /**
   * Seek to position
   * @param {number} time - Time in seconds
   */
  seek(time) {
    // In Web Audio API, seeking requires buffer manipulation
    this.currentTime = Math.max(0, Math.min(time, this.duration));
  }

  /**
   * Set volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    // Apply to gain node if exists
  }

  /**
   * Set loop mode
   * @param {string} mode - Loop mode
   */
  setLoopMode(mode) {
    this.loopMode = mode;
  }

  /**
   * Load track into player
   * @param {Track} track - Track to load
   */
  async loadTrack(track) {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const response = await fetch(track.url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

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
  }

  /**
   * Handle track end based on loop mode
   */
  handleTrackEnd() {
    switch (this.loopMode) {
      case LOOP_MODES$1.TRACK:
        // Replay current track
        break;
      case LOOP_MODES$1.QUEUE:
        // Play next in queue
        this.audioEngine.queue.getNext();
        break;
      case LOOP_MODES$1.OFF:
    }
  }

  /**
   * Get current playback state
   * @returns {Object} State object
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
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
   * @param {string} type - Filter type
   * @param {Object} options - Filter options
   */
  apply(type, options = {}) {
    if (!this.audioContext) return;

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
   * @param {string} type - Filter type
   */
  remove(type) {
    if (this.filters.has(type)) {
      const filter = this.filters.get(type);
      filter.disconnect();
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
   * @param {string} type - Filter type
   * @returns {boolean} Is enabled
   */
  isEnabled(type) {
    return this.enabled.has(type);
  }

  /**
   * Get enabled filters
   * @returns {Set} Enabled filter types
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
    // For simplicity, we'll use a basic implementation
    console.warn('Pitch shifting requires AudioWorklet in modern browsers');
  }

  applySpeed(options = {}) {
    const speed = options.speed || 1;
    // Speed change affects playback rate
    // This would be handled in the player
    console.log(`Speed filter applied: ${speed}x`);
  }

  applyReverb(options = {}) {
    const convolver = this.audioContext.createConvolver();
    // Would need an impulse response for reverb
    // For simplicity, create a basic reverb
    this.filters.set(FILTER_TYPES.REVERB, convolver);
  }

  /**
   * Connect filters to audio node
   * @param {AudioNode} input - Input node
   * @param {AudioNode} output - Output node
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
   * @param {string} source - URL or file path
   * @returns {Object} Metadata object
   */
  static extract(source) {
    if (!source) return {};

    const metadata = {
      title: this.extractTitle(source),
      artist: null,
      duration: null,
      thumbnail: null
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
   * @param {string} source - Source string
   * @returns {string} Extracted title
   */
  static extractTitle(source) {
    if (!source) return 'Unknown Track';

    // Try to extract from URL query params
    try {
      const url = new URL(source);
      const title = url.searchParams.get('title') || url.searchParams.get('name');
      if (title) return decodeURIComponent(title);
    } catch {}

    // Extract from file path
    const parts = source.split('/').pop().split('\\').pop();
    if (parts) {
      return parts.replace(/\.[^/.]+$/, ''); // Remove extension
    }

    return 'Unknown Track';
  }

  /**
   * Extract YouTube metadata (basic)
   * @param {string} url - YouTube URL
   * @returns {Object} Metadata
   */
  static extractYouTubeMetadata(url) {
    // Basic extraction, in real implementation would fetch from API
    return {
      title: 'YouTube Track',
      artist: null,
      duration: null,
      thumbnail: null,
      source: 'youtube'
    };
  }

  /**
   * Extract SoundCloud metadata (basic)
   * @param {string} url - SoundCloud URL
   * @returns {Object} Metadata
   */
  static extractSoundCloudMetadata(url) {
    // Basic extraction
    return {
      title: 'SoundCloud Track',
      artist: null,
      duration: null,
      thumbnail: null,
      source: 'soundcloud'
    };
  }

  /**
   * Extract file metadata (basic)
   * @param {string} path - File path
   * @returns {Object} Metadata
   */
  static extractFileMetadata(path) {
    const title = this.extractTitle(path);
    return {
      title,
      artist: null,
      duration: null,
      thumbnail: null,
      source: 'local'
    };
  }
}

/**
 * Represents an audio track
 */
class Track {
  /**
   * @param {string} url - Track URL or file path
   * @param {Object} options - Additional options
   */
  constructor(url, options = {}) {
    this.url = url;
    this.title = options.title || MetadataUtils.extract(url).title;
    this.artist = options.artist || null;
    this.duration = options.duration || null;
    this.thumbnail = options.thumbnail || null;
    this.metadata = options.metadata || {};
    this.id = options.id || Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get track info
   * @returns {Object} Track information
   */
  getInfo() {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      artist: this.artist,
      duration: this.duration,
      thumbnail: this.thumbnail,
      metadata: this.metadata
    };
  }

  /**
   * Update track metadata
   * @param {Object} metadata - New metadata
   */
  updateMetadata(metadata) {
    Object.assign(this.metadata, metadata);
  }

  /**
   * Check if track is valid
   * @returns {boolean} Is valid
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

/**
 * Main audio engine class
 */
class AudioEngine {
  constructor(options = {}) {
    this.options = options;
    this.audioContext = null;
    this.player = null;
    this.filters = null;
    this.queue = new Queue();
    this.eventBus = new EventBus();
    this.isReady = false;

    this.initialize();
  }

  /**
   * Initialize the audio engine
   */
  async initialize() {
    try {
      // Create AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create components
      this.filters = new Filters(this.audioContext);
      this.player = new Player(this);

      // Connect event buses
      this.queue.eventBus.on(EVENTS.TRACK_ADD, (track) => this.eventBus.emit(EVENTS.TRACK_ADD, track));
      this.queue.eventBus.on(EVENTS.TRACK_REMOVE, (track) => this.eventBus.emit(EVENTS.TRACK_REMOVE, track));
      this.player.eventBus.on(EVENTS.PLAY, (data) => this.eventBus.emit(EVENTS.PLAY, data));
      this.player.eventBus.on(EVENTS.PAUSE, () => this.eventBus.emit(EVENTS.PAUSE));
      this.player.eventBus.on(EVENTS.STOP, () => this.eventBus.emit(EVENTS.STOP));
      this.player.eventBus.on(EVENTS.ERROR, (error) => this.eventBus.emit(EVENTS.ERROR, error));
      this.player.eventBus.on(EVENTS.TRACK_START, (track) => this.eventBus.emit(EVENTS.TRACK_START, track));
      this.player.eventBus.on(EVENTS.TRACK_END, (track) => this.eventBus.emit(EVENTS.TRACK_END, track));

      this.isReady = true;
      this.eventBus.emit(EVENTS.READY);
    } catch (error) {
      this.eventBus.emit(EVENTS.ERROR, error);
    }
  }

  /**
   * Play track or resume playback
   * @param {Track|string} track - Track to play or track identifier
   */
  async play(track) {
    if (!this.isReady) return;

    if (track) {
      const trackObj = typeof track === 'string' ? this.queue.getCurrent() : track;
      await this.player.play(trackObj);
    } else {
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
   * @param {number} time - Time in seconds
   */
  seek(time) {
    this.player.seek(time);
  }

  /**
   * Set volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.player.setVolume(volume);
  }

  /**
   * Add track(s) to queue
   * @param {Track|Track[]|string|string[]} tracks - Track(s) to add
   */
  add(tracks) {
    this.queue.add(tracks);
  }

  /**
   * Remove track from queue
   * @param {number|string} identifier - Track index or ID
   */
  remove(identifier) {
    return this.queue.remove(identifier);
  }

  /**
   * Skip to next track
   */
  next() {
    const nextTrack = this.queue.getNext();
    if (nextTrack) {
      this.play(nextTrack);
    }
  }

  /**
   * Go to previous track
   */
  previous() {
    const prevTrack = this.queue.getPrevious();
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
   * @param {number} index - Track index
   */
  jump(index) {
    const track = this.queue.jump(index);
    if (track) {
      this.play(track);
    }
  }

  /**
   * Apply audio filter
   * @param {string} type - Filter type
   * @param {Object} options - Filter options
   */
  applyFilter(type, options) {
    this.filters.apply(type, options);
    this.eventBus.emit(EVENTS.FILTER_APPLIED, { type, options });
  }

  /**
   * Remove audio filter
   * @param {string} type - Filter type
   */
  removeFilter(type) {
    this.filters.remove(type);
  }

  /**
   * Set loop mode
   * @param {string} mode - Loop mode
   */
  setLoopMode(mode) {
    this.player.setLoopMode(mode);
  }

  /**
   * Get current state
   * @returns {Object} Engine state
   */
  getState() {
    return {
      isReady: this.isReady,
      isPlaying: this.player ? this.player.isPlaying : false,
      currentTrack: this.queue.getCurrent(),
      queue: this.queue.getTracks(),
      volume: this.player ? this.player.volume : 1,
      loopMode: this.player ? this.player.loopMode : LOOP_MODES.OFF,
      filters: this.filters ? this.filters.getEnabled() : new Set()
    };
  }

  /**
   * Destroy the engine
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.filters.clear();
    this.player.stop();
  }
}

/**
 * Base plugin class
 */
class Plugin {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
    this.enabled = false;
    this.loaded = false;
  }

  /**
   * Called when plugin is loaded
   * @param {AudioEngine} engine - Audio engine instance
   */
  onLoad(engine) {
    this.engine = engine;
    this.loaded = true;
  }

  /**
   * Called when plugin is enabled
   */
  onEnable() {
    this.enabled = true;
  }

  /**
   * Called when plugin is disabled
   */
  onDisable() {
    this.enabled = false;
  }

  /**
   * Hook called before play
   * @param {Track} track - Track being played
   */
  beforePlay(track) {
    // Override in subclass
  }

  /**
   * Hook called after play
   * @param {Track} track - Track being played
   */
  afterPlay(track) {
    // Override in subclass
  }

  /**
   * Hook called when track ends
   * @param {Track} track - Track that ended
   */
  trackEnd(track) {
    // Override in subclass
  }

  /**
   * Hook called when queue updates
   * @param {Queue} queue - Updated queue
   */
  queueUpdate(queue) {
    // Override in subclass
  }

  /**
   * Get plugin info
   * @returns {Object} Plugin information
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      enabled: this.enabled,
      loaded: this.loaded
    };
  }
}

/**
 * Plugin manager for loading and managing plugins
 */
class PluginManager {
  constructor(audioEngine) {
    this.engine = audioEngine;
    this.plugins = new Map();
  }

  /**
   * Load a plugin
   * @param {Plugin} plugin - Plugin instance
   */
  load(plugin) {
    if (!(plugin instanceof Plugin)) {
      throw new Error('Invalid plugin instance');
    }

    plugin.onLoad(this.engine);
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Enable a plugin
   * @param {string} name - Plugin name
   */
  enable(name) {
    const plugin = this.plugins.get(name);
    if (plugin && !plugin.enabled) {
      plugin.onEnable();
    }
  }

  /**
   * Disable a plugin
   * @param {string} name - Plugin name
   */
  disable(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.enabled) {
      plugin.onDisable();
    }
  }

  /**
   * Unload a plugin
   * @param {string} name - Plugin name
   */
  unload(name) {
    const plugin = this.plugins.get(name);
    if (plugin) {
      if (plugin.enabled) {
        plugin.onDisable();
      }
      this.plugins.delete(name);
    }
  }

  /**
   * Get plugin by name
   * @param {string} name - Plugin name
   * @returns {Plugin|null} Plugin instance
   */
  get(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * Get all plugins
   * @returns {Map} Map of plugins
   */
  getAll() {
    return new Map(this.plugins);
  }

  /**
   * Get enabled plugins
   * @returns {Plugin[]} Array of enabled plugins
   */
  getEnabled() {
    return Array.from(this.plugins.values()).filter(plugin => plugin.enabled);
  }

  /**
   * Call hook on all enabled plugins
   * @param {string} hook - Hook name
   * @param {...*} args - Arguments to pass
   */
  callHook(hook, ...args) {
    this.getEnabled().forEach(plugin => {
      if (typeof plugin[hook] === 'function') {
        try {
          plugin[hook](...args);
        } catch (error) {
          console.error(`Error in plugin ${plugin.name} hook ${hook}:`, error);
        }
      }
    });
  }
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
    this.currentLevel = this.levels[level] || this.levels.info;
  }

  /**
   * Set log level
   * @param {string} level - Log level (debug, info, warn, error)
   */
  setLevel(level) {
    this.currentLevel = this.levels[level] || this.levels.info;
  }

  /**
   * Debug log
   * @param {...*} args - Arguments to log
   */
  debug(...args) {
    if (this.currentLevel <= this.levels.debug) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Info log
   * @param {...*} args - Arguments to log
   */
  info(...args) {
    if (this.currentLevel <= this.levels.info) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Warning log
   * @param {...*} args - Arguments to log
   */
  warn(...args) {
    if (this.currentLevel <= this.levels.warn) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Error log
   * @param {...*} args - Arguments to log
   */
  error(...args) {
    if (this.currentLevel <= this.levels.error) {
      console.error('[ERROR]', ...args);
    }
  }
}

// Default logger instance
new Logger();

/**
 * Time formatting utilities
 */
class TimeUtils {
  /**
   * Format seconds to MM:SS or HH:MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  static format(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';

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
   * @param {string} timeStr - Time string like "1:23" or "01:23:45"
   * @returns {number} Time in seconds
   */
  static parse(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;

    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }

  /**
   * Get current timestamp in milliseconds
   * @returns {number} Current time
   */
  static now() {
    return Date.now();
  }

  /**
   * Calculate duration between two timestamps
   * @param {number} start - Start time
   * @param {number} end - End time
   * @returns {number} Duration in milliseconds
   */
  static duration(start, end) {
    return end - start;
  }
}

/**
 * Audio probing utilities
 */
class ProbeUtils {
  /**
   * Probe audio file/stream for basic info
   * @param {string|Buffer|ReadableStream} source - Audio source
   * @returns {Promise<Object>} Probe result
   */
  static async probe(source) {
    // In a real implementation, this would use ffprobe or similar
    // For now, return basic mock data
    return {
      duration: null, // seconds
      format: null, // e.g., 'mp3', 'wav'
      bitrate: null, // kbps
      sampleRate: null, // Hz
      channels: null // 1 or 2
    };
  }

  /**
   * Check if source is a valid audio URL
   * @param {string} url - URL to check
   * @returns {boolean} Is valid audio URL
   */
  static isValidAudioUrl(url) {
    if (!url || typeof url !== 'string') return false;

    try {
      const parsed = new URL(url);
      const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
      const path = parsed.pathname.toLowerCase();

      return audioExtensions.some(ext => path.endsWith(ext)) ||
             url.includes('youtube.com') ||
             url.includes('youtu.be') ||
             url.includes('soundcloud.com');
    } catch {
      return false;
    }
  }

  /**
   * Get audio format from URL or buffer
   * @param {string|Buffer} source - Audio source
   * @returns {string|null} Audio format
   */
  static getFormat(source) {
    if (typeof source === 'string') {
      const extensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
      for (const ext of extensions) {
        if (source.toLowerCase().includes(`.${ext}`)) {
          return ext;
        }
      }
    }
    // For buffer, would need to check headers
    return null;
  }
}

/**
 * YouTube provider for basic info fetching
 */
class YouTubeProvider {
  /**
   * Check if URL is a valid YouTube URL
   * @param {string} url - URL to check
   * @returns {boolean} Is valid YouTube URL
   */
  static isValidUrl(url) {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID
   */
  static extractVideoId(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      return urlObj.searchParams.get('v');
    } catch {
      return null;
    }
  }

  /**
   * Get basic track info from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} Track info
   */
  static async getInfo(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // In a real implementation, this would call YouTube API
    // For now, return mock data
    return {
      title: `YouTube Video ${videoId}`,
      artist: null,
      duration: null,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      url: url,
      source: 'youtube',
      videoId: videoId
    };
  }

  /**
   * Get stream URL (not implemented without dependencies)
   * @param {string} url - YouTube URL
   * @returns {Promise<string>} Stream URL
   */
  static async getStreamUrl(url) {
    // Would require ytdl-core or similar
    throw new Error('Stream URL extraction requires additional dependencies');
  }
}

/**
 * SoundCloud provider for basic info fetching
 */
class SoundCloudProvider {
  /**
   * Check if URL is a valid SoundCloud URL
   * @param {string} url - URL to check
   * @returns {boolean} Is valid SoundCloud URL
   */
  static isValidUrl(url) {
    return url.includes('soundcloud.com/');
  }

  /**
   * Get basic track info from SoundCloud URL
   * @param {string} url - SoundCloud URL
   * @returns {Promise<Object>} Track info
   */
  static async getInfo(url) {
    // In a real implementation, this would call SoundCloud API
    // For now, return mock data
    return {
      title: 'SoundCloud Track',
      artist: null,
      duration: null,
      thumbnail: null,
      url: url,
      source: 'soundcloud'
    };
  }

  /**
   * Get stream URL (not implemented without dependencies)
   * @param {string} url - SoundCloud URL
   * @returns {Promise<string>} Stream URL
   */
  static async getStreamUrl(url) {
    // Would require soundcloud-scraper or similar
    throw new Error('Stream URL extraction requires additional dependencies');
  }
}

/**
 * Local file provider for Node.js
 */
class LocalProvider {
  /**
   * Check if path is a valid local audio file
   * @param {string} path - File path
   * @returns {boolean} Is valid audio file
   */
  static isValidPath(path$1) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
    return audioExtensions.includes(path.extname(path$1).toLowerCase());
  }

  /**
   * Get track info from local file
   * @param {string} path - File path
   * @returns {Promise<Object>} Track info
   */
  static async getInfo(path$1) {
    try {
      const stats = await fs.promises.stat(path$1);
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }

      return {
        title: path$1.split('/').pop().replace(path.extname(path$1), ''),
        artist: null,
        duration: null, // Would need audio parsing library
        thumbnail: null,
        url: `file://${path$1}`,
        source: 'local',
        size: stats.size,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @param {string} path - File path
   * @returns {Promise<boolean>} File exists
   */
  static async exists(path) {
    try {
      await fs.promises.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

exports.AudioEngine = AudioEngine;
exports.EVENTS = EVENTS;
exports.EventBus = EventBus;
exports.FILTER_TYPES = FILTER_TYPES;
exports.LOOP_MODES = LOOP_MODES$1;
exports.LocalProvider = LocalProvider;
exports.Logger = Logger;
exports.MetadataUtils = MetadataUtils;
exports.PluginManager = PluginManager;
exports.ProbeUtils = ProbeUtils;
exports.Queue = Queue;
exports.REPEAT_MODES = REPEAT_MODES;
exports.SoundCloudProvider = SoundCloudProvider;
exports.TimeUtils = TimeUtils;
exports.Track = Track;
exports.YouTubeProvider = YouTubeProvider;
//# sourceMappingURL=index.js.map
