import { ITrack } from '../interfaces';
/**
 * Represents an audio track
 */
export declare class Track implements ITrack {
    id: string;
    url: string;
    title: string;
    artist?: string;
    duration?: number;
    thumbnail?: string;
    source?: string;
    metadata: Record<string, any>;
    /**
     * @param url - Track URL or file path
     * @param options - Additional options
     */
    constructor(url: string, options?: Partial<ITrack>);
    /**
     * Get track info
     * @returns Track information
     */
    getInfo(): ITrack;
    /**
     * Update track metadata
     * @param metadata - New metadata
     */
    updateMetadata(metadata: Partial<ITrack>): void;
    /**
     * Check if track is valid
     * @returns Is valid
     */
    isValid(): boolean;
}
