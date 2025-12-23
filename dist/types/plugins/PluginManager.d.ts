import { IPlugin, IAudioEngine } from '../interfaces';
/**
 * Plugin manager for loading and managing plugins
 */
export declare class PluginManager {
    private engine;
    private plugins;
    constructor(engine: IAudioEngine);
    /**
     * Load a plugin
     * @param plugin - Plugin instance
     */
    load(plugin: IPlugin): void;
    /**
     * Enable a plugin
     * @param name - Plugin name
     */
    enable(name: string): void;
    /**
     * Disable a plugin
     * @param name - Plugin name
     */
    disable(name: string): void;
    /**
     * Unload a plugin
     * @param name - Plugin name
     */
    unload(name: string): void;
    /**
     * Get plugin by name
     * @param name - Plugin name
     * @returns Plugin instance
     */
    get(name: string): IPlugin | undefined;
    /**
     * Get all plugins
     * @returns Map of plugins
     */
    getAll(): Map<string, IPlugin>;
    /**
     * Get enabled plugins
     * @returns Array of enabled plugins
     */
    getEnabled(): IPlugin[];
    /**
     * Call hook on all enabled plugins
     * @param hook - Hook name
     * @param args - Arguments to pass
     */
    callHook(hook: string, ...args: any[]): void;
}
