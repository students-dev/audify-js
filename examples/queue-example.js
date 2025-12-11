import { AudioEngine } from '@students-dev/audify-js';

const engine = new AudioEngine();

engine.on('ready', () => {
  console.log('🎵 Audio engine ready for queue management demo');

  // Example 1: Adding tracks to queue
  console.log('\n📝 Adding tracks to queue...');

  // Add single track
  engine.add('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
  console.log(`Queue size: ${engine.queue.size()}`);

  // Add multiple tracks
  engine.add([
    'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-02.wav'
  ]);
  console.log(`Queue size after adding multiple: ${engine.queue.size()}`);

  // Add track with metadata
  engine.add({
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
    title: 'Custom Bell Sound',
    artist: 'SoundJay',
    duration: 180
  });
  console.log(`Final queue size: ${engine.queue.size()}`);

  // Example 2: Inspecting the queue
  console.log('\n📋 Current queue:');
  engine.queue.getTracks().forEach((track, index) => {
    console.log(`${index + 1}. ${track.title} (${track.url})`);
  });

  // Example 3: Navigation
  console.log('\n🎵 Starting playback...');
  engine.play();

  setTimeout(() => {
    console.log('⏭️  Skipping to next track...');
    engine.next();
  }, 2000);

  setTimeout(() => {
    console.log('⏮️  Going to previous track...');
    engine.previous();
  }, 4000);

  setTimeout(() => {
    console.log('🔀 Shuffling queue...');
    engine.shuffle();
    console.log('Shuffled queue:');
    engine.queue.getTracks().forEach((track, index) => {
      console.log(`${index + 1}. ${track.title}`);
    });
  }, 6000);

  // Example 4: Jump to specific track
  setTimeout(() => {
    console.log('🎯 Jumping to track #3...');
    engine.jump(2); // 0-based index
  }, 8000);

  // Example 5: Remove tracks
  setTimeout(() => {
    console.log('🗑️  Removing track at index 1...');
    const removed = engine.queue.remove(1);
    if (removed) {
      console.log(`Removed: ${removed.title}`);
    }
    console.log(`Queue size now: ${engine.queue.size()}`);
  }, 10000);

  // Example 6: Clear queue
  setTimeout(() => {
    console.log('🧹 Clearing entire queue...');
    engine.clear();
    console.log(`Queue size: ${engine.queue.size()}`);
  }, 12000);

  // Example 7: Loop modes
  setTimeout(() => {
    console.log('\n🔄 Adding tracks back and testing loop modes...');
    engine.add([
      'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav'
    ]);

    console.log('Setting loop mode to TRACK...');
    engine.setLoopMode('track');

    engine.play();
  }, 14000);

  setTimeout(() => {
    console.log('Setting loop mode to QUEUE...');
    engine.setLoopMode('queue');
  }, 16000);

  setTimeout(() => {
    console.log('Setting loop mode to OFF...');
    engine.setLoopMode('off');
  }, 18000);
});

// Handle queue events
engine.on('trackAdd', (track) => {
  console.log(`➕ Track added: ${track.title}`);
});

engine.on('trackRemove', (track) => {
  console.log(`➖ Track removed: ${track.title}`);
});

engine.on('shuffle', (tracks) => {
  console.log('🔀 Queue shuffled');
});

engine.on('clear', () => {
  console.log('🧹 Queue cleared');
});

engine.on('trackStart', (track) => {
  console.log(`▶️  Now playing: ${track.title}`);
});

engine.on('trackEnd', (track) => {
  console.log(`⏹️  Finished: ${track.title}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down queue demo...');
  engine.destroy();
  process.exit(0);
});