import { StateValidator } from '../validators/state-validator.js';
import { INITIAL_STATE } from '../schemas/state-schema.js';

/**
 * DataService handles all data operations including CRUD and persistence
 */
export class DataService {
    constructor() {
        this._state = null;
        this._observers = new Set();
        this._loadData();
    }
    
    /**
     * Get the current application state
     * @returns {Object} The current state
     */
    get appState() {
        return this._state;
    }
    
    /**
     * Load data from localStorage or initialize with default state
     */
    _loadData() {
        try {
            const savedState = localStorage.getItem('ironMeridianState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                const errors = StateValidator.validateState(parsedState);
                
                if (errors.length === 0) {
                    this._state = parsedState;
                    return;
                }
                console.warn('Invalid saved state, using default state', errors);
            }
            
            // Initialize with default state if no valid saved state
            this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
            this._saveData();
        } catch (error) {
            console.error('Error loading data:', error);
            this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
        }
    }
    
    /**
     * Save the current state to localStorage
     */
    _saveData() {
        try {
            localStorage.setItem('ironMeridianState', JSON.stringify(this._state));
            this._notifyObservers();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    /**
     * Notify all observers of state changes
     */
    _notifyObservers() {
        for (const observer of this._observers) {
            try {
                observer(this._state);
            } catch (error) {
                console.error('Error notifying observer:', error);
            }
        }
    }
    
    /**
     * Subscribe to state changes
     * @param {Function} observer - Callback function that receives state updates
     * @returns {Function} Unsubscribe function
     */
    subscribe(observer) {
        if (typeof observer !== 'function') {
            throw new Error('Observer must be a function');
        }
        
        this._observers.add(observer);
        
        // Send current state to new subscriber
        observer(this._state);
        
        // Return unsubscribe function
        return () => this._observers.delete(observer);
    }
    
    // Generic CRUD operations for different entity types
    
    /**
     * Add a new entity to a collection
     * @param {string} collection - The collection name (e.g., 'quests', 'notes')
     * @param {Object} entity - The entity to add
     * @returns {Object} The added entity with generated ID
     */
    add(collection, entity) {
        if (!this._state[collection]) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        const newEntity = {
            ...entity,
            id: entity.id || this._generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this._state[collection].push(newEntity);
        this._saveData();
        
        return newEntity;
    }
    
    /**
     * Get an entity by ID from a collection
     * @param {string} collection - The collection name
     * @param {string} id - The entity ID
     * @returns {Object|null} The found entity or null if not found
     */
    get(collection, id) {
        if (!this._state[collection]) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        return this._state[collection].find(item => item.id === id) || null;
    }
    
    /**
     * Update an entity in a collection
     * @param {string} collection - The collection name
     * @param {string} id - The entity ID
     * @param {Object} updates - The updates to apply
     * @returns {Object|null} The updated entity or null if not found
     */
    update(collection, id, updates) {
        if (!this._state[collection]) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        const index = this._state[collection].findIndex(item => item.id === id);
        if (index === -1) return null;
        
        const updatedEntity = {
            ...this._state[collection][index],
            ...updates,
            id, // Ensure ID doesn't get changed
            updatedAt: new Date().toISOString()
        };
        
        this._state[collection][index] = updatedEntity;
        this._saveData();
        
        return updatedEntity;
    }
    
    /**
     * Delete an entity from a collection
     * @param {string} collection - The collection name
     * @param {string} id - The entity ID
     * @returns {boolean} True if deleted, false if not found
     */
    delete(collection, id) {
        if (!this._state[collection]) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        const initialLength = this._state[collection].length;
        this._state[collection] = this._state[collection].filter(item => item.id !== id);
        
        if (this._state[collection].length !== initialLength) {
            this._saveData();
            return true;
        }
        
        return false;
    }
    
    /**
     * Get all entities from a collection
     * @param {string} collection - The collection name
     * @returns {Array} Array of entities
     */
    getAll(collection) {
        if (!this._state[collection]) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        return [...this._state[collection]];
    }
    
    /**
     * Find entities in a collection matching a predicate
     * @param {string} collection - The collection name
     * @param {Function} predicate - The predicate function
     * @returns {Array} Array of matching entities
     */
    find(collection, predicate) {
        if (!this._state[collection]) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        return this._state[collection].filter(predicate);
    }
    
    /**
     * Generate a unique ID
     * @returns {string} A unique ID
     */
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Data export/import
    
    /**
     * Export the current state as a JSON string
     * @returns {string} JSON string of the current state
     */
    exportData() {
        return JSON.stringify(this._state, null, 2);
    }
    
    /**
     * Import data from a JSON string
     * @param {string} jsonData - The JSON string to import
     * @throws {Error} If the data is invalid
     */
    importData(jsonData) {
        try {
            const parsedData = JSON.parse(jsonData);
            const errors = StateValidator.validateState(parsedData);
            
            if (errors.length > 0) {
                throw new Error(`Invalid data: ${errors.join(', ')}`);
            }
            
            this._state = parsedData;
            this._saveData();
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }
    
    /**
     * Clear all data and reset to initial state
     */
    clearData() {
        this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
        this._saveData();
    }
}
