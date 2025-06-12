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

        this._registerGuildSection(navManager);
        this._registerQuestsSection(navManager);
        this._registerCharactersSection(navManager);
        this._registerPlayersSection(navManager);
        this._registerConditionsSection(navManager);
        this._registerFactionsSection(navManager);

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

    static _registerGuildSection(navManager) {
        import('../../modules/guild/index.js')
            .then(module => {
                if (module.initializeGuildSection) {
                    navManager.registerSectionInitializer('guild', module.initializeGuildSection);
                }
            })
            .catch(error => console.error('Failed to load guild module:', error));
    }

    static _registerQuestsSection(navManager) {
        import('../../modules/quests/index.js')
            .then(module => {
                if (!module.QuestUI || !module.QuestsManager) return;
                const init = async () => {
                    try {
                        await AppInitializer._ensureQuestManager(module);
                        const els = AppInitializer._getQuestUIElements();
                        if (!els) return;
                        AppInitializer._initQuestUI(module, els);
                        AppInitializer._showQuestsSection();
                    } catch (error) {
                        console.error('Error initializing quests section:', error);
                    }
                };
                navManager.registerSectionInitializer('quests', init);
            })
            .catch(error => console.error('Failed to load quests module:', error));
    }

    static async _ensureQuestManager(module) {
        if (!window.app.questsManager) {
            const dataManager = { appState };
            window.app.questsManager = new module.QuestsManager(dataManager);
        }
    }

    static _getQuestUIElements() {
        const list = document.getElementById('questList');
        const details = document.getElementById('questDetails');
        const search = document.getElementById('questSearch');
        const addButton = document.getElementById('addQuestBtn');
        const editButton = document.getElementById('editQuestBtn');
        const deleteButton = document.getElementById('deleteQuestBtn');

        if (!list || !details || !search || !addButton) {
            console.error('Required quest UI elements not found');
            return null;
        }

        return { list, details, search, addButton, editButton, deleteButton };
    }

    static _initQuestUI(module, els) {
        if (!window.app.questsUI) {
            window.app.questsUI = new module.QuestUI(
                window.app.questsManager.questService,
                { appState: window.app.questsManager.dataManager.appState, container: els }
            );
            console.log('QuestUI initialized successfully');
        }
    }

    static _showQuestsSection() {
        const section = document.getElementById('quests');
        if (section) {
            section.style.display = 'block';
            section.classList.add('active');
            window.app.questsUI.render?.();
        }
    }

    static _registerCharactersSection(navManager) {
        import('../../modules/characters/index.js')
            .then(module => {
                if (module.initializeCharactersSection) {
                    navManager.registerSectionInitializer('characters', module.initializeCharactersSection);
                }
            })
            .catch(error => console.error('Failed to load characters module:', error));
    }
    static _registerPlayersSection(navManager) {
        import("../../modules/players/index.js")
            .then(module => {
                if (module.initializePlayersSection) {
                    navManager.registerSectionInitializer("players", module.initializePlayersSection);
                }
            })
            .catch(error => console.error("Failed to load players module:", error));
    }

    static _registerConditionsSection(navManager) {
        import('../../modules/conditions/index.js')
            .then(module => {
                if (module.initializeConditionsSection) {
                    navManager.registerSectionInitializer('conditions', module.initializeConditionsSection);
                }
            })
            .catch(error => console.error('Failed to load conditions module:', error));
    }


    static _registerFactionsSection(navManager) {
        import('../../modules/factions/index.js')
            .then(module => {
                if (module.initializeFactionsSection) {
                    navManager.registerSectionInitializer('factions', module.initializeFactionsSection);
                }
            })
            .catch(error => console.error('Failed to load factions module:', error));
    }
}

// Export a singleton instance
export const appInitializer = new AppInitializer();

export default AppInitializer;
