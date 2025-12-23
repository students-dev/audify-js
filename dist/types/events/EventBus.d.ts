export type Listener = (data?: any) => void;
/**
 * Simple event emitter for handling events
 */
export declare class EventBus {
    private events;
    constructor();
    /**
     * Register an event listener
     * @param event - Event name
     * @param callback - Callback function
     */
    on(event: string, callback: Listener): void;
    /**
     * Remove an event listener
     * @param event - Event name
     * @param callback - Callback function
     */
    off(event: string, callback: Listener): void;
    /**
     * Emit an event
     * @param event - Event name
     * @param data - Data to pass to listeners
     */
    emit(event: string, data?: any): void;
    /**
     * Remove all listeners for an event
     * @param event - Event name
     */
    removeAllListeners(event: string): void;
    /**
     * Get all listeners for an event
     * @param event - Event name
     * @returns Array of listeners
     */
    listeners(event: string): Listener[];
}
