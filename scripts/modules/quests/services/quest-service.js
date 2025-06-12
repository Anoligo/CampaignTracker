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
        try {
            if (!Array.isArray(quests)) {
                console.error('Invalid quests data - expected array, got:', quests);
                return [];
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
                    return null;
                }
                
                // Create a new object to avoid modifying the original
                const normalized = { ...quest };
                
                // Ensure required fields exist and have valid values
                if (!normalized.id) {
                    normalized.id = `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                }
                
                // Copy over any additional properties not already handled
                Object.keys(quest).forEach(key => {
                    if (!(key in normalized) && key !== '_error') {
                        // Handle Date objects
                        if (quest[key] instanceof Date) {
                            normalized[key] = quest[key].toISOString();
                        } 
                        // Handle arrays
                        else if (Array.isArray(quest[key])) {
                            normalized[key] = [...quest[key]];
                        }
                        // Handle nested objects
                        else if (quest[key] && typeof quest[key] === 'object' && quest[key] !== null) {
                            normalized[key] = { ...quest[key] };
                        }
                        // Handle primitives
                        else {
                            normalized[key] = quest[key];
                        }
                    }
                });
                
                // Ensure type and status are valid
                const validTypes = ['main', 'side', 'personal', 'guild', 'other'];
                if (!validTypes.includes(normalized.type)) {
                    console.warn(`Invalid quest type '${normalized.type}', defaulting to 'main'`);
                    normalized.type = 'main';
                }
                
                const validStatuses = ['available', 'ongoing', 'completed', 'failed'];
                if (!validStatuses.includes(normalized.status)) {
                    console.warn(`Invalid quest status '${normalized.status}', defaulting to 'available'`);
                    normalized.status = 'available';
                }
                
                return normalized;
            };
            
            // Convert Quest instances to plain objects and normalize them
            const questsToSave = quests.map((quest, index) => {
                try {
                    // Ensure we have a valid quest object
                    if (!quest || typeof quest !== 'object') {
                        console.warn(`Invalid quest at index ${index}, creating default quest`);
                        return {
                            id: `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                            title: 'Untitled Quest',
                            name: 'Untitled Quest',
                            description: 'No description provided',
                            type: 'other',
                            status: 'available',
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
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                    }
                    
                    // Create a new plain object with all required fields
                    const plainQuest = {
                        id: quest.id || `quest-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        title: quest.title || quest.name || 'Untitled Quest',
                        name: quest.name || quest.title || 'Untitled Quest',
                        description: quest.description || '',
                        type: (quest.type || 'other').toString().toLowerCase(),
                        status: (quest.status || 'available').toString().toLowerCase(),
                        journalEntries: Array.isArray(quest.journalEntries) ? [...quest.journalEntries] : [],
                        relatedItems: Array.isArray(quest.relatedItems) ? [...quest.relatedItems] : [],
                        relatedLocations: Array.isArray(quest.relatedLocations) ? [...quest.relatedLocations] : [],
                        relatedCharacters: Array.isArray(quest.relatedCharacters) ? [...quest.relatedCharacters] : [],
                        relatedFactions: Array.isArray(quest.relatedFactions) ? [...quest.relatedFactions] : [],
                        relatedQuests: Array.isArray(quest.relatedQuests) ? [...quest.relatedQuests] : [],
                        notes: typeof quest.notes === 'string' ? quest.notes : '',
                        resolution: {
                            session: quest.resolution?.session || '',
                            date: quest.resolution?.date || null,
                            xp: typeof quest.resolution?.xp === 'number' ? quest.resolution.xp : 0
                        },
                        createdAt: quest.createdAt || new Date().toISOString(),
                        updatedAt: quest.updatedAt || new Date().toISOString()
                    };
                    
                    // Copy any additional properties that aren't handled above
                    Object.keys(quest).forEach(key => {
                        if (!(key in plainQuest) && key !== '_error') {
                            // Handle Date objects
                            if (quest[key] instanceof Date) {
                                plainQuest[key] = quest[key].toISOString();
                            } 
                            // Handle arrays
                            else if (Array.isArray(quest[key])) {
                                plainQuest[key] = [...quest[key]];
                            }
                            // Handle nested objects
                            else if (quest[key] && typeof quest[key] === 'object' && quest[key] !== null) {
                                plainQuest[key] = { ...quest[key] };
                            }
                            // Handle primitives
                            else {
                                plainQuest[key] = quest[key];
                            }
                        }
                    });
                    
                    // Ensure type and status are valid
                    const validTypes = ['main', 'side', 'personal', 'guild', 'other'];
                    if (!validTypes.includes(plainQuest.type)) {
                        console.warn(`Invalid quest type '${plainQuest.type}', defaulting to 'other'`);
                        plainQuest.type = 'other';
                    }
                    
                    const validStatuses = ['available', 'ongoing', 'completed', 'failed'];
                    if (!validStatuses.includes(plainQuest.status)) {
                        console.warn(`Invalid quest status '${plainQuest.status}', defaulting to 'available'`);
                        plainQuest.status = 'available';
                    }
                    
                    // Return the fully constructed quest object
                    return plainQuest;
                        
                    } catch (error) {
                        console.error(`Error processing quest at index ${index}:`, error);
                        // Return a minimal valid quest if processing fails
                        return {
                            id: `quest-error-${Date.now()}-${index}`,
                            title: 'Error Processing Quest',
                            description: 'This quest could not be properly processed.',
                            type: 'other',
                            status: 'available',
                            journalEntries: [],
                            relatedItems: [],
                            relatedLocations: [],
                            relatedCharacters: [],
                            relatedFactions: [],
                            relatedQuests: [],
                            notes: '',
                            _error: `Error during processing: ${error.message}`
                        };
                    }
                })
                // Filter out any null quests that couldn't be normalized
                .filter(quest => quest !== null);
            
            console.log('Saving quests to state:', questsToSave);
            
            // Ensure we have a reference to the data manager and its services
            if (!this.dataManager) {
                console.error('DataManager is not available');
                throw new Error('DataManager is not available');
            }
            
            // First try to use the DataService if available
            if (this.dataManager.dataService) {
                console.log('Using DataService to save quests');
                try {
                    // Get current state without modifying the original
                    const currentState = {
                        ...(this.dataManager.dataService.appState?.state || this.dataManager.dataService.appState || {})
                    };
                    
                    // Update only the quests in the state
                    const updatedState = {
                        ...currentState,
                        quests: questsToSave,
                        lastUpdated: new Date().toISOString()
                    };
                    
                    console.log('Saving updated state via DataService:', updatedState);
                    
                    // Use the proper state update method if available
                    if (typeof this.dataManager.dataService.updateState === 'function') {
                        await this.dataManager.dataService.updateState(updatedState);
                    } else if (typeof this.dataManager.dataService._saveData === 'function') {
                        this.dataManager.dataService._state = updatedState;
                        await this.dataManager.dataService._saveData();
                    } else {
                        throw new Error('No valid save method found on DataService');
                    }
                    
                    console.log('Successfully saved quests via DataService');
                    return questsToSave;
                } catch (dataServiceError) {
                    console.error('Error saving quests via DataService:', dataServiceError);
                    // Don't throw here, try fallback methods
                }
            }
            
            // Try using appState if available
            if (this.dataManager.appState) {
                console.log('Attempting to save via appState');
                try {
                    // Create a new state object instead of mutating the existing one
                    const currentState = {
                        ...(this.dataManager.appState.state || {}),
                        quests: [...questsToSave],
                        lastUpdated: new Date().toISOString()
                    };
                    
                    console.log('Updating appState with quests:', currentState.quests);
                    
                    // Update appState using the proper update method if available
                    if (typeof this.dataManager.appState.update === 'function') {
                        console.log('Calling appState.update()');
                        await this.dataManager.appState.update({ quests: questsToSave });
                        console.log('Successfully updated appState via update()');
                    } 
                    // Fall back to direct assignment if update method doesn't exist
                    else {
                        this.dataManager.appState.quests = [...questsToSave];
                        this.dataManager.appState.state = { ...currentState };
                        console.log('Directly assigned quests to appState');
                    }
                    
                    // If appState has a save method, use it
                    if (typeof this.dataManager.appState.save === 'function') {
                        console.log('Calling appState.save()');
                        await this.dataManager.appState.save();
                        console.log('Successfully saved quests via appState.save()');
                    }
                    
                    // If appState has _saveData, try that as fallback
                    if (typeof this.dataManager.appState._saveData === 'function') {
                        console.log('Calling appState._saveData()');
                        await this.dataManager.appState._saveData();
                        console.log('Successfully saved quests via appState._saveData()');
                    }
                    
                    return questsToSave;
                    
                    // Fall back to direct localStorage
                    if (typeof Storage !== 'undefined') {
                        console.log('Falling back to direct localStorage save');
                        try {
                            const stateToSave = this.dataManager.appState.state || this.dataManager.appState;
                            console.log('Saving to localStorage:', stateToSave);
                            localStorage.setItem('ironMeridianState', JSON.stringify(stateToSave));
                            console.log('Successfully saved to localStorage');
                            return quests;
                        } catch (localStorageError) {
                            console.error('Error saving to localStorage:', localStorageError);
                            throw new Error(`Failed to save to localStorage: ${localStorageError.message}`);
                        }
                    }
                    
                } catch (appStateError) {
                    console.error('Error saving quests via appState:', appStateError);
                    // Don't throw here, try next method
                }
            }
            
            // If we get here, all save methods failed
            console.error('All save methods failed. Could not persist quests. Current state:', this.dataManager);
            
            // One last attempt with direct localStorage as a fallback
            if (typeof Storage !== 'undefined') {
                try {
                    console.log('Last attempt: Saving to localStorage directly');
                    const stateToSave = {
                        quests: questsToSave,
                        version: '1.0.0',
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem('ironMeridianState', JSON.stringify(stateToSave));
                    console.log('Successfully saved minimal state to localStorage');
                    return quests;
                } catch (finalError) {
                    console.error('Final fallback save failed:', finalError);
                }
            }
            
            throw new Error('Failed to save quests: All save methods failed. Check console for details.');
        } catch (error) {
            console.error('Error in _saveQuests:', error);
            throw error;
        }
    }
}
