export interface Plugin {
  name: string;
  version: string;
  init(audioEngine: any): void;
  destroy?(): void;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin, audioEngine: any): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }
    plugin.init(audioEngine);
    this.plugins.set(plugin.name, plugin);
  }

  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.destroy) {
      plugin.destroy();
    }
    this.plugins.delete(name);
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}