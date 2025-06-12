/**
 * Service for handling condition data operations
 */
export class ConditionService {
    constructor(dataManager) {
        this.dataManager = dataManager;
        if (!this.dataManager.appState.conditions) {
            this.dataManager.appState.conditions = [];
        }
    }

    getAllConditions() {
        return this.dataManager.appState.conditions || [];
    }

    getConditionById(id) {
        return this.getAllConditions().find(c => c.id === id) || null;
    }

    createCondition(data) {
        return this.dataManager.add('conditions', data);
    }

    updateCondition(id, updates) {
        return this.dataManager.update('conditions', id, updates);
    }

    deleteCondition(id) {
        return this.dataManager.remove('conditions', id);
    }

    searchConditions(term) {
        const t = term.toLowerCase();
        return this.getAllConditions().filter(c =>
            c.name.toLowerCase().includes(t) ||
            (c.effect && c.effect.toLowerCase().includes(t))
        );
    }
}
