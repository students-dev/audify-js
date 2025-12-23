# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-12-23

### Major Changes
- **TypeScript Migration**: Complete codebase rewrite in TypeScript for better type safety and developer experience.
- **Provider Registry**: Standardized `IProvider` interface and registry system for managing audio sources (Local, YouTube, Spotify, Lavalink).
- **Core Refactor**: 
  - `AudioEngine` is now the central orchestrator using `Player` for low-level audio context management.
  - `Queue` class refactored for stricter typing and better loop management.
  - Introduced `MockAudioContext` for robust Node.js support without external binary dependencies.

### Added
- **Docs**: New documentation structure in `docs/` covering Architecture, Providers, and Plugins.
- **Examples**: Added `examples/integrations.js` and `examples/plugin-advanced.js`.
- **Interfaces**: Public `ITrack`, `IProvider`, `IPlugin` interfaces exported for developers.

### Fixed
- Fixed issues with Node.js environment detection causing crashes when `AudioContext` is missing.
- Improved error handling in `PluginManager` to prevent plugins from crashing the main engine.
- Fixed race conditions in `Queue` event emissions.

## [1.1.0] - 2025-12-12

### Added
- **Spotify Integration**: Added `SpotifyProvider` for client-side Spotify Web API access
- **Lavalink Integration**: Added `LavalinkProvider` for Lavalink server connections

### Changed
- **Dependencies Updated**: Rollup, Jest, and ESLint versions bumped.

## [1.0.0] - 2025-01-01

### Added
- Initial release
- Core audio engine with Web Audio API abstraction
- Queue management
- Audio filters
- Plugin system
