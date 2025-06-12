import { DataServiceAdapter } from './data-service-adapter.js';

/**
 * Application State Manager
 * Manages the global application state with persistence using DataService
 */
export class AppState extends DataServiceAdapter {
    /**
     * Create a new AppState instance
     * @param {Object} [initialState] - Initial state (optional)
     * @param {string} [storageKey] - Storage key for persistence (kept for backward compatibility)
     */
    constructor(initialState) {
        super();
        this._isInitialized = true;
        
        // If we have initial state, merge it with the default state
        if (initialState) {
            // Use the enhanced import functionality to properly merge the initial state
            this.importData(JSON.stringify(initialState), {
                merge: true
            });
        }
    }

    /**
     * Get the initial state (static version that can be called before super())
     * @returns {Object} - The initial application state
     */
    static getInitialState() {
        return {
            // Player data
            players: [],
            characters: [],
            
            // Game world data
            quests: [],
            locations: [],
            factions: [],
            
            // Resources
            loot: [],
            items: [],
            
            // Guild data
            guild: {
                activities: [],
                resources: []
            },
            
            // UI state
            ui: {
                activeSection: 'dashboard',
                selectedItem: null,
                searchQuery: '',
                filters: {},
                sortOptions: {}
            },
            
            // Application settings
            settings: {
                theme: 'dark',
                notifications: true,
                autoSave: true,
                lastSaved: null
            }
        };
    }
    
    /**
     * Get the initial state (instance method)
     * @returns {Object} The initial application state
     * @private
     */
    _getInitialState() {
        return this.constructor.getInitialState();
    }
    
    /**
     * Ensure the data service is properly initialized
     * @private
     */
    _ensureInitialized() {
        super._ensureInitialized();
        
        // Ensure UI and settings are properly initialized
        const currentUi = this.getUiState();
        const currentSettings = this.getSettings();
        
        // If UI state is empty, initialize it with defaults
        if (!currentUi || Object.keys(currentUi).length === 0) {
            this.updateUiState({
                ...this.constructor.getInitialState().ui.state
            });
        }
        
        // If settings are empty, initialize them with defaults
        if (!currentSettings || Object.keys(currentSettings).length === 0) {
            this.setSettings({
                ...this.constructor.getInitialState().settings.app
            });
        }
    }
    
    // Player-related methods
    
    /**
     * Get all players
     * @returns {Array} Array of players
     */
    getPlayers() {
        return this.getEntities('players');
    }
    
    /**
     * Add or update a player
     * @param {Object} player - The player data
     */
    setPlayer(player) {
        if (!player || !player.id) return;
        
        if (this.getEntity('players', player.id)) {
            this.updateEntity('players', player.id, player);
        } else {
            this.addEntity('players', player);
        }
    }
    
    /**
     * Remove a player by ID
     * @param {string} playerId - The ID of the player to remove
     */
    removePlayer(playerId) {
        if (!playerId) return;
        this.removeEntity('players', playerId);
    }
    
    // Quest-related methods
    
    /**
     * Get all quests
     * @returns {Array} Array of quests
     */
    getQuests() {
        return this.getEntities('quests');
    }
    
    /**
     * Get a quest by ID
     * @param {string} questId - The ID of the quest to get
     * @returns {Object|null} The quest or null if not found
     */
    getQuest(questId) {
        if (!questId) return null;
        return this.getEntity('quests', questId);
    }
    
    /**
     * Add or update a quest
     * @param {Object} quest - The quest data
     */
    setQuest(quest) {
        if (!quest || !quest.id) return;
        
        if (this.getEntity('quests', quest.id)) {
            this.updateEntity('quests', quest.id, quest);
        } else {
            this.addEntity('quests', quest);
        }
    }
    
    /**
     * Remove a quest by ID
     * @param {string} questId - The ID of the quest to remove
     */
    removeQuest(questId) {
        if (!questId) return;
        this.removeEntity('quests', questId);
    }
    
    // Location-related methods
    
    /**
     * Get all locations
     * @returns {Array} Array of locations
     */
    getLocations() {
        return this.getEntities('locations');
    }
    
    /**
     * Get a location by ID
     * @param {string} locationId - The ID of the location to get
     * @returns {Object|null} The location or null if not found
     */
    getLocation(locationId) {
        if (!locationId) return null;
        return this.getEntity('locations', locationId);
    }
    
    /**
     * Add or update a location
     * @param {Object} location - The location data
     */
    setLocation(location) {
        if (!location || !location.id) return;
        
        if (this.getEntity('locations', location.id)) {
            this.updateEntity('locations', location.id, location);
        } else {
            this.addEntity('locations', location);
        }
    }
    
    /**
     * Remove a location by ID
     * @param {string} locationId - The ID of the location to remove
     */
    removeLocation(locationId) {
        if (!locationId) return;
        this.removeEntity('locations', locationId);
    }
    
    // UI state methods
    
    /**
     * Get the current UI state
     * @returns {Object} The current UI state
     */
    getUiState() {
        return super.getUiState();
    }
    
    /**
     * Set the active section in the UI
     * @param {string} section - The section to activate
     * @returns {Object} The updated UI state
     */
    setActiveSection(section) {
        return super.setActiveSection(section);
    }
    
    /**
     * Set the selected item in the UI
     * @param {string} id - The ID of the selected item
     * @param {string} type - The type of the selected item
     * @returns {Object} The updated UI state
     */
    setSelectedItem(id, type) {
        return super.setSelectedItem(id, type);
    }
    
    /**
     * Set the search query in the UI
     * @param {string} query - The search query
     * @returns {Object} The updated UI state
     */
    setSearchQuery(query) {
        return super.setSearchQuery(query);
    }
    
    /**
     * Set application settings
     * @param {Object} settings - The settings to update
     * @returns {Object} The updated settings
     */
    setSettings(settings) {
        if (!settings) return this.getSettings();
        return super.updateSettings(settings);
    }
    
    /**
     * Get application settings
     * @returns {Object} The current application settings
     */
    getSettings() {
        return super.getSettings();
    }
    
    /**
     * Update UI state with the provided updates
     * @param {Object} updates - The updates to apply to the UI state
     * @returns {Object} The updated UI state
     */
    updateUiState(updates) {
        if (!updates || typeof updates !== 'object') {
            return this.getUiState();
        }
        return super.updateUiState(updates);
    }
    
    /**
     * Set filters for a specific section
     * @param {string} section - The section to set filters for
     * @param {Object} filters - The filters to apply
     * @returns {Object} The updated UI state
     */
    setFilters(section, filters) {
        if (!section) return this.getUiState();
        return super.setFilters(section, filters);
    }
    
    /**
     * Get filters for a specific section
     * @param {string} section - The section to get filters for
     * @returns {Object} The current filters for the section
     */
    getFilters(section) {
        if (!section) return {};
        const uiState = this.getUiState();
        return (uiState.filters && uiState.filters[section]) || {};
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
            return this.getUiState();
        } else if (entityType === 'settings' && id === 'app') {
            return this.getSettings();
        }
        
        // For other entity types, use the parent method
        return super.getEntity(entityType, id);
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
            return this.updateUiState(updates);
        } else if (entityType === 'settings' && id === 'app') {
            return this.updateSettings(updates);
        }
        
        // For other entity types, use the parent method
        return super.updateEntity(entityType, id, updates);
    }
}

// Create and export a singleton instance
export const appState = new AppState(undefined, 'pathfinderWorldTrackerState');

export default appState;
