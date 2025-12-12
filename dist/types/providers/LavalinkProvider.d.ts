/**
 * Lavalink provider for connecting to Lavalink server
 */
export class LavalinkProvider {
    constructor(options?: {});
    host: any;
    port: any;
    password: any;
    secure: any;
    manager: LavalinkManager<import("lavalink-client").Player>;
    node: any;
    isConnected: boolean;
    /**
     * Connect to Lavalink server
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Lavalink server
     */
    disconnect(): void;
    /**
     * Create a player for a guild/channel
     * @param {string} guildId - Guild ID
     * @param {string} channelId - Voice channel ID
     * @returns {Object} Player instance
     */
    createPlayer(guildId: string, channelId: string): any;
    /**
     * Load track from Lavalink
     * @param {string} identifier - Track identifier (URL or search query)
     * @returns {Promise<Object>} Track info
     */
    loadTrack(identifier: string): Promise<any>;
    /**
     * Format Lavalink track to internal format
     * @param {Object} lavalinkTrack - Lavalink track object
     * @returns {Object} Formatted track
     * @private
     */
    private _formatTrack;
    /**
     * Get node stats
     * @returns {Promise<Object>} Node stats
     */
    getStats(): Promise<any>;
}
import { LavalinkManager } from 'lavalink-client';
