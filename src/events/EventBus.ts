export type Listener = (data?: any) => void;

/**
 * Simple event emitter for handling events
 */
export class EventBus {
  private events: Record<string, Listener[]>;

  constructor() {
    this.events = {};
  }

  /**
   * Register an event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: string, callback: Listener): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Remove an event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  off(event: string, callback: Listener): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event
   * @param event - Event name
   * @param data - Data to pass to listeners
   */
  emit(event: string, data?: any): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   * @param event - Event name
   */
  removeAllListeners(event: string): void {
    delete this.events[event];
  }

  /**
   * Get all listeners for an event
   * @param event - Event name
   * @returns Array of listeners
   */
  listeners(event: string): Listener[] {
    return this.events[event] || [];
  }
}
