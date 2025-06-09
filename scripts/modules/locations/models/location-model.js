import { Entity } from '../../entity.js';
import { LocationType, DiscoveryStatus } from '../constants/location-constants.js';

/**
 * Represents a location in the game world
 */
export class Location extends Entity {
    constructor(name, description, type = LocationType.CITY, x = 0, y = 0, discoveryStatus = DiscoveryStatus.UNDISCOVERED, relatedQuests = [], relatedItems = [], npcs = [], connections = [], tags = [], createdAt = new Date(), updatedAt = new Date()) {
        super(null, new Date(createdAt), new Date(updatedAt));
        this.name = name;
        this.description = description;
        this.type = type;
        this.x = x;
        this.y = y;
        this.discoveryStatus = discoveryStatus;
        this.relatedQuests = Array.isArray(relatedQuests) ? [...relatedQuests] : [];
        this.relatedItems = Array.isArray(relatedItems) ? [...relatedItems] : [];
        this.npcs = Array.isArray(npcs) ? [...npcs] : [];
        this.connections = Array.isArray(connections) ? [...connections] : [];
        this.tags = Array.isArray(tags) ? [...tags] : [];
    }

    get coordinates() {
        return { x: this.x, y: this.y };
    }

    /**
     * Update the coordinates of the location
     * @param {Object} coordinates - The new coordinates {x, y}
     */
    updateCoordinates(coordinates) {
        this.x = coordinates.x;
        this.y = coordinates.y;
        this.updatedAt = new Date();
    }

    /**
     * Add a related quest to this location
     * @param {string} questId - The ID of the quest to add
     */
    addRelatedQuest(questId) {
        if (!this.relatedQuests.includes(questId)) {
            this.relatedQuests.push(questId);
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove a related quest from this location
     * @param {string} questId - The ID of the quest to remove
     */
    removeRelatedQuest(questId) {
        const index = this.relatedQuests.indexOf(questId);
        if (index > -1) {
            this.relatedQuests.splice(index, 1);
            this.updatedAt = new Date();
        }
    }

    /**
     * Add a related item to this location
     * @param {string} itemId - The ID of the item to add
     */
    addRelatedItem(itemId) {
        if (!this.relatedItems.includes(itemId)) {
            this.relatedItems.push(itemId);
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove a related item from this location
     * @param {string} itemId - The ID of the item to remove
     */
    removeRelatedItem(itemId) {
        const index = this.relatedItems.indexOf(itemId);
        if (index > -1) {
            this.relatedItems.splice(index, 1);
            this.updatedAt = new Date();
        }
    }

    /**
     * Add an NPC to this location
     * @param {string} npcId - The ID of the NPC to add
     */
    addNPC(npcId) {
        if (!this.npcs.includes(npcId)) {
            this.npcs.push(npcId);
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove an NPC from this location
     * @param {string} npcId - The ID of the NPC to remove
     */
    removeNPC(npcId) {
        const index = this.npcs.indexOf(npcId);
        if (index > -1) {
            this.npcs.splice(index, 1);
            this.updatedAt = new Date();
        }
    }

    /**
     * Add a connection to another location
     * @param {string} locationId - The ID of the location to connect to
     * @param {string} connectionType - The type of connection
     */
    addConnection(locationId, connectionType) {
        const exists = this.connections.some(conn => 
            conn.locationId === locationId && conn.type === connectionType
        );
        
        if (!exists) {
            this.connections.push({
                locationId,
                type: connectionType,
                createdAt: new Date()
            });
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove a connection to another location
     * @param {string} locationId - The ID of the connected location
     * @param {string} connectionType - The type of connection to remove
     */
    removeConnection(locationId, connectionType) {
        const index = this.connections.findIndex(conn => 
            conn.locationId === locationId && conn.type === connectionType
        );
        
        if (index > -1) {
            this.connections.splice(index, 1);
            this.updatedAt = new Date();
        }
    }

    /**
     * Mark the location as discovered
     */
    markAsDiscovered() {
        if (!this.discovered) {
            this.discovered = true;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * Update the location's name
     * @param {string} name - The new name
     */
    updateName(name) {
        if (name && name !== this.name) {
            this.name = name;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * Update the location's description
     * @param {string} description - The new description
     */
    updateDescription(description) {
        if (description !== undefined && description !== this.description) {
            this.description = description;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * Update the location's type
     * @param {string} type - The new location type
     */
    updateType(type) {
        if (type && type !== this.type) {
            this.type = type;
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }
}
