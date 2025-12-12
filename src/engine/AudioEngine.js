import { Player } from './Player.js';
import { Filters } from './Filters.js';
import { Queue } from '../queue/Queue.js';
import { Track } from '../queue/Track.js';
import { EventBus } from '../events/EventBus.js';
import { SpotifyProvider } from '../providers/SpotifyProvider.js';
import { LavalinkProvider } from '../providers/LavalinkProvider.js';
import { EVENTS, LOOP_MODES } from '../constants/Modes.js';

/**
 * Main audio engine class
 */
export class AudioEngine {
  constructor(options = {}) {
    this.options = options;
    this.audioContext = null;
    this.player = null;
    this.filters = null;
    this.queue = new Queue();
    this.eventBus = new EventBus();
    this.spotifyProvider = null;
    this.lavalinkProvider = null;
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
   * Initialize Spotify provider
   * @param {Object} options - Spotify options
   */
  initSpotify(options = {}) {
    this.spotifyProvider = new SpotifyProvider(options);
  }

  /**
   * Load Spotify track and add to queue
   * @param {string} trackId - Spotify track ID
   * @param {Object} options - Options including token
   * @returns {Promise<Track>} Added track
   */
  async loadSpotifyTrack(trackId, options = {}) {
    if (!this.spotifyProvider) {
      throw new Error('Spotify provider not initialized');
    }

    if (options.token) {
      this.spotifyProvider.setAccessToken(options.token);
    }

    const trackData = await this.spotifyProvider.getTrack(trackId);
    const track = new Track(trackData.url, trackData);
    this.add(track);
    return track;
  }

  /**
   * Search Spotify tracks
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchSpotifyTracks(query, options = {}) {
    if (!this.spotifyProvider) {
      throw new Error('Spotify provider not initialized');
    }

    if (options.token) {
      this.spotifyProvider.setAccessToken(options.token);
    }

    return await this.spotifyProvider.searchTracks(query, options);
  }

  /**
   * Connect to Lavalink server
   * @param {Object} options - Lavalink connection options
   * @returns {Promise<void>}
   */
  async connectLavalink(options = {}) {
    this.lavalinkProvider = new LavalinkProvider(options);
    await this.lavalinkProvider.connect();
  }

  /**
   * Load Lavalink track and add to queue
   * @param {string} identifier - Track identifier
   * @returns {Promise<Track|Array<Track>>} Added track(s)
   */
  async loadLavalinkTrack(identifier) {
    if (!this.lavalinkProvider) {
      throw new Error('Lavalink provider not connected');
    }

    const trackData = await this.lavalinkProvider.loadTrack(identifier);

    if (Array.isArray(trackData)) {
      const tracks = trackData.map(data => new Track(data.url, data));
      this.add(tracks);
      return tracks;
    } else {
      const track = new Track(trackData.url, trackData);
      this.add(track);
      return track;
    }
  }

  /**
   * Get Lavalink player for guild/channel
   * @param {string} guildId - Guild ID
   * @param {string} channelId - Voice channel ID
   * @returns {Object} Lavalink player
   */
  getLavalinkPlayer(guildId, channelId) {
    if (!this.lavalinkProvider) {
      throw new Error('Lavalink provider not connected');
    }

    return this.lavalinkProvider.createPlayer(guildId, channelId);
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
    if (this.lavalinkProvider) {
      this.lavalinkProvider.disconnect();
    }
  }
}