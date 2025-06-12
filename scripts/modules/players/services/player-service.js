import { Player } from '../models/player-model.js';

export class PlayerService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Safely retrieve the players array from the underlying app state.
     * This ensures compatibility with both the legacy plain object state
     * and the newer AppState class which stores data in the `state` field.
     * @returns {Array} Array of players
     */
    _getPlayersArray() {
        try {
            let players = [];
            
            // 1. Try to get players from the data service's getAll method
            if (this.dataManager && typeof this.dataManager.getAll === 'function') {
                try {
                    const result = this.dataManager.getAll('players');
                    if (Array.isArray(result)) {
                        players = result;
                        console.log('Retrieved players from dataManager.getAll:', players.length);
                        return [...players];
                    }
                } catch (error) {
                    console.warn('Error getting players from dataManager.getAll:', error);
                }
            }
            
            // 2. Try to get players from appState.state.players
            if (this.dataManager && this.dataManager.appState) {
                const state = this.dataManager.appState.state || this.dataManager.appState;
                if (state && Array.isArray(state.players)) {
                    players = state.players;
                    console.log('Retrieved players from appState.state.players:', players.length);
                    return [...players];
                }
            }
            
            // 3. Try to get players from appState.players (legacy)
            if (this.dataManager && this.dataManager.appState && 
                Array.isArray(this.dataManager.appState.players)) {
                players = this.dataManager.appState.players;
                console.log('Retrieved players from appState.players (legacy):', players.length);
                return [...players];
            }
            
            // 4. If we get here, initialize an empty array
            console.log('No players found, initializing empty array');
            players = [];
            
            // Try to save the empty array back to the state
            if (this.dataManager) {
                if (this.dataManager.appState && typeof this.dataManager.appState.update === 'function') {
                    console.log('Initializing empty players array in appState');
                    this.dataManager.appState.update({ players: [] }, true);
                } else if (typeof this.dataManager.add === 'function') {
                    console.log('Initializing empty players array via dataManager');
                    // No need to do anything as the next add will create the collection
                }
            }
            
            return [...players];
        } catch (error) {
            console.error('Error in _getPlayersArray:', error);
            return [];
        }
    }

    getAllPlayers() {
        return this._getPlayersArray();
    }

    getPlayerById(playerId) {
        return this._getPlayersArray().find(p => p.id === playerId);
    }
    
    /**
     * Convert a Player instance to a plain object for storage
     * @param {Player} player - The Player instance to convert
     * @returns {Object} A plain object representing the player
     * @private
     */
    _playerToPlainObject(player) {
        if (!player) return null;
        
        console.log('Converting player to plain object:', player);
        
        // If it's already a plain object, handle it
        if (typeof player !== 'object' || player === null) {
            return player;
        }
        
        // Handle Player instances
        if (player instanceof Player) {
            // Create a plain object with all properties, including non-enumerable ones
            const plainPlayer = {
                id: player.id,
                name: player.name,
                // Map both 'class' and 'playerClass' to ensure compatibility
                playerClass: player.playerClass || player.class || 'fighter',
                level: player.level,
                experience: player.experience || 0,
                inventory: Array.isArray(player.inventory) ? [...player.inventory] : [],
                activeQuests: Array.isArray(player.activeQuests) ? [...player.activeQuests] : [],
                completedQuests: Array.isArray(player.completedQuests) ? [...player.completedQuests] : [],
                createdAt: player.createdAt ? new Date(player.createdAt).toISOString() : new Date().toISOString(),
                updatedAt: player.updatedAt ? new Date(player.updatedAt).toISOString() : new Date().toISOString()
            };
            
            console.log('Converted Player instance to plain object:', plainPlayer);
            return plainPlayer;
        }
        
        // Handle plain objects - ensure playerClass is properly set
        const result = { ...player };
        
        // Map 'class' to 'playerClass' if needed
        if ((result.class && !result.playerClass) || (result.class && result.playerClass !== result.class)) {
            result.playerClass = result.class;
        }
        
        // Ensure required fields are present
        if (!result.playerClass) {
            result.playerClass = 'fighter'; 
        }
        
        // Clean up any class property to avoid confusion
        if ('class' in result) {
            delete result.class;
        }
        
        // Ensure dates are properly formatted
        if (result.createdAt && !(result.createdAt instanceof Date)) {
            result.createdAt = new Date(result.createdAt).toISOString();
        } else if (!result.createdAt) {
            result.createdAt = new Date().toISOString();
        }
        
        if (result.updatedAt && !(result.updatedAt instanceof Date)) {
            result.updatedAt = new Date(result.updatedAt).toISOString();
        } else if (!result.updatedAt) {
            result.updatedAt = new Date().toISOString();
        }
        
        // Ensure arrays are properly initialized
        result.inventory = Array.isArray(result.inventory) ? [...result.inventory] : [];
        result.activeQuests = Array.isArray(result.activeQuests) ? [...result.activeQuests] : [];
        result.completedQuests = Array.isArray(result.completedQuests) ? [...result.completedQuests] : [];
        
        console.log('Processed plain object player:', result);
        return result;
    }

    _saveData() {
        try {
            if (this.dataManager && this.dataManager._saveData) {
                this.dataManager._saveData();
                console.log('Data saved successfully via _saveData');
                return true;
            } 
            if (this.dataManager && typeof this.dataManager.saveData === 'function') {
                this.dataManager.saveData();
                console.log('Data saved successfully via saveData');
                return true;
            }
            console.warn('No save method available on dataManager');
            return false;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    createPlayer(name, playerClass, level = 1) {
        try {
            console.log('Creating new player:', { name, playerClass, level });
            
            // Define PlayerClass enum values
            const PlayerClass = {
                ALCHEMIST: 'alchemist',
                BARBARIAN: 'barbarian',
                BARD: 'bard',
                CHAMPION: 'champion',
                CLERIC: 'cleric',
                DRUID: 'druid',
                FIGHTER: 'fighter',
                INVENTOR: 'inventor',
                INVESTIGATOR: 'investigator',
                KINETICIST: 'kineticist',
                MAGUS: 'magus',
                MONK: 'monk',
                ORACLE: 'oracle',
                PSYCHIC: 'psychic',
                RANGER: 'ranger',
                ROGUE: 'rogue',
                SORCERER: 'sorcerer',
                SUMMONER: 'summoner',
                SWASHBUCKLER: 'swashbuckler',
                THAUMATURGE: 'thaumaturge',
                WITCH: 'witch',
                WIZARD: 'wizard',
                GUNSLINGER: 'gunslinger'
            };
            
            // Validate playerClass against the PlayerClass enum
            const validPlayerClasses = Object.values(PlayerClass);
            const validatedClass = validPlayerClasses.includes(playerClass) ? playerClass : 'fighter';
            
            // Create a new player instance
            const player = new Player(name, validatedClass, level);
            
            // Convert Player instance to plain object for storage
            const playerData = this._playerToPlainObject(player);
            
            // Log the player data being created
            console.log('Player data to save:', playerData);
            
            // Get the current players array to check for duplicates
            const currentPlayers = this._getPlayersArray();
            const playerExists = currentPlayers.some(p => p.id === playerData.id);
            
            // Update the state using the data service if available
            if (this.dataManager) {
                if (this.dataManager.add && !playerExists) {
                    console.log('Adding new player via data service');
                    const addedPlayer = this.dataManager.add('players', playerData);
                    
                    // Force a save to ensure persistence
                    this._saveData();
                    console.log('Player added successfully via data service:', addedPlayer);
                    return addedPlayer;
                } 
                else if (this.dataManager.update && playerExists) {
                    console.log('Updating existing player via data service');
                    const updatedPlayer = this.dataManager.update('players', playerData.id, playerData);
                    this._saveData();
                    console.log('Player updated successfully via data service:', updatedPlayer);
                    return updatedPlayer;
                }
                // Fallback to appState.update if available
                else if (this.dataManager.appState && typeof this.dataManager.appState.update === 'function') {
                    console.log('Updating players array via appState.update');
                    const updatedPlayers = [...currentPlayers];
                    const existingIndex = updatedPlayers.findIndex(p => p.id === playerData.id);
                    
                    if (existingIndex >= 0) {
                        updatedPlayers[existingIndex] = playerData;
                    } else {
                        updatedPlayers.push(playerData);
                    }
                    
                    this.dataManager.appState.update({ players: updatedPlayers }, true);
                    console.log('Players array updated via appState.update');
                    return playerData;
                }
            }
            
            console.error('No valid update method available on dataManager');
            return null;
        } catch (error) {
            console.error('Error in createPlayer:', error);
            throw error; // Re-throw to allow handling by the caller
        }
    }

    updatePlayer(playerId, updates) {
        try {
            console.log('Updating player:', playerId, 'with updates:', updates);
            
            // Get the current players array and find the player
            const players = this._getPlayersArray();
            const playerIndex = players.findIndex(p => p && p.id === playerId);
            
            if (playerIndex === -1) {
                console.error(`Player with ID ${playerId} not found`);
                return null;
            }
            
            // Get the existing player and apply updates
            const existingPlayer = players[playerIndex];
            const updatedPlayer = {
                ...existingPlayer,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            console.log('Updated player object:', updatedPlayer);
            
            // Convert to plain object if it's a Player instance
            const plainPlayer = this._playerToPlainObject(updatedPlayer);
            
            // Update the players array
            players[playerIndex] = plainPlayer;
            
            // Update the state using the data service if available
            if (this.dataManager && this.dataManager.update) {
                console.log('Updating player in data service:', plainPlayer);
                this.dataManager.update('players', playerId, plainPlayer);
            } 
            // Fallback to appState.update if available
            else if (this.dataManager && this.dataManager.appState && this.dataManager.appState.update) {
                console.log('Updating app state with players:', players);
                this.dataManager.appState.update({ players }, true);
            } else {
                console.error('No valid update method available on dataManager');
                return null;
            }
            
            // Force a save to ensure persistence
            if (this.dataManager && typeof this.dataManager.saveData === 'function') {
                this.dataManager.saveData();
                console.log('Player updated and data saved');
            } else {
                console.error('saveData method not available on dataManager');
            }
            
            return plainPlayer;
        } catch (error) {
            console.error('Error updating player:', error);
            throw error;
        }
    }

    deletePlayer(playerId) {
        try {
            console.log('Deleting player:', playerId);
            
            // Get the current players array
            const players = this._getPlayersArray();
            const index = players.findIndex(p => p && p.id === playerId);
            
            if (index === -1) {
                console.error(`Player with ID ${playerId} not found`);
                return false;
            }
            
            // Remove the player from the array
            players.splice(index, 1);
            
            // Update the state using the data service if available
            if (this.dataManager && this.dataManager.update) {
                console.log('Removing player from data service:', playerId);
                this.dataManager.remove('players', playerId);
            } 
            // Fallback to appState.update if available
            else if (this.dataManager && this.dataManager.appState && this.dataManager.appState.update) {
                console.log('Updating app state after player removal');
                this.dataManager.appState.update({ players }, true);
            } else {
                console.error('No valid update method available on dataManager');
                return false;
            }
            
            // Force a save to ensure persistence
            if (this.dataManager && typeof this.dataManager.saveData === 'function') {
                this.dataManager.saveData();
                console.log('Player deleted and data saved');
            } else {
                console.error('saveData method not available on dataManager');
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting player:', error);
            throw error;
        }
    }

    addItemToPlayer(playerId, item) {
        const player = this.getPlayerById(playerId);
        if (!player) return false;
        
        // Ensure inventory is an array
        if (!Array.isArray(player.inventory)) {
            player.inventory = [];
        }
        
        // Only store the item ID in the inventory
        if (item && item.id && !player.inventory.includes(item.id)) {
            player.inventory.push(item.id);
            player.updatedAt = new Date();
            this.dataManager.saveData();
            return true;
        }
        return false;
    }
    
    removeItemFromPlayer(playerId, itemId) {
        const player = this.getPlayerById(playerId);
        if (!player || !Array.isArray(player.inventory)) {
            return false;
        }
        
        const initialLength = player.inventory.length;
        player.inventory = player.inventory.filter(id => id !== itemId);
        
        if (player.inventory.length !== initialLength) {
            player.updatedAt = new Date();
            this.dataManager.saveData();
            return true;
        }
        return false;
    }

    addQuestToPlayer(playerId, questId, isCompleted = false) {
        const player = this.getPlayerById(playerId);
        if (player) {
            if (isCompleted) {
                player.addCompletedQuest(questId);
            } else {
                player.addActiveQuest(questId);
            }
            this.dataManager.saveData();
            return true;
        }
        return false;
    }
}
