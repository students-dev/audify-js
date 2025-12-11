/**
 * Local file provider for Node.js
 */
export class LocalProvider {
    /**
     * Check if path is a valid local audio file
     * @param {string} path - File path
     * @returns {boolean} Is valid audio file
     */
    static isValidPath(path: string): boolean;
    /**
     * Get track info from local file
     * @param {string} path - File path
     * @returns {Promise<Object>} Track info
     */
    static getInfo(path: string): Promise<any>;
    /**
     * Check if file exists
     * @param {string} path - File path
     * @returns {Promise<boolean>} File exists
     */
    static exists(path: string): Promise<boolean>;
}
