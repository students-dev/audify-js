import { IProvider, ITrack, IAudioEngine } from '../interfaces';
import { Track } from '../queue/Track';

export class YouTubeProvider implements IProvider {
  name = 'youtube';
  version = '1.0.0';
  private engine: IAudioEngine | null = null;

  async initialize(engine: IAudioEngine): Promise<void> {
    this.engine = engine;
  }

  async resolve(query: string): Promise<ITrack | ITrack[]> {
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
      const videoId = this.extractVideoId(query);
      if (!videoId) throw new Error('Invalid YouTube URL');

      return new Track(query, {
        title: `YouTube Video ${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        source: 'youtube',
        metadata: { videoId }
      });
    }
    
    // Search not implemented in this mock
    throw new Error('Search not implemented');
  }

  async play(track: ITrack): Promise<void> {
    if (!this.engine) throw new Error('Provider not initialized');
    
    // In a real app, resolve stream URL here (e.g. ytdl-core)
    // const streamUrl = await ytdl(track.url);
    // await this.engine.player.playStream(streamUrl);
    
    throw new Error('Stream URL extraction requires additional dependencies (ytdl-core)');
  }

  async stop(): Promise<void> {}

  destroy(): void {}

  private extractVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      return urlObj.searchParams.get('v');
    } catch {
      return null;
    }
  }
}
