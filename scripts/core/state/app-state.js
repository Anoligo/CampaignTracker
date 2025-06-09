import { StateManager } from './state-manager.js';

/**
 * Application State Manager
 * Manages the global application state with persistence
 */
export class AppState extends StateManager {
    /**
     * Create a new AppState instance
     * @param {Object} initialState - Initial state (optional)
     * @param {string} storageKey - Storage key for persistence
     */
    constructor(initialState, storageKey = 'appState') {
        // Call parent constructor with null to trigger _loadState
        super(null, storageKey);
        
        // If we don't have a state yet (no saved state), initialize with defaults
        if (!this._state) {
            const defaultState = this.constructor.getInitialState();
            const mergedState = initialState ? { ...defaultState, ...initialState } : defaultState;
            
            // Manually set the initial state
            this._state = this._deepClone(mergedState);
            this._isInitialized = true;
            
            // Save the initial state to storage
            this._saveState();
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
     * @returns {Object} - The initial application state
     * @private
     */
    _getInitialState() {
        return this.constructor.getInitialState();
    }
    
    // Player-related methods
    
    /**
     * Add or update a player
     * @param {Object} player - The player data
     */
    setPlayer(player) {
        if (!player || !player.id) return;
        
        const existingIndex = this._state.players.findIndex(p => p.id === player.id);
        const players = [...this._state.players];
        
        if (existingIndex >= 0) {
            players[existingIndex] = { ...players[existingIndex], ...player };
        } else {
            players.push(player);
        }
        
        this.update({ players });
    }
    
    /**
     * Remove a player by ID
     * @param {string} playerId - The ID of the player to remove
     */
    removePlayer(playerId) {
        const players = this._state.players.filter(p => p.id !== playerId);
        this.update({ players });
    }
    
    // Quest-related methods
    
    /**
     * Add or update a quest
     * @param {Object} quest - The quest data
     */
    setQuest(quest) {
        if (!quest || !quest.id) return;
        
        const existingIndex = this._state.quests.findIndex(q => q.id === quest.id);
        const quests = [...this._state.quests];
        
        if (existingIndex >= 0) {
            quests[existingIndex] = { ...quests[existingIndex], ...quest };
        } else {
            quests.push(quest);
        }
        
        this.update({ quests });
    }
    
    /**
     * Remove a quest by ID
     * @param {string} questId - The ID of the quest to remove
     */
    removeQuest(questId) {
        const quests = this._state.quests.filter(q => q.id !== questId);
        this.update({ quests });
    }
    
    // Location-related methods
    
    /**
     * Add or update a location
     * @param {Object} location - The location data
     */
    setLocation(location) {
        if (!location || !location.id) return;
        
        const existingIndex = this._state.locations.findIndex(l => l.id === location.id);
        const locations = [...this._state.locations];
        
        if (existingIndex >= 0) {
            locations[existingIndex] = { ...locations[existingIndex], ...location };
        } else {
            locations.push(location);
        }
        
        this.update({ locations });
    }
    
    /**
     * Remove a location by ID
     * @param {string} locationId - The ID of the location to remove
     */
    removeLocation(locationId) {
        const locations = this._state.locations.filter(l => l.id !== locationId);
        this.update({ locations });
    }
    
    // UI state methods
    
    /**
     * Set the active section
     * @param {string} section - The section to activate
     */
    setActiveSection(section) {
        if (this._state.ui.activeSection !== section) {
            this.update({
                ui: {
                    ...this._state.ui,
                    activeSection: section,
                    selectedItem: null
                }
            });
        }
    }
    
    /**
     * Set the selected item
     * @param {string} itemId - The ID of the selected item
     * @param {string} itemType - The type of the selected item
     */
    setSelectedItem(itemId, itemType) {
        this.update({
            ui: {
                ...this._state.ui,
                selectedItem: { id: itemId, type: itemType }
            }
        });
    }
    
    /**
     * Set the search query
     * @param {string} query - The search query
     */
    setSearchQuery(query) {
        this.update({
            ui: {
                ...this._state.ui,
                searchQuery: query || ''
            }
        });
    }
}

// Create and export a singleton instance
export const appState = new AppState(undefined, 'pathfinderWorldTrackerState');

export default appState;
