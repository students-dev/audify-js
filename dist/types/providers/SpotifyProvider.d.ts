import { IProvider, ITrack, IAudioEngine } from '../interfaces';
export declare class SpotifyProvider implements IProvider {
    name: string;
    version: string;
    private engine;
    private spotifyApi;
    constructor(options?: any);
    initialize(engine: IAudioEngine): Promise<void>;
    resolve(query: string): Promise<ITrack | ITrack[]>;
    play(track: ITrack): Promise<void>;
    stop(): Promise<void>;
    destroy(): void;
    private _formatTrack;
}
