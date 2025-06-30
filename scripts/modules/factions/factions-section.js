import { FactionUI } from './ui/faction-ui.js';
import { DataServiceInitializer } from '../../core/initialization/data-service-initializer.js';

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
            const dataService = DataServiceInitializer.getDataService();
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
