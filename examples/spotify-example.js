import { AudioEngine } from '@students-dev/audify-js';

const engine = new AudioEngine();

// Initialize Spotify provider
engine.initSpotify({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'http://localhost:3000/callback'
});

engine.on('ready', async () => {
  console.log('Audio engine ready!');

  try {
    // Search for tracks
    const results = await engine.searchSpotifyTracks('hello adele', {
      token: 'your_access_token',
      limit: 5
    });
    console.log('Search results:', results);

    // Load a specific track
    const track = await engine.loadSpotifyTrack('4uLU6hMCjMI75M1A2tKUQC', {
      token: 'your_access_token'
    });
    console.log('Loaded track:', track.title);

    // Play the track
    await engine.play(track);

  } catch (error) {
    console.error('Error:', error);
  }
});

engine.on('trackStart', (track) => {
  console.log('Now playing:', track.title, 'by', track.artist);
});

engine.on('error', (error) => {
  console.error('Playback error:', error);
});