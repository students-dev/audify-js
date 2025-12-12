# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-12

### Added
- **Spotify Integration**: Added `SpotifyProvider` for client-side Spotify Web API access
  - Search tracks with `searchSpotifyTracks()`
  - Fetch track metadata with `loadSpotifyTrack()`
  - OAuth token support (authentication handled by user)
- **Lavalink Integration**: Added `LavalinkProvider` for Lavalink server connections
  - WebSocket connection to Lavalink servers
  - Load tracks from Lavalink with `loadLavalinkTrack()`
  - Create Lavalink players for Discord bots with `getLavalinkPlayer()`
- **New Examples**: Added `spotify-example.js` and `lavalink-example.js`
- **New Tests**: Added unit tests for Spotify and Lavalink providers in `tests/providers.test.js`

### Changed
- **Dependencies Updated**:
  - `@rollup/plugin-node-resolve`: ^15.0.0 → ^15.2.3
  - `@rollup/plugin-commonjs`: ^25.0.0 → ^25.0.7
  - `rollup`: ^4.0.0 → ^4.9.6
  - `rollup-plugin-dts`: ^6.0.0 → ^6.1.0
  - `typescript`: ^5.0.0 → ^5.3.3
  - `jest`: ^29.0.0 → ^29.7.0
  - `eslint`: ^8.0.0 → ^8.56.0
- **Build Configuration**: Made `spotify-web-api-node` and `lavalink-client` external dependencies in Rollup config
- **ESLint Configuration**: Simplified config to work with JavaScript files
- **Jest Configuration**: Updated for better ESM support and external dependency mocking

### Fixed
- **AudioEngine**: Added missing `LOOP_MODES` import
- **TypeScript Declarations**: Updated `.d.ts` files for new providers and methods
- **README**: Updated with new features, API documentation, and examples

### Dependencies
- **Added**:
  - `spotify-web-api-node`: ^5.0.1
  - `lavalink-client`: ^2.5.1

## [1.0.0] - 2025-01-01

### Added
- Initial release
- Core audio engine with Web Audio API abstraction
- Queue management (add, remove, shuffle, jump, loop modes)
- Audio filters (bassboost, nightcore, vaporwave, 8D, pitch, speed, reverb)
- Plugin system with lifecycle hooks
- Event-driven architecture
- Multi-source support (Local files, YouTube, SoundCloud)
- TypeScript declarations
- ESM/CJS builds
- Browser and Node.js compatibility