import { FilterType } from '../constants';
/**
 * Audio filters and effects
 */
export declare class Filters {
    private audioContext;
    private filters;
    private enabled;
    constructor(audioContext: AudioContext);
    /**
     * Apply filter
     * @param type - Filter type
     * @param options - Filter options
     */
    apply(type: FilterType, options?: any): void;
    /**
     * Remove filter
     * @param type - Filter type
     */
    remove(type: FilterType): void;
    /**
     * Clear all filters
     */
    clear(): void;
    /**
     * Check if filter is enabled
     * @param type - Filter type
     * @returns Is enabled
     */
    isEnabled(type: FilterType): boolean;
    /**
     * Get enabled filters
     * @returns Enabled filter types
     */
    getEnabled(): Set<FilterType>;
    private applyBassBoost;
    private applyNightcore;
    private applyVaporwave;
    private apply8DRotate;
    private applyPitch;
    private applySpeed;
    private applyReverb;
    /**
     * Connect filters to audio node
     * @param input - Input node
     * @param output - Output node
     */
    connect(input: AudioNode, output: AudioNode): void;
}
