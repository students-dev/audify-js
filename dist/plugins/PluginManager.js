/**
 * Plugin manager for loading and managing plugins
 */
export class PluginManager {
    constructor(engine) {
        this.engine = engine;
        this.plugins = new Map();
    }
    /**
     * Load a plugin
     * @param plugin - Plugin instance
     */
    load(plugin) {
        if (!plugin || typeof plugin.onLoad !== 'function') {
            throw new Error('Invalid plugin instance');
        }
        try {
            plugin.onLoad(this.engine);
            this.plugins.set(plugin.name, plugin);
        }
        catch (error) {
            console.error(`Failed to load plugin ${plugin.name}:`, error);
        }
    }
    /**
     * Enable a plugin
     * @param name - Plugin name
     */
    enable(name) {
        const plugin = this.plugins.get(name);
        if (plugin && !plugin.onEnable)
            return; // Should have onEnable from interface
        // Check if we track enabled state in plugin interface?
        // Interface has onEnable methods.
        // Plugin implementations usually track their own state or we assume onEnable does it.
        // Check if plugin object has 'enabled' property (generic check)
        if (plugin && plugin.enabled === false) {
            plugin.onEnable();
        }
    }
    /**
     * Disable a plugin
     * @param name - Plugin name
     */
    disable(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.onDisable();
        }
    }
    /**
     * Unload a plugin
     * @param name - Plugin name
     */
    unload(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.onUnload();
            this.plugins.delete(name);
        }
    }
    /**
     * Get plugin by name
     * @param name - Plugin name
     * @returns Plugin instance
     */
    get(name) {
        return this.plugins.get(name);
    }
    /**
     * Get all plugins
     * @returns Map of plugins
     */
    getAll() {
        return new Map(this.plugins);
    }
    /**
     * Get enabled plugins
     * @returns Array of enabled plugins
     */
    getEnabled() {
        // We assume plugins that are loaded are potential candidates, 
        // but the IPlugin interface doesn't enforce an 'enabled' property reading.
        // However, the Base Plugin class does.
        // We'll filter by checking 'enabled' property if it exists, or assume true?
        // Safer to check property.
        return Array.from(this.plugins.values()).filter(plugin => plugin.enabled === true);
    }
    /**
     * Call hook on all enabled plugins
     * @param hook - Hook name
     * @param args - Arguments to pass
     */
    callHook(hook, ...args) {
        this.getEnabled().forEach(plugin => {
            if (typeof plugin[hook] === 'function') {
                try {
                    plugin[hook](...args);
                }
                catch (error) {
                    console.error(`Error in plugin ${plugin.name} hook ${hook}:`, error);
                }
            }
        });
    }
}
