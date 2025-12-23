import { AudioEngine, SpotifyProvider, LocalProvider } from '../dist/esm/index.js';

// This example demonstrates how to configure multiple providers
// Note: Spotify requires valid credentials to work

const engine = new AudioEngine({
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID || 'dummy_id',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || 'dummy_secret'
    }
});

engine.eventBus.on('ready', async () => {
    console.log('🎵 Engine Ready');
    
    // Check registered providers
    const providers = engine.providers.getAll();
    console.log('Registered Providers:', providers.map(p => p.name).join(', '));

    // 1. Play from Local Provider (Implicit)
    // engine.play('./audio/song.mp3');

    // 2. Play from Spotify (if configured)
    if (process.env.SPOTIFY_CLIENT_ID) {
        console.log('Attempting to resolve Spotify track...');
        try {
            await engine.play('https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC');
        } catch (e) {
            console.error('Spotify Playback Failed (Expected without valid tokens):', e.message);
        }
    } else {
        console.log('Skipping Spotify playback (No credentials provided)');
    }
    
    // 3. Play from YouTube (Mock Provider)
    console.log('Resolving YouTube URL...');
    await engine.play('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

engine.eventBus.on('trackStart', (track) => {
    console.log(`▶️ Playing [${track.source}]: ${track.title}`);
    // For demo purposes, stop after start
    setTimeout(() => {
        console.log('Demo completed.');
        engine.destroy();
        process.exit(0);
    }, 1000);
});

engine.eventBus.on('error', (err) => {
    console.error('Error:', err.message);
});
