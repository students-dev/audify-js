import { AudioEngine } from '../src/index';

// Mock AudioContext
(global as any).AudioContext = class {
  createGain() { return { connect: () => {}, gain: { value: 0 } }; }
  createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 }, gain: { value: 0 } }; }
  createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, onended: null }; }
  decodeAudioData() { return Promise.resolve({ duration: 0 }); }
  createPanner() { return { connect: () => {} }; }
  createConvolver() { return { connect: () => {} }; }
  suspend() {}
  resume() {}
  close() {}
  get state() { return 'suspended'; }
};

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = new AudioEngine();
  });

  test('should initialize', () => {
    expect(engine).toBeInstanceOf(AudioEngine);
  });

  test('should have queue', () => {
    expect(engine.queue).toBeDefined();
  });

  test('should have filters', () => {
    expect(engine.filters).toBeDefined();
  });
});
