/**
 * Audio filters and effects
 */
export class Filters {
    constructor(audioContext: any);
    audioContext: any;
    filters: Map<any, any>;
    enabled: Set<any>;
    /**
     * Apply filter
     * @param {string} type - Filter type
     * @param {Object} options - Filter options
     */
    apply(type: string, options?: any): void;
    /**
     * Remove filter
     * @param {string} type - Filter type
     */
    remove(type: string): void;
    /**
     * Clear all filters
     */
    clear(): void;
    /**
     * Check if filter is enabled
     * @param {string} type - Filter type
     * @returns {boolean} Is enabled
     */
    isEnabled(type: string): boolean;
    /**
     * Get enabled filters
     * @returns {Set} Enabled filter types
     */
    getEnabled(): Set<any>;
    applyBassBoost(options?: {}): void;
    applyNightcore(options?: {}): void;
    applyVaporwave(options?: {}): void;
    apply8DRotate(options?: {}): void;
    applyPitch(options?: {}): void;
    applySpeed(options?: {}): void;
    applyReverb(options?: {}): void;
    /**
     * Connect filters to audio node
     * @param {AudioNode} input - Input node
     * @param {AudioNode} output - Output node
     */
    connect(input: AudioNode, output: AudioNode): void;
}
