import { Entity } from '../../entity.js';
import { GuildActivityType } from '../enums/guild-enums.js';

export class GuildActivity extends Entity {
    constructor(name, description, type = GuildActivityType.QUEST, createdAt = new Date(), updatedAt = new Date()) {
        super(null, new Date(createdAt), new Date(updatedAt));
        this.name = name;
        this.description = description;
        this.type = type;
        this.status = 'pending';
        this.rewards = [];
        this.participants = [];
    }

    addReward(reward) {
        if (!this.rewards.includes(reward)) {
            this.rewards.push(reward);
            this.updatedAt = new Date();
        }
    }

    removeReward(reward) {
        this.rewards = this.rewards.filter(r => r !== reward);
        this.updatedAt = new Date();
    }

    addParticipant(participant) {
        if (!this.participants.includes(participant)) {
            this.participants.push(participant);
            this.updatedAt = new Date();
        }
    }

    removeParticipant(participant) {
        this.participants = this.participants.filter(p => p !== participant);
        this.updatedAt = new Date();
    }

    updateStatus(newStatus) {
        this.status = newStatus;
        this.updatedAt = new Date();
    }
}
