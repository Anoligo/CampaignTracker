import { PlayersManager } from './players-manager.js';

/**
 * Initialize the players section when navigated to.
 */
export async function initializePlayersSection() {
    try {
        console.log('Initializing players section...');
        const container = document.getElementById('players');
        if (!container) {
            console.error('Players container not found');
            return;
        }

        if (!window.app?.playersManager) {
            const { appState } = await import('../../core/state/app-state.js');
            const dataManager = {
                appState,
                // Ensure state is persisted even if no updates are provided
                saveData: () => {
                    if (typeof appState._saveState === 'function') {
                        appState._saveState();
                    } else {
                        appState.update({}, true);
                    }
                }
            };
            window.app = window.app || {};
            window.app.playersManager = new PlayersManager(dataManager);
        } else {
            console.log('Players manager already initialized');
        }

        // Refresh the list on each initialization
        window.app.playersManager?.ui?.renderList();
        console.log('Players section initialized');
    } catch (error) {
        console.error('Failed to initialize players section:', error);
    }
}

export default initializePlayersSection;
