export class Entity {
    constructor(id = null, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id || `entity-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.createdAt = new Date(createdAt);
        this.updatedAt = new Date(updatedAt);
    }

    updateTimestamp() {
        this.updatedAt = new Date();
    }
}
