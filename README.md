# audify-js

[![npm version](https://badge.fury.io/js/%40students-dev%2Faudify-js.svg)](https://badge.fury.io/js/%40students-dev%2Faudify-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, modern, modular audio engine that provides playback, filters, queue management, events, and extensibility through plugins. Works in both **Node.js** and **browser** environments.

## Features

- 🎵 **Unified Audio Engine**: Cross-environment abstraction using Web Audio API
- 📋 **Queue Management**: Add, remove, shuffle, jump, and loop modes
- 🎛️ **Audio Filters**: Bassboost, nightcore, vaporwave, 8D rotate, pitch/speed adjustment, reverb
- 🔌 **Plugin System**: Extensible architecture with lifecycle hooks
- 📡 **Event-Driven**: Comprehensive event system for all operations
- 🌐 **Multi-Source Support**: Local files, remote URLs, YouTube, SoundCloud, Spotify, Lavalink
- 🛠️ **Developer-Friendly**: TypeScript declarations, ESM/CJS builds

## Installation

```bash
npm install @students-dev/audify-js
```

## Quick Start

### Browser

```html
<!DOCTYPE html>
<html>
<head>
  <title>audify-js Demo</title>
</head>
<body>
  <script type="module">
    import { AudioEngine } from '@students-dev/audify-js';

    const engine = new AudioEngine();

    engine.on('ready', () => {
      console.log('Audio engine ready!');
      engine.add('https://example.com/audio.mp3');
      engine.play();
    });

    engine.on('trackStart', (track) => {
      console.log('Now playing:', track.title);
    });
  </script>
</body>
</html>
```

### Node.js

```javascript
import { AudioEngine } from '@students-dev/audify-js';

const engine = new AudioEngine();

engine.on('ready', () => {
  engine.add('/path/to/audio.mp3');
  engine.play();
});
```

## API Reference

### AudioEngine

The main class that orchestrates all audio functionality.

#### Constructor

```javascript
const engine = new AudioEngine(options);
```

#### Spotify Integration

```javascript
// Initialize Spotify provider
engine.initSpotify({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret'
});

// Search tracks
const results = await engine.searchSpotifyTracks('query', { token: 'access_token' });

// Load track
const track = await engine.loadSpotifyTrack('track_id', { token: 'access_token' });
```

#### Lavalink Integration

```javascript
// Connect to Lavalink server
await engine.connectLavalink({
  host: 'localhost',
  port: 2333,
  password: 'youshallnotpass'
});

// Load track from Lavalink
const track = await engine.loadLavalinkTrack('ytsearch:query');

// Get Lavalink player for Discord bots
const player = engine.getLavalinkPlayer('guild_id', 'channel_id');
```

#### Methods

##### Playback Controls

- `play(track?)`: Play a track or resume current playback
- `pause()`: Pause playback
- `stop()`: Stop playback
- `seek(time)`: Seek to specific time (seconds)
- `setVolume(volume)`: Set volume (0-1)

##### Queue Management

- `add(tracks)`: Add track(s) to queue
- `remove(identifier)`: Remove track by index or ID
- `next()`: Skip to next track
- `previous()`: Go to previous track
- `shuffle()`: Shuffle the queue
- `clear()`: Clear the queue
- `jump(index)`: Jump to track at index

##### Filters

- `applyFilter(type, options)`: Apply audio filter
- `removeFilter(type)`: Remove audio filter

##### Loop Modes

- `setLoopMode(mode)`: Set loop mode (`LOOP_MODES.OFF`, `LOOP_MODES.TRACK`, `LOOP_MODES.QUEUE`)

##### State

- `getState()`: Get current engine state

#### Events

- `ready`: Engine initialized
- `play`: Playback started
- `pause`: Playback paused
- `stop`: Playback stopped
- `error`: Error occurred
- `queueEmpty`: Queue became empty
- `trackStart`: Track started playing
- `trackEnd`: Track ended
- `filterApplied`: Filter applied
- `trackAdd`: Track added to queue
- `trackRemove`: Track removed from queue
- `shuffle`: Queue shuffled
- `clear`: Queue cleared

### Queue

Manages the audio playback queue.

```javascript
const queue = engine.queue;

// Add tracks
queue.add('track.mp3');
queue.add(['track1.mp3', 'track2.mp3']);

// Navigate
queue.next();
queue.previous();
queue.jump(5);

// Modify
queue.shuffle();
queue.clear();
```

### Track

Represents an audio track.

```javascript
import { Track } from '@students-dev/audify-js';

const track = new Track('https://example.com/audio.mp3', {
  title: 'My Song',
  artist: 'Artist Name',
  duration: 180
});
```

### Filters

Apply audio effects.

```javascript
// Bass boost
engine.applyFilter('bassboost', { gain: 1.5 });

// Nightcore
engine.applyFilter('nightcore', { rate: 1.2 });

// 8D Audio
engine.applyFilter('8d');

// Remove filter
engine.removeFilter('bassboost');
```

Available filters:
- `bassboost`: Boost low frequencies
- `nightcore`: Speed up and pitch up
- `vaporwave`: Slow down and pitch down
- `8d`: 8D audio rotation effect
- `pitch`: Adjust pitch
- `speed`: Adjust playback speed
- `reverb`: Add reverb effect

### Plugins

Extend functionality with plugins.

```javascript
import { Plugin } from '@students-dev/audify-js';

class MyPlugin extends Plugin {
  constructor() {
    super('my-plugin', '1.0.0');
  }

  onLoad(engine) {
    console.log('Plugin loaded!');
  }

  beforePlay(track) {
    console.log('About to play:', track.title);
  }
}

// Load plugin
const plugin = new MyPlugin();
engine.pluginManager.load(plugin);
engine.pluginManager.enable('my-plugin');
```

### Providers

Fetch metadata from different sources.

```javascript
import { YouTubeProvider, SoundCloudProvider, LocalProvider, SpotifyProvider, LavalinkProvider } from '@students-dev/audify-js';

// YouTube
const ytInfo = await YouTubeProvider.getInfo('https://youtube.com/watch?v=VIDEO_ID');

// SoundCloud
const scInfo = await SoundCloudProvider.getInfo('https://soundcloud.com/artist/track');

// Local file (Node.js only)
const localInfo = await LocalProvider.getInfo('/path/to/file.mp3');

// Spotify (requires access token)
const spotify = new SpotifyProvider({ clientId: 'your_client_id' });
spotify.setAccessToken('access_token');
const trackInfo = await spotify.getTrack('track_id');

// Lavalink (requires Lavalink server)
const lavalink = new LavalinkProvider({ host: 'localhost', port: 2333, password: 'password' });
await lavalink.connect();
const lavalinkTrack = await lavalink.loadTrack('ytsearch:query');
```

### Utils

Utility functions for common tasks.

```javascript
import { TimeUtils, MetadataUtils, ProbeUtils } from '@students-dev/audify-js';

// Time formatting
TimeUtils.format(125); // "02:05"

// Metadata extraction
const metadata = MetadataUtils.extract('https://example.com/song.mp3');

// Audio probing
const probe = await ProbeUtils.probe(audioBuffer);
```

## Examples

The `examples/` directory contains comprehensive examples demonstrating various features:

### 📁 Available Examples

- **`browser-example.html`** - Interactive browser demo with UI controls
- **`nodejs-example.js`** - Node.js usage with event handling
- **`queue-example.js`** - Queue management operations
- **`plugin-examples.js`** - Custom plugin implementations
- **`spotify-example.js`** - Spotify API integration
- **`lavalink-example.js`** - Lavalink server integration

### Basic Playback

```javascript
import { AudioEngine } from '@students-dev/audify-js';

const engine = new AudioEngine();

engine.on('ready', async () => {
  // Add tracks
  engine.add([
    'track1.mp3',
    'track2.mp3',
    'https://example.com/track3.mp3'
  ]);

  // Start playing
  await engine.play();

  // Apply filter
  engine.applyFilter('bassboost');
});

// Handle events
engine.on('trackStart', (track) => {
  console.log(`Playing: ${track.title}`);
});

engine.on('error', (error) => {
  console.error('Playback error:', error);
});
```

### Queue Management

```javascript
// Add multiple tracks
engine.add([
  { url: 'song1.mp3', title: 'Song One' },
  { url: 'song2.mp3', title: 'Song Two' }
]);

// Navigation
engine.next();
engine.previous();
engine.jump(2); // Jump to track at index 2

// Modify queue
engine.shuffle();
engine.clear();

// Remove specific track
engine.remove(0); // Remove by index
engine.remove('track-id'); // Remove by ID
```

### Audio Filters

```javascript
// Bass boost
engine.applyFilter('bassboost', { gain: 1.5 });

// Nightcore effect
engine.applyFilter('nightcore', { rate: 1.2 });

// Vaporwave effect
engine.applyFilter('vaporwave', { rate: 0.8 });

// 8D Audio
engine.applyFilter('8d');

// Pitch adjustment
engine.applyFilter('pitch', { pitch: 1.1 });

// Speed adjustment
engine.applyFilter('speed', { speed: 1.25 });

// Reverb
engine.applyFilter('reverb', { preset: 'hall' });

// Remove filter
engine.removeFilter('bassboost');
```

### Custom Plugin

```javascript
import { Plugin } from '@students-dev/audify-js';

class LoggerPlugin extends Plugin {
  constructor() {
    super('logger');
  }

  beforePlay(track) {
    console.log(`[Logger] Starting playback: ${track.title}`);
  }

  afterPlay(track) {
    console.log(`[Logger] Finished playback: ${track.title}`);
  }

  trackEnd(track) {
    console.log(`[Logger] Track ended: ${track.title}`);
  }
}

// Register plugin
const loggerPlugin = new LoggerPlugin();
engine.pluginManager.load(loggerPlugin);
engine.pluginManager.enable('logger');
```

### Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>audify-js Demo</title>
</head>
<body>
  <button id="playBtn">Play</button>
  <button id="bassBtn">Bass Boost</button>

  <script type="module">
    import { AudioEngine } from '@students-dev/audify-js';

    const engine = new AudioEngine();

    engine.on('ready', () => {
      engine.add('audio.mp3');

      document.getElementById('playBtn').onclick = () => engine.play();
      document.getElementById('bassBtn').onclick = () =>
        engine.applyFilter('bassboost');
    });
  </script>
</body>
</html>
```

### Running Examples

```bash
# Browser example
# Open examples/browser-example.html in your browser

# Node.js examples
node examples/nodejs-example.js
node examples/queue-example.js
```

## Browser Compatibility

- Chrome 14+
- Firefox 25+
- Safari 6+
- Edge 12+

## Node.js Compatibility

- Node.js 14+

For audio playback in Node.js, additional setup may be required for actual audio output.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Audio not playing in browser

Ensure you're handling user interaction requirements for Web Audio API:

```javascript
// Resume AudioContext on user interaction
document.addEventListener('click', () => {
  if (engine.audioContext.state === 'suspended') {
    engine.audioContext.resume();
  }
});
```

### CORS issues with remote audio

When loading audio from different domains, ensure proper CORS headers are set on the server.

### Node.js audio output

For actual audio playback in Node.js, you may need additional packages like `speaker` or `node-speaker`.

### Filter not working

Some filters require AudioWorklet support in modern browsers. Check browser compatibility.

## Changelog

### v1.1.0
- Added Spotify integration with client-side API support
- Added Lavalink integration for server-based audio streaming
- Updated dependencies for better performance and security
- Enhanced TypeScript type definitions
- Added comprehensive examples for new integrations

### v1.0.0
- Initial release
- Core audio engine
- Queue management
- Audio filters
- Plugin system
- Event system
- Provider abstractions
- Utility functions