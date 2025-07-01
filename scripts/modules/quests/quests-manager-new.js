/**
 * Quests Manager
 * Main entry point for quest-related functionality using the unified appState pattern
 */

import { QuestService } from './services/quest-service-new.js';
import { QuestUI } from './ui/quest-ui-main.js';

export class QuestsManager {
    /**
     * Create a new QuestsManager instance
     * @param {Object} dataManager - The application's data manager (DataService)
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.createSamples=true] - Whether to create sample quests if none exist
     * @param {boolean} [options.isTest=false] - Whether this is a test instance (prevents automatic initialization)
     */
    constructor(dataManager, options = {}) {
        console.log('[QuestsManager] Creating new instance with dataManager:', dataManager ? 'valid' : 'invalid');
        
        if (!dataManager) {
            throw new Error('Data manager is required');
        }
        
        const { createSamples = true, isTest = false } = options;

        this.dataManager = dataManager;
        this.questService = new QuestService(dataManager);
        this.questUI = null;
        this.initialized = false;
        this._isRendering = false;
        this._initializationPromise = null;
        this.options = { createSamples, isTest };

        if (!this.options.isTest) {
            // Don't await here to avoid blocking the constructor
            this.initialize().catch(error => {
                console.error('[QuestsManager] Error during initialization:', error);
            });
        }
    }
    
