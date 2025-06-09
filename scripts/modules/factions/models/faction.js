/**
 * Faction Model
 * Represents a faction in the game world with relationships, influence, and goals
 */

export class Faction {
    constructor(data = {}) {
        console.log('Creating new Faction with data:', data);
        this.id = data.id || `faction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.name = data.name || 'New Faction';
        this.description = data.description || '';
        this.type = data.type || ''; // Political, Criminal, Merchant, etc.
        this.attitude = data.attitude || 'Neutral'; // Attitude towards Iron Meridian
        this.influence = typeof data.influence === 'number' ? data.influence : 50; // 0-100 scale
        this.goals = data.goals || [];
        this.leaders = data.leaders || [];
        this.headquarters = data.headquarters || '';
        this.relationships = data.relationships || {}; // Map of factionId -> relationship level (-100 to 100)
        this.assets = data.assets || [];
        this.notes = data.notes || '';
        this.tags = data.tags || [];
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        console.log('Faction created with ID:', this.id);
        console.log('Faction attitude set to:', this.attitude);
    }

    // Update influence level (clamped between 0-100)
    updateInfluence(change) {
        this.influence = Math.max(0, Math.min(100, this.influence + change));
        this.updatedAt = new Date().toISOString();
        return this.influence;
    }

    // Set relationship with another faction
    setRelationship(factionId, value) {
        this.relationships[factionId] = Math.max(-100, Math.min(100, value));
        this.updatedAt = new Date().toISOString();
        return this.relationships[factionId];
    }

    // Get relationship level with another faction
    getRelationship(factionId) {
        return this.relationships[factionId] || 0;
    }


    // Toggle active status
    toggleActive() {
        this.isActive = !this.isActive;
        this.updatedAt = new Date().toISOString();
        return this.isActive;
    }
    
    // Convert faction to plain object for serialization
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            attitude: this.attitude,
            influence: this.influence,
            goals: [...this.goals],
            leaders: [...this.leaders],
            headquarters: this.headquarters,
            relationships: {...this.relationships},
            assets: [...this.assets],
            notes: this.notes,
            tags: [...this.tags],
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }


    // Export to plain object for serialization
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            alignment: this.alignment,
            influence: this.influence,
            goals: [...this.goals],
            leaders: [...this.leaders],
            headquarters: this.headquarters,
            relationships: { ...this.relationships },
            assets: [...this.assets],
            notes: this.notes,
            tags: [...this.tags],
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
