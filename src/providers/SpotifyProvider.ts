import { IProvider, ITrack, IAudioEngine } from '../interfaces';
import { Track } from '../queue/Track';
import SpotifyWebApi from 'spotify-web-api-node';

export class SpotifyProvider implements IProvider {
  name = 'spotify';
  version = '1.0.0';
  private engine: IAudioEngine | null = null;
  private spotifyApi: SpotifyWebApi;

  constructor(options: any = {}) {
    this.spotifyApi = new SpotifyWebApi({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      redirectUri: options.redirectUri,
      accessToken: options.accessToken,
      refreshToken: options.refreshToken
    });
  }

  async initialize(engine: IAudioEngine): Promise<void> {
    this.engine = engine;
  }

  async resolve(query: string): Promise<ITrack | ITrack[]> {
    // Check if query is ID or URL or Search
    if (query.includes('spotify.com/track/')) {
       const id = query.split('track/')[1].split('?')[0];
       const data = await this.spotifyApi.getTrack(id);
       return this._formatTrack(data.body);
    }

    // Default to search
    const data = await this.spotifyApi.searchTracks(query);
    return data.body.tracks?.items.map(t => this._formatTrack(t)) || [];
  }

  async play(track: ITrack): Promise<void> {
    if (!this.engine) throw new Error('Provider not initialized');
    
    // Spotify playback usually requires Web SDK or resolving to another source
    // Here we can throw or try to resolve if Preview URL is available
    
    if (track.metadata.preview_url) {
       await (this.engine.player as any).playStream({ ...track, url: track.metadata.preview_url });
    } else {
       throw new Error('Spotify full playback not supported in this provider version (preview only)');
    }
  }

  async stop(): Promise<void> {}

  destroy(): void {}

  private _formatTrack(spotifyTrack: any): Track {
    return new Track(spotifyTrack.external_urls.spotify, {
      id: spotifyTrack.id,
      title: spotifyTrack.name,
      artist: spotifyTrack.artists.map((a: any) => a.name).join(', '),
      duration: Math.floor(spotifyTrack.duration_ms / 1000),
      thumbnail: spotifyTrack.album.images[0]?.url,
      source: 'spotify',
      metadata: {
        spotifyId: spotifyTrack.id,
        preview_url: spotifyTrack.preview_url,
        popularity: spotifyTrack.popularity
      }
    });
  }
}
