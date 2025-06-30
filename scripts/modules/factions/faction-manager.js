import { Faction } from './models/faction.js';
// Relative import to support GitHub Pages where the site may be served from a
// subdirectory.
import { DataServiceInitializer } from '../../core/initialization/data-service-initializer.js';

/**
 * Manages all faction-related operations and data
 */
export class FactionManager {
    /**
     * Create a new FactionManager
     * @param {DataService} dataService - The application's data service
     */
    constructor(dataService = null) {
        this.dataService = dataService || DataServiceInitializer.getDataService();
        this.initialized = true;
    }

    /**
     * Convenience getter for the current list of factions
     * @returns {Array<Object>} Array of faction objects
     */
    _getFactions() {
        return this.dataService.getAll('factions');
    }

    // Create a new faction (alias for createFaction for backward compatibility)
    addFaction(data = {}) {
        console.log('addFaction called with data:', data);
        const { id, ...factionData } = data;
        return this.createFaction(factionData);
    }

    // Create a new faction
    createFaction(data = {}) {
        console.log('createFaction called with data:', data);
        const faction = new Faction(data);
        this.dataService.add('factions', faction.toJSON());
        return faction;
    }

    // Get a faction by ID
    getFaction(id) {
        const data = this.dataService.get('factions', id);
        return data ? new Faction(data) : null;
    }

    // Get all factions
    getAllFactions() {
        return this._getFactions().map(f => new Faction(f));
    }

    // Get active factions
    getActiveFactions() {
        return this.getAllFactions().filter(f => f.isActive);
    }

    // Update a faction
    updateFaction(id, data) {
        console.log('Updating faction:', id, 'with data:', data);
        const existing = this.dataService.get('factions', id);
        if (!existing) {
            console.error('Faction not found:', id);
            return null;
        }

        const updated = { ...existing, ...data, id };
        this.dataService.update('factions', id, updated);
        return new Faction(updated);
    }

    // Delete a faction
    deleteFaction(id) {
        const removed = this.dataService.remove('factions', id);
        if (removed) {
            const factions = this._getFactions();
            factions.forEach(f => {
                if (f.relationships && f.relationships[id] !== undefined) {
                    const { [id]: _, ...relationships } = f.relationships;
                    this.dataService.update('factions', f.id, { relationships });
                }
            });
        }
        return removed;
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
        
        const current = faction1.relationships || {};
        const clamped = Math.max(-100, Math.min(100, value));
        const relationships = { ...current, [factionId2]: clamped };
        this.dataService.update('factions', factionId1, { relationships });
        return clamped;
    }

    // Toggle active status of a faction
    toggleFactionActive(id) {
        const faction = this.dataService.get('factions', id);
        if (!faction) return null;

        const isActive = !faction.isActive;
        this.dataService.update('factions', id, { isActive });
        return isActive;
    }

    // Import factions from JSON
    importFactions(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (!Array.isArray(data)) throw new Error('Invalid import data format');
            
            data.forEach(factionData => {
                const faction = new Faction(factionData);
                this.dataService.add('factions', faction.toJSON());
            });

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
