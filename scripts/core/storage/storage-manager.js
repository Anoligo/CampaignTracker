import { DataService } from '../../modules/data/services/data-service.js';

/**
 * Storage Manager
 * Delegates all storage operations to DataService for centralized state management.
 * Maintains backward compatibility with existing code while ensuring all state
 * is managed through the DataService.
 */
export class StorageManager {
    static #dataService = null;

    /**
     * Initialize the StorageManager with a DataService instance
     * @param {DataService} dataService - The DataService instance to use for persistence
     */
    static initialize(dataService) {
        if (!(dataService instanceof DataService)) {
            throw new Error('StorageManager must be initialized with a valid DataService instance');
        }
        this.#dataService = dataService;
    }

    /**
     * Save data to the data store
     * @param {string} key - The key under which to store the data
     * @param {any} data - The data to store
     * @returns {boolean} - True if successful, false otherwise
     */
    static save(key, data) {
        try {
            if (!this.#dataService) {
                console.warn('StorageManager not initialized with DataService');
                return false;
            }

            if (typeof key !== 'string' || key.trim() === '') {
                throw new Error('Invalid key provided');
            }
            
            // Update the state via DataService
            const update = { [key]: data };
            this.#dataService.updateState(update);
            return true;
        } catch (error) {
            console.error(`Error saving data (key: ${key}):`, error);
            return false;
        }
    }

    /**
     * Load data from the data store
     * @param {string} key - The key of the data to load
     * @returns {any|null} - The data or null if not found/invalid
     */
    static load(key) {
        try {
            if (!this.#dataService) {
                console.warn('StorageManager not initialized with DataService');
                return null;
            }

            if (typeof key !== 'string' || key.trim() === '') {
                console.error('Invalid key provided to StorageManager.load:', key);
                return null;
            }

            // Get the current state from DataService
            const state = this.#dataService.exportState() || {};
            
            if (!(key in state)) {
                console.log(`No data found for key: ${key}`);
                return null;
            }

            return state[key];
        } catch (error) {
            console.error(`Error loading data (key: ${key}):`, error);
            return null;
        }
    }

    /**
     * Remove an item from the data store
     * @param {string} key - The key of the item to remove
     * @returns {boolean} - True if successful, false otherwise
     */
    static remove(key) {
        try {
            if (!this.#dataService) {
                console.warn('StorageManager not initialized with DataService');
                return false;
            }

            if (typeof key !== 'string' || key.trim() === '') {
                console.error('Invalid key provided to StorageManager.remove:', key);
                return false;
            }

            // Update the state via DataService, setting the key to undefined will remove it
            const update = { [key]: undefined };
            this.#dataService.updateState(update);
            return true;
        } catch (error) {
            console.error(`Error removing data (key: ${key}):`, error);
            return false;
        }
    }

    /**
     * Clear all application data
     * @returns {boolean} - True if successful, false otherwise
     */
    static clearAll() {
        try {
            if (!this.#dataService) {
                console.warn('StorageManager not initialized with DataService');
                return false;
            }

            // Reset the entire state to an empty object
            this.#dataService.clearData();
            return true;
        } catch (error) {
            console.error('Error clearing data store:', error);
            return false;
        }
    }
}

export default StorageManager;
