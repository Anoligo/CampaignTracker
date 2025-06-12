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
        const conditions = this.getAllConditions();
        const condition = { ...data, id: `cond-${Date.now()}-${Math.floor(Math.random()*1000)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        conditions.push(condition);
        this.dataManager.appState.conditions = conditions;
        this.dataManager.saveData?.();
        return condition;
    }

    updateCondition(id, updates) {
        const conditions = this.getAllConditions();
        const index = conditions.findIndex(c => c.id === id);
        if (index === -1) return null;
        const updated = { ...conditions[index], ...updates, updatedAt: new Date().toISOString() };
        conditions[index] = updated;
        this.dataManager.appState.conditions = conditions;
        this.dataManager.saveData?.();
        return updated;
    }

    deleteCondition(id) {
        const conditions = this.getAllConditions();
        const newList = conditions.filter(c => c.id !== id);
        if (newList.length === conditions.length) return false;
        this.dataManager.appState.conditions = newList;
        this.dataManager.saveData?.();
        return true;
    }

    searchConditions(term) {
        const t = term.toLowerCase();
        return this.getAllConditions().filter(c =>
            c.name.toLowerCase().includes(t) ||
            (c.effect && c.effect.toLowerCase().includes(t))
        );
    }
}
