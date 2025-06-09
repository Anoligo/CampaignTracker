/**
 * Storage Manager
 * Handles all localStorage operations with error handling and type safety
 */

export class StorageManager {
    /**
     * Save data to localStorage
     * @param {string} key - The key under which to store the data
     * @param {any} data - The data to store (will be stringified)
     * @returns {boolean} - True if successful, false otherwise
     */
    static save(key, data) {
        try {
            if (typeof key !== 'string' || key.trim() === '') {
                throw new Error('Invalid key provided');
            }
            
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`Error saving to localStorage (key: ${key}):`, error);
            return false;
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - The key of the data to load
     * @returns {any|null} - The parsed data or null if not found/invalid
     */
    static load(key) {
        try {
            // Check if localStorage is available
            if (typeof localStorage === 'undefined' || !localStorage) {
                console.warn('localStorage is not available in this environment');
                return null;
            }

            // Validate key
            if (typeof key !== 'string' || key.trim() === '') {
                console.error('Invalid key provided to StorageManager.load:', key);
                return null;
            }

            // Get and validate data
            const data = localStorage.getItem(key);
            if (data === null || data === undefined) {
                console.log(`No data found in localStorage for key: ${key}`);
                return null;
            }

            if (typeof data !== 'string') {
                console.error(`Unexpected data type in localStorage for key ${key}:`, typeof data);
                return null;
            }

            const trimmedData = data.trim();
            if (trimmedData === '') {
                console.log(`Empty data found in localStorage for key: ${key}`);
                return null;
            }

            // Parse and return the data
            return JSON.parse(trimmedData);
        } catch (error) {
            console.error(`Error loading from localStorage (key: ${key}):`, error);
            return null;
        }
    }

    /**
     * Remove an item from localStorage
     * @param {string} key - The key of the item to remove
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item from localStorage (key: ${key}):`, error);
        }
    }

    /**
     * Clear all application data from localStorage
     */
    static clearAll() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}

export default StorageManager;
