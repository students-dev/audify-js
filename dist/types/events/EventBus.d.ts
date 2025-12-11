/**
 * Simple event emitter for handling events
 */
export class EventBus {
    events: {};
    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event: string, callback: Function): void;
    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event: string, callback: Function): void;
    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Data to pass to listeners
     */
    emit(event: string, data: any): void;
    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    removeAllListeners(event: string): void;
    /**
     * Get all listeners for an event
     * @param {string} event - Event name
     * @returns {Function[]} Array of listeners
     */
    listeners(event: string): Function[];
}
