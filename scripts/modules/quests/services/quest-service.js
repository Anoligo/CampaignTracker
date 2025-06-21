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
            
            // Access quests from the internal state
            const state = this.dataManager.appState.state || {};

            // Ensure quests is an array within the state
            if (!Array.isArray(state.quests)) {
                console.log('Initializing quests array in appState');
                this.dataManager.appState.update({ quests: [] });
            }

            const quests = this.dataManager.appState.state.quests || [];
            // Keep legacy reference in sync
            this.dataManager.appState.quests = quests;
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

    async createQuest(questData) {
        try {
            console.log('Creating/updating quest with data:', questData);
            
            // Validate input
            if (!questData || typeof questData !== 'object') {
                throw new Error('Invalid quest data: must be an object');
            }

            // Create a deep copy of questData to avoid mutating the original
            const data = JSON.parse(JSON.stringify(questData));
            
            // Normalize title and name
            if (!data.title && data.name) {
                data.title = data.name;
            } else if (data.title && !data.name) {
                data.name = data.title;
            } else if (!data.title) {
                data.title = 'Untitled Quest';
                data.name = 'Untitled Quest';
            }
            
            // Ensure both title and name are set and match
            if (data.title && !data.name) {
                data.name = data.title;
            } else if (!data.title && data.name) {
                data.title = data.name;
            }
            
            // Normalize type and status to lowercase
            if (data.type) {
                data.type = data.type.toString().toLowerCase();
                const validTypes = ['main', 'side', 'personal', 'guild', 'other'];
                if (!validTypes.includes(data.type)) {
                    console.warn(`Invalid quest type '${data.type}', defaulting to 'main'`);
                    data.type = 'main';
                }
            } else {
                data.type = 'main';
            }
            
            if (data.status) {
                data.status = data.status.toString().toLowerCase();
                const validStatuses = ['available', 'ongoing', 'completed', 'failed'];
                if (!validStatuses.includes(data.status)) {
                    console.warn(`Invalid quest status '${data.status}', defaulting to 'available'`);
                    data.status = 'available';
                }
            } else {
                data.status = 'available';
            }
            
            // Set default values for required fields
            const now = new Date().toISOString();
            const defaultData = {
                description: '',
                journalEntries: [],
                relatedItems: [],
                relatedLocations: [],
                relatedCharacters: [],
                relatedFactions: [],
                relatedQuests: [],
                notes: '',
                resolution: {
                    session: '',
                    date: null,
                    xp: 0
                },
                createdAt: now,
                updatedAt: now
            };
            
            // Merge with defaults
            const finalData = { ...defaultData, ...data };
            
            // Get all quests
            const quests = this.getAllQuests();
            const existingIndex = finalData.id ? quests.findIndex(q => q.id === finalData.id) : -1;
            let quest;
            
            if (existingIndex >= 0) {
                // Update existing quest
                quest = quests[existingIndex];
                
                // Preserve the original creation date
                const originalCreatedAt = quest.createdAt || now;
                
                // Update all fields except ID and creation date
                Object.assign(quest, finalData, {
                    id: quest.id, // Preserve original ID
                    createdAt: originalCreatedAt, // Preserve original creation date
                    updatedAt: now // Update the updated timestamp
                });
                
                console.log('Updated existing quest:', quest);
            } else {
                // Create new quest
                quest = new Quest(
                    finalData.title,
                    finalData.description,
                    finalData.type,
                    finalData.createdAt,
                    finalData.updatedAt,
                    finalData.status,
                    finalData.id || `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                );
                
                // Copy additional properties
                Object.keys(finalData).forEach(key => {
                    if (!['id', 'name', 'title', 'description', 'type', 'status', 'createdAt', 'updatedAt'].includes(key)) {
                        quest[key] = Array.isArray(finalData[key]) ? [...finalData[key]] : finalData[key];
                    }
                });
                
                quests.push(quest);
                console.log('Created new quest:', quest);
            }
            
            // Save the updated quests
            await this._saveQuests(quests);
            
            // Update the global state reference if it exists
            if (this.dataManager?.appState?.state) {
                this.dataManager.appState.state.quests = quests;
                // Also update the legacy reference if it exists
                if (this.dataManager.appState.quests) {
                    this.dataManager.appState.quests = quests;
                }
            }

            console.log('Quest saved successfully:', quest.id);
            return quest;
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
        if (updates.relatedFactions !== undefined) updatedQuest.relatedFactions = [...updates.relatedFactions];
        if (updates.relatedQuests !== undefined) updatedQuest.relatedQuests = [...updates.relatedQuests];
        if (updates.notes !== undefined) updatedQuest.notes = updates.notes;
        if (updates.resolution !== undefined) {
            updatedQuest.resolution = { ...updatedQuest.resolution, ...updates.resolution };
        }
        
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

    async _saveQuests(quests) {
        if (!Array.isArray(quests)) {
            console.error('Invalid quests data - expected array, got:', quests);
            throw new Error('Invalid quests data - expected array');
        }
        
        console.log('_saveQuests called with quests:', quests);
        
        // Define valid quest types and statuses (case-insensitive)
        const validQuestTypes = ['main', 'side', 'personal', 'guild', 'other'];
        const validQuestStatuses = ['available', 'ongoing', 'completed', 'failed'];
        
        // Ensure we have a valid quests array (defensive copy)
        const validQuests = quests.filter(q => q && (q.id || q.title || q.name));
        
        if (validQuests.length === 0) {
            console.warn('No valid quests to save');
            return [];
        }
        
        // Function to normalize quest data
        const normalizeQuest = (quest) => {
            // Ensure we have a valid object
            if (!quest || typeof quest !== 'object') {
                throw new Error('Invalid quest data - expected object');
            }
            
            // Create a new object with all required fields
            const normalizedQuest = {
                id: quest.id || `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                title: quest.title || quest.name || 'Untitled Quest',
                name: quest.name || quest.title || 'Untitled Quest',
                description: quest.description || '',
                type: validQuestTypes.includes(quest.type?.toLowerCase()) 
                    ? quest.type.toLowerCase() 
                    : 'other',
                status: validQuestStatuses.includes(quest.status?.toLowerCase())
                    ? quest.status.toLowerCase()
                    : 'available',
                journalEntries: Array.isArray(quest.journalEntries) 
                    ? [...quest.journalEntries] 
                    : [],
                relatedQuests: Array.isArray(quest.relatedQuests) 
                    ? [...quest.relatedQuests] 
                    : [],
                notes: typeof quest.notes === 'string' ? quest.notes : '',
                resolution: {
                    session: quest.resolution?.session || '',
                    date: quest.resolution?.date || null,
                    xp: typeof quest.resolution?.xp === 'number' 
                        ? quest.resolution.xp 
                        : 0
                },
                createdAt: quest.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Copy over any additional properties not already handled
            Object.keys(quest).forEach(key => {
                if (!(key in normalizedQuest)) {
                    normalizedQuest[key] = quest[key];
                }
            });
            
            return normalizedQuest;
        };
        
        // Process all quests
        const questsToSave = [];
        for (const [index, quest] of validQuests.entries()) {
            try {
                const normalizedQuest = normalizeQuest(quest);
                if (normalizedQuest) {
                    questsToSave.push(normalizedQuest);
                }
            } catch (error) {
                console.error(`Error processing quest at index ${index}:`, error);
                // Continue with other quests even if one fails
            }
        }
        
        if (questsToSave.length === 0) {
            throw new Error('No valid quests could be processed');
        }
        
        // Ensure we have a reference to the data manager
        if (!this.dataManager) {
            throw new Error('DataManager is not available');
        }
        
        try {
            // Try DataService first if available
            if (this.dataManager.dataService) {
                console.log('Attempting to save via DataService');
                
                // Get current state to preserve other data
                const currentState = this.dataManager.dataService.state || {};
                
                // Update only the quests in the state
                const updatedState = {
                    ...currentState,
                    quests: questsToSave,
                    lastUpdated: new Date().toISOString()
                };
                
                // Use the proper state update method if available
                if (typeof this.dataManager.dataService.updateState === 'function') {
                    await this.dataManager.dataService.updateState(updatedState);
                    console.log('Successfully saved quests via DataService.updateState()');
                    return questsToSave;
                } 
                
                if (typeof this.dataManager.dataService._saveData === 'function') {
                    this.dataManager.dataService._state = updatedState;
                    await this.dataManager.dataService._saveData();
                    console.log('Successfully saved quests via DataService._saveData()');
                    return questsToSave;
                }
            }
            
            // Fall back to dataManager methods
            if (typeof this.dataManager.saveData === 'function') {
                console.log('Saving quests via dataManager.saveData()');
                await this.dataManager.saveData({ quests: questsToSave });
                console.log('Successfully saved quests via dataManager.saveData()');
                return questsToSave;
            }
            
            if (typeof this.dataManager.update === 'function') {
                console.log('Saving quests via dataManager.update()');
                await this.dataManager.update('quests', questsToSave);
                console.log('Successfully saved quests via dataManager.update()');
                return questsToSave;
            }
            
            // Check if appState is available and has a setState method
            if (this.dataManager.appState && typeof this.dataManager.appState.setState === 'function') {
                console.log('Saving quests via appState.setState()');
                await this.dataManager.appState.setState({ quests: questsToSave });
                console.log('Successfully saved quests via appState.setState()');
                return questsToSave;
            }
            
            // If we get here, no valid save method was found
            throw new Error('No valid save method available in dataManager');
            
        } catch (error) {
            console.error('Error saving quests:', error);
            throw new Error(`Failed to save quests: ${error.message}`);
        }
    }
}
