import { Location } from '../models/location-model.js';
import { LocationType } from '../constants/location-constants.js';

/**
 * Service for handling location-related business logic
 */
export class LocationService {
    /**
     * Create a new location service instance
     * @param {Object} dataManager - The application's data manager
     */
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.ensureLocationsExist();
    }

    /**
     * Ensure the locations array exists in the state
     */
    ensureLocationsExist() {
        if (!Array.isArray(this.dataManager.appState.locations)) {
            this.dataManager.appState.locations = [];
        }
    }

    /**
     * Get all locations
     * @returns {Array<Location>} Array of locations
     */
    getAllLocations() {
        return [...this.dataManager.appState.locations];
    }

    /**
     * Get a location by ID
     * @param {string} id - The ID of the location to find
     * @returns {Location|undefined} The found location or undefined
     */
    getLocationById(id) {
        return this.dataManager.appState.locations.find(loc => loc.id === id);
    }

    /**
     * Create a new location
     * @param {Object} data - The location data
     * @returns {Location} The created location
     */
    createLocation(data) {
        const location = new Location(
            data.name,
            data.description || '',
            data.type || LocationType.OTHER,
            data.x || 0,
            data.y || 0,
            data.discovered || false,
            data.relatedQuests || [],
            data.relatedItems || [],
            data.npcs || [],
            data.connections || []
        );

        this.dataManager.appState.locations.push(location);
        this.dataManager.saveData();
        return location;
    }

    /**
     * Update an existing location
     * @param {string} id - The ID of the location to update
     * @param {Object} updates - The updates to apply
     * @returns {Location|undefined} The updated location or undefined if not found
     */
    updateLocation(id, updates) {
        console.log('Updating location with ID:', id, 'Updates:', updates);
        const location = this.getLocationById(id);
        if (!location) {
            console.error('Location not found with ID:', id);
            return undefined;
        }

        // Apply updates directly to the location object
        try {
            // Update basic properties directly
            if (updates.name !== undefined) {
                location.name = updates.name;
            }
            if (updates.description !== undefined) {
                location.description = updates.description;
            }
            if (updates.type !== undefined) {
                location.type = updates.type;
            }
            if (updates.x !== undefined || updates.y !== undefined) {
                location.x = updates.x !== undefined ? updates.x : location.x;
                location.y = updates.y !== undefined ? updates.y : location.y;
            }
            if (updates.discovered !== undefined) {
                location.discovered = Boolean(updates.discovered);
            }
            
            // Update timestamp
            location.updatedAt = new Date();
            
            // Save changes
            this.dataManager.saveData();
            console.log('Location updated successfully:', location);
            return location;
        } catch (error) {
            console.error('Error updating location:', error);
            return undefined;
        }
    }

    /**
     * Delete a location
     * @param {string} id - The ID of the location to delete
     * @returns {boolean} True if the location was deleted, false otherwise
     */
    deleteLocation(id) {
        const index = this.dataManager.appState.locations.findIndex(loc => loc.id === id);
        if (index === -1) return false;

        this.dataManager.appState.locations.splice(index, 1);
        this.dataManager.saveData();
        return true;
    }

    /**
     * Add a quest to a location
     * @param {string} locationId - The ID of the location
     * @param {string} questId - The ID of the quest to add
     * @returns {boolean} True if the quest was added, false otherwise
     */
    addQuestToLocation(locationId, questId) {
        const location = this.getLocationById(locationId);
        if (!location) return false;

        location.addRelatedQuest(questId);
        this.dataManager.saveData();
        return true;
    }

    /**
     * Remove a quest from a location
     * @param {string} locationId - The ID of the location
     * @param {string} questId - The ID of the quest to remove
     * @returns {boolean} True if the quest was removed, false otherwise
     */
    removeQuestFromLocation(locationId, questId) {
        const location = this.getLocationById(locationId);
        if (!location) return false;

        location.removeRelatedQuest(questId);
        this.dataManager.saveData();
        return true;
    }

    /**
     * Add an item to a location
     * @param {string} locationId - The ID of the location
     * @param {string} itemId - The ID of the item to add
     * @returns {boolean} True if the item was added, false otherwise
     */
    addItemToLocation(locationId, itemId) {
        const location = this.getLocationById(locationId);
        if (!location) return false;

        location.addRelatedItem(itemId);
        this.dataManager.saveData();
        return true;
    }

    /**
     * Remove an item from a location
     * @param {string} locationId - The ID of the location
     * @param {string} itemId - The ID of the item to remove
     * @returns {boolean} True if the item was removed, false otherwise
     */
    removeItemFromLocation(locationId, itemId) {
        const location = this.getLocationById(locationId);
        if (!location) return false;

        location.removeRelatedItem(itemId);
        this.dataManager.saveData();
        return true;
    }

    /**
     * Add an NPC to a location
     * @param {string} locationId - The ID of the location
     * @param {string} npcId - The ID of the NPC to add
     * @returns {boolean} True if the NPC was added, false otherwise
     */
    addNPCToLocation(locationId, npcId) {
        const location = this.getLocationById(locationId);
        if (!location) return false;

        location.addNPC(npcId);
        this.dataManager.saveData();
        return true;
    }

    /**
     * Remove an NPC from a location
     * @param {string} locationId - The ID of the location
     * @param {string} npcId - The ID of the NPC to remove
     * @returns {boolean} True if the NPC was removed, false otherwise
     */
    removeNPCFromLocation(locationId, npcId) {
        const location = this.getLocationById(locationId);
        if (!location) return false;

        location.removeNPC(npcId);
        this.dataManager.saveData();
        return true;
    }

    /**
     * Add a connection between two locations
     * @param {string} fromLocationId - The ID of the source location
     * @param {string} toLocationId - The ID of the target location
     * @param {string} connectionType - The type of connection
     * @returns {boolean} True if the connection was added, false otherwise
     */
    addLocationConnection(fromLocationId, toLocationId, connectionType) {
        const fromLocation = this.getLocationById(fromLocationId);
        const toLocation = this.getLocationById(toLocationId);

        if (!fromLocation || !toLocation) return false;

        fromLocation.addConnection(toLocationId, connectionType);
        // Optionally add a reverse connection
        // toLocation.addConnection(fromLocationId, connectionType);

        this.dataManager.saveData();
        return true;
    }

    /**
     * Remove a connection between two locations
     * @param {string} fromLocationId - The ID of the source location
     * @param {string} toLocationId - The ID of the target location
     * @param {string} connectionType - The type of connection to remove
     * @returns {boolean} True if the connection was removed, false otherwise
     */
    removeLocationConnection(fromLocationId, toLocationId, connectionType) {
        const fromLocation = this.getLocationById(fromLocationId);
        if (!fromLocation) return false;

        fromLocation.removeConnection(toLocationId, connectionType);
        this.dataManager.saveData();
        return true;
    }

    /**
     * Filter locations by type
     * @param {string} type - The type to filter by
     * @returns {Array<Location>} Filtered array of locations
     */
    filterLocationsByType(type) {
        if (!type) return this.getAllLocations();
        return this.getAllLocations().filter(loc => loc.type === type);
    }

    /**
     * Search locations by name or description
     * @param {string} query - The search query
     * @returns {Array<Location>} Filtered array of locations
     */
    searchLocations(query) {
        if (!query) return this.getAllLocations();
        
        const lowerQuery = query.toLowerCase();
        return this.getAllLocations().filter(loc => 
            loc.name.toLowerCase().includes(lowerQuery) || 
            (loc.description && loc.description.toLowerCase().includes(lowerQuery))
        );
    }
}
