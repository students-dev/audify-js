import { IProvider, ITrack, IAudioEngine } from '../interfaces';
export declare class YouTubeProvider implements IProvider {
    name: string;
    version: string;
    private engine;
    initialize(engine: IAudioEngine): Promise<void>;
    resolve(query: string): Promise<ITrack | ITrack[]>;
    play(track: ITrack): Promise<void>;
    stop(): Promise<void>;
    destroy(): void;
    private extractVideoId;
}
