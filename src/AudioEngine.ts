import { AudioContext } from 'web-audio-api';
import { FilterManager, FilterType, FilterOptions } from './FilterManager';

export type LoopMode = 'off' | 'track' | 'queue';
export type RepeatMode = 'off' | 'track' | 'queue';

export class AudioEngine {
  private audioContext: AudioContext | globalThis.AudioContext;
  private gainNode: GainNode;
  private filterManager: FilterManager;
  private source: AudioBufferSourceNode | MediaElementAudioSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private isPlaying: boolean = false;
  private loopMode: LoopMode = 'off';
  private repeatMode: RepeatMode = 'off';
  private onEndCallback?: () => void;

  constructor() {
    // Cross-environment AudioContext
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new window.AudioContext();
    } else {
      this.audioContext = new AudioContext();
    }

    this.filterManager = new FilterManager(this.audioContext);
    this.gainNode = this.audioContext.createGain();
    this.filterManager.outputNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
  }

  async loadAudio(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  play(buffer?: AudioBuffer): void {
    if (buffer) {
      this.currentBuffer = buffer;
    }
    if (!this.currentBuffer) return;

    this.stop();
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.currentBuffer;
    this.source.connect(this.filterManager.inputNode);

    this.source.onended = () => {
      this.isPlaying = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    const offset = this.pausedAt;
    this.startTime = this.audioContext.currentTime - offset;
    this.source.start(0, offset);
    this.isPlaying = true;
  }

  pause(): void {
    if (this.isPlaying) {
      this.pausedAt = this.audioContext.currentTime - this.startTime;
      this.audioContext.suspend();
      this.isPlaying = false;
    }
  }

  resume(): void {
    if (!this.isPlaying && this.currentBuffer) {
      this.audioContext.resume();
      this.isPlaying = true;
    }
  }

  stop(): void {
    if (this.source) {
      this.source.stop();
      this.source = null;
    }
    this.isPlaying = false;
    this.pausedAt = 0;
    this.startTime = 0;
  }

  seek(time: number): void {
    this.pausedAt = Math.max(0, Math.min(time, this.duration));
    if (this.isPlaying) {
      this.play();
    }
  }

  setLoopMode(mode: LoopMode): void {
    this.loopMode = mode;
  }

  setRepeatMode(mode: RepeatMode): void {
    this.repeatMode = mode;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  applyFilter(type: FilterType, options?: any): void {
    this.filterManager.applyFilter(type, options);
  }

  removeFilter(type: FilterType): void {
    this.filterManager.removeFilter(type);
  }

  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  get currentTime(): number {
    if (this.isPlaying) {
      return this.audioContext.currentTime - this.startTime;
    }
    return this.pausedAt;
  }

  get duration(): number {
    return this.currentBuffer?.duration || 0;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  destroy(): void {
    this.stop();
    this.audioContext.close();
  }
}