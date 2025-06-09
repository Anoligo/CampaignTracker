/**
 * Characters Section Initialization
 * Handles the initialization of the characters section
 */

import { CharactersManager } from './index.js';
import { CharacterUI } from './ui/character-ui.js';

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
                const { appState } = await import('../../core/state/app-state.js');
                const dataManager = {
                    appState,
                    saveData: () => appState.update({}, true)
                };

                // Initialize the characters manager
                window.app = window.app || {};
                window.app.charactersManager = new CharactersManager(dataManager);
                
                // Initialize the manager
                await window.app.charactersManager.initialize();
                console.log('Characters manager initialized');
                
                // Initialize the UI if the container is found
                const characterList = document.getElementById('characterList');
                const characterDetails = document.getElementById('characterDetails');
                const characterSearch = document.getElementById('characterSearch');
                const addCharacterBtn = document.getElementById('addCharacterBtn');
                
                if (characterList && characterDetails) {
                    // Initialize the UI
                    window.app.characterUI = new CharacterUI(
                        window.app.charactersManager.characterService,
                        dataManager
                    );
                    
                    // Initialize event listeners
                    if (addCharacterBtn) {
                        addCharacterBtn.addEventListener('click', () => {
                            // CharacterUI exposes handleAddCharacter to display
                            // the inline creation form. The previous call
                            // referenced a non-existent method which caused the
                            // button to fail silently.
                            window.app.characterUI.handleAddCharacter();
                        });
                    }
                    
                    if (characterSearch) {
                        characterSearch.addEventListener('input', (e) => {
                            window.app.characterUI.handleSearch(e.target.value);
                        });
                    }
                    
                    // Load initial data
                    window.app.characterUI.renderCharacterList();
                    
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
                window.app.characterUI.renderCharacterList();
            }
        }
        
        console.log('Characters section initialized');
    } catch (error) {
        console.error('Error initializing characters section:', error);
    }
}

// Export the initialization function
export default initializeCharactersSection;
