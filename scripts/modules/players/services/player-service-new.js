/**
 * Player Service
 * Handles all player-related data operations using the unified appState pattern
 */

import { Player } from '../models/player-model.js';
import { PlayerClass, PlayerRace } from '../enums/player-enums.js';

export class PlayerService {
    /**
     * Create a new PlayerService instance
     * @param {Object} dataManager - The application's data manager (DataService)
     */
    constructor(dataManager) {
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        this.dataManager = dataManager;
        this.STORAGE_KEY = 'players';
        this.initialize();
    }
    
    /**
     * Initialize the service
     * @private
     */
    initialize() {
        // Ensure players array exists in appState
        if (!Array.isArray(this.dataManager.appState[this.STORAGE_KEY])) {
            this.dataManager.appState[this.STORAGE_KEY] = [];
            this._saveState();
        }
    }
    
    /**
     * Save the current state
     * @private
     * @returns {boolean} True if save was successful
     */
    _saveState() {
        try {
            this.dataManager.saveData();
            return true;
        } catch (error) {
            console.error('Error saving player data:', error);
            return false;
        }
    }
    
    /**
     * Get all players
     * @returns {Array<Object>} Array of players
     */
    getAllPlayers() {
        return [...(this.dataManager.appState[this.STORAGE_KEY] || [])];
    }
    
    /**
     * Get a player by ID
     * @param {string} id - Player ID
     * @returns {Object|undefined} The player or undefined if not found
     */
    getPlayerById(id) {
        if (!id) return undefined;
        return this.dataManager.appState[this.STORAGE_KEY]?.find(player => player.id === id);
    }
    
