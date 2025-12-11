/**
 * Plugin manager for loading and managing plugins
 */
export class PluginManager {
    constructor(audioEngine: any);
    engine: any;
    plugins: Map<any, any>;
    /**
     * Load a plugin
     * @param {Plugin} plugin - Plugin instance
     */
    load(plugin: Plugin): void;
    /**
     * Enable a plugin
     * @param {string} name - Plugin name
     */
    enable(name: string): void;
    /**
     * Disable a plugin
     * @param {string} name - Plugin name
     */
    disable(name: string): void;
    /**
     * Unload a plugin
     * @param {string} name - Plugin name
     */
    unload(name: string): void;
    /**
     * Get plugin by name
     * @param {string} name - Plugin name
     * @returns {Plugin|null} Plugin instance
     */
    get(name: string): Plugin | null;
    /**
     * Get all plugins
     * @returns {Map} Map of plugins
     */
    getAll(): Map<any, any>;
    /**
     * Get enabled plugins
     * @returns {Plugin[]} Array of enabled plugins
     */
    getEnabled(): Plugin[];
    /**
     * Call hook on all enabled plugins
     * @param {string} hook - Hook name
     * @param {...*} args - Arguments to pass
     */
    callHook(hook: string, ...args: any[]): void;
}
import { Plugin } from './Plugin.js';
