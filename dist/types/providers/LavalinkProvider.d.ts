import { IProvider, ITrack, IAudioEngine } from '../interfaces';
export declare class LavalinkProvider implements IProvider {
    name: string;
    version: string;
    private engine;
    private manager;
    private node;
    private options;
    constructor(options?: any);
    initialize(engine: IAudioEngine): Promise<void>;
    resolve(identifier: string): Promise<ITrack | ITrack[]>;
    play(track: ITrack): Promise<void>;
    createPlayer(guildId: string, channelId: string): import("lavalink-client").Player;
    stop(): Promise<void>;
    destroy(): void;
    private _formatTrack;
}
