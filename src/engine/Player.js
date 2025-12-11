import { LOOP_MODES, EVENTS } from '../constants/Modes.js';
import { EventBus } from '../events/EventBus.js';

/**
 * Audio player with playback controls
 */
export class Player {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.audioContext = audioEngine.audioContext;
    this.source = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.loopMode = LOOP_MODES.OFF;
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
      case LOOP_MODES.TRACK:
        // Replay current track
        break;
      case LOOP_MODES.QUEUE:
        // Play next in queue
        this.audioEngine.queue.getNext();
        break;
      case LOOP_MODES.OFF:
      default:
        // Stop or play next
        break;
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