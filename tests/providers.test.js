const { AudioEngine, SpotifyProvider, LavalinkProvider } = require('../dist/cjs/index.js');

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
    connect: jest.fn().mockResolvedValue(),
    nodes: new Map([['main', { rest: { loadTracks: jest.fn(), getStats: jest.fn() } }]])
  }))
}));

describe('Spotify Integration', () => {
  let engine;
  let spotifyProvider;

  beforeEach(() => {
    engine = new AudioEngine();
    spotifyProvider = new SpotifyProvider({
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret'
    });
  });

  test('should initialize Spotify provider', () => {
    engine.initSpotify({
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret'
    });
    expect(engine.spotifyProvider).toBeDefined();
  });

  test('SpotifyProvider should set access token', () => {
    spotifyProvider.setAccessToken('test_token');
    expect(spotifyProvider.spotifyApi.getAccessToken()).toBe('test_token');
  });

  test('should format Spotify track correctly', () => {
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

    const formatted = spotifyProvider._formatTrack(mockSpotifyTrack);
    expect(formatted).toHaveProperty('title', 'Test Song');
    expect(formatted).toHaveProperty('artist', 'Test Artist');
    expect(formatted).toHaveProperty('duration', 180);
    expect(formatted).toHaveProperty('source', 'spotify');
  });
});

describe('Lavalink Integration', () => {
  let engine;
  let lavalinkProvider;

  beforeEach(() => {
    engine = new AudioEngine();
    lavalinkProvider = new LavalinkProvider({
      host: 'localhost',
      port: 2333,
      password: 'test_password'
    });
  });

  test('should create LavalinkProvider instance', () => {
    expect(lavalinkProvider).toBeDefined();
    expect(lavalinkProvider.host).toBe('localhost');
    expect(lavalinkProvider.port).toBe(2333);
    expect(lavalinkProvider.password).toBe('test_password');
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
        sourceName: 'youtube'
      }
    };

    const formatted = lavalinkProvider._formatTrack(mockLavalinkTrack);
    expect(formatted).toHaveProperty('title', 'Test Song');
    expect(formatted).toHaveProperty('artist', 'Test Artist');
    expect(formatted).toHaveProperty('duration', 180);
    expect(formatted).toHaveProperty('source', 'lavalink');
  });
});

describe('AudioEngine with Providers', () => {
  let engine;

  beforeEach(() => {
    engine = new AudioEngine();
  });

  test('should have provider properties', () => {
    expect(engine.spotifyProvider).toBeNull();
    expect(engine.lavalinkProvider).toBeNull();
  });

  test('should initialize providers', () => {
    engine.initSpotify({});
    expect(engine.spotifyProvider).toBeDefined();

    // Note: Lavalink connection would require actual server
    // engine.connectLavalink({}) would be tested in integration tests
  });
});