/**
 * Audio probing utilities
 */
export declare class ProbeUtils {
    /**
     * Probe audio file/stream for basic info
     * @param source - Audio source
     * @returns Probe result
     */
    static probe(source: string | Buffer | ReadableStream): Promise<any>;
    /**
     * Check if source is a valid audio URL
     * @param url - URL to check
     * @returns Is valid audio URL
     */
    static isValidAudioUrl(url: string): boolean;
    /**
     * Get audio format from URL or buffer
     * @param source - Audio source
     * @returns Audio format
     */
    static getFormat(source: string | Buffer): string | null;
}
