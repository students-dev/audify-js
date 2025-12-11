import { PluginManager, Plugin } from '../src/index.js';

class TestPlugin extends Plugin {
  constructor() {
    super('test-plugin');
  }
}

describe('PluginManager', () => {
  let manager;
  let mockEngine;

  beforeEach(() => {
    mockEngine = {};
    manager = new PluginManager(mockEngine);
  });

  test('should load plugin', () => {
    const plugin = new TestPlugin();
    manager.load(plugin);
    expect(manager.get('test-plugin')).toBe(plugin);
  });

  test('should enable plugin', () => {
    const plugin = new TestPlugin();
    manager.load(plugin);
    manager.enable('test-plugin');
    expect(plugin.enabled).toBe(true);
  });

  test('should disable plugin', () => {
    const plugin = new TestPlugin();
    manager.load(plugin);
    manager.enable('test-plugin');
    manager.disable('test-plugin');
    expect(plugin.enabled).toBe(false);
  });
});