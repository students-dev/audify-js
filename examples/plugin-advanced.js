import { AudioEngine, Plugin } from '../dist/esm/index.js';

// 1. Define a custom plugin
class LoggerPlugin extends Plugin {
  constructor() {
    super('logger', '1.0.0');
  }

  onLoad(engine) {
    console.log('[Logger] Plugin loaded successfully');
  }

  onEnable() {
    console.log('[Logger] Enabled');
    super.onEnable();
  }

  beforePlay(track) {
    console.log(`[Logger] Preparing to play: ${track.title}`);
  }

  afterPlay(track) {
    console.log(`[Logger] Playback started for: ${track.title}`);
  }

  trackEnd(track) {
    console.log(`[Logger] Track finished: ${track.title}`);
  }
}

// 2. Initialize Engine
const engine = new AudioEngine();

// 3. Register Plugin
const logger = new LoggerPlugin();
engine.plugins.load(logger);
engine.plugins.enable('logger');

engine.eventBus.on('ready', () => {
  console.log('Engine ready. Playing demo track...');
  engine.add('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
  engine.play();
});

// Clean up
engine.eventBus.on('trackEnd', () => {
    setTimeout(() => {
        engine.destroy();
        process.exit(0);
    }, 100);
});
