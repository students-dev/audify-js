/**
 * Base plugin class
 */
export class Plugin {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
    this.enabled = false;
    this.loaded = false;
  }

  /**
   * Called when plugin is loaded
   * @param {AudioEngine} engine - Audio engine instance
   */
  onLoad(engine) {
    this.engine = engine;
    this.loaded = true;
  }

  /**
   * Called when plugin is enabled
   */
  onEnable() {
    this.enabled = true;
  }

  /**
   * Called when plugin is disabled
   */
  onDisable() {
    this.enabled = false;
  }

  /**
   * Hook called before play
   * @param {Track} track - Track being played
   */
  beforePlay(track) {
    // Override in subclass
  }

  /**
   * Hook called after play
   * @param {Track} track - Track being played
   */
  afterPlay(track) {
    // Override in subclass
  }

  /**
   * Hook called when track ends
   * @param {Track} track - Track that ended
   */
  trackEnd(track) {
    // Override in subclass
  }

  /**
   * Hook called when queue updates
   * @param {Queue} queue - Updated queue
   */
  queueUpdate(queue) {
    // Override in subclass
  }

  /**
   * Get plugin info
   * @returns {Object} Plugin information
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      enabled: this.enabled,
      loaded: this.loaded
    };
  }
}