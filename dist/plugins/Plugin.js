export class Plugin {
    constructor(name, version = '1.0.0') {
        this.enabled = false;
        this.loaded = false;
        this.name = name;
        this.version = version;
    }
    onLoad(engine) {
        this.engine = engine;
        this.loaded = true;
    }
    onUnload() {
        this.loaded = false;
        this.engine = undefined;
    }
    onEnable() {
        this.enabled = true;
    }
    onDisable() {
        this.enabled = false;
    }
    // Optional Hooks used by PluginManager.callHook
    beforePlay(track) { }
    afterPlay(track) { }
    trackEnd(track) { }
    queueUpdate(queue) { }
}
