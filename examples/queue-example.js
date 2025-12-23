import { AudioEngine } from '../dist/esm/index.js';

const engine = new AudioEngine();

engine.eventBus.on('ready', () => {
  console.log('🎵 Audio engine ready for queue management demo');

  // Add tracks
  engine.add('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
  engine.add([
    'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav'
  ]);
  
  console.log(`Initial Queue Size: ${engine.queue.size()}`);

  // Navigation
  engine.play();

  setTimeout(() => {
      console.log('Next track...');
      engine.next();
  }, 2000);

  setTimeout(() => {
      console.log('Previous track...');
      engine.previous();
  }, 4000);
  
  setTimeout(() => {
      console.log('Shuffle...');
      engine.shuffle();
  }, 6000);

  setTimeout(() => {
      console.log('Clear...');
      engine.clear();
      console.log(`Queue Cleared. Size: ${engine.queue.size()}`);
      engine.destroy();
  }, 8000);
});

engine.eventBus.on('trackStart', (t) => console.log(`Playing: ${t.title}`));
