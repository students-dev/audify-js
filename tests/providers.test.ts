import { AudioEngine, SpotifyProvider, LavalinkProvider } from '../src/index';

// Mock AudioContext
(global as any).AudioContext = class {
  createGain() { return { connect: () => {}, gain: { value: 0 } }; }
  createBiquadFilter() { return { connect: () => {}, frequency: { value: 0 }, gain: { value: 0 } }; }
  createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, onended: null }; }
  decodeAudioData() { return Promise.resolve({ duration: 0 }); }
  createPanner() { return { connect: () => {} }; }
  createConvolver() { return { connect: () => {} }; }
  suspend() {}
  resume() {}
  close() {}
  get state() { return 'suspended'; }
};

// Mock the external dependencies
jest.mock('spotify-web-api-node', () => {
  return jest.fn().mockImplementation(() => ({
    setAccessToken: jest.fn(),
    setRefreshToken: jest.fn(),
    refreshAccessToken: jest.fn().mockResolvedValue({ body: { access_token: 'new_token' } }),
    searchTracks: jest.fn().mockResolvedValue({ body: { tracks: { items: [] } } }),
    getTrack: jest.fn().mockResolvedValue({ body: {} }),
    getTracks: jest.fn().mockResolvedValue({ body: { tracks: [] } }),
    getAudioFeaturesForTrack: jest.fn().mockResolvedValue({ body: {} }),
    getAccessToken: jest.fn().mockReturnValue('test_token')
  }));
});

jest.mock('lavalink-client', () => ({
  LavalinkManager: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    nodes: new Map([['main', { rest: { loadTracks: jest.fn(), getStats: jest.fn() } }]])
  }))
}));

describe('Spotify Integration', () => {
  let engine: AudioEngine;
  let spotifyProvider: SpotifyProvider;

  beforeEach(() => {
    engine = new AudioEngine();
    spotifyProvider = new SpotifyProvider({
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret'
    });
  });

  test('should initialize Spotify provider via options', async () => {
    const engineWithSpotify = new AudioEngine({
      spotify: {
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret'
      }
    });
    // Wait for async init if needed, though init is async in constructor it runs without await.
    // Ideally we should wait for READY event or check registry.
    // Provider registration is async.
    await new Promise(resolve => setTimeout(resolve, 50)); 
    expect(engineWithSpotify.getProvider('spotify')).toBeDefined();
  });

  test('SpotifyProvider should format Spotify track correctly', () => {
    const mockSpotifyTrack = {
      id: 'test_id',
      name: 'Test Song',
      artists: [{ name: 'Test Artist' }],
      duration_ms: 180000,
      album: {
        images: [{ url: 'test_image.jpg' }],
        name: 'Test Album'
      },
      external_urls: { spotify: 'spotify_url' },
      popularity: 80,
      preview_url: 'preview.mp3'
    };

    // Access private method for testing? Or allow public formatting?
    // It's private in TS implementation. 
    // We can cast to any to test private method or test resolve which uses it.
    const formatted = (spotifyProvider as any)._formatTrack(mockSpotifyTrack);
    expect(formatted).toHaveProperty('title', 'Test Song');
    expect(formatted).toHaveProperty('artist', 'Test Artist');
    expect(formatted).toHaveProperty('duration', 180);
    expect(formatted).toHaveProperty('source', 'spotify');
  });
});

describe('Lavalink Integration', () => {
  let lavalinkProvider: LavalinkProvider;

  beforeEach(() => {
    lavalinkProvider = new LavalinkProvider({
      host: 'localhost',
      port: 2333,
      password: 'test_password'
    });
  });

  test('should create LavalinkProvider instance', () => {
    expect(lavalinkProvider).toBeDefined();
    // Options are private, can't check directly easily without any cast
    expect((lavalinkProvider as any).options.host).toBe('localhost');
  });

  test('should format Lavalink track correctly', () => {
    const mockLavalinkTrack = {
      track: 'encoded_track_data',
      info: {
        title: 'Test Song',
        author: 'Test Artist',
        length: 180000,
        artworkUrl: 'test_image.jpg',
        uri: 'test_uri',
        isrc: 'test_isrc',
        sourceName: 'youtube',
        identifier: 'test_id'
      }
    };

    const formatted = (lavalinkProvider as any)._formatTrack(mockLavalinkTrack);
    expect(formatted).toHaveProperty('title', 'Test Song');
    expect(formatted).toHaveProperty('artist', 'Test Artist');
    expect(formatted).toHaveProperty('duration', 180);
    expect(formatted).toHaveProperty('source', 'lavalink');
  });
});
