import { QuestService } from './services/quest-service.js';
import { QuestUI } from './ui/quest-ui-new.js';

/**
 * QuestsManager coordinates between the UI and the QuestService
 * It serves as the main interface for quest-related operations
 */
export class QuestsManager {
    /**
     * Create a new QuestsManager instance
     * @param {Object} dataManager - The application's data manager
     */
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.questService = new QuestService(dataManager);
        
        // Initialize quests array if it doesn't exist
        if (!dataManager.appState.quests) {
            dataManager.appState.quests = [];
        }

        // Create the UI with the service and data manager
        this.questUI = new QuestUI(this.questService, dataManager);

        // Initialize the UI when the DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Initialize the quests manager
     */
    async initialize() {
        console.log('Initializing QuestsManager');
        
        // Ensure quests array exists in the state
        if (!this.dataManager.appState.quests) {
            this.dataManager.appState.quests = [];
            console.log('Initialized empty quests array in appState');
        } else {
            console.log('Found existing quests in appState:', this.dataManager.appState.quests);
        }
        
        // Create the UI with the service and data manager
        this.questUI = new QuestUI(this.questService, this.dataManager);
        
        // Get all quests from the service
        let quests = this.questService.getAllQuests();
        console.log('Loaded quests from service:', quests);
        
        // Create a sample quest if no quests exist
        if (!quests || quests.length === 0) {
            console.log('No quests found, creating a sample quest');
            await this.createSampleQuest();
            quests = this.questService.getAllQuests();
        } else {
            console.log('Using existing quests from state');
        }
        
        // Initialize the UI with the loaded quests
        if (this.questUI) {
            // Check if the UI has an initializeUI method (from our updated QuestUI)
            if (typeof this.questUI.initializeUI === 'function') {
                this.questUI.initializeUI();
            } 
            // Fallback to renderQuests if available
            else if (typeof this.questUI.renderQuests === 'function') {
                this.questUI.renderQuests(quests);
            }
            // Fallback to init if available
            else if (typeof this.questUI.init === 'function') {
                this.questUI.init();
            } 
            else {
                console.error('QuestUI is missing required initialization methods');
            }
            
            console.log('QuestUI initialized successfully');
        } else {
            console.error('Failed to initialize QuestUI');
        }
    }
    
    /**
     * Create a sample quest for demonstration purposes
     */
    async createSampleQuest() {
        try {
            const sampleQuest = {
                name: 'The Iron Meridian',
                description: 'Investigate the mysterious artifact known as the Iron Meridian and discover its connection to the ancient civilization.',
                type: 'MAIN',
                status: 'ONGOING',
                createdAt: new Date(),
                updatedAt: new Date(),
                journalEntries: [
                    {
                        date: new Date(),
                        content: 'Found a reference to the Iron Meridian in an old tome at the library. It seems to be an ancient artifact with powerful magical properties.'
                    }
                ],
                items: [],
                locations: [],
                characters: []
            };
            
            await this.questService.createQuest(sampleQuest);
            
            // Refresh the UI after creating the sample quest
            if (this.questUI && typeof this.questUI.refresh === 'function') {
                this.questUI.refresh();
            } else if (this.questUI && typeof this.questUI.renderQuests === 'function') {
                const quests = this.questService.getAllQuests();
                this.questUI.renderQuests(quests);
            }
        } catch (error) {
            console.error('Error creating sample quest:', error);
        }
    }

    /**
     * Search for quests matching the given term
     * @param {string} term - Search term
     * @returns {Array} Matching quests
     */
    searchQuests(term) {
        return this.questService.searchQuests(term);
    }

    /**
     * Create a new quest
     * @param {Object} questData - Quest data
     * @returns {Promise<Object>} The created quest
     */
    createQuest(questData) {
        return this.questService.createQuest(questData);
    }

    /**
     * Get a quest by ID
     * @param {string} id - Quest ID
     * @returns {Object|null} The quest, or null if not found
     */
    getQuestById(id) {
        return this.questService.getQuestById(id);
    }

    /**
     * Update a quest
     * @param {string} id - Quest ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} The updated quest
     */
    updateQuest(id, updates) {
        return this.questService.updateQuest(id, updates);
    }

    /**
     * Delete a quest
     * @param {string} id - Quest ID
     * @returns {Promise<boolean>} True if deleted successfully
     */
    deleteQuest(id) {
        return this.questService.deleteQuest(id);
    }

    /**
     * Get all quests
     * @returns {Array} All quests
     */
    getAllQuests() {
        return this.questService.getAllQuests();
    }


}
