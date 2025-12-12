import { AudioEngine } from '@students-dev/audify-js';

const engine = new AudioEngine();

engine.on('ready', async () => {
  console.log('Audio engine ready!');

  try {
    // Connect to Lavalink server
    await engine.connectLavalink({
      host: 'localhost',
      port: 2333,
      password: 'youshallnotpass'
    });
    console.log('Connected to Lavalink!');

    // Load a track from Lavalink
    const track = await engine.loadLavalinkTrack('ytsearch:hello adele');
    console.log('Loaded track:', track.title);

    // For Lavalink, you would typically use the Lavalink player
    // This example shows loading into queue, but actual playback
    // would be handled by Lavalink server
    console.log('Track added to queue. Use Lavalink player for playback.');

  } catch (error) {
    console.error('Error:', error);
  }
});

engine.on('trackAdd', (track) => {
  console.log('Track added to queue:', track.title);
});

engine.on('error', (error) => {
  console.error('Error:', error);
});

// Example of using Lavalink player directly (for Discord bots)
async function playWithLavalinkPlayer(guildId, channelId) {
  try {
    const lavalinkPlayer = engine.getLavalinkPlayer(guildId, channelId);

    // Load and play track
    const result = await lavalinkPlayer.search('hello adele', { requester: 'user' });
    if (result.tracks.length > 0) {
      await lavalinkPlayer.play(result.tracks[0]);
      console.log('Playing with Lavalink player:', result.tracks[0].info.title);
    }
  } catch (error) {
    console.error('Lavalink player error:', error);
  }
}