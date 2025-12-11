import { Plugin } from '@students-dev/audify-js';

/**
 * Example plugin that logs all audio events
 */
export class LoggerPlugin extends Plugin {
  constructor() {
    super('logger-plugin', '1.0.0');
  }

  onLoad(engine) {
    console.log('📝 Logger plugin loaded');
    this.engine = engine;
  }

  onEnable() {
    console.log('📝 Logger plugin enabled');
  }

  onDisable() {
    console.log('📝 Logger plugin disabled');
  }

  beforePlay(track) {
    console.log(`🎵 About to play: ${track.title}`);
  }

  afterPlay(track) {
    console.log(`🎵 Started playing: ${track.title}`);
  }

  trackEnd(track) {
    console.log(`🎵 Track ended: ${track.title}`);
  }

  queueUpdate(queue) {
    console.log(`📋 Queue updated, now has ${queue.size()} tracks`);
  }
}

/**
 * Example plugin that automatically applies filters based on track metadata
 */
export class AutoFilterPlugin extends Plugin {
  constructor() {
    super('auto-filter-plugin', '1.0.0');
  }

  onLoad(engine) {
    console.log('🎛️  Auto-filter plugin loaded');
    this.engine = engine;
  }

  beforePlay(track) {
    // Apply different filters based on track title
    if (track.title.toLowerCase().includes('night')) {
      this.engine.applyFilter('nightcore', { rate: 1.1 });
      console.log('🌙 Auto-applied nightcore filter');
    } else if (track.title.toLowerCase().includes('chill')) {
      this.engine.applyFilter('vaporwave', { rate: 0.9 });
      console.log('🌊 Auto-applied vaporwave filter');
    } else {
      // Default bass boost for other tracks
      this.engine.applyFilter('bassboost', { gain: 1.2 });
      console.log('🔊 Auto-applied bass boost filter');
    }
  }

  trackEnd(track) {
    // Clear filters when track ends
    console.log('🧹 Clearing filters for next track');
    // Note: In real implementation, you'd clear filters here
  }
}

/**
 * Example plugin that shows desktop notifications
 */
export class NotificationPlugin extends Plugin {
  constructor() {
    super('notification-plugin', '1.0.0');
  }

  onLoad(engine) {
    console.log('🔔 Notification plugin loaded');
    this.engine = engine;
  }

  trackStart(track) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Now Playing', {
          body: track.title,
          icon: track.thumbnail || '/audio-icon.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }
}

// Usage example:
/*
import { AudioEngine } from '@students-dev/audify-js';
import { LoggerPlugin, AutoFilterPlugin, NotificationPlugin } from './plugins.js';

const engine = new AudioEngine();

engine.on('ready', () => {
  // Register plugins
  const loggerPlugin = new LoggerPlugin();
  const autoFilterPlugin = new AutoFilterPlugin();
  const notificationPlugin = new NotificationPlugin();

  engine.pluginManager.load(loggerPlugin);
  engine.pluginManager.load(autoFilterPlugin);
  engine.pluginManager.load(notificationPlugin);

  // Enable plugins
  engine.pluginManager.enable('logger-plugin');
  engine.pluginManager.enable('auto-filter-plugin');
  engine.pluginManager.enable('notification-plugin');

  // Add tracks and play
  engine.add('track.mp3');
  engine.play();
});
*/