import { ConditionsManager } from './conditions-manager.js';

export async function initializeConditionsSection() {
    const container = document.getElementById('conditions');
    if (!container) return;
    if (!window.app) window.app = {};

    if (!window.app.conditionsManager) {
        const { appState } = await import('../../core/state/app-state.js');
        const dataManager = { appState, saveData: () => appState._saveState?.() };
        window.app.conditionsManager = new ConditionsManager(dataManager);
    } else {
        window.app.conditionsManager.ui.refresh();
    }
}
export default initializeConditionsSection;
