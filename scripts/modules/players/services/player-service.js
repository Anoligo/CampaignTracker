import { Player } from '../models/player-model.js';

export class PlayerService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    getAllPlayers() {
        return this.dataManager.appState.players || [];
    }

    getPlayerById(playerId) {
        return this.dataManager.appState.players.find(p => p.id === playerId);
    }

    createPlayer(name, playerClass, level = 1) {
        const player = new Player(name, playerClass, level);
        this.dataManager.appState.players.push(player);
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
        const index = this.dataManager.appState.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            this.dataManager.appState.players.splice(index, 1);
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
