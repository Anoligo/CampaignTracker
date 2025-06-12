// Use relative path so the module works on GitHub Pages when hosted in a
// subdirectory. Absolute paths break because the site root is not the domain
// root when served from a project page.
import { DataService } from '../../modules/data/services/data-service.js';

/**
 * DataServiceAdapter
 * 
 * This adapter bridges the old state management system with the new DataService.
 * It provides a compatible interface for the rest of the application while using
 * the new DataService under the hood.
 */
export class DataServiceAdapter {
    /**
     * Create a new DataServiceAdapter instance
     * @param {DataService} [dataService] - The DataService instance to use (optional, will create one if not provided)
     */
    constructor(dataService) {
        this.dataService = dataService || new DataService();
        
        // Ensure the data service is properly initialized
        this._ensureInitialized();
        
        this._subscribers = new Set();
        this._isInitialized = true;
    }

    /**
     * Ensure the data service is properly initialized
     * @private
     */
    _ensureInitialized() {
        // This method can be overridden by subclasses to perform additional initialization
        // For example, to set up default UI state or settings
    }

    /**
     * Get the current state
     * @returns {Object} The current application state
     */
    get state() {
        // Return a deep clone of the state to prevent direct mutations
        return this.dataService.exportState();
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Function to call when state changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Subscriber must be a function');
        }
        
        // Add the callback to our subscribers
        this._subscribers.add(callback);
        
        // Subscribe to the data service
        const unsubscribe = this.dataService.subscribe((state) => {
            callback(state);
        });
        
