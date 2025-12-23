# Plugin System

Audify-js is designed to be extensible. Plugins can intercept playback flows, modify queue behavior, or simply log events.

## Creating a Plugin

Extend the `Plugin` base class:

```typescript
import { Plugin, ITrack, IAudioEngine } from '@students-dev/audify-js';

export class AnalyticsPlugin extends Plugin {
  constructor() {
    super('analytics', '1.0.0');
  }

  onLoad(engine: IAudioEngine) {
    console.log('Analytics loaded');
  }

  onEnable() {
    // Start tracking
  }

  beforePlay(track: ITrack) {
    // Log play attempt
    sendToAnalytics('play_attempt', track.title);
  }

  trackEnd(track: ITrack) {
    // Log completion
    sendToAnalytics('play_complete', track.title);
  }
}
```

## Lifecycle Hooks

| Hook | Description |
|------|-------------|
| `onLoad` | Called when the plugin is added to the engine. |
| `onEnable` | Called when the plugin is enabled. |
| `onDisable` | Called when the plugin is disabled. |
| `onUnload` | Called when the plugin is removed. |
| `beforePlay` | Executed right before the player starts a track. |
| `afterPlay` | Executed immediately after playback starts. |
| `trackEnd` | Executed when a track finishes playing. |
| `queueUpdate` | Executed whenever the queue structure changes. |
