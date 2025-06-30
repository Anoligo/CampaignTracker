import { appState } from '../state/app-state.js';
import NavigationManager from '../navigation/navigation-manager.js';
import { showToast } from '../../components/ui-components.js';
import { DataServiceInitializer } from './data-service-initializer.js';

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
            console.log('Starting application initialization...');
            
            // First, initialize DataService and related services
            await DataServiceInitializer.initialize();
            
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
            console.log('Initializing application state...');
            
            // Wait for the state to be fully loaded and DataService to be ready
            await appState.waitForInitialization();
            
            // Ensure we have a valid state
            if (!appState.state) {
                throw new Error('Failed to initialize application state: State is null or undefined');
            }
            
            console.log('State initialized successfully');
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
        this._registerFactionsSection(navManager);
        this._registerLootSection(navManager);

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
                    // Register the section initializer with the correct section ID 'guild-logs'
                    navManager.registerSectionInitializer('guild-logs', module.initializeGuildSection);
                    console.log('Guild section initializer registered successfully');
                } else {
                    console.error('Guild module does not export initializeGuildSection');
                }
            })
            .catch(error => {
                console.error('Failed to load guild module:', error);
                // Show error in UI if possible
                const guildSection = document.getElementById('guild-logs') || document.getElementById('guild');
                if (guildSection) {
                    guildSection.innerHTML = `
                        <div class="alert alert-danger">
                            Failed to load guild module. Please check the console for details.
                        </div>
                    `;
                }
            });
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
            // Use the dataService from appState which is an instance of DataService
            const dataService = appState.dataService;
            if (!dataService) {
                console.error('DataService not available in appState');
                return;
            }
            window.app.questsManager = new module.QuestsManager(dataService);
            console.log('QuestsManager initialized with DataService');
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

    static _registerFactionsSection(navManager) {
        import('../../modules/factions/index.js')
            .then(module => {
                if (module.initializeFactionsSection) {
                    navManager.registerSectionInitializer('factions', module.initializeFactionsSection);
                }
            })
            .catch(error => console.error('Failed to load factions module:', error));
    }
    
    /**
     * Register the loot section initializer
     * @param {NavigationManager} navManager - The navigation manager
     * @private
     */
    static _registerLootSection(navManager) {
        console.log('[AppInitializer] Registering loot section');
        import('../../modules/loot/index.js')
            .then(module => {
                console.log('[AppInitializer] Loot module loaded');
                if (module.LootManager) {
                    // Initialize the loot manager when the section is activated
                    const initializeLoot = async () => {
                        try {
                            console.log('[AppInitializer] Initializing loot section');
                            const lootManager = new module.LootManager(appState);
                            await lootManager.initialize();
                            window.app = window.app || {};
                            window.app.lootManager = lootManager;
                            console.log('[AppInitializer] Loot section initialized');
                        } catch (error) {
                            console.error('[AppInitializer] Failed to initialize loot section:', error);
                        }
                    };
                    
                    navManager.registerSectionInitializer('loot', initializeLoot);
                    console.log('[AppInitializer] Loot section initializer registered');
                }
            })
            .catch(error => console.error('[AppInitializer] Failed to load loot module:', error));
    }
}

// Export a singleton instance
export const appInitializer = new AppInitializer();

export default AppInitializer;
