# Architecture

## Overview

Audify-js follows a modular, event-driven architecture designed to work consistently in both Node.js (via mock/adapters) and Browser (via Web Audio API) environments.

### Core Components

1.  **AudioEngine**: The main facade and controller. It initializes sub-systems and routes high-level commands.
2.  **Player**: Handles the low-level audio context, buffer sources, and playback loop.
3.  **Queue**: Manages the playlist state, including shuffle logic and loop modes.
4.  **ProviderRegistry**: A registry pattern that maps track sources (like 'youtube', 'spotify') to specific `IProvider` implementations.
5.  **PluginManager**: Manages the lifecycle of plugins and hooks execution.
6.  **EventBus**: A centralized event emitter that decouples components.

### Data Flow

```
User -> AudioEngine.play(url)
          |
          v
    Check ProviderRegistry
          |
          +-> If Provider Found (e.g., Spotify):
          |     Provider.resolve(url) -> Track Object
          |     Provider.play(Track)
          |
          +-> If No Provider (Direct URL):
                Player.playStream(Track)
```

### Event System

The system relies heavily on events. Components do not call each other's UI update methods directly; they emit events.

-   `AudioEngine` listens to `Player` events to update its state.
-   `Queue` emits updates when tracks are added/removed.
-   `Plugins` hook into these events via the `PluginManager`.
