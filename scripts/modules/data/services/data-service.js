// Local implementation of UUID v4
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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
        return this._getStateCopy();
    }
    
    /**
     * Export the current state
     * Alias for appState getter for compatibility with DataServiceAdapter
     * @returns {Object} The current state
     */
    exportState() {
        return this._getStateCopy();
    }
    
    /**
     * Get a deep copy of the current state
     * @returns {Object} A deep copy of the current state
     */
    _getStateCopy() {
        return JSON.parse(JSON.stringify(this._state));
    }
    
    /**
     * Load data from localStorage or initialize with default state
     * @private
     */
    _loadData() {
        try {
            const savedState = localStorage.getItem('ironMeridianState');
            if (savedState) {
                try {
                    const parsedState = JSON.parse(savedState);
                    
                    // Clean up invalid quest data
                    if (parsedState.quests && Array.isArray(parsedState.quests)) {
                        parsedState.quests = parsedState.quests.filter(quest => 
                            quest && 
                            typeof quest === 'object' && 
                            quest.title && 
                            typeof quest.title === 'string' &&
                            quest.title.trim() !== ''
                        );
                    }
                    
                    // Fix any invalid state before validation
                    const fixedState = this._fixInvalidState(parsedState);
                    
                    // Ensure players are properly initialized
                    if (fixedState.players && Array.isArray(fixedState.players)) {
                        fixedState.players = fixedState.players.map(player => {
                            if (!player || typeof player !== 'object') {
                                return null;
                            }
                            
                            // Ensure playerClass is set and valid
                            const validPlayerClasses = [
                                'alchemist', 'barbarian', 'bard', 'champion', 'cleric', 
                                'druid', 'fighter', 'inventor', 'investigator', 'kineticist', 
                                'magus', 'monk', 'oracle', 'psychic', 'ranger', 'rogue', 
                                'sorcerer', 'summoner', 'swashbuckler', 'thaumaturge', 'witch', 
                                'wizard', 'gunslinger'
                            ];
                            
                            const playerClass = validPlayerClasses.includes(player.playerClass || player.class)
                                ? (player.playerClass || player.class)
                                : 'fighter';
                            
                            // Create a clean player object
                            const cleanPlayer = {
                                id: player.id || `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                name: player.name || 'Unnamed Player',
                                playerClass,
                                level: typeof player.level === 'number' && player.level > 0 ? player.level : 1,
                                experience: typeof player.experience === 'number' ? player.experience : 0,
                                inventory: Array.isArray(player.inventory) ? [...player.inventory] : [],
                                activeQuests: Array.isArray(player.activeQuests) ? [...player.activeQuests] : [],
                                completedQuests: Array.isArray(player.completedQuests) ? [...player.completedQuests] : [],
                                notes: typeof player.notes === 'string' ? player.notes : '',
                                createdAt: player.createdAt || new Date().toISOString(),
                                updatedAt: player.updatedAt || new Date().toISOString()
                            };
                            
                            // Copy any additional properties
                            Object.keys(player).forEach(key => {
                                if (!(key in cleanPlayer) && key !== 'class') {
                                    cleanPlayer[key] = player[key];
                                }
                            });
                            
                            return cleanPlayer;
                        }).filter(Boolean); // Remove any null entries
                    }
                    
                    // Validate the fixed state
                    const errors = StateValidator.validateState(fixedState);
                    
                    if (errors.length === 0) {
                        this._state = fixedState;
                        console.log('Loaded state from localStorage');
                        return;
                    } else {
                        console.warn('Validation errors in saved state, attempting to fix:', errors);
                        // If we can fix the errors, use the fixed state
                        const fixedState = this._fixInvalidState(parsedState);
                        const fixedErrors = StateValidator.validateState(fixedState);
                        
                        if (fixedErrors.length === 0) {
                            this._state = fixedState;
                            console.log('Successfully fixed state');
                            this._saveData(); // Save the fixed state
                            return;
                        } else {
                            console.warn('Could not fix all validation errors, falling back to default state');
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing saved state:', parseError);
                }
            }
            
            // If we get here, either there was no saved state or it was invalid
            console.warn('Initializing with default state');
            this._state = this._getStateCopy(INITIAL_STATE);
            
            // Ensure players are properly initialized
            this._ensurePlayers();
            
            this._saveData();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this._state = this._getStateCopy(INITIAL_STATE);
            
            // Ensure players are properly initialized even on error
            this._ensurePlayers();
        }
    }
    
    /**
     * Fix common issues in the state object
     * @param {Object} state - The state to fix
     * @returns {Object} The fixed state
     * @private
     */
    _fixInvalidState(state) {
        console.log('Fixing invalid state. Initial state:', JSON.stringify(state, null, 2));
        
        // Start with a deep clone of the state to avoid mutating the original
        const fixedState = JSON.parse(JSON.stringify(state));

        // Backwards compatibility: migrate old `characters` array to `npcs`
        if (
            (!Array.isArray(fixedState.npcs) || fixedState.npcs.length === 0) &&
            Array.isArray(fixedState.characters)
        ) {
            console.log('Migrating legacy `characters` array to `npcs`');
            fixedState.npcs = [...fixedState.characters];
        }
        
        // Ensure quests is an array and filter out invalid quests
        if (!Array.isArray(fixedState.quests)) {
            console.log('Initializing quests array');
            fixedState.quests = [];
        } else {
            fixedState.quests = fixedState.quests.filter(quest => 
                quest && 
                typeof quest === 'object' && 
                quest.id && 
                quest.title && 
                quest.name
            ).map(quest => ({
                ...quest,
                // Ensure required fields exist with defaults
                title: quest.title || quest.name || 'Untitled Quest',
                name: quest.name || quest.title || 'untitled-quest',
                description: quest.description || '',
                type: quest.type || 'side',
                status: quest.status || 'available',
                journalEntries: Array.isArray(quest.journalEntries) ? quest.journalEntries : [],
                relatedItems: Array.isArray(quest.relatedItems) ? quest.relatedItems : [],
                relatedLocations: Array.isArray(quest.relatedLocations) ? quest.relatedLocations : [],
                relatedCharacters: Array.isArray(quest.relatedCharacters) ? quest.relatedCharacters : [],
                relatedFactions: Array.isArray(quest.relatedFactions) ? quest.relatedFactions : [],
                relatedQuests: Array.isArray(quest.relatedQuests) ? quest.relatedQuests : [],
                notes: quest.notes || '',
                resolution: {
                    session: quest.resolution?.session || '',
                    date: quest.resolution?.date || null,
                    xp: quest.resolution?.xp || 0
                },
                createdAt: quest.createdAt || new Date().toISOString(),
                updatedAt: quest.updatedAt || new Date().toISOString()
            }));
        }
        
        // Ensure players is an array and filter out invalid players
        if (!Array.isArray(fixedState.players)) {
            console.log('Initializing players array');
            fixedState.players = [];
        } else {
            fixedState.players = fixedState.players.filter(player => 
                player && 
                typeof player === 'object' && 
                player.id && 
                player.name
            ).map(player => ({
                ...player,
                // Ensure required fields exist with defaults
                name: player.name || 'Unnamed Player',
                playerClass: player.playerClass || 'fighter',
                level: typeof player.level === 'number' ? Math.max(1, Math.min(20, player.level)) : 1,
                experience: typeof player.experience === 'number' ? Math.max(0, player.experience) : 0,
                inventory: Array.isArray(player.inventory) ? player.inventory : [],
                activeQuests: Array.isArray(player.activeQuests) ? player.activeQuests : [],
                completedQuests: Array.isArray(player.completedQuests) ? player.completedQuests : [],
                notes: player.notes || '',
                createdAt: player.createdAt || new Date().toISOString(),
                updatedAt: player.updatedAt || new Date().toISOString()
            }));
        }
        
        // Ensure guildLogs exists and has the correct structure
        if (!fixedState.guildLogs || typeof fixedState.guildLogs !== 'object') {
            console.log('Initializing guildLogs object');
            fixedState.guildLogs = { activities: [], resources: [] };
        } else {
            // Ensure activities and resources arrays exist
            if (!Array.isArray(fixedState.guildLogs.activities)) {
                fixedState.guildLogs.activities = [];
            }
            if (!Array.isArray(fixedState.guildLogs.resources)) {
                fixedState.guildLogs.resources = [];
            }
            
            // Clean up activities
            fixedState.guildLogs.activities = fixedState.guildLogs.activities
                .filter(activity => activity && typeof activity === 'object' && activity.id)
                .map(activity => ({
                    id: activity.id,
                    type: activity.type || 'other',
                    timestamp: activity.timestamp || new Date().toISOString(),
                    description: activity.description || '',
                    characterId: activity.characterId || null,
                    questId: activity.questId || null,
                    details: activity.details || {}
                }));
            
            // Clean up resources
            fixedState.guildLogs.resources = fixedState.guildLogs.resources
                .filter(resource => resource && typeof resource === 'object' && resource.id)
                .map(resource => ({
                    id: resource.id,
                    type: resource.type || 'other',
                    amount: typeof resource.amount === 'number' ? resource.amount : 0,
                    timestamp: resource.timestamp || new Date().toISOString(),
                    source: resource.source || 'unknown',
                    questId: resource.questId || null,
                    characterId: resource.characterId || null,
                    notes: resource.notes || ''
                }));
        }
        
        // Ensure other top-level arrays exist and are properly initialized
        const topLevelArrays = ['locations', 'loot', 'factions', 'npcs', 'sessionNotes'];
        topLevelArrays.forEach(field => {
            if (!Array.isArray(fixedState[field])) {
                fixedState[field] = [];
            }
        });
        
        // Ensure UI state exists and is properly structured
        if (!fixedState.ui || typeof fixedState.ui !== 'object') {
            fixedState.ui = { state: { ...INITIAL_STATE.ui.state } };
        } else if (!fixedState.ui.state || typeof fixedState.ui.state !== 'object') {
            fixedState.ui.state = { ...INITIAL_STATE.ui.state };
        }
        
        // Ensure settings exist and are properly structured
        if (!fixedState.settings || typeof fixedState.settings !== 'object') {
            fixedState.settings = { app: { ...INITIAL_STATE.settings.app } };
        } else if (!fixedState.settings.app || typeof fixedState.settings.app !== 'object') {
            fixedState.settings.app = { ...INITIAL_STATE.settings.app };
        }
        
        // Ensure version is set
        if (typeof fixedState._version !== 'number') {
            fixedState._version = 1;
        }
        
        console.log('Fixed state after processing:', JSON.stringify(fixedState, null, 2));
        return fixedState;
    }
    
    /**
     * Ensure players array is properly initialized and valid
     * @private
     */
    _ensurePlayers() {
        if (!this._state) {
            this._state = { ...INITIAL_STATE };
            return;
        }
        
        if (!Array.isArray(this._state.players)) {
            this._state.players = [];
        }
        
        // Define valid player classes
        const validPlayerClasses = [
            'alchemist', 'barbarian', 'bard', 'champion', 'cleric', 
            'druid', 'fighter', 'inventor', 'investigator', 'kineticist', 
            'magus', 'monk', 'oracle', 'psychic', 'ranger', 'rogue', 
            'sorcerer', 'summoner', 'swashbuckler', 'thaumaturge', 'witch', 
            'wizard', 'gunslinger'
        ];
        
        // Ensure each player has all required fields and valid values
        this._state.players = this._state.players.map(player => {
            if (!player || typeof player !== 'object') {
                return {
                    id: `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    name: 'Unnamed Player',
                    playerClass: 'fighter',
                    level: 1,
                    experience: 0,
                    inventory: [],
                    activeQuests: [],
                    completedQuests: [],
                    notes: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            
            // Ensure playerClass is valid
            const playerClass = validPlayerClasses.includes(player.playerClass || player.class)
                ? (player.playerClass || player.class)
                : 'fighter';
                
            // Create a clean player object with required fields
            const fixedPlayer = {
                id: player.id || `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: player.name || 'Unnamed Player',
                playerClass,
                level: typeof player.level === 'number' && player.level > 0 ? player.level : 1,
                experience: typeof player.experience === 'number' ? player.experience : 0,
                inventory: Array.isArray(player.inventory) ? [...player.inventory] : [],
                activeQuests: Array.isArray(player.activeQuests) ? [...player.activeQuests] : [],
                completedQuests: Array.isArray(player.completedQuests) ? [...player.completedQuests] : [],
                notes: typeof player.notes === 'string' ? player.notes : '',
                createdAt: player.createdAt || new Date().toISOString(),
                updatedAt: player.updatedAt || new Date().toISOString()
            };
            
            // Copy any additional properties
            Object.keys(player).forEach(key => {
                if (!(key in fixedPlayer) && key !== 'class') {
                    fixedPlayer[key] = player[key];
                }
            });
            
            return fixedPlayer;
        });
    }
    
    /**
     * Ensure the UI state is properly initialized
     * @private
     */
    _ensureUiState() {
        // Ensure state is initialized
        if (!this._state) {
            this._state = { ...INITIAL_STATE };
            return;
        }
        
        // Ensure ui object exists
        if (!this._state.ui) {
            this._state.ui = { state: { ...INITIAL_STATE.ui.state } };
            return;
        }
        
        // Ensure state exists within ui
        if (!this._state.ui.state) {
            this._state.ui.state = { ...INITIAL_STATE.ui.state };
            return;
        }
        
        // Merge with default UI state to ensure all properties exist
        this._state.ui.state = {
            ...INITIAL_STATE.ui.state,
            ...this._state.ui.state,
            // Preserve nested objects like filters
            filters: {
                ...(INITIAL_STATE.ui.state.filters || {}),
                ...(this._state.ui.state.filters || {})
            },
            sortOptions: {
                ...(INITIAL_STATE.ui.state.sortOptions || {}),
                ...(this._state.ui.state.sortOptions || {})
            }
        };
    }
    
    /**
     * Ensure the settings are properly initialized
     * @private
     */
    _ensureSettings() {
        // Ensure state is initialized
        if (!this._state) {
            this._state = { ...INITIAL_STATE };
            return;
        }
        
        // Ensure settings object exists
        if (!this._state.settings) {
            this._state.settings = { app: { ...INITIAL_STATE.settings.app } };
            return;
        }
        
        // Ensure app settings exist
        if (!this._state.settings.app) {
            this._state.settings.app = { ...INITIAL_STATE.settings.app };
            return;
        }
        
        // Merge with default settings to ensure all properties exist
        this._state.settings.app = {
            ...INITIAL_STATE.settings.app,
            ...this._state.settings.app
        };
    }
    
    /**
     * Migrate old state to new schema if needed
     * @private
     */
    _migrateState(state) {
        // If no version in state, it's from before versioning was added
        if (state._version === undefined) {
            state._version = 0;
        }
        
        // Migration from version 0 to 1
        if (state._version < 1) {
            // Ensure UI state structure
            if (!state.ui || typeof state.ui !== 'object') {
                state.ui = { state: { ...INITIAL_STATE.ui.state } };
            } else if (!state.ui.state || typeof state.ui.state !== 'object') {
                state.ui.state = { ...INITIAL_STATE.ui.state };
            }
            
            // Ensure settings structure
            if (!state.settings || typeof state.settings !== 'object') {
                state.settings = { app: { ...INITIAL_STATE.settings.app } };
            } else if (!state.settings.app || typeof state.settings.app !== 'object') {
                state.settings.app = { ...INITIAL_STATE.settings.app };
            }
            
            state._version = 1;
        }
        
        // Add future migrations here following the same pattern
        // if (state._version < 2) {
        //     // Migration logic for version 2
        //     state._version = 2;
        // }
        
        return state;
    }
    
    /**
     * Save the current state to localStorage
     * @returns {boolean} True if save was successful, false otherwise
     */
    _saveData() {
        console.groupCollapsed('[DataService] Starting save operation');
        
        try {
            if (!this._state) {
                const error = new Error('Cannot save: state is null or undefined');
                console.error(error.message);
                console.groupEnd();
                return false;
            }
            
            // Create a deep copy of the state to avoid reference issues
            let stateToSave;
            try {
                stateToSave = JSON.parse(JSON.stringify(this._state));
                console.log('[DataService] Created deep copy of state for saving');
            } catch (copyError) {
                console.error('[DataService] Error creating deep copy of state:', copyError);
                console.groupEnd();
                return false;
            }
            
            // Validate the state before saving
            console.log('[DataService] Validating state before saving...');
            const errors = StateValidator.validateState(stateToSave);
            
            if (errors.length > 0) {
                console.warn(`[DataService] Found ${errors.length} validation errors before saving:`);
                errors.forEach((error, index) => {
                    console.warn(`[${index + 1}] ${error.path}: ${error.message}`);
                });
                
                // Log problematic state parts for debugging
                console.log('[DataService] Problematic state parts:', JSON.stringify({
                    quests: {
                        count: stateToSave.quests?.length,
                        sample: stateToSave.quests?.[0],
                        hasInvalid: stateToSave.quests?.some(q => !q || !q.id || !q.title)
                    },
                    players: {
                        count: stateToSave.players?.length,
                        sample: stateToSave.players?.[0]
                    }
                }, null, 2));
                
                // Try to fix the state before saving
                console.log('[DataService] Attempting to fix invalid state...');
                try {
                    const fixedState = this._fixInvalidState(JSON.parse(JSON.stringify(stateToSave)));
                    const fixedErrors = StateValidator.validateState(fixedState);
                    
                    if (fixedErrors.length > 0) {
                        console.error(`[DataService] Could not fix all validation errors (${fixedErrors.length} remaining):`);
                        fixedErrors.forEach((error, index) => {
                            console.error(`[${index + 1}] ${error.path}: ${error.message}`);
                        });
                        
                        // Log the fixed state that still has errors for debugging
                        console.error('[DataService] Fixed state that still has errors:', 
                            JSON.stringify(fixedState, (key, value) => {
                                // Handle circular references
                                if (typeof value === 'object' && value !== null) {
                                    if (key === 'parent' || key === 'children') return '[Circular]';
                                }
                                return value;
                            }, 2));
                        
                        console.groupEnd();
                        return false;
                    }
                    
                    console.log('[DataService] Successfully fixed state, saving fixed state');
                    // Use the fixed state for saving
                    this._state = fixedState;
                    stateToSave = JSON.parse(JSON.stringify(fixedState)); // Create a fresh copy
                } catch (fixError) {
                    console.error('[DataService] Error during state fix attempt:', fixError);
                    console.groupEnd();
                    return false;
                }
            } else {
                console.log('[DataService] State validation passed');
            }
            
            // Ensure we have a valid state to save
            if (!stateToSave) {
                console.error('[DataService] No valid state to save after validation');
                console.groupEnd();
                return false;
            }
            
            // Try to save to localStorage
            try {
                console.log('[DataService] Attempting to save to localStorage...');
                localStorage.setItem('ironMeridianState', JSON.stringify(stateToSave));
                console.log('[DataService] Successfully saved state to localStorage');
                
                // Notify observers of the state change
                console.log('[DataService] Notifying observers of state change...');
                this._notifyObservers();
                
                console.log('[DataService] State saved and observers notified successfully');
                console.groupEnd();
                return true;
                
            } catch (saveError) {
                console.error('[DataService] Error saving to localStorage:', saveError);
                
                // If we get a QuotaExceededError, try to clean up and save a minimal state
                if (saveError.name === 'QuotaExceededError') {
                    console.warn('[DataService] Storage quota exceeded, attempting to save minimal state...');
                    try {
                        const minimalState = { ...INITIAL_STATE };
                        localStorage.setItem('ironMeridianState', JSON.stringify(minimalState));
                        console.warn('[DataService] Saved minimal valid state due to quota exceeded');
                        console.groupEnd();
                        return false;
                    } catch (minimalSaveError) {
                        console.error('[DataService] Could not save minimal state:', minimalSaveError);
                        console.groupEnd();
                        return false;
                    }
                }
                
                console.groupEnd();
                return false;
            }
            
        } catch (error) {
            console.error('[DataService] Unexpected error during save operation:', error);
            
            // Log additional error details if available
            if (error instanceof Error) {
                console.error('[DataService] Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack?.split('\n').slice(0, 5).join('\n') + '...' // Just first few lines of stack
                });
            }
            
            // As a last resort, try to save a minimal valid state
            try {
                console.warn('[DataService] Attempting to save minimal valid state...');
                const minimalState = { ...INITIAL_STATE };
                localStorage.setItem('ironMeridianState', JSON.stringify(minimalState));
                console.warn('[DataService] Saved minimal valid state after error');
                console.groupEnd();
                return false;
            } catch (fallbackError) {
                console.error('[DataService] Could not save minimal state:', fallbackError);
                console.groupEnd();
                return false;
            }
        }
    }

    /**
     * Public wrapper for _saveData to allow external callers
     * to persist the current state.
     * @returns {boolean} True if save was successful, false otherwise
     */
    saveData() {
        return this._saveData();
    }

    /**
     * Notify all observers of state changes
     */
    _notifyObservers() {
        const stateCopy = this._getStateCopy();
        for (const observer of this._observers) {
            try {
                observer(stateCopy);
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
        observer(this._getStateCopy());
        
        // Return unsubscribe function
        return () => this._observers.delete(observer);
    }
    
    // ====================================
    // Generic CRUD Operations
    // ====================================
    
    /**
     * Get an entity by ID
     * @param {string} collection - The collection name
     * @param {string} id - The entity ID
     * @returns {Object|null} The entity or null if not found
     */
    get(collection, id) {
        // Ensure state is initialized
        if (!this._state) {
            this._state = { ...INITIAL_STATE };
        }
        
        // Special handling for UI state
        if (collection === 'ui' && id === 'state') {
            return this._getUiState();
        } 
        // Special handling for settings
        else if (collection === 'settings' && id === 'app') {
            return this._getSettings();
        }
        
        if (!this._state[collection] || !Array.isArray(this._state[collection])) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        const entity = this._state[collection].find(item => item.id === id);
        return entity ? { ...entity } : null; // Return a copy
    }
    
    /**
     * Get all entities in a collection
     * @param {string} collection - The collection name
     * @param {Function} [filter] - Optional filter function
     * @returns {Array} Array of entities
     */
    getAll(collection, filter = null) {
        if (!this._state[collection] || !Array.isArray(this._state[collection])) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        let results = [...this._state[collection]]; // Create a copy
        
        if (typeof filter === 'function') {
            results = results.filter(filter);
        }
        
        return results;
    }
    
    /**
     * Add a new entity to a collection
     * @param {string} collection - The collection name (e.g., 'quests', 'players')
     * @param {Object} entity - The entity to add
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.generateId=true] - Whether to generate an ID if not provided
     * @returns {Object} The added entity with ID
     */
    add(collection, entity, { generateId = true } = {}) {
        if (!this._state[collection] || !Array.isArray(this._state[collection])) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        // Create a copy of the entity to avoid modifying the original
        const newEntity = { ...entity };
        
        // Generate ID if not provided and generation is enabled
        if (generateId && !newEntity.id) {
            newEntity.id = uuidv4();
        }
        
        // Add timestamps if not provided
        const now = new Date().toISOString();
        if (!newEntity.createdAt) {
            newEntity.createdAt = now;
        }
        if (!newEntity.updatedAt) {
            newEntity.updatedAt = now;
        }
        
        // Add to collection
        this._state[collection].push(newEntity);
        this._saveData();
        
        return { ...newEntity }; // Return a copy to prevent direct state mutation
    }
    
    /**
     * Update an existing entity
     * @param {string} collection - The collection name
     * @param {string} id - The entity ID
     * @param {Object} updates - The updates to apply
     * @returns {Object|null} The updated entity or null if not found
     */
    update(collection, id, updates) {
        // Ensure state is initialized
        if (!this._state) {
            this._state = { ...INITIAL_STATE };
        }
        
        // Special handling for UI state updates
        if (collection === 'ui' && id === 'state') {
            if (!this._state.ui) {
                this._state.ui = { state: { ...INITIAL_STATE.ui.state } };
            }
            
            const currentUi = this._state.ui.state || {};
            const updatedState = {
                ...currentUi,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this._state.ui.state = updatedState;
            this._saveData();
            
            // Notify observers
            this._notifyObservers('ui:state:updated', updatedState);
            return updatedState;
        } 
        // Special handling for settings updates
        else if (collection === 'settings' && id === 'app') {
            if (!this._state.settings) {
                this._state.settings = { app: { ...INITIAL_STATE.settings.app } };
            }
            
            const currentSettings = this._state.settings.app || {};
            const updatedSettings = {
                ...currentSettings,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this._state.settings.app = updatedSettings;
            this._saveData();
            
            // Notify observers
            this._notifyObservers('settings:updated', updatedSettings);
            return updatedSettings;
        }
        
        if (!this._state[collection] || !Array.isArray(this._state[collection])) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        const index = this._state[collection].findIndex(item => item.id === id);
        if (index === -1) {
            return null;
        }
        
        // Create an updated copy of the entity
        const updatedEntity = {
            ...this._state[collection][index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        // Update the state
        this._state[collection] = [
            ...this._state[collection].slice(0, index),
            updatedEntity,
            ...this._state[collection].slice(index + 1)
        ];
        
        this._saveData();
        return { ...updatedEntity }; // Return a copy
    }
    
    /**
     * Remove an entity
     * @param {string} collection - The collection name
     * @param {string} id - The entity ID
     * @returns {boolean} True if the entity was removed, false otherwise
     */
    remove(collection, id) {
        if (!this._state[collection] || !Array.isArray(this._state[collection])) {
            throw new Error(`Invalid collection: ${collection}`);
        }
        
        const index = this._state[collection].findIndex(item => item.id === id);
        if (index === -1) {
            return false;
        }
        
        // Remove the entity
        this._state[collection] = [
            ...this._state[collection].slice(0, index),
            ...this._state[collection].slice(index + 1)
        ];
        
        this._saveData();
        return true;
    }
    
    // ====================================
    // Entity-Specific Methods
    // ====================================
    
    // Quests
    /**
     * Get all quests with related entities populated
     * @param {Object} [filter] - Optional filter function
     * @returns {Array} Array of quests with related entities
     */
    getQuests(filter = null) {
        return this.getAll('quests', filter).map(quest => ({
            ...quest,
            relatedItems: this.getRelatedEntities('loot', quest.relatedItems || []),
            relatedLocations: this.getRelatedEntities('locations', quest.relatedLocations || []),
            relatedCharacters: this.getRelatedEntities('players', quest.relatedCharacters || []),
            relatedFactions: this.getRelatedEntities('factions', quest.relatedFactions || []),
            relatedQuests: this.getRelatedEntities('quests', quest.relatedQuests || [])
        }));
    }
    
    /**
     * Add a new quest
     * @param {Object} quest - The quest data
     * @returns {Object} The created quest
     */
    addQuest(quest) {
        return this.add('quests', quest);
    }
    
    // Players
    /**
     * Get all players with related entities populated
     * @param {Object} [filter] - Optional filter function
     * @returns {Array} Array of players with related entities
     */
    getPlayers(filter = null) {
        return this.getAll('players', filter).map(player => ({
            ...player,
            inventory: this.getRelatedEntities('loot', player.inventory || []),
            conditions: [],
            relatedQuests: this.getRelatedEntities('quests', player.relatedQuests || [])
        }));
    }
    
    // Helper method to get related entities
    getRelatedEntities(collection, ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            return [];
        }
        
        return this.getAll(collection, item => ids.includes(item.id));
    }
    
    // ====================================
    // UI State Management
    // ====================================
    
    /**
     * Get the UI state directly
     * @private
     * @returns {Object} The UI state
     */
    _getUiState() {
        if (!this._state) {
            this._state = { ...INITIAL_STATE };
        }
        
        if (!this._state.ui) {
            this._state.ui = { state: { ...INITIAL_STATE.ui.state } };
        } else if (!this._state.ui.state) {
            this._state.ui.state = { ...INITIAL_STATE.ui.state };
        }
        
        return this._state.ui.state;
    }
    
    /**
     * Get the settings directly
     * @private
     * @returns {Object} The settings
     */
    _getSettings() {
        if (!this._state) {
            this._state = { ...INITIAL_STATE };
        }
        
        if (!this._state.settings) {
            this._state.settings = { app: { ...INITIAL_STATE.settings.app } };
        } else if (!this._state.settings.app) {
            this._state.settings.app = { ...INITIAL_STATE.settings.app };
        }
        
        return this._state.settings.app;
    }
    
    /**
     * Get the current UI state
     * @returns {Object} The current UI state
     */
    getUiState() {
        return this._getUiState();
    }
    
    /**
     * Update the UI state
     * @param {Object} updates - The updates to apply to the UI state
     * @returns {Object} The updated UI state
     */
    updateUiState(updates) {
        if (!updates || typeof updates !== 'object') {
            throw new Error('Updates must be an object');
        }
        
        // Use the update method which now handles UI state updates directly
        return this.update('ui', 'state', updates);
    }
    
    /**
     * Set the active section in the UI
     * @param {string} section - The section to activate
     * @returns {Object} The updated UI state
     */
    setActiveSection(section) {
        // Define valid section values from the schema
        const validSections = [
            'dashboard', 'quests', 'players', 'characters', 'locations', 'loot', 
            'npcs', 'factions', 'session-notes', 'guild-logs', 'settings'
        ];
        
        // If the provided section is not valid, log a warning and use 'dashboard' as fallback
        const validSection = validSections.includes(section) ? section : 'dashboard';
        
        if (section !== validSection) {
            console.warn(`Invalid section '${section}' provided. Falling back to '${validSection}'.`);
        }
        
        return this.updateUiState({
            activeSection: validSection,
            selectedItem: null // Reset selected item when changing sections
        });
    }
    
    /**
     * Set the selected item in the UI
     * @param {string} id - The ID of the selected item
     * @param {string} type - The type of the selected item
     * @returns {Object} The updated UI state
     */
    setSelectedItem(id, type) {
        return this.updateUiState({
            selectedItem: id && type ? { id, type } : null
        });
    }
    
    /**
     * Set the search query in the UI
     * @param {string} query - The search query
     * @returns {Object} The updated UI state
     */
    setSearchQuery(query) {
        return this.updateUiState({
            searchQuery: query || ''
        });
    }
    
    /**
     * Set filters for a specific section
     * @param {string} section - The section to set filters for
     * @param {Object} filters - The filters to apply
     * @returns {Object} The updated UI state
     */
    setFilters(section, filters) {
        if (!section) return this.getUiState();
        
        const currentUi = this.getUiState();
        return this.updateUiState({
            filters: {
                ...(currentUi.filters || {}),
                [section]: filters
            }
        });
    }
    
    // ====================================
    // Settings Management
    // ====================================
    
    /**
     * Get the application settings
     * @returns {Object} The current settings
     */
    getSettings() {
        return this.get('settings', 'app') || INITIAL_STATE.settings.app;
    }
    
    /**
     * Update application settings
     * @param {Object} updates - The settings to update
     * @returns {Object} The updated settings
     */
    updateSettings(updates) {
        if (!updates || typeof updates !== 'object') {
            throw new Error('Updates must be an object');
        }
        
        const currentSettings = this.getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...updates,
            lastUpdated: new Date().toISOString()
        };
        
        return this.update('settings', 'app', updatedSettings);
    }
    
    // ====================================
    // Data Management
    // ====================================
    
    /**
     * Export the current state as a JSON string
     * @returns {string} JSON string of the current state
     */
    exportData() {
        return JSON.stringify(this._state, null, 2);
    }
    
    /**
     * Import data from a JSON string
     * @param {string} jsonData - The JSON data to import
     * @param {Object} [options] - Import options
     * @param {boolean} [options.merge=true] - Whether to merge with existing data (false = replace all)
     * @param {Array<string>} [options.collections] - Specific collections to import (default: all)
     * @returns {boolean} True if import was successful
     */
    importData(jsonData, { merge = true, collections } = {}) {
        try {
            const importedState = JSON.parse(jsonData);
            const errors = StateValidator.validateState(importedState);
            
            if (errors.length > 0) {
                console.error('Validation errors during import:', errors);
                return false;
            }
            
            // Migrate the imported state
            const migratedState = this._migrateState(importedState);
            
            if (merge) {
                // Create a deep copy of the current state
                const newState = this._getStateCopy();
                
                // If specific collections are specified, only update those
                const collectionsToUpdate = collections || Object.keys(migratedState);
                
                collectionsToUpdate.forEach(collection => {
                    if (migratedState[collection] !== undefined) {
                        // Special handling for UI and settings to preserve existing structure
                        if (collection === 'ui' && migratedState.ui && migratedState.ui.state) {
                            if (!newState.ui) newState.ui = { state: {} };
                            newState.ui.state = {
                                ...newState.ui.state,
                                ...migratedState.ui.state,
                                // Preserve nested objects like filters
                                filters: {
                                    ...(newState.ui.state?.filters || {}),
                                    ...(migratedState.ui.state.filters || {})
                                },
                                sortOptions: {
                                    ...(newState.ui.state?.sortOptions || {}),
                                    ...(migratedState.ui.state.sortOptions || {})
                                }
                            };
                        } else if (collection === 'settings' && migratedState.settings && migratedState.settings.app) {
                            if (!newState.settings) newState.settings = { app: {} };
                            newState.settings.app = {
                                ...newState.settings.app,
                                ...migratedState.settings.app
                            };
                        } else {
                            // For other collections, replace the entire collection
                            newState[collection] = migratedState[collection];
                        }
                    }
                });
                
                this._state = newState;
            } else {
                // Replace the entire state
                this._state = migratedState;
            }
            
            // Ensure UI and settings are properly initialized
            this._ensureUiState();
            this._ensureSettings();
            
            this._saveData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    /**
     * Clear all data and reset to initial state
     */
    clearData() {
        this._state = this._getStateCopy(INITIAL_STATE);
        this._saveData();
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
}

// Backwards compatibility helper for modules that imported saveData directly
// Accepts a DataService instance and delegates to its saveData method
export function saveData(dataService) {
    if (dataService && typeof dataService.saveData === 'function') {
        return dataService.saveData();
    }
    throw new Error('DataService instance with saveData method required');
}

