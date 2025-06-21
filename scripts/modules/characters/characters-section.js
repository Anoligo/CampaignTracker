/**
 * Characters Section Initialization
 * Handles the initialization of the characters section using the new unified appState pattern
 */

import { CharactersManager } from './characters-manager-new.js';
import { appState } from '../../core/state/app-state.js';

/**
 * Initialize the characters section
 */
export async function initializeCharactersSection() {
    try {
        console.log('Initializing characters section...');
        
        // Check if the characters container exists
        const container = document.getElementById('characters');
        if (!container) {
            console.error('Characters container not found');
            return;
        }
        
        // Initialize the characters manager if it doesn't exist
        if (!window.app?.charactersManager) {
            console.log('Initializing characters manager...');
            try {
                // Import application state and create a simple data manager that
                // exposes a saveData function. The previous code attempted to
                // import a non-existent `dataManager` export and resulted in the
                // manager receiving `undefined`.
                // Use the underlying DataService instance
                // The DataService already has all the necessary state management
                const dataManager = appState.dataService;

                // Initialize the characters manager with the data manager
                window.app = window.app || {};
                window.app.charactersManager = new CharactersManager(dataManager);
                
                // Initialize the manager
                await window.app.charactersManager.initialize();
                console.log('Characters manager initialized');
                
                // The UI is now initialized by the manager, but we'll keep this
                // for backward compatibility with any existing code
                const characterList = document.getElementById('characterList');
                const characterDetails = document.getElementById('characterDetails');
                
                if (characterList && characterDetails) {
                    // The manager will handle the UI initialization
                    await window.app.charactersManager.render();
                    
                    // Get the UI instance from the manager
                    window.app.characterUI = window.app.charactersManager.characterUI;
                    
                    if (!window.app.characterUI) {
                        console.warn('CharacterUI not initialized by CharactersManager');
                    }
                    
                    // Function to set up event listeners
                    const setupEventListeners = () => {
                        const btn = document.getElementById('addCharacterBtn');
                        const container = document.getElementById('characters') || document.documentElement;
                        
                        // Log button state for debugging
                        const logButtonState = () => {
                            const button = document.getElementById('addCharacterBtn');
                            console.log('Button state:', {
                                button: {
                                    exists: !!button,
                                    id: button?.id,
                                    className: button?.className,
                                    text: button?.textContent?.trim(),
                                    inDocument: document.body.contains(button),
                                    disabled: button?.disabled,
                                    visible: button?.offsetParent !== null
                                },
                                container: {
                                    exists: !!container,
                                    inDocument: document.body.contains(container),
                                    visible: container?.offsetParent !== null
                                }
                            });
                        };

                        // Handle button click with better delegation
                        const handleAddClick = (e) => {
                            // Check if the click is on the button or its children
                            const button = e.target.closest('#addCharacterBtn');
                            if (!button) return;

                            console.log('Add character button clicked', {
                                target: e.target,
                                button: button,
                                eventPhase: e.eventPhase,
                                time: new Date().toISOString()
                            });

                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();

                            console.log('Calling handleAddCharacter...');
                            try {
                                if (window.app?.characterUI?.handleAddCharacter) {
                                    window.app.characterUI.handleAddCharacter();
                                } else {
                                    console.error('Character UI or handleAddCharacter method not available');
                                }
                            } catch (err) {
                                console.error('Error in handleAddCharacter:', err);
                            }
                        };

                        // Remove any existing listeners to prevent duplicates
                        container.removeEventListener('click', handleAddClick, false);
                        container.removeEventListener('mousedown', handleAddClick, false);
                        
                        // Add new listeners with useCapture: false for better compatibility
                        container.addEventListener('click', handleAddClick, false);
                        container.addEventListener('mousedown', handleAddClick, false);

                        // Log the setup
                        console.log('Event listeners set up on container:', {
                            container: container,
                            hasButton: !!document.getElementById('addCharacterBtn'),
                            buttonInDOM: !!document.getElementById('addCharacterBtn')
                        });

                        // Store for debugging
                        window._debugAddHandlers = {
                            click: handleAddClick,
                            container: container,
                            logState: logButtonState
                        };
                        
                        // Initial state log
                        logButtonState();
                    };

                    // Set up a MutationObserver to watch for when the button is added to the DOM
                    const observer = new MutationObserver((mutations, obs) => {
                        const btn = document.getElementById('addCharacterBtn');
                        if (btn) {
                            console.log('Button detected in DOM via MutationObserver');
                            setupEventListeners();
                            // We could disconnect here if we only need to set up once
                            // obs.disconnect();
                        }
                    });

                    // Start observing the document with the configured parameters
                    observer.observe(document.body, { 
                        childList: true, 
                        subtree: true,
                        attributes: false,
                        characterData: false
                    });

                    // Also try to set up immediately in case the button is already there
                    console.log('Setting up event listeners immediately');
                    setupEventListeners();

                    // Store the observer for debugging
                    window._debugObserver = observer;
                    
                    if (characterSearch) {
                        characterSearch.addEventListener('input', (e) => {
                            window.app.characterUI.handleSearch(e.target.value);
                        });
                    }
                    
                    // Load initial data using refresh() from BaseUI
                    await window.app.characterUI.refresh();
                    
                    console.log('Characters UI initialized');
                } else {
                    console.warn('Character list or details container not found');
                }
            } catch (error) {
                console.error('Failed to initialize characters manager:', error);
                container.innerHTML = `
                    <div class="alert alert-danger">
                        Failed to load character data. Please check the console for details.
                    </div>
                `;
            }
        } else {
            console.log('Characters manager already initialized');
            // Refresh the UI if already initialized
            if (window.app.characterUI) {
                await window.app.characterUI.refresh();
            }
        }
        
        console.log('Characters section initialized');
    } catch (error) {
        console.error('Error initializing characters section:', error);
    }
}

// Export the initialization function
export default initializeCharactersSection;
