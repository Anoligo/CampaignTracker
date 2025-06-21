import { FactionUI } from './ui/faction-ui.js';
import { DataService } from '../data/services/data-service.js';

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
            // Create a new DataService instance for the FactionUI
            const dataService = new DataService();
            window.app.factionUI = new FactionUI(container, dataService);
        } else {
            window.app.factionUI.refresh?.();
        }

        console.log('Factions section initialized');
    } catch (error) {
        console.error('Failed to initialize Factions section:', error);
    }
}

export { FactionUI } from './ui/faction-ui.js';
