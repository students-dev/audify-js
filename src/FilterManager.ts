export type FilterType = 'bassboost' | 'trebleboost' | 'nightcore' | 'vaporwave' | '8d' | 'pitch' | 'speed' | 'reverb';

export interface FilterOptions {
  bassboost?: { gain: number };
  trebleboost?: { gain: number };
  nightcore?: { speed: number; pitch: number };
  vaporwave?: { speed: number; pitch: number };
  '8d'?: { frequency: number };
  pitch?: { value: number };
  speed?: { value: number };
  reverb?: { preset: 'small' | 'medium' | 'large' };
}

export class FilterManager {
  private audioContext: AudioContext | globalThis.AudioContext;
  private input: GainNode;
  private output: GainNode;
  private filters: Map<FilterType, AudioNode[]> = new Map();

  constructor(audioContext: AudioContext | globalThis.AudioContext) {
    this.audioContext = audioContext;
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.input.connect(this.output);
  }

  applyFilter(type: FilterType, options?: any): void {
    this.removeFilter(type);
    const nodes = this.createFilterNodes(type, options);
    if (nodes.length > 0) {
      this.input.disconnect();
      this.input.connect(nodes[0]);
      for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].connect(nodes[i + 1]);
      }
      nodes[nodes.length - 1].connect(this.output);
      this.filters.set(type, nodes);
    }
  }

  removeFilter(type: FilterType): void {
    const nodes = this.filters.get(type);
    if (nodes) {
      nodes.forEach(node => node.disconnect());
      this.filters.delete(type);
      this.reconnectChain();
    }
  }

  private createFilterNodes(type: FilterType, options?: any): AudioNode[] {
    switch (type) {
      case 'bassboost':
        return this.createBassBoost(options?.gain || 5);
      case 'trebleboost':
        return this.createTrebleBoost(options?.gain || 5);
      case 'nightcore':
        return this.createNightcore(options?.speed || 1.25, options?.pitch || 1.3);
      case 'vaporwave':
        return this.createVaporwave(options?.speed || 0.8, options?.pitch || 0.8);
      case '8d':
        return this.create8D(options?.frequency || 0.2);
      case 'pitch':
        return this.createPitch(options?.value || 1);
      case 'speed':
        return this.createSpeed(options?.value || 1);
      case 'reverb':
        return this.createReverb(options?.preset || 'medium');
      default:
        return [];
    }
  }

  private createBassBoost(gain: number): AudioNode[] {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowshelf';
    filter.frequency.value = 200;
    filter.gain.value = gain;
    return [filter];
  }

  private createTrebleBoost(gain: number): AudioNode[] {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highshelf';
    filter.frequency.value = 3000;
    filter.gain.value = gain;
    return [filter];
  }

  private createNightcore(speed: number, pitch: number): AudioNode[] {
    // Nightcore: high speed, high pitch
    return this.createPitchAndSpeed(pitch, speed);
  }

  private createVaporwave(speed: number, pitch: number): AudioNode[] {
    // Vaporwave: low speed, low pitch
    return this.createPitchAndSpeed(pitch, speed);
  }

  private create8D(frequency: number): AudioNode[] {
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    // Rotate effect
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.value = 1;
    oscillator.connect(gain);
    gain.connect(panner.positionX);
    oscillator.start();
    return [panner];
  }

  private createPitch(value: number): AudioNode[] {
    // Pitch shift using AudioWorklet or approximation
    // For simplicity, use a basic filter approximation
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'allpass';
    filter.frequency.value = 1000 * value;
    return [filter];
  }

  private createSpeed(value: number): AudioNode[] {
    // Speed change affects playback rate, but for filters, perhaps use delay
    // Actually, speed is better handled at source level
    return [];
  }

  private createReverb(preset: string): AudioNode[] {
    const convolver = this.audioContext.createConvolver();
    // Load impulse response based on preset
    // For simplicity, create a basic reverb
    const length = preset === 'small' ? 0.5 : preset === 'medium' ? 1 : 2;
    const impulse = this.audioContext.createBuffer(2, length * this.audioContext.sampleRate, this.audioContext.sampleRate);
    // Generate simple impulse
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, 2);
      }
    }
    convolver.buffer = impulse;
    return [convolver];
  }

  private createPitchAndSpeed(pitch: number, speed: number): AudioNode[] {
    // Combine pitch and speed
    const nodes: AudioNode[] = [];
    if (pitch !== 1) {
      nodes.push(...this.createPitch(pitch));
    }
    // Speed is handled separately
    return nodes;
  }

  private reconnectChain(): void {
    this.input.disconnect();
    let currentNode: AudioNode = this.input;
    for (const [type, nodes] of this.filters) {
      currentNode.connect(nodes[0]);
      currentNode = nodes[nodes.length - 1];
    }
    currentNode.connect(this.output);
  }

  get inputNode(): AudioNode {
    return this.input;
  }

  get outputNode(): AudioNode {
    return this.output;
  }
}