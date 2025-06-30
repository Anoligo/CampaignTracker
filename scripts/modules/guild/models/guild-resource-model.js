import { Entity } from '../../entity.js';
import { GuildResourceType } from '../enums/guild-resource-type.js';

export class GuildResource extends Entity {
    constructor(name, description, type = GuildResourceType.GOLD, quantity = 0, createdAt = new Date(), updatedAt = new Date()) {
        super(null, new Date(createdAt), new Date(updatedAt));
        this.name = name;
        this.description = description;
        this.type = type;
        this.quantity = quantity;
    }

    addQuantity(amount) {
        this.quantity += amount;
        this.updatedAt = new Date();
    }

    removeQuantity(amount) {
        if (this.quantity >= amount) {
            this.quantity -= amount;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    updateName(newName) {
        this.name = newName;
        this.updatedAt = new Date();
    }

    updateType(newType) {
        this.type = newType;
        this.updatedAt = new Date();
    }
}
