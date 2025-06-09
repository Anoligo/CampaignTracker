import { Faction } from './models/faction.js';

/**
 * Manages all faction-related operations and data
 */
export class FactionManager {
    /**
     * Create a new FactionManager
     * @param {Object} dataManager - The application's data manager
     */
    constructor(dataManager = null) {
        this.dataManager = dataManager;
        this.factions = new Map();
        this.initialized = false;
        this.loadFactions();
    }

    /**
     * Load factions from the data manager or localStorage
     */
    loadFactions() {
        try {
            if (this.dataManager && this.dataManager.appState) {
                // Use the data manager if available
                const appState = this.dataManager.appState;
                if (appState.factions && Array.isArray(appState.factions)) {
                    this.factions = new Map(appState.factions.map(f => [f.id, new Faction(f)]));
                    this.initialized = true;
                    return;
                }
            }
            
            // Fall back to localStorage
            const savedFactions = JSON.parse(localStorage.getItem('factions') || '[]');
            this.factions = new Map(savedFactions.map(f => [f.id, new Faction(f)]));
            
            // If we have a data manager but no factions in it, sync the loaded factions
            if (this.dataManager && this.dataManager.appState) {
                this.syncWithDataManager();
            }
            
            this.initialized = true;
        } catch (error) {
            console.error('Error loading factions:', error);
            this.factions = new Map();
            this.initialized = true;
        }
    }
    
    /**
     * Sync factions with the data manager
     */
    syncWithDataManager() {
        if (!this.dataManager || !this.dataManager.appState) return;
        
        try {
            // Create a deep copy of the current state
            const currentState = { ...this.dataManager.appState };
            
            // Update the factions array
            currentState.factions = Array.from(this.factions.values()).map(f => f.toJSON());
            
            // Update the data manager's state
            this.dataManager.appState = currentState;
            this.dataManager.saveData();
        } catch (error) {
            console.error('Error syncing factions with data manager:', error);
        }
    }

    /**
     * Save factions to the data manager and localStorage
     */
    saveFactions() {
        try {
            const factionsArray = Array.from(this.factions.values()).map(f => f.toJSON());
            
            // Save to localStorage as a fallback
            localStorage.setItem('factions', JSON.stringify(factionsArray));
            
            // Sync with the data manager if available
            if (this.dataManager) {
                this.syncWithDataManager();
            }
        } catch (error) {
            console.error('Error saving factions:', error);
            throw error; // Re-throw to allow error handling in the UI
        }
    }

    // Create a new faction (alias for createFaction for backward compatibility)
    addFaction(data = {}) {
        console.log('addFaction called with data:', data);
        // Ensure we don't have an ID to force creation of a new one
        const { id, ...factionData } = data;
        const faction = this.createFaction(factionData);
        console.log('New faction created:', faction);
        
        // Save the updated factions list
        this.saveFactions();
        console.log('Factions saved after add');
        
        return faction;
    }
    
    // Create a new faction
    createFaction(data = {}) {
        console.log('createFaction called with data:', data);
        const faction = new Faction(data);
        console.log('New Faction instance created:', faction);
        
        // Add to the factions map
        this.factions.set(faction.id, faction);
        console.log('Faction added to factions map with ID:', faction.id);
        
        // Save the factions
        this.saveFactions();
        console.log('Factions saved');
        
        // Verify the faction was saved
        const savedFaction = this.getFaction(faction.id);
        console.log('Faction retrieved after save:', savedFaction);
        
        return faction;
    }

    // Get a faction by ID
    getFaction(id) {
        return this.factions.get(id);
    }

    // Get all factions
    getAllFactions() {
        return Array.from(this.factions.values());
    }

    // Get active factions
    getActiveFactions() {
        return this.getAllFactions().filter(f => f.isActive);
    }

    // Update a faction
    updateFaction(id, data) {
        console.log('Updating faction:', id, 'with data:', data);
        const faction = this.factions.get(id);
        if (!faction) {
            console.error('Faction not found:', id);
            return null;
        }

        console.log('Current faction data:', faction);
        const updatedFaction = new Faction({ ...faction.toJSON(), ...data, id });
        console.log('Updated faction data:', updatedFaction);
        
        this.factions.set(id, updatedFaction);
        this.saveFactions();
        console.log('Faction updated and saved');
        return updatedFaction;
    }

    // Delete a faction
    deleteFaction(id) {
        const success = this.factions.delete(id);
        if (success) {
            // Remove any relationships to this faction
            this.factions.forEach(faction => {
                if (faction.relationships[id]) {
                    delete faction.relationships[id];
                }
            });
            this.saveFactions();
        }
        return success;
    }

    // Search factions by name, description, or tags
    searchFactions(query) {
        const searchTerm = query.toLowerCase();
        return this.getAllFactions().filter(faction => 
            faction.name.toLowerCase().includes(searchTerm) ||
            faction.description.toLowerCase().includes(searchTerm) ||
            faction.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    // Get factions by type
    getFactionsByType(type) {
        return this.getAllFactions().filter(faction => faction.type === type);
    }

    // Get factions by alignment
    getFactionsByAlignment(alignment) {
        return this.getAllFactions().filter(faction => 
            faction.alignment.toLowerCase() === alignment.toLowerCase()
        );
    }

    // Get factions with influence above a certain threshold
    getInfluentialFactions(threshold = 50) {
        return this.getAllFactions().filter(faction => faction.influence >= threshold);
    }

    // Get factions with a specific tag
    getFactionsByTag(tag) {
        const searchTag = tag.toLowerCase();
        return this.getAllFactions().filter(faction => 
            faction.tags.some(t => t.toLowerCase() === searchTag)
        );
    }

    // Get relationships between two factions
    getRelationship(factionId1, factionId2) {
        const faction1 = this.getFaction(factionId1);
        return faction1 ? faction1.getRelationship(factionId2) : 0;
    }

    // Set relationship between two factions
    setRelationship(factionId1, factionId2, value) {
        const faction1 = this.getFaction(factionId1);
        if (!faction1) return null;
        
        const result = faction1.setRelationship(factionId2, value);
        this.saveFactions();
        return result;
    }

    // Toggle active status of a faction
    toggleFactionActive(id) {
        const faction = this.getFaction(id);
        if (!faction) return null;
        
        const isActive = faction.toggleActive();
        this.saveFactions();
        return isActive;
    }

    // Import factions from JSON
    importFactions(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (!Array.isArray(data)) throw new Error('Invalid import data format');
            
            data.forEach(factionData => {
                const faction = new Faction(factionData);
                this.factions.set(faction.id, faction);
            });
            
            this.saveFactions();
            return true;
        } catch (error) {
            console.error('Failed to import factions:', error);
            return false;
        }
    }

    // Export factions to JSON
    exportFactions() {
        return JSON.stringify(this.getAllFactions(), null, 2);
    }
}
