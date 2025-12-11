import { AudioEngine } from '../src/index.js';

describe('AudioEngine', () => {
  let engine;

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