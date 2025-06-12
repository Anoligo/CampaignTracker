export class Condition {
    constructor(data = {}) {
        this.id = data.id || `cond-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        this.name = data.name || 'Unnamed Condition';
        this.effect = data.effect || '';
        this.type = data.type || 'condition';
        this.duration = data.duration || '';
        this.isMagical = data.isMagical || false;
        this.canStack = data.canStack || false;
        this.notes = data.notes || '';
        this.affectedCharacterIds = Array.isArray(data.affectedCharacterIds) ? [...data.affectedCharacterIds] : [];
        this.relatedItemIds = Array.isArray(data.relatedItemIds) ? [...data.relatedItemIds] : [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }
}
