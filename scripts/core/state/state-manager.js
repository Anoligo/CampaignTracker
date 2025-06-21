import { DataService } from '../../modules/data/services/data-service.js';

/**
 * State Manager
 * Centralized state management with persistence and subscription support
 * Uses DataService for all persistence operations
 */
export class StateManager {
    static #dataService = null;

    /**
     * Initialize the StateManager with a DataService instance
     * @param {DataService} dataService - The DataService instance to use for persistence
     */
    static initialize(dataService) {
        if (!(dataService instanceof DataService)) {
            throw new Error('StateManager must be initialized with a valid DataService instance');
        }
        this.#dataService = dataService;
    }

    /**
     * Create a new StateManager instance
     * @param {Object} initialState - The initial state object
     * @param {string} storageKey - The key to use for state persistence (used as a namespace in DataService)
     */
    constructor(initialState = null, storageKey = 'appState') {
        if (!StateManager.#dataService) {
            throw new Error('StateManager must be initialized with DataService before use. Call StateManager.initialize(dataService)');
        }

        this._storageKey = storageKey;
        this._subscribers = new Set();
        this._isInitialized = false;
        
        // If initialState is provided, use it, otherwise it will be loaded from storage
        if (initialState !== null) {
            this._state = this._deepClone(initialState);
            this._isInitialized = true;
            this._saveState(); // Save the initial state to DataService
        } else {
            // Load state from DataService
            this._loadState();
        }
    }

    /**
     * Get the current state
     * @returns {Object} - The current state
     */
    get state() {
        return this._state;
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Function to call when state changes
     * @returns {Function} - Unsubscribe function
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Subscriber must be a function');
        }
        
        this._subscribers.add(callback);
        
