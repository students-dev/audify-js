import { IPlugin, IAudioEngine } from '../interfaces';

export abstract class Plugin implements IPlugin {
  name: string;
  version: string;
  enabled: boolean = false;
  loaded: boolean = false;
  protected engine?: IAudioEngine;

  constructor(name: string, version: string = '1.0.0') {
    this.name = name;
    this.version = version;
  }

  onLoad(engine: IAudioEngine): void {
    this.engine = engine;
    this.loaded = true;
  }
  
  onUnload(): void {
    this.loaded = false;
    this.engine = undefined;
  }

  onEnable(): void {
    this.enabled = true;
  }

  onDisable(): void {
    this.enabled = false;
  }
  
  // Optional Hooks used by PluginManager.callHook
  beforePlay(track: any): void {}
  afterPlay(track: any): void {}
  trackEnd(track: any): void {}
  queueUpdate(queue: any): void {}
}
