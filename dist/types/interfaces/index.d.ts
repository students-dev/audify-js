export interface ITrack {
    id: string;
    url: string;
    title: string;
    artist?: string;
    duration?: number;
    thumbnail?: string;
    source?: string;
    metadata: Record<string, any>;
}
export interface IAudioEngine {
    play(track: ITrack): Promise<void>;
    player: any;
}
export interface IProvider {
    name: string;
    version: string;
    initialize(engine: IAudioEngine): Promise<void>;
    resolve(query: string): Promise<ITrack | ITrack[]>;
    play(track: ITrack): Promise<void>;
    stop(): Promise<void>;
    destroy(): void;
}
export interface IPlugin {
    name: string;
    version: string;
    onLoad(engine: IAudioEngine): void;
    onUnload(): void;
    onEnable(): void;
    onDisable(): void;
}
