import { Track } from '../queue/Track';
import { LavalinkManager } from 'lavalink-client';
export class LavalinkProvider {
    constructor(options = {}) {
        this.name = 'lavalink';
        this.version = '1.0.0';
        this.engine = null;
        this.manager = null;
        this.node = null;
        this.options = options;
    }
    async initialize(engine) {
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
            sendToShard: (guildId, payload) => {
                // Mock
            }
        });
        // @ts-ignore
        if (this.manager.connect)
            await this.manager.connect();
        // @ts-ignore
        this.node = this.manager.nodes ? this.manager.nodes.get('main') : this.manager.node;
    }
    async resolve(identifier) {
        if (!this.node)
            throw new Error('Lavalink not connected');
        const result = await this.node.rest.loadTracks(identifier);
        if (result.loadType === 'TRACK_LOADED') {
            return this._formatTrack(result.tracks[0]);
        }
        else if (result.loadType === 'PLAYLIST_LOADED' || result.loadType === 'SEARCH_RESULT') {
            return result.tracks.map((t) => this._formatTrack(t));
        }
        return [];
    }
    async play(track) {
        throw new Error('Lavalink play() requires guild/channel context. Use createPlayer() directly.');
    }
    createPlayer(guildId, channelId) {
        if (!this.manager)
            throw new Error('Not initialized');
        return this.manager.createPlayer({
            guildId,
            voiceChannelId: channelId
        });
    }
    async stop() {
        // Stop all?
    }
    destroy() {
        if (this.manager) {
            // @ts-ignore
            if (this.manager.destroy)
                this.manager.destroy();
        }
    }
    _formatTrack(lavalinkTrack) {
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
