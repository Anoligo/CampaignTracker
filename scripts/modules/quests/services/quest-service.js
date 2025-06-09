import { Quest } from '../models/quest-model.js';

export class QuestService {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    getAllQuests() {
        try {
            if (!this.dataManager || !this.dataManager.appState) {
                console.error('Data manager or appState is not available');
                return [];
            }
            
            // Ensure quests is an array
            if (!Array.isArray(this.dataManager.appState.quests)) {
                console.log('Initializing quests array in appState');
                this.dataManager.appState.quests = [];
                this._saveQuests([]);
                return [];
            }
            
            const quests = this.dataManager.appState.quests || [];
            console.log('QuestService.getAllQuests: Found', quests.length, 'quests in state');
            
            // Convert plain objects to Quest instances
            const convertedQuests = quests.map(questData => {
                try {
                    if (questData instanceof Quest) {
                        return questData;
                    }
                    
                    if (typeof questData === 'object' && questData !== null) {
                        console.log('Converting plain object to Quest:', questData);
                        const quest = new Quest(
                            questData.name || 'Unnamed Quest',
                            questData.description || '',
                            questData.type || 'main',
                            questData.createdAt ? new Date(questData.createdAt) : new Date(),
                            questData.updatedAt ? new Date(questData.updatedAt) : new Date(),
                            questData.status || 'active',
                            questData.id || `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                        );
                        
                        // Copy any additional properties
                        Object.assign(quest, questData);
                        return quest;
                    }
                    
                    console.warn('Invalid quest data format:', questData);
                    return null;
                } catch (error) {
                    console.error('Error converting quest data:', error, questData);
                    return null;
                }
            }).filter(quest => quest !== null);
            
            console.log('Converted quests:', convertedQuests);
            return convertedQuests;
            
        } catch (error) {
            console.error('Error in getAllQuests:', error);
            return [];
        }
    }

    getQuestById(id) {
        return this.getAllQuests().find(quest => quest.id === id);
    }

    createQuest(questData) {
        try {
            console.log('Creating quest with data:', questData);
            
            // Ensure we have required fields
            if (!questData || typeof questData !== 'object') {
                throw new Error('Invalid quest data');
            }
            
            if (!questData.name) {
                throw new Error('Quest name is required');
            }
            
            // Get current quests
            const quests = this.getAllQuests();
            
            // Check if this is an update to an existing quest
            const existingQuestIndex = quests.findIndex(q => q.id === questData.id);
            let newQuest;
            
            if (existingQuestIndex >= 0) {
                // Update existing quest
                newQuest = quests[existingQuestIndex];
                newQuest.name = questData.name || newQuest.name;
                newQuest.description = questData.description !== undefined ? questData.description : newQuest.description;
                newQuest.type = questData.type || newQuest.type;
                newQuest.status = questData.status || newQuest.status;
                newQuest.updatedAt = new Date();
                
                // Update related data if provided
                if (Array.isArray(questData.journalEntries)) {
                    newQuest.journalEntries = [...questData.journalEntries];
                }
                if (Array.isArray(questData.relatedItems)) {
                    newQuest.relatedItems = [...questData.relatedItems];
                }
                if (Array.isArray(questData.relatedLocations)) {
                    newQuest.relatedLocations = [...questData.relatedLocations];
                }
                if (Array.isArray(questData.relatedCharacters)) {
                    newQuest.relatedCharacters = [...questData.relatedCharacters];
                }
                
                quests[existingQuestIndex] = newQuest;
                console.log('Updated existing quest:', newQuest);
            } else {
                // Create new quest
                newQuest = new Quest(
                    questData.name,
                    questData.description || '',
                    questData.type || 'main',
                    questData.createdAt ? new Date(questData.createdAt) : new Date(),
                    new Date(), // updatedAt
                    questData.status || 'active',
                    questData.id || `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                );
                
                // Add related data if provided
                if (Array.isArray(questData.journalEntries)) {
                    newQuest.journalEntries = [...questData.journalEntries];
                }
                if (Array.isArray(questData.relatedItems)) {
                    newQuest.relatedItems = [...questData.relatedItems];
                }
                if (Array.isArray(questData.relatedLocations)) {
                    newQuest.relatedLocations = [...questData.relatedLocations];
                }
                if (Array.isArray(questData.relatedCharacters)) {
                    newQuest.relatedCharacters = [...questData.relatedCharacters];
                }
                
                quests.push(newQuest);
                console.log('Created new quest:', newQuest);
            }
            
            // Save the updated quests
            this._saveQuests(quests);
            return newQuest;
        } catch (error) {
            console.error('Error in createQuest:', error);
            throw error;
        }
    }

    updateQuest(id, updates) {
        const quests = this.getAllQuests();
        const index = quests.findIndex(q => q.id === id);
        
        if (index === -1) return null;
        
        // Create a new quest object with updated fields
        const updatedQuest = { ...quests[index] };
        
        // Update fields if they exist in updates
        if (updates.name !== undefined) updatedQuest.name = updates.name;
        if (updates.description !== undefined) updatedQuest.description = updates.description;
        if (updates.type !== undefined) updatedQuest.type = updates.type;
        if (updates.status !== undefined) updatedQuest.status = updates.status;
        if (updates.journalEntries !== undefined) updatedQuest.journalEntries = [...updates.journalEntries];
        if (updates.relatedItems !== undefined) updatedQuest.relatedItems = [...updates.relatedItems];
        if (updates.relatedLocations !== undefined) updatedQuest.relatedLocations = [...updates.relatedLocations];
        if (updates.relatedCharacters !== undefined) updatedQuest.relatedCharacters = [...updates.relatedCharacters];
        
        // Always update the timestamp
        updatedQuest.updatedAt = new Date();
        
        // Update the quest in the array
        quests[index] = updatedQuest;
        
        // Save the updated quests array
        this._saveQuests(quests);
        
        return updatedQuest;
    }

    deleteQuest(id) {
        const quests = this.getAllQuests().filter(q => q.id !== id);
        this._saveQuests(quests);
        return true;
    }

    addJournalEntry(questId, entry) {
        const quest = this.getQuestById(questId);
        if (!quest) return null;
        
        // Create a new journal entries array with the new entry
        const updatedEntries = [
            ...(quest.journalEntries || []),
            {
                ...entry,
                timestamp: entry.timestamp || new Date()
            }
        ];
        
        // Update the quest with the new journal entries
        return this.updateQuest(questId, {
            ...quest,
            journalEntries: updatedEntries
        });
    }

    _saveQuests(quests) {
        try {
            if (!Array.isArray(quests)) {
                console.error('Invalid quests array provided to _saveQuests');
                return [];
            }
            
            // Convert Quest instances to plain objects for storage
            const questsToSave = quests.map(quest => {
                if (quest instanceof Quest) {
                    // Convert to plain object
                    const plainQuest = { ...quest };
                    // Ensure dates are properly serialized
                    if (quest.createdAt instanceof Date) {
                        plainQuest.createdAt = quest.createdAt.toISOString();
                    }
                    if (quest.updatedAt instanceof Date) {
                        plainQuest.updatedAt = quest.updatedAt.toISOString();
                    }
                    return plainQuest;
                }
                return quest;
            });
            
            console.log('Saving quests to state:', questsToSave);
            
            // Update the state using the AppState's update method
            if (this.dataManager.appState && typeof this.dataManager.appState.update === 'function') {
                // Use the update method which will handle saving to storage
                this.dataManager.appState.update({ quests: questsToSave });
                console.log('State updated via appState.update');
            } else {
                console.error('appState.update is not available');
                
                // Fallback to direct assignment if update method is not available
                if (this.dataManager.appState) {
                    this.dataManager.appState.quests = questsToSave;
                    
                    // Try to save to local storage directly
                    if (typeof Storage !== 'undefined' && this.dataManager.appState._saveState) {
                        this.dataManager.appState._saveState();
                        console.log('State saved via _saveState');
                    } else {
                        console.error('Unable to save state: _saveState not available');
                    }
                } else {
                    console.error('appState is not available');
                }
            }
            
            return quests;
        } catch (error) {
            console.error('Error in _saveQuests:', error);
            throw error;
        }
    }
}
