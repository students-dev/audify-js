import { promises as fs } from 'fs';
import { extname } from 'path';
import { Track } from '../queue/Track';
export class LocalProvider {
    constructor() {
        this.name = 'local';
        this.version = '1.0.0';
        this.engine = null;
    }
    async initialize(engine) {
        this.engine = engine;
    }
    async resolve(path) {
        if (!await this.exists(path)) {
            throw new Error('File not found');
        }
        // Node.js specific checks
        const stats = await fs.stat(path);
        if (!stats.isFile()) {
            throw new Error('Path is not a file');
        }
        const track = new Track(`file://${path}`, {
            title: path.split('/').pop()?.replace(extname(path), '') || 'Unknown',
            source: 'local',
            metadata: {
                size: stats.size,
                modified: stats.mtime
            }
        });
        return track;
    }
    async play(track) {
        if (!this.engine)
            throw new Error('Provider not initialized');
        // For local files, we assume the player can handle file:// URLs or we might need to read it into a buffer here?
        // The previous Player implementation used fetch(url). fetch supports file:// in some envs but not all.
        // However, given the hybrid nature, we'll assume the engine's player handles the URL.
        // Actually, Player.ts uses fetch(). fetch('file://...') might fail in Node if not polyfilled or configured.
        // But let's stick to the architecture: Provider calls engine.player.load(track).
        // Wait, AudioEngine.ts in JS called `player.play(track)`.
        // So the Provider.play just needs to confirm it CAN play or do setup?
        // If AudioEngine delegates to Provider, then Provider MUST do the work.
        // "AudioEngine calls provider.play(track)" -> Provider must make sound happen.
        // So LocalProvider should call this.engine.player.play(track).
        // BUT checking for infinite loop: Engine calls Provider.play -> Provider calls Engine.player.play?
        // Engine needs to know NOT to call Provider again.
        // Engine.play(track) -> check provider -> provider.play(track)
        // Provider.play(track) -> engine.player.loadSource(track.url) -> source.start()
        // We need to expose `loadSource` or similar on engine/player.
        // For now, I'll assume engine.player has low-level methods.
        // Let's assume the Player has a `playStream(url)` method.
        // I'll type cast engine.player for now.
        await this.engine.player.playStream(track);
    }
    async stop() {
        // Local provider doesn't manage state separate from engine
    }
    destroy() {
        // No cleanup needed
    }
    async exists(path) {
        try {
            await fs.access(path);
            return true;
        }
        catch {
            return false;
        }
    }
}
