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
        // Always prefer the players array on the AppState instance if available
        const state = this.dataManager?.appState?.state;

        if (state) {
            if (!Array.isArray(state.players)) {
                // Ensure the players array exists
                state.players = [];
            }

            // Keep a legacy reference in sync
            this.dataManager.appState.players = state.players;
            return state.players;
        }

        // Fallback to any legacy property
        const legacyPlayers = this.dataManager?.appState?.players;
        if (Array.isArray(legacyPlayers)) {
            return legacyPlayers;
        }

        // As a last resort, attempt to create the players array using the
        // update method if it exists
        if (typeof this.dataManager?.appState?.update === 'function') {
            this.dataManager.appState.update({ players: [] });
            return this.dataManager.appState.state.players || [];
        }

        // If all else fails, return a new array. The caller should handle
        // persisting this if necessary.
        return [];
    }

    getAllPlayers() {
        return this._getPlayersArray();
    }

    getPlayerById(playerId) {
        return this._getPlayersArray().find(p => p.id === playerId);
    }

    createPlayer(name, playerClass, level = 1) {
        const player = new Player(name, playerClass, level);
        const players = this._getPlayersArray();
        players.push(player);

        if (typeof this.dataManager.appState.update === 'function') {
            this.dataManager.appState.update({ players });
        }

        this.dataManager.saveData();
        return player;
    }

    updatePlayer(playerId, updates) {
        const player = this.getPlayerById(playerId);
        if (!player) return null;

        Object.assign(player, updates, { updatedAt: new Date() });
        this.dataManager.saveData();
        return player;
    }

    deletePlayer(playerId) {
        const players = this._getPlayersArray();
        const index = players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            players.splice(index, 1);

            if (typeof this.dataManager.appState.update === 'function') {
                this.dataManager.appState.update({ players });
            }

            this.dataManager.saveData();
            return true;
        }
        return false;
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
