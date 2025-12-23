import { IPlugin, IAudioEngine } from '../interfaces';
export declare abstract class Plugin implements IPlugin {
    name: string;
    version: string;
    enabled: boolean;
    loaded: boolean;
    protected engine?: IAudioEngine;
    constructor(name: string, version?: string);
    onLoad(engine: IAudioEngine): void;
    onUnload(): void;
    onEnable(): void;
    onDisable(): void;
    beforePlay(track: any): void;
    afterPlay(track: any): void;
    trackEnd(track: any): void;
    queueUpdate(queue: any): void;
}
