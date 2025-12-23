import { IProvider, ITrack, IAudioEngine } from '../interfaces';
import { Track } from '../queue/Track';
import { LavalinkManager } from 'lavalink-client';

export class LavalinkProvider implements IProvider {
  name = 'lavalink';
  version = '1.0.0';
  private engine: IAudioEngine | null = null;
  private manager: LavalinkManager | null = null;
  private node: any = null;
  private options: any;

  constructor(options: any = {}) {
    this.options = options;
  }

  async initialize(engine: IAudioEngine): Promise<void> {
    this.engine = engine;
    this.manager = new LavalinkManager({
        nodes: [{
          host: this.options.host || 'localhost',
          port: this.options.port || 2333,
          // @ts-ignore
          password: this.options.password || 'youshallnotpass',
          secure: this.options.secure || false,
          id: 'main'
        }],
        sendToShard: (guildId: string, payload: any) => {
           // Mock
        }
    });
    // @ts-ignore
    if (this.manager.connect) await this.manager.connect();
    // @ts-ignore
    this.node = this.manager.nodes ? this.manager.nodes.get('main') : (this.manager as any).node; 
  }

  async resolve(identifier: string): Promise<ITrack | ITrack[]> {
    if (!this.node) throw new Error('Lavalink not connected');

    const result = await this.node.rest.loadTracks(identifier);

    if (result.loadType === 'TRACK_LOADED') {
      return this._formatTrack(result.tracks[0]);
    } else if (result.loadType === 'PLAYLIST_LOADED' || result.loadType === 'SEARCH_RESULT') {
      return result.tracks.map((t: any) => this._formatTrack(t));
    }
    
    return [];
  }

  async play(track: ITrack): Promise<void> {
    throw new Error('Lavalink play() requires guild/channel context. Use createPlayer() directly.');
  }

  createPlayer(guildId: string, channelId: string) {
     if (!this.manager) throw new Error('Not initialized');
     return this.manager.createPlayer({
        guildId,
        voiceChannelId: channelId
     });
  }

  async stop(): Promise<void> {
     // Stop all?
  }

  destroy(): void {
    if (this.manager) {
        // @ts-ignore
        if (this.manager.destroy) this.manager.destroy();
    }
  }

  private _formatTrack(lavalinkTrack: any): Track {
    const info = lavalinkTrack.info;
    return new Track(info.uri, {
      id: lavalinkTrack.track,
      title: info.title,
      artist: info.author,
      duration: Math.floor(info.length / 1000),
      thumbnail: info.artworkUrl,
      source: 'lavalink',
      metadata: {
        lavalinkTrack: lavalinkTrack.track,
        identifier: info.identifier
      }
    });
  }
}