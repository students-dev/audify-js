import { AudioEngine } from '../dist/esm/index.js'; // Use local build
import { join } from 'path';

const engine = new AudioEngine();

// Wait for engine to be ready
engine.eventBus.on('ready', () => {
  console.log('🎵 Audio engine is ready!');

  // Add tracks to the queue
  engine.add([
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Remote URL
  ]);

  console.log(`📋 Queue size: ${engine.queue.size()}`);

  // Start playing
  engine.play();
});

// Handle track events
engine.eventBus.on('trackStart', (track) => {
  console.log(`▶️  Now playing: ${track.title}`);
});

engine.eventBus.on('trackEnd', (track) => {
  console.log(`⏹️  Finished: ${track.title}`);
  process.exit(0);
});

// Handle errors
engine.eventBus.on('error', (error) => {
  console.error('❌ Audio error:', error.message || error);
});
