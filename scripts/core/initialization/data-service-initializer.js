import { DataService } from '../../modules/data/services/data-service.js';
import { StorageManager } from '../storage/storage-manager.js';
import { StateManager } from '../state/state-manager.js';

/**
 * Manages the initialization of DataService and related services
 */
class DataServiceInitializer {
    static #initialized = false;
    static #dataService = null;

    /**
     * Initialize the DataService and related services
     * @returns {Promise<DataService>} The initialized DataService instance
     */
    static async initialize() {
        if (this.#initialized) {
            return this.#dataService;
        }

        try {
            console.log('Initializing DataService and related services...');
            
            // Create DataService instance
            this.#dataService = new DataService();
            
            // Initialize StorageManager with DataService
            StorageManager.initialize(this.#dataService);
            
            // Initialize StateManager with DataService
            StateManager.initialize(this.#dataService);
            
            console.log('DataService and related services initialized successfully');
            this.#initialized = true;
            
            return this.#dataService;
        } catch (error) {
            console.error('Failed to initialize DataService:', error);
            throw error;
        }
    }

    /**
     * Get the DataService instance
     * @returns {DataService} The DataService instance
     * @throws {Error} If DataService is not initialized
     */
    static getDataService() {
        if (!this.#initialized || !this.#dataService) {
            throw new Error('DataService has not been initialized. Call DataServiceInitializer.initialize() first.');
        }
        return this.#dataService;
    }

    /**
     * Check if DataService is initialized
     * @returns {boolean} True if initialized, false otherwise
     */
    static isInitialized() {
        return this.#initialized;
    }
}

export { DataServiceInitializer };

export default DataServiceInitializer;
