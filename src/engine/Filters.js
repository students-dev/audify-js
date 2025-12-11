import { FILTER_TYPES } from '../constants/Modes.js';

/**
 * Audio filters and effects
 */
export class Filters {
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
    const pitch = options.pitch || 1;
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