        // Return unsubscribe function
        return () => {
            this._subscribers.delete(callback);
        };
    }

    /**
     * Update the state
     * @param {Object} updates - Object containing state updates
     * @param {boolean} [saveToStorage=true] - Whether to persist the update to storage
     */
    update(updates, saveToStorage = true) {
        try {
            if (!updates || typeof updates !== 'object') {
                console.warn('Invalid state update - expected an object');
                return;
            }

            console.log('Updating state with:', updates);
            
            // Create new state by merging updates
            const newState = { ...this._state };
            let hasChanges = false;

            // Apply updates
            for (const [key, value] of Object.entries(updates)) {
                if (key in this._state || key === 'quests') {  // Allow quests to be updated even if not in initial state
                    // For arrays, replace the entire array
                    if (Array.isArray(value)) {
                        newState[key] = [...value];
                        hasChanges = true;
                    }
                    // For objects (but not arrays or null), merge them
                    else if (value && typeof value === 'object') {
                        newState[key] = { ...(newState[key] || {}), ...value };
                        hasChanges = true;
                    }
                    // For primitive values, just copy them
                    else {
                        newState[key] = value;
                        hasChanges = true;
                    }
                    console.log(`Updated state key '${key}':`, newState[key]);
                } else {
                    console.warn(`Attempted to update non-existent state key: ${key}`);
                }
            }

            // Only update and notify if there are actual changes
            if (hasChanges) {
                console.log('New state:', newState);
                this._state = newState;
                this._notifySubscribers();
                
                if (saveToStorage) {
                    console.log('Saving state to storage...');
                    this._saveState();
                    console.log('State saved to storage');
                }
            } else {
                console.log('No changes to save');
            }
        } catch (error) {
            console.error('Error in StateManager.update:', error);
            throw error;
        }
    }

    /**
     * Reset the state to its initial values
     * @param {boolean} [clearStorage=false] - Whether to also clear the stored state
     */
    reset(clearStorage = false) {
        this._state = this._deepClone(this._getInitialState());
        
        if (clearStorage) {
            // Remove the state from DataService
            const update = { [this._storageKey]: undefined };
            StateManager.#dataService.updateState(update);
        } else {
            this._saveState();
        }
        
        this._notifySubscribers();
    }

    /**
     * Load state from DataService
     * @private
     */
    _loadState() {
        if (this._isInitialized) return;
        
        try {
            // Get the full state from DataService
            const fullState = StateManager.#dataService.exportState() || {};
            const savedState = fullState[this._storageKey];
            const initialState = this._getInitialState();
            
            if (savedState) {
                console.log('Loaded state from DataService:', savedState);
                
                // Create a new state object with default values from initialState
                const newState = { ...initialState };
                
                // Copy over all properties from savedState, preserving their structure
                for (const [key, value] of Object.entries(savedState)) {
                    if (value !== undefined) {
                        // For arrays, replace the entire array
                        if (Array.isArray(value)) {
                            newState[key] = [...value];
                        } 
                        // For objects (but not arrays or null), merge them
                        else if (value && typeof value === 'object') {
                            newState[key] = { ...(newState[key] || {}), ...value };
                        }
                        // For primitive values, just copy them
                        else {
                            newState[key] = value;
                        }
                    }
                }
                
                this._state = newState;
                console.log('Merged state:', this._state);
            } else {
                // No saved state, use initial state
                this._state = { ...initialState };
                console.log('No saved state, using initial state:', this._state);
                // Save the initial state to DataService
                this._saveState();
            }
            
            this._isInitialized = true;
        } catch (error) {
            console.error('Error loading state from DataService:', error);
            // Fall back to initial state
            this._state = this._getInitialState();
            this._isInitialized = true;
            // Save the initial state to DataService
            this._saveState();
        }
    }

    /**
     * Save current state to DataService
     * @private
     */
    _saveState() {
        try {
            if (!this._isInitialized) return;
            
            // Update the state in DataService using the storageKey as a namespace
            const update = { [this._storageKey]: this._state };
            StateManager.#dataService.updateState(update);
        } catch (error) {
            console.error('Error saving state to DataService:', error);
        }
    }

    /**
     * Notify all subscribers of state changes
     * @private
     */
    _notifySubscribers() {
        // Create a deep clone of the state to prevent external mutations
        const stateClone = this._deepClone(this._state);
        
        // Notify each subscriber
        for (const subscriber of this._subscribers) {
            try {
                subscriber(stateClone);
            } catch (error) {
                console.error('Error in state subscriber:', error);
            }
        }
    }

    /**
     * Deep clone an object
     * @param {any} obj - The object to clone
     * @returns {any} - The cloned object
     * @private
     */
    _deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Error cloning object:', error);
            // Return a shallow clone as fallback
            return Array.isArray(obj) ? [...obj] : { ...obj };
        }
    }

    /**
     * Deep merge two objects
     * @param {Object} target - The target object
     * @param {Object} source - The source object
     * @returns {Object} - The merged object
     * @private
     */
    _deepMerge(target, source) {
        if (!source || typeof source !== 'object') return target;
        
        // Handle arrays - replace the entire array instead of merging
        if (Array.isArray(source)) {
            return this._deepClone(source);
        }
        
        // Handle null or non-object target
        if (target === null || typeof target !== 'object') {
            return this._deepClone(source);
        }
        
        const result = { ...target };
        
        for (const [key, value] of Object.entries(source)) {
            // Skip undefined values in source
            if (value === undefined) continue;
            
            // If both values are objects, merge them recursively
            if (
                value && 
                typeof value === 'object' && 
                !Array.isArray(value) &&
                target[key] && 
                typeof target[key] === 'object' &&
                !Array.isArray(target[key])
            ) {
                result[key] = this._deepMerge(target[key], value);
            } else {
                // Otherwise, use the source value
                result[key] = value;
            }
        }
        
        return result;
    }

    /**
     * Get the initial state
     * @returns {Object} - The initial state
     * @private
     */
    _getInitialState() {
        // This should be overridden by subclasses
        return {};
    }
}

export default StateManager;
