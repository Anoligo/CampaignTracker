/**
 * Quest Service
 * Handles all quest-related data operations using the unified appState pattern
 */

import { Quest } from '../models/quest-model.js';
import { QuestStatus, QuestType } from '../enums/quest-enums.js';

export class QuestService {
    /**
     * Create a new QuestService instance
     * @param {Object} dataManager - The application's data manager (DataService)
     */
    constructor(dataManager) {
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        this.dataManager = dataManager;
        this.STORAGE_KEY = 'quests';
        this.initialize();
    }
    
    /**
     * Initialize the service
     * @private
     */
    initialize() {
        // Ensure quests array exists in appState
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
            console.log('[QuestService] Attempting to save quest data...');
            
            // Get the current state
            const currentState = this.dataManager.appState;
            
            // Update the quests in the state if needed
            if (!Array.isArray(currentState.quests)) {
                currentState.quests = [];
            }
            
            // Trigger a save operation - DataService will handle persistence and notifications
            const saveResult = this.dataManager.saveData();
            
            if (saveResult) {
                console.log('[QuestService] Successfully saved quest data');
            } else {
                console.warn('[QuestService] Save operation may not have completed successfully');
            }
            
            return saveResult;
        } catch (error) {
            console.error('[QuestService] Error saving quest data:', error);
            
            // Log additional error details if available
            if (error instanceof Error) {
                console.error('[QuestService] Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
            }
            
            // Try to log the current state that failed to save
            try {
                const state = this.dataManager.appState;
                console.error('[QuestService] State at time of error:', JSON.stringify({
                    quests: state.quests,
                    hasQuests: Array.isArray(state.quests),
                    questsCount: state.quests?.length
                }, null, 2));
            } catch (e) {
                console.error('[QuestService] Could not log state at time of error:', e);
            }
            
            // Re-throw the error to be handled by the caller
            throw error;
        }
    }
    
