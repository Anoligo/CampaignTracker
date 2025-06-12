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
        return this.dataManager.appState.locations.map(loc => ({
            ...loc,
            coordinates: { x: loc.x, y: loc.y }
        }));
    }

    /**
     * Get a location by ID
     * @param {string} id - The ID of the location to find
     * @returns {Location|undefined} The found location or undefined
     */
    getLocationById(id) {
        const loc = this.dataManager.appState.locations.find(l => l.id === id);
        return loc ? { ...loc, coordinates: { x: loc.x, y: loc.y } } : undefined;
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
            data.x || (data.coordinates?.x ?? 0),
            data.y || (data.coordinates?.y ?? 0),
            data.discovered || false,
            data.relatedQuests || [],
            data.relatedItems || [],
            data.npcs || [],
            data.connections || []
        );

        return this.dataManager.add('locations', location);
    }

    /**
     * Update an existing location
     * @param {string} id - The ID of the location to update
     * @param {Object} updates - The updates to apply
     * @returns {Location|undefined} The updated location or undefined if not found
     */
    updateLocation(id, updates) {
        if (updates.coordinates) {
            updates = {
                ...updates,
                x: updates.coordinates.x ?? updates.x,
                y: updates.coordinates.y ?? updates.y
            };
            delete updates.coordinates;
        }

        return this.dataManager.update('locations', id, updates);
    }

    /**
     * Delete a location
     * @param {string} id - The ID of the location to delete
     * @returns {boolean} True if the location was deleted, false otherwise
     */
    deleteLocation(id) {
        return this.dataManager.remove('locations', id);
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
        this.dataManager.update('locations', locationId, location);
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
        this.dataManager.update('locations', locationId, location);
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
        this.dataManager.update('locations', locationId, location);
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
        this.dataManager.update('locations', locationId, location);
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
        this.dataManager.update('locations', locationId, location);
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
        this.dataManager.update('locations', locationId, location);
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

        this.dataManager.update('locations', fromLocationId, fromLocation);
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
        this.dataManager.update('locations', fromLocationId, fromLocation);
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
