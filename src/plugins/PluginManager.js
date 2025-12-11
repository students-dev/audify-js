import { Plugin } from './Plugin.js';

/**
 * Plugin manager for loading and managing plugins
 */
export class PluginManager {
  constructor(audioEngine) {
    this.engine = audioEngine;
    this.plugins = new Map();
  }

  /**
   * Load a plugin
   * @param {Plugin} plugin - Plugin instance
   */
  load(plugin) {
    if (!(plugin instanceof Plugin)) {
      throw new Error('Invalid plugin instance');
    }

    plugin.onLoad(this.engine);
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Enable a plugin
   * @param {string} name - Plugin name
   */
  enable(name) {
    const plugin = this.plugins.get(name);
    if (plugin && !plugin.enabled) {
      plugin.onEnable();
    }
  }

  /**
   * Disable a plugin
   * @param {string} name - Plugin name
   */
  disable(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.enabled) {
      plugin.onDisable();
    }
  }

  /**
   * Unload a plugin
   * @param {string} name - Plugin name
   */
  unload(name) {
    const plugin = this.plugins.get(name);
    if (plugin) {
      if (plugin.enabled) {
        plugin.onDisable();
      }
      this.plugins.delete(name);
    }
  }

  /**
   * Get plugin by name
   * @param {string} name - Plugin name
   * @returns {Plugin|null} Plugin instance
   */
  get(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * Get all plugins
   * @returns {Map} Map of plugins
   */
  getAll() {
    return new Map(this.plugins);
  }

  /**
   * Get enabled plugins
   * @returns {Plugin[]} Array of enabled plugins
   */
  getEnabled() {
    return Array.from(this.plugins.values()).filter(plugin => plugin.enabled);
  }

  /**
   * Call hook on all enabled plugins
   * @param {string} hook - Hook name
   * @param {...*} args - Arguments to pass
   */
  callHook(hook, ...args) {
    this.getEnabled().forEach(plugin => {
      if (typeof plugin[hook] === 'function') {
        try {
          plugin[hook](...args);
        } catch (error) {
          console.error(`Error in plugin ${plugin.name} hook ${hook}:`, error);
        }
      }
    });
  }
}