    /**
     * Create a new player
     * @param {Object} data - Player data
     * @returns {Object} The created player
     */
    createPlayer(data) {
        try {
            if (!data) {
                throw new Error('Player data is required');
            }
            
            // Ensure players array exists
            if (!Array.isArray(this.dataManager.appState[this.STORAGE_KEY])) {
                this.dataManager.appState[this.STORAGE_KEY] = [];
            }
            
            // Validate player class
            const playerClass = Object.values(PlayerClass).includes(data.playerClass) 
                ? data.playerClass 
                : PlayerClass.FIGHTER;
                
            // Validate race
            const race = Object.values(PlayerRace).includes(data.race)
                ? data.race
                : PlayerRace.HUMAN;
            
            // Create player with required fields and defaults
            const player = new Player(
                data.name || 'Unnamed Player',
                playerClass,
                typeof data.level === 'number' ? data.level : 1,
                race,
                data.id || `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            );
            
            // Add optional fields
            if (data.experience !== undefined) player.experience = data.experience;
            if (data.hitPoints !== undefined) player.hitPoints = data.hitPoints;
            if (data.maxHitPoints !== undefined) player.maxHitPoints = data.maxHitPoints;
            if (data.armorClass !== undefined) player.armorClass = data.armorClass;
            if (data.initiative !== undefined) player.initiative = data.initiative;
            if (data.speed !== undefined) player.speed = data.speed;
            if (data.notes !== undefined) player.notes = data.notes;
            if (data.inventory) player.inventory = [...data.inventory];
            if (data.conditions) player.conditions = [...data.conditions];
            if (data.activeQuests) player.activeQuests = [...data.activeQuests];
            if (data.completedQuests) player.completedQuests = [...data.completedQuests];
            
            // Add timestamps
            player.createdAt = new Date().toISOString();
            player.updatedAt = new Date().toISOString();
            
            // Add to the players array
            this.dataManager.appState[this.STORAGE_KEY] = [
                ...this.dataManager.appState[this.STORAGE_KEY],
                player
            ];
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to save player');
            }
            
            return player;
        } catch (error) {
            console.error('Error creating player:', error);
            throw error;
        }
    }
    
    /**
     * Update a player
     * @param {string} id - Player ID
     * @param {Object} updates - Updates to apply
     * @returns {Object|undefined} The updated player or undefined if not found
     */
    updatePlayer(id, updates) {
        try {
            if (!id || !updates) {
                throw new Error('ID and updates are required');
            }
            
            const index = this.dataManager.appState[this.STORAGE_KEY]?.findIndex(p => p.id === id) ?? -1;
            if (index === -1) {
                console.warn(`Player with ID ${id} not found`);
                return undefined;
            }
            
            // Create updated player
            const updatedPlayer = {
                ...this.dataManager.appState[this.STORAGE_KEY][index],
                ...updates,
                id, // Ensure ID doesn't change
                updatedAt: new Date().toISOString()
            };
            
            // Update the array
            const updatedPlayers = [...this.dataManager.appState[this.STORAGE_KEY]];
            updatedPlayers[index] = updatedPlayer;
            this.dataManager.appState[this.STORAGE_KEY] = updatedPlayers;
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to update player');
            }
            
            return updatedPlayer;
        } catch (error) {
            console.error(`Error updating player ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a player
     * @param {string} id - Player ID
     * @returns {boolean} True if deleted, false if not found
     */
    deletePlayer(id) {
        try {
            if (!id) {
                throw new Error('ID is required');
            }
            
            const initialLength = this.dataManager.appState[this.STORAGE_KEY]?.length || 0;
            this.dataManager.appState[this.STORAGE_KEY] = 
                this.dataManager.appState[this.STORAGE_KEY]?.filter(p => p.id !== id) || [];
            
            if (this.dataManager.appState[this.STORAGE_KEY].length === initialLength) {
                console.warn(`Player with ID ${id} not found`);
                return false;
            }
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to delete player');
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting player ${id}:`, error);
            throw error;
        }
    }
    
    // Additional player-specific methods
    
    /**
     * Add an item to a player's inventory
     * @param {string} playerId - Player ID
     * @param {Object} item - Item to add
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    addItemToInventory(playerId, item) {
        const player = this.getPlayerById(playerId);
        if (!player) return undefined;
        
        const updatedPlayer = {
            ...player,
            inventory: [...(player.inventory || []), item],
            updatedAt: new Date().toISOString()
        };
        
        return this.updatePlayer(playerId, { inventory: updatedPlayer.inventory });
    }
    
    /**
     * Remove an item from a player's inventory
     * @param {string} playerId - Player ID
     * @param {string} itemId - Item ID to remove
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    removeItemFromInventory(playerId, itemId) {
        const player = this.getPlayerById(playerId);
        if (!player || !player.inventory) return player;
        
        const updatedPlayer = {
            ...player,
            inventory: player.inventory.filter(item => item.id !== itemId),
            updatedAt: new Date().toISOString()
        };
        
        return this.updatePlayer(playerId, { inventory: updatedPlayer.inventory });
    }
    
    /**
     * Add a condition to a player
     * @param {string} playerId - Player ID
     * @param {string} condition - Condition to add
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    addCondition(playerId, condition) {
        const player = this.getPlayerById(playerId);
        if (!player) return undefined;
        
        const conditions = [...new Set([...(player.conditions || []), condition])];
        return this.updatePlayer(playerId, { conditions });
    }
    
    /**
     * Remove a condition from a player
     * @param {string} playerId - Player ID
     * @param {string} condition - Condition to remove
     * @returns {Object|undefined} Updated player or undefined if not found
     */
    removeCondition(playerId, condition) {
        const player = this.getPlayerById(playerId);
        if (!player || !player.conditions) return player;
        
        const conditions = player.conditions.filter(c => c !== condition);
        return this.updatePlayer(playerId, { conditions });
    }
    
    /**
     * Search players by name or notes
     * @param {string} query - Search query
     * @returns {Array<Object>} Filtered array of players
     */
    searchPlayers(query) {
        if (!query) return this.getAllPlayers();
        const q = query.toLowerCase();
        return this.getAllPlayers().filter(player => 
            (player.name && player.name.toLowerCase().includes(q)) ||
            (player.notes && player.notes.toLowerCase().includes(q))
        );
    }
    
    /**
     * Filter players by class
     * @param {string} className - Class to filter by
     * @returns {Array<Object>} Filtered array of players
     */
    filterByClass(className) {
        if (!className) return this.getAllPlayers();
        return this.getAllPlayers().filter(player => 
            player.playerClass?.toLowerCase() === className.toLowerCase()
        );
    }
    
    /**
     * Filter players by level range
     * @param {number} minLevel - Minimum level (inclusive)
     * @param {number} maxLevel - Maximum level (inclusive)
     * @returns {Array<Object>} Filtered array of players
     */
    filterByLevelRange(minLevel, maxLevel) {
        const min = typeof minLevel === 'number' ? minLevel : 1;
        const max = typeof maxLevel === 'number' ? maxLevel : Infinity;
        
        return this.getAllPlayers().filter(player => {
            const level = typeof player.level === 'number' ? player.level : 1;
            return level >= min && level <= max;
        });
    }
}

export default PlayerService;