        // Return a function that unsubscribes both from our set and the data service
        return () => {
            this._subscribers.delete(callback);
            unsubscribe();
        };
    }

    /**
     * Update the state
     * @param {Object} updates - Object containing state updates
     * @param {boolean} [saveToStorage=true] - Whether to persist the update to storage
     */
    update(updates, saveToStorage = true) {
        if (!updates || typeof updates !== 'object') {
            console.warn('Invalid state update - expected an object, got:', updates);
            return;
        }

        console.log('Updating state with:', updates);

        try {
            // Process each update
            for (const [entityType, entities] of Object.entries(updates)) {
                if (!entityType) {
                    console.warn('Skipping update with empty entity type');
                    continue;
                }

                console.log(`Processing update for ${entityType}:`, entities);

                try {
                    if (Array.isArray(entities)) {
                        // Handle array updates (e.g., quests, players, etc.)
                        console.log(`Updating collection: ${entityType}`);
                        this._updateEntityCollection(entityType, entities);
                    } else if (entities && typeof entities === 'object') {
                        // Handle object updates (e.g., settings, ui state)
                        console.log(`Updating object: ${entityType}`);
                        this._updateEntityObject(entityType, entities);
                    } else {
                        console.warn(`Skipping update for ${entityType}: expected array or object, got`, typeof entities);
                    }
                } catch (error) {
                    console.error(`Error processing update for ${entityType}:`, error);
                }
            }

            // Force save if requested
            if (saveToStorage && this.dataService._saveData) {
                console.log('Saving data to storage');
                this.dataService._saveData();
            }
        } catch (error) {
            console.error('Error in update:', error);
        }
    }

    /**
     * Update a collection of entities
     * @private
     */
    _updateEntityCollection(entityType, entities) {
        if (!Array.isArray(entities)) {
            console.warn(`Expected array for entity collection ${entityType}, got:`, entities);
            return;
        }

        console.log(`Updating ${entityType} collection with:`, entities);

        try {
            // Get current entities of this type
            const currentEntities = this.dataService.getAll(entityType) || [];
            const currentEntitiesMap = new Map(currentEntities.map(e => e ? [e.id, e] : []).filter(([id]) => id));
            const updatedIds = new Set();

            console.log(`Current ${entityType} IDs:`, Array.from(currentEntitiesMap.keys()));

            // Update or add entities
            for (const entity of entities) {
                if (!entity || !entity.id) {
                    console.warn('Skipping invalid entity (missing id):', entity);
                    continue;
                }

                updatedIds.add(entity.id);
                
                try {
                    if (currentEntitiesMap.has(entity.id)) {
                        // Update existing entity
                        console.log(`Updating ${entityType} ${entity.id}:`, entity);
                        this.dataService.update(entityType, entity.id, entity);
                    } else {
                        // Add new entity
                        console.log(`Adding new ${entityType} ${entity.id}:`, entity);
                        this.dataService.add(entityType, entity);
                    }
                } catch (error) {
                    console.error(`Error processing ${entityType} ${entity.id}:`, error);
                }
            }

            // Remove entities that are no longer present
            for (const entity of currentEntities) {
                if (entity && entity.id && !updatedIds.has(entity.id)) {
                    console.log(`Removing ${entityType} ${entity.id} (no longer in updates)`);
                    try {
                        this.dataService.remove(entityType, entity.id);
                    } catch (error) {
                        console.error(`Error removing ${entityType} ${entity.id}:`, error);
                    }
                }
            }

            console.log(`Successfully updated ${entityType} collection`);
        } catch (error) {
            console.error(`Error in _updateEntityCollection for ${entityType}:`, error);
        }
    }

    /**
     * Update an entity object (e.g., settings, ui state)
     * @private
     */
    _updateEntityObject(entityType, updates) {
        console.log(`Updating entity object ${entityType} with:`, updates);

        try {
            // Special handling for UI state and settings to use the dedicated methods
            if (entityType === 'ui' && updates.state) {
                console.log('Updating UI state');
                this.dataService.updateUiState(updates.state);
            } else if (entityType === 'settings' && updates.app) {
                console.log('Updating app settings');
                this.dataService.updateSettings(updates.app);
            } else {
                console.log(`Updating generic entity: ${entityType}`);
                // Fallback to generic update for other entity types
                const current = this.dataService.get(entityType, entityType) || {};
                console.log(`Current ${entityType}:`, current);
                
                // Create updated object with new values
                const updated = { ...current };
                let hasChanges = false;
                
                // Only update properties that are actually different
                for (const [key, value] of Object.entries(updates)) {
                    if (JSON.stringify(current[key]) !== JSON.stringify(value)) {
                        updated[key] = value;
                        hasChanges = true;
                    }
                }
                
                if (hasChanges) {
                    console.log(`Saving changes to ${entityType}:`, updated);
                    this.dataService.update(entityType, entityType, updated);
                } else {
                    console.log(`No changes detected for ${entityType}, skipping update`);
                }
            }
        } catch (error) {
            console.error(`Error in _updateEntityObject for ${entityType}:`, error);
        }
    }

    /**
     * Get an entity by ID
     * @param {string} entityType - The type of entity (e.g., 'players', 'quests', 'ui', 'settings')
     * @param {string} id - The ID of the entity to get
     * @returns {Object|null} The entity or null if not found
     */
    getEntity(entityType, id) {
        // Special handling for UI and settings
        if (entityType === 'ui' && id === 'state') {
            return this.dataService.getUiState();
        } else if (entityType === 'settings' && id === 'app') {
            return this.dataService.getSettings();
        }
        
        // For other entity types, use the generic get method
        const entity = this.dataService.get(entityType, id);
        
        // Return a copy to prevent direct state mutation
        return entity ? { ...entity } : null;
    }

    /**
     * Get all entities of a specific type
     * @param {string} entityType - The type of entity (e.g., 'quests', 'players')
     * @returns {Array} Array of entities
     */
    getEntities(entityType) {
        return this.dataService.getAll(entityType);
    }

    /**
     * Add a new entity
     * @param {string} entityType - The type of entity
     * @param {Object} entity - The entity to add
     * @returns {Object} The added entity with generated ID if needed
     */
    addEntity(entityType, entity) {
        return this.dataService.add(entityType, entity);
    }

    /**
     * Update an entity
     * @param {string} entityType - The type of entity (e.g., 'players', 'quests', 'ui', 'settings')
     * @param {string} id - The ID of the entity to update
     * @param {Object} updates - The updates to apply to the entity
     * @returns {Object} The updated entity
     */
    updateEntity(entityType, id, updates) {
        // Special handling for UI and settings
        if (entityType === 'ui' && id === 'state') {
            return this.dataService.updateUiState(updates);
        } else if (entityType === 'settings' && id === 'app') {
            return this.dataService.updateSettings(updates);
        }
        
        // For other entity types, use the generic update method
        const updatedEntity = this.dataService.update(entityType, id, updates);
        
        // Return a copy to prevent direct state mutation
        return updatedEntity ? { ...updatedEntity } : null;
    }

    /**
     * Remove an entity
     * @param {string} entityType - The type of entity
     * @param {string} id - The entity ID
     * @returns {boolean} True if the entity was removed
     */
    removeEntity(entityType, id) {
        return this.dataService.remove(entityType, id);
    }

    /**
     * Import data from a JSON string
     * @param {string} jsonData - The JSON data to import
     * @param {Object} [options] - Import options
     * @param {boolean} [options.merge=true] - Whether to merge with existing data (false = replace all)
     * @param {Array<string>} [options.collections] - Specific collections to import (default: all)
     * @returns {boolean} True if import was successful
     */
    importData(jsonData, options = {}) {
        return this.dataService.importData(jsonData, options);
    }

    /**
     * Export data as a JSON string
     * @returns {string} The exported data as a JSON string
     */
    exportData() {
        return this.dataService.exportData();
    }

    /**
     * Clear all data
     * @returns {boolean} True if the operation was successful
     */
    clearData() {
        return this.dataService.clearData();
    }
    
    // ====================================
    // UI State Management
    // ====================================
    
    /**
     * Get the current UI state
     * @returns {Object} The current UI state
     */
    getUiState() {
        return this.dataService.getUiState();
    }
    
    /**
     * Update the UI state
     * @param {Object} updates - The updates to apply to the UI state
     * @returns {Object} The updated UI state
     */
    updateUiState(updates) {
        return this.dataService.updateUiState(updates);
    }
    
    /**
     * Set the active section in the UI
     * @param {string} section - The section to activate
     * @returns {Object} The updated UI state
     */
    setActiveSection(section) {
        return this.dataService.setActiveSection(section);
    }
    
    /**
     * Set the selected item in the UI
     * @param {string} id - The ID of the selected item
     * @param {string} type - The type of the selected item
     * @returns {Object} The updated UI state
     */
    setSelectedItem(id, type) {
        return this.dataService.setSelectedItem(id, type);
    }
    
    /**
     * Set the search query in the UI
     * @param {string} query - The search query
     * @returns {Object} The updated UI state
     */
    setSearchQuery(query) {
        return this.dataService.setSearchQuery(query);
    }
    
    /**
     * Set filters for a specific section
     * @param {string} section - The section to set filters for
     * @param {Object} filters - The filters to apply
     * @returns {Object} The updated UI state
     */
    setFilters(section, filters) {
        return this.dataService.setFilters(section, filters);
    }
    
    // ====================================
    // Settings Management
    // ====================================
    
    /**
     * Get the application settings
     * @returns {Object} The current settings
     */
    getSettings() {
        return this.dataService.getSettings();
    }
    
    /**
     * Update application settings
     * @param {Object} updates - The settings to update
     * @returns {Object} The updated settings
     */
    updateSettings(updates) {
        return this.dataService.updateSettings(updates);
    }
}

// Create and export a singleton instance
export const dataServiceAdapter = new DataServiceAdapter();

export default dataServiceAdapter;
