import { ConditionsManager } from './conditions-manager.js';
import { appState } from '../../core/state/app-state.js';

export async function initializeConditionsSection() {
    const container = document.getElementById('conditions');
    if (!container) return;
    if (!window.app) window.app = {};

    if (!window.app.conditionsManager) {
        const dataManager = { appState };
        window.app.conditionsManager = new ConditionsManager(dataManager);
    } else {
        window.app.conditionsManager.ui.refresh();
    }
}
export default initializeConditionsSection;
