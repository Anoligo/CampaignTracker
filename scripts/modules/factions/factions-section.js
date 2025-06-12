import { FactionUI } from './ui/faction-ui.js';
import { appState } from '../../core/state/app-state.js';

/**
 * Initialize the factions section when navigated to.
 */
export async function initializeFactionsSection() {
    try {
        const container = document.getElementById('factions-container');
        if (!container) {
            console.warn('Factions container not found');
            return;
        }

        if (!window.app) window.app = {};
        if (!window.app.factionUI) {
            const dataManager = { appState };
            window.app.factionUI = new FactionUI(container, dataManager);
        } else {
            window.app.factionUI.refresh?.();
        }

        console.log('Factions section initialized');
    } catch (error) {
        console.error('Failed to initialize Factions section:', error);
    }
}

export { FactionUI } from './ui/faction-ui.js';