    /**
     * Convert a plain object to a Quest instance
     * @private
     * @param {Object} data - Quest data
     * @returns {Quest} Quest instance
     */
    _toQuest(data) {
        if (data instanceof Quest) return data;
        
        // Handle legacy data format
        const questData = { ...data };
        
        // Normalize title/name
        if (!questData.title && questData.name) {
            questData.title = questData.name;
        } else if (questData.title && !questData.name) {
            questData.name = questData.title;
        }
        
        // Create a new Quest instance
        const quest = new Quest(
            questData.title || 'Untitled Quest',
            questData.description || '',
            Object.values(QuestType).includes(questData.type) ? questData.type : QuestType.MAIN,
            questData.createdAt ? new Date(questData.createdAt) : new Date(),
            questData.updatedAt ? new Date(questData.updatedAt) : new Date(),
            Object.values(QuestStatus).includes(questData.status) ? questData.status : QuestStatus.ACTIVE,
            questData.id || `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        );
        
        // Copy additional properties
        Object.assign(quest, questData);
        
        return quest;
    }
    
    /**
     * Get all quests
     * @param {Object} [filters] - Optional filters
     * @param {string} [filters.status] - Filter by status
     * @param {string} [filters.type] - Filter by type
     * @returns {Array<Quest>} Array of quests
     */
    getAllQuests(filters = {}) {
        let quests = [...(this.dataManager.appState[this.STORAGE_KEY] || [])];
        
        // Convert plain objects to Quest instances
        quests = quests.map(quest => this._toQuest(quest));
        
        // Apply filters
        if (filters.status) {
            quests = quests.filter(quest => quest.status === filters.status);
        }
        
        if (filters.type) {
            quests = quests.filter(quest => quest.type === filters.type);
        }
        
        return quests;
    }
    
    /**
     * Get a quest by ID
     * @param {string} id - Quest ID
     * @returns {Quest|undefined} The quest or undefined if not found
     */
    getQuestById(id) {
        if (!id) return undefined;
        const quest = this.dataManager.appState[this.STORAGE_KEY]?.find(q => q.id === id);
        return quest ? this._toQuest(quest) : undefined;
    }
    
    /**
     * Create a new quest
     * @param {Object} data - Quest data
     * @returns {Quest} The created quest
     */
    createQuest(data) {
        try {
            if (!data) {
                throw new Error('Quest data is required');
            }
            
            // Ensure quests array exists
            if (!Array.isArray(this.dataManager.appState[this.STORAGE_KEY])) {
                this.dataManager.appState[this.STORAGE_KEY] = [];
            }
            
            // Create quest with required fields and defaults
            const quest = this._toQuest({
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: data.status || QuestStatus.ACTIVE,
                type: data.type || QuestType.MAIN
            });
            
            // Add to the quests array
            this.dataManager.appState[this.STORAGE_KEY] = [
                ...this.dataManager.appState[this.STORAGE_KEY],
                quest
            ];
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to save quest');
            }
            
            return quest;
        } catch (error) {
            console.error('Error creating quest:', error);
            throw error;
        }
    }
    
    /**
     * Update a quest
     * @param {string} id - Quest ID
     * @param {Object} updates - Updates to apply
     * @returns {Quest|undefined} The updated quest or undefined if not found
     */
    updateQuest(id, updates) {
        try {
            if (!id || !updates) {
                throw new Error('ID and updates are required');
            }
            
            const index = this.dataManager.appState[this.STORAGE_KEY]?.findIndex(q => q.id === id) ?? -1;
            if (index === -1) {
                console.warn(`Quest with ID ${id} not found`);
                return undefined;
            }
            
            // Get the current quest
            const currentQuest = this._toQuest(this.dataManager.appState[this.STORAGE_KEY][index]);
            
            // Create updated quest
            const updatedQuest = {
                ...currentQuest,
                ...updates,
                id, // Ensure ID doesn't change
                updatedAt: new Date().toISOString()
            };
            
            // Convert back to Quest instance
            const quest = this._toQuest(updatedQuest);
            
            // Update the array
            const updatedQuests = [...this.dataManager.appState[this.STORAGE_KEY]];
            updatedQuests[index] = quest;
            this.dataManager.appState[this.STORAGE_KEY] = updatedQuests;
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to update quest');
            }
            
            return quest;
        } catch (error) {
            console.error(`Error updating quest ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a quest
     * @param {string} id - Quest ID
     * @returns {boolean} True if deleted, false if not found
     */
    deleteQuest(id) {
        try {
            if (!id) {
                throw new Error('ID is required');
            }
            
            const initialLength = this.dataManager.appState[this.STORAGE_KEY]?.length || 0;
            this.dataManager.appState[this.STORAGE_KEY] = 
                this.dataManager.appState[this.STORAGE_KEY]?.filter(q => q.id !== id) || [];
            
            if (this.dataManager.appState[this.STORAGE_KEY].length === initialLength) {
                console.warn(`Quest with ID ${id} not found`);
                return false;
            }
            
            // Save the state
            if (!this._saveState()) {
                throw new Error('Failed to delete quest');
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting quest ${id}:`, error);
            throw error;
        }
    }
    
    // Additional quest-specific methods
    
    /**
     * Update a quest's status
     * @param {string} id - Quest ID
     * @param {string} status - New status
     * @returns {Quest|undefined} Updated quest or undefined if not found
     */
    updateQuestStatus(id, status) {
        if (!Object.values(QuestStatus).includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        
        return this.updateQuest(id, { status });
    }
    
    /**
     * Add a note to a quest
     * @param {string} questId - Quest ID
     * @param {string} note - Note text
     * @returns {Quest|undefined} Updated quest or undefined if not found
     */
    addQuestNote(questId, note) {
        const quest = this.getQuestById(questId);
        if (!quest) return undefined;
        
        const notes = [...(quest.notes || []), {
            id: `note-${Date.now()}`,
            text: note,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }];
        
        return this.updateQuest(questId, { notes });
    }
    
    /**
     * Remove a note from a quest
     * @param {string} questId - Quest ID
     * @param {string} noteId - Note ID to remove
     * @returns {Quest|undefined} Updated quest or undefined if not found
     */
    removeQuestNote(questId, noteId) {
        const quest = this.getQuestById(questId);
        if (!quest || !quest.notes) return quest;
        
        const notes = quest.notes.filter(note => note.id !== noteId);
        return this.updateQuest(questId, { notes });
    }
    
    /**
     * Search quests by title or description
     * @param {string} query - Search query
     * @returns {Array<Quest>} Filtered array of quests
     */
    searchQuests(query) {
        if (!query) return this.getAllQuests();
        const q = query.toLowerCase();
        return this.getAllQuests().filter(quest => 
            (quest.title && quest.title.toLowerCase().includes(q)) ||
            (quest.description && quest.description.toLowerCase().includes(q))
        );
    }
    
    /**
     * Get quests by status
     * @param {string} status - Status to filter by
     * @returns {Array<Quest>} Filtered array of quests
     */
    getQuestsByStatus(status) {
        return this.getAllQuests().filter(quest => quest.status === status);
    }
    
    /**
     * Get quests by type
     * @param {string} type - Type to filter by
     * @returns {Array<Quest>} Filtered array of quests
     */
    getQuestsByType(type) {
        return this.getAllQuests().filter(quest => quest.type === type);
    }
}

export default QuestService;
