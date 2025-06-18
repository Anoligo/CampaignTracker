import { appState } from '../../core/state/app-state.js';
import { PlayersManager } from './players-manager-new.js';

/**
 * Initialize the players section when navigated to.
 * This is now a thin wrapper around the PlayersManager which handles its own initialization.
 */
export async function initializePlayersSection() {
    try {
        console.log('[PlayersSection] Initializing players section...');
        
        // Check if the players container exists
        const container = document.getElementById('players');
        if (!container) {
            console.error('[PlayersSection] Players container not found');
            return;
        }

        // Initialize the players manager if it doesn't exist
        if (!window.app?.playersManager) {
            console.log('[PlayersSection] Creating new PlayersManager');
            
            // Use the data service from appState
            const dataManager = appState.dataService || { appState };
            
            // Create and store the manager
            window.app = window.app || {};
            window.app.playersManager = new PlayersManager(dataManager);
            
            // The manager will handle its own initialization when the section becomes visible
            console.log('[PlayersSection] PlayersManager created');
        } else {
            console.log('[PlayersSection] Players manager already initialized');
            
            // If the manager exists but the section is visible, trigger a render
            if (container.classList.contains('active')) {
                window.app.playersManager.render();
            }
        }
        
        console.log('[PlayersSection] Players section initialization complete');
    } catch (error) {
        console.error('[PlayersSection] Failed to initialize players section:', error);
    }
}

export default initializePlayersSection;
