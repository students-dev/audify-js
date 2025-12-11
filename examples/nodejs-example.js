import { AudioEngine } from '@students-dev/audify-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const engine = new AudioEngine();

// Wait for engine to be ready
engine.on('ready', () => {
  console.log('🎵 Audio engine is ready!');

  // Add tracks to the queue
  engine.add([
    join(process.cwd(), 'examples', 'sample-audio.mp3'), // Local file
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Remote URL
  ]);

  console.log(`📋 Queue size: ${engine.queue.size()}`);

  // Start playing
  engine.play();
});

// Handle track events
engine.on('trackStart', (track) => {
  console.log(`▶️  Now playing: ${track.title}`);
});

engine.on('trackEnd', (track) => {
  console.log(`⏹️  Finished: ${track.title}`);
});

// Handle playback events
engine.on('play', () => {
  console.log('🎵 Playback started');
});

engine.on('pause', () => {
  console.log('⏸️  Playback paused');
});

engine.on('stop', () => {
  console.log('⏹️  Playback stopped');
});

// Handle errors
engine.on('error', (error) => {
  console.error('❌ Audio error:', error.message);
});

// Handle queue events
engine.on('trackAdd', (track) => {
  console.log(`➕ Track added: ${track.title}`);
});

// Demo: Apply filters after 2 seconds
setTimeout(() => {
  console.log('🎛️  Applying bass boost filter...');
  engine.applyFilter('bassboost', { gain: 1.5 });
}, 2000);

// Demo: Skip to next track after 5 seconds
setTimeout(() => {
  console.log('⏭️  Skipping to next track...');
  engine.next();
}, 5000);

// Demo: Shuffle queue after 8 seconds
setTimeout(() => {
  console.log('🔀 Shuffling queue...');
  engine.shuffle();
}, 8000);

// Demo: Show queue state after 10 seconds
setTimeout(() => {
  const state = engine.getState();
  console.log('📊 Current state:', {
    isPlaying: state.isPlaying,
    currentTrack: state.currentTrack?.title,
    queueSize: state.queue.length,
    volume: state.volume,
    loopMode: state.loopMode
  });
}, 10000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  engine.destroy();
  process.exit(0);
});