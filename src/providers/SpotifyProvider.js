import SpotifyWebApi from 'spotify-web-api-node';

/**
 * Spotify provider for client-side API integration
 */
export class SpotifyProvider {
  constructor(options = {}) {
    this.spotifyApi = new SpotifyWebApi({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      redirectUri: options.redirectUri,
      accessToken: options.accessToken,
      refreshToken: options.refreshToken
    });
  }

  /**
   * Set access token
   * @param {string} token - OAuth access token
   */
  setAccessToken(token) {
    this.spotifyApi.setAccessToken(token);
  }

  /**
   * Set refresh token
   * @param {string} token - OAuth refresh token
   */
  setRefreshToken(token) {
    this.spotifyApi.setRefreshToken(token);
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} Token response
   */
  async refreshAccessToken() {
    try {
      const data = await this.spotifyApi.refreshAccessToken();
      this.spotifyApi.setAccessToken(data.body.access_token);
      return data.body;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Search tracks
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of track objects
   */
  async searchTracks(query, options = {}) {
    try {
      const data = await this.spotifyApi.searchTracks(query, {
        limit: options.limit || 20,
        offset: options.offset || 0
      });

      return data.body.tracks.items.map(track => this._formatTrack(track));
    } catch (error) {
      throw new Error(`Failed to search tracks: ${error.message}`);
    }
  }

  /**
   * Get track by ID
   * @param {string} trackId - Spotify track ID
   * @returns {Promise<Object>} Track object
   */
  async getTrack(trackId) {
    try {
      const data = await this.spotifyApi.getTrack(trackId);
      return this._formatTrack(data.body);
    } catch (error) {
      throw new Error(`Failed to get track: ${error.message}`);
    }
  }

  /**
   * Get tracks by IDs
   * @param {Array<string>} trackIds - Array of Spotify track IDs
   * @returns {Promise<Array>} Array of track objects
   */
  async getTracks(trackIds) {
    try {
      const data = await this.spotifyApi.getTracks(trackIds);
      return data.body.tracks.map(track => this._formatTrack(track));
    } catch (error) {
      throw new Error(`Failed to get tracks: ${error.message}`);
    }
  }

  /**
   * Get audio features for track
   * @param {string} trackId - Spotify track ID
   * @returns {Promise<Object>} Audio features
   */
  async getAudioFeatures(trackId) {
    try {
      const data = await this.spotifyApi.getAudioFeaturesForTrack(trackId);
      return data.body;
    } catch (error) {
      throw new Error(`Failed to get audio features: ${error.message}`);
    }
  }

  /**
   * Format Spotify track to internal format
   * @param {Object} spotifyTrack - Spotify track object
   * @returns {Object} Formatted track
   * @private
   */
  _formatTrack(spotifyTrack) {
    return {
      id: spotifyTrack.id,
      title: spotifyTrack.name,
      artist: spotifyTrack.artists.map(artist => artist.name).join(', '),
      duration: Math.floor(spotifyTrack.duration_ms / 1000),
      thumbnail: spotifyTrack.album.images[0]?.url,
      url: spotifyTrack.external_urls.spotify,
      source: 'spotify',
      album: spotifyTrack.album.name,
      popularity: spotifyTrack.popularity,
      preview_url: spotifyTrack.preview_url,
      metadata: {
        spotifyId: spotifyTrack.id,
        artists: spotifyTrack.artists,
        album: spotifyTrack.album
      }
    };
  }
}