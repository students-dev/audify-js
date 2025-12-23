import { FILTER_TYPES, FilterType } from '../constants';

/**
 * Audio filters and effects
 */
export class Filters {
  private audioContext: AudioContext;
  private filters: Map<FilterType, AudioNode>;
  private enabled: Set<FilterType>;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.filters = new Map();
    this.enabled = new Set();
  }

  /**
   * Apply filter
   * @param type - Filter type
   * @param options - Filter options
   */
  apply(type: FilterType, options: any = {}): void {
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
   * @param type - Filter type
   */
  remove(type: FilterType): void {
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
  clear(): void {
    this.filters.forEach(filter => filter.disconnect());
    this.filters.clear();
    this.enabled.clear();
  }

  /**
   * Check if filter is enabled
   * @param type - Filter type
   * @returns Is enabled
   */
  isEnabled(type: FilterType): boolean {
    return this.enabled.has(type);
  }

  /**
   * Get enabled filters
   * @returns Enabled filter types
   */
  getEnabled(): Set<FilterType> {
    return new Set(this.enabled);
  }

  // Filter implementations
  private applyBassBoost(options: any = {}): void {
    const gain = options.gain || 1.5;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowshelf';
    filter.frequency.value = 200;
    filter.gain.value = gain * 10;
    this.filters.set(FILTER_TYPES.BASSBOOST, filter);
  }

  private applyNightcore(options: any = {}): void {
    const rate = options.rate || 1.2;
    // Nightcore is pitch + speed up
    this.applyPitch({ pitch: rate });
    this.applySpeed({ speed: rate });
  }

  private applyVaporwave(options: any = {}): void {
    const rate = options.rate || 0.8;
    this.applyPitch({ pitch: rate });
    this.applySpeed({ speed: rate });
  }

  private apply8DRotate(options: any = {}): void {
    // 8D audio effect using panner
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    // Would need to animate the position for rotation
    this.filters.set(FILTER_TYPES.ROTATE_8D, panner);
  }

  private applyPitch(options: any = {}): void {
    const pitch = options.pitch || 1;
    // In Web Audio API, pitch shifting requires AudioWorklet or external library
    // For simplicity, we'll use a basic implementation or just log it
    // console.warn('Pitch shifting requires AudioWorklet in modern browsers');
  }

  private applySpeed(options: any = {}): void {
    const speed = options.speed || 1;
    // Speed change affects playback rate
    // This would be handled in the player
    // console.log(`Speed filter applied: ${speed}x`);
  }

  private applyReverb(options: any = {}): void {
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
  connect(input: AudioNode, output: AudioNode): void {
    let currentNode = input;

    this.filters.forEach(filter => {
      currentNode.connect(filter);
      currentNode = filter;
    });

    currentNode.connect(output);
  }
}
