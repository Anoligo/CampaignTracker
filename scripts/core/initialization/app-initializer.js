import { appState } from '../state/app-state.js';
import NavigationManager from '../navigation/navigation-manager.js';
import { showToast } from '../../components/ui-components.js';

/**
 * Application Initializer
 * Handles the initialization of the application
 */
export class AppInitializer {
    /**
     * Initialize the application
     */
    static async initialize() {
        try {
            // Initialize state (this will also load any saved state)
            await this._initializeState();
            
            // Initialize navigation
            this._initializeNavigation();
            
            // Initialize UI components
            this._initializeUI();
            
            // Show welcome message
            showToast('Application initialized successfully', 'success');
            
            console.log('Application initialized with state:', appState.state);
        } catch (error) {
            console.error('Failed to initialize application:', error);
            showToast('Failed to initialize application', 'error');
            throw error; // Re-throw to be caught by the global error handler
        }
    }
    
    /**
     * Initialize application state
     * @private
     */
    static async _initializeState() {
        try {
            // Wait for the state to be fully loaded
            await new Promise((resolve) => {
                const checkState = () => {
                    if (appState._isInitialized) {
                        resolve();
                    } else {
                        setTimeout(checkState, 10);
                    }
                };
                checkState();
            });
            
            console.log('State initialized', appState.state);
        } catch (error) {
            console.error('Error initializing state:', error);
            throw error;
        }
    }
    
    /**
     * Initialize navigation
     * @private
     */
    static _initializeNavigation() {
        try {
            // Create navigation manager
            const navManager = new NavigationManager({
                defaultSection: 'dashboard',
                onNavigate: (section) => {
                    console.log(`Navigated to: ${section}`);
                }
            });
            
            // Make it available globally if needed
            window.app = window.app || {};
            window.app.navigation = navManager;
            
            console.log('Navigation initialized');
        } catch (error) {
            console.error('Error initializing navigation:', error);
            throw error;
        }
    }
    
    /**
     * Initialize UI components
     * @private
     */
    static _initializeUI() {
        // Initialize any global UI components here
        // This could include setting up modals, tooltips, etc.
        console.log('UI components initialized');
        
        // Register section initializers
        this._registerSectionInitializers();
    }
    
    /**
     * Register initializers for each section
     * @private
     */
    static _registerSectionInitializers() {
        const navManager = window.app?.navigation;
        if (!navManager) {
            console.warn('Navigation manager not available');
            return;
        }
        
        // Import section initializers dynamically to avoid circular dependencies
        // Note: Each module's index.js should export its initialization function
        
        // Initialize Guild section
        import('../../modules/guild/index.js').then(module => {
            if (module.initializeGuildSection) {
                navManager.registerSectionInitializer('guild', module.initializeGuildSection);
            }
        }).catch(error => {
            console.error('Failed to load guild module:', error);
        });
        
        // Initialize quests section
        import('../../modules/quests/index.js').then(module => {
            // Check if we have a QuestUI class and QuestsManager
            if (module.QuestUI && module.QuestsManager) {
                // Create a function to initialize the quests section
                const initializeQuestsSection = async () => {
                    try {
                        // Check if quests manager is already initialized
                        if (!window.app.questsManager) {
                            // Import the app state and create a data manager object
                            const { appState } = await import('../state/app-state.js');
                            const dataManager = { appState };
                            window.app.questsManager = new module.QuestsManager(dataManager);
                        }
                        
                        // Get container elements
                        const questListElement = document.getElementById('questList');
                        const questDetailsElement = document.getElementById('questDetails');
                        const searchInput = document.getElementById('questSearch');
                        const addButton = document.getElementById('addQuestBtn');
                        const editButton = document.getElementById('editQuestBtn');
                        const deleteButton = document.getElementById('deleteQuestBtn');
                        
                        if (!questListElement || !questDetailsElement || !searchInput || !addButton) {
                            console.error('Required quest UI elements not found');
                            return;
                        }
                        
                        // Initialize quests UI with container elements
                        if (!window.app.questsUI) {
                            window.app.questsUI = new module.QuestUI(
                                window.app.questsManager.questService,
                                {
                                    appState: window.app.questsManager.dataManager.appState,
                                    container: {
                                        list: questListElement,
                                        details: questDetailsElement,
                                        search: searchInput,
                                        addButton: addButton,
                                        editButton: editButton,
                                        deleteButton: deleteButton
                                    }
                                }
                            );
                            
                            console.log('QuestUI initialized successfully');
                        }
                        
                        // Make sure the quests section is visible
                        const questsSection = document.getElementById('quests');
                        if (questsSection) {
                            questsSection.style.display = 'block';
                            questsSection.classList.add('active');
                            
                            // Trigger initial render
                            if (window.app.questsUI.render) {
                                window.app.questsUI.render();
                            }
                        }
                    } catch (error) {
                        console.error('Error initializing quests section:', error);
                    }
                };
                
                // Register the initializer
                navManager.registerSectionInitializer('quests', initializeQuestsSection);
            }
        }).catch(error => {
            console.error('Failed to load quests module:', error);
        });
        
        // Initialize Characters section
        import('../../modules/characters/index.js').then(module => {
            if (module.initializeCharactersSection) {
                navManager.registerSectionInitializer('characters', module.initializeCharactersSection);
            }
        }).catch(error => {
            console.error('Failed to load characters module:', error);
        });

        // Initialize Factions section
        import('../../modules/factions/index.js').then(module => {
            if (module.initializeFactionsSection) {
                navManager.registerSectionInitializer('factions', module.initializeFactionsSection);
            }
        }).catch(error => {
            console.error('Failed to load factions module:', error);
        });

        // Initialize other sections (locations) if needed
        /*
        import('../../modules/locations').then(module => {
            if (module.initializeLocationsSection) {
                navManager.registerSectionInitializer('locations', module.initializeLocationsSection);
            }
        }).catch(error => {
            console.error('Failed to load locations module:', error);
        });
        */
        
        // Add more section initializers as needed
    }
}

// Export a singleton instance
export const appInitializer = new AppInitializer();

export default AppInitializer;
