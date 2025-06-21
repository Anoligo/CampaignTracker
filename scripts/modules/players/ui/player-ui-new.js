/**
 * Player UI Component
 * Handles the rendering and interaction for player-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { formatEnumValue } from '../../../utils/style-utils.js';
import { gameDataService } from '../../game-data/services/game-data-service.js';

export class PlayerUI extends BaseUI {
    /**
     * Create a new PlayerUI instance
     * @param {Object} playerService - Instance of PlayerService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(playerManager) {
        // Call super() first before accessing 'this'
        super({
            containerId: 'players',
            listId: 'playerList',
            detailsId: 'playerDetails',
            searchId: 'playerSearch',
            addButtonId: 'addPlayerBtn',
            entityName: 'player',
            getAll: () => {
                const players = playerManager.getAllPlayers();
                console.log('getAll called, returning players:', players);
                return players;
            },
            getById: (id) => playerManager.getPlayerById(id),
            add: (player) => playerManager.createPlayer(player),
            update: (id, updates) => playerManager.updatePlayer(id, updates),
            delete: (id) => playerManager.deletePlayer(id)
        });
        
        // Now it's safe to use 'this'
        this._isInitializing = true;
        
        // Store references
        this.playerManager = playerManager;
        this.service = playerManager.playerService;
        this.dataManager = playerManager.dataManager;
        
        // Add debug logging
        console.log('PlayerUI constructor called');
        console.log('PlayerManager:', playerManager);
        
        // Check if playerManager has the required methods
        if (typeof playerManager.getAllPlayers === 'function') {
            try {
                const players = playerManager.getAllPlayers();
                console.log('Players available:', players);
            } catch (error) {
                console.warn('Error getting players:', error);
            }
        } else {
            console.warn('PlayerManager does not have getAllPlayers method');
        }
        
        // Check if DOM elements exist before initializing
        console.log('DOM check - playerList element:', document.getElementById('playerList'));
        console.log('DOM check - playerDetails element:', document.getElementById('playerDetails'));
        console.log('DOM check - players container:', document.getElementById('players'));
        
        // Bind additional methods
        this.formatClassName = this.formatClassName.bind(this);
        
        // Double check if the list element was found after initialization
        console.log('After init - this.listElement:', this.listElement);
        
        // Try to directly initialize the list after a short delay
        // to ensure the DOM is ready and prevent infinite loops
        this._isInitializing = false;
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (!this._isInitializing) {
                    console.log('Delayed check - trying to render list directly');
                    this.renderList().catch(error => {
                        console.error('Error rendering player list:', error);
                    });
                }
            }, 100);
        });
    }
    
    /**
     * Create a list item for a player
     * @param {Object} player - Player to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(player) {
        // Create a card-style list item to match the Quests section
        const listItem = document.createElement('div');
        listItem.className = 'entity-card mb-2';
        if (this.currentEntity && this.currentEntity.id === player.id) {
            listItem.classList.add('entity-card-selected');
        }
        listItem.dataset.entityId = player.id;
        
        listItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center p-2">
                <div class="d-flex flex-column">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-user-friends me-2 text-accent"></i>
                        <strong>${player.name}</strong>
                    </div>
                    <small>${this.formatClassName(player.class) || 'Unknown Class'} (Level ${player.level || 1})</small>
                </div>
                <span class="badge bg-secondary rounded-pill">${player.status || 'Active'}</span>
            </div>
        `;
        
        listItem.addEventListener('click', () => {
            this.handleSelect(player.id);
        });
        
        return listItem;
    }
    
    /**
     * Render the details for a player
     * @param {Object} player - Player to render details for
     */
    renderDetails(player) {
        if (!this.detailsElement) return;
        
        if (!player) {
            this.detailsElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends fa-3x mb-3"></i>
                    <p class="empty-state-message">Select a player to view details</p>
                </div>
            `;
            return;
        }
        
        // Get all quests and items from the data manager
        const quests = this.dataManager.appState.quests || [];
        const items = this.dataManager.appState.loot || [];
        
        // Initialize player properties if they don't exist
        const playerActiveQuests = player.activeQuests || [];
        const playerCompletedQuests = player.completedQuests || [];
        const playerInventory = player.inventory || [];
        
        // Filter out quests that are already assigned to the player
        const availableQuests = quests.filter(quest => 
            !playerActiveQuests.some(q => q.id === quest.id) && 
            !playerCompletedQuests.some(q => q.id === quest.id)
        );
        
        // Filter out items that are already in the player's inventory
        const availableItems = items.filter(item => 
            !playerInventory.some(i => i === item.id)
        );

        // Create HTML for inventory items
        let inventoryHtml = '';
        if (playerInventory.length > 0) {
            inventoryHtml = playerInventory.map(itemId => {
                const item = items.find(i => i.id === itemId);
                if (!item) return '';
                return `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>${item.name || 'Unnamed Item'}</span>
                        <button class="btn btn-sm btn-outline-danger remove-item" data-item-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }).join('');
        } else {
            inventoryHtml = '<p class="text-muted">No items in inventory</p>';
        }

        // Create HTML for active quests
        let activeQuestsHtml = '';
        if (playerActiveQuests.length > 0) {
            activeQuestsHtml = playerActiveQuests.map(quest => {
                return `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>${quest.name || 'Unnamed Quest'}</span>
                        <div>
                            <button class="btn btn-sm btn-outline-success me-1 complete-quest" data-quest-id="${quest.id}">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger remove-quest" data-quest-id="${quest.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            activeQuestsHtml = '<p class="text-muted">No active quests</p>';
        }

        // Create sections for player details
        const sections = [
            {
                title: 'Basic Information',
                content: `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Class:</strong> ${this.formatClassName(player.class) || 'Unknown'}</p>
                            <p><strong>Level:</strong> ${player.level || 1}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Experience:</strong> ${player.experience || 0}</p>
                            <p><strong>Status:</strong> <span class="badge bg-secondary">${player.status || 'Active'}</span></p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Inventory',
                content: `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        ${availableItems.length > 0 ? `
                            <button class="btn btn-sm btn-success" id="addItemBtn">
                                <i class="fas fa-plus"></i> Add Item
                            </button>
                        ` : ''}
                    </div>
                    <div id="inventoryItems">
                        ${inventoryHtml}
                    </div>
                `
            },
            {
                title: 'Active Quests',
                content: `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        ${availableQuests.length > 0 ? `
                            <button class="btn btn-sm btn-success" id="addActiveQuestBtn">
                                <i class="fas fa-plus"></i> Add Quest
                            </button>
                        ` : ''}
                    </div>
                    <div id="activeQuestsList">
                        ${activeQuestsHtml}
                    </div>
                `
            }
        ];
        
        // Create details panel using the createDetailsPanel helper function
        const detailsPanel = createDetailsPanel({
            title: player.name,
            data: player,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEdit(player)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDelete(player.id)
                }
            ],
            sections: sections
        });
        
        // Clear the details element and append the new details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(detailsPanel);
        
        // Set up event listeners for the details panel
        this.setupEventListeners(player);
    }
    
    /**
     * Set up event listeners for the player details panel
     * @param {Object} player - Player object
     */
    setupEventListeners(player) {
        // Edit button
        const editBtn = document.getElementById('edit-player-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEdit(player));
        }
        
        // Delete button
        const deleteBtn = document.getElementById('delete-player-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete(player.id));
        }
        
        // Add Item button
        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.handleAddItem(player));
        }
        
        // Add Quest button
        const addQuestBtn = document.getElementById('addActiveQuestBtn');
        if (addQuestBtn) {
            addQuestBtn.addEventListener('click', () => this.handleAddQuest(player));
        }
        
        // Remove Item buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-item-id');
                this.handleRemoveItem(player, itemId);
            });
        });
        
        // Complete Quest buttons
        document.querySelectorAll('.complete-quest').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questId = e.currentTarget.getAttribute('data-quest-id');
                this.handleCompleteQuest(player, questId);
            });
        });
        
        // Remove Quest buttons
        document.querySelectorAll('.remove-quest').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questId = e.currentTarget.getAttribute('data-quest-id');
                this.handleRemoveQuest(player, questId);
            });
        });
    }
    
    /**
     * Handle adding a new player
     */
    handleAddPlayer() {
        // Implementation will be added later
        alert('Add player functionality will be implemented soon');
    }
    
    /**
     * Handle editing a player
     * @param {Object} player - Player to edit
     */
    handleEdit(player) {
        if (!player || !player.id) {
            console.warn('No player provided for editing');
            return;
        }

        if (this.playerManager && this.playerManager.forms) {
            this.playerManager.forms.showEditPlayerForm(player.id);
        } else {
            console.error('Player manager or forms not available');
        }
    }
    
    /**
     * Handle adding an item to a player's inventory
     * @param {Object} player - Player to add item to
     */
    handleAddItem(player) {
        // Implementation will be added later
        alert('Add item functionality will be implemented soon');
    }
    
    /**
     * Handle removing an item from a player's inventory
     * @param {Object} player - Player to remove item from
     * @param {string} itemId - ID of the item to remove
     */
    handleRemoveItem(player, itemId) {
        if (confirm('Are you sure you want to remove this item from the player\'s inventory?')) {
            const updatedInventory = (player.inventory || []).filter(id => id !== itemId);
            this.update(player.id, { inventory: updatedInventory });
            showToast({
                message: 'Item removed from inventory',
                type: 'success'
            });
        }
    }
    
    /**
     * Handle adding a quest to a player
     * @param {Object} player - Player to add quest to
     */
    handleAddQuest(player) {
        // Implementation will be added later
        alert('Add quest functionality will be implemented soon');
    }
    
    /**
     * Handle completing a quest
     * @param {Object} player - Player who completed the quest
     * @param {string} questId - ID of the quest to complete
     */
    handleCompleteQuest(player, questId) {
        const activeQuests = player.activeQuests || [];
        const completedQuests = player.completedQuests || [];
        
        const quest = activeQuests.find(q => q.id === questId);
        if (!quest) return;
        
        const updatedActiveQuests = activeQuests.filter(q => q.id !== questId);
        const updatedCompletedQuests = [...completedQuests, quest];
        
        this.update(player.id, {
            activeQuests: updatedActiveQuests,
            completedQuests: updatedCompletedQuests
        });
        
        showToast({
            message: 'Quest marked as completed',
            type: 'success'
        });
    }
    
    /**
     * Handle removing a quest from a player
     * @param {Object} player - Player to remove quest from
     * @param {string} questId - ID of the quest to remove
     */
    handleRemoveQuest(player, questId) {
        if (confirm('Are you sure you want to remove this quest?')) {
            const updatedActiveQuests = (player.activeQuests || []).filter(q => q.id !== questId);
            this.update(player.id, { activeQuests: updatedActiveQuests });
            showToast({
                message: 'Quest removed from player',
                type: 'success'
            });
        }
    }
    
    /**
     * Format a class name for display
     * @param {string} className - Class name to format
     * @returns {string} Formatted class name
     */
    formatClassName(className) {
        if (!className) return 'Unknown';
        return gameDataService.getClassName(className) || formatEnumValue(className);
    }
    
    /**
     * Override the renderList method from BaseUI to add debugging
     * @param {Array} entities - Entities to render (optional)
     */
    /**
     * Render the list of players
     * @param {Array} [entities] - Optional array of players to render
     * @returns {Promise<void>}
     */
    renderList(entities) {
        return new Promise((resolve, reject) => {
            try {
                console.log('PlayerUI.renderList called with entities:', entities);
                
                // Ensure we have the list element
                if (!this.listElement) {
                    console.error('List element not found!');
                    this.listElement = document.getElementById('playerList');
                    if (!this.listElement) {
                }
            }
            
            // Always get fresh data from the service
            const allPlayers = this.service.getAllPlayers();
            console.log('All players from service:', allPlayers);
            
            // Use provided entities if available, otherwise use all players
            const playersToRender = Array.isArray(entities) && entities.length > 0 ? entities : allPlayers;
            
            console.log('Rendering players:', playersToRender);
            
            // Clear the list
            this.listElement.innerHTML = '';
            
            if (!playersToRender || playersToRender.length === 0) {
                console.log('No players to render, showing empty state');
                this.listElement.innerHTML = `
                    <div class="text-center p-3 text-muted">
                        No players found. Click "Add player" to create one.
                    </div>
                `;
                resolve();
                return;
            }
            
            // Create document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Render each player as a list item
            playersToRender.forEach(player => {
                if (!player || typeof player !== 'object') {
                    console.warn('Invalid player data:', player);
                    return;
                }
                
                console.log('Creating list item for player:', player);
                const listItem = this.createListItem(player);
                if (listItem) {
                    fragment.appendChild(listItem);
                }
            });
            
            // Append all at once
            this.listElement.appendChild(fragment);
            
            console.log(`Rendered ${playersToRender.length} players`);
            
            // If we have a selected player, highlight it
            if (this.currentEntity) {
                this.highlightSelectedItem(this.currentEntity.id);
            }
            
            resolve();
        } catch (error) {
            console.error('Error rendering player list:', error);
            reject(error);
        }
    });
    }

    /**
     * Convenience method used by forms to redisplay a player's details
     * after an edit operation or when cancelling.
     * @param {string} playerId - ID of the player to show
     */
    showPlayerDetails(playerId) {
        if (playerId) {
            this.handleSelect(playerId);
        }
    }
    
    /**
     * Clean up event listeners and resources
     */
    cleanup() {
        console.log('[PlayerUI] Cleaning up...');
        
        // Remove any event listeners or clean up resources here
        // For example, if you have any event listeners on window/document:
        // window.removeEventListener('resize', this.handleResize);
        
        // Clear any intervals or timeouts
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        
        // Clear references to DOM elements
        this.listElement = null;
        this.detailsElement = null;
        this.searchInput = null;
        this.addButton = null;
        
        console.log('[PlayerUI] Cleanup complete');
    }
}
