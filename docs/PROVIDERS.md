# Providers System

The Provider system allows `audify-js` to handle various audio sources uniformly.

## The Interface

All providers must implement the `IProvider` interface:

```typescript
interface IProvider {
  name: string;
  version: string;
  initialize(engine: IAudioEngine): Promise<void>;
  resolve(query: string): Promise<ITrack | ITrack[]>;
  play(track: ITrack): Promise<void>;
  stop(): Promise<void>;
  destroy(): void;
}
```

## Built-in Providers

### LocalProvider
-   **Name**: `local`
-   **Usage**: Handles local file paths (Node.js) or direct file URLs.
-   **Resolves**: `file://` paths or simple strings.

### YouTubeProvider
-   **Name**: `youtube`
-   **Usage**: Handles YouTube URLs.
-   **Note**: In a production environment, this requires integration with a library like `ytdl-core` to extract stream URLs. The default implementation acts as a metadata resolver.

### SpotifyProvider
-   **Name**: `spotify`
-   **Usage**: Handles Spotify URLs and IDs.
-   **Requires**: Client ID and Secret passed during initialization.

### LavalinkProvider
-   **Name**: `lavalink`
-   **Usage**: Connects to a Lavalink node for high-performance audio (common in Discord bots).

## Custom Providers

You can register your own provider:

```typescript
class MyRadioProvider implements IProvider {
    name = 'myradio';
    version = '1.0.0';
    // ... implement methods
}

engine.registerProvider(new MyRadioProvider());
```
