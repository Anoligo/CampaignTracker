import { Entity } from '../../entity.js';
import { QuestType, QuestStatus } from '../enums/quest-enums.js';

export class Quest extends Entity {
    constructor(name, description, type = QuestType.MAIN, createdAt = new Date(), updatedAt = new Date(), status = QuestStatus.ONGOING, id = null) {
        super(id, new Date(createdAt), new Date(updatedAt));
        this.name = name || 'Untitled Quest';
        this.description = description || '';
        this.type = type || QuestType.MAIN;
        this.status = status || QuestStatus.ONGOING;
        this.journalEntries = [];
        this.relatedItems = [];
        this.relatedLocations = [];
        this.relatedCharacters = [];
        this.relatedFactions = [];
        this.relatedQuests = [];
        this.notes = '';
        this.resolution = {
            session: '',
            date: null,
            xp: 0
        };
        
        // Ensure dates are Date objects
        if (this.createdAt && !(this.createdAt instanceof Date)) {
            this.createdAt = new Date(this.createdAt);
        }
        if (this.updatedAt && !(this.updatedAt instanceof Date)) {
            this.updatedAt = new Date(this.updatedAt);
        }
    }

    addJournalEntry(entry) {
        if (!entry || typeof entry !== 'object' || !entry.content) {
            throw new Error('Invalid journal entry');
        }
        // Check for duplicate entries
        if (this.journalEntries.some(e => e.content === entry.content && e.timestamp.getTime() === entry.timestamp.getTime())) {
            return;
        }
        this.journalEntries.push(entry);
    }

    removeJournalEntry(entry) {
        this.journalEntries = this.journalEntries.filter(e => 
            e.content !== entry.content || e.timestamp.getTime() !== entry.timestamp.getTime()
        );
    }

    addRelatedLocation(locationId) {
        if (!this.relatedLocations.includes(locationId)) {
            this.relatedLocations.push(locationId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedLocation(locationId) {
        this.relatedLocations = this.relatedLocations.filter(id => id !== locationId);
        this.updatedAt = new Date();
    }

    addRelatedCharacter(characterId) {
        if (!this.relatedCharacters.includes(characterId)) {
            this.relatedCharacters.push(characterId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedCharacter(characterId) {
        this.relatedCharacters = this.relatedCharacters.filter(id => id !== characterId);
        this.updatedAt = new Date();
    }

    addRelatedItem(itemId) {
        if (!this.relatedItems.includes(itemId)) {
            this.relatedItems.push(itemId);
            this.updatedAt = new Date();
        }
    }

    removeRelatedItem(itemId) {
        this.relatedItems = this.relatedItems.filter(id => id !== itemId);
        this.updatedAt = new Date();
    }

    updateTitle(title) {
        if (!title || title.trim() === '') {
            throw new Error('Quest title cannot be empty');
        }
        this.name = title;
    }

    updateDescription(newDescription) {
        this.description = newDescription;
        this.updatedAt = new Date();
    }

    updateType(type) {
        if (!Object.values(QuestType).includes(type)) {
            throw new Error(`Invalid quest type: ${type}`);
        }
        this.type = type;
        this.updatedAt = new Date();
    }

    updateStatus(status) {
        if (!Object.values(QuestStatus).includes(status)) {
            throw new Error(`Invalid quest status: ${status}`);
        }
        this.status = status;
        this.updatedAt = new Date();
    }

    get title() {
        return this.name;
    }

    set title(val) {
        this.updateTitle(val);
    }
}
