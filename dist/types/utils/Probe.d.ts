/**
 * Audio probing utilities
 */
export class ProbeUtils {
    /**
     * Probe audio file/stream for basic info
     * @param {string|Buffer|ReadableStream} source - Audio source
     * @returns {Promise<Object>} Probe result
     */
    static probe(source: string | Buffer | ReadableStream): Promise<any>;
    /**
     * Check if source is a valid audio URL
     * @param {string} url - URL to check
     * @returns {boolean} Is valid audio URL
     */
    static isValidAudioUrl(url: string): boolean;
    /**
     * Get audio format from URL or buffer
     * @param {string|Buffer} source - Audio source
     * @returns {string|null} Audio format
     */
    static getFormat(source: string | Buffer): string | null;
}
