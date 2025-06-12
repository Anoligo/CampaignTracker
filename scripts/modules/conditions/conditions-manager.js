import { ConditionService } from './services/condition-service.js';
import { ConditionUI } from './ui/condition-ui.js';

export class ConditionsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.service = new ConditionService(dataManager);
        this.ui = new ConditionUI(this.service, dataManager);
        this.ui.init();
    }

    createCondition(data) { return this.service.createCondition(data); }
    updateCondition(id, updates) { return this.service.updateCondition(id, updates); }
    deleteCondition(id) { return this.service.deleteCondition(id); }
}
