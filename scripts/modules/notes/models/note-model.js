import { Entity } from '../../entity.js';
import { NoteCategory } from '../enums/note-enums.js';

export class Note extends Entity {
    constructor(title, content, category = 'lore', createdAt = new Date(), updatedAt = new Date()) {
        // First call the parent constructor with the ID and timestamps
        super(null, createdAt, updatedAt);
        
        // Initialize properties
        this.title = title;
        this.content = content;
        this.category = category;
        this.tags = [];
        
        // Initialize relatedEntities with default values
        this.initializeRelatedEntities();
        
        // Ensure timestamps are Date objects
        this.createdAt = new Date(this.createdAt);
        this.updatedAt = new Date(this.updatedAt);
        
        // Ensure ID is set
        if (!this.id) {
            this.id = `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
    }
    
    // Initialize related entities (kept for backward compatibility)
    initializeRelatedEntities() {
        // If relatedEntities doesn't exist or is not an object, initialize it
        if (!this.relatedEntities || typeof this.relatedEntities !== 'object') {
            this.relatedEntities = {
                quests: [],
                locations: [],
                characters: [],
                items: []
            };
        }
        
        // Ensure all required arrays exist and are arrays
        this.relatedEntities = {
            quests: Array.isArray(this.relatedEntities.quests) ? this.relatedEntities.quests : [],
            locations: Array.isArray(this.relatedEntities.locations) ? this.relatedEntities.locations : [],
            characters: Array.isArray(this.relatedEntities.characters) ? this.relatedEntities.characters : [],
            items: Array.isArray(this.relatedEntities.items) ? this.relatedEntities.items : []
        };
        
        return this.relatedEntities;
    }

    updateTitle(title) {
        this.title = title;
        this.updatedAt = new Date();
    }

    updateContent(content) {
        this.content = content;
        this.updatedAt = new Date();
    }

    updateCategory(category) {
        if (!Object.values(NoteCategory).includes(category)) {
            return false;
        }
        this.category = category;
        this.updatedAt = new Date();
        return true;
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date();
        }
    }

    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.updatedAt = new Date();
    }

    addRelatedQuest(questId) {
        if (!questId) return false;
        
        try {
            // Ensure relatedEntities is properly initialized
            const relatedEntities = this.initializeRelatedEntities();
            
            // Add the quest if it doesn't already exist
            if (!relatedEntities.quests.includes(questId)) {
                relatedEntities.quests.push(questId);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding related quest:', error);
            return false;
        }
    }

    removeRelatedQuest(questId) {
        if (!questId) return false;
        
        try {
            let changed = false;
            
            // Handle removal from the new format (relatedEntities.quests)
            // Ensure relatedEntities is properly initialized
            const relatedEntities = this.initializeRelatedEntities();
            
            // Remove the quest if it exists
            const initialLength = relatedEntities.quests.length;
            relatedEntities.quests = relatedEntities.quests.filter(id => id !== questId);
            
            // Check if the length changed
            if (relatedEntities.quests.length !== initialLength) {
                changed = true;
            }
            
            // Handle removal from the legacy format (relatedQuests array)
            if (this.relatedQuests && Array.isArray(this.relatedQuests)) {
                const initialLegacyLength = this.relatedQuests.length;
                this.relatedQuests = this.relatedQuests.filter(quest => quest.id !== questId);
                
                // Check if the length changed
                if (this.relatedQuests.length !== initialLegacyLength) {
                    changed = true;
                }
            }
            
            // If anything changed, update the timestamp
            if (changed) {
                this.updatedAt = new Date();
                console.log('Quest removed successfully:', questId);
                console.log('Updated relatedEntities.quests:', relatedEntities.quests);
                if (this.relatedQuests) {
                    console.log('Updated relatedQuests:', this.relatedQuests);
                }
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error removing related quest:', error);
            return false;
        }
    }

    addRelatedLocation(locationId) {
        if (!locationId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            
            if (!relatedEntities.locations.includes(locationId)) {
                relatedEntities.locations.push(locationId);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding related location:', error);
            return false;
        }
    }

    removeRelatedLocation(locationId) {
        if (!locationId) return false;
        
        try {
            let changed = false;
            
            // Handle removal from the new format (relatedEntities.locations)
            const relatedEntities = this.initializeRelatedEntities();
            const initialLength = relatedEntities.locations.length;
            relatedEntities.locations = relatedEntities.locations.filter(id => id !== locationId);
            
            // Check if the length changed
            if (relatedEntities.locations.length !== initialLength) {
                changed = true;
            }
            
            // Handle removal from the legacy format (relatedLocations array)
            if (this.relatedLocations && Array.isArray(this.relatedLocations)) {
                const initialLegacyLength = this.relatedLocations.length;
                this.relatedLocations = this.relatedLocations.filter(location => location.id !== locationId);
                
                // Check if the length changed
                if (this.relatedLocations.length !== initialLegacyLength) {
                    changed = true;
                }
            }
            
            // If anything changed, update the timestamp
            if (changed) {
                this.updatedAt = new Date();
                console.log('Location removed successfully:', locationId);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error removing related location:', error);
            return false;
        }
    }

    addRelatedCharacter(characterId) {
        if (!characterId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            
            if (!relatedEntities.characters.includes(characterId)) {
                relatedEntities.characters.push(characterId);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding related character:', error);
            return false;
        }
    }

    removeRelatedCharacter(characterId) {
        if (!characterId) return false;
        
        try {
            let changed = false;
            
            // Handle removal from the new format (relatedEntities.characters)
            const relatedEntities = this.initializeRelatedEntities();
            const initialLength = relatedEntities.characters.length;
            relatedEntities.characters = relatedEntities.characters.filter(id => id !== characterId);
            
            // Check if the length changed
            if (relatedEntities.characters.length !== initialLength) {
                changed = true;
            }
            
            // Handle removal from the legacy format (relatedCharacters array)
            if (this.relatedCharacters && Array.isArray(this.relatedCharacters)) {
                const initialLegacyLength = this.relatedCharacters.length;
                this.relatedCharacters = this.relatedCharacters.filter(character => character.id !== characterId);
                
                // Check if the length changed
                if (this.relatedCharacters.length !== initialLegacyLength) {
                    changed = true;
                }
            }
            
            // If anything changed, update the timestamp
            if (changed) {
                this.updatedAt = new Date();
                console.log('Character removed successfully:', characterId);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error removing related character:', error);
            return false;
        }
    }

    addRelatedItem(itemId) {
        if (!itemId) return false;
        
        try {
            const relatedEntities = this.initializeRelatedEntities();
            
            if (!relatedEntities.items.includes(itemId)) {
                relatedEntities.items.push(itemId);
                this.updatedAt = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding related item:', error);
            return false;
        }
    }

    removeRelatedItem(itemId) {
        if (!itemId) return false;
        
        try {
            let changed = false;
            
            // Handle removal from the new format (relatedEntities.items)
            const relatedEntities = this.initializeRelatedEntities();
            const initialLength = relatedEntities.items.length;
            relatedEntities.items = relatedEntities.items.filter(id => id !== itemId);
            
            // Check if the length changed
            if (relatedEntities.items.length !== initialLength) {
                changed = true;
            }
            
            // Handle removal from the legacy format (relatedItems array)
            if (this.relatedItems && Array.isArray(this.relatedItems)) {
                const initialLegacyLength = this.relatedItems.length;
                this.relatedItems = this.relatedItems.filter(item => item.id !== itemId);
                
                // Check if the length changed
                if (this.relatedItems.length !== initialLegacyLength) {
                    changed = true;
                }
            }
            
            // If anything changed, update the timestamp
            if (changed) {
                this.updatedAt = new Date();
                console.log('Item removed successfully:', itemId);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error removing related item:', error);
            return false;
        }
    }

    get name() { return this.title; }
    set name(val) { this.title = val; }
}