    /**
     * Initialize the quests module
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        // If we're already initializing, return the existing promise
        if (this._initializationPromise) {
            return this._initializationPromise;
        }

        // If already initialized, return immediately
        if (this.initialized) {
            console.log('[QuestsManager] Already initialized');
            return Promise.resolve(true);
        }

        console.log('[QuestsManager] Starting initialization...');
        
        // Create a promise that will resolve when initialization is complete
        this._initializationPromise = (async () => {
            try {
                // Initialize the UI if we're in a browser environment
                if (typeof document !== 'undefined') {
                    this.questUI = new QuestUI(this);
                    this.setupEventListeners();
                }
                
                // Set up the mutation observer to detect when the quests section becomes visible
                this.setupSectionObserver();
                
                // Create sample quests if requested and none exist
                const quests = this.questService.getAllQuests();
                if (this.options.createSamples && quests.length === 0 && !this._sampleQuestsCreated) {
                    console.log('[QuestsManager] No quests found, creating sample quests');
                    await this.createSampleQuests();
                    this._sampleQuestsCreated = true;
                }
                
                this.initialized = true;
                console.log('[QuestsManager] Initialization complete');
                return true;
            } catch (error) {
                console.error('[QuestsManager] Error during initialization:', error);
                this.initialized = false;
                throw error;
            } finally {
                // Clear the initialization promise when done
                this._initializationPromise = null;
            }
        })();

        return this._initializationPromise;
    }
    
    /**
     * Set up a mutation observer to detect when the quests section becomes visible
     * @private
     */
    setupSectionObserver() {
        const targetNode = document.getElementById('quests');
        if (!targetNode) {
            console.warn('[QuestsManager] Quests section not found, will retry on next render');
            return;
        }
        
        // Create an observer instance
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    this.checkSectionVisibility();
                }
            });
        });
        
        // Start observing the target node for attribute changes
        this.observer.observe(targetNode, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Initial check
        this.checkSectionVisibility();
    }
    
    /**
     * Debounce timer for section visibility checks
     * @private
     */
    _debounceTimer = null;

    /**
     * Last known visibility state to prevent redundant checks
     * @private
     */
    _lastVisibilityState = false;

    /**
     * Check if the quests section is visible and initialize/cleanup accordingly
     * @private
     */
    async checkSectionVisibility() {
        // Clear any pending debounce
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
            this._debounceTimer = null;
        }

        // Use a small debounce to handle rapid class changes
        this._debounceTimer = setTimeout(async () => {
            try {
                const section = document.getElementById('quests');
                if (!section) {
                    console.warn('[QuestsManager] Quests section not found');
                    return;
                }
                
                // More robust visibility check
                const isVisible = section.classList.contains('active') && 
                                 section.offsetParent !== null && 
                                 getComputedStyle(section).display !== 'none';
                
                // Skip if visibility hasn't actually changed
                if (isVisible === this._lastVisibilityState) {
                    return;
                }
                
                this._lastVisibilityState = isVisible;
                
                if (isVisible) {
                    console.log('[QuestsManager] Quests section became visible, initializing...');
                    try {
                        // Only initialize if not already initialized
                        if (!this.initialized) {
                            await this.initialize();
                            console.log('[QuestsManager] Initialization completed after section became visible');
                        }
                    } catch (error) {
                        console.error('[QuestsManager] Error initializing after section became visible:', error);
                        // Reset initialization state on error to allow retry
                        this.initialized = false;
                        this._initializationPromise = null;
                    }
                } else {
                    console.log('[QuestsManager] Quests section hidden, cleaning up...');
                    this.cleanup();
                    console.log('[QuestsManager] Cleanup completed after section was hidden');
                }
            } catch (error) {
                console.error('[QuestsManager] Error in checkSectionVisibility:', error);
            } finally {
                this._debounceTimer = null;
            }
        }, 100); // 100ms debounce
    }
    
    /**
     * Set up event listeners
     * @private
     */
    setupEventListeners() {
        console.log('[QuestsManager] Setting up event listeners');
        
        // Add any global event listeners here
        // The QuestUI component will handle its own event delegation
    }
    
    /**
     * Clean up resources when the quests section is hidden
     */
    cleanup() {
        console.log('[QuestsManager] Cleaning up...');
        
        // Clear any pending debounce timer
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
            this._debounceTimer = null;
            console.log('[QuestsManager] Cleared pending debounce timer');
        }
        
        // Reset visibility state
        this._lastVisibilityState = false;
        
        // Cancel any pending initialization
        if (this._initializationPromise) {
            console.log('[QuestsManager] Cancelling pending initialization');
            this._initializationPromise = null;
        }
        
        // Clean up UI components
        if (this.questUI) {
            console.log('[QuestsManager] Cleaning up QuestUI');
            try {
                if (typeof this.questUI.cleanup === 'function') {
                    this.questUI.cleanup();
                }
                // Remove any DOM elements created by the UI
                const uiContainer = document.getElementById('quests-container');
                if (uiContainer) {
                    uiContainer.innerHTML = '';
                }
            } catch (error) {
                console.error('[QuestsManager] Error during QuestUI cleanup:', error);
            } finally {
                this.questUI = null;
            }
        }
        
        // Clean up observer
        if (this.observer) {
            console.log('[QuestsManager] Disconnecting observer');
            try {
                this.observer.disconnect();
            } catch (error) {
                console.error('[QuestsManager] Error disconnecting observer:', error);
            } finally {
                this.observer = null;
            }
            
        // Reset initialization state
        this.initialized = false;
        }
        
        // Reset state
        this.initialized = false;
        this._isRendering = false;
        
        // Clear any pending timeouts/intervals if they exist
        if (this._renderDebounceTimer) {
            clearTimeout(this._renderDebounceTimer);
            this._renderDebounceTimer = null;
        }
        
        console.log('[QuestsManager] Cleanup complete');
    }
    
    /**
     * Render the quests manager
     */
    async render() {
        console.groupCollapsed('[QuestsManager] Render called');
        
        // Prevent re-rendering if we're already in the process of rendering
        if (this._isRendering) {
            console.log('[QuestsManager] Already rendering, skipping...');
            console.groupEnd();
            return;
        }
        
        // Don't render if not initialized or section is not visible
        const section = document.getElementById('quests');
        if (!this.initialized || !section || !section.classList.contains('active')) {
            console.log('[QuestsManager] Not rendering: section not visible or not initialized');
            console.groupEnd();
            return;
        }
        
        this._isRendering = true;
        console.log('[QuestsManager] Starting render');
        
        try {
            
            // Only render if the quests section is visible
            const section = document.getElementById('quests');
            if (section && section.classList.contains('active') && this.questUI) {
                // Check if the UI has a render method
                if (typeof this.questUI.render === 'function') {
                    this.questUI.render()
                        .catch(error => {
                            console.error('[QuestsManager] Error refreshing UI:', error);
                        });
                } else if (typeof this.questUI.renderQuests === 'function') {
                    // Fallback to renderQuests if available
                    const quests = this.questService.getAllQuests();
                    this.questUI.renderQuests(quests);
                } else if (typeof this.questUI.init === 'function') {
                    // Fallback to init if available
                    this.questUI.init();
                } else {
                    console.error('[QuestsManager] QuestUI is missing required rendering methods');
                }
                
                this.isRendered = true;
            }
        } catch (error) {
            console.error('[QuestsManager] Error during render:', error);
        } finally {
            this._isRendering = false;
            console.groupEnd();
        }
    }
    
    // Quest CRUD Operations
    
    /**
     * Get all quests
     * @param {Object} [filters] - Optional filters
     * @returns {Array<Object>} Array of quests
     */
    getAllQuests(filters) {
        return this.questService.getAllQuests(filters);
    }
    
    /**
     * Get a quest by ID
     * @param {string} id - Quest ID
     * @returns {Object|undefined} The quest or undefined if not found
     */
    getQuestById(id) {
        return this.questService.getQuestById(id);
    }
    
    /**
     * Create a new quest
     * @param {Object} questData - Quest data
     * @returns {Object} The created quest
     */
    createQuest(questData) {
        return this.questService.createQuest(questData);
    }
    
    /**
     * Update a quest
     * @param {string} id - Quest ID
     * @param {Object} updates - Updated quest data
     * @returns {Object|undefined} Updated quest or undefined if not found
     */
    updateQuest(id, updates) {
        return this.questService.updateQuest(id, updates);
    }
    
    /**
     * Delete a quest
     * @param {string} id - Quest ID
     * @returns {boolean} True if deleted, false if not found
     */
    deleteQuest(id) {
        return this.questService.deleteQuest(id);
    }
    
    // Quest-specific methods
    
    /**
     * Update a quest's status
     * @param {string} id - Quest ID
     * @param {string} status - New status
     * @returns {Object|undefined} Updated quest or undefined if not found
     */
    updateQuestStatus(id, status) {
        return this.questService.updateQuestStatus(id, status);
    }
    
    /**
     * Add a note to a quest
     * @param {string} questId - Quest ID
     * @param {string} note - Note text
     * @returns {Object|undefined} Updated quest or undefined if not found
     */
    addQuestNote(questId, note) {
        return this.questService.addQuestNote(questId, note);
    }
    
    /**
     * Remove a note from a quest
     * @param {string} questId - Quest ID
     * @param {string} noteId - Note ID to remove
     * @returns {Object|undefined} Updated quest or undefined if not found
     */
    removeQuestNote(questId, noteId) {
        return this.questService.removeQuestNote(questId, noteId);
    }
    
    /**
     * Search quests by title or description
     * @param {string} query - Search query
     * @returns {Array<Object>} Filtered array of quests
     */
    searchQuests(query) {
        return this.questService.searchQuests(query);
    }
    
    /**
     * Get quests by status
     * @param {string} status - Status to filter by
     * @returns {Array<Object>} Filtered array of quests
     */
    getQuestsByStatus(status) {
        return this.questService.getQuestsByStatus(status);
    }
    
    /**
     * Get quests by type
     * @param {string} type - Type to filter by
     * @returns {Array<Object>} Filtered array of quests
     */
    getQuestsByType(type) {
        return this.questService.getQuestsByType(type);
    }
    
    /**
     * Create sample quests for demonstration purposes
     * @private
     */
    async createSampleQuests() {
        try {
            const sampleQuests = [
                {
                    title: 'The Iron Meridian',
                    description: 'Investigate the mysterious artifact known as the Iron Meridian and discover its connection to the ancient civilization.',
                    type: 'main',
                    status: 'active',
                    difficulty: 'medium',
                    rewards: ['500 gold', 'Rare Artifact'],
                    notes: [
                        {
                            id: 'note-1',
                            text: 'The artifact is said to be hidden in the ruins of Eldermere',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        }
                    ]
                },
                {
                    title: 'Bandit Infestation',
                    description: 'Clear out the bandit camp that has been terrorizing the trade routes near the village of Briarwood.',
                    type: 'side',
                    status: 'available',
                    difficulty: 'easy',
                    rewards: ['100 gold', 'Local Favor']
                },
                {
                    title: 'The Lost Heirloom',
                    description: 'Recover the stolen family heirloom for Lady Elenara from the thieves guild in the city of Duskhaven.',
                    type: 'side',
                    status: 'available',
                    difficulty: 'hard',
                    rewards: ['250 gold', 'Noble Favor']
                },
                {
                    title: 'Ancient Prophecy',
                    description: 'Decipher the ancient prophecy that foretells the return of the Shadow King.',
                    type: 'main',
                    status: 'active',
                    difficulty: 'hard',
                    rewards: ['1000 gold', 'Legendary Artifact']
                },
                {
                    title: 'Herbalist\'s Request',
                    description: 'Gather rare herbs from the Whispering Woods for the local herbalist.',
                    type: 'task',
                    status: 'available',
                    difficulty: 'easy',
                    rewards: ['50 gold', 'Potions']
                }
            ];
            
            // Create each sample quest
            for (const questData of sampleQuests) {
                await this.createQuest(questData);
            }
            
            console.log('[QuestsManager] Created sample quests');
            return true;
        } catch (error) {
            console.error('[QuestsManager] Error creating sample quests:', error);
            return false;
        }
    }
}

export default QuestsManager;
