# audify-js v1.0.2

[![npm version](https://badge.fury.io/js/%40students-dev%2Faudify-js.svg)](https://badge.fury.io/js/%40students-dev%2Faudify-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, modern, modular audio engine that provides playback, filters, queue management, events, and extensibility through plugins. Works in both **Node.js** and **browser** environments.

**Version 1.0.2** represents a major stability and architecture enhancement, introducing a standardized provider system, robust plugin lifecycle, and full TypeScript support.

## Features

- 🎵 **Unified Audio Engine**: Cross-environment abstraction using Web Audio API.
- 📋 **Advanced Queue Management**: Add, remove, shuffle, jump, loop (track/queue) modes.
- 🎛️ **Audio Filters**: Bassboost, nightcore, vaporwave, 8D rotate, pitch/speed adjustment, reverb.
- 🔌 **Robust Plugin System**: Extensible architecture with safe lifecycle hooks and error isolation.
- 📡 **Event-Driven**: Comprehensive event system for all operations.
- 🌐 **Provider Registry**: Standardized interface for providers (Local, YouTube, Spotify, Lavalink).
- 🛠️ **Developer-Friendly**: Full TypeScript support, strict typings, and ESM/CJS builds.

## Architecture Overview

Audify-js v1.0.2 uses a modular architecture:
- **AudioEngine**: The central controller orchestrating playback, queue, and events.
- **ProviderRegistry**: Manages source providers (e.g., resolving URLs to streams).
- **Player**: Handles low-level audio context and buffer management.
- **Queue**: Manages track list and state.
- **PluginManager**: Handles extensions and hooks.

## Documentation

For more detailed information, check out the documentation:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Providers System](docs/PROVIDERS.md)
- [Plugin Development](docs/PLUGINS.md)

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
    import { AudioEngine } from './dist/esm/index.js';

    const engine = new AudioEngine();

    engine.eventBus.on('ready', () => {
      console.log('Audio engine ready!');
      engine.play('https://example.com/audio.mp3');
    });

    engine.eventBus.on('trackStart', (track) => {
      console.log('Now playing:', track.title);
    });
  </script>
</body>
</html>
```

### Node.js

```javascript
import { AudioEngine, LocalProvider } from '@students-dev/audify-js';

const engine = new AudioEngine();

// Engine automatically registers default providers (Local, YouTube)
// But you can register custom ones or configure them

engine.eventBus.on('ready', async () => {
  await engine.play('./music/song.mp3');
});
```

## Providers

Providers allow `audify-js` to resolve and play tracks from various sources. v1.0.2 introduces a **Provider Registry**.

### Built-in Providers

- **LocalProvider**: Plays local files (Node.js) or direct URLs.
- **YouTubeProvider**: Resolves YouTube URLs (requires `ytdl-core` in real usage, mock included).
- **SpotifyProvider**: Integrates with Spotify Web API.
- **LavalinkProvider**: Connects to Lavalink nodes.

### Configuration

```javascript
const engine = new AudioEngine({
  spotify: {
    clientId: '...',
    clientSecret: '...'
  },
  lavalink: {
    host: 'localhost',
    password: 'youshallnotpass'
  }
});
```

## Plugins

Create powerful extensions using the `Plugin` class.

```typescript
import { Plugin, IAudioEngine } from '@students-dev/audify-js';

class MyLoggerPlugin extends Plugin {
  constructor() {
    super('logger', '1.0.0');
  }

  onLoad(engine: IAudioEngine) {
    console.log('Plugin loaded');
  }

  beforePlay(track: any) {
    console.log('About to play:', track.title);
  }

  trackEnd(track: any) {
    console.log('Finished:', track.title);
  }
}

// Register
const plugin = new MyLoggerPlugin();
engine.plugins.load(plugin);
engine.plugins.enable('logger');
```

## API Reference

### AudioEngine

- `play(track?: ITrack | string)`: Play a track object or resolve a string (URL/ID).
- `pause()`: Pause playback.
- `stop()`: Stop playback.
- `seek(time)`: Seek to time in seconds.
- `setVolume(volume)`: 0.0 to 1.0.
- `setLoopMode(mode)`: 'off', 'track', 'queue'.
- `add(tracks)`: Add to queue.
- `next()`: Skip to next.
- `previous()`: Skip to previous.
- `shuffle()`: Shuffle queue.
- `getProvider(name)`: Get a provider instance.

### Events

Access via `engine.eventBus.on(event, callback)`.

- `ready`
- `play`, `pause`, `stop`
- `trackStart`, `trackEnd`
- `queueUpdate`
- `error`

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and PR

## License

MIT
